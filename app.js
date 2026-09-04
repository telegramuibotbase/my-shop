import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { supabaseConfig } from './supabase-config.js';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

const avatarBtn = document.getElementById('avatar-btn');
const dropdown = document.getElementById('dropdown');
const userAvatar = document.getElementById('user-avatar');
const logoutBtn = document.getElementById('logout-btn');
const headerBonus = document.getElementById('header-bonus');
const headerBonusValue = document.getElementById('header-bonus-value');

// База товаров с подробными данными
const products = [
  {
    id: 1,
    category: 'soft',
    icon: '💻',
    title: 'Windows Activator',
    shortDesc: 'Надёжная активация Windows 10/11',
    fullDesc: 'Профессиональный инструмент для активации Windows 10 и Windows 11. Поддерживает все редакции: Home, Pro, Enterprise. Мгновенная доставка ключа на email после оплаты. Пожизненная гарантия активации.',
    price: 150,
    images: ['💻', '🖥️', '⚙️', '✅'],
    features: ['Мгновенная доставка', 'Все редакции Windows', 'Пожизненная гарантия', 'Техподдержка 24/7']
  },
  {
    id: 2,
    category: 'soft',
    icon: '🎮',
    title: 'Game Booster Pro',
    shortDesc: 'Оптимизация системы для игр',
    fullDesc: 'Максимальная оптимизация вашей системы для игр. Автоматически отключает ненужные процессы, очищает оперативную память, оптимизирует настройки графики. Увеличение FPS до 40%.',
    price: 250,
    images: ['🎮', '', '🚀', '📊'],
    features: ['Увеличение FPS до 40%', 'Автоматическая оптимизация', 'Очистка RAM', 'Настройка графики']
  },
  {
    id: 3,
    category: 'services',
    icon: '',
    title: 'Настройка ПК',
    shortDesc: 'Удалённая настройка системы',
    fullDesc: 'Профессиональная удалённая настройка вашего компьютера. Установка драйверов, настройка системы, установка необходимого ПО, оптимизация производительности. Работаем через AnyDesk или TeamViewer.',
    price: 500,
    images: ['🛠', '💻', '️', '🔧'],
    features: ['Удалённая работа', 'Установка драйверов', 'Настройка системы', 'Установка ПО']
  },
  {
    id: 4,
    category: 'services',
    icon: '🛡',
    title: 'Чистка от вирусов',
    shortDesc: 'Полная диагностика и удаление вирусов',
    fullDesc: 'Полная диагностика компьютера на наличие вирусов, троянов, шпионского ПО и других угроз. Удаление всех вредоносных программ, установка антивируса, настройка защиты. Гарантия чистоты системы.',
    price: 300,
    images: ['🛡', '🔍', '', '✅'],
    features: ['Полная диагностика', 'Удаление вирусов', 'Установка антивируса', 'Настройка защиты']
  },
  {
    id: 5,
    category: 'bonuses',
    icon: '🎁',
    title: 'x2 Бонусы',
    shortDesc: 'Удвой свой бонусный баланс',
    fullDesc: 'Специальное предложение! Удвойте свой текущий бонусный баланс моментально. Идеально для тех, кто хочет получить больше бонусов для будущих покупок. Активируется мгновенно после оплаты.',
    price: 0,
    images: ['🎁', '✨', '💎', ''],
    features: ['Моментальная активация', 'Удвоение баланса', 'Без ограничений', 'Для всех пользователей'],
    isBonus: true
  },
  {
    id: 6,
    category: 'bonuses',
    icon: '🎟',
    title: 'Промокод на скидку',
    shortDesc: 'Скидка 10% на любую услугу',
    fullDesc: 'Получите промокод на скидку 10% на любую услугу в нашем магазине. Промокод действует 30 дней с момента активации. Можно использовать только один раз. Не суммируется с другими акциями.',
    price: 0,
    images: ['🎟', '', '🏷️', '✅'],
    features: ['Скидка 10%', 'Действует 30 дней', 'На любую услугу', 'Одноразовое использование'],
    isBonus: true
  }
];

function renderProducts(filter = 'all') {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
  
  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">${product.images[0]}</div>
      <div class="product-category">${getCategoryName(product.category)}</div>
      <h3 class="product-title">${product.title}</h3>
      <p class="product-short-desc">${product.shortDesc}</p>
      <div class="product-footer">
        <div class="product-price">${product.isBonus ? 'Бесплатно' : product.price + ' ₽'}</div>
        <button class="btn-buy ${product.isBonus ? 'bonus' : ''}" onclick="openProduct(${product.id})">
          ${product.isBonus ? 'Получить' : 'Купить'}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function getCategoryName(category) {
  const names = {
    soft: '💻 Софт',
    services: '🛠 Услуги',
    bonuses: '🎁 Бонусы'
  };
  return names[category] || category;
}

// Открыть страницу товара
window.openProduct = function(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    // Сохраняем товар в localStorage для страницы product.html
    localStorage.setItem('currentProduct', JSON.stringify(product));
    window.location.href = 'product.html';
  }
};

async function checkAuth() {
  if (!avatarBtn) return;
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url, bonus_balance')
    .eq('id', user.id)
    .single();
  
  if (!profile) {
    const defaultAvatar = user.user_metadata?.avatar_url || '';
    await supabase.from('profiles').insert({
      id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Пользователь',
      avatar_url: defaultAvatar,
      bonus_balance: 0
    });
    userAvatar.src = defaultAvatar || 'https://via.placeholder.com/40';
    headerBonusValue.textContent = '0';
  } else {
    userAvatar.src = profile.avatar_url || user.user_metadata?.avatar_url || 'https://via.placeholder.com/40';
    headerBonusValue.textContent = profile.bonus_balance || 0;
  }
  
  avatarBtn.style.display = 'block';
  headerBonus.style.display = 'flex';
  
  renderProducts('all');
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProducts(btn.dataset.category);
  });
});

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
