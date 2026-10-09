const box=document.querySelector('#product-detail');
const esc=value=>String(value||'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const missing=message=>{box.innerHTML=`<div class="detail-missing"><h2>Product not found</h2><p>${esc(message)}</p><p><a href="products.html" class="back-link">← Browse all products</a></p></div>`;document.title='Product not found | Best2Buy'};

const galleryHtml=(images,title)=>`<div class="detail-gallery"><div class="detail-image"><img id="detail-main" src="${esc(images[0])}" alt="${esc(title)}">${images.length>1?'<button type="button" class="g-nav g-prev" aria-label="Previous image">‹</button><button type="button" class="g-nav g-next" aria-label="Next image">›</button>':''}</div>${images.length>1?`<div class="detail-thumbs">${images.map((url,i)=>`<button type="button" class="d-thumb${i?'':' active'}" data-i="${i}" aria-label="Show image ${i+1}"><img src="${esc(url)}" alt="" loading="lazy"></button>`).join('')}</div>`:''}</div>`;
function wireGallery(images){
  if(images.length<2)return;
  const main=document.querySelector('#detail-main'),thumbs=[...document.querySelectorAll('.d-thumb')];let index=0;
  const show=i=>{index=(i+images.length)%images.length;main.src=images[index];thumbs.forEach((t,n)=>t.classList.toggle('active',n===index))};
  thumbs.forEach(t=>t.addEventListener('click',()=>show(Number(t.dataset.i))));
  document.querySelector('.g-prev').addEventListener('click',()=>show(index-1));
  document.querySelector('.g-next').addEventListener('click',()=>show(index+1));
  let startX=null;const stage=document.querySelector('.detail-image');
  stage.addEventListener('touchstart',e=>{startX=e.touches[0].clientX},{passive:true});
  stage.addEventListener('touchend',e=>{if(startX===null)return;const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>40)show(index+(dx<0?1:-1));startX=null});
}
async function load(){
  const slug=new URLSearchParams(location.search).get('slug');
  if(!slug){missing('No product was selected.');return}
  try{
    const client=supabase.createClient(BEST2BUY_SUPABASE.url,BEST2BUY_SUPABASE.key);
    const {data,error}=await client.from('products').select('*').eq('slug',slug).eq('published',true).maybeSingle();
    if(error){missing('We could not load this product right now. Please try again shortly.');return}
    if(!data){missing('This product may have been moved or is no longer available.');return}
    const images=(Array.isArray(data.images)&&data.images.length?data.images:[data.image_url]).filter(Boolean);if(!images.length)images.push('Logo%201.png');
    document.title=`${data.title} | Best2Buy`;
    const waLink=window.best2buyWhatsApp(['Hello Best2Buy, I would like to order this product:',`Product: ${data.title}`,data.price_label&&`Price: ${data.price_label}`,`Link: ${location.href}`,'Please confirm details, payment and delivery.'].filter(Boolean).join('\n'));
    box.innerHTML=`<div class="detail-grid">${galleryHtml(images,data.title)}<div class="detail-copy"><small>${esc(data.category)}</small><h1>${esc(data.title)}</h1>${Best2BuyCatalog.priceHtml(data.price_label)}<p class="detail-desc">${esc(data.description)}</p><div class="detail-actions"><a class="btn-primary" href="${esc(waLink)}" target="_blank" rel="noopener noreferrer">Order on WhatsApp ↗</a><a class="btn-secondary" href="products.html">View all products</a></div></div></div>`;
    wireGallery(images);
  }catch(error){missing('We could not load this product right now. Please try again shortly.')}
}
load();
