const translations={
en:{navProducts:"Products",navHow:"How it works",navContact:"Contact",heroCopy:"Turn a special moment into a gift they will remember.",explore:"Explore gifts",eyebrow:"PERSONALIZED GIFTS",introTitle:"Some moments deserve to be remembered.",introText:"Choose a box, add your photo and write the words that matter.",collection:"THE COLLECTION",chooseBox:"Choose your box.",miniDesc:"A small box with a big emotion.",classicDesc:"More sweetness, more memories.",powerDesc:"A memory with something useful to keep.",puzzle:"A4 puzzle · 120 pieces",candle:"Candle",card:"Personalized card",sweets:"Assorted sweets",power:"Magnetic powerbank",choose:"Personalize",popular:"MOST LOVED",simple:"SIMPLE",howTitle:"Make it yours in three steps.",step1Title:"Choose a box",step1Text:"Pick the gift that fits your moment.",step2Title:"Add your photo",step2Text:"Upload the photo that makes the memory yours.",step3Title:"Write a message",step3Text:"Add a personal message for the card.",worldTitle:"Made to travel across the world.",worldText:"We deliver worldwide. Shipping is calculated separately according to the destination and delivery method.",contact:"Contact",shipping:"Shipping",worldwide:"Worldwide delivery",shippingSeparate:"Shipping cost calculated separately.",rights:"All rights reserved.",personalizeEyebrow:"MAKE IT PERSONAL",upload:"Upload your photo",cardMessage:"Message for the card",addCart:"Add to cart",yourCart:"Your cart",total:"Total",checkout:"Checkout",account:"Your account",accountText:"Sign in to keep your orders and personalization details together.",apple:"Continue with Apple",google:"Continue with Google",email:"Continue with Email",oauthNote:"Authentication will be connected in the next backend stage."},

lv:{navProducts:"Produkti",navHow:"Kā tas darbojas",navContact:"Kontakti",heroCopy:"Pārvērt īpašu mirkli dāvanā, ko atcerēsies.",explore:"Apskatīt dāvanas",eyebrow:"PERSONALIZĒTAS DĀVANAS",introTitle:"Daži mirkļi ir pelnījuši palikt atmiņā.",introText:"Izvēlies komplektu, pievieno foto un uzraksti svarīgos vārdus.",collection:"KOLEKCIJA",chooseBox:"Izvēlies savu komplektu.",miniDesc:"Mazs komplekts ar lielām emocijām.",classicDesc:"Vairāk salduma, vairāk atmiņu.",powerDesc:"Atmiņa kopā ar noderīgu dāvanu.",puzzle:"A4 puzle · 120 detaļas",candle:"Svece",card:"Personalizēta kartīte",sweets:"Dažādi saldumi",power:"Magnētisks powerbank",choose:"Personalizēt",popular:"MĪĻĀKAIS",simple:"VIENKĀRŠI",howTitle:"Izveido to trīs soļos.",step1Title:"Izvēlies komplektu",step1Text:"Izvēlies dāvanu savam īpašajam mirklim.",step2Title:"Pievieno foto",step2Text:"Augšupielādē foto, kas padara atmiņu īpašu.",step3Title:"Uzraksti ziņu",step3Text:"Pievieno personīgu novēlējumu kartītei.",worldTitle:"Dāvana, kas ceļo pa visu pasauli.",worldText:"Piegādājam visā pasaulē. Piegādes cena tiek aprēķināta atsevišķi atkarībā no valsts un piegādes veida.",contact:"Kontakti",shipping:"Piegāde",worldwide:"Piegāde visā pasaulē",shippingSeparate:"Piegādes cena tiek aprēķināta atsevišķi.",rights:"Visas tiesības aizsargātas.",personalizeEyebrow:"PERSONALIZĒ DĀVANU",upload:"Augšupielādē foto",cardMessage:"Ziņa kartītei",addCart:"Pievienot grozam",yourCart:"Tavs grozs",total:"Kopā",checkout:"Noformēt pasūtījumu",account:"Tavs konts",accountText:"Ielogojies, lai saglabātu pasūtījumus un personalizācijas informāciju.",apple:"Turpināt ar Apple",google:"Turpināt ar Google",email:"Turpināt ar e-pastu",oauthNote:"Autorizācija tiks pievienota nākamajā backend izstrādes posmā."},

ru:{navProducts:"Товары",navHow:"Как это работает",navContact:"Контакты",heroCopy:"Преврати особенный момент в подарок, который будут помнить.",explore:"Выбрать подарок",eyebrow:"ПЕРСОНАЛИЗИРОВАННЫЕ ПОДАРКИ",introTitle:"Некоторые моменты заслуживают того, чтобы их запомнили.",introText:"Выбери бокс, добавь фотографию и напиши важные слова.",collection:"КОЛЛЕКЦИЯ",chooseBox:"Выбери свой бокс.",miniDesc:"Небольшой бокс с большой эмоцией.",classicDesc:"Больше сладкого, больше воспоминаний.",powerDesc:"Память и полезный подарок в одном.",puzzle:"Пазл A4 · 120 деталей",candle:"Свеча",card:"Персональная открытка",sweets:"Разные конфеты",power:"Магнитный powerbank",choose:"Персонализировать",popular:"ЛЮБИМЫЙ",simple:"ПРОСТО",howTitle:"Сделай его особенным за три шага.",step1Title:"Выбери бокс",step1Text:"Выбери подарок для своего особенного момента.",step2Title:"Добавь фото",step2Text:"Загрузи фотографию, которая хранит воспоминание.",step3Title:"Напиши послание",step3Text:"Добавь личные слова для открытки.",worldTitle:"Подарок, который может отправиться по всему миру.",worldText:"Доставляем по всему миру. Стоимость доставки рассчитывается отдельно в зависимости от страны и способа доставки.",contact:"Контакты",shipping:"Доставка",worldwide:"Доставка по всему миру",shippingSeparate:"Стоимость доставки рассчитывается отдельно.",rights:"Все права защищены.",personalizeEyebrow:"СДЕЛАЙ ПОДАРОК ЛИЧНЫМ",upload:"Загрузить фотографию",cardMessage:"Текст для открытки",addCart:"Добавить в корзину",yourCart:"Ваша корзина",total:"Итого",checkout:"Оформить заказ",account:"Личный кабинет",accountText:"Войдите, чтобы хранить заказы и данные персонализации.",apple:"Продолжить с Apple",google:"Продолжить с Google",email:"Продолжить по email",oauthNote:"Авторизация будет подключена на следующем этапе разработки."}
};

let lang=localStorage.getItem("alvoxisLang")||"en";
let selected=null;
let cart=JSON.parse(localStorage.getItem("alvoxisCart")||"[]");

const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

function t(key){
  return (translations[lang]&&translations[lang][key])||translations.en[key]||key;
}

function applyLang(){
  document.documentElement.lang=lang;

  $$("#language option").forEach(o=>{
    o.selected=o.value===lang;
  });

  $$("[data-i18n]").forEach(el=>{
    el.textContent=t(el.dataset.i18n);
  });
}

function openModal(id){
  const m=$("#"+id);
  if(!m)return;

  m.classList.add("open");
  m.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
}

function closeModal(id){
  const m=$("#"+id);
  if(!m)return;

  m.classList.remove("open");
  m.setAttribute("aria-hidden","true");
  document.body.style.overflow="";
}

const language=$("#language");

if(language){
  language.addEventListener("change",e=>{
    lang=e.target.value;
    localStorage.setItem("alvoxisLang",lang);
    applyLang();
  });
}

$$("[data-close]").forEach(b=>{
  b.addEventListener("click",()=>{
    closeModal(b.dataset.close);
  });
});

$$(".modal").forEach(m=>{
  m.addEventListener("click",e=>{
    if(e.target===m){
      closeModal(m.id);
    }
  });
});

$$(".personalize").forEach(btn=>{
  btn.addEventListener("click",()=>{
    selected={
      product:btn.dataset.product,
      price:Number(btn.dataset.price)
    };

    const name=$("#modalProductName");

    if(name){
      name.textContent=
        selected.product[0].toUpperCase()+
        selected.product.slice(1);
    }

    const photo=$("#photoInput");
    const preview=$("#photoPreview");
    const message=$("#cardMessage");
    const count=$("#charCount");

    if(photo)photo.value="";

    if(preview){
      preview.hidden=true;
      preview.removeAttribute("src");
    }

    if(message)message.value="";

    if(count)count.textContent="0";

    openModal("personalizeModal");
  });
});

const photoInput=$("#photoInput");

if(photoInput){
  photoInput.addEventListener("change",e=>{
    const file=e.target.files[0];

    if(!file)return;

    if(file.size>10*1024*1024){
      alert("Please choose an image up to 10 MB.");
      e.target.value="";
      return;
    }

    const reader=new FileReader();

    reader.onload=ev=>{
      const preview=$("#photoPreview");

      if(preview){
        preview.src=ev.target.result;
        preview.hidden=false;
      }
    };

    reader.readAsDataURL(file);
  });
}

const cardMessage=$("#cardMessage");

if(cardMessage){
  cardMessage.addEventListener("input",e=>{
    const count=$("#charCount");

    if(count){
      count.textContent=e.target.value.length;
    }
  });
}

function saveCart(){
  localStorage.setItem(
    "alvoxisCart",
    JSON.stringify(cart)
  );

  renderCart();
}
const placeOrderBtn = $("#placeOrderBtn");

if (placeOrderBtn) {
  placeOrderBtn.addEventListener("click", async () => {
    const customer = {
      name: $("#checkoutName")?.value.trim() || "",
      email: $("#checkoutEmail")?.value.trim() || "",
      phone: $("#checkoutPhone")?.value.trim() || "",
      country: $("#checkoutCountry")?.value.trim() || "",
      city: $("#checkoutCity")?.value.trim() || "",
      address: $("#checkoutAddress")?.value.trim() || "",
      postal: $("#checkoutPostal")?.value.trim() || "",
      comment: $("#checkoutComment")?.value.trim() || ""
    };

    if (
      !customer.name ||
      !customer.email ||
      !customer.phone ||
      !customer.country ||
      !customer.city ||
      !customer.address ||
      !customer.postal
    ) {
      alert("Please complete all required fields.");
      return;
    }

    const productNames = {
      mini: "ALVOXIS Mini Gift Box",
      classic: "ALVOXIS Classic Gift Box",
      powerbank: "ALVOXIS Powerbank Gift Box",
      "ALVOXIS Mini Gift Box": "ALVOXIS Mini Gift Box",
      "ALVOXIS Classic Gift Box": "ALVOXIS Classic Gift Box",
      "ALVOXIS Powerbank Gift Box": "ALVOXIS Powerbank Gift Box"
    };

    const items = cart.map(item => ({
      product: productNames[item.product] || item.product,
      quantity: 1
    }));

    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "Processing...";

    try {
      const response = await fetch(
        "https://funny-strudel-054314.netlify.app/.netlify/functions/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            items,
            customer
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Payment error");
      }

      window.location.href = data.url;

    } catch (error) {
      console.error("Payment error:", error);
      alert("Unable to start payment. Please try again.");

      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = "Continue to payment";
    }
  });
}
function renderCart(){
  const cartCount=$("#cartCount");
  const box=$("#cartItems");
  const totalEl=$("#cartTotal");

  if(cartCount){
    cartCount.textContent=cart.length;
  }

  if(!box||!totalEl)return;

  if(!cart.length){
    box.innerHTML=
      '<p class="muted">Your cart is empty.</p>';

    totalEl.textContent="€0,00";
    return;
  }

  box.innerHTML=cart.map((x,i)=>`
    <div class="cart-row">
      <div>
        <b>${x.product}</b>
        <small>
          €${x.price.toFixed(2).replace(".",",")}
          ${x.message?" · personalized card":""}
          ${x.hasPhoto?" · photo added":""}
        </small>
      </div>

      <button class="remove" data-remove="${i}">
        Remove
      </button>
    </div>
  `).join("");

  const total=cart.reduce(
    (sum,x)=>sum+x.price,
    0
  );

  totalEl.textContent=
    "€"+total.toFixed(2).replace(".",",");

  $$(".remove").forEach(b=>{
    b.addEventListener("click",()=>{
      cart.splice(
        Number(b.dataset.remove),
        1
      );

      saveCart();
    });
  });
}

const addToCart=$("#addToCart");

if(addToCart){
  addToCart.addEventListener("click",()=>{
    if(!selected)return;

    const message=$("#cardMessage");
    const preview=$("#photoPreview");

    cart.push({
      product:selected.product,
      price:selected.price,
      message:message?message.value.trim():"",
      hasPhoto:!!(preview&&preview.src)
    });

    saveCart();

    closeModal("personalizeModal");
    openModal("cartModal");
  });
}

const cartBtn=$("#cartBtn");

if(cartBtn){
  cartBtn.addEventListener("click",()=>{
    renderCart();
    openModal("cartModal");
  });
}

const accountBtn=$("#accountBtn");

if(accountBtn){
  accountBtn.addEventListener("click",()=>{
    openModal("accountModal");
  });
}

const checkoutBtn=$("#checkoutBtn");

if(checkoutBtn){
  checkoutBtn.addEventListener("click",()=>{
    if(!cart.length){
      alert("Your cart is empty.");
      return;
    }

    closeModal("cartModal");
    openModal("checkoutModal");
  });
}

/* ================================
   ALVOXIS HERO VIDEO SLIDER
   VIDEO 1 → VIDEO 2 → VIDEO 1...
================================ */

function startHeroVideos(){

  const videoA=$("#heroVideoA");
  const videoB=$("#heroVideoB");

  const heroA=$(".hero-video-a");
  const heroB=$(".hero-video-b");

  if(!videoA||!videoB||!heroA||!heroB){
    return;
  }

  let showingA=true;

  function showA(){

    showingA=true;

    videoB.pause();

    videoA.currentTime=0;

    heroB.style.opacity="0";
    heroA.style.opacity="1";

    videoA.play().catch(()=>{});
  }

  function showB(){

    showingA=false;

    videoA.pause();

    videoB.currentTime=0;

    heroA.style.opacity="0";
    heroB.style.opacity="1";

    videoB.play().catch(()=>{});
  }

  videoA.addEventListener("ended",()=>{
    if(showingA){
      showB();
    }
  });

  videoB.addEventListener("ended",()=>{
    if(!showingA){
      showA();
    }
  });

  heroA.style.opacity="1";
  heroB.style.opacity="0";

  videoB.pause();

  videoA.currentTime=0;

  videoA.play().catch(()=>{});
}

startHeroVideos();

applyLang();

renderCart();



/* =========================================
   ALVOXIS — TRUE BOOK PAGE TURNING
========================================= */

(function () {
  if (window.__alvoxisBookInitialized) return;

  window.__alvoxisBookInitialized = true;

  const book = document.querySelector(".book");

  const pages = Array.from(
    document.querySelectorAll(".book-page")
  );

  const prevButton =
    document.getElementById("bookPrev");

  const nextButton =
    document.getElementById("bookNext");

  const counter =
    document.getElementById("bookCounter");

  if (
    !book ||
    !pages.length ||
    !prevButton ||
    !nextButton ||
    !counter
  ) {
    return;
  }

  let currentPage = 0;
  let isAnimating = false;
  let touchStartX = 0;

  function preparePages() {
    pages.forEach(function (page, index) {
      page.classList.remove(
        "active",
        "flipped",
        "before"
      );

      page.style.zIndex = pages.length - index;

      if (index === 0) {
        page.classList.add("active");
      } else {
        page.classList.add("before");
      }
    });
  }

  function updateCounter() {
    counter.textContent =
      String(currentPage + 1).padStart(2, "0") +
      " / " +
      String(pages.length).padStart(2, "0");

    prevButton.disabled = currentPage === 0;

    nextButton.disabled =
      currentPage === pages.length - 1;
  }

  

function startEffect() {
  const container = document.createElement("div");

  container.className = "book-sparkle-container";

  Object.assign(container.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    overflow: "visible",
    pointerEvents: "none",
    zIndex: "99999"
  });

  document.body.appendChild(container);

  const symbols = ["✦", "✧", "⋆", "✶", "•"];

  for (let i = 0; i < 70; i++) {
    const particle = document.createElement("span");

    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 230;

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    const size = 5 + Math.random() * 14;
    const duration = 500 + Math.random() * 400;

    particle.textContent =
      symbols[Math.floor(Math.random() * symbols.length)];

    Object.assign(particle.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      color: Math.random() > 0.4
        ? "#f6d477"
        : "#fff4bd",
      fontSize: `${size}px`,
      fontWeight: "bold",
      opacity: "0",
      transform: "translate(-50%, -50%) scale(0)",
      textShadow: `
        0 0 5px #fff4bd,
        0 0 12px #e8b84e,
        0 0 25px #d49a35
      `,
      transition: `
        transform ${duration}ms cubic-bezier(0.15, 0.8, 0.3, 1),
        opacity ${duration}ms ease-out
      `
    });

    container.appendChild(particle);

    requestAnimationFrame(() => {
      particle.style.opacity = "1";

      particle.style.transform = `
        translate(
          calc(-50% + ${x}px),
          calc(-50% + ${y}px)
        )
        scale(${0.7 + Math.random() * 1.5})
        rotate(${Math.random() * 720 - 360}deg)
      `;
    });
  }

  book.classList.remove("is-flipping");

  void book.offsetWidth;

  book.classList.add("is-flipping");

  return container;
}

function finishEffect(container) {
  setTimeout(() => {
    book.classList.remove("is-flipping");

    if (container) {
      container.remove();
    }

    isAnimating = false;
  }, 900);
}

function turnForward() {
    if (isAnimating) return;

    if (currentPage >= pages.length - 1) {
      return;
    }

    isAnimating = true;

    const particles = startEffect();

    const current = pages[currentPage];
    const next = pages[currentPage + 1];

    current.classList.remove("active");
    current.classList.add("flipped");

    next.classList.remove("before");
    next.classList.add("active");

    currentPage++;

    updateCounter();
    finishEffect(particles);
  }

  function turnBackward() {
    if (isAnimating) return;

    if (currentPage <= 0) {
      return;
    }

    isAnimating = true;

    const particles = startEffect();

    const current = pages[currentPage];
    const previous = pages[currentPage - 1];

    current.classList.remove("active");
    current.classList.add("before");

    previous.classList.remove("flipped");
    previous.classList.add("active");

    currentPage--;

    updateCounter();
    finishEffect(particles);
  }

  nextButton.addEventListener(
    "click",
    turnForward
  );

  prevButton.addEventListener(
    "click",
    turnBackward
  );

  book.addEventListener(
    "touchstart",
    function (event) {
      touchStartX =
        event.changedTouches[0].screenX;
    },
    { passive: true }
  );

  book.addEventListener(
    "touchend",
    function (event) {
      const touchEndX =
        event.changedTouches[0].screenX;

      const distance =
        touchEndX - touchStartX;

      if (Math.abs(distance) < 60) {
        return;
      }

      if (distance < 0) {
        turnForward();
      } else {
        turnBackward();
      }
    },
    { passive: true }
  );

  const exploreAgain =
    document.querySelector(".book-final a");

  if (exploreAgain) {
    exploreAgain.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        if (isAnimating) return;

        currentPage = 0;

        preparePages();
        updateCounter();
      }
    );
  }

  preparePages();
  updateCounter();
})();
