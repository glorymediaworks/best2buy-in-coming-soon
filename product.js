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

    // Dynamic Options configuration
    const isOptions=data.pricing_type==='options'&&data.options_config&&Array.isArray(data.options_config.items)&&data.options_config.items.length>0;
    const optionsGroup=isOptions?data.options_config.group_name||'Choose your option':'Options';
    const optionsItems=isOptions?data.options_config.items:[];
    const minQty=Number(data.min_qty)||1;

    let optionsMarkup='';
    if(isOptions){
      optionsMarkup=`
        <fieldset class="detail-fieldset">
          <legend>${esc(optionsGroup)}</legend>
          <div class="dyn-options-grid" id="dyn-options">
            ${optionsItems.map((item,idx)=>`
              <label class="dyn-opt-item">
                <input type="radio" name="product-option" value="${esc(item.name)}" data-price="${item.price}" ${idx===0?'checked':''}>
                <strong>${esc(item.name)}</strong>
                <small>₹${item.price} / pc</small>
              </label>
            `).join('')}
          </div>
        </fieldset>
      `;
    }

    // Interactive Mockup Preview Markup (Conditional based on has_preview)
    let mockupMarkup='';
    if(data.has_preview){
      mockupMarkup=`
        <div class="mockup-box">
          <small style="font-weight:800;color:var(--blue);letter-spacing:1px;text-transform:uppercase">Interactive Mockup</small>
          <h3 style="margin:6px 0 10px;font-size:17px">Preview your photo on this product</h3>
          <div class="mockup-frame" id="mockup-frame">
            <span id="mockup-hint">Upload a photo to see a live mockup</span>
            <img id="mockup-img" alt="Product Mockup Preview">
          </div>
          <div style="text-align:center">
            <label class="mockup-upload-btn">
              Choose photo to preview
              <input type="file" accept="image/*" id="mockup-input">
            </label>
          </div>
        </div>
      `;
    }

    // Quantity & Total Calculator
    const calculatorMarkup=`
      <fieldset class="detail-fieldset">
        <legend>Select Quantity</legend>
        <div class="dyn-qty-row">
          <input type="number" id="dyn-qty" min="${minQty}" step="1" value="${minQty}">
          <span style="font-size:12px;color:var(--muted)">Minimum order: ${minQty} piece${minQty>1?'s':''}</span>
        </div>
      </fieldset>
      <div class="dyn-total-card">
        <div>
          <small>Estimated Total</small>
          <p id="dyn-calc-details" style="margin:4px 0 0;font-size:12px;color:var(--muted)"></p>
        </div>
        <strong id="dyn-total-display">₹--</strong>
      </div>
    `;

    box.innerHTML=`
      <div class="detail-grid">
        ${galleryHtml(images,data.title)}
        <div class="detail-copy">
          <small>${esc(data.category)}</small>
          <h1>${esc(data.title)}</h1>
          ${Best2BuyCatalog.priceHtml(data.price_label)}
          <p class="detail-desc">${esc(data.description)}</p>
          ${optionsMarkup}
          ${mockupMarkup}
          ${calculatorMarkup}
          <div class="detail-actions">
            <button type="button" class="btn-primary" id="dyn-checkout-btn" style="border:0;cursor:pointer">
              Continue order on WhatsApp ↗
            </button>
            <a class="btn-secondary" href="products.html">View all products</a>
          </div>
        </div>
      </div>
    `;

    wireGallery(images);

    // Wire live price calculator & options updates
    const qtyInput=document.querySelector('#dyn-qty');
    const totalDisplay=document.querySelector('#dyn-total-display');
    const detailsDisplay=document.querySelector('#dyn-calc-details');
    const checkoutBtn=document.querySelector('#dyn-checkout-btn');

    function calculateOrder(){
      const qty=Math.max(minQty,Number(qtyInput.value)||minQty);
      qtyInput.value=qty;
      let unitPrice=0;
      let selectedOptionName='';

      if(isOptions){
        const checkedOpt=document.querySelector('input[name="product-option"]:checked');
        if(checkedOpt){
          unitPrice=Number(checkedOpt.dataset.price)||0;
          selectedOptionName=checkedOpt.value;
        }
      }else{
        const match=String(data.price_label).match(/₹\s*([0-9,.]+)/);
        if(match)unitPrice=parseFloat(match[1].replace(/,/g,''))||0;
      }

      if(unitPrice>0){
        const total=unitPrice*qty;
        totalDisplay.textContent='₹'+total.toLocaleString('en-IN');
        detailsDisplay.textContent=`₹${unitPrice} × ${qty} pcs`;
        return {qty,unitPrice,total,selectedOptionName};
      }else{
        totalDisplay.textContent=data.price_label||'Custom';
        detailsDisplay.textContent=`Quantity: ${qty}`;
        return {qty,unitPrice:0,total:0,selectedOptionName};
      }
    }

    document.querySelectorAll('input[name="product-option"]').forEach(r=>{
      r.addEventListener('change',calculateOrder);
    });
    qtyInput?.addEventListener('input',calculateOrder);
    calculateOrder();

    // Wire Mockup Preview upload
    if(data.has_preview){
      const mockInput=document.querySelector('#mockup-input');
      const mockImg=document.querySelector('#mockup-img');
      const mockHint=document.querySelector('#mockup-hint');
      mockInput?.addEventListener('change',e=>{
        const file=e.target.files&&e.target.files[0];
        if(file){
          const url=URL.createObjectURL(file);
          mockImg.src=url;
          mockImg.style.display='block';
          if(mockHint)mockHint.style.display='none';
        }
      });
    }

    // Wire Universal Checkout trigger
    checkoutBtn?.addEventListener('click',()=>{
      const state=calculateOrder();
      const orderPayload={
        title:data.title,
        optionsSummary:state.selectedOptionName?`${optionsGroup}: ${state.selectedOptionName}`:'',
        quantity:state.qty,
        total:state.total?state.total.toLocaleString('en-IN'):data.price_label,
        providerOverride:data.checkout_provider||'global',
        url:location.href
      };
      if(window.Best2BuyCheckout){
        window.Best2BuyCheckout(orderPayload);
      }else{
        window.open(window.best2buyWhatsApp(`Hello Best2Buy, I would like to order: ${data.title} (${state.qty} pcs)`),'_blank');
      }
    });

  }catch(error){missing('We could not load this product right now. Please try again shortly.')}
}
load();
