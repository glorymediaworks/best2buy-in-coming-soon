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
