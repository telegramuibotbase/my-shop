// 1. Подключаем библиотеку Supabase прямо из интернета
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 2. Подключаем наши настройки
import { supabaseConfig } from './supabase-config.js';

// 3. Создаём клиент Supabase
const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

// 4. Находим кнопку на странице
const discordBtn = document.getElementById('btn-discord');

// 5. Вешаем на неё событие "клик"
if (discordBtn) {
  discordBtn.addEventListener('click', async () => {
    
    // ВАЖНО: Замените 'ВАШ-USERNAME' и 'my-shop' на ваши реальные данные!
    // Это адрес, куда Discord вернёт пользователя после входа.
    const redirectUrl = 'https://telegramuibotbase.github.io/my-shop/index.html';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: redirectUrl
      }
    });

    if (error) {
      alert('Ошибка входа: ' + error.message);
    }
  });
}
