/* Neway: small, readable browser code. AI credentials never belong here. */
const $ = (id) => document.getElementById(id);
const books = window.NEWAY_BOOKS || [];
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL = (value) => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
const scrollTo = (id) => $(id).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
let shown = 9, connected = false, busy = false, conversation = [];

// Navigation, photos, and accessible dialogs.
$('menu').addEventListener('click', () => {
  const open = $('navigation').classList.toggle('open');
  $('menu').setAttribute('aria-expanded', String(open));
  $('menu').setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
$('navigation').addEventListener('click', e => { if(e.target.closest('a')) { $('navigation').classList.remove('open'); $('menu').setAttribute('aria-expanded','false'); } });
document.addEventListener('keydown', e => {if(e.key==='Escape'){ $('navigation').classList.remove('open'); $('menu').setAttribute('aria-expanded','false'); }});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {if(e.target===dialog)dialog.close();});
});
document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
  $('large-photo').src=button.dataset.photo; $('large-photo').alt=button.dataset.caption;
  $('photo-caption').textContent=button.dataset.caption; $('photo-dialog').showModal();
}));
$('about-books').addEventListener('click', () => $('source-dialog').showModal());
$('year').textContent=new Date().getFullYear();
const observer=new IntersectionObserver(entries => entries.forEach(entry => {
  if(entry.isIntersecting){entry.target.classList.add('seen');observer.unobserve(entry.target);}
}), {threshold:.08});
document.querySelectorAll('.hero-copy,.hero-art,.heading,.stages,.gallery,.lab,.chat-card').forEach(el=>observer.observe(el));

// A real mathematical interaction, separate from AI.
$('radius').addEventListener('input', () => {
  const r=Number($('radius').value);
  $('radius-value').textContent=r+' cm'; $('area').textContent=(Math.PI*r*r).toFixed(2)+' cm²';
  $('circle').style.width=$('circle').style.height=(r*15+8)+'px';
});

// Textbook search: independent grade, subject, and language filters.
for(let grade=1;grade<=12;grade++) {
  for(const id of ['book-grade','ai-grade']) $(''+id).add(new Option('Grade '+grade,grade));
}
$('book-grade').value='9'; $('ai-grade').value='9';
[...new Set(books.map(b=>b.language).filter(Boolean))].sort().forEach(language=>$('book-language').add(new Option(language,language)));
function fillSubjects() {
  $('ai-subject').replaceChildren(new Option('Let AI choose',''));
  [...new Set(books.filter(b=>b.grade===Number($('ai-grade').value)).map(b=>b.subject))].sort().forEach(s=>$('ai-subject').add(new Option(s,s)));
}
function renderBooks() {
  const grade=Number($('book-grade').value), language=$('book-language').value, query=$('book-search').value.toLowerCase().trim();
  const matches=books.filter(b=>(!grade||b.grade===grade)&&(!language||b.language===language)&&(b.subject+' '+b.title).toLowerCase().includes(query));
  $('book-count').textContent=matches.length+' resources'+(grade?' · Grade '+grade:'');
  $('books').innerHTML=matches.slice(0,shown).map(b=>{
    const link=b.linkUrl||b.pdfUrl||b.viewerUrl||b.sourceUrl;
    const source=b.sourceType==='regional-government'?'Regional education bureau':'School-hosted copy';
    return `<article class="book"><div class="cover" aria-hidden="true"><small>GRADE ${b.grade}</small><b>${/math/i.test(b.subject)?'π':/science|chem|phys|bio/i.test(b.subject)?'⚛':'Aa'}</b><span>${escapeHTML(b.subject)}</span></div><div class="book-info"><small>${source}</small><h3>${escapeHTML(b.subject)}</h3><p>${escapeHTML(b.language||'Language: check source')}${b.edition?' · '+escapeHTML(b.edition):''}</p>${safeURL(link)?`<a href="${escapeHTML(link)}" target="_blank" rel="noopener noreferrer">${b.pdfUrl?'Open PDF':'Read textbook'} ↗</a>`:''}</div></article>`;
  }).join('')||'<p class="empty">No matching books. Try another subject, language, or grade.</p>';
  $('more-books').hidden=shown>=matches.length;
  $('more-books').style.display=shown>=matches.length?'none':'flex';
}
['book-grade','book-search','book-language'].forEach(id=>$(id).addEventListener('input',()=>{shown=9;renderBooks();}));
$('more-books').addEventListener('click',()=>{shown+=12;renderBooks();});
document.querySelectorAll('[data-grade]').forEach(button=>button.addEventListener('click',()=>{
  $('book-grade').value=button.dataset.grade;$('book-search').value='';$('book-language').value='';shown=9;renderBooks();scrollTo('library');
}));
fillSubjects(); renderBooks();
$('ai-grade').addEventListener('change',()=>{fillSubjects();clearChat();});
$('ai-subject').addEventListener('change',clearChat);

// The AI stays on this website. No ChatGPT links or fake generated answers.
function addMessage(text,kind='assistant',sources=[]) {
  const el=document.createElement('div');el.className='message '+kind;
  const label=document.createElement('small');label.textContent=kind==='user'?'YOU':kind==='notice'?'CONNECTION NOTICE':'NEWAY AI';el.append(label,document.createTextNode(text));
  for(const source of sources) if(safeURL(source.url)) {
    const a=document.createElement('a');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=source.title+' ↗';el.append(a);
  }
  $('messages').append(el);$('messages').scrollTop=$('messages').scrollHeight;return el;
}
function clearChat() {
  if(busy)return;
  conversation=[];$('messages').innerHTML='<div class="welcome"><b>A fresh page. ✧</b><p>What would you like to understand?</p></div>';
}
$('clear-chat').addEventListener('click',clearChat);
document.querySelectorAll('[data-prompt]').forEach(button=>button.addEventListener('click',()=>{$('question').value=button.dataset.prompt;$('question').focus();}));
fetch('/api/tutor').then(r=>r.json()).then(data=>{
  connected=!!data.available;$('ai-status').textContent=connected?'Connected · ready for your questions':'AI connection needed · books are ready';
}).catch(()=>{$('ai-status').textContent='AI not connected · books are ready';});
$('chat-form').addEventListener('submit',async event=>{
  event.preventDefault();const question=$('question').value.trim();if(!question||busy)return;
  addMessage(question,'user');$('question').value='';
  // Book requests are factual catalog lookups; they do not pretend to be AI.
  if(/\b(book|textbook|pdf)\b/i.test(question)&&/\b(find|open|show|download|get)\b/i.test(question)) {
    const requestedGrade=Number(question.match(/grade\s*(\d{1,2})/i)?.[1]||$('ai-grade').value);
    const tokens=question.toLowerCase().split(/\W+/).filter(t=>t.length>3);
    const matches=books.filter(b=>b.grade===requestedGrade&&tokens.some(t=>b.subject.toLowerCase().includes(t))).slice(0,6);
    if(matches.length){const el=addMessage('Here are matching resources from the book collection. Confirm the edition with your teacher.','assistant',matches.map(b=>({title:b.title,url:b.linkUrl||b.pdfUrl||b.viewerUrl||b.sourceUrl})));el.querySelector('small').textContent='BOOK FINDER · CATALOG RESULTS';return;}
  }
  if(!connected){addMessage('The AI model has not been connected yet, so I cannot generate an answer. The textbook library and circle experiment are available now.','notice');return;}
  busy=true;$('send').disabled=true;$('send').textContent='Thinking…';
  ['ai-grade','ai-subject','clear-chat'].forEach(id=>$(id).disabled=true);
  try {
    const response=await fetch('/api/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({grade:Number($('ai-grade').value),subject:$('ai-subject').value,question,history:conversation.slice(-4)})});
    const data=await response.json();
    if(!response.ok||data.error){addMessage(data.error||'The AI could not answer. Please try again.','notice');return;}
    const el=addMessage(data.answer,'assistant',data.sources||[]);
    if(data.searchHtml){const frame=document.createElement('iframe');frame.title='Google Search sources';frame.className='search-suggestions';frame.sandbox='allow-popups allow-popups-to-escape-sandbox';frame.srcdoc=data.searchHtml;el.append(frame);}
    conversation.push({role:'user',text:question},{role:'model',text:data.answer.slice(0,3000)});
    conversation=conversation.slice(-4);
  }catch{addMessage('The connection was interrupted. Please try again.','notice');}
  finally{busy=false;$('send').disabled=false;$('send').textContent='Ask Neway AI ↑';['ai-grade','ai-subject','clear-chat'].forEach(id=>$(id).disabled=false);}
});
