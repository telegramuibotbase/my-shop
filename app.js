import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { supabaseConfig } from './supabase-config.js';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

const avatarBtn = document.getElementById('avatar-btn');
const dropdown = document.getElementById('dropdown');
const userAvatar = document.getElementById('user-avatar');
const logoutBtn = document.getElementById('logout-btn');

// Функция загрузки аватарки из базы
async function loadAvatar() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  // Читаем из базы profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single();
  
  // Если записи нет — создаём с Discord-аватаркой
  if (!profile) {
    const defaultAvatar = user.user_metadata?.avatar_url || '';
    
    await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Пользователь',
        avatar_url: defaultAvatar
      });
    
    userAvatar.src = defaultAvatar || 'https://via.placeholder.com/40';
  } else {
    // Берём аватарку из базы (она может быть изменена в профиле)
    userAvatar.src = profile.avatar_url || user.user_metadata?.avatar_url || 'https://via.placeholder.com/40';
  }
  
  avatarBtn.style.display = 'block';
}

// Загружаем аватарку при старте
loadAvatar();

// Принудительно обновляем при возврате на страницу (когда пользователь возвращается из профиля)
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    loadAvatar();
  }
});

// Также обновляем при фокусе на окно (когда пользователь возвращается на вкладку)
window.addEventListener('focus', () => {
  loadAvatar();
});

// Меню
avatarBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdown.classList.toggle('active');
});

document.addEventListener('click', () => {
  dropdown.classList.remove('active');
});

// Выход
logoutBtn?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});
