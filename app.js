import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { supabaseConfig } from './supabase-config.js';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

const avatarBtn = document.getElementById('avatar-btn');
const dropdown = document.getElementById('dropdown');
const userAvatar = document.getElementById('user-avatar');
const logoutBtn = document.getElementById('logout-btn');
const headerBonus = document.getElementById('header-bonus');
const headerBonusValue = document.getElementById('header-bonus-value');

let products = [];

async function loadProductsFromDB() {
  console.log('🔄 Загрузка товаров из базы...');
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('❌ Ошибка загрузки товаров:', error);
    return [];
  }

  console.log('✅ Загружено товаров:', data?.length || 0);
  return data || [];
}

function renderProducts(filter = 'all') {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
  
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">Товары пока не добавлены</div>';
    return;
  }
  
  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => openProduct(product.id);
    
    // Определяем отображение цены
    const priceType = product.price_type || 'money';
    let priceDisplay;
    let btnText;
    let badgeClass;
    let badgeText;
    
    if (priceType === 'bonus') {
      priceDisplay = product.price + ' 🎁';
      btnText = 'Оплатить бонусами';
      badgeClass = 'bonus-badge';
      badgeText = '🎁 Бонусы';
    } else if (priceType === 'free') {
      priceDisplay = 'Бесплатно';
      btnText = 'Получить';
      badgeClass = 'free-badge';
      badgeText = '🆓 Бесплатно';
    } else {
      priceDisplay = product.price + ' ₽';
      btnText = 'Купить';
      badgeClass = 'money-badge';
      badgeText = '💰 Рубли';
    }
    
    // Главное изображение
    const mainImage = product.image_urls && product.image_urls.length > 0
      ? `<img src="${product.image_urls[0]}" class="product-real-image">`
      : `<div class="product-image">${product.icon}</div>`;
    
    card.innerHTML = `
      ${mainImage}
      <div class="product-category">${getCategoryName(product.category)}</div>
      <div class="product-payment-badge ${badgeClass}">${badgeText}</div>
      <h3 class="product-title">${product.title}</h3>
      <p class="product-short-desc">${product.short_desc}</p>
      <div class="product-footer">
        <div class="product-price">${priceDisplay}</div>
        <button class="btn-buy ${priceType === 'bonus' ? 'bonus' : priceType === 'free' ? 'free' : ''}" onclick="event.stopPropagation(); openProduct(${product.id})">
          ${btnText}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function getCategoryName(category) {
  const names = {
    soft: '💻 Софт',
    services: '🛠️ Услуги',
    bonuses: '🎁 Бонусы'
  };
  return names[category] || category;
}

window.openProduct = function(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
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
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('avatar_url, bonus_balance, user_id, name')
    .eq('id', user.id)
    .single();
  
  if (!profile || profileError) {
    const defaultAvatar = user.user_metadata?.avatar_url || '';
    const numericId = 100000 + Math.floor(Math.random() * 900000);
    
    console.log('📝 Создаём профиль с user_id:', numericId);
    
    await supabase.from('profiles').insert({
      id: user.id,
      user_id: numericId,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Пользователь',
      avatar_url: defaultAvatar,
      bonus_balance: 0
    });
    
    userAvatar.src = defaultAvatar || 'https://via.placeholder.com/40';
    headerBonusValue.textContent = '0';
  } else {
    console.log('✅ Профиль загружен, user_id:', profile.user_id);
    userAvatar.src = profile.avatar_url || user.user_metadata?.avatar_url || 'https://via.placeholder.com/40';
    headerBonusValue.textContent = profile.bonus_balance || 0;
  }
  
  avatarBtn.style.display = 'block';
  headerBonus.style.display = 'flex';
  
  products = await loadProductsFromDB();
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
