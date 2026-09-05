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

// Загрузка товаров из базы
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
    card.innerHTML = `
      <div class="product-image">${product.icon}</div>
      <div class="product-category">${getCategoryName(product.category)}</div>
      <h3 class="product-title">${product.title}</h3>
      <p class="product-short-desc">${product.short_desc}</p>
      <div class="product-footer">
        <div class="product-price">${product.is_bonus ? 'Бесплатно' : product.price + ' ₽'}</div>
        <button class="btn-buy ${product.is_bonus ? 'bonus' : ''}" onclick="event.stopPropagation(); openProduct(${product.id})">
          ${product.is_bonus ? 'Получить' : 'Купить'}
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
  
  // Загружаем профиль
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('avatar_url, bonus_balance, user_id, name')
    .eq('id', user.id)
    .single();
  
  if (!profile || profileError) {
    // Создаём профиль если нет
    const defaultAvatar = user.user_metadata?.avatar_url || '';
    const numericId = 100000 + Math.floor(Math.random() * 900000);
    
    console.log(' Создаём профиль с user_id:', numericId);
    
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        user_id: numericId,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Пользователь',
        avatar_url: defaultAvatar,
        bonus_balance: 0
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Ошибка создания профиля:', insertError);
    } else {
      console.log('✅ Профиль создан:', newProfile);
    }
    
    userAvatar.src = defaultAvatar || 'https://via.placeholder.com/40';
    headerBonusValue.textContent = '0';
  } else {
    console.log('✅ Профиль загружен:', profile);
    console.log('🔢 user_id:', profile.user_id, 'тип:', typeof profile.user_id);
    userAvatar.src = profile.avatar_url || user.user_metadata?.avatar_url || 'https://via.placeholder.com/40';
    headerBonusValue.textContent = profile.bonus_balance || 0;
  }
  
  avatarBtn.style.display = 'block';
  headerBonus.style.display = 'flex';
  
  // Загружаем товары
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
