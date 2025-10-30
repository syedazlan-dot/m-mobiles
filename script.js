/* script.js
   - Auth (localStorage): ss_users, ss_user
   - Cart stored in ss_cart
   - Product images are in HTML (kept unchanged)
   - Added image modal show/hide logic
*/

(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from((r||document).querySelectorAll(s));

  // ---------------- AUTH ----------------
  window.appAuth = {
    isLoggedIn(){
      return !!localStorage.getItem('ss_user');
    },
    signIn(email, pass){
      const users = JSON.parse(localStorage.getItem('ss_users') || '{}');
      const u = users[email];
      if (!u || u.password !== pass) {
        alert('Invalid credentials (demo).');
        return false;
      }
      localStorage.setItem('ss_user', JSON.stringify({ email: u.email, name: u.name }));
      updateLoginButton(); // refresh button after login
      return true;
    },
    signUp(email, pass){
      if (!email || pass.length < 6) { alert('Provide valid email and password (min 6 chars)'); return false;}
      const users = JSON.parse(localStorage.getItem('ss_users') || '{}');
      if (users[email]) { alert('Account already exists. Please login.'); return false; }
      users[email] = { email, password: pass, name: email.split('@')[0], created: Date.now() };
      localStorage.setItem('ss_users', JSON.stringify(users));
      localStorage.setItem('ss_user', JSON.stringify({ email, name: email.split('@')[0] }));
      updateLoginButton(); // refresh button after signup
      return true;
    },
    socialLogin(provider){
      const demo = provider === 'google' ? { email:'google.user@example.com', name:'GoogleUser' } :
                   provider === 'facebook' ? { email:'fb.user@example.com', name:'FBUser' } :
                   { email:'demo@example.com', name:'Demo' };
      localStorage.setItem('ss_user', JSON.stringify(demo));
      updateLoginButton(); // refresh button after social login
      return true;
    },
    signOut(){
      localStorage.removeItem('ss_user');
      updateLoginButton(); // visually update button to Login
    }
  };

  // ---------------- CART ----------------
  function getCart(){ return JSON.parse(localStorage.getItem('ss_cart') || '[]'); }
  function saveCart(cart){ localStorage.setItem('ss_cart', JSON.stringify(cart)); updateCartCount(); }
  function updateCartCount(){
    const count = getCart().reduce((s,i)=>s+i.qty,0);
    $$('[id="cartCount"]').forEach(el => el.textContent = count);
  }

  window.addToCart = function(name, price){
    const prod = Array.from(document.querySelectorAll('.product')).find(p => p.dataset.name === name);
    const img = prod ? (prod.querySelector('img')?.src || '') : '';
    const id = name.replace(/\s+/g,'_').toLowerCase();
    const cart = getCart();
    const found = cart.find(c => c.id === id);
    if (found) found.qty += 1;
    else cart.push({ id, name, price: Number(price), qty: 1, img });
    saveCart(cart);
    alert(`${name} added to cart.`);
  };

  window.cartUpdateItem = function(id, qty){
    const cart = getCart();
    const it = cart.find(i=>i.id===id);
    if (!it) return;
    it.qty = Math.max(0, Number(qty));
    const updated = cart.filter(i=>i.qty>0);
    saveCart(updated);
    if (typeof window.cartPageRender === 'function') window.cartPageRender();
  };

  window.cartRemoveItem = function(id){
    const updated = getCart().filter(i=>i.id !== id);
    saveCart(updated);
    if (typeof window.cartPageRender === 'function') window.cartPageRender();
  };

  // ---------------- IMAGE MODAL ----------------
  const imageModal = $('#imageModal');
  const imageModalImg = $('#imageModalImg');
  const imageModalClose = $('#imageModalClose');

  window.showImageModal = function(src){
    if (!imageModal || !imageModalImg) return;
    imageModalImg.src = src;
    imageModal.setAttribute('aria-hidden','false');
    imageModalClose?.focus();
  };

  function hideImageModal(){
    if (!imageModal) return;
    imageModal.setAttribute('aria-hidden','true');
    if (imageModalImg) imageModalImg.src = '';
  }
  window.hideImageModal = hideImageModal;

  if (imageModal) {
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal || e.target === imageModalClose) hideImageModal();
    });
  }

  if (imageModalClose) imageModalClose.addEventListener('click', hideImageModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (imageModal && imageModal.getAttribute('aria-hidden') === 'false') hideImageModal();
      else {
        const am = $('#authModal');
        if (am && am.getAttribute('aria-hidden') === 'false') am.setAttribute('aria-hidden','true');
      }
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.product img').forEach(img => {
      if (!img.dataset.modalBound) {
        img.dataset.modalBound = '1';
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
          window.showImageModal(img.src);
        });
      }
    });
  });

  // ---------------- MODAL / AUTH UI ----------------
  const authModal = $('#authModal');
  function activateTab(which){
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  const loginPane = document.getElementById('loginPane');
  const signupPane = document.getElementById('signupPane');

  if (!tabLogin || !tabSignup || !loginPane || !signupPane) return;

  if (which === 'login') {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    loginPane.style.display = '';
    signupPane.style.display = 'none';
  } else {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    signupPane.style.display = '';
    loginPane.style.display = 'none';
  }
}
window.activateTab = activateTab;

  function showAuthModal(){
    if (!authModal) return;
    authModal.setAttribute('aria-hidden','false');
    activateTab('login');
    setTimeout(()=>($('#modalEmail') || $('#signupEmail'))?.focus(), 120);
  }

  function hideAuthModal(){
    if (!authModal) return;
    authModal.setAttribute('aria-hidden','true');
  }
  window.showAuthModal = showAuthModal;

  document.addEventListener('DOMContentLoaded', () => {
    const tabLogin = $('#tabLogin');
    const tabSignup = $('#tabSignup');
    function activateTab(which){
      if (which === 'login') {
        tabLogin?.classList.add('active');
        tabSignup?.classList.remove('active');
        $('#loginPane').style.display = '';
        $('#signupPane').style.display = 'none';
      } else {
        tabSignup?.classList.add('active');
        tabLogin?.classList.remove('active');
        $('#signupPane').style.display = '';
        $('#loginPane').style.display = 'none';
      }
    }
    if (tabLogin) tabLogin.addEventListener('click', ()=>activateTab('login'));
    if (tabSignup) tabSignup.addEventListener('click', ()=>activateTab('signup'));

    $('#authClose')?.addEventListener('click', hideAuthModal);
    if (authModal) authModal.addEventListener('click', (e)=> { if (e.target === authModal) hideAuthModal(); });

    $('#modalLoginForm')?.addEventListener('submit', (e)=> {
      e.preventDefault();
      const email = $('#modalEmail').value.trim();
      const pass = $('#modalPass').value;
      if (window.appAuth.signIn(email, pass)) {
        hideAuthModal();
        updateLoginButton();
        if (location.pathname.endsWith('checkout.html')) window.checkoutPageInit?.();
      }
    });

    $('#modalSignupForm')?.addEventListener('submit', (e)=> {
      e.preventDefault();
      const email = $('#signupEmail').value.trim();
      const pass = $('#signupPass').value;
      if (window.appAuth.signUp(email, pass)) {
        hideAuthModal();
        updateLoginButton();
        if (location.pathname.endsWith('checkout.html')) window.checkoutPageInit?.();
      }
    });

    ['#modalGoogle', '#modalFacebook', '#signupGoogle', '#signupFacebook'].forEach(id=>{
      $(id)?.addEventListener('click', ()=> {
        const provider = id.includes('google') ? 'google' : 'facebook';
        window.appAuth.socialLogin(provider);
        hideAuthModal();
        updateLoginButton();
        window.checkoutPageInit?.();
      });
    });

    updateCartCount();
    updateLoginButton();
  });

  // ---------------- CART PAGE RENDER ----------------
  window.cartPageRender = function(){
    const container = $('#cartItems');
    const totalEl = $('#cartTotal');
    if (!container) return;
    const cart = getCart();
    container.innerHTML = '';
    if (!cart.length) {
      container.innerHTML = '<p>Your cart is empty.</p>';
      if (totalEl) totalEl.textContent = '0.00';
      updateCartCount();
      return;
    }
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.qty;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.style = 'display:flex; gap:12px; align-items:center; padding:8px; background:#fff; margin-bottom:8px; border-radius:8px;';
      row.innerHTML = `
        <img src="${item.img}" alt="${item.name}" style="width:90px;height:70px;object-fit:cover;border-radius:6px;">
        <div style="flex:1">
          <strong>${item.name}</strong>
          <div style="color:#666">$${item.price.toFixed(2)}</div>
        </div>
        <div style="text-align:right">
          <input type="number" min="0" value="${item.qty}" data-id="${item.id}" style="width:68px;padding:6px;border-radius:6px;border:1px solid #ddd;">
          <div style="margin-top:8px;">
            <button data-id="${item.id}" class="btn remove-btn">Remove</button>
          </div>
        </div>
      `;
      container.appendChild(row);
    });
    if (totalEl) totalEl.textContent = total.toFixed(2);

    container.querySelectorAll('input[type="number"]').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        let v = Number(e.target.value);
        if (isNaN(v) || v < 0) v = 0;
        window.cartUpdateItem(id, v);
      });
    });
    container.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        if (!confirm('Remove item?')) return;
        window.cartRemoveItem(id);
      });
    });

    updateCartCount();
  };

  // ---------------- CHECKOUT PAGE INIT ----------------
  window.checkoutPageInit = function(){
    const orderList = $('#orderList');
    const orderTotal = $('#orderTotal');
    const cart = getCart();
    if (orderList) {
      orderList.innerHTML = '';
      if (!cart.length) orderList.innerHTML = '<p>Your cart is empty.</p>';
      let total = 0;
      cart.forEach(item => {
        total += item.price * item.qty;
        const d = document.createElement('div');
        d.style = 'padding:6px 0;border-bottom:1px solid #eee;';
        d.innerHTML = `<strong>${item.name}</strong> × ${item.qty} — $${(item.price*item.qty).toFixed(2)}`;
        orderList.appendChild(d);
      });
      if (orderTotal) orderTotal.textContent = total.toFixed(2);
    }

    // payment method toggle
    $('#paymentMethod')?.addEventListener('change', (e) => {
      const method = e.target.value;
      const isCard = method === 'card';
      $('#cardFields').style.display = isCard ? 'block' : 'none';

      ['#cardNum', '#cardExp', '#cardCvv'].forEach(id => {
        const field = document.querySelector(id);
        if (field) {
          if (isCard) field.setAttribute('required', 'true');
          else field.removeAttribute('required');
        }
      });
    });

    // Ensure visibility and required attributes reflect current selection
    const methodInit = $('#paymentMethod')?.value || 'cod';
    const isCardInit = methodInit === 'card';
    if ($('#cardFields')) $('#cardFields').style.display = isCardInit ? 'block' : 'none';
    ['#cardNum', '#cardExp', '#cardCvv'].forEach(id => {
      const field = document.querySelector(id);
      if (!field) return;
      if (isCardInit) field.setAttribute('required','true');
      else field.removeAttribute('required');
    });

    if (!window.appAuth.isLoggedIn()) showAuthModal();

    // ---------------- FORM SUBMIT ----------------
    $('#checkoutForm')?.addEventListener('submit', (e) => {
      e.preventDefault();

      if ($('#paymentMethod')?.value !== 'card') {
        ['#cardNum', '#cardExp', '#cardCvv'].forEach(id => {
          const field = document.querySelector(id);
          if (field) field.removeAttribute('required');
        });
      }

      if (!window.appAuth.isLoggedIn()) {
        showAuthModal();
        return;
      }

      const cartNow = getCart();
      if (!cartNow.length) { return; } // no alert if empty

      const orderId = 'ORD' + Date.now();
      const order = {
        id: orderId,
        user: JSON.parse(localStorage.getItem('ss_user') || '{}'),
        items: cartNow,
        contact: {
          name: $('#fullName')?.value || '',
          address: $('#address')?.value || '',
          city: $('#city')?.value || '',
          postal: $('#postal')?.value || ''
        },
        payment: $('#paymentMethod')?.value || 'cod',
        created: Date.now()
      };

      localStorage.setItem('ss_last_order', JSON.stringify(order));
      localStorage.removeItem('ss_cart');
      updateCartCount();

      const res = $('#orderResult');
      if (res) {
        res.innerHTML = `<div style="background:#d1fae5;padding:12px;border-radius:8px;">
          <strong>Order placed successfully!</strong><br>
          Your order ID is <strong>${orderId}</strong>. (Demo)
          <br><br><a href="products.html" class="btn">Continue Shopping</a>
        </div>`;
        orderList.innerHTML = '';
        if (orderTotal) orderTotal.textContent = '0';
        $('#checkoutForm')?.reset();
      } else {
        alert('Order placed: ' + orderId);
        location.href = 'products.html';
      }
    });
  };

  // ---------------- LOGIN BUTTON UPDATE ----------------
  function updateLoginButton() {
    const isLoggedIn = window.appAuth.isLoggedIn();
    document.querySelectorAll('#logoutBtn, #logoutBtnCart, #logoutBtnCheckout').forEach(btn => {
      if (isLoggedIn) {
        btn.textContent = 'Logout';
        btn.onclick = () => {
          if (confirm('Are you sure you want to log out?')) {
            window.appAuth.signOut();
          }
        };
      } else {
        btn.textContent = 'Login';
        btn.onclick = () => {
          window.showAuthModal();
        };
      }
    });
  }
  window.updateLoginButton = updateLoginButton;

  // ---------------- PRODUCT SORTING ----------------
  document.addEventListener('DOMContentLoaded', () => {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;
    sortSelect.addEventListener('change', () => {
      const container = document.getElementById('productContainer');
      const products = Array.from(container.querySelectorAll('.product'));
      const value = sortSelect.value;
      let sorted;
      switch (value) {
        case 'az':
          sorted = products.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
          break;
        case 'lowhigh':
          sorted = products.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
          break;
        case 'highlow':
          sorted = products.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
          break;
        case 'popular':
          sorted = products.sort((a, b) => Number(b.dataset.popular) - Number(a.dataset.popular));
          break;
        default:
          sorted = products;
      }
      container.innerHTML = '';
      sorted.forEach(p => container.appendChild(p));
    });
  });

  // ---------------- INITIAL LOAD ----------------
  document.addEventListener('DOMContentLoaded', () => {
    const page = location.pathname.split('/').pop();
    if (page === 'checkout.html') {
      if (!window.appAuth.isLoggedIn()) showAuthModal();
      else window.checkoutPageInit?.();
    }
    if (page === 'cart.html') window.cartPageRender?.();
    updateCartCount();
    updateLoginButton();
  });

})(); // end IIFE
