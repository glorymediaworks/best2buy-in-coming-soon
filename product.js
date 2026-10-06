const box=document.querySelector('#product-detail');
const esc=value=>String(value||'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const missing=message=>{box.innerHTML=`<div class="detail-missing"><h2>Product not found</h2><p>${esc(message)}</p><p><a href="products.html" class="back-link">← Browse all products</a></p></div>`;document.title='Product not found | Best2Buy'};
async function load(){
  const slug=new URLSearchParams(location.search).get('slug');
  if(!slug){missing('No product was selected.');return}
  try{
    const client=supabase.createClient(BEST2BUY_SUPABASE.url,BEST2BUY_SUPABASE.key);
    const {data,error}=await client.from('products').select('*').eq('slug',slug).eq('published',true).maybeSingle();
    if(error){missing('We could not load this product right now. Please try again shortly.');return}
    if(!data){missing('This product may have been moved or is no longer available.');return}
    document.title=`${data.title} | Best2Buy`;
    const waLink=window.best2buyWhatsApp(['Hello Best2Buy, I would like to order this product:',`Product: ${data.title}`,data.price_label&&`Price: ${data.price_label}`,`Link: ${location.href}`,'Please confirm details, payment and delivery.'].filter(Boolean).join('\n'));
    box.innerHTML=`<div class="detail-grid"><div class="detail-image"><img src="${esc(data.image_url||'Logo%201.png')}" alt="${esc(data.title)}"></div><div class="detail-copy"><small>${esc(data.category)}</small><h1>${esc(data.title)}</h1><span class="detail-price">${esc(data.price_label)}</span><p class="detail-desc">${esc(data.description)}</p><div class="detail-actions"><a class="btn-primary" href="${esc(waLink)}" target="_blank" rel="noopener noreferrer">Order on WhatsApp ↗</a><a class="btn-secondary" href="products.html">View all products</a></div></div></div>`;
  }catch(error){missing('We could not load this product right now. Please try again shortly.')}
}
load();
