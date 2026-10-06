/*
  BEST2BUY SITE SETTINGS  —  the ONLY place to edit contact / checkout details.

  Checkout rule: there is no payment gateway, so every product's final
  checkout is a WhatsApp conversation. To change the WhatsApp number (or to
  switch checkout to something else later), change it here and every page updates.

  whatsappNumber: country code + number, digits only, no "+" or spaces. (India = 91...)
*/
window.BEST2BUY_SITE={
  whatsappNumber:'918778578974',
  email:'best2buyind@gmail.com'
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
