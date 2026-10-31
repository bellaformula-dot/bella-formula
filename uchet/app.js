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
const MENU=[['home','Главная'],['orders','Заказы клиентов',1],['sales','Продажи',1],['purchases','Приходы',1],['products','Товары'],['clients','Клиенты',1],['suppliers','Поставщики',1],['trustees','Доверенные лица',1],['prices','Цены'],['rates','Курсы НБУ'],['reports','Отчёты',1],['settings','Настройки']];
function route(){return (location.hash||'#home').slice(1).split('/')[0]||'home'}
function shell(inner){
 const cur=route();
 return `<div class="app"><aside class="side"><div class="logo">Bella Formula<small>УЧЁТ</small></div><nav class="nav">${
  MENU.map(([k,n,soon])=>`<a href="#${k}" class="${cur===k?'on':''} ${soon?'soon':''}"><i></i>${n}${soon?'<em>скоро</em>':''}</a>`).join('')
 }</nav></aside><main class="main">${inner}</main></div>`;
}
function render(){
 const root=$('#root');
 if(!CFG||!DB){root.innerHTML=loginView();bindLogin();return}
 const r=route();
 const V={home:viewHome,products:viewProducts,prices:viewPrices,rates:viewRates,settings:viewSettings}[r];
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
 <div class="card"><h2>Что дальше</h2><div class="note">Заказы, приходы, накладные, клиенты и отчёты — следующие этапы.</div></div>`},bind(){}};

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
 const ws=wb.Sheets[wb.SheetNames[0]];const rows=XLSX.utils.sheet_to_json(ws,{defval:''});
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

/* ---------- Start ---------- */
(async function init(){
 if(CFG){
  $('#root').innerHTML='<div class="ovl">Загружаю данные…</div>';
  try{await loadAll()}catch(e){DB=null;lastErr='';stat()}
 }
 render();
})();
})();
