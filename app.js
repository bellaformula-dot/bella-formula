(function(){
'use strict';
var C=window.CATALOG, TG='https://t.me/AresLuminis';
var F={cart:false,arrows:true}; /* переключатели функций */
var T={
 uk:{tagline:'БАДи та вітаміни з Італії',h1:'Спортивне харчування та вітаміни з Італії',sub:'Склад, дозування й ціни — все на одній сторінці. Додайте товари в кошик і надішліть замовлення в Telegram одним натисканням.',
  buy:'Купити',search:'Пошук за назвою…',count:'Товарів',back:'← До каталогу',channel:'Telegram-канал',empty:'Нічого не знайдено. Спробуйте інший запит.',
  sortDef:'За замовчуванням',sortAsc:'Спочатку дешевші',sortDesc:'Спочатку дорожчі',comp:'Склад',how:'Як приймати',warn:'Застереження',pack:'Порівняння упаковок',perDay:'за день',rec:'найвигідніше',cur:'ця',
  recLine:'Чим менша упаковка, тим дорожчий кожен день прийому. Рекомендуємо:',best:'Це найвигідніша упаковка в лінійці.',weeks:'На 12 тижнів прийому',packs:'уп.',
  disclaimer:'Харчові добавки не є лікарськими засобами. Не замінюють різноманітне харчування. Перед застосуванням проконсультуйтеся з лікарем. Зображення та склад — за даними виробника.',ask:'Питання та замовлення — у Telegram',from:'з Італії',ph:'Фото',
  cats:'Категорії',allCats:'Усі товари',allSub:'Усе в категорії',reset:'Скинути',add:'У кошик',cart:'Кошик',cartEmpty:'Кошик порожній. Додайте товари з каталогу.',total:'Разом',
  checkout:'Оформити замовлення в Telegram',copy:'Скопіювати замовлення',copied:'Скопійовано ✓',clear:'Очистити кошик',close:'Закрити',remove:'Видалити',
  cartHint:'Відкриється чат Telegram із готовим повідомленням — залишиться натиснути «Надіслати».',longHint:'Замовлення велике: текст скопійовано, вставте його в чат Telegram.',
  orderHi:'Вітаю! Хочу замовити:',orderTotal:'Разом',orderSrc:'Замовлення з сайту Bella Formula',prev:'Попереднє фото',next:'Наступне фото',pcs:'шт.',items:'позицій'},
 ru:{tagline:'БАДы и витамины из Италии',h1:'Спортивное питание и витамины из Италии',sub:'Состав, дозировки и цены — всё на одной странице. Добавьте товары в корзину и отправьте заказ в Telegram одним нажатием.',
  buy:'Купить',search:'Поиск по названию…',count:'Товаров',back:'← В каталог',channel:'Telegram-канал',empty:'Ничего не найдено. Попробуйте другой запрос.',
  sortDef:'По умолчанию',sortAsc:'Сначала дешевле',sortDesc:'Сначала дороже',comp:'Состав',how:'Как принимать',warn:'Предупреждения',pack:'Сравнение упаковок',perDay:'в день',rec:'самая выгодная',cur:'эта',
  recLine:'Чем меньше упаковка, тем дороже каждый день приёма. Рекомендуем:',best:'Это самая выгодная упаковка в линейке.',weeks:'На 12 недель приёма',packs:'уп.',
  disclaimer:'Пищевые добавки не являются лекарственными средствами. Не заменяют разнообразное питание. Перед применением проконсультируйтесь с врачом. Изображения и состав — по данным производителя.',ask:'Вопросы и заказ — в Telegram',from:'из Италии',ph:'Фото',
  cats:'Категории',allCats:'Все товары',allSub:'Всё в категории',reset:'Сбросить',add:'В корзину',cart:'Корзина',cartEmpty:'Корзина пуста. Добавьте товары из каталога.',total:'Итого',
  checkout:'Оформить заказ в Telegram',copy:'Скопировать заказ',copied:'Скопировано ✓',clear:'Очистить корзину',close:'Закрыть',remove:'Удалить',
  cartHint:'Откроется чат Telegram с готовым сообщением — останется нажать «Отправить».',longHint:'Заказ большой: текст скопирован, вставьте его в чат Telegram.',
  orderHi:'Здравствуйте! Хочу заказать:',orderTotal:'Итого',orderSrc:'Заказ с сайта Bella Formula',prev:'Предыдущее фото',next:'Следующее фото',pcs:'шт.',items:'позиций'}
};
/* Категории верхнего уровня (как «терапевтические категории»); g — ключи подгрупп из data.js */
var CATS=[
 {k:'sport',e:'🏋️',uk:'Спорт та енергія',ru:'Спорт и энергия',g:['pump','bad','end','carb','cre','car']},
 {k:'amino',e:'🧬',uk:'Амінокислоти',ru:'Аминокислоты',g:['bcaa','eaa','glu','gly','oth']},
 {k:'cla',g:['cla']},{k:'om',g:['om']},{k:'vit',g:['vit']},{k:'min',g:['min']},{k:'ant',g:['ant']},
 {k:'mush',g:['mush']},{k:'herb',g:['herb']},{k:'jnt',g:['jnt']},{k:'brain',g:['brain']},{k:'gut',g:['gut']},{k:'phi',g:['phi']}
];
var st={lang:'uk',cat:'all',group:'all',q:'',sort:'def',open:false};
try{var sl=localStorage.getItem('bf_lang'); if(sl==='uk'||sl==='ru') st.lang=sl; else if(/^ru/i.test(navigator.language||'')) st.lang='ru';}catch(e){}
var $=function(s){return document.querySelector(s)};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function t(k){return T[st.lang][k]}
var byId={}; C.products.forEach(function(p){byId[p.id]=p});
var gmap={}; C.groups.forEach(function(g){gmap[g.key]=g});
var catOf={}; CATS.forEach(function(c){
  if(!c.uk){var g=gmap[c.g[0]]; c.uk=g.uk; c.ru=g.ru; c.e=g.emoji}
  c.g.forEach(function(k){catOf[k]=c})});
function gname(k){var g=gmap[k];return g.emoji+' '+g[st.lang]}
function cname(c){return c.e+' '+c[st.lang]}
function money(n){return (Math.round(n*100)/100).toFixed(2).replace('.',',')}
function L(p){return p[st.lang]}

/* ---------- КОРЗИНА ---------- */
var cart={};
try{var raw=JSON.parse(localStorage.getItem('bf_cart')||'{}'); Object.keys(raw).forEach(function(id){var q=+raw[id]; if(byId[id]&&q>0)cart[id]=Math.min(q,99)})}catch(e){}
function saveCart(){try{localStorage.setItem('bf_cart',JSON.stringify(cart))}catch(e){}}
function cartN(){var n=0;for(var k in cart)n+=cart[k];return n}
function cartSum(){var s=0;for(var k in cart)s+=cart[k]*byId[k].price;return s}
function setQty(id,q){ if(q<=0)delete cart[id]; else cart[id]=Math.min(q,99); saveCart(); cartChanged() }
function buyUrl(p){return TG+'?text='+encodeURIComponent(st.lang==='ru'?p.order_ru:p.order_uk)}
function ctl(p){
  if(!F.cart)return '<a class="pill" target="_blank" rel="noopener" href="'+buyUrl(p)+'">'+t('buy')+'</a>';
  var q=cart[p.id];
  if(!q)return '<button type="button" class="pill add" data-add="'+esc(p.id)+'">🛒 '+t('add')+'</button>';
  return '<div class="step"><button type="button" data-dec="'+esc(p.id)+'" aria-label="−">−</button><span>'+q+'</span><button type="button" data-inc="'+esc(p.id)+'" aria-label="+">+</button></div>';
}
function cartChanged(){
  var n=cartN(), b=$('#cartN'); b.textContent=n; b.hidden=!n;
  document.querySelectorAll('[data-ctl]').forEach(function(e){var p=byId[e.getAttribute('data-ctl')]; if(p)e.innerHTML=ctl(p)});
  if(!$('#drawer').hidden)renderDrawer();
}
function orderText(){
  var lines=[t('orderHi')], i=0;
  Object.keys(cart).forEach(function(id){var p=byId[id],d=L(p),q=cart[id]; i++;
    lines.push(i+') '+d.name+', '+d.pack+' — '+q+' '+t('pcs')+' × '+p.price+' € = '+(q*p.price)+' €')});
  lines.push(t('orderTotal')+': '+cartSum()+' €'); lines.push(''); lines.push(t('orderSrc'));
  return lines.join('\n');
}
function copyText(s,done){
  function fb(){var a=document.createElement('textarea');a.value=s;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(a);done&&done()}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(s).then(function(){done&&done()},fb)}else fb();
}
function renderDrawer(){
  var ids=Object.keys(cart), box=$('#drawerBody'), foot=$('#drawerFoot');
  $('#drawerTitle').textContent='🛒 '+t('cart')+(ids.length?' · '+cartN():'');
  $('#drawerClose').setAttribute('aria-label',t('close'));
  if(!ids.length){box.innerHTML='<p class="empty">'+t('cartEmpty')+'</p>';foot.innerHTML='';return}
  box.innerHTML=ids.map(function(id){var p=byId[id],d=L(p),q=cart[id];
    return '<div class="ci"><a class="cth" href="#p='+esc(id)+'" data-closecart data-e="'+esc(p.emoji||'💊')+'"><img src="'+esc(p.photos[0])+'" alt=""></a>'+
     '<div class="cin"><a class="cname" href="#p='+esc(id)+'" data-closecart>'+esc(d.name)+'</a><span class="pack">'+esc(d.pack)+'</span>'+
     '<div class="cbot"><div class="step"><button type="button" data-dec="'+esc(id)+'" aria-label="−">−</button><span>'+q+'</span><button type="button" data-inc="'+esc(id)+'" aria-label="+">+</button></div>'+
     '<b class="cl">'+(q*p.price)+' €</b></div></div><button type="button" class="crm" data-rm="'+esc(id)+'" aria-label="'+t('remove')+'">✕</button></div>'}).join('');
  var text=orderText(), url=TG+'?text='+encodeURIComponent(text), long=url.length>1900;
  foot.innerHTML='<div class="tot"><span>'+t('total')+'</span><b>'+cartSum()+' €</b></div>'+
    '<a class="pill big" id="goOrder" target="_blank" rel="noopener" href="'+(long?TG:esc(url))+'"'+(long?' data-long="1"':'')+'>✈️ '+t('checkout')+'</a>'+
    '<p class="note" id="cartNote">'+t('cartHint')+'</p>'+
    '<div class="frow"><button type="button" class="lnk" id="copyOrder">'+t('copy')+'</button><button type="button" class="lnk" id="clearCart">'+t('clear')+'</button></div>';
}
function openCart(){renderDrawer();$('#drawer').hidden=false;$('#veil').hidden=false;document.body.classList.add('lock');requestAnimationFrame(function(){$('#drawer').classList.add('on')})}
function closeCart(){$('#drawer').classList.remove('on');$('#veil').hidden=true;document.body.classList.remove('lock');setTimeout(function(){if(!$('#drawer').classList.contains('on'))$('#drawer').hidden=true},220)}

/* ---------- КАТЕГОРИИ ---------- */
function counts(){var c={all:C.products.length,cat:{}};C.products.forEach(function(p){c[p.group]=(c[p.group]||0)+1;var k=catOf[p.group].k;c.cat[k]=(c.cat[k]||0)+1});return c}
function catbar(){
  var n=counts(), cur=null, h='';
  CATS.forEach(function(c){if(c.k===st.cat)cur=c});
  var label=cur?cname(cur):t('allCats');
  h+='<div class="catbar"><button type="button" class="catbtn" id="catBtn" aria-expanded="'+st.open+'"><span class="ic">☰</span><span class="lbl">'+t('cats')+': <b>'+esc(label)+'</b></span><span class="car">▾</span></button>'+
     (cur?'<button type="button" class="catrst" data-cat="all">✕ '+t('reset')+'</button>':'')+'</div>';
  h+='<div class="catpanel" id="catPanel"'+(st.open?'':' hidden')+'><button type="button" class="crow'+(st.cat==='all'?' on':'')+'" data-cat="all"><span>'+t('allCats')+'</span><em>'+n.all+'</em></button>';
  CATS.forEach(function(c){ if(!n.cat[c.k])return;
    h+='<button type="button" class="crow'+(st.cat===c.k?' on':'')+'" data-cat="'+c.k+'"><span>'+esc(cname(c))+'</span><em>'+n.cat[c.k]+'</em></button>'});
  h+='</div>';
  if(cur&&cur.g.length>1){
    h+='<div class="subs"><button type="button" class="sub'+(st.group==='all'?' on':'')+'" data-grp="all">'+t('allSub')+' <em>'+n.cat[cur.k]+'</em></button>';
    cur.g.forEach(function(k){ if(!n[k])return; h+='<button type="button" class="sub'+(st.group===k?' on':'')+'" data-grp="'+k+'">'+esc(gmap[k].emoji+' '+gmap[k][st.lang])+' <em>'+n[k]+'</em></button>'});
    h+='</div>';
  }
  $('#catWrap').innerHTML=h;
}
function applyStatic(){
  document.documentElement.lang=st.lang;
  document.querySelectorAll('[data-i]').forEach(function(e){e.textContent=t(e.getAttribute('data-i'))});
  $('#q').placeholder=t('search');
  $('#tgChannel').textContent='✈️ '+t('channel');
  $('#cartBtn').setAttribute('aria-label',t('cart')); $('#cartBtn').hidden=!F.cart;
  document.title='Bella Formula — '+t('tagline');
  document.querySelectorAll('.lang button').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-lang')===st.lang)});
  var s=$('#sort'); s.innerHTML='<option value="def">'+t('sortDef')+'</option><option value="asc">'+t('sortAsc')+'</option><option value="desc">'+t('sortDesc')+'</option>'; s.value=st.sort;
}
function list(){
  var q=st.q.trim().toLowerCase(), cur=null; CATS.forEach(function(c){if(c.k===st.cat)cur=c});
  var arr=C.products.filter(function(p){
    if(st.group!=='all'&&p.group!==st.group)return false;
    if(st.group==='all'&&cur&&cur.g.indexOf(p.group)<0)return false;
    if(!q)return true;
    var hay=(p.uk.name+' '+p.ru.name+' '+p.uk.pack+' '+p.ru.pack+' '+gmap[p.group].uk+' '+gmap[p.group].ru).toLowerCase();
    return q.split(/\s+/).every(function(w){return hay.indexOf(w)>=0});
  });
  if(st.sort==='asc')arr=arr.slice().sort(function(a,b){return a.price-b.price});
  if(st.sort==='desc')arr=arr.slice().sort(function(a,b){return b.price-a.price});
  $('#count').textContent=t('count')+': '+arr.length;
  $('#empty').hidden=arr.length>0;
  $('#grid').innerHTML=arr.map(function(p){
    var d=L(p);
    return '<article class="card"><a class="ph" href="#p='+esc(p.id)+'" aria-label="'+esc(d.name)+'" data-e="'+esc(p.emoji||'💊')+'"><img loading="lazy" src="'+esc(p.photos[0])+'" alt="'+esc(d.name+' '+d.pack)+'"></a>'+
    '<div class="bd"><span class="grp">'+esc(gname(p.group))+'</span><h3><a href="#p='+esc(p.id)+'">'+esc(d.name)+'</a></h3><span class="pack">'+esc(d.pack)+'</span>'+
    '<div class="row"><span class="price">'+p.price+'<small> €</small></span><span class="ctl" data-ctl="'+esc(p.id)+'">'+ctl(p)+'</span></div></div></article>';
  }).join('');
}
function famBlock(p){
  var f=C.families.filter(function(f){return f.items.some(function(i){return i.id===p.id})})[0]; if(!f)return '';
  var rows=f.items.map(function(i){var q=byId[i.id]; var cur=i.id===p.id;
    var lab=esc(st.lang==='ru'?i.label_ru:i.label_uk);
    return '<tr'+(cur?' class="cur"':'')+'><td>'+(i.id===f.recommend?'⭐ ':'▫️ ')+(cur?lab+' <span class="note">('+t('cur')+')</span>':'<a href="#p='+esc(i.id)+'">'+lab+'</a>')+'</td><td><b>'+q.price+' €</b></td><td>'+money(q.price/i.days)+' € / '+(st.lang==='ru'?'день':'день')+'</td><td class="star">'+(i.id===f.recommend?t('rec'):'')+'</td></tr>'}).join('');
  var rec=f.items.filter(function(i){return i.id===f.recommend})[0];
  var tail=p.id===f.recommend?'<p class="note">✅ '+t('best')+'</p>':'<p class="note">💡 '+t('recLine')+' <a href="#p='+esc(rec.id)+'">'+esc(st.lang==='ru'?rec.label_ru:rec.label_uk)+'</a>.</p>';
  return '<div class="block"><h4>'+t('pack')+' — '+esc(st.lang==='ru'?f.name_ru:f.name_uk)+'</h4><table class="fam">'+rows+'</table>'+tail+'</div>';
}

/* ---------- КАРТОЧКА ТОВАРА + ГАЛЕРЕЯ ---------- */
var galNav=null;
function detail(id,noStrip){
  var p=byId[id]; if(!p){location.hash='';return}
  var d=L(p), ph=p.photos, strip=noStrip?null:p.strip, N=strip?p.n:ph.length, cur=0;
  function bg(i){return 'background-image:url('+strip+');background-size:100% '+(N*100)+'%;background-position:0 '+(N>1?i*100/(N-1):0)+'%'}
  var comp=d.comp.map(function(x){return '<li>'+esc(x)+'</li>'}).join('');
  var arrows=(N>1&&F.arrows)?'<button type="button" class="nav prev" aria-label="'+t('prev')+'">‹</button><button type="button" class="nav next" aria-label="'+t('next')+'">›</button><span class="cnt" id="cnt">1 / '+N+'</span>':'';
  var h='<button class="back" id="backBtn">'+t('back')+'</button><div class="detail"><div class="gal"><div class="main" id="mainBox" data-e="'+esc(p.emoji||'💊')+'">'+
   (strip?'<div id="mainImg" class="fr" role="img" aria-label="'+esc(d.name+' '+d.pack)+'" style="'+bg(0)+'"></div>':'<img id="mainImg" src="'+esc(ph[0])+'" alt="'+esc(d.name+' '+d.pack)+'">')+arrows+'</div>'+
   (N>1?'<div class="thumbs">'+Array.apply(null,Array(N)).map(function(_,i){return '<button type="button" data-i="'+i+'" aria-current="'+(i===0)+'" aria-label="'+t('ph')+' '+(i+1)+'">'+(strip?'<span class="fr" style="'+bg(i)+'"></span>':'<img src="'+esc(ph[i])+'" alt="">')+'</button>'}).join('')+'</div>':'')+'</div>'+
   '<div class="info"><span class="grp" style="color:var(--terra);font-weight:600;font-size:13px">'+esc(gname(p.group))+'</span><h2>'+esc(d.name)+'</h2><div class="pack">'+esc(d.pack)+' · '+t('from')+' 🇮🇹</div>'+
   '<div class="buyrow"><span class="price">'+p.price+' €</span><span class="ctl big" data-ctl="'+esc(p.id)+'">'+ctl(p)+'</span></div>'+
   d.desc.map(function(x){return '<p>'+esc(x)+'</p>'}).join('')+
   '<div class="block"><h4>'+t('comp')+(d.comp_title?' — '+esc(d.comp_title.replace(/^(Склад|Состав)\s*/,'')):'')+'</h4><ul class="comp">'+comp+'</ul></div>'+
   '<div class="block"><h4>'+t('how')+'</h4><p>'+esc(d.how)+'</p>'+d.notes.map(function(x){return '<p class="note">'+esc(x)+'</p>'}).join('')+(p.weeks?'<p class="note">🗓 '+t('weeks')+': '+p.weeks+' '+t('packs')+' = '+(p.weeks*p.price)+' €</p>':'')+'</div>'+
   (d.warn?'<div class="block"><div class="warn">⚠️ '+esc(d.warn)+'</div></div>':'')+famBlock(p)+'</div></div>';
  var v=$('#detailView'); v.innerHTML=h; v.hidden=false; $('#listView').hidden=true;
  document.title=d.name+' — Bella Formula';
  window.scrollTo(0,0);
  $('#backBtn').onclick=function(){ if(history.length>1&&document.referrer.indexOf(location.host)>=0){history.back()}else{location.hash=''} };
  var thumbs=v.querySelectorAll('.thumbs button');
  function show(i){
    cur=(i+N)%N;
    var m=$('#mainImg'); if(strip)m.setAttribute('style',bg(cur)); else m.src=ph[cur];
    thumbs.forEach(function(x,j){x.setAttribute('aria-current',j===cur)});
    var c=$('#cnt'); if(c)c.textContent=(cur+1)+' / '+N;
    if(thumbs[cur]&&thumbs[cur].scrollIntoView)try{thumbs[cur].scrollIntoView({block:'nearest',inline:'center'})}catch(e){}
  }
  thumbs.forEach(function(b){b.onclick=function(){show(+b.getAttribute('data-i'))}});
  if(N>1&&F.arrows){
    galNav=function(dir){show(cur+dir)};
    var pv=v.querySelector('.prev'), nx=v.querySelector('.next'), box=$('#mainBox');
    pv.onclick=function(e){e.stopPropagation();show(cur-1)}; nx.onclick=function(e){e.stopPropagation();show(cur+1)};
    var x0=null,y0=null;
    box.addEventListener('touchstart',function(e){var q=e.touches[0];x0=q.clientX;y0=q.clientY},{passive:true});
    box.addEventListener('touchend',function(e){if(x0===null)return;var q=e.changedTouches[0],dx=q.clientX-x0,dy=q.clientY-y0;x0=null;
      if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3)show(cur+(dx<0?1:-1))},{passive:true});
    var px=null;
    box.addEventListener('mousedown',function(e){px=e.clientX});
    box.addEventListener('mouseup',function(e){if(px===null)return;var dx=e.clientX-px;px=null;if(Math.abs(dx)>50)show(cur+(dx<0?1:-1))});
    box.addEventListener('dragstart',function(e){e.preventDefault()});
  } else galNav=null;
  if(strip){var im=new Image();im.onerror=function(){ if(location.hash==='#p='+encodeURIComponent(id)||location.hash==='#p='+id)detail(id,true)};im.src=strip}
}
function route(){
  galNav=null;
  var m=/^#p=(.+)$/.exec(location.hash);
  if(m){detail(decodeURIComponent(m[1]));}
  else{$('#detailView').hidden=true;$('#listView').hidden=false;document.title='Bella Formula — '+t('tagline')}
}
function all(){applyStatic();catbar();list();route();cartChanged();if(!$('#drawer').hidden)renderDrawer()}

/* ---------- СОБЫТИЯ ---------- */
document.addEventListener('error',function(e){
  var im=e.target; if(!im||im.tagName!=='IMG')return;
  var box=im.closest('.ph,.cth,.main'); if(box){box.classList.add('noimg');im.style.display='none'}
},true);
document.addEventListener('click',function(e){
  var el=e.target;
  var a=el.closest('[data-add]'); if(a){setQty(a.getAttribute('data-add'),1);return}
  a=el.closest('[data-inc]'); if(a){var i=a.getAttribute('data-inc');setQty(i,(cart[i]||0)+1);return}
  a=el.closest('[data-dec]'); if(a){var j=a.getAttribute('data-dec');setQty(j,(cart[j]||0)-1);return}
  a=el.closest('[data-rm]'); if(a){setQty(a.getAttribute('data-rm'),0);return}
  if(el.closest('#cartBtn')){openCart();return}
  if(el.closest('#drawerClose')||el.closest('#veil')||el.closest('[data-closecart]')){closeCart();return}
  if(el.closest('#clearCart')){cart={};saveCart();cartChanged();return}
  if(el.closest('#copyOrder')){var b=el.closest('#copyOrder');copyText(orderText(),function(){b.textContent=t('copied');setTimeout(function(){b.textContent=t('copy')},1800)});return}
  a=el.closest('#goOrder'); if(a){ if(a.getAttribute('data-long')){copyText(orderText(),function(){var n=$('#cartNote');if(n)n.textContent=t('longHint')})} return}
  if(el.closest('#catBtn')){st.open=!st.open;catbar();return}
  a=el.closest('[data-cat]'); if(a){st.cat=a.getAttribute('data-cat');st.group='all';st.open=false;catbar();list();
    var w=$('#catWrap'); if(w&&w.getBoundingClientRect().top<0)w.scrollIntoView({block:'start'}); return}
  a=el.closest('[data-grp]'); if(a){st.group=a.getAttribute('data-grp');catbar();list();return}
  if(st.open&&!el.closest('#catWrap')){st.open=false;catbar()}
  var l=el.closest('.lang button'); if(l){st.lang=l.getAttribute('data-lang');try{localStorage.setItem('bf_lang',st.lang)}catch(x){} all()}
});
$('#q').addEventListener('input',function(e){st.q=e.target.value;list()});
$('#sort').addEventListener('change',function(e){st.sort=e.target.value;list()});
$('#brand').addEventListener('click',function(e){e.preventDefault();location.hash='';window.scrollTo(0,0)});
window.addEventListener('hashchange',route);
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){ if(!$('#drawer').hidden){closeCart();return} if(st.open){st.open=false;catbar();return} if(location.hash)location.hash=''; return}
  if(galNav&&!/INPUT|SELECT|TEXTAREA/.test((e.target||{}).tagName||'')){ if(e.key==='ArrowLeft')galNav(-1); else if(e.key==='ArrowRight')galNav(1)}
});
all();
})();
