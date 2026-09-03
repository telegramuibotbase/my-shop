import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { supabaseConfig } from './supabase-config.js';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

const avatarBtn = document.getElementById('avatar-btn');
const dropdown = document.getElementById('dropdown');
const userAvatar = document.getElementById('user-avatar');
const logoutBtn = document.getElementById('logout-btn');

// Проверяем, авторизован ли пользователь
async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Если не авторизован — перекидываем на страницу входа
    window.location.href = 'login.html';
    return;
  }
  
  // Показываем аватарку
  userAvatar.src = user.user_metadata?.avatar_url || 'https://via.placeholder.com/40';
  avatarBtn.style.display = 'block';
  
  // Сохраняем данные пользователя для страницы профиля
  localStorage.setItem('userData', JSON.stringify({
    name: user.user_metadata?.name || user.email,
    avatar: user.user_metadata?.avatar_url,
    provider: 'Discord'
  }));
}

// Открываем/закрываем меню при клике на аватарку
avatarBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdown.classList.toggle('active');
});

// Закрываем меню при клике в любом другом месте
document.addEventListener('click', () => {
  dropdown.classList.remove('active');
});

// Выход из аккаунта
logoutBtn?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});

// Запускаем проверку при загрузке страницы
checkAuth();
