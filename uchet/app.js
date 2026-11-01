(function(){
'use strict';
const $=(s,r)=> (r||document).querySelector(s);
const $$=(s,r)=> Array.from((r||document).querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>{if(v===''||v==null)return NaN;const n=parseFloat(String(v).replace(/\s/g,'').replace(',','.'));return isNaN(n)?NaN:n};
const r2=n=>Math.round(n*100)/100;
const eur=v=>(v===''||v==null||isNaN(v))?'—':Number(v).toLocaleString('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

let CFG=null;try{CFG=JSON.parse(ls.get('bf_cfg')||'null')}catch(e){}
let DB=null;
let UI={prod:{q:'',brand:'',cat:'',act:'1',page:0,sort:'article'},tab:{prices:'excel'},rateMsg:''};

/* ---------- API ---------- */
let pending=0,lastErr='';
function stat(){const s=$('#stat');if(!s)return;
 if(lastErr){s.className='stat err';s.style.display='';s.textContent='⚠ '+lastErr+' (нажми, чтобы скрыть)';}
 else if(pending){s.className='stat';s.style.display='';s.textContent='Сохраняю…';}
 else{s.style.display='none';}}
async function api(body){
 if(!CFG)throw new Error('Не подключено');
 pending++;stat();
 try{
  const res=await fetch(CFG.url,{method:'POST',body:JSON.stringify(Object.assign({pw:CFG.pw},body))});
  const j=await res.json();
  if(!j.ok)throw new Error(j.error==='auth'?'Неверный пароль':j.error||'Ошибка сервера');
  return j;
 }catch(e){
  lastErr=e.message==='Failed to fetch'?'Нет связи со скриптом (проверь интернет и адрес)':e.message;throw e;
 }finally{pending--;stat();}
}
document.addEventListener('click',e=>{if(e.target.id==='stat'&&lastErr){lastErr='';stat();}});
async function loadAll(){const j=await api({action:'getAll'});DB=j.data;return DB}
async function save(sheet,rows){
 if(!Array.isArray(rows))rows=[rows];
 const t=DB[sheet];
 rows.forEach(o=>{const i=t.findIndex(x=>x.id===o.id);if(i<0)t.push(o);else Object.assign(t[i],o)});
 try{await api({action:'save',sheet,rows});lastErr='';}catch(e){toast('Не сохранилось: '+e.message,1)}
}
async function removeIds(sheet,ids){
 DB[sheet]=DB[sheet].filter(x=>!ids.includes(x.id));
 try{await api({action:'remove',sheet,ids})}catch(e){}
}
function toast(m,bad){lastErr=bad?m:'';stat();if(!bad){const s=$('#stat');s.className='stat';s.style.display='';s.textContent=m;setTimeout(()=>{if(!pending&&!lastErr)stat()},2500)}}

/* ---------- Dialog ---------- */
function dlg(html,onMount){const d=$('#dlg');d.innerHTML=html;if(!d.open)d.showModal();if(onMount)onMount(d);return d}
function closeDlg(){const d=$('#dlg');if(d.open)d.close()}

/* ---------- Settings ---------- */
function setting(k,def){const r=DB&&DB.settings.find(x=>x.id===k);return r?r.value:(def||'')}
async function setSetting(k,v){await save('settings',{id:k,value:String(v)})}

/* ---------- Layout ---------- */
const MENU=[['home','Главная'],['orders','Заказы клиентов'],['sales','Продажи'],['purchases','Приходы'],['products','Товары'],['clients','Клиенты'],['suppliers','Поставщики'],['trustees','Доверенные лица'],['prices','Цены'],['rates','Курсы НБУ'],['reports','Отчёты'],['settings','Настройки']];
function route(){return (location.hash||'#home').slice(1).split('/')[0]||'home'}
function shell(inner){
 let cur=route();if(cur==='order')cur='orders';if(cur==='purchase'||cur==='tobuy')cur='purchases';if(cur==='invoice')cur='sales';
 return `<div class="app"><aside class="side"><div class="logo">Bella Formula<small>УЧЁТ</small></div><nav class="nav">${
  MENU.map(([k,n,soon])=>`<a href="#${k}" class="${cur===k?'on':''} ${soon?'soon':''}"><i></i>${n}${soon?'<em>скоро</em>':''}</a>`).join('')
 }</nav></aside><main class="main">${inner}</main></div>`;
}
function render(){
 const root=$('#root');
 if(!CFG||!DB){root.innerHTML=loginView();bindLogin();return}
 const r=route();
 if(r!=='order')OD=null;if(r!=='purchase')PD=null;
 const V={home:viewHome,products:viewProducts,prices:viewPrices,rates:viewRates,settings:viewSettings,orders:viewOrders,order:viewOrder,purchases:viewPurchases,purchase:viewPurchase,tobuy:viewToBuy,sales:viewSales,invoice:viewInvoice,reports:viewReports,clients:viewClients,suppliers:viewSuppliers,trustees:viewTrustees}[r];
 if(!V){root.innerHTML=shell(`<h1>${esc((MENU.find(m=>m[0]===r)||[0,'Раздел'])[1])}</h1><div class="card empty">Этот раздел появится на следующем этапе.</div>`);return}
 root.innerHTML=shell(V.html());
 if(V.bind)V.bind();
}
window.addEventListener('hashchange',render);

/* ---------- Login ---------- */
function loginView(){return `<div style="max-width:480px;margin:8vh auto;padding:0 16px"><div class="card">
 <div class="logo" style="margin:0 0 4px">Bella Formula<small>УЧЁТ</small></div>
 <p class="sub">Подключение к Google Таблице</p>
 <div class="f"><label>Адрес скрипта (Web app URL)</label><input id="lu" type="text" value="${esc(CFG?CFG.url:'')}" placeholder="https://script.google.com/macros/s/…/exec"></div><br>
 <div class="f"><label>Пароль</label><input id="lp" type="password" value="${esc(CFG?CFG.pw:'')}"></div>
 <div id="lm"></div><br><button class="btn p" id="lb">Войти</button></div></div>`}
function bindLogin(){
 const go=async()=>{
  const url=$('#lu').value.trim(),pw=$('#lp').value;
  if(!url||!pw){$('#lm').innerHTML='<div class="msg err">Заполни оба поля</div>';return}
  CFG={url,pw};$('#lb').disabled=true;$('#lm').innerHTML='<div class="msg">Подключаюсь…</div>';
  try{await loadAll();ls.set('bf_cfg',JSON.stringify(CFG));lastErr='';render();}
  catch(e){DB=null;$('#lb').disabled=false;$('#lm').innerHTML='<div class="msg err">'+esc(lastErr||e.message)+'</div>';lastErr='';stat();}
 };
 $('#lb').onclick=go;$('#lp').onkeydown=e=>{if(e.key==='Enter')go()};
}

/* ---------- NBU rates ---------- */
function rateFor(date){ // самый свежий курс на дату или раньше
 let best=null;DB.rates.forEach(r=>{if(r.date<=date&&(!best||r.date>best.date))best=r});return best}
async function fetchNbu(date){
 const d=date.replace(/-/g,'');
 const res=await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=EUR&date='+d+'&json');
 const j=await res.json();
 if(!j||!j[0]||!j[0].rate)throw new Error('нет данных');
 return +j[0].rate;
}
async function loadRate(date){
 const ex=DB.rates.find(r=>r.date===date&&r.source==='НБУ');if(ex)return ex;
 const v=await fetchNbu(date);
 const row={id:'r'+date.replace(/-/g,''),date,eur:v,source:'НБУ'};
 await save('rates',row);return row;
}

/* ---------- Home ---------- */
const viewHome={html(){
 const p=DB.products,act=p.filter(x=>x.active!=='0');
 const noBuy=act.filter(x=>x.buy_eur===''||isNaN(x.buy_eur)).length;
 const last=DB.rates.slice().sort((a,b)=>b.date<a.date?-1:1)[0];
 return `<h1>Главная</h1><div class="sub">Обзор базы</div>
 <div class="grid g4">
  <div class="card kpi"><b>${act.length}</b><span>товаров в справочнике</span></div>
  <div class="card kpi"><b>${noBuy}</b><span>без закупочной цены</span></div>
  <div class="card kpi"><b>${last?last.eur.toFixed(4):'—'}</b><span>последний курс EUR${last?' ('+esc(last.date)+')':''}</span></div>
  <div class="card kpi"><b>${DB.price_history.length?DB.price_history.length:0}</b><span>записей в истории цен</span></div>
 </div>
 ${noBuy?`<div class="msg warn">У ${noBuy} товаров не указана закупочная цена — без неё не посчитать наценку. Заполни в разделе «Товары» или загрузи из Excel («Цены»).</div>`:''}
 ${!p.length?`<div class="msg">Справочник пуст. Загрузи товары: «Настройки» → «Первый импорт товаров с сайта».</div>`:''}
 <div class="card"><h2>Заказы в работе: ${DB.orders.filter(o=>o.status!=='done'&&o.status!=='cancel').length}</h2>${ST.filter(s=>s[0]!=='done'&&s[0]!=='cancel').map(s=>{const n=DB.orders.filter(o=>(o.status||'new')===s[0]).length;return n?`<a href="#orders" class="tag ${s[0]==='new'?'y':''}" style="margin:0 6px 6px 0;text-decoration:none">${s[1]}: ${n}</a>`:''}).join('')||'<div class="note">Пока нет. Создай заказ в разделе «Заказы клиентов».</div>'}</div>
 ${DB.orders.some(o=>o.status==='paid')?`<div class="msg warn">Оплаченных заказов без прихода: <b>${DB.orders.filter(o=>o.status==='paid').length}</b>. <a href="#tobuy">Открыть «К закупке»</a></div>`:''}
 <div class="card"><h2>Что дальше</h2><div class="note">Прибыль по периодам, товарам, брендам и клиентам — в разделе «Отчёты».</div></div>`},bind(){}};

/* ---------- Products ---------- */
function prodList(){
 const u=UI.prod,q=u.q.trim().toLowerCase();
 let a=DB.products.filter(p=>(u.act==='all'||(u.act==='1'?p.active!=='0':p.active==='0'))
  &&(!u.brand||p.brand===u.brand)&&(!u.cat||p.category===u.cat)
  &&(!q||(p.name_ru+' '+p.name_uk+' '+p.article+' '+p.brand).toLowerCase().includes(q)));
 const k=u.sort;
 a.sort((x,y)=>{const A=x[k],B=y[k];if(typeof A==='number'||typeof B==='number'){return (isNaN(A)||A===''?-1e9:A)-(isNaN(B)||B===''?-1e9:B)}return String(A).localeCompare(String(B),'ru',{numeric:true})});
 return a;
}
function profit(p){const b=p.buy_eur,s=p.sell_eur;if(b===''||b==null||isNaN(b)||s===''||s==null||isNaN(s))return '<span class="mut">—</span>';return eur(r2(s-b))}
function margin(p){const b=p.buy_eur,s=p.sell_eur;if(b===''||b==null||isNaN(b)||!b||s===''||isNaN(s))return null;return (s-b)/b*100}
const viewProducts={html(){
 const u=UI.prod,brands=[...new Set(DB.products.map(p=>p.brand))].filter(Boolean).sort(),cats=[...new Set(DB.products.map(p=>p.category))].filter(Boolean).sort();
 const list=prodList(),PS=50,pages=Math.max(1,Math.ceil(list.length/PS));if(u.page>=pages)u.page=pages-1;
 const rows=list.slice(u.page*PS,u.page*PS+PS);
 const opt=(arr,v)=>'<option value="">Все</option>'+arr.map(x=>`<option ${x===v?'selected':''}>${esc(x)}</option>`).join('');
 return `<h1>Товары</h1><div class="sub">${list.length} из ${DB.products.length}. Цены можно менять прямо в таблице — сохраняются сразу.</div>
 <div class="bar"><input type="search" id="pq" placeholder="Поиск: название, артикул…" value="${esc(u.q)}" style="width:260px">
  <select id="pb">${opt(brands,u.brand)}</select><select id="pc">${opt(cats,u.cat)}</select>
  <select id="pa"><option value="1" ${u.act==='1'?'selected':''}>Активные</option><option value="0" ${u.act==='0'?'selected':''}>Скрытые</option><option value="all" ${u.act==='all'?'selected':''}>Все</option></select>
  <span class="sp"></span><button class="btn" id="pex">Выгрузить в Excel</button><button class="btn p" id="pad">+ Товар</button></div>
 <div class="card scroll" style="padding:6px"><table><thead><tr>${[['article','Артикул'],['name_ru','Название'],['brand','Бренд'],['pack','Упаковка'],['buy_eur','Закупка €'],['sell_eur','Продажа €'],['m','Наценка'],['pr','Прибыль €']].map(([k,n])=>`<th data-s="${k}" style="cursor:pointer" class="${k==='buy_eur'||k==='sell_eur'||k==='m'||k==='pr'?'r':''}">${n}${u.sort===k?' ↓':''}</th>`).join('')}<th></th></tr></thead><tbody>
 ${rows.map(p=>{const m=margin(p);return `<tr class="${p.active==='0'?'hid':''}" data-id="${esc(p.id)}"><td class="mut">${esc(p.article)}</td><td>${esc(p.name_ru)}<div class="note">${esc(p.category)}</div></td><td>${esc(p.brand)}</td><td class="mut">${esc(p.pack)}</td>
 <td class="r"><input class="num" data-f="buy_eur" value="${p.buy_eur===''||isNaN(p.buy_eur)?'':p.buy_eur}" placeholder="—"></td>
 <td class="r"><input class="num" data-f="sell_eur" value="${p.sell_eur===''||isNaN(p.sell_eur)?'':p.sell_eur}" placeholder="—"></td>
 <td class="r m">${m==null?'<span class="mut">—</span>':`<span class="tag ${m<20?'y':''}">${m.toFixed(0)}%</span>`}</td><td class="r pr">${profit(p)}</td>
 <td class="r"><button class="btn s" data-edit="1">Изменить</button></td></tr>`}).join('')||'<tr><td colspan="9" class="empty">Ничего не найдено</td></tr>'}
 </tbody></table></div>
 <div class="pager"><button class="btn s" id="pp" ${u.page<=0?'disabled':''}>←</button><span class="mut">стр. ${u.page+1} из ${pages}</span><button class="btn s" id="pn" ${u.page>=pages-1?'disabled':''}>→</button></div>`},
bind(){
 const u=UI.prod,redo=()=>{const y=window.scrollY;render();window.scrollTo(0,y)};
 let tm;$('#pq').oninput=e=>{u.q=e.target.value;u.page=0;clearTimeout(tm);tm=setTimeout(()=>{redo();const i=$('#pq');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)};
 $('#pb').onchange=e=>{u.brand=e.target.value;u.page=0;redo()};
 $('#pc').onchange=e=>{u.cat=e.target.value;u.page=0;redo()};
 $('#pa').onchange=e=>{u.act=e.target.value;u.page=0;redo()};
 $('#pp').onclick=()=>{u.page--;redo()};$('#pn').onclick=()=>{u.page++;redo()};
 $$('th[data-s]').forEach(th=>th.onclick=()=>{const k=th.dataset.s;if(k==='m')return;u.sort=k;redo()});
 $('#pex').onclick=exportProducts;$('#pad').onclick=()=>editProduct(null);
 $$('tbody tr[data-id]').forEach(tr=>{
  const id=tr.dataset.id;
  $$('input.num',tr).forEach(inp=>inp.onchange=async()=>{
   const p=DB.products.find(x=>x.id===id),f=inp.dataset.f,raw=inp.value.trim();
   const v=raw===''?'':num(raw);
   if(raw!==''&&(isNaN(v)||v<0)){inp.classList.add('bad');return}
   inp.classList.remove('bad');
   if(p[f]===v)return;
   const old=p[f];
   await save('products',{id,[f]:v});
   await save('price_history',{id:uid(),batch:uid(),date:today(),product_id:id,field:f,old:old===''?'':old,new:v,source:'вручную'});
   const m=margin(p);$('.m',tr).innerHTML=m==null?'<span class="mut">—</span>':`<span class="tag ${m<20?'y':''}">${m.toFixed(0)}%</span>`;$('.pr',tr).innerHTML=profit(p);
  });
  $('[data-edit]',tr).onclick=()=>editProduct(id);
 });
}};
function editProduct(id){
 const p=id?DB.products.find(x=>x.id===id):{id:'',article:'',name_ru:'',name_uk:'',brand:'',category:'',form:'',pack:'',unit:'шт',buy_eur:'',sell_eur:'',active:'1',note:''};
 const f=(k,l,t)=>`<div class="f"><label>${l}</label><input type="text" data-k="${k}" value="${esc(p[k])}"></div>`;
 dlg(`<h2>${id?'Товар':'Новый товар'}</h2><div class="grid g2">${f('article','Артикул')}${f('brand','Бренд')}${f('name_ru','Название (RU)')}${f('name_uk','Название (UA)')}${f('category','Категория')}${f('form','Форма')}${f('pack','Упаковка')}${f('unit','Единица')}${f('buy_eur','Закупка, €')}${f('sell_eur','Продажа, €')}</div>
 <div class="f" style="margin-top:12px"><label>Заметка</label><textarea data-k="note" rows="2">${esc(p.note)}</textarea></div>
 <label style="display:block;margin-top:10px"><input type="checkbox" id="pact" ${p.active!=='0'?'checked':''}> Активный (показывать в списках)</label>
 <div class="bar" style="margin:16px 0 0"><button class="btn p" id="ok">Сохранить</button><button class="btn" id="cn">Отмена</button></div>`,d=>{
  $('#cn').onclick=closeDlg;
  $('#ok').onclick=async()=>{
   const o={id:p.id||('p'+uid()),active:$('#pact').checked?'1':'0'};
   $$('[data-k]',d).forEach(e=>o[e.dataset.k]=e.value.trim());
   ['buy_eur','sell_eur'].forEach(k=>{o[k]=o[k]===''?'':num(o[k]);if(o[k]!==''&&isNaN(o[k]))o[k]=''});
   if(!o.name_ru){alert('Укажи название');return}
   if(!p.id&&!o.article){o.article='N-'+String(DB.products.length+1).padStart(3,'0')}
   const hist=[];['buy_eur','sell_eur'].forEach(k=>{if(id&&p[k]!==o[k])hist.push({id:uid(),batch:uid(),date:today(),product_id:o.id,field:k,old:p[k],new:o[k],source:'вручную'})});
   await save('products',o);if(hist.length)await save('price_history',hist);
   closeDlg();render();
  };
 });
}
function exportProducts(){
 const rows=prodList().map(p=>({Артикул:p.article,'Название RU':p.name_ru,'Название UA':p.name_uk,Бренд:p.brand,Категория:p.category,Форма:p.form,Упаковка:p.pack,'Закупка €':p.buy_eur,'Продажа €':p.sell_eur,'Наценка %':margin(p)==null?'':r2(margin(p)),'Прибыль €':(p.buy_eur===''||p.sell_eur===''||isNaN(p.buy_eur)||isNaN(p.sell_eur))?'':r2(p.sell_eur-p.buy_eur),Активный:p.active==='0'?'нет':'да'}));
 const wb=XLSX.utils.book_new();const ws=XLSX.utils.json_to_sheet(rows);ws['!cols']=[10,44,44,14,22,12,14,11,11,10,10,9].map(w=>({wch:w}));
 XLSX.utils.book_append_sheet(wb,ws,'Товары');XLSX.writeFile(wb,'bella_tovary_'+today()+'.xlsx');
}

/* ---------- Prices ---------- */
let IMP=null; // результат разбора Excel
const viewPrices={html(){
 const t=UI.tab.prices;
 const tabs=[['excel','Загрузка из Excel'],['mass','Массовое изменение'],['hist','История']].map(([k,n])=>`<a data-t="${k}" class="${t===k?'on':''}">${n}</a>`).join('');
 return `<h1>Цены</h1><div class="sub">Изменение цен пачкой. Всё, что меняется, попадает в историю — последнюю пачку можно отменить.</div><div class="tabs">${tabs}</div>${({excel:pricesExcel,mass:pricesMass,hist:pricesHist})[t]()}`},
bind(){
 $$('.tabs a').forEach(a=>a.onclick=()=>{UI.tab.prices=a.dataset.t;IMP=null;render()});
 ({excel:bindExcel,mass:bindMass,hist:bindHist})[UI.tab.prices]();
}};
function pricesExcel(){
 let prev='';
 if(IMP){
  const ch=IMP.changes;
  prev=`<div class="card"><h2>Предпросмотр: ${esc(IMP.file)}</h2>
  <div class="msg">Найдено товаров: <b>${IMP.matched}</b>, изменений цен: <b>${ch.length}</b>${IMP.unknown.length?`, не найдено в справочнике: <b>${IMP.unknown.length}</b>`:''}${IMP.bad.length?`, строк с ошибкой: <b>${IMP.bad.length}</b>`:''}.</div>
  ${IMP.unknown.length?`<div class="msg warn">Не найдены (артикулы): ${esc(IMP.unknown.slice(0,15).join(', '))}${IMP.unknown.length>15?'…':''}</div>`:''}
  ${IMP.bad.length?`<div class="msg err">Нечисловые цены в строках: ${esc(IMP.bad.slice(0,15).join(', '))}</div>`:''}
  ${ch.length?`<div class="scroll"><table><thead><tr><th>Артикул</th><th>Название</th><th>Поле</th><th class="r">Было</th><th class="r">Станет</th></tr></thead><tbody>${ch.slice(0,200).map(c=>`<tr><td class="mut">${esc(c.p.article)}</td><td>${esc(c.p.name_ru)}</td><td>${c.f==='buy_eur'?'Закупка':'Продажа'}</td><td class="r">${eur(c.old)}</td><td class="r ${c.nw>(c.old===''?0:c.old)?'chg-up':'chg-dn'}">${eur(c.nw)}</td></tr>`).join('')}</tbody></table></div>${ch.length>200?`<div class="note">Показаны первые 200 из ${ch.length}</div>`:''}
  <div class="bar" style="margin-top:14px"><button class="btn p" id="iap">Применить ${ch.length} изм.</button><button class="btn" id="icn">Отмена</button></div>`:'<div class="empty">Цены в файле совпадают с текущими — менять нечего.</div>'}
  </div>`;
 }
 return `<div class="card"><h2>1. Скачай шаблон</h2><p class="note">В шаблоне все текущие товары. Меняй цены в колонках «Закупка €» и «Продажа €». Артикул не трогай — по нему программа находит товар. Пустую ячейку цены программа пропускает.</p>
 <button class="btn" id="itp">Скачать шаблон Excel</button></div>
 <div class="card"><h2>2. Загрузи файл</h2><input type="file" id="ifl" accept=".xlsx,.xls,.csv"><p class="note">Перед применением увидишь список «было → станет».</p></div>${prev}`;
}
function bindExcel(){
 const tp=$('#itp');if(tp)tp.onclick=()=>{
  const rows=DB.products.filter(p=>p.active!=='0').map(p=>({Артикул:p.article,Название:p.name_ru,Бренд:p.brand,'Закупка €':p.buy_eur,'Продажа €':p.sell_eur}));
  const wb=XLSX.utils.book_new(),ws=XLSX.utils.json_to_sheet(rows);ws['!cols']=[10,46,14,11,11].map(w=>({wch:w}));XLSX.utils.book_append_sheet(wb,ws,'Цены');XLSX.writeFile(wb,'bella_shablon_cen.xlsx');
 };
 const fl=$('#ifl');if(fl)fl.onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  try{IMP=parseImport(XLSX.read(await f.arrayBuffer(),{type:'array'}),f.name)}catch(er){alert('Не удалось прочитать файл: '+er.message);return}
  render();
 };
 const ap=$('#iap');if(ap)ap.onclick=async()=>{
  ap.disabled=true;await applyChanges(IMP.changes,'Excel');IMP=null;toast('Цены обновлены');render();
 };
 const cn=$('#icn');if(cn)cn.onclick=()=>{IMP=null;render()};
}
function parseImport(wb,name){
 const sn=wb.SheetNames.find(n=>/загрузк|upload/i.test(n))||wb.SheetNames[0];const ws=wb.Sheets[sn];const rows=XLSX.utils.sheet_to_json(ws,{defval:''});
 if(!rows.length)throw new Error('файл пуст');
 const keys=Object.keys(rows[0]);
 const find=re=>keys.find(k=>re.test(k.toLowerCase()));
 const kA=find(/артикул|article|sku|^id$/),kB=find(/закуп|buy|purchase/),kS=find(/продаж|sell|retail|price/);
 if(!kA)throw new Error('не найдена колонка «Артикул»');
 if(!kB&&!kS)throw new Error('не найдены колонки «Закупка €» / «Продажа €»');
 const byA={};DB.products.forEach(p=>{byA[String(p.article).trim().toLowerCase()]=p;byA[String(p.id).toLowerCase()]=p});
 const res={file:name,matched:0,changes:[],unknown:[],bad:[]};
 rows.forEach((r,i)=>{
  const a=String(r[kA]).trim().toLowerCase();if(!a)return;
  const p=byA[a];if(!p){res.unknown.push(String(r[kA]));return}
  res.matched++;
  [[kB,'buy_eur'],[kS,'sell_eur']].forEach(([k,f])=>{
   if(!k)return;const raw=r[k];if(raw===''||raw==null)return;
   const v=typeof raw==='number'?raw:num(raw);
   if(isNaN(v)||v<0){res.bad.push(String(r[kA])+' ('+f+')');return}
   const nv=r2(v),ov=p[f];
   if(ov===''||isNaN(ov)||Math.abs(ov-nv)>0.0001)res.changes.push({p,f,old:ov,nw:nv});
  });
 });
 if(!rows.some(r=>String(r[kA]).trim()))throw new Error('в файле нет значений (цены в нём считаются формулами). Открой файл в Excel, нажми «Сохранить» (Ctrl+S) и загрузи снова');
 return res;
}
async function applyChanges(changes,source){
 const batch=uid(),d=today();
 const byP={};changes.forEach(c=>{(byP[c.p.id]=byP[c.p.id]||{id:c.p.id})[c.f]=c.nw});
 const hist=changes.map(c=>({id:uid(),batch,date:d,product_id:c.p.id,field:c.f,old:c.old===''?'':c.old,new:c.nw,source}));
 await save('products',Object.values(byP));
 await save('price_history',hist);
}
function pricesMass(){
 const brands=[...new Set(DB.products.map(p=>p.brand))].filter(Boolean).sort(),cats=[...new Set(DB.products.map(p=>p.category))].filter(Boolean).sort();
 const o=a=>'<option value="">Все</option>'+a.map(x=>`<option>${esc(x)}</option>`).join('');
 return `<div class="card"><h2>Массовое изменение</h2><div class="grid g3">
 <div class="f"><label>Бренд</label><select id="mb">${o(brands)}</select></div>
 <div class="f"><label>Категория</label><select id="mc">${o(cats)}</select></div>
 <div class="f"><label>Какую цену менять</label><select id="mf"><option value="sell_eur">Продажа €</option><option value="buy_eur">Закупка €</option></select></div>
 <div class="f"><label>Действие</label><select id="mt"><option value="pct">Изменить на %</option><option value="add">Прибавить / вычесть €</option><option value="set">Установить значение €</option><option value="markup">Продажа = закупка + наценка %</option></select></div>
 <div class="f"><label>Значение</label><input type="text" id="mv" placeholder="напр. 10 или -5"></div>
 <div class="f"><label>Округление</label><select id="mr"><option value="2">До 0,01 €</option><option value="1">До 0,1 €</option><option value="0">До 1 €</option><option value="5">До 0,5 €</option></select></div>
 </div><div class="bar" style="margin-top:14px"><button class="btn" id="mp">Показать, что изменится</button></div>
 <div id="mo"></div></div>`;
}
function bindMass(){
 $('#mp').onclick=()=>{
  const b=$('#mb').value,c=$('#mc').value,f=$('#mf').value,t=$('#mt').value,v=num($('#mv').value),rd=$('#mr').value;
  if(isNaN(v)){$('#mo').innerHTML='<div class="msg err">Введи число в поле «Значение»</div>';return}
  const rnd=x=>rd==='5'?Math.round(x*2)/2:rd==='0'?Math.round(x):rd==='1'?Math.round(x*10)/10:r2(x);
  const ch=[];let skip=0;
  DB.products.filter(p=>p.active!=='0'&&(!b||p.brand===b)&&(!c||p.category===c)).forEach(p=>{
   const ov=p[f];let nv;
   if(t==='markup'){if(f!=='sell_eur'){return}if(p.buy_eur===''||isNaN(p.buy_eur)){skip++;return}nv=p.buy_eur*(1+v/100)}
   else if(t==='set')nv=v;
   else{if(ov===''||isNaN(ov)){skip++;return}nv=t==='pct'?ov*(1+v/100):ov+v}
   nv=rnd(nv);if(nv<0)nv=0;
   if(ov===''||isNaN(ov)||Math.abs(ov-nv)>0.0001)ch.push({p,f:t==='markup'?'sell_eur':f,old:ov,nw:nv});
  });
  IMP={changes:ch};
  $('#mo').innerHTML=`<div class="msg">Изменится: <b>${ch.length}</b>${skip?`, пропущено (нет цены): ${skip}`:''}</div>${ch.length?`<div class="scroll" style="max-height:340px;overflow:auto"><table><thead><tr><th>Товар</th><th class="r">Было</th><th class="r">Станет</th></tr></thead><tbody>${ch.slice(0,150).map(x=>`<tr><td>${esc(x.p.name_ru)}</td><td class="r">${eur(x.old)}</td><td class="r">${eur(x.nw)}</td></tr>`).join('')}</tbody></table></div><div class="bar" style="margin-top:12px"><button class="btn p" id="ma">Применить ${ch.length} изм.</button></div>`:''}`;
  const ma=$('#ma');if(ma)ma.onclick=async()=>{ma.disabled=true;await applyChanges(IMP.changes,'массово');IMP=null;toast('Цены обновлены');UI.tab.prices='hist';render()};
 };
}
function pricesHist(){
 const h=DB.price_history.slice().sort((a,b)=>(b.date+b.id)<(a.date+a.id)?-1:1);
 const batches=[];const seen={};h.forEach(x=>{if(!seen[x.batch]){seen[x.batch]={id:x.batch,date:x.date,source:x.source,n:0};batches.push(seen[x.batch])}seen[x.batch].n++});
 const pm={};DB.products.forEach(p=>pm[p.id]=p);
 return `<div class="card"><div class="bar"><h2 style="margin:0">История изменений</h2><span class="sp"></span>${batches.length?'<button class="btn d" id="hun">Отменить последнюю пачку</button>':''}</div>
 ${batches.length?`<table><thead><tr><th>Дата</th><th>Источник</th><th class="r">Изменений</th></tr></thead><tbody>${batches.slice(0,30).map(b=>`<tr><td>${esc(b.date)}</td><td>${esc(b.source)}</td><td class="r">${b.n}</td></tr>`).join('')}</tbody></table>`:'<div class="empty">Изменений пока не было</div>'}</div>
 ${h.length?`<div class="card"><h2>Последние 40 записей</h2><div class="scroll"><table><thead><tr><th>Дата</th><th>Товар</th><th>Поле</th><th class="r">Было</th><th class="r">Стало</th></tr></thead><tbody>${h.slice(0,40).map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(pm[x.product_id]?pm[x.product_id].name_ru:x.product_id)}</td><td>${x.field==='buy_eur'?'Закупка':'Продажа'}</td><td class="r">${eur(x.old)}</td><td class="r">${eur(x.new)}</td></tr>`).join('')}</tbody></table></div></div>`:''}`;
}
function bindHist(){
 const b=$('#hun');if(!b)return;
 b.onclick=async()=>{
  const h=DB.price_history.slice().sort((a,b)=>(b.date+b.id)<(a.date+a.id)?-1:1);if(!h.length)return;
  const bid=h[0].batch,items=DB.price_history.filter(x=>x.batch===bid);
  if(!confirm('Вернуть прежние цены ('+items.length+' изм., '+h[0].date+', '+h[0].source+')?'))return;
  const byP={};items.forEach(x=>{(byP[x.product_id]=byP[x.product_id]||{id:x.product_id})[x.field]=x.old});
  await save('products',Object.values(byP).filter(o=>DB.products.some(p=>p.id===o.id)));
  await removeIds('price_history',items.map(x=>x.id));
  toast('Пачка отменена');render();
 };
}

/* ---------- Rates ---------- */
const viewRates={html(){
 const rs=DB.rates.slice().sort((a,b)=>b.date<a.date?-1:1);
 return `<h1>Курсы НБУ</h1><div class="sub">Официальный курс EUR к гривне. Для приходов берётся курс на дату оплаты поставщику, для продаж — на дату оплаты клиента.</div>
 <div class="card"><div class="bar"><input type="date" id="rd" value="${today()}"><button class="btn p" id="rg">Взять курс НБУ на дату</button><span class="sp"></span>
  <input type="date" id="rf"><input type="date" id="rt" value="${today()}"><button class="btn" id="rp">Загрузить за период</button></div>
  ${UI.rateMsg?`<div class="msg ${/ошиб|не уд/i.test(UI.rateMsg)?'warn':''}">${esc(UI.rateMsg)}</div>`:''}
  <div class="bar" style="margin-top:6px"><span class="note">Если автоматом не получилось — введи вручную:</span><input type="date" id="md" value="${today()}"><input type="text" id="mr" placeholder="курс, напр. 48,25" style="width:130px"><button class="btn" id="ms">Сохранить</button></div></div>
 <div class="card scroll"><table><thead><tr><th>Дата</th><th class="r">EUR → UAH</th><th>Источник</th><th></th></tr></thead><tbody>
 ${rs.slice(0,120).map(r=>`<tr><td>${esc(r.date)}</td><td class="r"><b>${Number(r.eur).toFixed(4)}</b></td><td><span class="tag ${r.source==='НБУ'?'':'y'}">${esc(r.source)}</span></td><td class="r"><button class="btn s d" data-del="${esc(r.id)}">Удалить</button></td></tr>`).join('')||'<tr><td colspan="4" class="empty">Курсов пока нет</td></tr>'}
 </tbody></table></div>`},
bind(){
 $('#rg').onclick=async()=>{
  const d=$('#rd').value;if(!d)return;
  try{const r=await loadRate(d);UI.rateMsg='Курс на '+d+': '+Number(r.eur).toFixed(4)}
  catch(e){UI.rateMsg='Не удалось получить курс на '+d+' (выходной день или нет связи). Курс НБУ на выходные не публикуется — возьми курс предыдущего рабочего дня или введи вручную.'}
  render();
 };
 $('#rp').onclick=async()=>{
  const a=$('#rf').value,b=$('#rt').value;if(!a||!b||a>b)return;
  let n=0,fail=0;const dt=new Date(a+'T12:00:00'),end=new Date(b+'T12:00:00');
  const btn=$('#rp');btn.disabled=true;
  for(;dt<=end;dt.setDate(dt.getDate()+1)){
   const s=dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
   if(dt.getDay()===0||dt.getDay()===6)continue;
   if(DB.rates.some(r=>r.date===s))continue;
   try{await loadRate(s);n++}catch(e){fail++}
   btn.textContent='Загружено: '+n;
  }
  UI.rateMsg='Загружено курсов: '+n+(fail?', не удалось: '+fail:'');render();
 };
 $('#ms').onclick=async()=>{
  const d=$('#md').value,v=num($('#mr').value);if(!d||isNaN(v)||v<=0){alert('Введи дату и курс');return}
  await save('rates',{id:'m'+d.replace(/-/g,''),date:d,eur:v,source:'вручную'});render();
 };
 $$('[data-del]').forEach(b=>b.onclick=async()=>{if(confirm('Удалить курс?')){await removeIds('rates',[b.dataset.del]);render()}});
}};

/* ---------- Settings ---------- */
const viewSettings={html(){
 const g=k=>esc(setting(k));
 return `<h1>Настройки</h1><div class="sub">Данные продавца и резервные копии</div>
 <div class="card"><h2>Данные продавца (для накладных)</h2><div class="grid g2">
 <div class="f"><label>Название / имя</label><input type="text" data-set="seller_name" value="${g('seller_name')}"></div>
 <div class="f"><label>Телефон</label><input type="text" data-set="seller_phone" value="${g('seller_phone')}"></div>
 <div class="f"><label>Telegram / Instagram</label><input type="text" data-set="seller_contact" value="${g('seller_contact')}"></div>
 <div class="f"><label>Реквизиты для оплаты (карта, IBAN)</label><input type="text" data-set="seller_pay" value="${g('seller_pay')}"></div></div>
 <div class="bar" style="margin-top:12px"><button class="btn p" id="sv">Сохранить</button></div></div>
 <div class="card"><h2>Первый импорт товаров с сайта</h2><p class="note">Добавит в справочник товары каталога Bella Formula (${'256'} позиций) с продажными ценами с сайта. Уже существующие по артикулу не затрагиваются. Закупочные цены останутся пустыми — заполнишь через Excel.</p>
 <button class="btn" id="si">Импортировать товары</button><div id="sim"></div></div>
 <div class="card"><h2>Резервная копия</h2><p class="note">Скачай всю базу одним файлом. Таблица в Google Диске и так хранит данные, а копия — на случай ошибки.</p>
 <div class="bar"><button class="btn" id="sbj">Скачать копию (JSON)</button><button class="btn" id="sbx">Скачать всё в Excel</button><label class="btn">Восстановить из JSON<input type="file" id="srf" accept=".json" style="display:none"></label></div><div id="srm"></div></div>
 <div class="card"><h2>Подключение</h2><button class="btn d" id="slo">Выйти (забыть пароль на этом устройстве)</button></div>`},
bind(){
 $('#sv').onclick=async()=>{const rows=$$('[data-set]').map(e=>({id:e.dataset.set,value:e.value.trim()}));await save('settings',rows);toast('Сохранено')};
 $('#si').onclick=async()=>{
  const b=$('#si');b.disabled=true;
  try{
   const arr=await (await fetch('seed_products.json?v=1')).json();
   const have=new Set(DB.products.map(p=>String(p.article).toLowerCase()));
   const add=arr.filter(p=>!have.has(String(p.article).toLowerCase()));
   for(let i=0;i<add.length;i+=100){
    const part=add.slice(i,i+100).map(p=>Object.assign({},p,{buy_eur:p.buy_eur===''?'':+p.buy_eur,sell_eur:p.sell_eur===''?'':+p.sell_eur}));
    await save('products',part);$('#sim').innerHTML='<div class="msg">Загружено '+Math.min(i+100,add.length)+' из '+add.length+'</div>';
   }
   $('#sim').innerHTML='<div class="msg">Готово. Добавлено товаров: '+add.length+'</div>';
  }catch(e){$('#sim').innerHTML='<div class="msg err">Ошибка: '+esc(e.message)+'</div>'}
  b.disabled=false;
 };
 $('#sbj').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(DB)],{type:'application/json'}));a.download='bella_backup_'+today()+'.json';a.click()};
 $('#sbx').onclick=()=>{const wb=XLSX.utils.book_new();Object.keys(DB).forEach(n=>{const ws=XLSX.utils.json_to_sheet(DB[n]);XLSX.utils.book_append_sheet(wb,ws,n.slice(0,31))});XLSX.writeFile(wb,'bella_all_'+today()+'.xlsx')};
 $('#srf').onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
   const j=JSON.parse(await f.text());const names=Object.keys(j).filter(n=>Array.isArray(j[n])&&j[n].length&&DB[n]);
   if(!names.length)throw new Error('в файле нет данных');
   if(!confirm('Добавить/обновить записи из копии ('+names.map(n=>n+': '+j[n].length).join(', ')+')? Существующие записи с теми же id будут перезаписаны.'))return;
   for(const n of names){for(let i=0;i<j[n].length;i+=100)await save(n,j[n].slice(i,i+100))}
   $('#srm').innerHTML='<div class="msg">Восстановлено.</div>';
  }catch(er){$('#srm').innerHTML='<div class="msg err">'+esc(er.message)+'</div>'}
 };
 $('#slo').onclick=()=>{try{localStorage.removeItem('bf_cfg')}catch(e){}CFG=null;DB=null;render()};
}};

/* ---------- Directories ---------- */
const DIRS={
 clients:{title:'Клиенты',one:'Клиент',fields:[['name','Имя / название'],['phone','Телефон'],['telegram','Telegram'],['instagram','Instagram'],['city','Город'],['address','Адрес / отделение перевозчика'],['discount','Скидка, %','n'],['note','Заметка','t']],cols:['name','phone','telegram','city']},
 suppliers:{title:'Поставщики',one:'Поставщик',fields:[['name','Название'],['contact','Контактное лицо'],['phone','Телефон / мессенджер'],['note','Заметка','t']],cols:['name','contact','phone']},
 trustees:{title:'Доверенные лица',one:'Доверенное лицо',fields:[['name','Имя'],['phone','Телефон'],['city','Город'],['note','Заметка','t']],cols:['name','phone','city']}
};
UI.dir={clients:'',suppliers:'',trustees:''};
function dirUsage(sheet,id){
 if(sheet==='clients')return DB.orders.filter(o=>o.client_id===id);
 if(sheet==='trustees')return DB.orders.filter(o=>o.trustee_id===id);
 if(sheet==='suppliers')return DB.purchases.filter(o=>o.supplier_id===id);
 return [];
}
function dirView(sheet){
 const D=DIRS[sheet];
 const lab=k=>D.fields.find(f=>f[0]===k)[1];
 return {html(){
  const q=(UI.dir[sheet]||'').toLowerCase();
  const list=DB[sheet].filter(x=>!q||D.fields.map(f=>x[f[0]]).join(' ').toLowerCase().includes(q)).sort((a,b)=>String(a.name).localeCompare(String(b.name),'ru'));
  const extra=sheet==='clients'?['Заказов','Сумма €']:sheet==='trustees'?['Заказов']:[];
  return `<h1>${D.title}</h1><div class="sub">${list.length} из ${DB[sheet].length}</div>
  <div class="bar"><input type="search" id="dq" placeholder="Поиск…" value="${esc(UI.dir[sheet])}" style="width:260px"><span class="sp"></span>${sheet==='clients'?'<button class="btn" id="dex">Выгрузить в Excel</button>':''}<button class="btn p" id="dad">+ ${D.one}</button></div>
  <div class="card scroll" style="padding:6px"><table><thead><tr>${D.cols.map(c=>`<th>${lab(c)}</th>`).join('')}${extra.map(e=>`<th class="r">${e}</th>`).join('')}<th></th></tr></thead><tbody>
  ${list.map(x=>{const us=dirUsage(sheet,x.id).filter(o=>o.status!=='cancel');
   return `<tr data-id="${esc(x.id)}">${D.cols.map((c,i)=>`<td>${i===0?'<b>'+esc(x[c])+'</b>':esc(x[c])}</td>`).join('')}${sheet==='clients'?`<td class="r">${us.length}</td><td class="r">${eur(r2(us.reduce((a,o)=>a+(+o.total_eur||0),0)))}</td>`:''}${sheet==='trustees'?`<td class="r">${us.length}</td>`:''}<td class="r"><button class="btn s" data-edit="1">Изменить</button></td></tr>`}).join('')||`<tr><td colspan="9" class="empty">Пока пусто. Нажми «+ ${D.one}».</td></tr>`}
  </tbody></table></div>`},
 bind(){
  let tm;$('#dq').oninput=e=>{UI.dir[sheet]=e.target.value;clearTimeout(tm);tm=setTimeout(()=>{render();const i=$('#dq');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)};
  $('#dad').onclick=()=>editDir(sheet,null,()=>render());
  $$('tbody tr[data-id]').forEach(tr=>$('[data-edit]',tr).onclick=()=>editDir(sheet,tr.dataset.id,()=>render()));
  const ex=$('#dex');if(ex)ex.onclick=()=>{
   const rows=DB.clients.map(c=>({Имя:c.name,Телефон:c.phone,Telegram:c.telegram,Instagram:c.instagram,Город:c.city,Адрес:c.address,'Скидка %':c.discount,Заметка:c.note}));
   const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Клиенты');XLSX.writeFile(wb,'bella_klienty_'+today()+'.xlsx');
  };
 }};
}
function editDir(sheet,id,after){
 const D=DIRS[sheet];const p=id?DB[sheet].find(x=>x.id===id):{};
 const f=D.fields.map(([k,l,t])=>t==='t'?`<div class="f" style="grid-column:1/-1"><label>${l}</label><textarea data-k="${k}" rows="2">${esc(p[k])}</textarea></div>`:`<div class="f"><label>${l}</label><input type="text" data-k="${k}" value="${esc(p[k]===undefined||p[k]===''?'':p[k])}"></div>`).join('');
 dlg(`<h2>${id?D.one:'Новый: '+D.one.toLowerCase()}</h2><div class="grid g2">${f}</div><div class="bar" style="margin:16px 0 0"><button class="btn p" id="ok">Сохранить</button><button class="btn" id="cn">Отмена</button><span class="sp"></span>${id?'<button class="btn d" id="dl">Удалить</button>':''}</div>`,d=>{
  $('#cn').onclick=closeDlg;
  $('#ok').onclick=async()=>{
   const o={id:p.id||(sheet[0]+uid())};
   $$('[data-k]',d).forEach(e=>o[e.dataset.k]=e.value.trim());
   if(!o.name){alert('Укажи имя / название');return}
   if(sheet==='clients'){const v=num(o.discount);o.discount=isNaN(v)?'':v;if(!id)o.created=today()}
   await save(sheet,o);closeDlg();after&&after(o);
  };
  const dl=$('#dl');if(dl)dl.onclick=async()=>{
   const us=dirUsage(sheet,id);
   if(us.length){alert('Нельзя удалить: есть связанные записи ('+us.length+'). Можно просто изменить данные.');return}
   if(confirm('Удалить «'+p.name+'»?')){await removeIds(sheet,[id]);closeDlg();after&&after(null)}
  };
 });
}
const viewClients=dirView('clients'),viewSuppliers=dirView('suppliers'),viewTrustees=dirView('trustees');

/* ---------- Orders ---------- */
const ST=[['new','Новый'],['paid','Предоплата получена'],['ordered','Заказано у поставщика'],['transit','В пути'],['carrier','Передан перевозчику'],['trustee','У доверенного лица'],['delivered','Передан клиенту'],['done','Выполнен'],['cancel','Отменён']];
const stName=k=>(ST.find(s=>s[0]===(k||'new'))||[0,k])[1];
const stCls=k=>(k==='done'||k==='delivered')?'':k==='cancel'?'g':(!k||k==='new')?'y':'';
const clientName=id=>{const c=DB.clients.find(x=>x.id===id);return c?c.name:'—'};
UI.ord={q:'',st:''};
const routeArg=()=>(location.hash||'').slice(1).split('/')[1]||'';
function orderLines(id){return DB.order_lines.filter(l=>l.order_id===id)}
function nextNumber(){let m=0;DB.orders.forEach(o=>{const n=parseInt(String(o.number).replace(/\D/g,''),10);if(n>m)m=n});return 'BF-'+String(m+1).padStart(4,'0')}

const viewOrders={html(){
 const u=UI.ord,q=u.q.trim().toLowerCase();
 const list=DB.orders.filter(o=>(!u.st||(o.status||'new')===u.st)&&(!q||(o.number+' '+clientName(o.client_id)).toLowerCase().includes(q)))
  .sort((a,b)=>(b.date+b.number)<(a.date+a.number)?-1:1);
 return `<h1>Заказы клиентов</h1><div class="sub">${list.length} из ${DB.orders.length}</div>
 <div class="bar"><input type="search" id="oq" placeholder="Номер или клиент…" value="${esc(u.q)}" style="width:240px">
 <select id="ost"><option value="">Все статусы</option>${ST.map(s=>`<option value="${s[0]}" ${u.st===s[0]?'selected':''}>${s[1]}</option>`).join('')}</select>
 <span class="sp"></span><button class="btn" id="oex">Выгрузить в Excel</button><button class="btn p" id="oad">+ Новый заказ</button></div>
 <div class="card scroll" style="padding:6px"><table><thead><tr><th>№</th><th>Дата</th><th>Клиент</th><th class="r">Сумма €</th><th class="r">Оплачено ₴</th><th>Оплата</th><th>Статус</th></tr></thead><tbody>
 ${list.map(o=>`<tr data-id="${esc(o.id)}" style="cursor:pointer"><td><b>${esc(o.number)}</b></td><td>${esc(o.date)}</td><td>${esc(clientName(o.client_id))}</td><td class="r">${eur(o.total_eur)}</td><td class="r">${o.pay_uah===''||isNaN(o.pay_uah)?'<span class="mut">—</span>':Number(o.pay_uah).toLocaleString('ru-RU')+' ₴'}</td><td>${o.pay_date?esc(o.pay_date):'<span class="mut">—</span>'}</td><td><span class="tag ${stCls(o.status)}">${esc(stName(o.status))}</span></td></tr>`).join('')||'<tr><td colspan="7" class="empty">Заказов пока нет. Нажми «+ Новый заказ».</td></tr>'}
 </tbody></table></div>`},
bind(){
 const u=UI.ord;let tm;
 $('#oq').oninput=e=>{u.q=e.target.value;clearTimeout(tm);tm=setTimeout(()=>{render();const i=$('#oq');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)};
 $('#ost').onchange=e=>{u.st=e.target.value;render()};
 $('#oad').onclick=()=>{location.hash='#order/new'};
 $$('tbody tr[data-id]').forEach(tr=>tr.onclick=()=>{location.hash='#order/'+tr.dataset.id});
 $('#oex').onclick=()=>{
  const rows=[];DB.orders.forEach(o=>{const ls=orderLines(o.id);(ls.length?ls:[{}]).forEach(l=>rows.push({'№':o.number,Дата:o.date,Клиент:clientName(o.client_id),Статус:stName(o.status),'Скидка %':o.discount,Артикул:(DB.products.find(p=>p.id===l.product_id)||{}).article||'',Товар:l.name||'',Кол:l.qty,'Цена €':l.price_eur,'Итого заказ €':o.total_eur,'Дата оплаты':o.pay_date,'Курс НБУ':o.rate,'Оплачено ₴':o.pay_uah,Перевозчик:o.carrier}))});
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Заказы');XLSX.writeFile(wb,'bella_zakazy_'+today()+'.xlsx');
 };
}};

let OD=null;
function initOrder(arg){
 if(OD&&OD.key===(arg||'new'))return;
 if(!arg||arg==='new'){
  OD={key:'new',isNew:true,autoUah:true,o:{id:'o'+uid(),number:nextNumber(),date:today(),client_id:'',status:'new',discount:'0',pay_date:'',pay_uah:'',pay_method:'',rate:'',carrier:'',trustee_id:'',note:'',created:today(),total_eur:0},lines:[{id:uid(),product_id:'',name:'',qty:'1',price_eur:''}]};
 }else{
  const o=DB.orders.find(x=>x.id===arg);if(!o){OD=null;return}
  OD={key:arg,isNew:false,autoUah:false,o:Object.assign({},o),lines:orderLines(arg).map(l=>Object.assign({},l))};
  if(!OD.lines.length)OD.lines.push({id:uid(),product_id:'',name:'',qty:'1',price_eur:''});
 }
}
function odTotals(){
 const sub=OD.lines.reduce((a,l)=>a+(num(l.qty)||0)*(num(l.price_eur)||0),0);
 const disc=num(OD.o.discount)||0;
 let cost=0,miss=0,costUah=0,act=0,est=0,allRates=true;
 OD.lines.forEach(l=>{const q=num(l.qty)||0;if(!q||(!l.product_id&&!l.name))return;
  const pl=l.product_id&&DB.purchase_lines.find(x=>x.order_id===OD.o.id&&x.product_id===l.product_id);
  if(pl){const u=plUnitCost(pl);cost+=q*u.eur;act++;if(isNaN(u.rate))allRates=false;else costUah+=q*u.eur*u.rate;return}
  const p=DB.products.find(x=>x.id===l.product_id);if(p&&p.buy_eur!==''&&!isNaN(p.buy_eur)){cost+=q*p.buy_eur;est++}else miss++});
 return {sub:r2(sub),tot:r2(sub*(1-disc/100)),disc,cost:r2(cost),miss,costUah:r2(costUah),act,est,full:act>0&&est===0&&miss===0&&allRates};
}
function linesHtml(){
 return `<table><thead><tr><th>Товар</th><th class="r">Кол-во</th><th class="r">Цена €</th><th class="r">Сумма €</th><th></th></tr></thead><tbody>${OD.lines.map((l,i)=>{
  const p=DB.products.find(x=>x.id===l.product_id);const lab=p?p.article+' · '+p.name_ru:(l.name||'');
  return `<tr><td><input type="text" list="plist" data-lp="${i}" value="${esc(lab)}" placeholder="Артикул или название" style="width:100%;min-width:240px"></td><td class="r"><input class="num" style="width:64px" data-lq="${i}" value="${esc(l.qty)}"></td><td class="r"><input class="num" data-lc="${i}" value="${l.price_eur===''||l.price_eur==null?'':esc(l.price_eur)}"></td><td class="r ls"></td><td class="r"><button class="btn s d" data-ld="${i}">×</button></td></tr>`}).join('')}</tbody></table>`;
}
function recalc(){
 const t=odTotals(),o=OD.o;
 $$('.ls').forEach((td,i)=>{const l=OD.lines[i];td.textContent=eur(r2((num(l.qty)||0)*(num(l.price_eur)||0)))});
 $('#tsub').textContent=eur(t.sub);$('#ttot').textContent=eur(t.tot);$('#tdisc').style.display=t.disc?'':'none';
 const rate=num(o.rate);
 $('#tuah').textContent=(!isNaN(rate)&&rate>0)?(r2(t.tot*rate)).toLocaleString('ru-RU',{minimumFractionDigits:2})+' ₴':'— (укажи дату оплаты)';
 if(OD.autoUah&&!isNaN(rate)&&rate>0){o.pay_uah=String(r2(t.tot*rate));$('#opu').value=o.pay_uah}
 const prof=r2(t.tot-t.cost);
 $('#tcost').textContent=eur(t.cost);$('#tprof').textContent=eur(prof);
 $('#tmk').textContent=t.cost>0?(prof/t.cost*100).toFixed(0)+'%':'—';
 $('#tcostlbl').textContent=t.act&&!t.est&&!t.miss?'Закупка по приходам (факт, с доставкой)':t.act?'Закупка: часть по приходам, часть по справочнику':'Закупка по справочнику (ориентир)';
 const pu=num(o.pay_uah);$('#tprofuah').textContent=(t.full&&!isNaN(pu))?Math.round(pu-t.costUah).toLocaleString('ru-RU')+' ₴ (получено − закупка по курсу прихода)':'—';
 $('#tmiss').style.display=t.miss?'':'none';$('#tmiss').textContent='У '+t.miss+' позиций нет закупочной цены в справочнике — прибыль считается неполно.';
 $('#thint').style.display=(o.pay_date&&(o.status||'new')==='new')?'':'none';
}
async function fetchOrderRate(){
 const d=OD.o.pay_date;if(!d)return;
 let msg;
 try{const r=await loadRate(d);OD.o.rate=r.eur;msg='Курс НБУ на '+d+': '+Number(r.eur).toFixed(4)}
 catch(e){const r=rateFor(d);if(r){OD.o.rate=r.eur;msg='Курс на '+d+' получить не удалось, взят ближайший прежний ('+r.date+'): '+Number(r.eur).toFixed(4)+'. Можно поправить вручную.'}else{msg='Курс получить не удалось — введи вручную.'}}
 $('#orate').value=OD.o.rate;$('#ratemsg').textContent=msg;recalc();
}
const viewOrder={html(){
 initOrder(routeArg());
 if(!OD)return `<h1>Заказ не найден</h1><a class="btn" href="#orders">К списку заказов</a>`;
 const o=OD.o;
 const sel=(k,arr,empty)=>`<select data-o="${k}">${empty?`<option value="">${empty}</option>`:''}${arr.map(([v,n])=>`<option value="${esc(v)}" ${String(o[k])===String(v)?'selected':''}>${esc(n)}</option>`).join('')}</select>`;
 const clients=DB.clients.slice().sort((a,b)=>String(a.name).localeCompare(String(b.name),'ru')).map(c=>[c.id,c.name+(c.city?' · '+c.city:'')]);
 const trustees=DB.trustees.slice().sort((a,b)=>String(a.name).localeCompare(String(b.name),'ru')).map(c=>[c.id,c.name+(c.city?' · '+c.city:'')]);
 return `<div id="od"><h1>${OD.isNew?'Новый заказ':'Заказ '+esc(o.number)}</h1><div class="sub"><a href="#orders">← Все заказы</a></div>
 <datalist id="plist">${DB.products.filter(p=>p.active!=='0').map(p=>`<option value="${esc(p.article+' · '+p.name_ru)}">`).join('')}</datalist>
 <div class="grid g2">
 <div class="card"><h2>Заказ</h2><div class="grid g2">
  <div class="f"><label>Номер</label><input type="text" data-o="number" value="${esc(o.number)}"></div>
  <div class="f"><label>Дата</label><input type="date" data-o="date" value="${esc(o.date)}"></div>
  <div class="f" style="grid-column:1/-1"><label>Клиент</label><div class="bar" style="margin:0">${sel('client_id',clients,'— выбери клиента —')}<button class="btn s" id="ncl" type="button">+ Новый</button></div></div>
  <div class="f"><label>Скидка, %</label><input type="text" data-o="discount" value="${esc(o.discount)}"></div>
  <div class="f"><label>Статус</label>${sel('status',ST)}</div>
  <div class="f"><label>Перевозчик</label><input type="text" data-o="carrier" value="${esc(o.carrier)}" placeholder="Нова Пошта, Meest…"></div>
  <div class="f"><label>Доверенное лицо</label>${sel('trustee_id',trustees,'—')}</div>
  <div class="f" style="grid-column:1/-1"><label>Заметка</label><textarea data-o="note" rows="2">${esc(o.note)}</textarea></div>
 </div><div class="bar" style="margin:12px 0 0"><button class="btn s" id="nxt" type="button">Следующий этап →</button></div></div>
 <div class="card"><h2>Оплата клиента</h2><div class="grid g2">
  <div class="f"><label>Дата оплаты</label><input type="date" data-o="pay_date" value="${esc(o.pay_date)}"></div>
  <div class="f"><label>Курс НБУ EUR→UAH</label><input type="text" id="orate" data-o="rate" value="${o.rate===''||o.rate==null?'':esc(o.rate)}"></div>
  <div class="f" style="grid-column:1/-1"><div class="note" id="ratemsg"></div></div>
  <div class="f"><label>К оплате по курсу</label><div style="padding:9px 0;font-weight:600" id="tuah"></div></div>
  <div class="f"><label>Фактически получено, ₴</label><input type="text" id="opu" data-o="pay_uah" value="${o.pay_uah===''||o.pay_uah==null?'':esc(o.pay_uah)}"></div>
  <div class="f"><label>Способ оплаты</label>${sel('pay_method',[['card','На карту'],['cash','Наличные'],['other','Другое']],'—')}</div>
 </div><div class="msg warn" id="thint" style="display:none">Оплата указана, а статус «Новый». Не забудь перевести заказ на «Предоплата получена».</div></div>
 </div>
 <div class="card"><h2>Товары</h2><div class="scroll" id="lines">${linesHtml()}</div>
  <div class="bar" style="margin:12px 0 0"><button class="btn s" id="addl" type="button">+ Добавить позицию</button><span class="sp"></span>
  <div style="text-align:right"><div class="note">Сумма: <span id="tsub"></span></div><div class="note" id="tdisc">Скидка применена</div><div style="font:600 22px Georgia,serif">Итого: <span id="ttot"></span></div></div></div></div>
 <div class="card noprint"><h2>Внутренний расчёт <span class="note">(клиенту не показывается)</span></h2>
  <div class="grid g3"><div><div class="note" id="tcostlbl">Закупка</div><b id="tcost"></b></div><div><div class="note">Прибыль</div><b id="tprof"></b></div><div><div class="note">Наценка</div><b id="tmk"></b></div></div>
  <div style="margin-top:10px"><span class="note">Прибыль в гривнях (по факту): </span><b id="tprofuah"></b></div>
  <div class="note" style="margin-top:8px">Если для позиции есть приход, привязанный к этому заказу, берётся фактическая цена прихода с доставкой. Иначе закупочная цена из «Товаров».</div>
  <div class="msg warn" id="tmiss" style="display:none"></div></div>
 <div class="bar"><button class="btn p" id="osv">Сохранить заказ</button>${OD.isNew?'':'<button class="btn" id="oinv">'+(invoiceFor(OD.o.id)?'Открыть накладную':'Создать накладную')+'</button>'}<a class="btn" href="#orders">Закрыть</a><span class="sp"></span>${OD.isNew?'':'<button class="btn d" id="odl">Удалить заказ</button>'}</div></div>`},
bind(){
 if(!OD)return;
 const w=$('#od'),o=OD.o;
 recalc();
 w.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.o){const k=t.dataset.o;o[k]=t.value;if(k==='pay_uah')OD.autoUah=false;if(k==='discount'||k==='rate')recalc();if(k==='pay_uah')recalc()}
  else if(t.dataset.lq!==undefined){OD.lines[+t.dataset.lq].qty=t.value;recalc()}
  else if(t.dataset.lc!==undefined){OD.lines[+t.dataset.lc].price_eur=t.value;recalc()}
 });
 w.addEventListener('change',async e=>{
  const t=e.target;
  if(t.dataset.o==='client_id'){const c=DB.clients.find(x=>x.id===t.value);if(c&&c.discount&&!(num(o.discount)>0)){o.discount=String(c.discount);$('[data-o=discount]').value=o.discount;toast('Подставлена скидка клиента: '+c.discount+'%');recalc()}}
  else if(t.dataset.o==='pay_date'){OD.autoUah=OD.autoUah||o.pay_uah==='';await fetchOrderRate()}
  else if(t.dataset.o==='status'){recalc()}
  else if(t.dataset.lp!==undefined){
   const i=+t.dataset.lp,v=t.value.trim().toLowerCase(),l=OD.lines[i];
   const p=DB.products.find(x=>(x.article+' · '+x.name_ru).toLowerCase()===v)||DB.products.find(x=>String(x.article).toLowerCase()===v);
   if(p){l.product_id=p.id;l.name=p.name_ru;if(l.price_eur===''||l.price_eur==null)l.price_eur=p.sell_eur===''?'':p.sell_eur}
   else{l.product_id='';l.name=t.value.trim()}
   setTimeout(()=>{$('#lines').innerHTML=linesHtml();recalc()},0);
  }
 });
 w.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t)return;
  if(t.dataset.ld!==undefined){if(OD.lines.length>1){OD.lines.splice(+t.dataset.ld,1);$('#lines').innerHTML=linesHtml();recalc()}}
 });
 $('#addl').onclick=()=>{OD.lines.push({id:uid(),product_id:'',name:'',qty:'1',price_eur:''});$('#lines').innerHTML=linesHtml();recalc();const a=$$('[data-lp]');a[a.length-1].focus()};
 $('#ncl').onclick=()=>editDir('clients',null,c=>{if(c){o.client_id=c.id;if(c.discount&&!(num(o.discount)>0))o.discount=String(c.discount);render()}});
 $('#nxt').onclick=()=>{const i=ST.findIndex(s=>s[0]===(o.status||'new'));if(i<0||i>=7)return;const n=ST[i+1];o.status=n[0];$('[data-o=status]').value=n[0];recalc()};
 $('#osv').onclick=async()=>{
  if(!o.client_id){alert('Выбери клиента');return}
  const rows=OD.lines.filter(l=>(l.product_id||l.name)&&(num(l.qty)||0)>0).map(l=>({id:l.id||uid(),order_id:o.id,product_id:l.product_id,name:l.name,qty:num(l.qty),price_eur:isNaN(num(l.price_eur))?0:num(l.price_eur),purchase_line_id:l.purchase_line_id||''}));
  if(!rows.length){alert('Добавь хотя бы одну позицию с количеством');return}
  const dup=DB.orders.find(x=>x.number===o.number&&x.id!==o.id);if(dup){alert('Номер '+o.number+' уже есть. Измени номер.');return}
  const t=odTotals();
  const rec=Object.assign({},o,{discount:num(o.discount)||0,rate:isNaN(num(o.rate))?'':num(o.rate),pay_uah:isNaN(num(o.pay_uah))?'':num(o.pay_uah),total_eur:t.tot});
  $('#osv').disabled=true;
  await save('orders',rec);
  DB.order_lines=DB.order_lines.filter(l=>l.order_id!==o.id).concat(rows);
  try{await api({action:'replaceLines',sheet:'order_lines',field:'order_id',value:o.id,rows});lastErr=''}catch(e){toast('Позиции не сохранились: '+e.message,1);$('#osv').disabled=false;return}
  OD=null;location.hash='#orders';toast('Заказ сохранён');
 };
 const oi=$('#oinv');if(oi)oi.onclick=async()=>{
  const ex=OD.o.id&&invoiceFor(OD.o.id);
  if(ex){location.hash='#invoice/'+ex.id;return}
  const sv=DB.orders.find(x=>x.id===OD.o.id);
  const dirty=!sv||['number','date','client_id','carrier','pay_date','trustee_id'].some(k=>String(sv[k]==null?'':sv[k])!==String(OD.o[k]==null?'':OD.o[k]))||(num(sv.discount)||0)!==(num(OD.o.discount)||0)||r2(+sv.total_eur||0)!==odTotals().tot||orderLines(sv.id).length!==OD.lines.filter(l=>(l.product_id||l.name)&&(num(l.qty)||0)>0).length;
  if(dirty){alert('В заказе есть несохранённые изменения. Накладная строится по сохранённому заказу: сначала нажми «Сохранить заказ», потом «Создать накладную».');return}
  const inv=await createInvoice(DB.orders.find(x=>x.id===OD.o.id));OD=null;location.hash='#invoice/'+inv.id;
 };
 const dl=$('#odl');if(dl)dl.onclick=async()=>{
  if(!confirm('Удалить заказ '+o.number+' вместе с позициями?'))return;
  await removeIds('orders',[o.id]);DB.order_lines=DB.order_lines.filter(l=>l.order_id!==o.id);
  try{await api({action:'replaceLines',sheet:'order_lines',field:'order_id',value:o.id,rows:[]})}catch(e){}
  OD=null;location.hash='#orders';
 };
}};

/* ---------- Purchases (приходы) ---------- */
const PST=[['new','Создан'],['paid','Оплачен поставщику'],['transit','В пути'],['received','Получен']];
const pstName=k=>(PST.find(s=>s[0]===(k||'new'))||[0,k])[1];
const supplierName=id=>{const c=DB.suppliers.find(x=>x.id===id);return c?c.name:'—'};
UI.pur={q:'',st:''};UI.tb={sel:{}};UI.draft=null;
function nextPurNumber(){let m=0;DB.purchases.forEach(o=>{const n=parseInt(String(o.number).replace(/\D/g,''),10);if(n>m)m=n});return 'PR-'+String(m+1).padStart(4,'0')}
function purchaseFactor(pid){
 const p=DB.purchases.find(x=>x.id===pid),ls=DB.purchase_lines.filter(l=>l.purchase_id===pid);
 const goods=ls.reduce((a,l)=>a+(+l.qty||0)*(+l.price_eur||0),0),d=p?(+p.delivery_eur||0):0;
 return goods>0?1+d/goods:1;
}
function plUnitCost(pl){
 const p=DB.purchases.find(x=>x.id===pl.purchase_id);
 return {eur:(+pl.price_eur||0)*purchaseFactor(pl.purchase_id),rate:p&&p.rate!==''&&p.rate!=null?+p.rate:NaN};
}
function orderLabel(o){return o.number+' · '+clientName(o.client_id)}

const viewPurchases={html(){
 const u=UI.pur,q=u.q.trim().toLowerCase();
 const list=DB.purchases.filter(o=>(!u.st||(o.status||'new')===u.st)&&(!q||(o.number+' '+supplierName(o.supplier_id)).toLowerCase().includes(q)))
  .sort((a,b)=>(b.date+b.number)<(a.date+a.number)?-1:1);
 const need=DB.orders.filter(o=>o.status==='paid').length;
 return `<h1>Приходы</h1><div class="sub">Закупки у поставщиков. ${list.length} из ${DB.purchases.length}</div>
 <div class="bar"><input type="search" id="pq2" placeholder="Номер или поставщик…" value="${esc(u.q)}" style="width:240px">
 <select id="pst"><option value="">Все статусы</option>${PST.map(s=>`<option value="${s[0]}" ${u.st===s[0]?'selected':''}>${s[1]}</option>`).join('')}</select>
 <span class="sp"></span><button class="btn" id="pex2">Выгрузить в Excel</button><a class="btn" href="#tobuy">К закупке${need?' ('+need+')':''}</a><button class="btn p" id="pad2">+ Новый приход</button></div>
 <div class="card scroll" style="padding:6px"><table><thead><tr><th>№</th><th>Дата оплаты</th><th>Поставщик</th><th class="r">Товары €</th><th class="r">Доставка €</th><th class="r">Итого €</th><th class="r">Курс</th><th class="r">Итого ₴</th><th>Статус</th></tr></thead><tbody>
 ${list.map(o=>{const g=r2((+o.total_eur||0)-(+o.delivery_eur||0));const rt=o.rate===''?NaN:+o.rate;return `<tr data-id="${esc(o.id)}" style="cursor:pointer"><td><b>${esc(o.number)}</b></td><td>${esc(o.date)}</td><td>${esc(supplierName(o.supplier_id))}</td><td class="r">${eur(g)}</td><td class="r">${eur(o.delivery_eur||0)}</td><td class="r">${eur(o.total_eur)}</td><td class="r">${isNaN(rt)?'—':rt.toFixed(4)}</td><td class="r">${isNaN(rt)?'—':Math.round((+o.total_eur||0)*rt).toLocaleString('ru-RU')+' ₴'}</td><td><span class="tag ${o.status==='received'?'':o.status==='new'||!o.status?'y':''}">${esc(pstName(o.status))}</span></td></tr>`}).join('')||'<tr><td colspan="9" class="empty">Приходов пока нет. Нажми «К закупке», чтобы собрать закупку по оплаченным заказам, или «+ Новый приход».</td></tr>'}
 </tbody></table></div>`},
bind(){
 const u=UI.pur;let tm;
 $('#pq2').oninput=e=>{u.q=e.target.value;clearTimeout(tm);tm=setTimeout(()=>{render();const i=$('#pq2');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)};
 $('#pst').onchange=e=>{u.st=e.target.value;render()};
 $('#pad2').onclick=()=>{UI.draft=null;location.hash='#purchase/new'};
 $$('tbody tr[data-id]').forEach(tr=>tr.onclick=()=>{location.hash='#purchase/'+tr.dataset.id});
 $('#pex2').onclick=()=>{
  const rows=[];DB.purchases.forEach(o=>{const ls=DB.purchase_lines.filter(l=>l.purchase_id===o.id);const f=purchaseFactor(o.id);(ls.length?ls:[{}]).forEach(l=>{const od=DB.orders.find(x=>x.id===l.order_id);rows.push({'№':o.number,'Дата оплаты':o.date,Поставщик:supplierName(o.supplier_id),Статус:pstName(o.status),Артикул:(DB.products.find(p=>p.id===l.product_id)||{}).article||'',Товар:l.name||'',Кол:l.qty,'Цена €':l.price_eur,'Себестоимость с доставкой €':l.price_eur===undefined?'':r2(l.price_eur*f),'Заказ клиента':od?od.number:'','Доставка приход €':o.delivery_eur,'Итого приход €':o.total_eur,'Курс НБУ':o.rate})})});
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Приходы');XLSX.writeFile(wb,'bella_prihody_'+today()+'.xlsx');
 };
}};

/* К закупке */
function uncoveredLines(order){
 return orderLines(order.id).filter(l=>!DB.purchase_lines.some(pl=>pl.order_id===order.id&&pl.product_id===l.product_id&&l.product_id));
}
const viewToBuy={html(){
 const orders=DB.orders.filter(o=>o.status==='paid').sort((a,b)=>(a.date+a.number)<(b.date+b.number)?-1:1).map(o=>({o,ls:uncoveredLines(o)})).filter(x=>x.ls.length);
 const sel=UI.tb.sel;orders.forEach(x=>{if(sel[x.o.id]===undefined)sel[x.o.id]=true});
 const agg={};
 orders.filter(x=>sel[x.o.id]).forEach(x=>x.ls.forEach(l=>{const k=l.product_id||l.name;const a=agg[k]=agg[k]||{l,qty:0,nums:[]};a.qty+=+l.qty||0;a.nums.push(x.o.number)}));
 const rows=Object.values(agg).map(a=>{const p=DB.products.find(x=>x.id===a.l.product_id);const b=p&&p.buy_eur!==''&&!isNaN(p.buy_eur)?+p.buy_eur:NaN;return {a,p,b}}).sort((x,y)=>String((x.p||{}).brand||'').localeCompare(String((y.p||{}).brand||''))||String(x.a.l.name).localeCompare(String(y.a.l.name),'ru'));
 const tot=r2(rows.reduce((s,r)=>s+(isNaN(r.b)?0:r.b*r.a.qty),0));
 return `<h1>К закупке</h1><div class="sub"><a href="#purchases">← Приходы</a> · Заказы со статусом «Предоплата получена», по которым ещё нет прихода</div>
 ${orders.length?`<div class="card"><h2>Заказы</h2>${orders.map(x=>`<label style="display:flex;gap:10px;padding:6px 0;align-items:flex-start"><input type="checkbox" data-sel="${esc(x.o.id)}" ${sel[x.o.id]?'checked':''}><span><b>${esc(x.o.number)}</b> · ${esc(clientName(x.o.client_id))} · оплата ${esc(x.o.pay_date||'—')}<div class="note">${x.ls.map(l=>esc(l.name)+' ×'+l.qty).join('; ')}</div></span></label>`).join('')}</div>
 <div class="card scroll"><h2>Что заказать у поставщика</h2><table><thead><tr><th>Бренд</th><th>Товар</th><th class="r">Кол-во</th><th>Заказы</th><th class="r">Закупка €</th><th class="r">Сумма €</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc((r.p||{}).brand||'')}</td><td>${esc(r.a.l.name)}</td><td class="r"><b>${r.a.qty}</b></td><td class="note">${esc(r.a.nums.join(', '))}</td><td class="r">${isNaN(r.b)?'<span class="tag y">нет цены</span>':eur(r.b)}</td><td class="r">${isNaN(r.b)?'—':eur(r2(r.b*r.a.qty))}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">Отметь хотя бы один заказ</td></tr>'}</tbody></table>
 <div style="text-align:right;margin-top:10px;font:600 20px Georgia,serif">Ориентировочно: ${eur(tot)}</div></div>
 <div class="bar"><button class="btn p" id="tbc" ${rows.length?'':'disabled'}>Создать приход из выбранных</button><button class="btn" id="tbx" ${rows.length?'':'disabled'}>Выгрузить список в Excel</button></div>`
 :`<div class="card empty">Нет оплаченных заказов, ожидающих закупки. Когда у заказа будет статус «Предоплата получена», он появится здесь.</div>`}`},
bind(){
 $$('[data-sel]').forEach(c=>c.onchange=()=>{UI.tb.sel[c.dataset.sel]=c.checked;render()});
 const orders=DB.orders.filter(o=>o.status==='paid'&&UI.tb.sel[o.id]!==false);
 const mk=()=>{const out=[];orders.forEach(o=>uncoveredLines(o).forEach(l=>{const p=DB.products.find(x=>x.id===l.product_id);out.push({id:uid(),product_id:l.product_id,name:l.name,qty:String(l.qty),price_eur:p&&p.buy_eur!==''&&!isNaN(p.buy_eur)?String(p.buy_eur):'',order_id:o.id})}));return out};
 const bc=$('#tbc');if(bc)bc.onclick=()=>{UI.draft=mk();location.hash='#purchase/new'};
 const bx=$('#tbx');if(bx)bx.onclick=()=>{
  const rows=mk().map(l=>{const p=DB.products.find(x=>x.id===l.product_id)||{};const o=DB.orders.find(x=>x.id===l.order_id);return {Бренд:p.brand||'',Артикул:p.article||'',Товар:l.name,Кол:+l.qty,'Закупка €':l.price_eur===''?'':+l.price_eur,Заказ:o?o.number:''}});
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'К закупке');XLSX.writeFile(wb,'bella_k_zakupke_'+today()+'.xlsx');
 };
}};

/* Страница прихода */
let PD=null;
function initPurchase(arg){
 if(PD&&PD.key===(arg||'new'))return;
 if(!arg||arg==='new'){
  PD={key:'new',isNew:true,o:{id:'u'+uid(),number:nextPurNumber(),date:today(),supplier_id:'',status:'new',rate:'',delivery_eur:'0',note:'',total_eur:0},lines:(UI.draft&&UI.draft.length?UI.draft:[{id:uid(),product_id:'',name:'',qty:'1',price_eur:'',order_id:''}]),upd:false};
  UI.draft=null;
 }else{
  const o=DB.purchases.find(x=>x.id===arg);if(!o){PD=null;return}
  PD={key:arg,isNew:false,o:Object.assign({},o),lines:DB.purchase_lines.filter(l=>l.purchase_id===arg).map(l=>Object.assign({},l)),upd:false};
  if(!PD.lines.length)PD.lines.push({id:uid(),product_id:'',name:'',qty:'1',price_eur:'',order_id:''});
 }
}
function pdTotals(){
 const goods=PD.lines.reduce((a,l)=>a+(num(l.qty)||0)*(num(l.price_eur)||0),0),del=num(PD.o.delivery_eur)||0;
 return {goods:r2(goods),del:r2(del),tot:r2(goods+del),k:goods>0?1+del/goods:1};
}
function pdLinesHtml(){
 const ords=DB.orders.filter(o=>o.status!=='cancel'&&o.status!=='done').sort((a,b)=>(b.date+b.number)<(a.date+a.number)?-1:1);
 return `<table><thead><tr><th>Товар</th><th class="r">Кол-во</th><th class="r">Цена €</th><th>Для заказа клиента</th><th class="r">С доставкой €/шт</th><th class="r">Сумма €</th><th></th></tr></thead><tbody>${PD.lines.map((l,i)=>{
  const p=DB.products.find(x=>x.id===l.product_id);const lab=p?p.article+' · '+p.name_ru:(l.name||'');
  const cur=ords.some(o=>o.id===l.order_id)?ords:ords.concat(DB.orders.filter(o=>o.id===l.order_id));
  return `<tr><td><input type="text" list="plist" data-lp="${i}" value="${esc(lab)}" placeholder="Артикул или название" style="width:100%;min-width:220px"></td><td class="r"><input class="num" style="width:64px" data-lq="${i}" value="${esc(l.qty)}"></td><td class="r"><input class="num" data-lc="${i}" value="${l.price_eur===''||l.price_eur==null?'':esc(l.price_eur)}"></td><td><select data-lo="${i}"><option value="">— на склад / без привязки —</option>${cur.map(o=>`<option value="${esc(o.id)}" ${o.id===l.order_id?'selected':''}>${esc(orderLabel(o))}</option>`).join('')}</select></td><td class="r lk"></td><td class="r ls"></td><td class="r"><button class="btn s d" data-ld="${i}">×</button></td></tr>`}).join('')}</tbody></table>`;
}
function pdRecalc(){
 const t=pdTotals(),o=PD.o,rate=num(o.rate);
 $$('.ls').forEach((td,i)=>{const l=PD.lines[i];td.textContent=eur(r2((num(l.qty)||0)*(num(l.price_eur)||0)))});
 $$('.lk').forEach((td,i)=>{const l=PD.lines[i];const p=num(l.price_eur);td.textContent=isNaN(p)?'—':eur(r2(p*t.k))});
 $('#pgoods').textContent=eur(t.goods);$('#pdel').textContent=eur(t.del);$('#ptot').textContent=eur(t.tot);
 $('#ptuah').textContent=(!isNaN(rate)&&rate>0)?Math.round(t.tot*rate).toLocaleString('ru-RU')+' ₴':'— (укажи курс)';
 const diffs=PD.lines.filter(l=>{const p=DB.products.find(x=>x.id===l.product_id);const v=num(l.price_eur);return p&&!isNaN(v)&&(p.buy_eur===''||isNaN(p.buy_eur)||Math.abs(p.buy_eur-v)>0.0001)});
 $('#pupdwrap').style.display=diffs.length?'':'none';
 $('#pupdtxt').textContent='Обновить закупочные цены в справочнике ('+diffs.length+' поз. отличаются)';
}
async function fetchPurRate(){
 const d=PD.o.date;if(!d)return;let msg;
 try{const r=await loadRate(d);PD.o.rate=r.eur;msg='Курс НБУ на '+d+': '+Number(r.eur).toFixed(4)}
 catch(e){const r=rateFor(d);if(r){PD.o.rate=r.eur;msg='Курс на '+d+' получить не удалось, взят ближайший прежний ('+r.date+'): '+Number(r.eur).toFixed(4)+'. Можно поправить вручную.'}else{msg='Курс получить не удалось — введи вручную.'}}
 $('#prate').value=PD.o.rate;$('#pratemsg').textContent=msg;pdRecalc();
}
const viewPurchase={html(){
 initPurchase(routeArg());
 if(!PD)return `<h1>Приход не найден</h1><a class="btn" href="#purchases">К списку</a>`;
 const o=PD.o;
 const sup=DB.suppliers.slice().sort((a,b)=>String(a.name).localeCompare(String(b.name),'ru'));
 return `<div id="pd"><h1>${PD.isNew?'Новый приход':'Приход '+esc(o.number)}</h1><div class="sub"><a href="#purchases">← Все приходы</a></div>
 <datalist id="plist">${DB.products.filter(p=>p.active!=='0').map(p=>`<option value="${esc(p.article+' · '+p.name_ru)}">`).join('')}</datalist>
 <div class="grid g2">
 <div class="card"><h2>Приход</h2><div class="grid g2">
  <div class="f"><label>Номер</label><input type="text" data-o="number" value="${esc(o.number)}"></div>
  <div class="f"><label>Дата оплаты поставщику</label><input type="date" data-o="date" value="${esc(o.date)}"></div>
  <div class="f" style="grid-column:1/-1"><label>Поставщик</label><div class="bar" style="margin:0"><select data-o="supplier_id"><option value="">— выбери поставщика —</option>${sup.map(s=>`<option value="${esc(s.id)}" ${s.id===o.supplier_id?'selected':''}>${esc(s.name)}</option>`).join('')}</select><button class="btn s" id="nsp" type="button">+ Новый</button></div></div>
  <div class="f"><label>Статус</label><select data-o="status">${PST.map(s=>`<option value="${s[0]}" ${(o.status||'new')===s[0]?'selected':''}>${s[1]}</option>`).join('')}</select></div>
  <div class="f"><label>Доставка поставщика, €</label><input type="text" data-o="delivery_eur" value="${esc(o.delivery_eur)}"></div>
  <div class="f" style="grid-column:1/-1"><label>Заметка</label><textarea data-o="note" rows="2">${esc(o.note)}</textarea></div>
 </div></div>
 <div class="card"><h2>Курс и итоги</h2><div class="grid g2">
  <div class="f"><label>Курс НБУ EUR→UAH на дату оплаты</label><input type="text" id="prate" data-o="rate" value="${o.rate===''||o.rate==null?'':esc(o.rate)}"></div>
  <div class="f"><label>&nbsp;</label><button class="btn s" id="prg" type="button">Взять курс НБУ на дату</button></div>
  <div class="f" style="grid-column:1/-1"><div class="note" id="pratemsg"></div></div>
  <div><div class="note">Товары</div><b id="pgoods"></b></div><div><div class="note">Доставка</div><b id="pdel"></b></div>
  <div><div class="note">Итого €</div><b id="ptot" style="font:600 22px Georgia,serif"></b></div><div><div class="note">Итого по курсу</div><b id="ptuah"></b></div>
 </div><div class="note" style="margin-top:10px">Доставка распределяется на товары пропорционально их стоимости: так считается себестоимость с доставкой.</div></div>
 </div>
 <div class="card"><h2>Товары</h2><div class="scroll" id="lines">${pdLinesHtml()}</div>
  <div class="bar" style="margin:12px 0 0"><button class="btn s" id="addl" type="button">+ Добавить позицию</button></div>
  <label id="pupdwrap" style="display:none;margin-top:12px"><input type="checkbox" id="pupd"> <span id="pupdtxt"></span></label></div>
 <div class="bar"><button class="btn p" id="psv">Сохранить приход</button><a class="btn" href="#purchases">Закрыть</a><span class="sp"></span>${PD.isNew?'':'<button class="btn d" id="pdl">Удалить приход</button>'}</div></div>`},
bind(){
 if(!PD)return;
 const w=$('#pd'),o=PD.o;pdRecalc();
 if(PD.isNew&&!o.rate&&o.date)fetchPurRate();
 w.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.o){o[t.dataset.o]=t.value;if(t.dataset.o==='delivery_eur'||t.dataset.o==='rate')pdRecalc()}
  else if(t.dataset.lq!==undefined){PD.lines[+t.dataset.lq].qty=t.value;pdRecalc()}
  else if(t.dataset.lc!==undefined){PD.lines[+t.dataset.lc].price_eur=t.value;pdRecalc()}
 });
 w.addEventListener('change',async e=>{
  const t=e.target;
  if(t.dataset.o==='date'){await fetchPurRate()}
  else if(t.dataset.lo!==undefined){PD.lines[+t.dataset.lo].order_id=t.value}
  else if(t.dataset.lp!==undefined){
   const i=+t.dataset.lp,v=t.value.trim().toLowerCase(),l=PD.lines[i];
   const p=DB.products.find(x=>(x.article+' · '+x.name_ru).toLowerCase()===v)||DB.products.find(x=>String(x.article).toLowerCase()===v);
   if(p){l.product_id=p.id;l.name=p.name_ru;if(l.price_eur===''||l.price_eur==null)l.price_eur=p.buy_eur===''?'':p.buy_eur}
   else{l.product_id='';l.name=t.value.trim()}
   setTimeout(()=>{$('#lines').innerHTML=pdLinesHtml();pdRecalc()},0);
  }
 });
 w.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;if(t.dataset.ld!==undefined&&PD.lines.length>1){PD.lines.splice(+t.dataset.ld,1);$('#lines').innerHTML=pdLinesHtml();pdRecalc()}});
 $('#addl').onclick=()=>{PD.lines.push({id:uid(),product_id:'',name:'',qty:'1',price_eur:'',order_id:''});$('#lines').innerHTML=pdLinesHtml();pdRecalc();const a=$$('[data-lp]');a[a.length-1].focus()};
 $('#prg').onclick=fetchPurRate;
 $('#nsp').onclick=()=>editDir('suppliers',null,s=>{if(s){o.supplier_id=s.id;render()}});
 $('#psv').onclick=async()=>{
  if(!o.supplier_id){alert('Выбери поставщика');return}
  const rows=PD.lines.filter(l=>(l.product_id||l.name)&&(num(l.qty)||0)>0).map(l=>({id:l.id||uid(),purchase_id:o.id,product_id:l.product_id,name:l.name,qty:num(l.qty),price_eur:isNaN(num(l.price_eur))?0:num(l.price_eur),order_id:l.order_id||''}));
  if(!rows.length){alert('Добавь хотя бы одну позицию');return}
  const dup=DB.purchases.find(x=>x.number===o.number&&x.id!==o.id);if(dup){alert('Номер '+o.number+' уже есть. Измени номер.');return}
  const zero=rows.filter(l=>!(l.price_eur>0));
  if(zero.length&&!confirm('У '+zero.length+' поз. не указана цена (будет 0 €): '+zero.map(l=>l.name).slice(0,3).join('; ')+(zero.length>3?'…':'')+'. Сохранить как есть?'))return;
  const t=pdTotals();
  const rec=Object.assign({},o,{delivery_eur:t.del,rate:isNaN(num(o.rate))?'':num(o.rate),total_eur:t.tot});
  $('#psv').disabled=true;
  await save('purchases',rec);
  DB.purchase_lines=DB.purchase_lines.filter(l=>l.purchase_id!==o.id).concat(rows);
  try{await api({action:'replaceLines',sheet:'purchase_lines',field:'purchase_id',value:o.id,rows});lastErr=''}catch(er){toast('Позиции не сохранились: '+er.message,1);$('#psv').disabled=false;return}
  // обновление закупочных цен — только если отмечено галочкой
  const cb=$('#pupd');
  if(cb&&cb.checked){
   const ch=[];rows.forEach(l=>{const p=DB.products.find(x=>x.id===l.product_id);if(p&&(p.buy_eur===''||isNaN(p.buy_eur)||Math.abs(p.buy_eur-l.price_eur)>0.0001))ch.push({p,f:'buy_eur',old:p.buy_eur,nw:l.price_eur})});
   if(ch.length)await applyChanges(ch,'приход '+o.number);
  }
  // статусы связанных заказов — с подтверждением
  const linked=[...new Set(rows.map(l=>l.order_id).filter(Boolean))].map(id=>DB.orders.find(x=>x.id===id)).filter(x=>x&&x.status==='paid');
  if(linked.length&&confirm('Перевести заказы '+linked.map(x=>x.number).join(', ')+' в статус «Заказано у поставщика»?')){
   await save('orders',linked.map(x=>({id:x.id,status:'ordered'})));
  }
  PD=null;location.hash='#purchases';toast('Приход сохранён');
 };
 const dl=$('#pdl');if(dl)dl.onclick=async()=>{
  if(!confirm('Удалить приход '+o.number+' вместе с позициями?'))return;
  await removeIds('purchases',[o.id]);DB.purchase_lines=DB.purchase_lines.filter(l=>l.purchase_id!==o.id);
  try{await api({action:'replaceLines',sheet:'purchase_lines',field:'purchase_id',value:o.id,rows:[]})}catch(e){}
  PD=null;location.hash='#purchases';
 };
}};

/* ---------- Invoices / Sales ---------- */
const I18={
 ru:{inv:'Накладная',no:'№',date:'Дата',seller:'Продавец',buyer:'Покупатель',art:'Артикул',item:'Товар',qty:'Кол-во',price:'Цена, €',sum:'Сумма, €',sub:'Сумма',disc:'Скидка',total:'Итого, €',rate:'Курс НБУ EUR→UAH на',topay:'К оплате, ₴',paid:'Оплачено, ₴',method:'Способ оплаты',carrier:'Перевозчик',note:'Примечание',pm:{card:'На карту',cash:'Наличные',other:'Другое'},thanks:'Спасибо за заказ!',order:'Заказ',phone:'Тел.',city:'Город',addr:'Адрес'},
 uk:{inv:'Накладна',no:'№',date:'Дата',seller:'Продавець',buyer:'Покупець',art:'Артикул',item:'Товар',qty:'К-сть',price:'Ціна, €',sum:'Сума, €',sub:'Сума',disc:'Знижка',total:'Разом, €',rate:'Курс НБУ EUR→UAH на',topay:'До сплати, ₴',paid:'Сплачено, ₴',method:'Спосіб оплати',carrier:'Перевізник',note:'Примітка',pm:{card:'На картку',cash:'Готівка',other:'Інше'},thanks:'Дякуємо за замовлення!',order:'Замовлення',phone:'Тел.',city:'Місто',addr:'Адреса'}
};
UI.invLang='ru';UI.sales={month:''};
function nextInvNumber(){let m=0;DB.invoices.forEach(o=>{const n=parseInt(String(o.number).replace(/\D/g,''),10);if(n>m)m=n});return 'INV-'+String(m+1).padStart(4,'0')}
function invoiceFor(orderId){return DB.invoices.find(i=>i.order_id===orderId)}
async function createInvoice(order){
 const inv={id:'i'+uid(),number:nextInvNumber(),date:today(),order_id:order.id,note:''};
 await save('invoices',inv);return inv;
}
const viewSales={html(){
 const u=UI.sales;
 const list=DB.invoices.filter(i=>!u.month||String(i.date).startsWith(u.month)).sort((a,b)=>(b.date+b.number)<(a.date+a.number)?-1:1);
 const rows=list.map(i=>({i,o:DB.orders.find(x=>x.id===i.order_id)})).filter(x=>x.o);
 const sumE=r2(rows.reduce((s,x)=>s+(+x.o.total_eur||0),0)),sumU=rows.reduce((s,x)=>s+(x.o.pay_uah===''||isNaN(x.o.pay_uah)?0:+x.o.pay_uah),0);
 return `<h1>Продажи</h1><div class="sub">Накладные клиентам. Создаются из карточки заказа.</div>
 <div class="bar"><label class="note">Месяц</label><input type="month" id="smo" value="${esc(u.month)}"><span class="sp"></span><button class="btn" id="sex">Выгрузить в Excel</button></div>
 <div class="grid g3"><div class="card kpi"><b>${rows.length}</b><span>накладных</span></div><div class="card kpi"><b>${eur(sumE)}</b><span>сумма продаж</span></div><div class="card kpi"><b>${Math.round(sumU).toLocaleString('ru-RU')} ₴</b><span>получено в гривнях</span></div></div>
 <div class="card scroll" style="padding:6px"><table><thead><tr><th>№</th><th>Дата</th><th>Заказ</th><th>Клиент</th><th class="r">Сумма €</th><th class="r">Оплачено ₴</th><th>Статус заказа</th></tr></thead><tbody>
 ${rows.map(({i,o})=>`<tr data-id="${esc(i.id)}" style="cursor:pointer"><td><b>${esc(i.number)}</b></td><td>${esc(i.date)}</td><td>${esc(o.number)}</td><td>${esc(clientName(o.client_id))}</td><td class="r">${eur(o.total_eur)}</td><td class="r">${o.pay_uah===''||isNaN(o.pay_uah)?'—':Number(o.pay_uah).toLocaleString('ru-RU')+' ₴'}</td><td><span class="tag ${stCls(o.status)}">${esc(stName(o.status))}</span></td></tr>`).join('')||'<tr><td colspan="7" class="empty">Накладных пока нет. Открой заказ и нажми «Накладная».</td></tr>'}
 </tbody></table></div>`},
bind(){
 $('#smo').onchange=e=>{UI.sales.month=e.target.value;render()};
 $$('tbody tr[data-id]').forEach(tr=>tr.onclick=()=>{location.hash='#invoice/'+tr.dataset.id});
 $('#sex').onclick=()=>{
  const rows=DB.invoices.map(i=>({i,o:DB.orders.find(x=>x.id===i.order_id)})).filter(x=>x.o).map(({i,o})=>({'№ накладной':i.number,Дата:i.date,Заказ:o.number,Клиент:clientName(o.client_id),'Сумма €':o.total_eur,'Дата оплаты':o.pay_date,'Курс НБУ':o.rate,'Оплачено ₴':o.pay_uah,Статус:stName(o.status)}));
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Продажи');XLSX.writeFile(wb,'bella_prodazhi_'+today()+'.xlsx');
 };
}};
function invData(inv){
 const o=DB.orders.find(x=>x.id===inv.order_id);if(!o)return null;
 const c=DB.clients.find(x=>x.id===o.client_id)||{};
 const lines=orderLines(o.id);
 const sub=r2(lines.reduce((a,l)=>a+(+l.qty||0)*(+l.price_eur||0),0));
 return {o,c,lines,sub,disc:+o.discount||0,tot:+o.total_eur||r2(sub*(1-(+o.discount||0)/100))};
}
const viewInvoice={html(){
 const inv=DB.invoices.find(x=>x.id===routeArg());
 const d=inv&&invData(inv);
 if(!d)return `<h1>Накладная не найдена</h1><a class="btn" href="#sales">К списку</a>`;
 const T=I18[UI.invLang],{o,c,lines}=d,uk=UI.invLang==='uk';
 const rate=o.rate===''?NaN:+o.rate;
 const S=k=>esc(setting(k));
 return `<div class="bar noprint"><a class="btn" href="#sales">← Продажи</a><a class="btn" href="#order/${esc(o.id)}">Открыть заказ</a><span class="sp"></span>
  <select id="ilg"><option value="ru" ${!uk?'selected':''}>Русский</option><option value="uk" ${uk?'selected':''}>Українська</option></select>
  <button class="btn" id="iex">Excel</button><button class="btn p" id="ipr">Печать / PDF</button><button class="btn d" id="idl">Удалить</button></div>
 <div class="card inv" id="inv"><div style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap"><div><div class="logo" style="margin:0">Bella Formula</div><div class="note">${S('seller_name')}${setting('seller_phone')?' · '+S('seller_phone'):''}${setting('seller_contact')?'<br>'+S('seller_contact'):''}</div></div>
  <div style="text-align:right"><h1 style="margin:0">${T.inv} ${esc(inv.number)}</h1><div class="note">${T.date}: ${esc(inv.date)} · ${T.order} ${esc(o.number)}</div></div></div>
  <div style="margin:18px 0"><div class="note">${T.buyer}</div><b>${esc(c.name||'—')}</b>${c.phone?'<br>'+T.phone+' '+esc(c.phone):''}${c.city?'<br>'+T.city+': '+esc(c.city):''}${c.address?'<br>'+T.addr+': '+esc(c.address):''}${o.carrier?'<br>'+T.carrier+': '+esc(o.carrier):''}</div>
  <table><thead><tr><th>${T.no}</th><th>${T.art}</th><th>${T.item}</th><th class="r">${T.qty}</th><th class="r">${T.price}</th><th class="r">${T.sum}</th></tr></thead><tbody>
  ${lines.map((l,i)=>{const p=DB.products.find(x=>x.id===l.product_id)||{};const nm=uk?(p.name_uk||l.name):(p.name_ru||l.name);return `<tr><td>${i+1}</td><td class="mut">${esc(p.article||'')}</td><td>${esc(nm)}${p.pack?'<div class="note">'+esc(p.pack)+'</div>':''}</td><td class="r">${esc(l.qty)}</td><td class="r">${eur(l.price_eur)}</td><td class="r">${eur(r2((+l.qty||0)*(+l.price_eur||0)))}</td></tr>`}).join('')}
  </tbody></table>
  <div style="text-align:right;margin-top:14px">
   ${d.disc?`<div>${T.sub}: ${eur(d.sub)}</div><div>${T.disc}: ${d.disc}%</div>`:''}
   <div style="font:600 22px Georgia,serif">${T.total}: ${eur(d.tot)}</div>
   ${!isNaN(rate)&&o.pay_date?`<div class="note">${T.rate} ${esc(o.pay_date)}: ${rate.toFixed(4)}</div><div>${T.topay}: <b>${(r2(d.tot*rate)).toLocaleString('ru-RU',{minimumFractionDigits:2})}</b></div>`:''}
   ${o.pay_uah!==''&&!isNaN(o.pay_uah)?`<div>${T.paid}: <b>${Number(o.pay_uah).toLocaleString('ru-RU',{minimumFractionDigits:2})}</b>${o.pay_method?' · '+esc(T.pm[o.pay_method]||''):''}</div>`:''}
  </div>
  ${inv.note?`<div style="margin-top:14px"><div class="note">${T.note}</div>${esc(inv.note)}</div>`:''}
  ${setting('seller_pay')?`<div style="margin-top:14px" class="note">${S('seller_pay')}</div>`:''}
  <div style="margin-top:20px;text-align:center" class="note">${T.thanks}</div></div>
 <div class="card noprint"><div class="f"><label>Примечание в накладной</label><textarea id="inote" rows="2">${esc(inv.note)}</textarea></div><div class="bar" style="margin:10px 0 0"><button class="btn s" id="isn">Сохранить примечание</button></div></div>`},
bind(){
 const inv=DB.invoices.find(x=>x.id===routeArg());if(!inv)return;
 $('#ilg').onchange=e=>{UI.invLang=e.target.value;render()};
 $('#ipr').onclick=()=>window.print();
 $('#isn').onclick=async()=>{await save('invoices',{id:inv.id,note:$('#inote').value.trim()});render()};
 $('#idl').onclick=async()=>{if(confirm('Удалить накладную '+inv.number+'? Заказ останется.')){await removeIds('invoices',[inv.id]);location.hash='#sales'}};
 $('#iex').onclick=()=>{
  const d=invData(inv),T=I18[UI.invLang],uk=UI.invLang==='uk',o=d.o;
  const aoa=[[T.inv+' '+inv.number],[T.date,inv.date],[T.buyer,d.c.name||''],[],[T.no,T.art,T.item,T.qty,T.price,T.sum]];
  d.lines.forEach((l,i)=>{const p=DB.products.find(x=>x.id===l.product_id)||{};aoa.push([i+1,p.article||'',uk?(p.name_uk||l.name):(p.name_ru||l.name),+l.qty,+l.price_eur,r2(l.qty*l.price_eur)])});
  aoa.push([]);if(d.disc)aoa.push(['','','','',T.disc,d.disc+'%']);aoa.push(['','','','',T.total,d.tot]);
  if(o.rate!==''&&o.pay_date)aoa.push(['','','','',T.topay,r2(d.tot*o.rate)]);
  const ws=XLSX.utils.aoa_to_sheet(aoa);ws['!cols']=[{wch:5},{wch:10},{wch:50},{wch:8},{wch:12},{wch:12}];
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,inv.number);XLSX.writeFile(wb,'nakladna_'+inv.number+'.xlsx');
 };
}};

/* ---------- Reports ---------- */
function monthStart(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-01'}
function isoDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
(function(){const n=new Date();UI.rep={from:monthStart(n),to:today(),tab:'months',preset:'month'}})();
function setPreset(k){
 const n=new Date(),u=UI.rep;u.preset=k;
 if(k==='month'){u.from=monthStart(n);u.to=today()}
 else if(k==='prev'){const a=new Date(n.getFullYear(),n.getMonth()-1,1),b=new Date(n.getFullYear(),n.getMonth(),0);u.from=isoDate(a);u.to=isoDate(b)}
 else if(k==='quarter'){const q=Math.floor(n.getMonth()/3)*3;u.from=isoDate(new Date(n.getFullYear(),q,1));u.to=today()}
 else if(k==='year'){u.from=n.getFullYear()+'-01-01';u.to=today()}
 else if(k==='all'){u.from='';u.to=''}
}
function orderEconomics(o){
 const disc=1-(+o.discount||0)/100;
 let rev=0,cost=0,costUah=0,act=0,est=0,miss=0,rates=true;const L=[];
 orderLines(o.id).forEach(l=>{
  const q=+l.qty||0,r=q*(+l.price_eur||0)*disc;
  const pl=l.product_id&&DB.purchase_lines.find(x=>x.order_id===o.id&&x.product_id===l.product_id);
  let c=0,kind='miss';
  if(pl){const u=plUnitCost(pl);c=q*u.eur;kind='act';if(isNaN(u.rate))rates=false;else costUah+=c*u.rate}
  else{const p=DB.products.find(x=>x.id===l.product_id);if(p&&p.buy_eur!==''&&!isNaN(p.buy_eur)){c=q*p.buy_eur;kind='est'}}
  rev+=r;cost+=c;if(kind==='act')act++;else if(kind==='est')est++;else miss++;
  L.push({l,q,rev:r,cost:c,kind});
 });
 const uah=(o.pay_uah===''||o.pay_uah==null||isNaN(o.pay_uah))?NaN:+o.pay_uah;
 const full=act>0&&!est&&!miss&&rates;
 return {rev:r2(rev),cost:r2(cost),costUah,act,est,miss,full,L,profit:r2(rev-cost),uah,profitUah:(full&&!isNaN(uah))?uah-costUah:NaN};
}
function repOrders(){
 const u=UI.rep;
 return DB.orders.filter(o=>o.status!=='cancel'&&o.pay_date&&(!u.from||o.pay_date>=u.from)&&(!u.to||o.pay_date<=u.to)).map(o=>({o,e:orderEconomics(o)}));
}
const uahFmt=v=>(v===null||isNaN(v))?'—':Math.round(v).toLocaleString('ru-RU')+' ₴';
const pctFmt=(p,c)=>c>0?Math.round(p/c*100)+'%':'—';
function repTable(tab,E){
 const grp=(keyf,namef)=>{const m={};E.forEach(({o,e})=>{const k=keyf(o);const g=m[k]=m[k]||{name:namef(o,k),n:0,rev:0,cost:0,uah:0,pu:0,puN:0};g.n++;g.rev+=e.rev;g.cost+=e.cost;if(!isNaN(e.uah))g.uah+=e.uah;if(!isNaN(e.profitUah)){g.pu+=e.profitUah;g.puN++}});return Object.values(m)};
 if(tab==='months'){
  const rows=grp(o=>o.pay_date.slice(0,7),(o,k)=>k).sort((a,b)=>a.name<b.name?1:-1);
  return {head:['Месяц','Заказов','Выручка €','Получено ₴','Закупка €','Прибыль €','Наценка','Прибыль ₴ (по факту)'],num:[1,2,3,4,5,6,7],rows:rows.map(g=>[g.name,g.n,eur(r2(g.rev)),uahFmt(g.uah),eur(r2(g.cost)),eur(r2(g.rev-g.cost)),pctFmt(g.rev-g.cost,g.cost),g.puN?uahFmt(g.pu)+' ('+g.puN+' из '+g.n+')':'—']),raw:rows.map(g=>[g.name,g.n,r2(g.rev),Math.round(g.uah),r2(g.cost),r2(g.rev-g.cost),g.cost>0?r2((g.rev-g.cost)/g.cost*100):'',g.puN?Math.round(g.pu):''])};
 }
 if(tab==='clients'){
  const rows=grp(o=>o.client_id,(o)=>clientName(o.client_id)).sort((a,b)=>b.rev-a.rev);
  return {head:['Клиент','Заказов','Выручка €','Получено ₴','Прибыль €'],num:[1,2,3,4],rows:rows.map(g=>[g.name,g.n,eur(r2(g.rev)),uahFmt(g.uah),eur(r2(g.rev-g.cost))]),raw:rows.map(g=>[g.name,g.n,r2(g.rev),Math.round(g.uah),r2(g.rev-g.cost)])};
 }
 // по товарам / брендам: по строкам
 const m={};
 E.forEach(({o,e})=>e.L.forEach(x=>{
  const p=DB.products.find(q=>q.id===x.l.product_id)||{};
  const k=tab==='brands'?(p.brand||'—'):(x.l.product_id||x.l.name);
  const g=m[k]=m[k]||{name:tab==='brands'?(p.brand||'—'):((p.article?p.article+' · ':'')+x.l.name),sub:p.brand||'',q:0,rev:0,cost:0,est:0};
  g.q+=x.q;g.rev+=x.rev;g.cost+=x.cost;if(x.kind!=='act')g.est++;
 }));
 const rows=Object.values(m).sort((a,b)=>b.rev-a.rev);
 if(tab==='brands')return {head:['Бренд','Кол-во','Выручка €','Закупка €','Прибыль €','Наценка'],num:[1,2,3,4,5],rows:rows.map(g=>[g.name,g.q,eur(r2(g.rev)),eur(r2(g.cost)),eur(r2(g.rev-g.cost)),pctFmt(g.rev-g.cost,g.cost)]),raw:rows.map(g=>[g.name,g.q,r2(g.rev),r2(g.cost),r2(g.rev-g.cost),g.cost>0?r2((g.rev-g.cost)/g.cost*100):''])};
 return {head:['Товар','Бренд','Кол-во','Выручка €','Закупка €','Прибыль €','Наценка'],num:[2,3,4,5,6],rows:rows.map(g=>[g.name+(g.est?' *':''),g.sub,g.q,eur(r2(g.rev)),eur(r2(g.cost)),eur(r2(g.rev-g.cost)),pctFmt(g.rev-g.cost,g.cost)]),raw:rows.map(g=>[g.name,g.sub,g.q,r2(g.rev),r2(g.cost),r2(g.rev-g.cost),g.cost>0?r2((g.rev-g.cost)/g.cost*100):'']),foot:rows.some(g=>g.est)?'* закупка частично по справочнику, а не по приходам':''};
}
function openOrdersTable(){
 const os=DB.orders.filter(o=>o.status!=='done'&&o.status!=='cancel'&&o.status!=='delivered').sort((a,b)=>(a.date+a.number)<(b.date+b.number)?-1:1);
 return os;
}
const viewReports={html(){
 const u=UI.rep,E=repOrders();
 let rev=0,cost=0,uah=0,pu=0,puN=0,act=0,est=0;
 E.forEach(({e})=>{rev+=e.rev;cost+=e.cost;if(!isNaN(e.uah))uah+=e.uah;if(!isNaN(e.profitUah)){pu+=e.profitUah;puN++}if(e.full)act++;else est++});
 const pr=r2(rev-cost);
 const presets=[['month','Этот месяц'],['prev','Прошлый месяц'],['quarter','Квартал'],['year','Год'],['all','Всё время']];
 const tabs=[['months','По месяцам'],['products','Товары'],['brands','Бренды'],['clients','Клиенты'],['open','В работе']].map(([k,n])=>`<a data-t="${k}" class="${u.tab===k?'on':''}">${n}</a>`).join('');
 let body;
 if(u.tab==='open'){
  const os=openOrdersTable();
  body=`<div class="card scroll"><h2>Незавершённые заказы: ${os.length}</h2><table><thead><tr><th>№</th><th>Дата</th><th>Клиент</th><th class="r">Сумма €</th><th>Оплата</th><th>Статус</th></tr></thead><tbody>${os.map(o=>`<tr data-id="${esc(o.id)}" style="cursor:pointer"><td><b>${esc(o.number)}</b></td><td>${esc(o.date)}</td><td>${esc(clientName(o.client_id))}</td><td class="r">${eur(o.total_eur)}</td><td>${o.pay_date?esc(o.pay_date):'<span class="tag y">не оплачен</span>'}</td><td><span class="tag ${stCls(o.status)}">${esc(stName(o.status))}</span></td></tr>`).join('')||'<tr><td colspan="6" class="empty">Все заказы закрыты</td></tr>'}</tbody></table></div>`;
 }else{
  const T=repTable(u.tab,E);
  body=`<div class="card scroll"><div class="bar" style="margin:0 0 8px"><h2 style="margin:0">${tabs.match(new RegExp('data-t="'+u.tab+'"[^>]*>([^<]*)'))[1]}</h2><span class="sp"></span><button class="btn s" id="rex">Выгрузить в Excel</button></div>
  <table><thead><tr>${T.head.map((h,i)=>`<th class="${T.num.includes(i)?'r':''}">${h}</th>`).join('')}</tr></thead><tbody>${T.rows.map(r=>`<tr>${r.map((c,i)=>`<td class="${T.num.includes(i)?'r':''}">${esc(c)}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${T.head.length}" class="empty">За выбранный период оплаченных заказов нет</td></tr>`}</tbody></table>${T.foot?`<div class="note" style="margin-top:8px">${T.foot}</div>`:''}</div>`;
 }
 return `<h1>Отчёты</h1><div class="sub">Выручка считается по дате оплаты клиентом. Отменённые заказы и неоплаченные не входят.</div>
 <div class="bar">${presets.map(([k,n])=>`<button class="btn s ${u.preset===k?'p':''}" data-p="${k}">${n}</button>`).join('')}<span class="sp"></span><label class="note">с</label><input type="date" id="rfrom" value="${esc(u.from)}"><label class="note">по</label><input type="date" id="rto" value="${esc(u.to)}"></div>
 <div class="grid g4"><div class="card kpi"><b>${E.length}</b><span>оплаченных заказов</span></div><div class="card kpi"><b>${eur(r2(rev))}</b><span>выручка</span></div><div class="card kpi"><b>${eur(pr)}</b><span>прибыль (${pctFmt(pr,cost)} к закупке)</span></div><div class="card kpi"><b>${puN?uahFmt(pu):'—'}</b><span>прибыль ₴ по факту (${puN} из ${E.length} зак.)</span></div></div>
 ${E.length&&est?`<div class="msg warn">У ${est} из ${E.length} заказов закупка посчитана не полностью по приходам (часть по справочнику). Привяжи приходы к заказам, и прибыль станет точной.</div>`:''}
 <div class="tabs">${tabs}</div>${body}`},
bind(){
 const u=UI.rep;
 $$('[data-p]').forEach(b=>b.onclick=()=>{setPreset(b.dataset.p);render()});
 $('#rfrom').onchange=e=>{u.from=e.target.value;u.preset='';render()};
 $('#rto').onchange=e=>{u.to=e.target.value;u.preset='';render()};
 $$('.tabs a').forEach(a=>a.onclick=()=>{u.tab=a.dataset.t;render()});
 $$('tbody tr[data-id]').forEach(tr=>tr.onclick=()=>{location.hash='#order/'+tr.dataset.id});
 const rx=$('#rex');if(rx)rx.onclick=()=>{
  const T=repTable(u.tab,repOrders());
  const ws=XLSX.utils.aoa_to_sheet([T.head].concat(T.raw));ws['!cols']=T.head.map((h,i)=>({wch:i===0||h==='Товар'?44:14}));
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Отчёт');XLSX.writeFile(wb,'bella_otchet_'+u.tab+'_'+today()+'.xlsx');
 };
}};

/* ---------- Start ---------- */
(async function init(){
 if(CFG){
  $('#root').innerHTML='<div class="ovl">Загружаю данные…</div>';
  try{await loadAll()}catch(e){DB=null;lastErr='';stat()}
 }
 render();
})();
})();
