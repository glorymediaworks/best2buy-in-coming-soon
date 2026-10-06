/* Shared product card + price formatting, used by the home page, /products and the product page. */
(function(){
  const safe=v=>String(v==null?'':v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const linkFor=item=>item.product_url||`product.html?slug=${encodeURIComponent(item.slug||'')}`;
  const isNew=item=>item.created_at&&(Date.now()-new Date(item.created_at).getTime())<14*24*60*60*1000;

  /* Turns a price label such as "From ₹34 / piece", "Rs. 499" or "499" into a highlighted ₹ price. */
  function priceHtml(label){
    let text=String(label||'').trim();
    if(!text)return '<span class="p-price"><span class="p-ask">Ask for price</span></span>';
    text=text.replace(/(?:\brs\.?|\binr)\s*(?=\d)/gi,'₹');
    if(/^[\d,]+(\.\d+)?$/.test(text))text='₹'+text;
    const match=text.match(/₹\s*[\d,]+(?:\.\d+)?/);
    if(!match)return `<span class="p-price"><span class="p-ask">${safe(text)}</span></span>`;
    const before=text.slice(0,match.index).trim(),after=text.slice(match.index+match[0].length).trim();
    return `<span class="p-price">${before?`<small class="p-pre">${safe(before)}</small>`:''}<b class="p-amt">${safe(match[0].replace(/\s+/g,''))}</b>${after?`<small class="p-suf">${safe(after)}</small>`:''}</span>`;
  }

  /* One product card. Deliberately has NO description: the full text lives only on the product page. */
  function cardHtml(item){
    const href=safe(linkFor(item));
    return `<article class="p-card"><a class="p-media" href="${href}" aria-label="${safe(item.title)}">${isNew(item)?'<span class="p-tag">NEW</span>':''}<img src="${safe(item.image_url||'Logo%201.png')}" alt="${safe(item.title)}" loading="lazy"></a><div class="p-body">${item.category?`<small class="p-cat">${safe(item.category)}</small>`:''}<h3><a href="${href}">${safe(item.title)}</a></h3><div class="p-foot">${priceHtml(item.price_label)}<a class="p-btn" href="${href}">Shop now <span>→</span></a></div></div></article>`;
  }
  window.Best2BuyCatalog={safe,linkFor,priceHtml,cardHtml};
})();
