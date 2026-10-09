/* Magnetic Fridge Photo Calendar A5 — same order flow as fridge-magnets.js (delivery rules, WhatsApp checkout, Meta Pixel). */
const PRODUCT_NAME='Magnetic Fridge Photo Calendar A5';
const prices={'0.5 mm':149,'1 mm':277};   /* per piece, flat price (no bulk bands) */
const mainImage=document.querySelector('#main-image'),thumbs=[...document.querySelectorAll('.thumb')],quantity=document.querySelector('#quantity'),presets=[...document.querySelectorAll('[data-qty]')],selectionSummary=document.querySelector('#selection-summary'),shippingBadge=document.querySelector('#shipping-badge'),shippingCopy=document.querySelector('#shipping-copy'),unitPriceEl=document.querySelector('#unit-price'),productTotalEl=document.querySelector('#product-total'),deliveryFieldset=document.querySelector('#delivery-fieldset'),localMethodFieldset=document.querySelector('#local-method-fieldset'),lorryOption=document.querySelector('#lorry-option'),artwork=document.querySelector('#artwork'),artworkName=document.querySelector('#artwork-name'),mockupPhoto=document.querySelector('#mockup-magnet'),mockupPlaceholder=document.querySelector('#mockup-placeholder'),form=document.querySelector('#order-form'),formStatus=document.querySelector('#form-status');
let artworkObjectUrl='';
thumbs.forEach(thumb=>thumb.addEventListener('click',()=>{thumbs.forEach(item=>item.classList.remove('active'));thumb.classList.add('active');mainImage.style.opacity='.25';setTimeout(()=>{mainImage.src=thumb.dataset.image;mainImage.alt=thumb.dataset.alt;mainImage.style.opacity='1'},120)}));
presets.forEach(button=>button.addEventListener('click',()=>{quantity.value=button.dataset.qty;presets.forEach(item=>item.classList.toggle('active',item===button));updateSummary()}));
quantity.addEventListener('input',()=>{presets.forEach(button=>button.classList.toggle('active',button.dataset.qty===quantity.value));updateSummary()});
quantity.addEventListener('blur',()=>{quantity.value=qtyValue();updateSummary()});
document.querySelectorAll('input[name="size"],input[name="delivery"],input[name="zone"],input[name="local-method"]').forEach(input=>input.addEventListener('change',updateSummary));
artwork.addEventListener('change',()=>{const file=artwork.files[0];if(!file)return;if(artworkObjectUrl)URL.revokeObjectURL(artworkObjectUrl);artworkObjectUrl=URL.createObjectURL(file);mockupPhoto.style.backgroundImage=`url("${artworkObjectUrl}")`;mockupPlaceholder.hidden=true;artworkName.textContent=file.name});
function selected(name){return document.querySelector(`input[name="${name}"]:checked`)?.value||''}
function money(value){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value)}
function qtyValue(){return Math.max(1,Math.round(Number(quantity.value)||1))}
function piecesText(qty){return `${qty} ${qty===1?'piece':'pieces'}`}
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
  const qty=qtyValue(),thickness=selected('size'),zone=selected('zone'),unit=prices[thickness]||0,total=unit*qty;
  selectionSummary.textContent=`${thickness} · ${piecesText(qty)}`;unitPriceEl.textContent=money(unit);productTotalEl.textContent=money(total);
  const shipping=shippingFor(zone,qty,total);shippingBadge.textContent=shipping[0];shippingCopy.textContent=shipping[1];shippingBadge.classList.toggle('charge',!shipping[0].startsWith('FREE'));
}
form.addEventListener('submit',event=>{
  event.preventDefault();const qty=qtyValue(),name=document.querySelector('#customer-name').value.trim(),area=document.querySelector('#customer-area').value.trim(),thickness=selected('size'),zone=selected('zone'),unit=prices[thickness]||0,total=unit*qty;
  if(!area){formStatus.textContent='Please enter the delivery area or PIN code.';return}formStatus.textContent='';
  const delivery=zone==='Outside Coimbatore'?selected('delivery'):zone==='Within 10 km of Podanur'?selected('local-method'):'Local delivery to be coordinated',shipping=shippingFor(zone,qty,total).join(' — ');

  // Meta Pixel conversion: valid order intent immediately before WhatsApp opens.
  if(typeof window.fbq==='function'){
    window.fbq('track','InitiateCheckout',{content_name:PRODUCT_NAME,content_category:'Personalised Products',content_ids:[`A5 ${thickness}`],content_type:'product',num_items:qty,currency:'INR',value:total});
  }

  const message=[`Hello Best2Buy, I would like to order ${PRODUCT_NAME}.`,'Size: A5 (148 × 210 mm)',`Thickness: ${thickness}`,`Quantity: ${qty}`,`Price per piece: ${money(unit)}`,`Product total: ${money(total)}`,`Delivery zone: ${zone}`,`Delivery preference: ${delivery}`,`Shipping: ${shipping}`,name&&`Customer name: ${name}`,`Delivery area / PIN: ${area}`,artwork.files[0]&&`Photo selected: ${artwork.files[0].name} (I will attach the original image in WhatsApp)`,'Please confirm artwork, payment and delivery details.'].filter(Boolean).join('\n');
  window.open(window.best2buyWhatsApp(message),'_blank','noopener,noreferrer');
});
updateSummary();
