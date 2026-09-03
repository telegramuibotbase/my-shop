import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { supabaseConfig } from './supabase-config.js';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

// Элементы шапки (для выпадающего меню на любой странице)
const avatarBtn = document.getElementById('avatar-btn');
const dropdown = document.getElementById('dropdown');
const headerUserAvatar = document.getElementById('user-avatar');
const logoutBtn = document.getElementById('logout-btn');

// Элементы страницы профиля (если мы сейчас на profile.html)
const profileBigAvatar = document.getElementById('profile-big-avatar');
const displayName = document.getElementById('display-user-name');
const displayId = document.getElementById('display-user-id');

// Функция загрузки данных пользователя
async function loadUserData() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  // Если пользователь не авторизован, отправляем на вход
  if (authError || !user) {
    window.location.href = 'login.html';
    return;
  }
  
  // Показываем меню в шапке, если этот элемент есть на текущей странице
  if (avatarBtn) {
    avatarBtn.style.display = 'block';
  }

  // Читаем данные из таблицы profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('avatar_url, name')
    .eq('id', user.id)
    .single();
  
  // Значения по умолчанию из Discord
  let finalAvatar = user.user_metadata?.avatar_url || 'https://via.placeholder.com/140';
  let finalName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Пользователь';

  // Если записи в базе нет — создаём её
  if (profileError || !profile) {
    await supabase.from('profiles').insert({
      id: user.id,
      name: finalName,
      avatar_url: finalAvatar
    });
  } else {
    // Если запись есть, берем данные из нее (приоритетнее, т.к. пользователь мог их изменить)
    if (profile.avatar_url) finalAvatar = profile.avatar_url;
    if (profile.name) finalName = profile.name;
  }
  
  // 1. Обновляем маленькую аватарку в шапке (если мы не на странице профиля)
  if (headerUserAvatar) {
    headerUserAvatar.src = finalAvatar;
  }

  // 2. Обновляем большую аватарку и текст на странице профиля (если мы на ней)
  if (profileBigAvatar) {
    profileBigAvatar.src = finalAvatar;
  }
  if (displayName) {
    displayName.textContent = finalName;
  }
  if (displayId) {
    // Показываем сокращенный ID для аккуратности (первые 8 символов)
    displayId.textContent = `ID: ${user.id.substring(0, 8)}...`;
  }
}

// Загружаем данные при старте страницы
loadUserData();

// Принудительно обновляем при возврате на вкладку (из кэша браузера)
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    loadUserData();
  }
});

// Также обновляем при фокусе на окно (когда пользователь возвращается на вкладку)
window.addEventListener('focus', () => {
  loadUserData();
});

// Открытие/закрытие меню
avatarBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdown.classList.toggle('active');
});

// Закрытие меню при клике вне его
document.addEventListener('click', () => {
  dropdown?.classList.remove('active');
});

// Выход из аккаунта
logoutBtn?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});
