  // ------------------ Sample product data ------------------
  const PRODUCTS = [
    {id:'p1',name:'Aurora Headphones',category:'Electronics',price:89.99,desc:'Wireless over-ear headphones with active noise cancellation.',imgColor:'#6b8cff'},
    {id:'p2',name:'Comfy Hoodie',category:'Clothing',price:49.50,desc:'Soft fleece hoodie — unisex, multiple sizes.',imgColor:'#ff8a85'},
    {id:'p3',name:'Smartwatch X2',category:'Electronics',price:199.00,desc:'Heart-rate, GPS, and 7-day battery life.',imgColor:'#7fffd4'},
    {id:'p4',name:'Vintage Sunglasses',category:'Accessories',price:39.99,desc:'UV400 lenses with classic metal frame.',imgColor:'#ffd36b'},
    {id:'p5',name:'Travel Backpack',category:'Bags',price:129.00,desc:'40L water-resistant backpack with laptop sleeve.',imgColor:'#9ad67a'},
    {id:'p6',name:'Pro Camera Lens',category:'Electronics',price:349.00,desc:'50mm prime lens with superb low-light performance.',imgColor:'#c58cff'},
    {id:'p7',name:'Running Shoes',category:'Clothing',price:89.00,desc:'Lightweight running shoes with breathable mesh.',imgColor:'#8bd0ff'},
    {id:'p8',name:'Ceramic Mug Set',category:'Home',price:24.99,desc:'Set of 4 stackable mugs, dishwasher safe.',imgColor:'#ffd0f0'},
    {id:'p9',name:'Desk Lamp',category:'Home',price:59.50,desc:'LED desk lamp with adjustable brightness.',imgColor:'#a0ffd6'},
    {id:'p10',name:'Leather Wallet',category:'Accessories',price:45.00,desc:'Slim bifold wallet with RFID protection.',imgColor:'#d0a88c'}
  ];

  // ---------- State & Utilities ----------
  const TAX_RATE = 0.08; // 8% tax
  const $ = s => document.querySelector(s);
  const $all = s => Array.from(document.querySelectorAll(s));

  // Cart structure: {productId: {qty: num, product: {...}}}
  let CART = {};

  // Load cart from localStorage
  function loadCart(){
    try{
      const raw = localStorage.getItem('minishop_cart');
      CART = raw ? JSON.parse(raw) : {};
    }catch(e){console.error('Failed to load cart',e);CART={};}
    updateCartUI();
  }
  function saveCart(){
    localStorage.setItem('minishop_cart', JSON.stringify(CART));
    updateCartUI();
  }

  function addToCart(product, qty=1){
    if(CART[product.id]) CART[product.id].qty += qty;
    else CART[product.id] = {qty, product};
    if(CART[product.id].qty < 1) delete CART[product.id];
    saveCart();
    showToast(`${product.name} added to cart`);
  }
  function removeFromCart(pid){ delete CART[pid]; saveCart(); }
  function setQty(pid, qty){ if(CART[pid]){ CART[pid].qty = qty; if(qty<1) delete CART[pid]; saveCart(); }}

  function cartSummary(){
    const items = Object.values(CART);
    const subtotal = items.reduce((s,it)=>s + it.product.price * it.qty,0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    return {items, subtotal, tax, total};
  }

  function updateCartUI(){
    const count = Object.values(CART).reduce((s,it)=>s+it.qty,0);
    $('#cartCount').textContent = count;
  }

  // ---------- Rendering products ----------
  const categories = new Set(PRODUCTS.map(p=>p.category));
  function populateCategoryFilter(){
    const sel = $('#categoryFilter');
    categories.forEach(cat=>{
      const opt = document.createElement('option'); opt.value = cat; opt.textContent = cat; sel.appendChild(opt);
    })
  }

  function makeSVGDataURL(text, bg){
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='360'><rect width='100%' height='100%' fill='${bg}' rx='14'/><text x='50%' y='50%' font-size='34' font-family='Arial' fill='white' dominant-baseline='middle' text-anchor='middle'>${text}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function renderProducts(list){
    const grid = $('#productGrid'); grid.innerHTML='';
    const tpl = document.getElementById('productCardTpl');
    list.forEach(p=>{
      const node = tpl.content.cloneNode(true);
      node.querySelector('[data-title]').textContent = p.name;
      node.querySelector('[data-desc]').textContent = p.desc;
      node.querySelector('[data-price]').textContent = `$${p.price.toFixed(2)}`;
      const thumb = node.querySelector('[data-img]');
      const imgUrl = makeSVGDataURL(p.name.split(' ')[0], p.imgColor);
      const img = document.createElement('img'); img.src = imgUrl; img.alt = p.name; img.style.width='100%'; img.style.height='100%'; img.style.objectFit='cover'; img.style.borderRadius='8px';
      thumb.appendChild(img);

      node.querySelector('[data-add]').addEventListener('click', ()=> addToCart(p,1));
      node.querySelector('[data-details]').addEventListener('click', ()=> openProductDetails(p));
      grid.appendChild(node);
    });
    $('#resultCount').textContent = list.length;
  }

  // ---------- Search & Filters ----------
  function filterProducts(){
    const q = $('#searchInput').value.trim().toLowerCase();
    const cat = $('#categoryFilter').value;
    const price = $('#priceFilter').value;
    let out = PRODUCTS.filter(p=> (p.name + ' ' + p.desc).toLowerCase().includes(q));
    if(cat !== 'all') out = out.filter(p=> p.category === cat);
    if(price !== 'all'){
      const [lo,hi] = price.split('-').map(Number);
      out = out.filter(p=> p.price >= lo && p.price <= hi);
    }
    renderProducts(out);
  }

  // ---------- Product details modal ----------
  function openOverlay(contentHtml){
    $('#panel').innerHTML = contentHtml;
    $('#overlay').classList.add('show');
  }
  function closeOverlay(){ $('#overlay').classList.remove('show'); }

  function openProductDetails(p){
    const html = `
      <div style="display:flex;gap:12px;align-items:flex-start;flex-direction:column">
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <div style="flex:1;min-width:220px"><img src='${makeSVGDataURL(p.name, p.imgColor)}' style='width:100%;border-radius:10px' alt='${p.name}'></div>
          <div style="flex:2">
            <h2 style='margin:0 0 8px'>${p.name}</h2>
            <div class='muted'>${p.category} • $${p.price.toFixed(2)}</div>
            <p style='margin-top:12px'>${p.desc}</p>
            <div style='display:flex;gap:8px;margin-top:12px'>
              <input id='qtyDetail' type='number' min='1' value='1' style='width:84px;padding:8px;border-radius:8px;background:transparent;border:1px solid rgba(255,255,255,0.06)'>
              <button class='btn' id='addDetail'>Add to cart</button>
              <button class='btn ghost' id='closeDetail'>Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    openOverlay(html);
    $('#addDetail').addEventListener('click', ()=>{ const q = Math.max(1, parseInt($('#qtyDetail').value||1)); addToCart(p,q); closeOverlay(); });
    $('#closeDetail').addEventListener('click', closeOverlay);
  }

  // ---------- Cart & Checkout UI ----------
  function openCart(){
    const sum = cartSummary();
    let itemsHtml = '';
    if(sum.items.length === 0) itemsHtml = `<div class='muted'>Your cart is empty.</div>`;
    else itemsHtml = sum.items.map(it=>`
      <div class='cart-item' data-pid='${it.product.id}'>
        <div style='width:64px'><img src='${makeSVGDataURL(it.product.name.split(' ')[0], it.product.imgColor)}' style='width:100%;border-radius:8px'></div>
        <div style='flex:1'>
          <div style='font-weight:700'>${it.product.name}</div>
          <div class='muted'>${it.product.category} • $${it.product.price.toFixed(2)}</div>
        </div>
        <div style='text-align:right'>
          <div class='muted'>Qty</div>
          <input class='qty-input' type='number' min='1' value='${it.qty}' data-pid='${it.product.id}' style='padding:6px;border-radius:8px;background:transparent;border:1px solid rgba(255,255,255,0.06)'>
          <div style='margin-top:8px'>$${(it.product.price * it.qty).toFixed(2)}</div>
          <button class='btn ghost' data-remove='${it.product.id}' style='margin-top:6px'>Remove</button>
        </div>
      </div>
    `).join('');

    const html = `
      <h3>Shopping Cart</h3>
      <div class='cart-list'>${itemsHtml}</div>
      <div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:12px'>
        <div>
          <div class='muted'>Subtotal</div>
          <div style='font-weight:700'>$${sum.subtotal.toFixed(2)}</div>
        </div>
        <div>
          <div class='muted'>Tax (${(TAX_RATE*100).toFixed(0)}%)</div>
          <div style='font-weight:700'>$${sum.tax.toFixed(2)}</div>
        </div>
        <div>
          <div class='muted'>Total</div>
          <div style='font-weight:900;font-size:18px'>$${sum.total.toFixed(2)}</div>
        </div>
      </div>
      <div style='display:flex;gap:8px;justify-content:flex-end'>
        <button class='btn ghost' id='closeCart'>Continue Shopping</button>
        <button class='btn' id='checkoutBtn'>Checkout</button>
      </div>
    `;
    openOverlay(html);

    // Wire cart interactions
    document.querySelectorAll('.qty-input').forEach(inp=> inp.addEventListener('change', (e)=>{ const pid = e.target.dataset.pid; const v = Math.max(1, parseInt(e.target.value||1)); setQty(pid,v); openCart(); }));
    document.querySelectorAll('[data-remove]').forEach(b=> b.addEventListener('click', ()=>{ removeFromCart(b.getAttribute('data-remove')); openCart(); }));
    $('#closeCart').addEventListener('click', closeOverlay);
    $('#checkoutBtn').addEventListener('click', openCheckout);
  }

  function openCheckout(){
    const sum = cartSummary();
    if(sum.items.length === 0){ showToast('Cart is empty'); closeOverlay(); return; }
    const html = `
      <h3>Checkout</h3>
      <div class='muted'>Order total: <strong>$${sum.total.toFixed(2)}</strong></div>
      <form id='checkoutForm' style='margin-top:12px'>
        <label>Name<input name='name' required></label>
        <label>Email<input name='email' type='email' required></label>
        <label>Address<textarea name='address' rows='2' required></textarea></label>
        <div class='row'>
          <div class='col'><label>Card Number<input name='card' maxlength='19' placeholder='1234 5678 9012 3456' required></label></div>
          <div style='width:120px'><label>CVV<input name='cvv' maxlength='4' required></label></div>
        </div>
        <div class='row'>
          <div class='col'><label>Expiry<input name='expiry' placeholder='MM/YY' required></label></div>
          <div style='width:120px'><label>Promo/Notes<input name='notes'></label></div>
        </div>
        <div style='display:flex;gap:8px;justify-content:flex-end;margin-top:8px'>
          <button type='button' class='btn ghost' id='backToCart'>Back</button>
          <button type='submit' class='btn'>Pay $${sum.total.toFixed(2)}</button>
        </div>
      </form>
    `;
    openOverlay(html);

    $('#backToCart').addEventListener('click', openCart);
    $('#checkoutForm').addEventListener('submit', (e)=>{
      e.preventDefault();
      const data = new FormData(e.target);
      // Basic validation
      if(!data.get('name').trim() || !data.get('email').trim() || !data.get('address').trim()){
        showToast('Please fill required fields'); return;
      }
      // fake card check (simple digit count)
      const card = data.get('card').replace(/\s+/g,'');
      if(!/^\d{12,19}$/.test(card)){ showToast('Card number appears invalid'); return; }
      // all ok -> process
      // simulate loading state
      const payBtn = e.target.querySelector('button[type=submit]'); payBtn.disabled = true; payBtn.textContent = 'Processing...';
      setTimeout(()=>{
        // success: clear cart
        CART = {}; saveCart();
        const orderId = 'ORD' + Math.floor(Math.random()*900000 + 100000);
        openOverlay(`<h3>Payment successful</h3><div class='muted'>Thank you — your order <strong>${orderId}</strong> is placed.</div><div style='margin-top:12px;display:flex;gap:8px;justify-content:flex-end'><button class='btn' id='doneBtn'>Done</button></div>`);
        $('#doneBtn').addEventListener('click', closeOverlay);
      }, 900);
    });
  }

  // ---------- Tiny toast helper ----------
  let toastTimer;
  function showToast(msg){
    clearTimeout(toastTimer);
    let el = document.getElementById('miniToast');
    if(!el){ el = document.createElement('div'); el.id='miniToast'; el.style.position='fixed'; el.style.right='20px'; el.style.bottom='20px'; el.style.background='linear-gradient(90deg,#111827,#0b1220)'; el.style.padding='10px 14px'; el.style.borderRadius='8px'; el.style.boxShadow='0 6px 18px rgba(2,6,23,0.6)'; el.style.zIndex=9999; document.body.appendChild(el);} 
    el.textContent = msg; el.style.opacity=1; toastTimer = setTimeout(()=> el.style.opacity=0, 2400);
  }

  // ---------- Initialization & event wiring ----------
  document.addEventListener('DOMContentLoaded', ()=>{
    populateCategoryFilter(); renderProducts(PRODUCTS);
    loadCart();

    $('#searchInput').addEventListener('input', debounce(filterProducts,250));
    $('#categoryFilter').addEventListener('change', filterProducts);
    $('#priceFilter').addEventListener('change', filterProducts);
    $('#resetFilters').addEventListener('click', ()=>{ $('#searchInput').value=''; $('#categoryFilter').value='all'; $('#priceFilter').value='all'; filterProducts(); });

    $('#openCartBtn').addEventListener('click', openCart);
    $('#overlay').addEventListener('click', (e)=>{ if(e.target.id === 'overlay') closeOverlay(); });

  });

  // ---------- Helpers ----------
  function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t = setTimeout(()=> fn(...a), ms); }}