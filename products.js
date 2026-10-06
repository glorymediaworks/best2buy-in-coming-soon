const grid=document.querySelector('#product-grid'),search=document.querySelector('#product-search'),empty=document.querySelector('#empty-state');
const fallback=[{title:'Flexible Fridge Magnet 1 mm',description:'Custom photo and promotional magnets in six sizes with live quantity pricing and artwork preview.',category:'Personalised products',price_label:'From ₹34 / piece',image_url:'magnet-square-gallery.jpg',product_url:'fridge-magnets.html'}];
let products=[];
/* Search can match the description, but the card never displays it. */
function render(query=''){
  const term=query.trim().toLowerCase(),visible=products.filter(item=>[item.title,item.category,item.description].join(' ').toLowerCase().includes(term));
  grid.innerHTML=visible.map(Best2BuyCatalog.cardHtml).join('');
  empty.hidden=visible.length>0;
}
async function load(){
  try{
    const client=supabase.createClient(BEST2BUY_SUPABASE.url,BEST2BUY_SUPABASE.key);
    const result=await client.from('products').select('*').eq('published',true).order('created_at',{ascending:false});
    if(!result.error)products=result.data;
  }catch(error){}
  if(!products.length)products=fallback;
  render(search.value);
}
search.addEventListener('input',()=>render(search.value));
load();
