/*
  BEST2BUY SITE SETTINGS  —  the ONLY place to edit contact / checkout details.

  Checkout rule: there is no payment gateway, so every product's final
  checkout is a WhatsApp conversation. To change the WhatsApp number (or to
  switch checkout to something else later), change it here and every page updates.

  whatsappNumber: country code + number, digits only, no "+" or spaces. (India = 91...)
*/
window.BEST2BUY_SITE={
  whatsappNumber:'918778578974',
  email:'best2buyind@gmail.com',
  /* Social links. Leave a link empty ('') to hide its icon. */
  social:{
    instagram:'https://www.instagram.com/best2buyin/',
    facebook:'https://www.facebook.com/profile.php?id=61575215652819'
  }
};

/* Builds the WhatsApp checkout link for any message. */
window.best2buyWhatsApp=function(message){
  return 'https://wa.me/'+window.BEST2BUY_SITE.whatsappNumber+'?text='+encodeURIComponent(message||'Hello Best2Buy');
};

/* Any link written as <a data-whatsapp="message text"> is wired automatically. */
(function(){
  function wire(){
    document.querySelectorAll('a[data-whatsapp]').forEach(function(link){
      link.href=window.best2buyWhatsApp(link.getAttribute('data-whatsapp'));
      link.target='_blank';
      link.rel='noopener noreferrer';
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();

/* Social icons: added automatically to the footer of every page that loads this file. WhatsApp uses the number above. */
(function(){
  var SVG='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var ICONS={
    instagram:SVG+'<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    facebook:SVG+'<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    whatsapp:SVG+'<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>'
  };
  function inject(){
    var s=window.BEST2BUY_SITE.social||{},items=[];
    if(s.instagram)items.push(['instagram','Instagram',s.instagram]);
    if(s.facebook)items.push(['facebook','Facebook',s.facebook]);
    items.push(['whatsapp','WhatsApp',window.best2buyWhatsApp('Hello Best2Buy')]);
    if(!document.getElementById('b2b-social-style')){
      var st=document.createElement('style');st.id='b2b-social-style';
      st.textContent='.b2b-social{display:inline-flex;gap:9px;margin-left:16px;vertical-align:middle}.b2b-social a{display:inline-flex;width:32px;height:32px;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.28);border-radius:50%;color:#fff;transition:background .2s,color .2s}.b2b-social a:hover{background:#fff;color:#1e3a8a}.b2b-social svg{display:block}';
      document.head.appendChild(st);
    }
    document.querySelectorAll('footer .wrap').forEach(function(wrap){
      if(wrap.querySelector('.b2b-social')||!wrap.firstElementChild)return;
      var box=document.createElement('span');box.className='b2b-social';
      box.innerHTML=items.map(function(i){return '<a href="'+i[2]+'" target="_blank" rel="noopener noreferrer" aria-label="'+i[1]+'" title="'+i[1]+'">'+ICONS[i[0]]+'</a>'}).join('');
      wrap.firstElementChild.appendChild(box);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();
