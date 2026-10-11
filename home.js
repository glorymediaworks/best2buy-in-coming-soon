const featuredGrid=document.querySelector('#featured-grid');
const fallback=[{title:'Flexible Fridge Magnet 1 mm',category:'Personalised products',price_label:'From ₹34 / piece',image_url:'magnet-square-gallery.jpg',product_url:'fridge-magnets.html'}];
async function load(){
  let products=[];
  try{
    const client=supabase.createClient(BEST2BUY_SUPABASE.url,BEST2BUY_SUPABASE.key);
    const result=await client.from('products').select('*').eq('published',true).order('created_at',{ascending:false}).limit(3);
    if(!result.error)products=result.data;
  }catch(error){}
  if(!products.length)products=fallback;
  featuredGrid.innerHTML=products.map(Best2BuyCatalog.cardHtml).join('');
}
load();

/* Marquee: constant speed (~80px/s) regardless of screen size or font loading. */
(function(){const track=document.querySelector('.marquee-track');if(!track)return;const setSpeed=()=>{const width=track.firstElementChild.getBoundingClientRect().width;if(width)track.style.animationDuration=Math.max(20,width/80)+'s'};setSpeed();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(setSpeed)})();

/* --- Customer Reviews: Continuous loop track cloning, parallax scroll, and card tilt --- */
(function(){
  const scroller=document.querySelector('#reviews-scroller');
  if(!scroller)return;

  // Duplicate tracks for seamless infinite marquee loop
  const tracks=scroller.querySelectorAll('.reviews-track');
  tracks.forEach(track=>{
    const clone=track.cloneNode(true);
    clone.setAttribute('aria-hidden','true');
    track.parentElement.appendChild(clone);
  });

  // Parallax on scroll
  const rows=scroller.querySelectorAll('.reviews-row');
  let ticking=false;
  function updateParallax(){
    const rect=scroller.getBoundingClientRect();
    const windowHeight=window.innerHeight;
    if(rect.top<windowHeight && rect.bottom>0){
      const progress=(windowHeight-rect.top)/(windowHeight+rect.height);
      const offset=(progress - 0.5) * 80;
      rows.forEach(row=>{
        const speed=parseFloat(row.dataset.speed||'1');
        const direction=row.classList.contains('row-left') ? -1 : 1;
        row.style.transform=`translate3d(${direction * offset * speed}px, 0, 0)`;
      });
    }
    ticking=false;
  }

  window.addEventListener('scroll',()=>{
    if(!ticking){
      window.requestAnimationFrame(updateParallax);
      ticking=true;
    }
  },{passive:true});

  // Subtle 3D cursor tilt on review card hover
  document.querySelectorAll('.review-card').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const rect=card.getBoundingClientRect();
      const x=e.clientX - rect.left;
      const y=e.clientY - rect.top;
      const xPct=(x / rect.width) - 0.5;
      const yPct=(y / rect.height) - 0.5;
      const rotateX = -(yPct * 12);
      const rotateY = (xPct * 12);
      card.style.transform=`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.08) translateY(-6px)`;
    });
    card.addEventListener('mouseleave',()=>{
      card.style.transform='';
    });
  });
})();
