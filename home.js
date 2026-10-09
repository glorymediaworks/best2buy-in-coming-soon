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
