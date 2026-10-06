const prices={
  '2 × 2 inches':[39,37,36,36,35,34,34],
  '2 × 3 inches':[45,43,41,40,39,39,39],
  '3 × 3 inches':[55,53,51,49,48,48,48],
  '4 × 4 inches':[75,73,70,68,67,66,66],
  '4 × 6 inches':[105,102,97,94,93,93,93],
  '5 × 5 inches':[119,115,109,107,106,106,106]
};
const bands=[9,24,49,99,100,499,Infinity];
const mainImage=document.querySelector('#main-image'),thumbs=[...document.querySelectorAll('.thumb')],quantity=document.querySelector('#quantity'),presets=[...document.querySelectorAll('[data-qty]')],selectionSummary=document.querySelector('#selection-summary'),shippingBadge=document.querySelector('#shipping-badge'),shippingCopy=document.querySelector('#shipping-copy'),unitPriceEl=document.querySelector('#unit-price'),productTotalEl=document.querySelector('#product-total'),savingsNote=document.querySelector('#savings-note'),deliveryFieldset=document.querySelector('#delivery-fieldset'),localMethodFieldset=document.querySelector('#local-method-fieldset'),lorryOption=document.querySelector('#lorry-option'),artwork=document.querySelector('#artwork'),artworkName=document.querySelector('#artwork-name'),mockupMagnet=document.querySelector('#mockup-magnet'),mockupPlaceholder=document.querySelector('#mockup-placeholder'),form=document.querySelector('#order-form'),formStatus=document.querySelector('#form-status');
let artworkObjectUrl='';
thumbs.forEach(thumb=>thumb.addEventListener('click',()=>{thumbs.forEach(item=>item.classList.remove('active'));thumb.classList.add('active');mainImage.style.opacity='.25';setTimeout(()=>{mainImage.src=thumb.dataset.image;mainImage.alt=thumb.dataset.alt;mainImage.style.opacity='1'},120)}));
presets.forEach(button=>button.addEventListener('click',()=>{quantity.value=button.dataset.qty;presets.forEach(item=>item.classList.toggle('active',item===button));updateSummary()}));
quantity.addEventListener('input',()=>{presets.forEach(button=>button.classList.toggle('active',button.dataset.qty===quantity.value));updateSummary()});
quantity.addEventListener('blur',()=>{quantity.value=Math.max(2,Math.round(Number(quantity.value)||2));updateSummary()});
document.querySelectorAll('input[name="size"],input[name="delivery"],input[name="zone"],input[name="local-method"]').forEach(input=>input.addEventListener('change',updateSummary));
artwork.addEventListener('change',()=>{const file=artwork.files[0];if(!file)return;if(artworkObjectUrl)URL.revokeObjectURL(artworkObjectUrl);artworkObjectUrl=URL.createObjectURL(file);mockupMagnet.style.backgroundImage=`url("${artworkObjectUrl}")`;mockupPlaceholder.hidden=true;artworkName.textContent=file.name;});
function selected(name){return document.querySelector(`input[name="${name}"]:checked`)?.value||''}
function money(value){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value)}
function qtyValue(){return Math.max(2,Math.round(Number(quantity.value)||2))}
function priceFor(size,qty){if(!prices[size])return null;return prices[size][bands.findIndex(max=>qty<=max)]}
function updateMockupShape(size){const values=size.match(/(\d+)\s*×\s*(\d+)/);mockupMagnet.style.aspectRatio=values?`${values[1]} / ${values[2]}`:'1';mockupMagnet.style.width=values&&Number(values[2])>Number(values[1])?'92px':'118px'}
function shippingFor(zone,qty,total){
  deliveryFieldset.hidden=zone!=='Outside Coimbatore';lorryOption.hidden=qty<=100;
  localMethodFieldset.hidden=zone!=='Within 10 km of Podanur';
  if(zone==='Within 10 km of Podanur'&&selected('local-method')==='Pickup from Podanur')return ['FREE PICKUP','Collect your order from Podanur at no delivery charge.'];
  if(zone==='Within 10 km of Podanur'&&total>=999)return ['FREE LOCAL DELIVERY','Free delivery within 10 km of Podanur for orders of ₹999 or more.'];
  if(zone==='Within 10 km of Podanur')return ['₹49 LOCAL DELIVERY','Local delivery is ₹49. Pickup from Podanur is free.'];
  if(zone==='Other Coimbatore')return ['DELIVERY EXTRA','Delivery charge will be calculated based on your location.'];
  if(qty>100)return ['SHIPPING EXTRA','Shipping is calculated after packing and paid at delivery or collection.'];
  return ['SHIPPING EXTRA','Actual courier charge will be confirmed before payment. Courier-office collection can be sent to-pay.'];
}
function updateSummary(){
  const qty=qtyValue(),size=selected('size'),zone=selected('zone'),unit=priceFor(size,qty),total=unit?unit*qty:0;
  selectionSummary.textContent=`${size} · ${qty} pieces`;unitPriceEl.textContent=unit?money(unit):'On request';productTotalEl.textContent=unit?money(total):'Custom quote';
  const shipping=shippingFor(zone,qty,total);shippingBadge.textContent=shipping[0];shippingCopy.textContent=shipping[1];shippingBadge.classList.toggle('charge',!shipping[0].startsWith('FREE'));
  const saving=unit?(prices[size][0]-unit)*qty:0;savingsNote.textContent=saving>0?`Bulk price applied — you save ${money(saving)} on this selection.`:'';updateMockupShape(size);
}
form.addEventListener('submit',event=>{
  event.preventDefault();const qty=qtyValue(),name=document.querySelector('#customer-name').value.trim(),area=document.querySelector('#customer-area').value.trim(),size=selected('size'),zone=selected('zone'),unit=priceFor(size,qty),total=unit?unit*qty:0;
  if(!area){formStatus.textContent='Please enter the delivery area or PIN code.';return}formStatus.textContent='';
  const delivery=zone==='Outside Coimbatore'?selected('delivery'):zone==='Within 10 km of Podanur'?selected('local-method'):'Local delivery to be coordinated',shipping=shippingFor(zone,qty,total).join(' — ');

  // Meta Pixel conversion: valid order intent immediately before WhatsApp opens.
  if(typeof window.fbq==='function'){
    const pixelData={
      content_name:'Flexible Fridge Magnet 1 mm',
      content_category:'Personalised Products',
      content_ids:[size],
      content_type:'product',
      num_items:qty,
      currency:'INR'
    };
    if(unit)pixelData.value=total;
    window.fbq('track','InitiateCheckout',pixelData);
  }

  const message=['Hello Best2Buy, I would like to order Flexible Fridge Magnet 1 mm.',`Size: ${size}`,`Quantity: ${qty}`,unit&&`Price per piece: ${money(unit)}`,unit&&`Product total: ${money(total)}`,`Delivery zone: ${zone}`,`Delivery preference: ${delivery}`,`Shipping: ${shipping}`,name&&`Customer name: ${name}`,`Delivery area / PIN: ${area}`,artwork.files[0]&&`Artwork selected: ${artwork.files[0].name} (I will attach the original image in WhatsApp)`,'Please confirm artwork, payment and delivery details.'].filter(Boolean).join('\n');
  window.open(window.best2buyWhatsApp(message),'_blank','noopener,noreferrer');
});
updateSummary();
