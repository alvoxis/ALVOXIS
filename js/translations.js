/* =========================================================
   ALVOXIS — TRANSLATIONS
   ========================================================= */

export const LANGUAGES = ["en", "lv", "ru", "et", "lt"];
export const DEFAULT_LANGUAGE = "en";

export const translations = {

  en: {
    nav: {
      catalog: "Catalog",
      account: "Account",
      cart: "Cart",
      about: "About"
    },
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
      google: "Continue with Google",
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
      noOrders: "You have no orders yet.",
      logOut: "Log out",
      errorPasswordMatch: "Passwords do not match.",
      eyebrow: "YOUR ALVOXIS",
      chapters: {
        profile: "Profile",
        orders: "Orders",
        support: "Support",
        gift: "Gift",
        settings: "Settings"
      },
      methodEmail: "Email",
      memberSince: "Member since",
      signInMethod: "Signed in with",
      noSupport: "You haven't supported the story yet. The last page of the book is waiting whenever you are.",
      supportThanks: "Every line here helped write the next page. Thank you.",
      supportEntry: "Support",
      payment: {
        pending: "Awaiting confirmation",
        paid: "Paid",
        failed: "Payment failed",
        canceled: "Canceled",
        expired: "Not completed",
        refunded: "Refunded"
      },
      fulfillment: {
        unfulfilled: "Being prepared",
        in_production: "In production",
        shipped: "Shipped",
        delivered: "Delivered",
        canceled: "Canceled"
      },
      displayName: "Display name",
      saved: "Saved."
    },
    checkout: {
      title: "Checkout",
      delivery: "Delivery",
      payment: "Payment",
      fullName: "Full name",
      address: "Address",
      city: "City",
      postalCode: "Postal code",
      country: "Country",
      payNow: "Pay now",
      backToCart: "Back to cart",
      stripeNotice: "You'll pay securely on Stripe's checkout page. Your card details never reach ALVOXIS.",
      signInFirst: "Please sign in to complete your order — your order and its photos stay safely in your account.",
      preparing: "Preparing your order…"
    },
    confirmation: {
      eyebrow: "Your moment is now a gift.",
      continueShopping: "Continue shopping"
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
    common: {
      loading: "Loading…",
      close: "Close",
      comingSoon: "Coming soon",
      retry: "Try again",
      save: "Save"
    },
    meta: {
      title: "ALVOXIS — Meaningful Moments",
      description: "ALVOXIS — personalised gift boxes with a photo puzzle and a greeting card. Some moments deserve to be remembered."
    },
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
      email: "Please enter a valid email address.",
      tooShort: "Please use at least {min} characters."
    },
    products: {
      mini: {
        name: "ALVOXIS Mini",
        tagline: "A small box. A meaningful memory."
      },
      classic: {
        name: "ALVOXIS Classic",
        tagline: "Designed for unforgettable moments."
      },
      signature: {
        name: "ALVOXIS Signature",
        tagline: "A new experience is coming."
      }
    },
    support: {
      title: "The story is not over.",
      subtitle: "Help us write the next page.",
      text: "ALVOXIS is written one chapter at a time — by people who believe a small box can hold a big memory. If you'd like to add a line of your own, the pen is yours. And if not, turning back to the gifts is a lovely ending too.",
      chooseAmount: "Choose an amount",
      customAmount: "Your own amount, from €1.00 to €100.00",
      placeholder: "Your amount",
      prompt: "Choose an amount — every page begins with a single word.",
      tier1: "You just added a little spark.",
      tier2: "A small spark is already becoming part of the story.",
      tier3: "The next page is getting closer.",
      tier4: "Now the story is really starting to move.",
      tier5: "You just unlocked a little secret in the story.",
      giftTitle: "A little extra magic awaits you.",
      giftText: "With €50 or more, we'll thank you with a keepsake puzzle made from a photo of your choice. Once your payment is confirmed, you'll upload the photo in your account.",
      cta: "Support the story",
      note: "Secure payment by Stripe · from €1 to €100",
      invalidAmount: "Please choose an amount from €1.00 to €100.00 (up to two decimals).",
      signInFirst: "Please sign in first — that's how your support, and any gift, stays safely in your account.",
      signIn: "Sign in",
      redirecting: "Opening secure payment…"
    },
    errors: {
      generic: "Something went wrong. Please try again.",
      network: "We couldn't reach the server. Please check your connection and try again.",
      unavailable: "This part of ALVOXIS is being prepared and will be available very soon.",
      invalidCredentials: "The email or password is incorrect.",
      emailNotConfirmed: "Please confirm your email address first — the link is in your inbox.",
      userExists: "An account with this email already exists. Try signing in.",
      weakPassword: "Please choose a password with at least 8 characters.",
      samePassword: "Your new password must be different from the current one.",
      invalidEmail: "Please enter a valid email address.",
      rateLimited: "Too many attempts. Please wait a moment and try again.",
      sessionExpired: "Your session has ended. Please sign in again.",
      invalidCart: "Something in your cart has changed. Please review it and try again.",
      photoMissing: "A personalisation photo is missing. Please add the photo to the gift again.",
      invalidShipping: "Please complete your delivery details.",
      paymentsUnavailable: "Payments are not available at the moment. Please try again a little later.",
      checkoutExpired: "This payment session has expired. Please start again.",
      loadFailed: "We couldn't load this right now. Please try again.",
      uploadFailed: "The photo couldn't be uploaded. Please try again."
    },
    auth: {
      signInTitle: "Welcome back.",
      signInLead: "Sign in to see your orders, your support and your gifts.",
      registerTitle: "Begin your story.",
      registerLead: "Create an account to keep your orders and gifts in one place.",
      or: "or",
      forgot: "Forgot your password?",
      passwordHint: "At least 8 characters.",
      signingIn: "Signing in…",
      creating: "Creating your account…",
      redirecting: "Opening Google…",
      checkEmailTitle: "Check your email.",
      checkEmail: "We've sent you a link to confirm your account. Open it on this device to finish signing up.",
      forgotTitle: "Forgotten password",
      forgotText: "Enter your email and we'll send you a link to choose a new password.",
      sendLink: "Send reset link",
      sending: "Sending…",
      resetSentTitle: "Look in your inbox.",
      resetSent: "If an account exists for this email, a reset link is on its way.",
      backToSignIn: "Back to sign in",
      resetTitle: "Choose a new password",
      resetLead: "Almost there — pick a new password for your account.",
      resetLinkInvalid: "This reset link is no longer valid. Please request a new one.",
      newPassword: "New password",
      savePassword: "Save password",
      saving: "Saving…",
      passwordUpdated: "Your password has been updated.",
      changePassword: "Password",
      signingOut: "Signing out…"
    },
    gift: {
      puzzle: "KEEPSAKE PUZZLE",
      title: "Your gift is waiting.",
      text: "Choose a photo and we'll turn it into your keepsake puzzle.",
      titleReady: "Your photo is in.",
      textReady: "Thank you — we'll take it from here. You can still replace the photo until production starts.",
      previewAlt: "Your photo for the keepsake puzzle",
      noPhoto: "No photo yet",
      upload: "Upload photo",
      replace: "Replace photo",
      remove: "Remove photo",
      photoHint: "JPG, PNG, WebP or HEIC · up to 25 MB · at least 600 px. Your photo is stored privately.",
      uploading: "Uploading…",
      removing: "Removing…",
      removeConfirm: "Remove this photo from your gift?",
      locked: "Your puzzle is already being made, so the photo can no longer be changed.",
      none: "There's no gift here yet. Supporting the story with €50 or more unlocks a keepsake puzzle.",
      unlocked: "Gift unlocked",
      status: {
        photoPending: "Photo pending",
        photoUploaded: "Photo uploaded",
        approved: "Photo approved",
        rejected: "Please choose another photo",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered"
      }
    },
    photo: {
      type: "Please choose a JPG, PNG, WebP or HEIC image.",
      size: "This image is too large. Please choose one under 25 MB.",
      decode: "This file couldn't be read as an image. Please choose another one.",
      small: "This photo is too small to print well. Please choose one at least 600 px wide."
    },
    payment: {
      canceledEyebrow: "PAYMENT CANCELED",
      canceledTitle: "No harm done.",
      canceledText: "The payment was canceled and nothing was charged. You can try again whenever you like.",
      tryAgain: "Try again",
      supportEyebrow: "THANK YOU",
      supportTitle: "Your page has been written.",
      orderTitle: "Thank you for your order.",
      confirming: "We're confirming your payment with Stripe…",
      stillConfirming: "Confirmation can take a minute. It will appear in your account as soon as Stripe confirms it.",
      supportConfirmed: "Payment of {amount} confirmed. The story just grew a little.",
      orderConfirmed: "Payment confirmed — order {order}. We'll start preparing your gift.",
      giftUnlocked: "Your support unlocked a keepsake puzzle. Upload the photo you'd like us to use.",
      failed: "The payment didn't go through, so nothing was charged. Please try again.",
      viewAccount: "View in my account"
    }
  },

  ru: {
    nav: {
      catalog: "Каталог",
      account: "Аккаунт",
      cart: "Корзина",
      about: "О нас"
    },
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
      google: "Продолжить с Google",
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
      noOrders: "У вас пока нет заказов.",
      logOut: "Выйти",
      errorPasswordMatch: "Пароли не совпадают.",
      eyebrow: "ВАШ ALVOXIS",
      chapters: {
        profile: "Профиль",
        orders: "Заказы",
        support: "Поддержка",
        gift: "Подарок",
        settings: "Настройки"
      },
      methodEmail: "Эл. почта",
      memberSince: "С нами с",
      signInMethod: "Способ входа",
      noSupport: "Вы ещё не поддерживали историю. Последняя страница книги ждёт, когда будете готовы.",
      supportThanks: "Каждая строчка здесь помогла написать следующую страницу. Спасибо.",
      supportEntry: "Поддержка",
      payment: {
        pending: "Ожидает подтверждения",
        paid: "Оплачено",
        failed: "Оплата не прошла",
        canceled: "Отменено",
        expired: "Не завершено",
        refunded: "Возвращено"
      },
      fulfillment: {
        unfulfilled: "Готовится",
        in_production: "В производстве",
        shipped: "Отправлено",
        delivered: "Доставлено",
        canceled: "Отменено"
      },
      displayName: "Отображаемое имя",
      saved: "Сохранено."
    },
    checkout: {
      title: "Оформление заказа",
      delivery: "Доставка",
      payment: "Оплата",
      fullName: "Полное имя",
      address: "Адрес",
      city: "Город",
      postalCode: "Индекс",
      country: "Страна",
      payNow: "Оплатить",
      backToCart: "Назад в корзину",
      stripeNotice: "Оплата проходит на защищённой странице Stripe. Данные карты не попадают к ALVOXIS.",
      signInFirst: "Войдите, чтобы оформить заказ — заказ и фотографии будут надёжно храниться в вашем аккаунте.",
      preparing: "Готовим заказ…"
    },
    confirmation: {
      eyebrow: "Ваш момент теперь стал подарком.",
      continueShopping: "Продолжить покупки"
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
    common: {
      loading: "Загрузка…",
      close: "Закрыть",
      comingSoon: "Скоро",
      retry: "Попробовать снова",
      save: "Сохранить"
    },
    meta: {
      title: "ALVOXIS — Значимые моменты",
      description: "ALVOXIS — персонализированные подарочные коробки с фотопазлом и открыткой. Некоторые моменты заслуживают того, чтобы их помнили."
    },
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
      email: "Введите корректный адрес эл. почты.",
      tooShort: "Используйте не менее {min} символов."
    },
    products: {
      mini: {
        name: "ALVOXIS Mini",
        tagline: "Маленькая коробка. Значимая память."
      },
      classic: {
        name: "ALVOXIS Classic",
        tagline: "Создано для незабываемых моментов."
      },
      signature: {
        name: "ALVOXIS Signature",
        tagline: "Новый опыт уже на подходе."
      }
    },
    support: {
      title: "История ещё не окончена.",
      subtitle: "Помогите написать следующую страницу.",
      text: "ALVOXIS пишется глава за главой — людьми, которые верят, что в маленькой коробке может поместиться большое воспоминание. Если хотите добавить свою строчку — перо в ваших руках. А если нет, вернуться к подаркам — тоже прекрасный финал.",
      chooseAmount: "Выберите сумму",
      customAmount: "Своя сумма, от €1.00 до €100.00",
      placeholder: "Своя сумма",
      prompt: "Выберите сумму — каждая страница начинается с одного слова.",
      tier1: "Вы только что добавили маленькую искру.",
      tier2: "Маленькая искра уже становится частью истории.",
      tier3: "Следующая страница всё ближе.",
      tier4: "Теперь история по-настоящему пришла в движение.",
      tier5: "Вы открыли маленький секрет истории.",
      giftTitle: "Вас ждёт немного волшебства.",
      giftText: "За поддержку от €50 — памятный пазл из вашей фотографии. Фото можно загрузить в аккаунте после подтверждения оплаты.",
      cta: "Поддержать историю",
      note: "Безопасная оплата через Stripe · от €1 до €100",
      invalidAmount: "Выберите сумму от €1.00 до €100.00 (не более двух знаков после запятой).",
      signInFirst: "Сначала войдите — так ваша поддержка и подарок надёжно сохранятся в аккаунте.",
      signIn: "Войти",
      redirecting: "Открываем безопасную оплату…"
    },
    errors: {
      generic: "Что-то пошло не так. Попробуйте ещё раз.",
      network: "Не удалось связаться с сервером. Проверьте соединение и попробуйте снова.",
      unavailable: "Этот раздел ALVOXIS готовится и совсем скоро будет доступен.",
      invalidCredentials: "Неверная эл. почта или пароль.",
      emailNotConfirmed: "Сначала подтвердите адрес эл. почты — ссылка в вашем почтовом ящике.",
      userExists: "Аккаунт с этой эл. почтой уже существует. Попробуйте войти.",
      weakPassword: "Пароль должен содержать не менее 8 символов.",
      samePassword: "Новый пароль должен отличаться от текущего.",
      invalidEmail: "Введите корректный адрес эл. почты.",
      rateLimited: "Слишком много попыток. Подождите немного и попробуйте снова.",
      sessionExpired: "Сеанс завершён. Пожалуйста, войдите снова.",
      invalidCart: "Что-то в корзине изменилось. Проверьте её и попробуйте снова.",
      photoMissing: "Не хватает фотографии для персонализации. Добавьте фото к подарку ещё раз.",
      invalidShipping: "Пожалуйста, заполните данные доставки.",
      paymentsUnavailable: "Оплата сейчас недоступна. Попробуйте чуть позже.",
      checkoutExpired: "Срок этой платёжной сессии истёк. Начните заново.",
      loadFailed: "Сейчас не удалось загрузить данные. Попробуйте ещё раз.",
      uploadFailed: "Не удалось загрузить фото. Попробуйте ещё раз."
    },
    auth: {
      signInTitle: "С возвращением.",
      signInLead: "Войдите, чтобы видеть свои заказы, поддержку и подарки.",
      registerTitle: "Начните свою историю.",
      registerLead: "Создайте аккаунт, чтобы заказы и подарки были в одном месте.",
      or: "или",
      forgot: "Забыли пароль?",
      passwordHint: "Не менее 8 символов.",
      signingIn: "Входим…",
      creating: "Создаём аккаунт…",
      redirecting: "Открываем Google…",
      checkEmailTitle: "Проверьте почту.",
      checkEmail: "Мы отправили ссылку для подтверждения аккаунта. Откройте её на этом устройстве, чтобы завершить регистрацию.",
      forgotTitle: "Восстановление пароля",
      forgotText: "Введите эл. почту — мы пришлём ссылку для выбора нового пароля.",
      sendLink: "Отправить ссылку",
      sending: "Отправляем…",
      resetSentTitle: "Загляните в почту.",
      resetSent: "Если аккаунт с этой эл. почтой существует, ссылка для сброса уже в пути.",
      backToSignIn: "Вернуться ко входу",
      resetTitle: "Новый пароль",
      resetLead: "Почти готово — придумайте новый пароль для аккаунта.",
      resetLinkInvalid: "Эта ссылка больше недействительна. Запросите новую.",
      newPassword: "Новый пароль",
      savePassword: "Сохранить пароль",
      saving: "Сохраняем…",
      passwordUpdated: "Пароль обновлён.",
      changePassword: "Пароль",
      signingOut: "Выходим…"
    },
    gift: {
      puzzle: "ПАМЯТНЫЙ ПАЗЛ",
      title: "Ваш подарок ждёт.",
      text: "Выберите фото — и мы превратим его в ваш памятный пазл.",
      titleReady: "Фото получено.",
      textReady: "Спасибо — дальше мы сами. Заменить фото можно до начала производства.",
      previewAlt: "Ваше фото для памятного пазла",
      noPhoto: "Фото ещё нет",
      upload: "Загрузить фото",
      replace: "Заменить фото",
      remove: "Удалить фото",
      photoHint: "JPG, PNG, WebP или HEIC · до 25 МБ · не меньше 600 px. Фото хранится приватно.",
      uploading: "Загружаем…",
      removing: "Удаляем…",
      removeConfirm: "Удалить это фото из подарка?",
      locked: "Ваш пазл уже изготавливается, поэтому фото больше нельзя изменить.",
      none: "Здесь пока нет подарка. Поддержка истории от €50 открывает памятный пазл.",
      unlocked: "Подарок открыт",
      status: {
        photoPending: "Ожидается фото",
        photoUploaded: "Фото загружено",
        approved: "Фото одобрено",
        rejected: "Пожалуйста, выберите другое фото",
        processing: "В работе",
        shipped: "Отправлено",
        delivered: "Доставлено"
      }
    },
    photo: {
      type: "Выберите изображение JPG, PNG, WebP или HEIC.",
      size: "Изображение слишком большое. Выберите файл до 25 МБ.",
      decode: "Не удалось прочитать файл как изображение. Выберите другой.",
      small: "Фото слишком маленькое для качественной печати. Выберите снимок шириной от 600 px."
    },
    payment: {
      canceledEyebrow: "ОПЛАТА ОТМЕНЕНА",
      canceledTitle: "Ничего страшного.",
      canceledText: "Оплата отменена, деньги не списаны. Можно попробовать снова в любой момент.",
      tryAgain: "Попробовать снова",
      supportEyebrow: "СПАСИБО",
      supportTitle: "Ваша страница написана.",
      orderTitle: "Спасибо за заказ.",
      confirming: "Подтверждаем оплату через Stripe…",
      stillConfirming: "Подтверждение может занять минуту. Оно появится в аккаунте, как только Stripe его пришлёт.",
      supportConfirmed: "Оплата {amount} подтверждена. История стала чуть больше.",
      orderConfirmed: "Оплата подтверждена — заказ {order}. Мы начинаем готовить ваш подарок.",
      giftUnlocked: "Ваша поддержка открыла памятный пазл. Загрузите фото, которое хотите использовать.",
      failed: "Оплата не прошла, деньги не списаны. Попробуйте ещё раз.",
      viewAccount: "Открыть в аккаунте"
    }
  },

  lv: {
    nav: {
      catalog: "Katalogs",
      account: "Konts",
      cart: "Grozs",
      about: "Par mums"
    },
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
      google: "Turpināt ar Google",
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
      noOrders: "Jums vēl nav neviena pasūtījuma.",
      logOut: "Izrakstīties",
      errorPasswordMatch: "Paroles nesakrīt.",
      eyebrow: "JŪSU ALVOXIS",
      chapters: {
        profile: "Profils",
        orders: "Pasūtījumi",
        support: "Atbalsts",
        gift: "Dāvana",
        settings: "Iestatījumi"
      },
      methodEmail: "E-pasts",
      memberSince: "Kopā ar mums kopš",
      signInMethod: "Pieteikšanās veids",
      noSupport: "Jūs vēl neesat atbalstījis stāstu. Grāmatas pēdējā lappuse gaida, kad būsiet gatavs.",
      supportThanks: "Katra rindiņa šeit palīdzēja uzrakstīt nākamo lappusi. Paldies.",
      supportEntry: "Atbalsts",
      payment: {
        pending: "Gaida apstiprinājumu",
        paid: "Apmaksāts",
        failed: "Maksājums neizdevās",
        canceled: "Atcelts",
        expired: "Nav pabeigts",
        refunded: "Atmaksāts"
      },
      fulfillment: {
        unfulfilled: "Tiek gatavots",
        in_production: "Ražošanā",
        shipped: "Nosūtīts",
        delivered: "Piegādāts",
        canceled: "Atcelts"
      },
      displayName: "Attēlojamais vārds",
      saved: "Saglabāts."
    },
    checkout: {
      title: "Pasūtījuma noformēšana",
      delivery: "Piegāde",
      payment: "Maksājums",
      fullName: "Pilns vārds",
      address: "Adrese",
      city: "Pilsēta",
      postalCode: "Pasta indekss",
      country: "Valsts",
      payNow: "Apmaksāt",
      backToCart: "Atpakaļ uz grozu",
      stripeNotice: "Jūs maksāsiet droši Stripe apmaksas lapā. Jūsu kartes dati nenonāk pie ALVOXIS.",
      signInFirst: "Lūdzu, piesakieties, lai noformētu pasūtījumu — pasūtījums un tā fotogrāfijas droši glabāsies jūsu kontā.",
      preparing: "Gatavojam pasūtījumu…"
    },
    confirmation: {
      eyebrow: "Jūsu mirklis tagad ir dāvana.",
      continueShopping: "Turpināt iepirkšanos"
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
    common: {
      loading: "Ielādē…",
      close: "Aizvērt",
      comingSoon: "Drīzumā",
      retry: "Mēģināt vēlreiz",
      save: "Saglabāt"
    },
    meta: {
      title: "ALVOXIS — Nozīmīgi mirkļi",
      description: "ALVOXIS — personalizētas dāvanu kastes ar foto puzli un apsveikuma kartīti. Daži mirkļi ir pelnījuši palikt atmiņā."
    },
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
      email: "Lūdzu, ievadiet derīgu e-pasta adresi.",
      tooShort: "Lūdzu, izmantojiet vismaz {min} rakstzīmes."
    },
    products: {
      mini: {
        name: "ALVOXIS Mini",
        tagline: "Maza kaste. Nozīmīga atmiņa."
      },
      classic: {
        name: "ALVOXIS Classic",
        tagline: "Radīts neaizmirstamiem mirkļiem."
      },
      signature: {
        name: "ALVOXIS Signature",
        tagline: "Drīz jauna pieredze."
      }
    },
    support: {
      title: "Stāsts vēl nav beidzies.",
      subtitle: "Palīdziet mums uzrakstīt nākamo lappusi.",
      text: "ALVOXIS top nodaļu pa nodaļai — to raksta cilvēki, kuri tic, ka mazā kastītē var ietilpt liela atmiņa. Ja vēlaties pievienot savu rindiņu, spalva ir jūsu rokās. Bet arī atgriezties pie dāvanām ir jauks noslēgums.",
      chooseAmount: "Izvēlieties summu",
      customAmount: "Sava summa no €1.00 līdz €100.00",
      placeholder: "Sava summa",
      prompt: "Izvēlieties summu — katra lappuse sākas ar vienu vārdu.",
      tier1: "Jūs tikko pievienojāt mazu dzirksteli.",
      tier2: "Maza dzirkstele jau kļūst par stāsta daļu.",
      tier3: "Nākamā lappuse tuvojas.",
      tier4: "Tagad stāsts patiešām sāk kustēties.",
      tier5: "Jūs tikko atklājāt mazu stāsta noslēpumu.",
      giftTitle: "Jūs gaida mazliet papildu burvības.",
      giftText: "Par atbalstu no €50 mēs pateiksimies ar piemiņas puzli no jūsu izvēlētas fotogrāfijas. Fotogrāfiju varēsiet augšupielādēt savā kontā, kad maksājums būs apstiprināts.",
      cta: "Atbalstīt stāstu",
      note: "Droša apmaksa ar Stripe · no €1 līdz €100",
      invalidAmount: "Lūdzu, izvēlieties summu no €1.00 līdz €100.00 (ne vairāk kā divas zīmes aiz komata).",
      signInFirst: "Lūdzu, vispirms piesakieties — tā jūsu atbalsts un dāvana droši saglabāsies kontā.",
      signIn: "Pieteikties",
      redirecting: "Atveram drošo apmaksu…"
    },
    errors: {
      generic: "Kaut kas nogāja greizi. Lūdzu, mēģiniet vēlreiz.",
      network: "Neizdevās sazināties ar serveri. Pārbaudiet savienojumu un mēģiniet vēlreiz.",
      unavailable: "Šī ALVOXIS sadaļa tiek gatavota un drīz būs pieejama.",
      invalidCredentials: "Nepareizs e-pasts vai parole.",
      emailNotConfirmed: "Lūdzu, vispirms apstipriniet e-pasta adresi — saite ir jūsu pastkastītē.",
      userExists: "Konts ar šo e-pastu jau pastāv. Mēģiniet pieteikties.",
      weakPassword: "Parolei jābūt vismaz 8 rakstzīmes garai.",
      samePassword: "Jaunajai parolei jāatšķiras no pašreizējās.",
      invalidEmail: "Lūdzu, ievadiet derīgu e-pasta adresi.",
      rateLimited: "Pārāk daudz mēģinājumu. Lūdzu, uzgaidiet brīdi un mēģiniet vēlreiz.",
      sessionExpired: "Jūsu sesija ir beigusies. Lūdzu, piesakieties vēlreiz.",
      invalidCart: "Kaut kas grozā ir mainījies. Lūdzu, pārbaudiet to un mēģiniet vēlreiz.",
      photoMissing: "Trūkst personalizācijas fotogrāfijas. Lūdzu, pievienojiet fotogrāfiju dāvanai vēlreiz.",
      invalidShipping: "Lūdzu, aizpildiet piegādes informāciju.",
      paymentsUnavailable: "Maksājumi šobrīd nav pieejami. Lūdzu, mēģiniet nedaudz vēlāk.",
      checkoutExpired: "Šīs maksājuma sesijas termiņš ir beidzies. Lūdzu, sāciet no jauna.",
      loadFailed: "Šobrīd neizdevās ielādēt datus. Lūdzu, mēģiniet vēlreiz.",
      uploadFailed: "Fotogrāfiju neizdevās augšupielādēt. Lūdzu, mēģiniet vēlreiz."
    },
    auth: {
      signInTitle: "Prieks jūs atkal redzēt.",
      signInLead: "Piesakieties, lai redzētu savus pasūtījumus, atbalstu un dāvanas.",
      registerTitle: "Sāciet savu stāstu.",
      registerLead: "Izveidojiet kontu, lai pasūtījumi un dāvanas būtu vienuviet.",
      or: "vai",
      forgot: "Aizmirsāt paroli?",
      passwordHint: "Vismaz 8 rakstzīmes.",
      signingIn: "Piesakāmies…",
      creating: "Veidojam kontu…",
      redirecting: "Atveram Google…",
      checkEmailTitle: "Pārbaudiet e-pastu.",
      checkEmail: "Mēs nosūtījām saiti konta apstiprināšanai. Atveriet to šajā ierīcē, lai pabeigtu reģistrāciju.",
      forgotTitle: "Aizmirsta parole",
      forgotText: "Ievadiet e-pastu, un mēs nosūtīsim saiti jaunas paroles izvēlei.",
      sendLink: "Nosūtīt saiti",
      sending: "Sūtām…",
      resetSentTitle: "Ieskatieties pastkastītē.",
      resetSent: "Ja konts ar šo e-pastu pastāv, atiestatīšanas saite jau ir ceļā.",
      backToSignIn: "Atpakaļ uz pieteikšanos",
      resetTitle: "Jauna parole",
      resetLead: "Gandrīz gatavs — izvēlieties kontam jaunu paroli.",
      resetLinkInvalid: "Šī saite vairs nav derīga. Lūdzu, pieprasiet jaunu.",
      newPassword: "Jaunā parole",
      savePassword: "Saglabāt paroli",
      saving: "Saglabājam…",
      passwordUpdated: "Parole ir atjaunināta.",
      changePassword: "Parole",
      signingOut: "Izrakstāmies…"
    },
    gift: {
      puzzle: "PIEMIŅAS PUZLE",
      title: "Jūsu dāvana gaida.",
      text: "Izvēlieties fotogrāfiju, un mēs no tās izveidosim jūsu piemiņas puzli.",
      titleReady: "Fotogrāfija saņemta.",
      textReady: "Paldies — tālāk parūpēsimies paši. Fotogrāfiju varat nomainīt līdz ražošanas sākumam.",
      previewAlt: "Jūsu fotogrāfija piemiņas puzlei",
      noPhoto: "Fotogrāfijas vēl nav",
      upload: "Augšupielādēt fotogrāfiju",
      replace: "Nomainīt fotogrāfiju",
      remove: "Noņemt fotogrāfiju",
      photoHint: "JPG, PNG, WebP vai HEIC · līdz 25 MB · vismaz 600 px. Fotogrāfija tiek glabāta privāti.",
      uploading: "Augšupielādējam…",
      removing: "Noņemam…",
      removeConfirm: "Noņemt šo fotogrāfiju no dāvanas?",
      locked: "Jūsu puzle jau tiek izgatavota, tāpēc fotogrāfiju vairs nevar mainīt.",
      none: "Šeit vēl nav dāvanas. Atbalsts stāstam no €50 atver piemiņas puzli.",
      unlocked: "Dāvana atvērta",
      status: {
        photoPending: "Gaida fotogrāfiju",
        photoUploaded: "Fotogrāfija augšupielādēta",
        approved: "Fotogrāfija apstiprināta",
        rejected: "Lūdzu, izvēlieties citu fotogrāfiju",
        processing: "Tiek apstrādāts",
        shipped: "Nosūtīts",
        delivered: "Piegādāts"
      }
    },
    photo: {
      type: "Lūdzu, izvēlieties JPG, PNG, WebP vai HEIC attēlu.",
      size: "Attēls ir pārāk liels. Lūdzu, izvēlieties failu līdz 25 MB.",
      decode: "Šo failu neizdevās nolasīt kā attēlu. Lūdzu, izvēlieties citu.",
      small: "Fotogrāfija ir pārāk maza kvalitatīvai drukai. Lūdzu, izvēlieties vismaz 600 px platu attēlu."
    },
    payment: {
      canceledEyebrow: "MAKSĀJUMS ATCELTS",
      canceledTitle: "Nekas ļauns nav noticis.",
      canceledText: "Maksājums tika atcelts, un nauda netika iekasēta. Varat mēģināt vēlreiz jebkurā laikā.",
      tryAgain: "Mēģināt vēlreiz",
      supportEyebrow: "PALDIES",
      supportTitle: "Jūsu lappuse ir uzrakstīta.",
      orderTitle: "Paldies par pasūtījumu.",
      confirming: "Apstiprinām maksājumu ar Stripe…",
      stillConfirming: "Apstiprināšana var aizņemt minūti. Tā parādīsies jūsu kontā, tiklīdz Stripe to apstiprinās.",
      supportConfirmed: "Maksājums {amount} apstiprināts. Stāsts tikko kļuva nedaudz lielāks.",
      orderConfirmed: "Maksājums apstiprināts — pasūtījums {order}. Mēs sākam gatavot jūsu dāvanu.",
      giftUnlocked: "Jūsu atbalsts atvēra piemiņas puzli. Augšupielādējiet fotogrāfiju, kuru vēlaties izmantot.",
      failed: "Maksājums neizdevās, un nauda netika iekasēta. Lūdzu, mēģiniet vēlreiz.",
      viewAccount: "Skatīt manā kontā"
    }
  },

  et: {
    nav: {
      catalog: "Kataloog",
      account: "Konto",
      cart: "Ostukorv",
      about: "Meist"
    },
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
      google: "Jätka Google'iga",
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
      noOrders: "Sul pole veel tellimusi.",
      logOut: "Logi välja",
      errorPasswordMatch: "Paroolid ei kattu.",
      eyebrow: "TEIE ALVOXIS",
      chapters: {
        profile: "Profiil",
        orders: "Tellimused",
        support: "Toetus",
        gift: "Kingitus",
        settings: "Seaded"
      },
      methodEmail: "E-post",
      memberSince: "Liitunud",
      signInMethod: "Sisselogimise viis",
      noSupport: "Te pole veel lugu toetanud. Raamatu viimane lehekülg ootab, kui olete valmis.",
      supportThanks: "Iga rida siin aitas kirjutada järgmise lehekülje. Aitäh.",
      supportEntry: "Toetus",
      payment: {
        pending: "Ootab kinnitust",
        paid: "Makstud",
        failed: "Makse ebaõnnestus",
        canceled: "Tühistatud",
        expired: "Lõpetamata",
        refunded: "Tagastatud"
      },
      fulfillment: {
        unfulfilled: "Valmistamisel",
        in_production: "Tootmises",
        shipped: "Saadetud",
        delivered: "Kohale toimetatud",
        canceled: "Tühistatud"
      },
      displayName: "Kuvatav nimi",
      saved: "Salvestatud."
    },
    checkout: {
      title: "Tellimuse vormistamine",
      delivery: "Tarne",
      payment: "Makse",
      fullName: "Täisnimi",
      address: "Aadress",
      city: "Linn",
      postalCode: "Sihtnumber",
      country: "Riik",
      payNow: "Maksa nüüd",
      backToCart: "Tagasi ostukorvi",
      stripeNotice: "Maksate turvaliselt Stripe'i makselehel. Teie kaardiandmed ALVOXISeni ei jõua.",
      signInFirst: "Tellimuse vormistamiseks palun logige sisse — tellimus ja selle fotod jäävad turvaliselt teie kontole.",
      preparing: "Valmistame tellimust ette…"
    },
    confirmation: {
      eyebrow: "Sinu hetk on nüüd kingitus.",
      continueShopping: "Jätka ostlemist"
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
    common: {
      loading: "Laadimine…",
      close: "Sulge",
      comingSoon: "Peagi",
      retry: "Proovi uuesti",
      save: "Salvesta"
    },
    meta: {
      title: "ALVOXIS — Tähenduslikud hetked",
      description: "ALVOXIS — isikupärastatud kinkekarbid fotopusle ja tervituskaardiga. Mõned hetked väärivad meelespidamist."
    },
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
      email: "Palun sisestage kehtiv e-posti aadress.",
      tooShort: "Palun kasutage vähemalt {min} tähemärki."
    },
    products: {
      mini: {
        name: "ALVOXIS Mini",
        tagline: "Väike karp. Oluline mälestus."
      },
      classic: {
        name: "ALVOXIS Classic",
        tagline: "Loodud unustamatuteks hetkedeks."
      },
      signature: {
        name: "ALVOXIS Signature",
        tagline: "Peagi tuleb uus kogemus."
      }
    },
    support: {
      title: "Lugu pole veel läbi.",
      subtitle: "Aidake meil kirjutada järgmine lehekülg.",
      text: "ALVOXIS sünnib peatükk peatüki haaval — seda kirjutavad inimesed, kes usuvad, et väikesesse karpi mahub suur mälestus. Kui soovite lisada oma rea, on sulg teie käes. Ja kui mitte, on ka kingituste juurde naasmine ilus lõpp.",
      chooseAmount: "Valige summa",
      customAmount: "Oma summa vahemikus €1.00 kuni €100.00",
      placeholder: "Oma summa",
      prompt: "Valige summa — iga lehekülg algab ühest sõnast.",
      tier1: "Lisasite just väikese sädeme.",
      tier2: "Väike säde on juba saamas loo osaks.",
      tier3: "Järgmine lehekülg on lähemal.",
      tier4: "Nüüd hakkab lugu tõeliselt liikuma.",
      tier5: "Avasite just loo väikese saladuse.",
      giftTitle: "Teid ootab natuke lisavõlu.",
      giftText: "Toetuse eest alates €50 täname teid mälestuspuslega, mis on tehtud teie valitud fotost. Foto saate üles laadida oma kontol, kui makse on kinnitatud.",
      cta: "Toeta lugu",
      note: "Turvaline makse Stripe'i kaudu · €1 kuni €100",
      invalidAmount: "Palun valige summa vahemikus €1.00 kuni €100.00 (kuni kaks kohta pärast koma).",
      signInFirst: "Palun logige kõigepealt sisse — nii jäävad teie toetus ja kingitus turvaliselt teie kontole.",
      signIn: "Logi sisse",
      redirecting: "Avame turvalise makse…"
    },
    errors: {
      generic: "Midagi läks valesti. Palun proovige uuesti.",
      network: "Serveriga ei õnnestunud ühendust saada. Kontrollige ühendust ja proovige uuesti.",
      unavailable: "See ALVOXISe osa on valmimas ja on peagi saadaval.",
      invalidCredentials: "E-post või parool on vale.",
      emailNotConfirmed: "Palun kinnitage esmalt oma e-posti aadress — link on teie postkastis.",
      userExists: "Selle e-postiga konto on juba olemas. Proovige sisse logida.",
      weakPassword: "Parool peab olema vähemalt 8 tähemärki pikk.",
      samePassword: "Uus parool peab erinema praegusest.",
      invalidEmail: "Palun sisestage kehtiv e-posti aadress.",
      rateLimited: "Liiga palju katseid. Palun oodake hetk ja proovige uuesti.",
      sessionExpired: "Teie seanss on lõppenud. Palun logige uuesti sisse.",
      invalidCart: "Ostukorvis on midagi muutunud. Palun vaadake see üle ja proovige uuesti.",
      photoMissing: "Isikupärastamise foto puudub. Palun lisage foto kingitusele uuesti.",
      invalidShipping: "Palun täitke tarneandmed.",
      paymentsUnavailable: "Maksed ei ole hetkel saadaval. Palun proovige veidi hiljem.",
      checkoutExpired: "Selle makseseansi aeg on läbi. Palun alustage uuesti.",
      loadFailed: "Andmeid ei õnnestunud praegu laadida. Palun proovige uuesti.",
      uploadFailed: "Fotot ei õnnestunud üles laadida. Palun proovige uuesti."
    },
    auth: {
      signInTitle: "Tere tulemast tagasi.",
      signInLead: "Logige sisse, et näha oma tellimusi, toetusi ja kingitusi.",
      registerTitle: "Alustage oma lugu.",
      registerLead: "Looge konto, et tellimused ja kingitused oleksid ühes kohas.",
      or: "või",
      forgot: "Unustasite parooli?",
      passwordHint: "Vähemalt 8 tähemärki.",
      signingIn: "Logime sisse…",
      creating: "Loome kontot…",
      redirecting: "Avame Google'i…",
      checkEmailTitle: "Kontrollige oma e-posti.",
      checkEmail: "Saatsime teile konto kinnitamise lingi. Avage see selles seadmes, et registreerimine lõpetada.",
      forgotTitle: "Unustatud parool",
      forgotText: "Sisestage oma e-post ja saadame lingi uue parooli valimiseks.",
      sendLink: "Saada link",
      sending: "Saadame…",
      resetSentTitle: "Vaadake oma postkasti.",
      resetSent: "Kui selle e-postiga konto on olemas, on lähtestamise link teel.",
      backToSignIn: "Tagasi sisselogimisse",
      resetTitle: "Uus parool",
      resetLead: "Peaaegu valmis — valige oma kontole uus parool.",
      resetLinkInvalid: "See link ei kehti enam. Palun küsige uus.",
      newPassword: "Uus parool",
      savePassword: "Salvesta parool",
      saving: "Salvestame…",
      passwordUpdated: "Teie parool on uuendatud.",
      changePassword: "Parool",
      signingOut: "Logime välja…"
    },
    gift: {
      puzzle: "MÄLESTUSPUSLE",
      title: "Teie kingitus ootab.",
      text: "Valige foto ja me teeme sellest teie mälestuspusle.",
      titleReady: "Foto on käes.",
      textReady: "Aitäh — edasi hoolitseme ise. Fotot saab vahetada kuni tootmise alguseni.",
      previewAlt: "Teie foto mälestuspusle jaoks",
      noPhoto: "Fotot veel pole",
      upload: "Laadi foto üles",
      replace: "Vaheta foto",
      remove: "Eemalda foto",
      photoHint: "JPG, PNG, WebP või HEIC · kuni 25 MB · vähemalt 600 px. Fotot hoitakse privaatselt.",
      uploading: "Laadime üles…",
      removing: "Eemaldame…",
      removeConfirm: "Kas eemaldada see foto kingituselt?",
      locked: "Teie puslet juba valmistatakse, seega fotot enam muuta ei saa.",
      none: "Siin pole veel kingitust. Loo toetamine alates €50 avab mälestuspusle.",
      unlocked: "Kingitus avatud",
      status: {
        photoPending: "Ootab fotot",
        photoUploaded: "Foto üles laaditud",
        approved: "Foto kinnitatud",
        rejected: "Palun valige teine foto",
        processing: "Töös",
        shipped: "Saadetud",
        delivered: "Kohale toimetatud"
      }
    },
    photo: {
      type: "Palun valige JPG-, PNG-, WebP- või HEIC-pilt.",
      size: "Pilt on liiga suur. Palun valige kuni 25 MB fail.",
      decode: "Seda faili ei õnnestunud pildina lugeda. Palun valige teine.",
      small: "Foto on hea trüki jaoks liiga väike. Palun valige vähemalt 600 px laiune pilt."
    },
    payment: {
      canceledEyebrow: "MAKSE TÜHISTATUD",
      canceledTitle: "Midagi hullu ei juhtunud.",
      canceledText: "Makse tühistati ja raha ei võetud. Võite igal ajal uuesti proovida.",
      tryAgain: "Proovi uuesti",
      supportEyebrow: "AITÄH",
      supportTitle: "Teie lehekülg on kirjutatud.",
      orderTitle: "Aitäh tellimuse eest.",
      confirming: "Kinnitame makset Stripe'iga…",
      stillConfirming: "Kinnitamine võib võtta minuti. See ilmub teie kontole kohe, kui Stripe selle kinnitab.",
      supportConfirmed: "Makse {amount} on kinnitatud. Lugu kasvas just veidi suuremaks.",
      orderConfirmed: "Makse kinnitatud — tellimus {order}. Hakkame teie kingitust ette valmistama.",
      giftUnlocked: "Teie toetus avas mälestuspusle. Laadige üles foto, mida soovite kasutada.",
      failed: "Makse ei õnnestunud ja raha ei võetud. Palun proovige uuesti.",
      viewAccount: "Vaata minu kontol"
    }
  },

  lt: {
    nav: {
      catalog: "Katalogas",
      account: "Paskyra",
      cart: "Krepšelis",
      about: "Apie mus"
    },
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
      google: "Tęsti su Google",
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
      noOrders: "Kol kas neturite užsakymų.",
      logOut: "Atsijungti",
      errorPasswordMatch: "Slaptažodžiai nesutampa.",
      eyebrow: "JŪSŲ ALVOXIS",
      chapters: {
        profile: "Profilis",
        orders: "Užsakymai",
        support: "Parama",
        gift: "Dovana",
        settings: "Nustatymai"
      },
      methodEmail: "El. paštas",
      memberSince: "Su mumis nuo",
      signInMethod: "Prisijungimo būdas",
      noSupport: "Dar neparėmėte istorijos. Paskutinis knygos puslapis laukia, kai būsite pasiruošę.",
      supportThanks: "Kiekviena čia esanti eilutė padėjo parašyti kitą puslapį. Ačiū.",
      supportEntry: "Parama",
      payment: {
        pending: "Laukiama patvirtinimo",
        paid: "Apmokėta",
        failed: "Mokėjimas nepavyko",
        canceled: "Atšaukta",
        expired: "Neužbaigta",
        refunded: "Grąžinta"
      },
      fulfillment: {
        unfulfilled: "Ruošiama",
        in_production: "Gaminama",
        shipped: "Išsiųsta",
        delivered: "Pristatyta",
        canceled: "Atšaukta"
      },
      displayName: "Rodomas vardas",
      saved: "Išsaugota."
    },
    checkout: {
      title: "Užsakymo apmokėjimas",
      delivery: "Pristatymas",
      payment: "Mokėjimas",
      fullName: "Vardas ir pavardė",
      address: "Adresas",
      city: "Miestas",
      postalCode: "Pašto kodas",
      country: "Šalis",
      payNow: "Apmokėti dabar",
      backToCart: "Atgal į krepšelį",
      stripeNotice: "Mokėsite saugiai Stripe mokėjimo puslapyje. Jūsų kortelės duomenys nepasiekia ALVOXIS.",
      signInFirst: "Prisijunkite, kad pateiktumėte užsakymą — užsakymas ir jo nuotraukos saugiai liks jūsų paskyroje.",
      preparing: "Ruošiame užsakymą…"
    },
    confirmation: {
      eyebrow: "Jūsų akimirka dabar yra dovana.",
      continueShopping: "Tęsti apsipirkimą"
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
    common: {
      loading: "Kraunama…",
      close: "Uždaryti",
      comingSoon: "Netrukus",
      retry: "Bandyti dar kartą",
      save: "Išsaugoti"
    },
    meta: {
      title: "ALVOXIS — Prasmingos akimirkos",
      description: "ALVOXIS — personalizuotos dovanų dėžutės su nuotraukų dėlione ir atviruku. Kai kurios akimirkos vertos būti prisimintos."
    },
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
      email: "Įveskite teisingą el. pašto adresą.",
      tooShort: "Naudokite bent {min} simbolius."
    },
    products: {
      mini: {
        name: "ALVOXIS Mini",
        tagline: "Maža dėžutė. Prasmingas prisiminimas."
      },
      classic: {
        name: "ALVOXIS Classic",
        tagline: "Sukurta neužmirštamoms akimirkoms."
      },
      signature: {
        name: "ALVOXIS Signature",
        tagline: "Netrukus naujas potyris."
      }
    },
    support: {
      title: "Istorija dar nesibaigė.",
      subtitle: "Padėkite mums parašyti kitą puslapį.",
      text: "ALVOXIS rašoma skyrius po skyriaus — ją kuria žmonės, tikintys, kad mažoje dėžutėje gali tilpti didelis prisiminimas. Jei norite pridėti savo eilutę, plunksna jūsų rankose. O jei ne — sugrįžti prie dovanų irgi graži pabaiga.",
      chooseAmount: "Pasirinkite sumą",
      customAmount: "Savo suma nuo €1.00 iki €100.00",
      placeholder: "Savo suma",
      prompt: "Pasirinkite sumą — kiekvienas puslapis prasideda nuo vieno žodžio.",
      tier1: "Jūs ką tik pridėjote mažą kibirkštį.",
      tier2: "Maža kibirkštis jau tampa istorijos dalimi.",
      tier3: "Kitas puslapis vis arčiau.",
      tier4: "Dabar istorija iš tiesų pradeda judėti.",
      tier5: "Jūs ką tik atvėrėte mažą istorijos paslaptį.",
      giftTitle: "Jūsų laukia truputis papildomos magijos.",
      giftText: "Už paramą nuo €50 padėkosime atminimo dėlione iš jūsų pasirinktos nuotraukos. Nuotrauką galėsite įkelti savo paskyroje, kai mokėjimas bus patvirtintas.",
      cta: "Paremti istoriją",
      note: "Saugus mokėjimas per Stripe · nuo €1 iki €100",
      invalidAmount: "Pasirinkite sumą nuo €1.00 iki €100.00 (ne daugiau kaip du skaitmenys po kablelio).",
      signInFirst: "Pirmiausia prisijunkite — taip jūsų parama ir dovana saugiai liks paskyroje.",
      signIn: "Prisijungti",
      redirecting: "Atveriame saugų mokėjimą…"
    },
    errors: {
      generic: "Kažkas nepavyko. Bandykite dar kartą.",
      network: "Nepavyko susisiekti su serveriu. Patikrinkite ryšį ir bandykite dar kartą.",
      unavailable: "Ši ALVOXIS dalis ruošiama ir netrukus bus prieinama.",
      invalidCredentials: "Neteisingas el. paštas arba slaptažodis.",
      emailNotConfirmed: "Pirmiausia patvirtinkite el. pašto adresą — nuoroda jūsų pašto dėžutėje.",
      userExists: "Paskyra su šiuo el. paštu jau egzistuoja. Pabandykite prisijungti.",
      weakPassword: "Slaptažodį turi sudaryti bent 8 simboliai.",
      samePassword: "Naujas slaptažodis turi skirtis nuo dabartinio.",
      invalidEmail: "Įveskite teisingą el. pašto adresą.",
      rateLimited: "Per daug bandymų. Palaukite akimirką ir bandykite dar kartą.",
      sessionExpired: "Jūsų sesija baigėsi. Prisijunkite dar kartą.",
      invalidCart: "Krepšelyje kažkas pasikeitė. Peržiūrėkite jį ir bandykite dar kartą.",
      photoMissing: "Trūksta personalizavimo nuotraukos. Pridėkite nuotrauką prie dovanos dar kartą.",
      invalidShipping: "Užpildykite pristatymo duomenis.",
      paymentsUnavailable: "Mokėjimai šiuo metu negalimi. Bandykite šiek tiek vėliau.",
      checkoutExpired: "Šios mokėjimo sesijos laikas baigėsi. Pradėkite iš naujo.",
      loadFailed: "Šiuo metu nepavyko įkelti duomenų. Bandykite dar kartą.",
      uploadFailed: "Nuotraukos įkelti nepavyko. Bandykite dar kartą."
    },
    auth: {
      signInTitle: "Sveiki sugrįžę.",
      signInLead: "Prisijunkite, kad matytumėte savo užsakymus, paramą ir dovanas.",
      registerTitle: "Pradėkite savo istoriją.",
      registerLead: "Susikurkite paskyrą, kad užsakymai ir dovanos būtų vienoje vietoje.",
      or: "arba",
      forgot: "Pamiršote slaptažodį?",
      passwordHint: "Bent 8 simboliai.",
      signingIn: "Jungiamės…",
      creating: "Kuriame paskyrą…",
      redirecting: "Atveriame Google…",
      checkEmailTitle: "Patikrinkite el. paštą.",
      checkEmail: "Išsiuntėme nuorodą paskyrai patvirtinti. Atidarykite ją šiame įrenginyje, kad užbaigtumėte registraciją.",
      forgotTitle: "Pamirštas slaptažodis",
      forgotText: "Įveskite el. paštą ir atsiųsime nuorodą naujam slaptažodžiui pasirinkti.",
      sendLink: "Siųsti nuorodą",
      sending: "Siunčiame…",
      resetSentTitle: "Pažvelkite į pašto dėžutę.",
      resetSent: "Jei paskyra su šiuo el. paštu egzistuoja, atkūrimo nuoroda jau keliauja.",
      backToSignIn: "Grįžti į prisijungimą",
      resetTitle: "Naujas slaptažodis",
      resetLead: "Beveik baigta — pasirinkite naują paskyros slaptažodį.",
      resetLinkInvalid: "Ši nuoroda nebegalioja. Paprašykite naujos.",
      newPassword: "Naujas slaptažodis",
      savePassword: "Išsaugoti slaptažodį",
      saving: "Išsaugome…",
      passwordUpdated: "Slaptažodis atnaujintas.",
      changePassword: "Slaptažodis",
      signingOut: "Atsijungiame…"
    },
    gift: {
      puzzle: "ATMINIMO DĖLIONĖ",
      title: "Jūsų dovana laukia.",
      text: "Pasirinkite nuotrauką, ir mes paversime ją jūsų atminimo dėlione.",
      titleReady: "Nuotrauka gauta.",
      textReady: "Ačiū — toliau pasirūpinsime patys. Nuotrauką galite pakeisti, kol neprasidėjo gamyba.",
      previewAlt: "Jūsų nuotrauka atminimo dėlionei",
      noPhoto: "Nuotraukos dar nėra",
      upload: "Įkelti nuotrauką",
      replace: "Pakeisti nuotrauką",
      remove: "Pašalinti nuotrauką",
      photoHint: "JPG, PNG, WebP arba HEIC · iki 25 MB · ne mažiau 600 px. Nuotrauka saugoma privačiai.",
      uploading: "Įkeliame…",
      removing: "Šaliname…",
      removeConfirm: "Pašalinti šią nuotrauką iš dovanos?",
      locked: "Jūsų dėlionė jau gaminama, todėl nuotraukos pakeisti nebegalima.",
      none: "Čia dar nėra dovanos. Parėmus istoriją nuo €50 atsiveria atminimo dėlionė.",
      unlocked: "Dovana atverta",
      status: {
        photoPending: "Laukiama nuotraukos",
        photoUploaded: "Nuotrauka įkelta",
        approved: "Nuotrauka patvirtinta",
        rejected: "Pasirinkite kitą nuotrauką",
        processing: "Vykdoma",
        shipped: "Išsiųsta",
        delivered: "Pristatyta"
      }
    },
    photo: {
      type: "Pasirinkite JPG, PNG, WebP arba HEIC vaizdą.",
      size: "Vaizdas per didelis. Pasirinkite failą iki 25 MB.",
      decode: "Šio failo nepavyko perskaityti kaip vaizdo. Pasirinkite kitą.",
      small: "Nuotrauka per maža kokybiškam spausdinimui. Pasirinkite bent 600 px pločio vaizdą."
    },
    payment: {
      canceledEyebrow: "MOKĖJIMAS ATŠAUKTAS",
      canceledTitle: "Nieko baisaus.",
      canceledText: "Mokėjimas atšauktas, pinigai nenuskaityti. Galite bandyti dar kartą bet kada.",
      tryAgain: "Bandyti dar kartą",
      supportEyebrow: "AČIŪ",
      supportTitle: "Jūsų puslapis parašytas.",
      orderTitle: "Ačiū už užsakymą.",
      confirming: "Tvirtiname mokėjimą per Stripe…",
      stillConfirming: "Patvirtinimas gali užtrukti minutę. Jis atsiras jūsų paskyroje, kai tik Stripe patvirtins.",
      supportConfirmed: "Mokėjimas {amount} patvirtintas. Istorija ką tik šiek tiek paaugo.",
      orderConfirmed: "Mokėjimas patvirtintas — užsakymas {order}. Pradedame ruošti jūsų dovaną.",
      giftUnlocked: "Jūsų parama atvėrė atminimo dėlionę. Įkelkite nuotrauką, kurią norite panaudoti.",
      failed: "Mokėjimas nepavyko, pinigai nenuskaityti. Bandykite dar kartą.",
      viewAccount: "Peržiūrėti paskyroje"
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
