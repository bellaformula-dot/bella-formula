(function(){
'use strict';
var C=window.CATALOG, TG='https://t.me/AresLuminis';
var F={cart:true,arrows:true}; /* переключатели функций */
var ORDER_API='https://bf-orders.ironflagqaz.workers.dev'; /* адрес Cloudflare Worker; пусто = заказ через ссылку Telegram */
var T={
 uk:{tagline:'БАДи та вітаміни з Італії',kicker:'NATURALE. ITALIANA. PER TE.',h1:'Спортивне харчування та вітаміни з Італії',sub:'Склад, дозування й ціни — все на одній сторінці. Додайте товари в кошик і надішліть замовлення в Telegram одним натисканням.',
  buy:'Купити',search:'Пошук за назвою…',count:'Товарів',back:'← До каталогу',channel:'Telegram-канал',empty:'Нічого не знайдено. Спробуйте інший запит.',
  sortDef:'За замовчуванням',sortAsc:'Спочатку дешевші',sortDesc:'Спочатку дорожчі',comp:'Склад',how:'Як приймати',warn:'Застереження',pack:'Порівняння упаковок',perDay:'за день',rec:'найвигідніше',cur:'ця',
  recLine:'Чим менша упаковка, тим дорожчий кожен день прийому. Рекомендуємо:',best:'Це найвигідніша упаковка в лінійці.',weeks:'На 12 тижнів прийому',packs:'уп.',
  disclaimer:'Харчові добавки не є лікарськими засобами. Не замінюють різноманітне харчування. Перед застосуванням проконсультуйтеся з лікарем. Зображення та склад — за даними виробника.',ask:'Питання та замовлення — у Telegram',from:'з Італії',ph:'Фото',
  cats:'Категорії',allCats:'Усі товари',allSub:'Усе в категорії',reset:'Скинути',add:'У кошик',cart:'Кошик',cartEmpty:'Кошик порожній. Додайте товари з каталогу.',total:'Разом',
  checkout:'Оформити замовлення в Telegram',copy:'Скопіювати замовлення',copied:'Скопійовано ✓',clear:'Очистити кошик',close:'Закрити',remove:'Видалити',
  cartHint:'Відкриється чат Telegram із готовим повідомленням — залишиться натиснути «Надіслати».',
  fName:'Ваше ім’я',fContact:'Телефон або @username у Telegram',fComment:'Коментар до замовлення (необов’язково)',send:'Надіслати замовлення',sending:'Надсилаємо…',needFields:'Вкажіть ім’я та телефон або @username — щоб ми могли зв’язатися.',errSend:'Не вдалося надіслати. Спробуйте ще раз або напишіть нам у Telegram.',okTitle:'Замовлення прийнято!',okText:'Ми підтвердимо наявність і суму та зв’яжемося з вами найближчим часом.',okNo:'Номер замовлення',okBtn:'Закрити',orTg:'Або напишіть у Telegram',sendHint:'Ми підтвердимо наявність і суму, а потім надішлемо реквізити для оплати.',longHint:'Замовлення велике: текст скопійовано, вставте його в чат Telegram.',
  orderHi:'Вітаю! Хочу замовити:',orderTotal:'Разом',orderSrc:'Замовлення з сайту Bella Formula',prev:'Попереднє фото',next:'Наступне фото',pcs:'шт.',items:'позицій',guide:'Про товари',gTitle:'Про товари: що це і для чого',gSub:'Докладні статті про добавки, вітаміни та мінерали — для чого потрібні, кому підходять, як приймати і на що звернути увагу.',gSearch:'Пошук статті…',gAll:'Усі теми',gBack:'← До статей',gRelated:'Товари за темою',gRead:'Читати про це',gEmpty:'Статей не знайдено.',gLoading:'Завантаження…',gErr:'Не вдалося завантажити статтю. Оновіть сторінку.',gCount:'Статей',gMore:'Читати →'},
 ru:{tagline:'БАДы и витамины из Италии',kicker:'NATURALE. ITALIANA. PER TE.',h1:'Спортивное питание и витамины из Италии',sub:'Состав, дозировки и цены — всё на одной странице. Добавьте товары в корзину и отправьте заказ в Telegram одним нажатием.',
  buy:'Купить',search:'Поиск по названию…',count:'Товаров',back:'← В каталог',channel:'Telegram-канал',empty:'Ничего не найдено. Попробуйте другой запрос.',
  sortDef:'По умолчанию',sortAsc:'Сначала дешевле',sortDesc:'Сначала дороже',comp:'Состав',how:'Как принимать',warn:'Предупреждения',pack:'Сравнение упаковок',perDay:'в день',rec:'самая выгодная',cur:'эта',
  recLine:'Чем меньше упаковка, тем дороже каждый день приёма. Рекомендуем:',best:'Это самая выгодная упаковка в линейке.',weeks:'На 12 недель приёма',packs:'уп.',
  disclaimer:'Пищевые добавки не являются лекарственными средствами. Не заменяют разнообразное питание. Перед применением проконсультируйтесь с врачом. Изображения и состав — по данным производителя.',ask:'Вопросы и заказ — в Telegram',from:'из Италии',ph:'Фото',
  cats:'Категории',allCats:'Все товары',allSub:'Всё в категории',reset:'Сбросить',add:'В корзину',cart:'Корзина',cartEmpty:'Корзина пуста. Добавьте товары из каталога.',total:'Итого',
  checkout:'Оформить заказ в Telegram',copy:'Скопировать заказ',copied:'Скопировано ✓',clear:'Очистить корзину',close:'Закрыть',remove:'Удалить',
  cartHint:'Откроется чат Telegram с готовым сообщением — останется нажать «Отправить».',
  fName:'Ваше имя',fContact:'Телефон или @username в Telegram',fComment:'Комментарий к заказу (необязательно)',send:'Отправить заказ',sending:'Отправляем…',needFields:'Укажите имя и телефон или @username — чтобы мы могли связаться.',errSend:'Не удалось отправить. Попробуйте ещё раз или напишите нам в Telegram.',okTitle:'Заказ принят!',okText:'Мы подтвердим наличие и сумму и свяжемся с вами в ближайшее время.',okNo:'Номер заказа',okBtn:'Закрыть',orTg:'Или напишите в Telegram',sendHint:'Мы подтвердим наличие и сумму, затем пришлём реквизиты для оплаты.',longHint:'Заказ большой: текст скопирован, вставьте его в чат Telegram.',
  orderHi:'Здравствуйте! Хочу заказать:',orderTotal:'Итого',orderSrc:'Заказ с сайта Bella Formula',prev:'Предыдущее фото',next:'Следующее фото',pcs:'шт.',items:'позиций',guide:'О товарах',gTitle:'О товарах: что это и для чего',gSub:'Подробные статьи о добавках, витаминах и минералах — для чего нужны, кому подходят, как принимать и на что обратить внимание.',gSearch:'Поиск статьи…',gAll:'Все темы',gBack:'← К статьям',gRelated:'Товары по теме',gRead:'Читать об этом',gEmpty:'Статей не найдено.',gLoading:'Загрузка…',gErr:'Не удалось загрузить статью. Обновите страницу.',gCount:'Статей',gMore:'Читать →'}
};
/* Категории верхнего уровня (как «терапевтические категории»); g — ключи подгрупп из data.js */
var CATS=[
 {k:'sport',e:'🏋️',uk:'Спорт та енергія',ru:'Спорт и энергия',g:['pump','bad','end','carb','cre','car']},
 {k:'amino',e:'🧬',uk:'Амінокислоти',ru:'Аминокислоты',g:['bcaa','eaa','glu','gly','oth']},
 {k:'cla',g:['cla']},{k:'om',g:['om']},{k:'vit',g:['vit']},{k:'min',g:['min']},{k:'ant',g:['ant']},
 {k:'mush',g:['mush']},{k:'herb',g:['herb']},{k:'jnt',g:['jnt']},{k:'brain',g:['brain']},{k:'gut',g:['gut']},{k:'phi',g:['phi']}
];
var st={lang:'uk',cat:'all',group:'all',q:'',sort:'def',open:false,gcat:'all',gq:'',brand:'all',form:'all'};
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
function fm(n){return String(Math.round(n*100)/100).replace('.',',')}
function money(n){return (Math.round(n*100)/100).toFixed(2).replace('.',',')}
function L(p){return p[st.lang]}

/* ---------- КОРЗИНА ---------- */
var cart={};
try{var raw=JSON.parse(localStorage.getItem('bf_cart')||'{}'); Object.keys(raw).forEach(function(id){var q=+raw[id]; if(byId[id]&&q>0)cart[id]=Math.min(q,99)})}catch(e){}
function saveCart(){try{localStorage.setItem('bf_cart',JSON.stringify(cart))}catch(e){}}
function cartN(){var n=0;for(var k in cart)n+=cart[k];return n}
function cartSum(){var s=0;for(var k in cart)s+=cart[k]*byId[k].price;return s}
function setQty(id,q){ pendingNo=null; if(q>0)done=null; if(q<=0)delete cart[id]; else cart[id]=Math.min(q,99); saveCart(); cartChanged() }
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
    lines.push(i+') '+d.name+', '+d.pack+' — '+q+' '+t('pcs')+' × '+fm(p.price)+' € = '+fm(q*p.price)+' €')});
  lines.push(t('orderTotal')+': '+fm(cartSum())+' €'); lines.push(''); lines.push(t('orderSrc'));
  return lines.join('\n');
}
function orderLines(){
  var lines=[], i=0;
  Object.keys(cart).forEach(function(id){var p=byId[id],d=L(p),q=cart[id]; i++;
    lines.push(i+') '+d.name+', '+d.pack+' — '+q+' '+t('pcs')+' × '+fm(p.price)+' € = '+fm(q*p.price)+' €')});
  return lines.join('\n');
}
function newOrderNo(){var d=new Date(),z=function(n){return ('0'+n).slice(-2)};return 'BF-'+z(d.getMonth()+1)+z(d.getDate())+'-'+z(d.getHours())+z(d.getMinutes())+'-'+Math.floor(100+Math.random()*900)}
var form={name:'',contact:'',comment:''}, done=null, sending=false, pendingNo=null;
try{var sf=JSON.parse(localStorage.getItem('bf_form')||'{}'); form.name=sf.name||''; form.contact=sf.contact||''}catch(e){}
function copyText(s,done){
  function fb(){var a=document.createElement('textarea');a.value=s;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(a);done&&done()}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(s).then(function(){done&&done()},fb)}else fb();
}
function renderDrawer(){
  var ids=Object.keys(cart), box=$('#drawerBody'), foot=$('#drawerFoot');
  $('#drawerTitle').textContent='🛒 '+t('cart')+(ids.length?' · '+cartN():'');
  $('#drawerClose').setAttribute('aria-label',t('close'));
  if(!ids.length&&done){box.innerHTML='<div class="okbox"><div class="okic">✅</div><h4>'+t('okTitle')+'</h4><p>'+t('okText')+'</p><p class="note">'+t('okNo')+': <b>'+esc(done.no)+'</b></p><button type="button" class="pill big" data-closecart>'+t('okBtn')+'</button></div>';foot.innerHTML='';return}
  if(!ids.length){box.innerHTML='<p class="empty">'+t('cartEmpty')+'</p>';foot.innerHTML='';return}
  box.innerHTML=ids.map(function(id){var p=byId[id],d=L(p),q=cart[id];
    return '<div class="ci"><a class="cth" href="#p='+esc(id)+'" data-closecart data-e="'+esc(p.emoji||'💊')+'"><img src="'+esc(p.photos[0])+'" alt=""></a>'+
     '<div class="cin"><a class="cname" href="#p='+esc(id)+'" data-closecart>'+esc(d.name)+'</a><span class="pack">'+esc(d.pack)+'</span>'+
     '<div class="cbot"><div class="step"><button type="button" data-dec="'+esc(id)+'" aria-label="−">−</button><span>'+q+'</span><button type="button" data-inc="'+esc(id)+'" aria-label="+">+</button></div>'+
     '<b class="cl">'+fm(q*p.price)+' €</b></div></div><button type="button" class="crm" data-rm="'+esc(id)+'" aria-label="'+t('remove')+'">✕</button></div>'}).join('');
  var text=orderText(), url=TG+'?text='+encodeURIComponent(text), long=url.length>1900;
  if(ORDER_API){
    foot.innerHTML='<div class="tot"><span>'+t('total')+'</span><b>'+fm(cartSum())+' €</b></div>'+
      '<form id="orderForm" novalidate><input class="fi" id="fName" autocomplete="name" maxlength="80" placeholder="'+esc(t('fName'))+'" value="'+esc(form.name)+'">'+
      '<input class="fi" id="fContact" autocomplete="tel" maxlength="120" placeholder="'+esc(t('fContact'))+'" value="'+esc(form.contact)+'">'+
      '<textarea class="fi" id="fComment" rows="2" maxlength="500" placeholder="'+esc(t('fComment'))+'">'+esc(form.comment)+'</textarea>'+
      '<input type="text" id="fHp" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;height:0">'+
      '<p class="err" id="formErr" hidden></p>'+
      '<button type="submit" class="pill big" id="sendBtn"'+(sending?' disabled':'')+'>✈️ '+t(sending?'sending':'send')+'</button></form>'+
      '<p class="note" id="cartNote">'+t('sendHint')+'</p>'+
      '<div class="frow"><a class="lnk" id="goOrder" target="_blank" rel="noopener" href="'+(long?TG:esc(url))+'"'+(long?' data-long="1"':'')+'>'+t('orTg')+'</a><button type="button" class="lnk" id="clearCart">'+t('clear')+'</button></div>';
    return;
  }
  foot.innerHTML='<div class="tot"><span>'+t('total')+'</span><b>'+fm(cartSum())+' €</b></div>'+
    '<a class="pill big" id="goOrder" target="_blank" rel="noopener" href="'+(long?TG:esc(url))+'"'+(long?' data-long="1"':'')+'>✈️ '+t('checkout')+'</a>'+
    '<p class="note" id="cartNote">'+t('cartHint')+'</p>'+
    '<div class="frow"><button type="button" class="lnk" id="copyOrder">'+t('copy')+'</button><button type="button" class="lnk" id="clearCart">'+t('clear')+'</button></div>';
}
function submitOrder(){
  if(sending)return;
  var n=$('#fName'),c=$('#fContact'),m=$('#fComment'),er=$('#formErr');
  form.name=n.value.trim();form.contact=c.value.trim();form.comment=m.value.trim();
  try{localStorage.setItem('bf_form',JSON.stringify({name:form.name,contact:form.contact}))}catch(e){}
  if(form.name.length<2||form.contact.length<5){er.textContent=t('needFields');er.hidden=false;(form.name.length<2?n:c).focus();return}
  if($('#fHp').value)return;
  er.hidden=true; sending=true; renderDrawer();
  var no=pendingNo||(pendingNo=newOrderNo()), total=cartSum();
  var ctl=new AbortController(), to=setTimeout(function(){ctl.abort()},15000);
  fetch(ORDER_API,{method:'POST',headers:{'Content-Type':'application/json'},signal:ctl.signal,
    body:JSON.stringify({order_no:no,name:form.name,contact:form.contact,comment:form.comment,lang:st.lang,total:total,text:orderLines(),hp:''})})
  .then(function(r){return r.json().catch(function(){return {ok:false}})})
  .then(function(j){ clearTimeout(to); sending=false;
    if(j&&j.ok){pendingNo=null;done={no:no};cart={};form.comment='';saveCart();cartChanged();renderDrawer()}
    else{renderDrawer();var e2=$('#formErr');if(e2){e2.textContent=t('errSend');e2.hidden=false}}})
  .catch(function(){ clearTimeout(to); sending=false; renderDrawer(); var e2=$('#formErr');if(e2){e2.textContent=t('errSend');e2.hidden=false}});
}
function openCart(){renderDrawer();$('#drawer').hidden=false;$('#veil').hidden=false;document.body.classList.add('lock');requestAnimationFrame(function(){$('#drawer').classList.add('on')})}
function closeCart(){done=null;$('#drawer').classList.remove('on');$('#veil').hidden=true;document.body.classList.remove('lock');setTimeout(function(){if(!$('#drawer').classList.contains('on'))$('#drawer').hidden=true},220)}

/* ---------- КАТЕГОРИИ ---------- */
function counts(){var c={all:C.products.length,cat:{}};C.products.forEach(function(p){c[p.group]=(c[p.group]||0)+1;var k=catOf[p.group].k;c.cat[k]=(c.cat[k]||0)+1});return c}
function quickCats(){
  var n=counts(), box=$('#quickCats'); if(!box)return;
  var h='<button type="button" class="qcat'+(st.cat==='all'?' on':'')+'" data-cat="all"><span class="qe">✦</span> '+t('allCats')+' <em>'+n.all+'</em></button>';
  CATS.forEach(function(c){
    if(!n.cat[c.k])return;
    h+='<button type="button" class="qcat'+(st.cat===c.k?' on':'')+'" data-cat="'+c.k+'"><span class="qe">'+esc(c.e)+'</span> '+esc(c[st.lang])+' <em>'+n.cat[c.k]+'</em></button>';
  });
  box.innerHTML=h;
}
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
  quickCats();
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
  var hc=$('#heroCatalog'), hg=$('#heroGoals');
  if(hc)hc.textContent=st.lang==='ru'?'Смотреть каталог':'Дивитися каталог';
  if(hg)hg.textContent=st.lang==='ru'?'Подбор по целям':'Підбір за цілями';
}
var BRANDS=[['bandini','Bandini'],['aldous','Aldous'],['yamamoto','Yamamoto'],['philautia','Philautia']];
var FORMS=[['cap',{uk:'Капсули',ru:'Капсулы'}],['tab',{uk:'Таблетки',ru:'Таблетки'}],['gum',{uk:'Цукерки',ru:'Конфеты'}],['pow',{uk:'Порошок',ru:'Порошок'}],['drop',{uk:'Краплі та рідини',ru:'Капли и жидкости'}]];
var FT={uk:{brand:'Бренд',form:'Фасування',all:'Усі',reset:'Скинути фільтри'},ru:{brand:'Бренд',form:'Фасовка',all:'Все',reset:'Сбросить фильтры'}};
function passes(p,ig){
  var q=st.q.trim().toLowerCase(), cur=null; CATS.forEach(function(c){if(c.k===st.cat)cur=c});
  if(st.group!=='all'&&p.group!==st.group)return false;
  if(st.group==='all'&&cur&&cur.g.indexOf(p.group)<0)return false;
  if(ig!=='brand'&&st.brand!=='all'&&p.brand!==st.brand)return false;
  if(ig!=='form'&&st.form!=='all'&&p.form!==st.form)return false;
  if(!q)return true;
  var hay=(p.uk.name+' '+p.ru.name+' '+p.uk.pack+' '+p.ru.pack+' '+gmap[p.group].uk+' '+gmap[p.group].ru).toLowerCase();
  return q.split(/\s+/).every(function(w){return hay.indexOf(w)>=0});
}
function filtersBar(){
  var T=FT[st.lang], el=$('#filters'); if(!el)return;
  function row(key,label,opts){
    var cnt={},tot=0; C.products.forEach(function(p){if(passes(p,key)){cnt[p[key]]=(cnt[p[key]]||0)+1;tot++}});
    var h='<div class="frow2"><span class="flb">'+esc(label)+'</span><div class="subs">'+
      '<button type="button" class="sub'+(st[key]==='all'?' on':'')+'" data-f="'+key+'" data-v="all">'+esc(T.all)+' <em>'+tot+'</em></button>';
    opts.forEach(function(o){var n=cnt[o[0]]||0; if(!n&&st[key]!==o[0])return;
      h+='<button type="button" class="sub'+(st[key]===o[0]?' on':'')+'" data-f="'+key+'" data-v="'+o[0]+'">'+esc(typeof o[1]==='string'?o[1]:o[1][st.lang])+' <em>'+n+'</em></button>'});
    return h+'</div></div>';
  }
  el.innerHTML=row('brand',T.brand,BRANDS)+row('form',T.form,FORMS)+((st.brand!=='all'||st.form!=='all')?'<button type="button" class="catrst" data-freset="1">✕ '+esc(T.reset)+'</button>':'');
}
function list(){
  var arr=C.products.filter(function(p){return passes(p)});
  filtersBar();
  if(st.sort==='asc')arr=arr.slice().sort(function(a,b){return a.price-b.price});
  if(st.sort==='desc')arr=arr.slice().sort(function(a,b){return b.price-a.price});
  $('#count').textContent=t('count')+': '+arr.length;
  $('#empty').hidden=arr.length>0;
  $('#grid').innerHTML=arr.map(function(p){
    var d=L(p);
    return '<article class="card"><a class="ph" href="#p='+esc(p.id)+'" aria-label="'+esc(d.name)+'" data-e="'+esc(p.emoji||'💊')+'"><img loading="lazy" src="'+esc(p.photos[0])+'" alt="'+esc(d.name+' '+d.pack)+'"></a>'+
    '<div class="bd"><span class="grp">'+esc(gname(p.group))+'</span><h3><a href="#p='+esc(p.id)+'">'+esc(d.name)+'</a></h3><span class="pack">'+esc(d.pack)+'</span>'+
    '<div class="row"><span class="price">'+fm(p.price)+'<small> €</small></span><span class="ctl" data-ctl="'+esc(p.id)+'">'+ctl(p)+'</span></div></div>'+cmpBtn(p.id)+'</article>';
  }).join('');
}
function famBlock(p){
  var f=C.families.filter(function(f){return f.items.some(function(i){return i.id===p.id})})[0]; if(!f)return '';
  var rows=f.items.map(function(i){var q=byId[i.id]; var cur=i.id===p.id;
    var lab=esc(st.lang==='ru'?i.label_ru:i.label_uk);
    return '<tr'+(cur?' class="cur"':'')+'><td>'+(i.id===f.recommend?'⭐ ':'▫️ ')+(cur?lab+' <span class="note">('+t('cur')+')</span>':'<a href="#p='+esc(i.id)+'">'+lab+'</a>')+'</td><td><b>'+fm(q.price)+' €</b></td><td>'+money(q.price/i.days)+' € / '+(st.lang==='ru'?'день':'день')+'</td><td class="star">'+(i.id===f.recommend?t('rec'):'')+'</td></tr>'}).join('');
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
   '<div class="buyrow"><span class="price">'+fm(p.price)+' €</span><span class="ctl big" data-ctl="'+esc(p.id)+'">'+ctl(p)+'</span></div>'+'<div class="cmprow">'+cmpBtn(p.id,true)+'</div>'+
   d.desc.map(function(x){return '<p>'+esc(x)+'</p>'}).join('')+guideLinks(p)+
   '<div class="block"><h4>'+t('comp')+(d.comp_title?' — '+esc(d.comp_title.replace(/^(Склад|Состав)\s*/,'')):'')+'</h4><ul class="comp">'+comp+'</ul></div>'+
   '<div class="block"><h4>'+t('how')+'</h4><p>'+esc(d.how)+'</p>'+d.notes.map(function(x){return '<p class="note">'+esc(x)+'</p>'}).join('')+(p.weeks?'<p class="note">🗓 '+t('weeks')+': '+p.weeks+' '+t('packs')+' = '+fm(p.weeks*p.price)+' €</p>':'')+'</div>'+
   (d.warn?'<div class="block"><div class="warn">⚠️ '+esc(d.warn)+'</div></div>':'')+famBlock(p)+'</div></div>';
  var v=$('#detailView'); v.innerHTML=h; hideViews(); v.hidden=false;
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

/* ---------- РАЗДЕЛ «О ТОВАРАХ» (статьи) ---------- */
var GI=window.GUIDE_IDX||[], GCATS=[
 {k:'sport',e:'🏋️',uk:'Спорт',ru:'Спорт'},{k:'vit',e:'🍊',uk:'Вітаміни',ru:'Витамины'},{k:'min',e:'🧂',uk:'Мінерали',ru:'Минералы'},
 {k:'omega',e:'🐟',uk:'Омега-3 та жири',ru:'Омега-3 и жиры'},{k:'herb',e:'🌿',uk:'Трави та адаптогени',ru:'Травы и адаптогены'},{k:'mush',e:'🍄',uk:'Гриби',ru:'Грибы'},
 {k:'joint',e:'🦴',uk:'Суглоби, шкіра, колаген',ru:'Суставы, кожа, коллаген'},{k:'brain',e:'🧠',uk:'Нерви, сон, пам’ять',ru:'Нервы, сон, память'},
 {k:'anti',e:'🛡️',uk:'Антиоксиданти та обмін',ru:'Антиоксиданты и обмен'},{k:'gut',e:'🫶',uk:'Травлення та детокс',ru:'Пищеварение и детокс'},
 {k:'weight',e:'⚖️',uk:'Контроль ваги',ru:'Контроль веса'},{k:'women',e:'🌸',uk:'Жіноче здоров’я',ru:'Женское здоровье'},{k:'guide',e:'📘',uk:'Загальне',ru:'Общее'}];
var OWNCOV='aakg acetyl-carnitine agaricus-blazei ala apple-vinegar arginine-citrulline ashwagandha astaxanthin b-vitamins bcaa-211 bcaa-sport berberine beta-alanine beta-carotene biotin black-garlic bromelain ca-mg-zn caffeine carnitine-diet carnitine-heart cavaq10 chaga chromium cimicifuga citicoline citrulline cla collagen-bovine collagen-hyaluronic coq10 cordyceps creapure creatine creatine-hcl curcuma cyclic-dextrin d-mannose d3-k2 detox eaa energy-express evening-primrose fenugreek flaxseed-oil folic-acid forskolin gaba ginkgo glucomannan glucosamine glutamine glutathione glycine grape-seed green-coffee hemp-oil how-to-take ifos iodine iodine-selenium iron kelp kre-alkalyn krill-oil lactase lactoferrin lions-mane liposomal lutein maca maitake maltodextrin melatonin mg-bisglycinate mg-constipation mg-malate mg-memory mg-menopause mg-sleep mg-stress microbiota milk-thistle moringa msm multivitamin nac nad omega3 pea polydatin probiotic raspberry-ketone red-yeast-rice reishi selenium serenoa shiitake shilajit taurine tryptophan vitamin-a vitamin-b12 vitamin-c vitamin-c-zinc vitamin-d-deficiency vitamin-d3 vitamin-e vitamin-k2 zinc zinc-bisglycinate zma'.split(' ');
function covUrl(a){return 'covers/'+(OWNCOV.indexOf(a.s)>=0?a.s:(gcatBy[a.c]?a.c:'guide'))+'.svg'}
var gcatBy={}; GCATS.forEach(function(c){gcatBy[c.k]=c});
var gdata=null, gloading=false;
function hideViews(){['listView','detailView','guideView','articleView','compareView'].forEach(function(id){var e=$('#'+id); if(e)e.hidden=true})}
function gtitle(a){return a.t[st.lang]}
function guideLinks(p){
  var r=GI.filter(function(a){return a.p.indexOf(p.id)>=0}).slice(0,3); if(!r.length)return '';
  return '<div class="block gl">'+r.map(function(a){return '<p class="note">📖 '+t('gRead')+': <a href="#g='+esc(a.s)+'">'+esc(gtitle(a))+'</a></p>'}).join('')+'</div>';
}
function guideList(){
  hideViews(); var v=$('#guideView'); v.hidden=false; document.title=t('guide')+' — Bella Formula';
  var q=st.gq.trim().toLowerCase(), n={all:GI.length};
  GI.forEach(function(a){n[a.c]=(n[a.c]||0)+1});
  var arr=GI.filter(function(a){
    if(st.gcat!=='all'&&a.c!==st.gcat)return false;
    if(!q)return true; var hay=(a.t.uk+' '+a.t.ru+' '+a.l.uk+' '+a.l.ru).toLowerCase();
    return q.split(/\s+/).every(function(w){return hay.indexOf(w)>=0});
  });
  var h='<div class="hero"><h1>'+esc(t('gTitle'))+'</h1><p>'+esc(t('gSub'))+'</p></div>'+
   '<div class="tools"><input id="gq" type="search" autocomplete="off" placeholder="'+esc(t('gSearch'))+'" value="'+esc(st.gq)+'"></div>'+
   '<div class="chips" id="gChips"><button type="button" class="chip" data-gcat="all" aria-selected="'+(st.gcat==='all')+'">'+t('gAll')+' <em>'+n.all+'</em></button>'+
   GCATS.filter(function(c){return n[c.k]}).map(function(c){return '<button type="button" class="chip" data-gcat="'+c.k+'" aria-selected="'+(st.gcat===c.k)+'">'+esc(c.e+' '+c[st.lang])+' <em>'+n[c.k]+'</em></button>'}).join('')+'</div>'+
   '<div class="count">'+t('gCount')+': '+arr.length+'</div><div class="agrid" id="agrid">'+gcards(arr)+'</div>'+(arr.length?'':'<p class="empty">'+t('gEmpty')+'</p>');
  v.innerHTML=h; window.scrollTo(0,0);
  (function(){var c=$('#gChips'),s=c&&c.querySelector('[aria-selected=true]'); if(c&&s&&st.gcat!=='all'){c.scrollLeft=Math.max(0,s.offsetLeft-c.offsetLeft-(c.clientWidth-s.offsetWidth)/2)}})();
  var qi=$('#gq'); qi.addEventListener('input',function(e){st.gq=e.target.value; var pos=e.target.selectionStart; guideCards()});
}
function gcards(arr){
  return arr.map(function(a){var c=gcatBy[a.c]||{e:'📘',uk:'',ru:''}, p0=byId[a.p[0]];
    return '<a class="acard" href="#g='+esc(a.s)+'"><span class="ph cv" data-e="'+esc(c.e)+'"><img loading="lazy" src="'+esc(covUrl(a))+'" alt=""></span>'+
    '<span class="ab"><span class="grp">'+esc(c.e+' '+c[st.lang])+'</span><b>'+esc(gtitle(a))+'</b><span class="al">'+esc(a.l[st.lang])+'</span><span class="more">'+t('gMore')+'</span></span></a>'}).join('');
}
function guideCards(){
  var q=st.gq.trim().toLowerCase();
  var arr=GI.filter(function(a){
    if(st.gcat!=='all'&&a.c!==st.gcat)return false;
    if(!q)return true; var hay=(a.t.uk+' '+a.t.ru+' '+a.l.uk+' '+a.l.ru).toLowerCase();
    return q.split(/\s+/).every(function(w){return hay.indexOf(w)>=0});
  });
  $('#agrid').innerHTML=gcards(arr);
  var c=document.querySelector('#guideView .count'); if(c)c.textContent=t('gCount')+': '+arr.length;
  var em=document.querySelector('#guideView .empty'); if(em)em.hidden=arr.length>0;
}
function loadGuide(cb,fail){
  if(window.GUIDE_DATA){cb();return}
  var s=document.createElement('script'); s.src='guide_data.js'; s.onload=cb; s.onerror=fail; document.head.appendChild(s);
}
function article(slug){
  var a=null; GI.forEach(function(x){if(x.s===slug)a=x}); if(!a){location.hash='#guide';return}
  hideViews(); var v=$('#articleView'); v.hidden=false; v.innerHTML='<button class="back" id="gBack">'+t('gBack')+'</button><p class="note">'+t('gLoading')+'</p>';
  $('#gBack').onclick=gBack; window.scrollTo(0,0); document.title=gtitle(a)+' — Bella Formula';
  loadGuide(function(){
    if(location.hash!=='#g='+slug&&location.hash!=='#g='+encodeURIComponent(slug))return;
    var d=(window.GUIDE_DATA||{})[slug]; if(!d){v.innerHTML='<button class="back" id="gBack">'+t('gBack')+'</button><p class="note">'+t('gErr')+'</p>';$('#gBack').onclick=gBack;return}
    var L2=st.lang, c=gcatBy[a.c]||{e:'📘',uk:'',ru:''};
    var secs=d.s.map(function(s){
      return '<h3>'+esc(s['h_'+L2])+'</h3>'+(s['p_'+L2]||[]).map(function(x){return '<p>'+esc(x)+'</p>'}).join('')+
        ((s['ul_'+L2]&&s['ul_'+L2].length)?'<ul>'+s['ul_'+L2].map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>':'')}).join('');
    var rel=a.p.filter(function(id){return byId[id]}).map(function(id){var p=byId[id],dd=L(p);
      return '<a class="rcard" href="#p='+esc(id)+'"><span class="ph" data-e="'+esc(p.emoji||'💊')+'"><img loading="lazy" src="'+esc(p.photos[0])+'" alt=""></span><span class="rb"><b>'+esc(dd.name)+'</b><span class="pack">'+esc(dd.pack)+'</span></span></a>'}).join('');
    v.innerHTML='<button class="back" id="gBack">'+t('gBack')+'</button><article class="art"><img class="acover" src="'+esc(covUrl(a))+'" alt=""><span class="grp">'+esc(c.e+' '+c[L2])+'</span><h2>'+esc(d['title_'+L2])+'</h2><p class="lead">'+esc(d['lead_'+L2])+'</p>'+secs+
      '<div class="block"><div class="warn">⚠️ '+esc(d['warn_'+L2])+'</div></div>'+
      (rel?'<div class="block"><h4>'+t('gRelated')+'</h4><div class="rel">'+rel+'</div></div>':'')+'</article>';
    $('#gBack').onclick=gBack; window.scrollTo(0,0);
  },function(){v.innerHTML='<button class="back" id="gBack">'+t('gBack')+'</button><p class="note">'+t('gErr')+'</p>';$('#gBack').onclick=gBack});
}
function gBack(){ if(history.length>1&&document.referrer.indexOf(location.host)>=0){history.back()}else{location.hash='#guide'} }

/* ---------- СРАВНЕНИЕ ТОВАРОВ ---------- */
var CT={uk:{add:'Порівняти',inn:'У порівнянні',title:'Порівняння товарів',empty:'Порівняння порожнє. Додайте товари кнопкою ⚖️ у каталозі.',one:'Додайте ще хоча б один товар, щоб порівняти.',onlyDiff:'Лише відмінності',more:'+ Додати ще товар',clear:'Очистити',max:'Можна порівнювати до 4 товарів',added:'Додано до порівняння',open:'Відкрити',removed:'Прибрано з порівняння',back:'← До каталогу',price:'Ціна',ppd:'Ціна за день',cat:'Категорія',pack:'Фасування',days:'Вистачить на',comp:'Склад на добову норму',how:'Як приймати',rm:'Прибрати',d:'дн.',same:'Однакові значення приховано',btn:'Порівняння'},
ru:{add:'Сравнить',inn:'В сравнении',title:'Сравнение товаров',empty:'Сравнение пусто. Добавьте товары кнопкой ⚖️ в каталоге.',one:'Добавьте ещё хотя бы один товар, чтобы сравнить.',onlyDiff:'Только отличия',more:'+ Добавить ещё товар',clear:'Очистить',max:'Можно сравнивать до 4 товаров',added:'Добавлено в сравнение',open:'Открыть',removed:'Убрано из сравнения',back:'← В каталог',price:'Цена',ppd:'Цена за день',cat:'Категория',pack:'Фасовка',days:'Хватит на',comp:'Состав на суточную норму',how:'Как принимать',rm:'Убрать',d:'дн.',same:'Одинаковые значения скрыты',btn:'Сравнение'}};
function ct(k){return CT[st.lang][k]}
var CMP_MAX=4, cmp=[], cmpDiff=false;
try{var rc=JSON.parse(localStorage.getItem('bf_cmp')||'[]'); if(Array.isArray(rc))cmp=rc.filter(function(id,i){return byId[id]&&rc.indexOf(id)===i}).slice(0,CMP_MAX)}catch(e){}
function saveCmp(){try{localStorage.setItem('bf_cmp',JSON.stringify(cmp))}catch(e){}}
function cmpBtn(id,big){var on=cmp.indexOf(id)>=0;
  return '<button type="button" class="cmpb'+(big?' big':'')+(on?' on':'')+'" data-cmp="'+esc(id)+'" aria-pressed="'+on+'" aria-label="'+esc(on?ct('inn'):ct('add'))+'" title="'+esc(on?ct('inn'):ct('add'))+'">⚖️'+(big?' <span>'+esc(on?ct('inn'):ct('add'))+'</span>':'')+'</button>'}
function toast(msg,link){
  var e=$('#toast'); if(!e){e=document.createElement('div');e.id='toast';e.className='toast';e.setAttribute('role','status');document.body.appendChild(e)}
  e.innerHTML='<span>'+esc(msg)+'</span>'+(link?' <a href="#compare">'+esc(ct('open'))+'</a>':''); e.classList.add('show');
  clearTimeout(toast.t); toast.t=setTimeout(function(){e.classList.remove('show')},3200)}
function cmpChanged(){
  var n=cmp.length,b=$('#cmpN'),bt=$('#cmpBtn'); if(b){b.textContent=n} if(bt){bt.hidden=!n;bt.setAttribute('aria-label',ct('btn'))}
  document.querySelectorAll('[data-cmp]').forEach(function(e){var id=e.getAttribute('data-cmp'),on=cmp.indexOf(id)>=0;
    if(e.classList.contains('cmpb')){e.classList.toggle('on',on);e.setAttribute('aria-pressed',on);var s=e.querySelector('span');if(s)s.textContent=on?ct('inn'):ct('add');e.title=on?ct('inn'):ct('add');e.setAttribute('aria-label',e.title)}});
  var v=$('#compareView'); if(v&&!v.hidden)compareView();
}
function toggleCmp(id){
  var i=cmp.indexOf(id);
  if(i>=0){cmp.splice(i,1);saveCmp();cmpChanged();toast(ct('removed'));return}
  if(cmp.length>=CMP_MAX){toast(ct('max'));return}
  cmp.push(id);saveCmp();cmpChanged();toast(ct('added'),true)
}
function daysOf(p){
  var f=C.families.filter(function(f){return f.items.some(function(i){return i.id===p.id})})[0];
  if(f){var it=f.items.filter(function(i){return i.id===p.id})[0]; if(it&&it.days)return it.days}
  if(p.days)return p.days;
  var m=/(?:хватит на|вистачить на)\s*(\d+)\s*(?:дн|день)/.exec(p.ru.how+' '+p.uk.how); return m?+m[1]:null
}
function compareView(){
  hideViews(); var v=$('#compareView'); v.hidden=false; document.title=ct('title')+' — Bella Formula';
  var ps=cmp.map(function(id){return byId[id]}).filter(Boolean);
  if(!ps.length){v.innerHTML='<button class="back" id="cmpBack">'+ct('back')+'</button><div class="hero"><h1>'+esc(ct('title'))+'</h1><p>'+esc(ct('empty'))+'</p></div>';return}
  var rows=[
   {k:'price',f:function(p){return fm(p.price)+' €'}},
   {k:'ppd',f:function(p){var d=daysOf(p);return d?money(p.price/d)+' € / '+ct('d').replace('.','')+'':'—'},raw:function(p){var d=daysOf(p);return d?String(p.price/d):'—'}},
   {k:'cat',f:function(p){return gname(p.group)}},
   {k:'pack',f:function(p){return L(p).pack}},
   {k:'days',f:function(p){var d=daysOf(p);return d?d+' '+ct('d'):'—'}},
   {k:'comp',f:function(p){return L(p).comp.map(function(x){return x.replace(/^💊\s*/,'')}).join('\n')},list:true},
   {k:'how',f:function(p){return L(p).how}}];
  var head='<tr><th class="rl"></th>'+ps.map(function(p){var d=L(p);
    return '<th class="pc"><button type="button" class="rm" data-cmp="'+esc(p.id)+'" aria-label="'+esc(ct('rm'))+'" title="'+esc(ct('rm'))+'">×</button><a class="cph" href="#p='+esc(p.id)+'"><img src="'+esc(p.photos[0])+'" alt=""></a><a class="cnm" href="#p='+esc(p.id)+'">'+esc(d.name)+'</a><span class="ctl" data-ctl="'+esc(p.id)+'">'+ctl(p)+'</span></th>'}).join('')+'</tr>';
  var body=rows.map(function(r){
    var vals=ps.map(function(p){return r.f(p)}), keys=ps.map(function(p){return r.raw?r.raw(p):r.f(p)});
    var diff=ps.length>1&&keys.some(function(x){return x!==keys[0]});
    if(cmpDiff&&!diff&&ps.length>1)return '';
    return '<tr class="'+(diff?'diff':'same')+'"><th class="rl">'+esc(ct(r.k))+'</th>'+vals.map(function(x){
      return '<td>'+(r.list?'<ul>'+x.split('\n').map(function(l){return '<li>'+esc(l)+'</li>'}).join('')+'</ul>':esc(x))+'</td>'}).join('')+'</tr>'}).join('');
  v.innerHTML='<button class="back" id="cmpBack">'+ct('back')+'</button><div class="hero"><h1>'+esc(ct('title'))+'</h1></div>'+
   '<div class="cmptools"><label class="chk"><input type="checkbox" id="cmpDiff"'+(cmpDiff?' checked':'')+'> '+esc(ct('onlyDiff'))+'</label>'+
   (cmp.length<CMP_MAX?'<button type="button" class="pill ghost" id="cmpMore">'+esc(ct('more'))+'</button>':'')+'<button type="button" class="pill ghost" id="cmpClear">'+esc(ct('clear'))+'</button></div>'+
   (ps.length<2?'<p class="note">'+esc(ct('one'))+'</p>':'')+
   '<div class="cmpwrap"><table class="cmpt" style="--n:'+ps.length+'"><thead>'+head+'</thead><tbody>'+body+'</tbody></table></div>'+
   (cmpDiff&&ps.length>1?'<p class="note">'+esc(ct('same'))+'</p>':'');
  window.scrollTo(0,0);
}
document.addEventListener('change',function(e){if(e.target&&e.target.id==='cmpDiff'){cmpDiff=e.target.checked;var y=window.scrollY;compareView();window.scrollTo(0,y)}});

var lastY=0, prevHash='', cmpBackTo='', restoreY=false;
function route(){
  galNav=null;
  var lv=$('#listView'); if(lv&&!lv.hidden)lastY=window.scrollY;
  if(location.hash==='#compare'&&prevHash!=='#compare')cmpBackTo=prevHash;
  prevHash=location.hash;
  var m=/^#p=(.+)$/.exec(location.hash), g=/^#g=(.+)$/.exec(location.hash);
  if(m){detail(decodeURIComponent(m[1]));}
  else if(g){article(decodeURIComponent(g[1]))}
  else if(location.hash==='#guide'){guideList()}
  else if(location.hash==='#compare'){compareView()}
  else{hideViews();$('#listView').hidden=false;document.title='Bella Formula — '+t('tagline');
    if(restoreY){restoreY=false;var y=lastY;window.scrollTo({top:y,behavior:'instant'});setTimeout(function(){window.scrollTo({top:y,behavior:'instant'})},60)}}
}
function all(){applyStatic();catbar();list();route();cartChanged();cmpChanged();if(!$('#drawer').hidden)renderDrawer()}

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
  a=el.closest('[data-cmp]'); if(a){toggleCmp(a.getAttribute('data-cmp'));return}
  if(el.closest('#cmpBtn')){location.hash='#compare';return}
  if(el.closest('#cmpBack')||el.closest('#cmpMore')){if(/^#p=/.test(cmpBackTo)){location.hash=cmpBackTo}else{restoreY=true;location.hash=''}return}
  if(el.closest('#cmpClear')){cmp=[];saveCmp();cmpChanged();return}
  if(el.closest('#cartBtn')){openCart();return}
  if(el.closest('#drawerClose')||el.closest('#veil')||el.closest('[data-closecart]')){closeCart();return}
  if(el.closest('#clearCart')){cart={};saveCart();cartChanged();return}
  if(el.closest('#copyOrder')){var b=el.closest('#copyOrder');copyText(orderText(),function(){b.textContent=t('copied');setTimeout(function(){b.textContent=t('copy')},1800)});return}
  a=el.closest('#goOrder'); if(a){ if(a.getAttribute('data-long')){copyText(orderText(),function(){var n=$('#cartNote');if(n)n.textContent=t('longHint')})} return}
  if(el.closest('#catBtn')){st.open=!st.open;catbar();return}
  if(el.closest('#heroCatalog')){
    st.cat='all';st.group='all';st.open=false;catbar();list();
    var tw=$('#tools')||$('#q'); if(tw)tw.scrollIntoView({behavior:'smooth',block:'start'});
    return;
  }
  if(el.closest('#heroGoals')){
    st.open=true;catbar();
    var cw=$('#catWrap'); if(cw)cw.scrollIntoView({behavior:'smooth',block:'start'});
    return;
  }
  a=el.closest('[data-gcat]'); if(a){st.gcat=a.getAttribute('data-gcat');guideList();return}
  a=el.closest('[data-cat]'); if(a){st.cat=a.getAttribute('data-cat');st.group='all';st.open=false;catbar();list();
    var w=$('#catWrap'); if(w&&w.getBoundingClientRect().top<0)w.scrollIntoView({block:'start'}); return}
  a=el.closest('[data-f]'); if(a){st[a.getAttribute('data-f')]=a.getAttribute('data-v');list();return}
  if(el.closest('[data-freset]')){st.brand='all';st.form='all';list();return}
  a=el.closest('[data-grp]'); if(a){st.group=a.getAttribute('data-grp');catbar();list();return}
  if(st.open&&!el.closest('#catWrap')){st.open=false;catbar()}
  var l=el.closest('.lang button'); if(l){st.lang=l.getAttribute('data-lang');try{localStorage.setItem('bf_lang',st.lang)}catch(x){} all()}
});
document.addEventListener('submit',function(e){if(e.target.id==='orderForm'){e.preventDefault();submitOrder()}});
document.addEventListener('input',function(e){var i=e.target.id; if(i==='fName')form.name=e.target.value; else if(i==='fContact')form.contact=e.target.value; else if(i==='fComment')form.comment=e.target.value});
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

/* theme toggle */
(function(){
  var b=document.getElementById('themeBtn'),root=document.documentElement;
  var m=document.querySelector('meta[name=theme-color]');
  function apply(d){
    if(d)root.setAttribute('data-theme','dark');else root.removeAttribute('data-theme');
    if(b){b.textContent=d?'☀️':'🌙';b.setAttribute('aria-pressed',d?'true':'false')}
    if(m)m.setAttribute('content',d?'#121A16':'#F7F4EE');
  }
  apply(root.getAttribute('data-theme')==='dark');
  try{var mq=matchMedia('(prefers-color-scheme: dark)');var fn=function(e){var s=null;try{s=localStorage.getItem('bf_theme')}catch(x){}if(!s)apply(e.matches)};mq.addEventListener?mq.addEventListener('change',fn):mq.addListener&&mq.addListener(fn)}catch(e){}
  if(b)b.addEventListener('click',function(){
    var d=root.getAttribute('data-theme')!=='dark';apply(d);
    try{localStorage.setItem('bf_theme',d?'dark':'light')}catch(e){}
  });
})();
