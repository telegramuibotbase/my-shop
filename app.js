import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { supabaseConfig } from './supabase-config.js';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

const avatarBtn = document.getElementById('avatar-btn');
const dropdown = document.getElementById('dropdown');
const userAvatar = document.getElementById('user-avatar');
const logoutBtn = document.getElementById('logout-btn');

// Проверяем авторизацию
async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  // Показываем аватарку
  userAvatar.src = user.user_metadata?.avatar_url || 'https://via.placeholder.com/40';
  avatarBtn.style.display = 'block';
  
  // Определяем провайдера
  const provider = user.app_metadata?.provider || 'Неизвестно';
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
  
  // Сохраняем данные (если ещё не сохранены)
  if (!localStorage.getItem('userData')) {
    localStorage.setItem('userData', JSON.stringify({
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
      avatar: user.user_metadata?.avatar_url,
      provider: providerName,
      email: user.email,
      balance: 0
    }));
  }
}

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
  localStorage.removeItem('userData');
  window.location.href = 'login.html';
});

checkAuth();
