/* =========================================================
   ALVOXIS — TRANSLATIONS
   ========================================================= */

export const LANGUAGES = ["en", "lv", "ru", "et", "lt"];
export const DEFAULT_LANGUAGE = "en";

export const translations = {

  en: {
    nav: { catalog: "Catalog", account: "Account", cart: "Cart", about: "About" },
    hero: {
      eyebrow: "ALVOXIS PRESENTS",
      title: "Some moments deserve to be remembered.",
      skip: "Skip intro",
      play: "Play film"
    },
    catalog: {
      eyebrow: "THE ALVOXIS COLLECTION",
      scrollHint: "Drag to turn the page",
      coverEyebrow: "ALVOXIS",
      coverTitle: "Something meaningful is waiting.",
      coverText: "Discover a collection created for moments worth remembering.",
      comingSoon: "Coming soon",
      nextChapter: "The next chapter",
      nextChapterTitle: "Support the story.",
      nextChapterCopy: "ALVOXIS is still being written — page by page. This chapter is coming soon.",
      miniEyebrow: "THE MINI COLLECTION",
      classicEyebrow: "THE CLASSIC COLLECTION",
      coverAlt: "ALVOXIS gift box"
    },
    product: {
      selectGift: "Select this gift",
      unavailable: "Not available yet",
      contains: "What's inside",
      contentsList: [
        "A4 photo puzzle · 120 pieces",
        "A6 personalized greeting card",
        "Premium gift packaging"
      ],
      backToCatalog: "Back to catalog"
    },
    personalize: {
      title: "Personalize your gift",
      step1: "Your photo",
      step2: "Your message",
      step3: "Preview",
      uploadTitle: "Upload your photo",
      uploadHint: "Tap to upload, or drag and drop",
      puzzleLabel: "A4 puzzle · 120 pieces",
      puzzleExplain: "Your photo will be printed on an A4 jigsaw puzzle consisting of 120 pieces.",
      replace: "Replace photo",
      remove: "Remove photo",
      continue: "Continue",
      back: "Back",
      messageLabel: "A6 greeting card",
      messageExplain: "Write the message you would like us to print on your A6 greeting card.",
      placeholder: "Write your personal message…",
      charLimit: "characters",
      previewTitle: "Your gift",
      selectedBox: "Selected box",
      puzzleSection: "Puzzle",
      cardSection: "Greeting card",
      editPhoto: "Edit photo",
      editMessage: "Edit message",
      addToCart: "Add to cart",
      errorFileType: "Please upload a JPG or PNG image.",
      errorFileSize: "This image is too large. Please upload a file under 20MB.",
      errorGeneric: "Something went wrong. Please try again."
    },
    cart: {
      title: "Your cart",
      empty: "Your cart is empty.",
      continueShopping: "Continue shopping",
      quantity: "Quantity",
      subtotal: "Subtotal",
      total: "Total",
      checkout: "Checkout",
      remove: "Remove",
      puzzle: "A4 puzzle · 120 pieces",
      card: "A6 greeting card"
    },
    account: {
      title: "Account",
      loginTitle: "Sign in",
      registerTitle: "Create account",
      google: "Continue with Google",
      apple: "Continue with Apple",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      name: "Name",
      signIn: "Sign in",
      createAccount: "Create account",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      register: "Register",
      logIn: "Log in",
      dashboard: "My account",
      profile: "Profile",
      myOrders: "My orders",
      noOrders: "You have no orders yet.",
      logOut: "Log out",
      localNotice: "Your account is saved on this device only.",
      orderStatus: { pending: "Pending", paid: "Paid", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" },
      providerNotice: "This sign-in method requires a connected authentication backend and isn't active yet.",
      errorInvalid: "Incorrect email or password.",
      errorExists: "An account with this email already exists.",
      errorPasswordMatch: "Passwords do not match."
    },
    checkout: {
      title: "Checkout",
      delivery: "Delivery",
      payment: "Payment",
      confirmation: "Confirmation",
      fullName: "Full name",
      address: "Address",
      city: "City",
      postalCode: "Postal code",
      country: "Country",
      continueToPayment: "Continue to payment",
      payNow: "Pay now",
      backToCart: "Back to cart",
      stripeNotice: "Payments aren't connected yet — this checkout is ready to be wired to Stripe once the backend is deployed.",
      processing: "Processing…"
    },
    confirmation: {
      eyebrow: "Your moment is now a gift.",
      title: "Order confirmed",
      orderNumber: "Order number",
      viewOrder: "View my order",
      continueShopping: "Continue shopping",
      notFound: "We couldn't find this order."
    },
    footer: {
      tagline: "Some moments deserve to be remembered.",
      contact: "Contact",
      catalog: "Catalog",
      account: "Account",
      privacy: "Privacy Policy",
      terms: "Terms & Conditions",
      refund: "Refund Policy"
    },
    common: { loading: "Loading…", close: "Close", comingSoon: "Coming soon" },
    meta: { title: "ALVOXIS — Meaningful Moments" },
    about: {
      eyebrow: "THE IDEA BEHIND ALVOXIS",
      title: "Some gifts are opened. Others are remembered.",
      text: "ALVOXIS creates meaningful gift experiences designed to preserve emotions, memories and special moments."
    },
    a11y: {
      openMenu: "Open menu",
      language: "Language",
      book: "ALVOXIS collection",
      bookRole: "book",
      bookPages: "Book pages",
      prevPage: "Previous page",
      nextPage: "Next page",
      cover: "Cover"
    },
    form: {
      required: "Please fill in this field.",
      email: "Please enter a valid email address."
    },
    products: {
      mini: { name: "ALVOXIS Mini", tagline: "A small box. A meaningful memory." },
      classic: { name: "ALVOXIS Classic", tagline: "Designed for unforgettable moments." },
      signature: { name: "ALVOXIS Signature", tagline: "A new experience is coming." }
    }
  },

  ru: {
    nav: { catalog: "Каталог", account: "Аккаунт", cart: "Корзина", about: "О нас" },
    hero: {
      eyebrow: "ALVOXIS ПРЕДСТАВЛЯЕТ",
      title: "Некоторые моменты достойны того, чтобы их помнили.",
      skip: "Пропустить",
      play: "Смотреть фильм"
    },
    catalog: {
      eyebrow: "КОЛЛЕКЦИЯ ALVOXIS",
      scrollHint: "Проведите, чтобы перелистнуть",
      coverEyebrow: "ALVOXIS",
      coverTitle: "Кое-что важное уже ждёт вас.",
      coverText: "Откройте коллекцию, созданную для моментов, которые стоит помнить.",
      comingSoon: "Скоро",
      nextChapter: "Следующая глава",
      nextChapterTitle: "Поддержите историю.",
      nextChapterCopy: "ALVOXIS всё ещё пишется — страница за страницей. Эта глава скоро откроется.",
      miniEyebrow: "КОЛЛЕКЦИЯ MINI",
      classicEyebrow: "КОЛЛЕКЦИЯ CLASSIC",
      coverAlt: "Подарочная коробка ALVOXIS"
    },
    product: {
      selectGift: "Выбрать этот подарок",
      unavailable: "Пока недоступно",
      contains: "Что внутри",
      contentsList: [
        "Пазл A4 · 120 деталей",
        "Именная открытка A6",
        "Премиальная подарочная упаковка"
      ],
      backToCatalog: "Назад в каталог"
    },
    personalize: {
      title: "Персонализируйте подарок",
      step1: "Ваше фото",
      step2: "Ваше сообщение",
      step3: "Просмотр",
      uploadTitle: "Загрузите фотографию",
      uploadHint: "Нажмите, чтобы загрузить, или перетащите файл",
      puzzleLabel: "Пазл A4 · 120 деталей",
      puzzleExplain: "Ваша фотография будет напечатана на пазле формата A4, состоящем из 120 деталей.",
      replace: "Заменить фото",
      remove: "Удалить фото",
      continue: "Продолжить",
      back: "Назад",
      messageLabel: "Открытка A6",
      messageExplain: "Напишите текст, который вы хотите напечатать на открытке формата A6.",
      placeholder: "Напишите личное сообщение…",
      charLimit: "символов",
      previewTitle: "Ваш подарок",
      selectedBox: "Выбранный набор",
      puzzleSection: "Пазл",
      cardSection: "Открытка",
      editPhoto: "Изменить фото",
      editMessage: "Изменить сообщение",
      addToCart: "Добавить в корзину",
      errorFileType: "Пожалуйста, загрузите изображение в формате JPG или PNG.",
      errorFileSize: "Файл слишком большой. Загрузите изображение до 20 МБ.",
      errorGeneric: "Что-то пошло не так. Попробуйте ещё раз."
    },
    cart: {
      title: "Ваша корзина",
      empty: "Ваша корзина пуста.",
      continueShopping: "Продолжить покупки",
      quantity: "Количество",
      subtotal: "Промежуточный итог",
      total: "Итого",
      checkout: "Оформить заказ",
      remove: "Удалить",
      puzzle: "Пазл A4 · 120 деталей",
      card: "Открытка A6"
    },
    account: {
      title: "Аккаунт",
      loginTitle: "Вход",
      registerTitle: "Создать аккаунт",
      google: "Продолжить с Google",
      apple: "Продолжить с Apple",
      email: "Эл. почта",
      password: "Пароль",
      confirmPassword: "Подтвердите пароль",
      name: "Имя",
      signIn: "Войти",
      createAccount: "Создать аккаунт",
      noAccount: "Нет аккаунта?",
      haveAccount: "Уже есть аккаунт?",
      register: "Зарегистрироваться",
      logIn: "Войти",
      dashboard: "Мой аккаунт",
      profile: "Профиль",
      myOrders: "Мои заказы",
      noOrders: "У вас пока нет заказов.",
      logOut: "Выйти",
      localNotice: "Ваш аккаунт сохраняется только на этом устройстве.",
      orderStatus: { pending: "В обработке", paid: "Оплачен", shipped: "Отправлен", delivered: "Доставлен", cancelled: "Отменён" },
      providerNotice: "Этот способ входа требует подключённого сервиса аутентификации и пока не активен.",
      errorInvalid: "Неверный email или пароль.",
      errorExists: "Аккаунт с таким email уже существует.",
      errorPasswordMatch: "Пароли не совпадают."
    },
    checkout: {
      title: "Оформление заказа",
      delivery: "Доставка",
      payment: "Оплата",
      confirmation: "Подтверждение",
      fullName: "Полное имя",
      address: "Адрес",
      city: "Город",
      postalCode: "Индекс",
      country: "Страна",
      continueToPayment: "Перейти к оплате",
      payNow: "Оплатить",
      backToCart: "Назад в корзину",
      stripeNotice: "Оплата пока не подключена — этот раздел готов к интеграции со Stripe после развёртывания бэкенда.",
      processing: "Обработка…"
    },
    confirmation: {
      eyebrow: "Ваш момент теперь стал подарком.",
      title: "Заказ подтверждён",
      orderNumber: "Номер заказа",
      viewOrder: "Посмотреть заказ",
      continueShopping: "Продолжить покупки",
      notFound: "Этот заказ не найден."
    },
    footer: {
      tagline: "Некоторые моменты достойны того, чтобы их помнили.",
      contact: "Контакты",
      catalog: "Каталог",
      account: "Аккаунт",
      privacy: "Политика конфиденциальности",
      terms: "Условия использования",
      refund: "Политика возврата"
    },
    common: { loading: "Загрузка…", close: "Закрыть", comingSoon: "Скоро" },
    meta: { title: "ALVOXIS — Значимые моменты" },
    about: {
      eyebrow: "ИДЕЯ ALVOXIS",
      title: "Одни подарки открывают. Другие — помнят.",
      text: "ALVOXIS создаёт значимые подарки, которые сохраняют эмоции, воспоминания и особенные моменты."
    },
    a11y: {
      openMenu: "Открыть меню",
      language: "Язык",
      book: "Коллекция ALVOXIS",
      bookRole: "книга",
      bookPages: "Страницы книги",
      prevPage: "Предыдущая страница",
      nextPage: "Следующая страница",
      cover: "Обложка"
    },
    form: {
      required: "Пожалуйста, заполните это поле.",
      email: "Введите корректный адрес эл. почты."
    },
    products: {
      mini: { name: "ALVOXIS Mini", tagline: "Маленькая коробка. Значимая память." },
      classic: { name: "ALVOXIS Classic", tagline: "Создано для незабываемых моментов." },
      signature: { name: "ALVOXIS Signature", tagline: "Новый опыт уже на подходе." }
    }
  },

  lv: {
    nav: { catalog: "Katalogs", account: "Konts", cart: "Grozs", about: "Par mums" },
    hero: {
      eyebrow: "ALVOXIS PIEDĀVĀ",
      title: "Daži mirkļi ir pelnījuši palikt atmiņā.",
      skip: "Izlaist ievadu",
      play: "Atskaņot"
    },
    catalog: {
      eyebrow: "ALVOXIS KOLEKCIJA",
      scrollHint: "Velciet, lai pāršķirtu lapu",
      coverEyebrow: "ALVOXIS",
      coverTitle: "Kaut kas nozīmīgs jau gaida.",
      coverText: "Atklājiet kolekciju, kas radīta mirkļiem, kurus vērts atcerēties.",
      comingSoon: "Drīzumā",
      nextChapter: "Nākamā nodaļa",
      nextChapterTitle: "Atbalsti stāstu.",
      nextChapterCopy: "ALVOXIS joprojām tiek rakstīts — lapu pa lapai. Šī nodaļa drīzumā.",
      miniEyebrow: "MINI KOLEKCIJA",
      classicEyebrow: "CLASSIC KOLEKCIJA",
      coverAlt: "ALVOXIS dāvanu kaste"
    },
    product: {
      selectGift: "Izvēlēties šo dāvanu",
      unavailable: "Vēl nav pieejams",
      contains: "Kas iekšā",
      contentsList: [
        "A4 puzle · 120 gabaliņi",
        "Personalizēta A6 apsveikuma kartīte",
        "Prēmijas klases dāvanu iepakojums"
      ],
      backToCatalog: "Atpakaļ uz katalogu"
    },
    personalize: {
      title: "Personalizējiet savu dāvanu",
      step1: "Jūsu foto",
      step2: "Jūsu ziņojums",
      step3: "Priekšskatījums",
      uploadTitle: "Augšupielādējiet fotoattēlu",
      uploadHint: "Pieskarieties, lai augšupielādētu, vai velciet failu šeit",
      puzzleLabel: "A4 puzle · 120 gabaliņi",
      puzzleExplain: "Jūsu fotoattēls tiks izdrukāts uz A4 formāta puzles ar 120 gabaliņiem.",
      replace: "Nomainīt foto",
      remove: "Noņemt foto",
      continue: "Turpināt",
      back: "Atpakaļ",
      messageLabel: "A6 apsveikuma kartīte",
      messageExplain: "Uzrakstiet tekstu, ko vēlaties izdrukāt uz A6 formāta apsveikuma kartītes.",
      placeholder: "Uzrakstiet savu personīgo ziņojumu…",
      charLimit: "rakstzīmes",
      previewTitle: "Jūsu dāvana",
      selectedBox: "Izvēlētā kaste",
      puzzleSection: "Puzle",
      cardSection: "Apsveikuma kartīte",
      editPhoto: "Rediģēt foto",
      editMessage: "Rediģēt ziņojumu",
      addToCart: "Pievienot grozam",
      errorFileType: "Lūdzu, augšupielādējiet JPG vai PNG attēlu.",
      errorFileSize: "Attēls ir pārāk liels. Lūdzu, augšupielādējiet failu līdz 20 MB.",
      errorGeneric: "Kaut kas nogāja greizi. Lūdzu, mēģiniet vēlreiz."
    },
    cart: {
      title: "Jūsu grozs",
      empty: "Jūsu grozs ir tukšs.",
      continueShopping: "Turpināt iepirkšanos",
      quantity: "Daudzums",
      subtotal: "Starpsumma",
      total: "Kopā",
      checkout: "Noformēt pasūtījumu",
      remove: "Noņemt",
      puzzle: "A4 puzle · 120 gabaliņi",
      card: "A6 apsveikuma kartīte"
    },
    account: {
      title: "Konts",
      loginTitle: "Pieslēgties",
      registerTitle: "Izveidot kontu",
      google: "Turpināt ar Google",
      apple: "Turpināt ar Apple",
      email: "E-pasts",
      email: "E-pasts",
      password: "Parole",
      confirmPassword: "Apstipriniet paroli",
      name: "Vārds",
      signIn: "Pieslēgties",
      createAccount: "Izveidot kontu",
      noAccount: "Nav konta?",
      haveAccount: "Jau ir konts?",
      register: "Reģistrēties",
      logIn: "Pieslēgties",
      dashboard: "Mans konts",
      profile: "Profils",
      myOrders: "Mani pasūtījumi",
      noOrders: "Jums vēl nav neviena pasūtījuma.",
      logOut: "Izrakstīties",
      localNotice: "Jūsu konts tiek saglabāts tikai šajā ierīcē.",
      orderStatus: { pending: "Gaida apstrādi", paid: "Apmaksāts", shipped: "Nosūtīts", delivered: "Piegādāts", cancelled: "Atcelts" },
      providerNotice: "Šai pieslēgšanās metodei nepieciešams pievienots autentifikācijas serviss, un tā vēl nav aktīva.",
      errorInvalid: "Nepareizs e-pasts vai parole.",
      errorExists: "Konts ar šo e-pastu jau pastāv.",
      errorPasswordMatch: "Paroles nesakrīt."
    },
    checkout: {
      title: "Pasūtījuma noformēšana",
      delivery: "Piegāde",
      payment: "Maksājums",
      confirmation: "Apstiprinājums",
      fullName: "Pilns vārds",
      address: "Adrese",
      city: "Pilsēta",
      postalCode: "Pasta indekss",
      country: "Valsts",
      continueToPayment: "Turpināt uz apmaksu",
      payNow: "Apmaksāt",
      backToCart: "Atpakaļ uz grozu",
      stripeNotice: "Maksājumi vēl nav pievienoti — šī sadaļa ir gatava Stripe integrācijai, tiklīdz būs izvietots serveris.",
      processing: "Apstrāde…"
    },
    confirmation: {
      eyebrow: "Jūsu mirklis tagad ir dāvana.",
      title: "Pasūtījums apstiprināts",
      orderNumber: "Pasūtījuma numurs",
      viewOrder: "Skatīt manu pasūtījumu",
      continueShopping: "Turpināt iepirkšanos",
      notFound: "Šo pasūtījumu neizdevās atrast."
    },
    footer: {
      tagline: "Daži mirkļi ir pelnījuši palikt atmiņā.",
      contact: "Kontakti",
      catalog: "Katalogs",
      account: "Konts",
      privacy: "Konfidencialitātes politika",
      terms: "Lietošanas noteikumi",
      refund: "Atgriešanas politika"
    },
    common: { loading: "Ielādē…", close: "Aizvērt", comingSoon: "Drīzumā" },
    meta: { title: "ALVOXIS — Nozīmīgi mirkļi" },
    about: {
      eyebrow: "IDEJA AIZ ALVOXIS",
      title: "Dažas dāvanas tiek atvērtas. Citas paliek atmiņā.",
      text: "ALVOXIS rada nozīmīgas dāvanu pieredzes, kas saglabā emocijas, atmiņas un īpašus mirkļus."
    },
    a11y: {
      openMenu: "Atvērt izvēlni",
      language: "Valoda",
      book: "ALVOXIS kolekcija",
      bookRole: "grāmata",
      bookPages: "Grāmatas lapas",
      prevPage: "Iepriekšējā lapa",
      nextPage: "Nākamā lapa",
      cover: "Vāks"
    },
    form: {
      required: "Lūdzu, aizpildiet šo lauku.",
      email: "Lūdzu, ievadiet derīgu e-pasta adresi."
    },
    products: {
      mini: { name: "ALVOXIS Mini", tagline: "Maza kaste. Nozīmīga atmiņa." },
      classic: { name: "ALVOXIS Classic", tagline: "Radīts neaizmirstamiem mirkļiem." },
      signature: { name: "ALVOXIS Signature", tagline: "Drīz jauna pieredze." }
    }
  },

  et: {
    nav: { catalog: "Kataloog", account: "Konto", cart: "Ostukorv", about: "Meist" },
    hero: {
      eyebrow: "ALVOXIS ESITLEB",
      title: "Mõned hetked väärivad meelespidamist.",
      skip: "Jäta vahele",
      play: "Esita"
    },
    catalog: {
      eyebrow: "ALVOXISE KOLLEKTSIOON",
      scrollHint: "Lohista, et lehte pöörata",
      coverEyebrow: "ALVOXIS",
      coverTitle: "Midagi olulist juba ootab.",
      coverText: "Avasta kollektsioon, mis on loodud hetkedele, mida tasub meeles pidada.",
      comingSoon: "Peagi",
      nextChapter: "Järgmine peatükk",
      nextChapterTitle: "Toeta lugu.",
      nextChapterCopy: "ALVOXIS on alles kirjutamisel — leht lehe haaval. See peatükk tuleb peagi.",
      miniEyebrow: "MINI KOLLEKTSIOON",
      classicEyebrow: "CLASSIC KOLLEKTSIOON",
      coverAlt: "ALVOXISe kinkekarp"
    },
    product: {
      selectGift: "Vali see kingitus",
      unavailable: "Pole veel saadaval",
      contains: "Mis on sees",
      contentsList: [
        "A4 pusle · 120 tükki",
        "Personaliseeritud A6 õnnitluskaart",
        "Premium kinkepakend"
      ],
      backToCatalog: "Tagasi kataloogi"
    },
    personalize: {
      title: "Personaliseeri oma kingitus",
      step1: "Sinu foto",
      step2: "Sinu sõnum",
      step3: "Eelvaade",
      uploadTitle: "Lae üles oma foto",
      uploadHint: "Puuduta üleslaadimiseks või lohista fail siia",
      puzzleLabel: "A4 pusle · 120 tükki",
      puzzleExplain: "Sinu foto trükitakse A4 formaadis 120-tükilisele puslele.",
      replace: "Asenda foto",
      remove: "Eemalda foto",
      continue: "Jätka",
      back: "Tagasi",
      messageLabel: "A6 õnnitluskaart",
      messageExplain: "Kirjuta tekst, mille soovid trükkida A6 formaadis õnnitluskaardile.",
      placeholder: "Kirjuta oma isiklik sõnum…",
      charLimit: "tähemärki",
      previewTitle: "Sinu kingitus",
      selectedBox: "Valitud karp",
      puzzleSection: "Pusle",
      cardSection: "Õnnitluskaart",
      editPhoto: "Muuda fotot",
      editMessage: "Muuda sõnumit",
      addToCart: "Lisa ostukorvi",
      errorFileType: "Palun laadi üles JPG- või PNG-pilt.",
      errorFileSize: "Fail on liiga suur. Palun lae üles fail alla 20 MB.",
      errorGeneric: "Midagi läks valesti. Palun proovi uuesti."
    },
    cart: {
      title: "Sinu ostukorv",
      empty: "Sinu ostukorv on tühi.",
      continueShopping: "Jätka ostlemist",
      quantity: "Kogus",
      subtotal: "Vahesumma",
      total: "Kokku",
      checkout: "Vormista tellimus",
      remove: "Eemalda",
      puzzle: "A4 pusle · 120 tükki",
      card: "A6 õnnitluskaart"
    },
    account: {
      title: "Konto",
      loginTitle: "Logi sisse",
      registerTitle: "Loo konto",
      google: "Jätka Google'iga",
      apple: "Jätka Apple'iga",
      email: "E-post",
      password: "Parool",
      confirmPassword: "Kinnita parool",
      name: "Nimi",
      signIn: "Logi sisse",
      createAccount: "Loo konto",
      noAccount: "Kontot pole veel?",
      haveAccount: "Konto on juba olemas?",
      register: "Registreeru",
      logIn: "Logi sisse",
      dashboard: "Minu konto",
      profile: "Profiil",
      myOrders: "Minu tellimused",
      noOrders: "Sul pole veel tellimusi.",
      logOut: "Logi välja",
      localNotice: "Sinu konto salvestatakse ainult sellesse seadmesse.",
      orderStatus: { pending: "Ootel", paid: "Makstud", shipped: "Saadetud", delivered: "Kohale toimetatud", cancelled: "Tühistatud" },
      providerNotice: "See sisselogimisviis vajab ühendatud autentimisteenust ega ole veel aktiivne.",
      errorInvalid: "Vale e-post või parool.",
      errorExists: "Selle e-postiga konto on juba olemas.",
      errorPasswordMatch: "Paroolid ei kattu."
    },
    checkout: {
      title: "Tellimuse vormistamine",
      delivery: "Tarne",
      payment: "Makse",
      confirmation: "Kinnitus",
      fullName: "Täisnimi",
      address: "Aadress",
      city: "Linn",
      postalCode: "Sihtnumber",
      country: "Riik",
      continueToPayment: "Jätka makseni",
      payNow: "Maksa nüüd",
      backToCart: "Tagasi ostukorvi",
      stripeNotice: "Maksed pole veel ühendatud — see osa on valmis Stripe integratsiooniks, kui server on paigaldatud.",
      processing: "Töötlemine…"
    },
    confirmation: {
      eyebrow: "Sinu hetk on nüüd kingitus.",
      title: "Tellimus kinnitatud",
      orderNumber: "Tellimuse number",
      viewOrder: "Vaata minu tellimust",
      continueShopping: "Jätka ostlemist",
      notFound: "Seda tellimust ei leitud."
    },
    footer: {
      tagline: "Mõned hetked väärivad meelespidamist.",
      contact: "Kontakt",
      catalog: "Kataloog",
      account: "Konto",
      privacy: "Privaatsuspoliitika",
      terms: "Kasutustingimused",
      refund: "Tagastamispoliitika"
    },
    common: { loading: "Laadimine…", close: "Sulge", comingSoon: "Peagi" },
    meta: { title: "ALVOXIS — Tähenduslikud hetked" },
    about: {
      eyebrow: "ALVOXISE IDEE",
      title: "Mõned kingitused avatakse. Teised jäävad meelde.",
      text: "ALVOXIS loob tähenduslikke kingituskogemusi, mis säilitavad emotsioone, mälestusi ja erilisi hetki."
    },
    a11y: {
      openMenu: "Ava menüü",
      language: "Keel",
      book: "ALVOXIS kollektsioon",
      bookRole: "raamat",
      bookPages: "Raamatu lehed",
      prevPage: "Eelmine leht",
      nextPage: "Järgmine leht",
      cover: "Kaas"
    },
    form: {
      required: "Palun täitke see väli.",
      email: "Palun sisestage kehtiv e-posti aadress."
    },
    products: {
      mini: { name: "ALVOXIS Mini", tagline: "Väike karp. Oluline mälestus." },
      classic: { name: "ALVOXIS Classic", tagline: "Loodud unustamatuteks hetkedeks." },
      signature: { name: "ALVOXIS Signature", tagline: "Peagi tuleb uus kogemus." }
    }
  },

  lt: {
    nav: { catalog: "Katalogas", account: "Paskyra", cart: "Krepšelis", about: "Apie mus" },
    hero: {
      eyebrow: "ALVOXIS PRISTATO",
      title: "Kai kurios akimirkos verta prisiminti.",
      skip: "Praleisti įžangą",
      play: "Paleisti"
    },
    catalog: {
      eyebrow: "ALVOXIS KOLEKCIJA",
      scrollHint: "Vilkite, kad apverstumėte puslapį",
      coverEyebrow: "ALVOXIS",
      coverTitle: "Kažkas svarbaus jau laukia.",
      coverText: "Atraskite kolekciją, sukurtą akimirkoms, kurias verta prisiminti.",
      comingSoon: "Netrukus",
      nextChapter: "Kitas skyrius",
      nextChapterTitle: "Palaikyk istoriją.",
      nextChapterCopy: "ALVOXIS vis dar rašomas — puslapis po puslapio. Šis skyrius netrukus.",
      miniEyebrow: "MINI KOLEKCIJA",
      classicEyebrow: "CLASSIC KOLEKCIJA",
      coverAlt: "ALVOXIS dovanų dėžutė"
    },
    product: {
      selectGift: "Pasirinkti šią dovaną",
      unavailable: "Kol kas neprieinama",
      contains: "Kas viduje",
      contentsList: [
        "A4 dėlionė · 120 dalių",
        "Personalizuotas A6 sveikinimo atvirukas",
        "Prabangi dovanų pakuotė"
      ],
      backToCatalog: "Atgal į katalogą"
    },
    personalize: {
      title: "Personalizuokite savo dovaną",
      step1: "Jūsų nuotrauka",
      step2: "Jūsų žinutė",
      step3: "Peržiūra",
      uploadTitle: "Įkelkite savo nuotrauką",
      uploadHint: "Palieskite, kad įkeltumėte, arba nuvilkite failą",
      puzzleLabel: "A4 dėlionė · 120 dalių",
      puzzleExplain: "Jūsų nuotrauka bus išspausdinta ant A4 formato dėlionės iš 120 dalių.",
      replace: "Pakeisti nuotrauką",
      remove: "Pašalinti nuotrauką",
      continue: "Tęsti",
      back: "Atgal",
      messageLabel: "A6 sveikinimo atvirukas",
      messageExplain: "Parašykite tekstą, kurį norite matyti atspausdintą ant A6 formato atviruko.",
      placeholder: "Parašykite savo asmeninę žinutę…",
      charLimit: "simbolių",
      previewTitle: "Jūsų dovana",
      selectedBox: "Pasirinkta dėžutė",
      puzzleSection: "Dėlionė",
      cardSection: "Atvirukas",
      editPhoto: "Keisti nuotrauką",
      editMessage: "Keisti žinutę",
      addToCart: "Į krepšelį",
      errorFileType: "Įkelkite JPG arba PNG formato nuotrauką.",
      errorFileSize: "Failas per didelis. Įkelkite failą iki 20 MB.",
      errorGeneric: "Kažkas nutiko. Bandykite dar kartą."
    },
    cart: {
      title: "Jūsų krepšelis",
      empty: "Jūsų krepšelis tuščias.",
      continueShopping: "Tęsti apsipirkimą",
      quantity: "Kiekis",
      subtotal: "Tarpinė suma",
      total: "Iš viso",
      checkout: "Apmokėti užsakymą",
      remove: "Pašalinti",
      puzzle: "A4 dėlionė · 120 dalių",
      card: "A6 atvirukas"
    },
    account: {
      title: "Paskyra",
      loginTitle: "Prisijungti",
      registerTitle: "Sukurti paskyrą",
      google: "Tęsti su Google",
      apple: "Tęsti su Apple",
      email: "El. paštas",
      password: "Slaptažodis",
      confirmPassword: "Pakartokite slaptažodį",
      name: "Vardas",
      signIn: "Prisijungti",
      createAccount: "Sukurti paskyrą",
      noAccount: "Neturite paskyros?",
      haveAccount: "Jau turite paskyrą?",
      register: "Registruotis",
      logIn: "Prisijungti",
      dashboard: "Mano paskyra",
      profile: "Profilis",
      myOrders: "Mano užsakymai",
      noOrders: "Kol kas neturite užsakymų.",
      logOut: "Atsijungti",
      localNotice: "Jūsų paskyra išsaugoma tik šiame įrenginyje.",
      orderStatus: { pending: "Laukiama", paid: "Apmokėta", shipped: "Išsiųsta", delivered: "Pristatyta", cancelled: "Atšaukta" },
      providerNotice: "Šiam prisijungimo būdui reikalinga prijungta autentifikavimo paslauga, ir jis dar neaktyvus.",
      errorInvalid: "Neteisingas el. paštas arba slaptažodis.",
      errorExists: "Paskyra su šiuo el. paštu jau egzistuoja.",
      errorPasswordMatch: "Slaptažodžiai nesutampa."
    },
    checkout: {
      title: "Užsakymo apmokėjimas",
      delivery: "Pristatymas",
      payment: "Mokėjimas",
      confirmation: "Patvirtinimas",
      fullName: "Vardas ir pavardė",
      address: "Adresas",
      city: "Miestas",
      postalCode: "Pašto kodas",
      country: "Šalis",
      continueToPayment: "Tęsti į apmokėjimą",
      payNow: "Apmokėti dabar",
      backToCart: "Atgal į krepšelį",
      stripeNotice: "Mokėjimai dar neprijungti — šis skyrius paruoštas Stripe integracijai, kai bus įdiegtas serveris.",
      processing: "Apdorojama…"
    },
    confirmation: {
      eyebrow: "Jūsų akimirka dabar yra dovana.",
      title: "Užsakymas patvirtintas",
      orderNumber: "Užsakymo numeris",
      viewOrder: "Peržiūrėti užsakymą",
      continueShopping: "Tęsti apsipirkimą",
      notFound: "Šio užsakymo rasti nepavyko."
    },
    footer: {
      tagline: "Kai kurios akimirkos verta prisiminti.",
      contact: "Kontaktai",
      catalog: "Katalogas",
      account: "Paskyra",
      privacy: "Privatumo politika",
      terms: "Naudojimo sąlygos",
      refund: "Grąžinimo politika"
    },
    common: { loading: "Kraunama…", close: "Uždaryti", comingSoon: "Netrukus" },
    meta: { title: "ALVOXIS — Prasmingos akimirkos" },
    about: {
      eyebrow: "ALVOXIS IDĖJA",
      title: "Vienos dovanos atidaromos. Kitos – prisimenamos.",
      text: "ALVOXIS kuria prasmingas dovanų patirtis, kurios išsaugo emocijas, prisiminimus ir ypatingas akimirkas."
    },
    a11y: {
      openMenu: "Atidaryti meniu",
      language: "Kalba",
      book: "ALVOXIS kolekcija",
      bookRole: "knyga",
      bookPages: "Knygos puslapiai",
      prevPage: "Ankstesnis puslapis",
      nextPage: "Kitas puslapis",
      cover: "Viršelis"
    },
    form: {
      required: "Užpildykite šį lauką.",
      email: "Įveskite teisingą el. pašto adresą."
    },
    products: {
      mini: { name: "ALVOXIS Mini", tagline: "Maža dėžutė. Prasmingas prisiminimas." },
      classic: { name: "ALVOXIS Classic", tagline: "Sukurta neužmirštamoms akimirkoms." },
      signature: { name: "ALVOXIS Signature", tagline: "Netrukus naujas potyris." }
    }
  }

};

export function t(lang, path) {
  const dict = translations[lang] || translations[DEFAULT_LANGUAGE];
  const fallback = translations[DEFAULT_LANGUAGE];
  const parts = path.split(".");

  let node = dict;
  let fallbackNode = fallback;

  for (const part of parts) {
    node = node && node[part] !== undefined ? node[part] : undefined;
    fallbackNode = fallbackNode && fallbackNode[part] !== undefined ? fallbackNode[part] : undefined;
  }

  /* only text (or a list of text) may reach the UI — never an object,
     null or undefined */
  const usable = (value) => typeof value === "string" || typeof value === "number" || Array.isArray(value);

  if (usable(node)) return node;
  if (usable(fallbackNode)) return fallbackNode;

  // Never let a raw translation key (e.g. "products.mini.name")
  // reach the customer-facing UI. Log it so it's easy to spot
  // and fix, and return an empty string instead of the path.
  console.warn(`ALVOXIS i18n: missing translation for "${path}"`);
  return "";
}
