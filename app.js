import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { supabaseConfig } from './supabase-config.js';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

const avatarBtn = document.getElementById('avatar-btn');
const dropdown = document.getElementById('dropdown');
const userAvatar = document.getElementById('user-avatar');
const logoutBtn = document.getElementById('logout-btn');

async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  // Сначала пытаемся получить данные из базы
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', user.id)
    .single();
  
  // Если записи нет — создаём её с данными из Discord
  if (!profile) {
    const defaultName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Пользователь';
    const defaultAvatar = user.user_metadata?.avatar_url || '';
    
    await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name: defaultName,
        avatar_url: defaultAvatar
      });
    
    userAvatar.src = defaultAvatar || 'https://via.placeholder.com/40';
  } else {
    // Берём аватарку из базы (даже если она пустая — значит пользователь её не менял)
    userAvatar.src = profile.avatar_url || 'https://via.placeholder.com/40';
  }
  
  avatarBtn.style.display = 'block';
}

avatarBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdown.classList.toggle('active');
});

document.addEventListener('click', () => {
  dropdown.classList.remove('active');
});

logoutBtn?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});

checkAuth();
