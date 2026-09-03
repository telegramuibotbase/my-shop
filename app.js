import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { supabaseConfig } from './supabase-config.js';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

const avatarBtn = document.getElementById('avatar-btn');
const dropdown = document.getElementById('dropdown');
const userAvatar = document.getElementById('user-avatar');
const logoutBtn = document.getElementById('logout-btn');
const headerBonus = document.getElementById('header-bonus');
const headerBonusValue = document.getElementById('header-bonus-value');

const products = [
  { id: 1, category: 'soft', icon: '💻', title: 'Windows Activator', desc: 'Надёжная активация Windows 10/11. Мгновенная доставка ключа.', price: '150 ₽' },
  { id: 2, category: 'soft', icon: '🎮', title: 'Game Booster Pro', desc: 'Оптимизация системы для максимальной FPS в играх.', price: '250 ₽' },
  { id: 3, category: 'services', icon: '', title: 'Настройка ПК', desc: 'Удалённая настройка системы, драйверов и программ.', price: '500 ₽' },
  { id: 4, category: 'services', icon: '🛡', title: 'Чистка от вирусов', desc: 'Полная диагностика и удаление вредоносного ПО.', price: '300 ₽' },
  { id: 5, category: 'bonuses', icon: '', title: 'x2 Бонусы', desc: 'Удвой свой бонусный баланс при следующей покупке!', price: 'Бесплатно', isBonus: true },
  { id: 6, category: 'bonuses', icon: '', title: 'Промокод на скидку', desc: 'Скидка 10% на любую услугу в магазине.', price: 'Бесплатно', isBonus: true }
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
      <div class="product-icon">${product.icon}</div>
      <div class="product-title">${product.title}</div>
      <div class="product-desc">${product.desc}</div>
      <div class="product-footer">
        <div class="product-price">${product.price}</div>
        <button class="btn-buy ${product.isBonus ? 'bonus' : ''}" onclick="alert('Функция покупки скоро будет доступна!')">
          ${product.isBonus ? 'Получить' : 'Купить'}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function checkAuth() {
  if (!avatarBtn) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { window.location.href = 'login.html'; return; }
  
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
