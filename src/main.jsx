import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Search, ShoppingBag, Menu, X, Fish, Waves, Truck, ShieldCheck, Heart, Plus, Minus, Trash2, ArrowRight, MapPin, Phone, ImagePlus, Pencil, EyeOff } from "lucide-react";
import "./styles.css";

const PHONE = "919363381073";
const products = [
  {id:1,name:"Red Mosaic Guppy Pair",category:"Guppy Fish",price:180,tag:"Popular",emoji:"🐠",desc:"A vibrant guppy pair with flowing fins. Ask us to confirm current colour and stock."},
  {id:2,name:"Blue Moscow Guppy Pair",category:"Guppy Fish",price:250,tag:"Premium",emoji:"🐟",desc:"Deep blue colouration and graceful movement. Live stock is subject to availability."},
  {id:3,name:"Siamese Fighting Fish",category:"Betta Fish",price:220,tag:"Bestseller",emoji:"🐟",desc:"Beautiful betta fish. Colour, sex and availability should be confirmed before ordering."},
  {id:4,name:"Goldfish",category:"Goldfish",price:80,tag:"Classic",emoji:"🐠",desc:"A popular aquarium favourite. Tank size and care requirements apply."},
  {id:5,name:"Aquarium Starter Tank",category:"Aquarium",price:1299,tag:"Starter kit",emoji:"🫧",desc:"A starter aquarium option. Confirm dimensions and included accessories with the store."},
  {id:6,name:"Internal Aquarium Filter",category:"Equipment",price:450,tag:"Essential",emoji:"⚙️",desc:"Filtration equipment to help maintain aquarium water quality. Check tank compatibility."},
  {id:7,name:"Tropical Fish Food",category:"Fish Food",price:150,tag:"Daily care",emoji:"🥣",desc:"Everyday fish food. Ask the store for the suitable food type for your fish."},
  {id:8,name:"Aquatic Live Plant Bundle",category:"Aquarium Plants",price:199,tag:"Natural",emoji:"🌿",desc:"Aquatic plant selection. Plant varieties and availability may vary."},
  {id:9,name:"Bird Food Mix",category:"Pet Supplies",price:180,tag:"Pet care",emoji:"🦜",desc:"Pet bird food supply. Confirm the suitable mix for your bird."}
];
const categories = ["All","Guppy Fish","Betta Fish","Goldfish","Aquarium","Equipment","Fish Food","Aquarium Plants","Pet Supplies"];

function App(){
  const [category,setCategory]=useState("All");
  const [query,setQuery]=useState("");
  const [cart,setCart]=useState(()=>JSON.parse(localStorage.getItem("sda-cart")||"[]"));
  const [cartOpen,setCartOpen]=useState(false);
  const [mobileOpen,setMobileOpen]=useState(false);
  const [toast,setToast]=useState("");
  const [adminOpen,setAdminOpen]=useState(false);
  const [customProducts,setCustomProducts]=useState(()=>JSON.parse(localStorage.getItem("sda-products")||"[]"));
  const [productOverrides,setProductOverrides]=useState(()=>JSON.parse(localStorage.getItem("sda-product-overrides")||"{}"));
  const [newName,setNewName]=useState(""); const [newPrice,setNewPrice]=useState(""); const [newCategory,setNewCategory]=useState("Guppy Fish");
  const [newDescription,setNewDescription]=useState(""); const [newImage,setNewImage]=useState("");
  const [editingId,setEditingId]=useState(null);
  const allProducts=[...products.map(p=>({...p,...(productOverrides[p.id]||{})})),...customProducts].filter(p=>!p.hidden);
  const filtered=useMemo(()=>allProducts.filter(p=>(category==="All"||p.category===category)&&p.name.toLowerCase().includes(query.toLowerCase())),[category,query,customProducts]);
  const count=cart.reduce((s,i)=>s+i.qty,0), total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  function saveCart(next){setCart(next);localStorage.setItem("sda-cart",JSON.stringify(next));}
  function add(p){const found=cart.find(i=>i.id===p.id);saveCart(found?cart.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...cart,{...p,qty:1}]);setToast(`${p.name} added to cart`);setTimeout(()=>setToast(""),2200);}
  function qty(id,d){saveCart(cart.map(i=>i.id===id?{...i,qty:i.qty+d}:i).filter(i=>i.qty>0));}
  function checkout(){if(!cart.length)return;const lines=cart.map(i=>`${i.name} x ${i.qty} = ₹${i.price*i.qty}`).join("%0A");const msg=`Hello Sri Divya Aquatics & Pets,%0AI would like to enquire about this order:%0A${lines}%0AEstimated total: ₹${total}%0APlease confirm stock, delivery availability and final charges.`;window.open(`https://wa.me/${PHONE}?text=${msg}`,"_blank");}
  function persistCustom(next){setCustomProducts(next);localStorage.setItem("sda-products",JSON.stringify(next));}
  function persistOverrides(next){setProductOverrides(next);localStorage.setItem("sda-product-overrides",JSON.stringify(next));}
  function resetProductForm(){setNewName("");setNewPrice("");setNewCategory("Guppy Fish");setNewDescription("");setNewImage("");setEditingId(null);}
  function handleImageFile(file){
    if(!file)return;
    if(!file.type.startsWith("image/")){setToast("Please choose an image file.");setTimeout(()=>setToast(""),2200);return;}
    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const max=900,scale=Math.min(1,max/Math.max(img.width,img.height));
        const canvas=document.createElement("canvas");canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);
        canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
        setNewImage(canvas.toDataURL("image/jpeg",0.78));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  }
  function startEdit(p){
    setEditingId(p.id);setNewName(p.name);setNewPrice(String(p.price));setNewCategory(p.category);
    setNewDescription(p.desc||"");setNewImage(p.image||"");
  }
  function addProduct(e){
    e.preventDefault();if(!newName.trim()||!newPrice)return;
    if(editingId!==null){
      const patch={name:newName.trim(),price:Number(newPrice),category:newCategory,desc:newDescription,image:newImage||""};
      if(products.some(p=>p.id===editingId)){persistOverrides({...productOverrides,[editingId]:{...(productOverrides[editingId]||{}),...patch,hidden:false}});}
      else{persistCustom(customProducts.map(p=>p.id===editingId?{...p,...patch}:p));}
    }else{
      const p={id:Date.now(),name:newName.trim(),price:Number(newPrice),category:newCategory,tag:"New",emoji:"🐠",desc:newDescription||"Please confirm product details and availability.",image:newImage||""};
      persistCustom([...customProducts,p]);
    }
    resetProductForm();
    setToast(editingId!==null?"Product updated":"Product added");setTimeout(()=>setToast(""),2200);
  }
  function removeProduct(p){
    if(!window.confirm(`Remove "${p.name}" from the catalogue?`))return;
    if(products.some(base=>base.id===p.id)){persistOverrides({...productOverrides,[p.id]:{...(productOverrides[p.id]||{}),hidden:true}});}
    else{persistCustom(customProducts.filter(item=>item.id!==p.id));}
    if(editingId===p.id)resetProductForm();
  }
  return <div>
    <div className="announcement">Welcome to Sri Divya Aquatics & Pets <span>•</span> Uthangarai, Tamil Nadu</div>
    <header className="header">
      <a className="brand" href="#"><span className="brand-icon"><Waves size={25}/></span><span><b>SRI DIVYA</b><small>AQUATICS & PETS</small></span></a>
      <nav className={mobileOpen?"nav open":"nav"}><a href="#home" onClick={()=>setMobileOpen(false)}>Home</a><a href="#shop" onClick={()=>setMobileOpen(false)}>Shop</a><a href="#about" onClick={()=>setMobileOpen(false)}>About</a><a href="#contact" onClick={()=>setMobileOpen(false)}>Contact</a></nav>
      <div className="head-actions"><button className="icon-btn search-trigger" onClick={()=>document.getElementById("searchbox").focus()} aria-label="Search"><Search/></button><button className="cart-btn" onClick={()=>setCartOpen(true)}><ShoppingBag size={19}/> <span>Cart</span><b>{count}</b></button><button className="icon-btn menu-btn" onClick={()=>setMobileOpen(!mobileOpen)} aria-label="Menu">{mobileOpen?<X/>:<Menu/>}</button></div>
    </header>
    <main>
      <section className="hero" id="home"><div className="hero-overlay"></div><div className="hero-content"><div className="eyebrow"><span></span> YOUR AQUATIC WORLD STARTS HERE</div><h1>Bring home a little<br/><em>underwater magic.</em></h1><p>Discover beautiful aquarium fish, thoughtfully selected supplies and essentials for your pets.</p><div className="hero-actions"><a className="primary-btn" href="#shop">Explore products <ArrowRight size={18}/></a><a className="text-btn" href="#about">Discover our store</a></div><div className="hero-rating"><div className="stars">★★★★★</div><span><b>5.0/5</b> · 9 customer reviews</span></div></div><div className="hero-bubble bubble1"></div><div className="hero-bubble bubble2"></div></section>
      <section className="trust-strip"><div><Fish/><span><b>Fish & aquatics</b><small>A vibrant collection</small></span></div><div><ShieldCheck/><span><b>Care-first guidance</b><small>Ask before you buy</small></span></div><div><Truck/><span><b>Delivery enquiries</b><small>Availability confirmed first</small></span></div><div><Heart/><span><b>Pet essentials</b><small>For everyday care</small></span></div></section>
      <section className="shop-section section" id="shop"><div className="section-heading"><div><div className="eyebrow dark">SHOP OUR COLLECTION</div><h2>Find your new <em>favourite.</em></h2><p>Explore our sample catalogue. Contact us to confirm live stock and current prices.</p></div><div className="search-wrap"><Search size={18}/><input id="searchbox" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products..."/></div></div>
        <div className="category-row">{categories.map(c=><button key={c} className={category===c?"category active":"category"} onClick={()=>setCategory(c)}>{c}</button>)}</div>
        <div className="product-grid">{filtered.map(p=><article className="product-card" key={p.id}><div className="product-art"><span className="product-tag">{p.tag}</span>{p.image?<img className="product-photo" src={p.image} alt={p.name}/>:<span className="product-emoji">{p.emoji}</span>}<button className="quick-add" onClick={()=>add(p)} aria-label={`Add ${p.name}`}><Plus/></button></div><div className="product-info"><small>{p.category}</small><h3>{p.name}</h3><p>{p.desc}</p><div className="product-bottom"><b>₹{p.price.toLocaleString("en-IN")}</b><button onClick={()=>add(p)}>Add to cart <Plus size={15}/></button></div></div></article>)}</div>
        {!filtered.length&&<div className="empty">No products found. Try another search or category.</div>}
        <p className="catalog-note">* Product names, prices and items shown are starter examples. Please verify all product details and availability with the store before payment.</p>
      </section>
      <section className="care-banner"><div className="care-art">🐠</div><div><div className="eyebrow">A HEALTHY AQUARIUM IS A HAPPY AQUARIUM</div><h2>Not sure what your fish needs?</h2><p>Talk to our team about aquarium setup, fish care and product availability before placing your order.</p><a className="light-btn" href={`https://wa.me/${PHONE}?text=Hello%2C%20I%20need%20help%20with%20aquarium%20and%20fish%20care.`} target="_blank">Chat with us <ArrowRight size={17}/></a></div></section>
      <section className="about-section section" id="about"><div className="about-visual"><div className="about-image"><span>🐟</span><span>🪸</span><span>🌿</span></div><div className="rating-card"><div className="stars">★★★★★</div><b>5.0 out of 5</b><small>Based on 9 Google reviews</small></div></div><div className="about-copy"><div className="eyebrow dark">ABOUT OUR STORE</div><h2>Passion for pets.<br/><em>Love for aquatics.</em></h2><p>Sri Divya Aquatics & Pets is your neighbourhood pet and aquarium store in Uthangarai, Tamil Nadu. Visit us or get in touch to ask about our fish collection, aquarium essentials and pet supplies.</p><div className="about-points"><span><span>✓</span> Friendly customer service</span><span><span>✓</span> Aquarium and pet essentials</span><span><span>✓</span> Availability confirmed with care</span></div><a className="primary-btn" href="#contact">Visit our store <ArrowRight size={18}/></a></div></section>
      <section className="review-section"><div className="eyebrow">KIND WORDS FROM CUSTOMERS</div><h2>Trusted by local <em>pet lovers.</em></h2><div className="reviews"><blockquote><div className="stars">★★★★★</div><p>“Good quality fishes and very responsible to customer.”</p><b>— Customer review</b></blockquote><blockquote><div className="stars">★★★★★</div><p>“Good collection customer service good.”</p><b>— Customer review</b></blockquote><blockquote><div className="stars">★★★★★</div><p>“Very good shop.”</p><b>— Customer review</b></blockquote></div><small className="review-foot">Selected review excerpts supplied for the store profile.</small></section>
      <section className="contact-section section" id="contact"><div><div className="eyebrow dark">COME SAY HELLO</div><h2>Let’s talk <em>fish & pets.</em></h2><p>Visit our store in Uthangarai or contact us to check product and live-fish availability.</p><div className="contact-line"><MapPin/><span><b>Sri Divya Aquatics & Pets</b><small>93/34A, Uthangarai-Kallavi Road,<br/>Uthangarai, Tamil Nadu 635207</small></span></div><div className="contact-line"><Phone/><span><b>+91 93633 81073</b><small>Call or WhatsApp for enquiries</small></span></div><div className="contact-actions"><a className="primary-btn" href="https://www.google.com/maps/search/?api=1&query=Divya+Aquatics+Pets+93%2F34A+Uthangarai+Tamil+Nadu+635207" target="_blank">Get directions <MapPin size={17}/></a><a className="outline-btn" href={`https://wa.me/${PHONE}`} target="_blank">WhatsApp us</a></div></div><div className="map-card"><div className="map-pin"><MapPin size={30}/></div><b>Find us in Uthangarai</b><span>Tamil Nadu, India</span><a href="https://www.google.com/maps/search/?api=1&query=Divya+Aquatics+Pets+Uthangarai" target="_blank">Open in Google Maps <ArrowRight size={15}/></a></div></section>
      <section className="delivery-note"><Truck/><div><b>Live fish delivery notice</b><p>Live fish delivery depends on location, weather, travel conditions and safe transportation. Please confirm fish availability, delivery arrangements and final charges with Sri Divya Aquatics & Pets before payment.</p></div></section>
    </main>
    <footer><a className="brand footer-brand" href="#"><span className="brand-icon"><Waves/></span><span><b>SRI DIVYA</b><small>AQUATICS & PETS</small></span></a><p>Beautiful aquatics. Happier pets.</p><div className="footer-links"><a href="#shop">Shop</a><a href="#about">About</a><a href="#contact">Contact</a></div><small>© {new Date().getFullYear()} Sri Divya Aquatics & Pets. All rights reserved.</small><button className="admin-link" onClick={()=>setAdminOpen(true)}>Store admin demo</button></footer>
    {cartOpen&&<div className="drawer-backdrop" onClick={()=>setCartOpen(false)}><aside className="cart-drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div><small>YOUR SELECTION</small><h2>Shopping cart ({count})</h2></div><button className="icon-btn" onClick={()=>setCartOpen(false)}><X/></button></div>{!cart.length?<div className="empty-cart"><ShoppingBag size={38}/><h3>Your cart is waiting</h3><p>Add something lovely from our collection.</p><button className="primary-btn" onClick={()=>setCartOpen(false)}>Continue shopping</button></div>:<><div className="cart-items">{cart.map(i=><div className="cart-item" key={i.id}><div className="cart-thumb">{i.image?<img src={i.image} alt={i.name}/>:i.emoji}</div><div className="cart-detail"><b>{i.name}</b><small>₹{i.price.toLocaleString("en-IN")}</small><div className="qty"><button onClick={()=>qty(i.id,-1)}><Minus size={13}/></button><span>{i.qty}</span><button onClick={()=>qty(i.id,1)}><Plus size={13}/></button></div></div><button className="remove" onClick={()=>saveCart(cart.filter(x=>x.id!==i.id))}><Trash2 size={17}/></button></div>)}</div><div className="cart-summary"><div><span>Subtotal (estimate)</span><b>₹{total.toLocaleString("en-IN")}</b></div><small>Delivery and final price will be confirmed by the store.</small><button className="primary-btn full" onClick={checkout}>Enquire on WhatsApp <ArrowRight size={17}/></button></div></>}</aside></div>}
    {adminOpen&&<div className="modal-backdrop" onClick={()=>setAdminOpen(false)}><div className="admin-modal admin-manager" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div><small>LOCAL DEMO ONLY</small><h2>Product manager</h2></div><button className="icon-btn" onClick={()=>setAdminOpen(false)}><X/></button></div><p>Upload, replace or remove product photos. You can also edit or remove products from this browser's catalogue.</p>
      <form onSubmit={addProduct} className="admin-form">
        <label>Product name<input value={newName} onChange={e=>setNewName(e.target.value)} required placeholder="e.g. Platinum Guppy Pair"/></label>
        <div className="admin-fields"><label>Price (₹)<input type="number" min="1" value={newPrice} onChange={e=>setNewPrice(e.target.value)} required placeholder="250"/></label><label>Category<select value={newCategory} onChange={e=>setNewCategory(e.target.value)}>{categories.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}</select></label></div>
        <label>Description<textarea value={newDescription} onChange={e=>setNewDescription(e.target.value)} rows="2" placeholder="Product details and care notes"/></label>
        <div className="image-editor"><div className="image-preview">{newImage?<img src={newImage} alt="Product preview"/>:<div><ImagePlus size={27}/><small>No image selected</small></div>}</div><div className="image-actions"><label className="upload-btn"><ImagePlus size={16}/> {newImage?"Change image":"Upload image"}<input type="file" accept="image/*" onChange={e=>handleImageFile(e.target.files?.[0])}/></label>{newImage&&<button type="button" className="remove-image-btn" onClick={()=>setNewImage("")}><Trash2 size={15}/> Remove image</button>}<small>JPG, PNG or WebP. Images are resized for browser storage.</small></div></div>
        <div className="admin-form-actions"><button className="primary-btn">{editingId!==null?"Save changes":"Add product"} <Plus size={16}/></button>{editingId!==null&&<button type="button" className="outline-btn" onClick={resetProductForm}>Cancel edit</button>}</div>
      </form>
      <div className="manage-list-heading"><b>Catalogue products</b><small>{allProducts.length} products</small></div>
      <div className="manage-list">{allProducts.map(p=><div className="manage-product" key={p.id}><div className="manage-thumb">{p.image?<img src={p.image} alt=""/>:p.emoji}</div><div className="manage-product-info"><b>{p.name}</b><small>{p.category} · ₹{p.price}</small></div><button title="Edit product" onClick={()=>startEdit(p)}><Pencil size={15}/></button><button title="Remove product" className="delete-product" onClick={()=>removeProduct(p)}><Trash2 size={15}/></button></div>)}</div>
      <p className="catalog-note">Important: this demo stores images and product changes only in this browser. It is not a secure shared admin system. Add cloud storage and authenticated admin access before publishing.</p>
    </div></div>}
    {toast&&<div className="toast">{toast}</div>}
    <a className="whatsapp-float" href={`https://wa.me/${PHONE}`} target="_blank" aria-label="WhatsApp">◉</a>
  </div>
}
createRoot(document.getElementById("root")).render(<App/>);
