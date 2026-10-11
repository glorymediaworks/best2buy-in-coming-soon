(function(){
  var form=document.getElementById('contact-form');
  if(!form)return;
  var note=document.getElementById('form-note');
  var config=window.BEST2BUY_SITE||{};
  var email=config.email||'best2buyind@gmail.com';
  var emailLink=document.querySelector('[data-contact-email]');
  if(emailLink){emailLink.href='mailto:'+email;emailLink.querySelector('b').textContent=email;}

  function message(){
    if(!form.reportValidity())return null;
    var data=new FormData(form);
    return 'Name: '+data.get('name')+'\nEmail: '+data.get('email')+'\nTopic: '+data.get('subject')+'\n\n'+data.get('message');
  }
  form.addEventListener('submit',function(event){
    event.preventDefault();
    var body=message();
    if(body===null)return;
    var subject='Contact enquiry from '+form.elements.name.value.trim();
    window.location.href='mailto:'+encodeURIComponent(email)+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    note.textContent='Your email app is opening with your message ready to send.';
  });
  document.getElementById('send-whatsapp').addEventListener('click',function(){
    var body=message();
    if(body===null)return;
    if(typeof window.best2buyWhatsApp!=='function'){
      note.textContent='WhatsApp is unavailable right now. Please email us instead.';
      return;
    }
    window.open(window.best2buyWhatsApp('Hello Best2Buy, I have a contact enquiry.\n\n'+body),'_blank','noopener,noreferrer');
    note.textContent='WhatsApp is opening with your message ready to send.';
  });
})();
