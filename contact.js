(function(){
  var form=document.getElementById('contact-form');
  if(!form)return;
  var note=document.getElementById('form-note');
  var config=window.BEST2BUY_SITE||{};
  var email=config.email||'best2buyind@gmail.com';
  var emailLink=document.querySelector('[data-contact-email]');
  if(emailLink){emailLink.href='mailto:'+email;emailLink.querySelector('b').textContent=email;}

  function getWhatsAppBody(){
    if(!form.reportValidity())return null;
    var data=new FormData(form);
    var topic=data.get('topic')||'General';
    return 'Name: '+data.get('name')+'\nEmail: '+data.get('email')+'\nTopic: '+topic+'\n\n'+data.get('message');
  }

  var submitBtn=form.querySelector('button[type="submit"]');
  var formResult=document.getElementById('form-result');
  var originalBtnText=submitBtn?submitBtn.innerHTML:'Send message';

  form.addEventListener('submit',function(event){
    event.preventDefault();
    if(formResult){
      formResult.textContent='';
      formResult.className='form-result';
    }

    if(submitBtn){
      submitBtn.disabled=true;
      submitBtn.textContent='Sending...';
    }

    var formData=new FormData(form);

    fetch('https://api.web3forms.com/submit',{
      method:'POST',
      body:formData
    })
    .then(function(response){
      return response.json().then(function(data){
        return {status:response.status,data:data};
      });
    })
    .then(function(res){
      if(res.status===200||(res.data&&res.data.success)){
        if(formResult){
          formResult.textContent='Thank you! Your message has been sent successfully.';
          formResult.className='form-result success';
        }
        form.reset();
      }else{
        if(formResult){
          formResult.textContent='Oops! Something went wrong. Please try again or email best2buyind@gmail.com.';
          formResult.className='form-result error';
        }
      }
    })
    .catch(function(err){
      if(formResult){
        formResult.textContent='Oops! Something went wrong. Please try again or email best2buyind@gmail.com.';
        formResult.className='form-result error';
      }
    })
    .finally(function(){
      if(submitBtn){
        submitBtn.disabled=false;
        submitBtn.innerHTML=originalBtnText;
      }
    });
  });

  var whatsappBtn=document.getElementById('send-whatsapp');
  if(whatsappBtn){
    whatsappBtn.addEventListener('click',function(){
      var body=getWhatsAppBody();
      if(body===null)return;
      if(typeof window.best2buyWhatsApp!=='function'){
        if(note)note.textContent='WhatsApp is unavailable right now. Please email us instead.';
        return;
      }
      window.open(window.best2buyWhatsApp('Hello Best2Buy, I have a contact enquiry.\n\n'+body),'_blank','noopener,noreferrer');
      if(note)note.textContent='WhatsApp is opening with your message ready to send.';
    });
  }
})();
