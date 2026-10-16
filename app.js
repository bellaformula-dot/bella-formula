(function(){
'use strict';
var C=window.CATALOG, TG='https://t.me/AresLuminis';
var T={
 uk:{tagline:'БАДи та вітаміни з Італії',h1:'Спортивне харчування та вітаміни з Італії',sub:'Склад, дозування й ціни — все на одній сторінці. Для замовлення натисніть «Купити» — відкриється чат у Telegram з готовим повідомленням.',
  search:'Пошук за назвою…',all:'Усі',count:'Товарів',buy:'Купити',back:'← До каталогу',channel:'Telegram-канал',empty:'Нічого не знайдено. Спробуйте інший запит.',
  sortDef:'За замовчуванням',sortAsc:'Спочатку дешевші',sortDesc:'Спочатку дорожчі',comp:'Склад',how:'Як приймати',warn:'Застереження',pack:'Порівняння упаковок',perDay:'за день',rec:'найвигідніше',cur:'ця',
  recLine:'Чим менша упаковка, тим дорожчий кожен день прийому. Рекомендуємо:',best:'Це найвигідніша упаковка в лінійці.',weeks:'На 12 тижнів прийому',packs:'уп.',
  disclaimer:'Харчові добавки не є лікарськими засобами. Не замінюють різноманітне харчування. Перед застосуванням проконсультуйтеся з лікарем. Зображення та склад — за даними виробника.',ask:'Питання та замовлення — у Telegram',from:'з Італії',ph:'Фото'},
 ru:{tagline:'БАДы и витамины из Италии',h1:'Спортивное питание и витамины из Италии',sub:'Состав, дозировки и цены — всё на одной странице. Для заказа нажмите «Купить» — откроется чат в Telegram с готовым сообщением.',
  search:'Поиск по названию…',all:'Все',count:'Товаров',buy:'Купить',back:'← В каталог',channel:'Telegram-канал',empty:'Ничего не найдено. Попробуйте другой запрос.',
  sortDef:'По умолчанию',sortAsc:'Сначала дешевле',sortDesc:'Сначала дороже',comp:'Состав',how:'Как принимать',warn:'Предупреждения',pack:'Сравнение упаковок',perDay:'в день',rec:'самая выгодная',cur:'эта',
  recLine:'Чем меньше упаковка, тем дороже каждый день приёма. Рекомендуем:',best:'Это самая выгодная упаковка в линейке.',weeks:'На 12 недель приёма',packs:'уп.',
  disclaimer:'Пищевые добавки не являются лекарственными средствами. Не заменяют разнообразное питание. Перед применением проконсультируйтесь с врачом. Изображения и состав — по данным производителя.',ask:'Вопросы и заказ — в Telegram',from:'из Италии',ph:'Фото'}
};
var st={lang:'uk',group:'all',q:'',sort:'def'};
try{var sl=localStorage.getItem('bf_lang'); if(sl==='uk'||sl==='ru') st.lang=sl; else if(/^ru/i.test(navigator.language||'')) st.lang='ru';}catch(e){}
var $=function(s){return document.querySelector(s)};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function t(k){return T[st.lang][k]}
var byId={}; C.products.forEach(function(p){byId[p.id]=p});
var gmap={}; C.groups.forEach(function(g){gmap[g.key]=g});
function gname(k){var g=gmap[k];return g.emoji+' '+g[st.lang]}
function buyUrl(p){return TG+'?text='+encodeURIComponent(st.lang==='ru'?p.order_ru:p.order_uk)}
function money(n){return (Math.round(n*100)/100).toFixed(2).replace('.',',')}
function L(p){return p[st.lang]}

function applyStatic(){
  document.documentElement.lang=st.lang;
  document.querySelectorAll('[data-i]').forEach(function(e){e.textContent=t(e.getAttribute('data-i'))});
  $('#q').placeholder=t('search');
  $('#tgChannel').textContent='✈️ '+t('channel');
  document.title='Bella Formula — '+t('tagline');
  document.querySelectorAll('.lang button').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-lang')===st.lang)});
  var s=$('#sort'); s.innerHTML='<option value="def">'+t('sortDef')+'</option><option value="asc">'+t('sortAsc')+'</option><option value="desc">'+t('sortDesc')+'</option>'; s.value=st.sort;
}
function chips(){
  var counts={all:C.products.length}; C.products.forEach(function(p){counts[p.group]=(counts[p.group]||0)+1});
  var h='<button class="chip" role="tab" data-g="all" aria-selected="'+(st.group==='all')+'">'+t('all')+'<em>'+counts.all+'</em></button>';
  C.groups.forEach(function(g){ if(!counts[g.key])return;
    h+='<button class="chip" role="tab" data-g="'+g.key+'" aria-selected="'+(st.group===g.key)+'">'+esc(g.emoji+' '+g[st.lang])+'<em>'+counts[g.key]+'</em></button>'});
  $('#chips').innerHTML=h;
}
function list(){
  var q=st.q.trim().toLowerCase();
  var arr=C.products.filter(function(p){
    if(st.group!=='all'&&p.group!==st.group)return false;
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
    return '<article class="card"><a class="ph" href="#p='+esc(p.id)+'" aria-label="'+esc(d.name)+'"><img loading="lazy" src="'+esc(p.photos[0])+'" alt="'+esc(d.name+' '+d.pack)+'"></a>'+
    '<div class="bd"><span class="grp">'+esc(gname(p.group))+'</span><h3><a href="#p='+esc(p.id)+'">'+esc(d.name)+'</a></h3><span class="pack">'+esc(d.pack)+'</span>'+
    '<div class="row"><span class="price">'+p.price+'<small> €</small></span><a class="pill" target="_blank" rel="noopener" href="'+buyUrl(p)+'">'+t('buy')+'</a></div></div></article>';
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
function detail(id){
  var p=byId[id]; if(!p){location.hash='';return}
  var d=L(p), ph=p.photos, N=p.strip?p.n:ph.length;
  function bg(i){return 'background-image:url('+p.strip+');background-size:100% '+(N*100)+'%;background-position:0 '+(N>1?i*100/(N-1):0)+'%'}
  var comp=d.comp.map(function(x){return '<li>'+esc(x)+'</li>'}).join('');
  var h='<button class="back" id="backBtn">'+t('back')+'</button><div class="detail"><div class="gal"><div class="main">'+(p.strip?'<div id="mainImg" class="fr" role="img" aria-label="'+esc(d.name+' '+d.pack)+'" style="'+bg(0)+'"></div>':'<img id="mainImg" src="'+esc(ph[0])+'" alt="'+esc(d.name+' '+d.pack)+'">')+'</div>'+
   (N>1?'<div class="thumbs">'+Array.apply(null,Array(N)).map(function(_,i){return '<button type="button" data-i="'+i+'" aria-current="'+(i===0)+'" aria-label="'+t('ph')+' '+(i+1)+'">'+(p.strip?'<span class="fr" style="'+bg(i)+'"></span>':'<img src="'+esc(ph[i])+'" alt="">')+'</button>'}).join('')+'</div>':'')+'</div>'+
   '<div class="info"><span class="grp" style="color:var(--terra);font-weight:600;font-size:13px">'+esc(gname(p.group))+'</span><h2>'+esc(d.name)+'</h2><div class="pack">'+esc(d.pack)+' · '+t('from')+' 🇮🇹</div>'+
   '<div class="buyrow"><span class="price">'+p.price+' €</span><a class="pill" target="_blank" rel="noopener" href="'+buyUrl(p)+'">'+t('buy')+'</a></div>'+
   d.desc.map(function(x){return '<p>'+esc(x)+'</p>'}).join('')+
   '<div class="block"><h4>'+t('comp')+(d.comp_title?' — '+esc(d.comp_title.replace(/^(Склад|Состав)\s*/,'')):'')+'</h4><ul class="comp">'+comp+'</ul></div>'+
   '<div class="block"><h4>'+t('how')+'</h4><p>'+esc(d.how)+'</p>'+d.notes.map(function(x){return '<p class="note">'+esc(x)+'</p>'}).join('')+(p.weeks?'<p class="note">🗓 '+t('weeks')+': '+p.weeks+' '+t('packs')+' = '+(p.weeks*p.price)+' €</p>':'')+'</div>'+
   (d.warn?'<div class="block"><div class="warn">⚠️ '+esc(d.warn)+'</div></div>':'')+famBlock(p)+'</div></div>';
  var v=$('#detailView'); v.innerHTML=h; v.hidden=false; $('#listView').hidden=true;
  document.title=d.name+' — Bella Formula';
  window.scrollTo(0,0);
  $('#backBtn').onclick=function(){ if(history.length>1&&document.referrer.indexOf(location.host)>=0){history.back()}else{location.hash=''} };
  v.querySelectorAll('.thumbs button').forEach(function(b){b.onclick=function(){var i=+b.getAttribute('data-i');if(p.strip){$('#mainImg').setAttribute('style',bg(i))}else{$('#mainImg').src=ph[i]};v.querySelectorAll('.thumbs button').forEach(function(x){x.setAttribute('aria-current',x===b)})}});
}
function route(){
  var m=/^#p=(.+)$/.exec(location.hash);
  if(m){detail(decodeURIComponent(m[1]));}
  else{$('#detailView').hidden=true;$('#listView').hidden=false;document.title='Bella Formula — '+t('tagline')}
}
function all(){applyStatic();chips();list();route()}
document.addEventListener('click',function(e){
  var c=e.target.closest('.chip'); if(c){st.group=c.getAttribute('data-g');chips();list();return}
  var l=e.target.closest('.lang button'); if(l){st.lang=l.getAttribute('data-lang');try{localStorage.setItem('bf_lang',st.lang)}catch(x){} all()}
});
$('#q').addEventListener('input',function(e){st.q=e.target.value;list()});
$('#sort').addEventListener('change',function(e){st.sort=e.target.value;list()});
$('#brand').addEventListener('click',function(e){e.preventDefault();location.hash='';window.scrollTo(0,0)});
window.addEventListener('hashchange',route);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&location.hash){location.hash=''}});
all();
})();
