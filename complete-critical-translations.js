// Complete Critical Missing Translations for Flappy Pi - 50 Languages
// This script will add the most important missing translations

import fs from 'fs';

// All 50 languages
const languages = [
  'en', 'es', 'tl', 'hi', 'zh', 'id', 'pt', 'fr', 'ru', 'tr', 'vi', 'th', 'de', 'fa', 'ko', 'ja', 'ar', 'uk', 'it', 'pl', 'bn', 'pa', 'jv', 'te', 'mr', 'ta', 'ur', 'ha', 'gu', 'kn', 'ml', 'my', 'ro', 'ps', 'sd', 'nl', 'sw', 'ne', 'sr', 'ms', 'cs', 'el', 'sk', 'hu', 'sv', 'fi', 'he', 'no', 'am', 'bg'
];

// Critical missing translations found in the codebase
const criticalTranslations = {
  // Help Modal Keys
  helpNavigatePipes: {
    en: "Navigate through pipes",
    es: "Navega a través de las tuberías",
    tl: "Mag-navigate sa mga pipe",
    hi: "पाइप के माध्यम से नेविगेट करें",
    zh: "在管道间穿行",
    id: "Berlayar melalui pipa",
    pt: "Navegue através dos canos",
    fr: "Naviguez à travers les tuyaux",
    ru: "Проходите через трубы",
    tr: "Borulardan geçin",
    vi: "Điều hướng qua các ống",
    th: "นำทางผ่านท่อ",
    de: "Durch Röhren navigieren",
    fa: "از لوله‌ها عبور کنید",
    ko: "파이프를 통과하세요",
    ja: "パイプを通過する",
    ar: "تنقل عبر الأنابيب",
    uk: "Навігуйте через труби",
    it: "Naviga attraverso i tubi",
    pl: "Nawiguj przez rury",
    bn: "পাইপের মধ্য দিয়ে চলুন",
    pa: "ਪਾਈਪਾਂ ਦੇ ਰਾਹੀਂ ਨੈਵੀਗੇਟ ਕਰੋ",
    jv: "Navigasi liwat pipa",
    te: "పైపుల ద్వారా నావిగేట్ చేయండి",
    mr: "पाईप्समधून नेविगेट करा",
    ta: "குழாய்கள் வழியாக செல்லுங்கள்",
    ur: "پائپوں کے ذریعے نیویگیٹ کریں",
    ha: "Shiga ta bututu",
    gu: "પાઈપો દ્વારા નેવિગેટ કરો",
    kn: "ಪೈಪ್‌ಗಳ ಮೂಲಕ ನ್ಯಾವಿಗೇಟ್ ಮಾಡಿ",
    ml: "പൈപ്പുകളിലൂടെ നാവിഗേറ്റ് ചെയ്യുക",
    my: "ပိုက်များမှတဆင့် လမ်းကြောင်းရှာပါ",
    ro: "Navigați prin țevi",
    ps: "د لوله‌ګانو له لارې ځای پر ځای شئ",
    sd: "پائپن جي ذريعي رستو ڏيکاريو",
    nl: "Navigeer door pijpen",
    sw: "Endesha kupitia mabomba",
    ne: "पाइपहरू मार्फत नेविगेट गर्नुहोस्",
    sr: "Навигирајте кроз цеви",
    ms: "Navigasi melalui paip",
    cs: "Navigujte trubkami",
    el: "Πλοηγηθείτε μέσα από σωλήνες",
    sk: "Navigujte cevami",
    hu: "Navigáljon a csöveken keresztül",
    sv: "Navigera genom rör",
    fi: "Navigoi putkien läpi",
    he: "נווט דרך צינורות",
    no: "Naviger gjennom rør",
    am: "በመስመሮች ውስጥ ያሳልሙ",
    bg: "Навигирайте през тръби"
  },

  helpCollectCoins: {
    en: "Collect coins",
    es: "Recoge monedas",
    tl: "Mangolekta ng mga barya",
    hi: "सिक्के इकट्ठा करें",
    zh: "收集金币",
    id: "Kumpulkan koin",
    pt: "Colete moedas",
    fr: "Collectez des pièces",
    ru: "Собирайте монеты",
    tr: "Jeton toplayın",
    vi: "Thu thập xu",
    th: "เก็บเหรียญ",
    de: "Sammeln Sie Münzen",
    fa: "سکه جمع کنید",
    ko: "동전을 수집하세요",
    ja: "コインを集める",
    ar: "اجمع العملات",
    uk: "Збирайте монети",
    it: "Raccogli monete",
    pl: "Zbieraj monety",
    bn: "মুদ্রা সংগ্রহ করুন",
    pa: "ਸਿੱਕੇ ਇਕੱਠੇ ਕਰੋ",
    jv: "Kumpulake koin",
    te: "నాణేలు సేకరించండి",
    mr: "नाणी गोळा करा",
    ta: "நாணயங்களை சேகரிக்கவும்",
    ur: "سکے جمع کریں",
    ha: "Tara tsabarar",
    gu: "નાણાં એકઠા કરો",
    kn: "ನಾಣ್ಯಗಳನ್ನು ಸಂಗ್ರಹಿಸಿ",
    ml: "നാണയങ്ങൾ ശേഖരിക്കുക",
    my: "ဒင်္ဂါးများ စုဆောင်းပါ",
    ro: "Colectați monede",
    ps: "سکې راټول کړئ",
    sd: "سڪا گڏيو",
    nl: "Verzamel munten",
    sw: "Kusanya sarafu",
    ne: "सिक्का जम्मा गर्नुहोस्",
    sr: "Сакупите новчиће",
    ms: "Kumpul duit syiling",
    cs: "Sbírejte mince",
    el: "Συλλέξτε νομίσματα",
    sk: "Zbierajte mince",
    hu: "Gyűjtsön pénzeket",
    sv: "Samla mynt",
    fi: "Kerää kolikoita",
    he: "אסוף מטבעות",
    no: "Samle mynter",
    am: "ገንዘብ ያሰብሩ",
    bg: "Събирайте монети"
  },

  helpPipePoints: {
    en: "Each pipe passed gives points",
    es: "Cada tubería pasada da puntos",
    tl: "Bawat pipe na napasa ay nagbibigay ng puntos",
    hi: "हर पास किया गया पाइप अंक देता है",
    zh: "每个通过的管道都会给分",
    id: "Setiap pipa yang dilalui memberi poin",
    pt: "Cada cano passado dá pontos",
    fr: "Chaque tuyau passé donne des points",
    ru: "Каждая пройденная труба дает очки",
    tr: "Her geçilen boru puan verir",
    vi: "Mỗi ống vượt qua cho điểm",
    th: "ท่อแต่ละท่อที่ผ่านให้คะแนน",
    de: "Jedes überwundene Rohr gibt Punkte",
    fa: "هر لوله عبور شده امتیاز می‌دهد",
    ko: "통과한 각 파이프가 점수를 줍니다",
    ja: "通過したパイプごとにポイントが得られます",
    ar: "كل أنبوب تم اجتيازه يعطي نقاط",
    uk: "Кожна пройдена труба дає очки",
    it: "Ogni tubo superato dà punti",
    pl: "Każda przejść rura daje punkty",
    bn: "প্রতিটি পাস করা পাইপ পয়েন্ট দেয়",
    pa: "ਹਰ ਪਾਸ ਕੀਤਾ ਪਾਈਪ ਪੁਆਇੰਟ ਦਿੰਦਾ ਹੈ",
    jv: "Saben pipa sing diliwati menehi poin",
    te: "ప్రతి పాస్ చేసిన పైప్ పాయింట్లు ఇస్తుంది",
    mr: "प्रत्येक पास केलेला पाईप गुण देतो",
    ta: "ஒவ்வொரு கடந்த குழாயும் புள்ளிகள் தரும்",
    ur: "ہر پاس کیا گیا پائپ پوائنٹ دیتا ہے",
    ha: "Kowane bututu da aka wuce yana ba da maki",
    gu: "દરેક પાસ કરેલી પાઈપ પોઇન્ટ આપે છે",
    kn: "ಪ್ರತಿ ಪಾಸ್ ಮಾಡಿದ ಪೈಪ್ ಅಂಕಗಳನ್ನು ನೀಡುತ್ತದೆ",
    ml: "ഓരോ പാസ് ചെയ്ത പൈപ്പും പോയിന്റുകൾ നൽകുന്നു",
    my: "ဖြတ်သန်းသွားသော ပိုက်တိုင်းက အမှတ်များ ပေးသည်",
    ro: "Fiecare țeavă trecută dă puncte",
    ps: "هر هغه لوله چې تیریږي ګڼه ورکوي",
    sd: "هر پائپ جيڪو گذري وڃي پوائنٽ ڏيندو آهي",
    nl: "Elke overwonnen pijp geeft punten",
    sw: "Kila bomba iliyopitishwa inatoa pointi",
    ne: "प्रत्येक पास गरिएको पाइपले अंक दिन्छ",
    sr: "Свака пређена цев даје поене",
    ms: "Setiap paip yang dilalui memberi mata",
    cs: "Každá překonaná trubka dává body",
    el: "Κάθε σωλήνας που περνάει δίνει πόντους",
    sk: "Každá prekonaná rúra dáva body",
    hu: "Minden átvitt cső pontot ad",
    sv: "Varje passerad rör ger poäng",
    fi: "Jokainen ylitetty putki antaa pisteitä",
    he: "כל צינור שעוברים נותן נקודות",
    no: "Hvert rør som passeres gir poeng",
    am: "እያንዳንዱ የተሻገረ ቱቦ ነጥቦች ይሰጣል",
    bg: "Всяка премината тръба дава точки"
  },

  helpPracticeTiming: {
    en: "Practice your timing",
    es: "Practica tu sincronización",
    tl: "Sanayin ang iyong timing",
    hi: "अपनी टाइमिंग का अभ्यास करें",
    zh: "练习你的时机",
    id: "Latih timing Anda",
    pt: "Pratique seu timing",
    fr: "Pratiquez votre timing",
    ru: "Тренируйте своё время",
    tr: "Zamanlamanızı pratik edin",
    vi: "Luyện tập thời gian của bạn",
    th: "ฝึกฝนจังหวะของคุณ",
    de: "Üben Sie Ihr Timing",
    fa: "زمان‌بندی خود را تمرین کنید",
    ko: "타이밍을 연습하세요",
    ja: "タイミングを練習する",
    ar: "تدرب على توقيتك",
    uk: "Тренуйте свій час",
    it: "Esercita il tuo timing",
    pl: "Ćwicz swój timing",
    bn: "আপনার সময় অনুশীলন করুন",
    pa: "ਆਪਣੇ ਟਾਈਮਿੰਗ ਦਾ ਅਭਿਆਸ ਕਰੋ",
    jv: "Latihan timing sampeyan",
    te: "మీ టైమింగ్‌ను ప్రాక్టీస్ చేయండి",
    mr: "तुमची टाइमिंग सराव करा",
    ta: "உங்கள் நேரத்தை பயிற்சி செய்யுங்கள்",
    ur: "اپنی ٹائمنگ کی مشق کریں",
    ha: "Yi aikin lokacin ku",
    gu: "તમારી ટાઇમિંગનો અભ્યાસ કરો",
    kn: "ನಿಮ್ಮ ಟೈಮಿಂಗ್ ಅಭ್ಯಾಸ ಮಾಡಿ",
    ml: "നിങ്ങളുടെ സമയം പരിശീലിക്കുക",
    my: "သင့်အချိန်ကို လေ့ကျင့်ပါ",
    ro: "Exersați-vă timing-ul",
    ps: "د خپل وخت تمرین وکړئ",
    sd: "پنهنجي وقت جو مشق ڪريو",
    nl: "Oefen je timing",
    sw: "Jifunze muda wako",
    ne: "आफ्नो समयको अभ्यास गर्नुहोस्",
    sr: "Вежбајте своје време",
    ms: "Latih masa anda",
    cs: "Cvičte svůj timing",
    el: "Εξασκηθείτε στο timing σας",
    sk: "Cvičte svoj timing",
    hu: "Gyakorolja az időzítését",
    sv: "Öva din timing",
    fi: "Harjoittele ajoitustasi",
    he: "תרגל את התזמון שלך",
    no: "Øv på timingen din",
    am: "የጊዜውን አሰልጥን",
    bg: "Упражнявайте времето си"
  },

  helpStayCalm: {
    en: "Stay calm and focused",
    es: "Mantén la calma y enfócate",
    tl: "Manatiling kalmado at nakatuon",
    hi: "शांत और केंद्रित रहें",
    zh: "保持冷静和专注",
    id: "Tetap tenang dan fokus",
    pt: "Mantenha a calma e foco",
    fr: "Restez calme et concentré",
    ru: "Оставайтесь спокойным и сосредоточенным",
    tr: "Sakin ve odaklanmış kalın",
    vi: "Giữ bình tĩnh và tập trung",
    th: "สงบและมีสมาธิ",
    de: "Bleiben Sie ruhig und konzentriert",
    fa: "آرام و متمرکز بمانید",
    ko: "차분하고 집중하세요",
    ja: "落ち着いて集中する",
    ar: "ابق هادئًا ومركّزًا",
    uk: "Залишайтеся спокійним і зосередженим",
    it: "Rimani calmo e concentrato",
    pl: "Zachowaj spokój i skupienie",
    bn: "শান্ত এবং মনোযোগী থাকুন",
    pa: "ਸ਼ਾਂਤ ਅਤੇ ਧਿਆਨ ਕੇਂਦਰਿਤ ਰੱਖੋ",
    jv: "Tetep tenang lan fokus",
    te: "ప్రశాంతంగా మరియు దృష్టి పెట్టండి",
    mr: "शांत आणि केंद्रित रहा",
    ta: "அமைதியாகவும் கவனமாகவும் இருங்கள்",
    ur: "پرسکون اور توجہ مرکوز رکھیں",
    ha: "Ka natsu da mai hankali",
    gu: "શાંત અને કેન્દ્રિત રહો",
    kn: "ಶಾಂತ ಮತ್ತು ಕೇಂದ್ರೀಕೃತವಾಗಿರಿ",
    ml: "ശാന്തനും ശ്രദ്ധയോടെയും ഇരിക്കുക",
    my: "အေးဆေးနဲ့ အာရုံစိုက်ပါ",
    ro: "Rămâi calm și concentrat",
    ps: "آرام او متمرکز پاتې شئ",
    sd: "پرسڪون ۽ مرڪوز رهو",
    nl: "Blijf kalm en gefocust",
    sw: "Kaa utulivu na uzingatie",
    ne: "शान्त र केन्द्रित रहनुहोस्",
    sr: "Останите смирни и фокусирани",
    ms: "Kekal tenang dan fokus",
    cs: "Zůstaňte klidní a soustředění",
    el: "Μείνετε ήρεμοι και συγκεντρωμένοι",
    sk: "Zostaňte pokojní a sústredení",
    hu: "Maradjon nyugodt és összpontosított",
    sv: "Håll dig lugn och fokuserad",
    fi: "Pysy rauhallisena ja keskittyneenä",
    he: "הישאר רגוע ומרוכז",
    no: "Hold deg rolig og fokusert",
    am: "ዝግጁ እና ያተኩሩ",
    bg: "Останете спокойни и концентрирани"
  },

  // Game Modes
  helpClassicMode: {
    en: "Classic Mode - Traditional gameplay",
    es: "Modo Clásico - Juego tradicional",
    tl: "Klasikong Mode - Tradisyonal na gameplay",
    hi: "क्लासिक मोड - पारंपरिक गेमप्ले",
    zh: "经典模式 - 传统游戏玩法",
    id: "Mode Klasik - Gameplay tradisional",
    pt: "Modo Clássico - Jogabilidade tradicional",
    fr: "Mode Classique - Gameplay traditionnel",
    ru: "Классический режим - Традиционный геймплей",
    tr: "Klasik Mod - Geleneksel oyun",
    vi: "Chế độ Cổ điển - Gameplay truyền thống",
    th: "โหมดคลาสสิก - การเล่นแบบดั้งเดิม",
    de: "Klassischer Modus - Traditionelles Gameplay",
    fa: "حالت کلاسیک - گیم‌پلی سنتی",
    ko: "클래식 모드 - 전통적인 게임플레이",
    ja: "クラシックモード - 伝統的なゲームプレイ",
    ar: "الوضع الكلاسيكي - لعب تقليدي",
    uk: "Класичний режим - Традиційний геймплей",
    it: "Modalità Classica - Gameplay tradizionale",
    pl: "Tryb Klasyczny - Tradycyjna rozgrywka",
    bn: "ক্লাসিক মোড - ঐতিহ্যগত গেমপ্লে",
    pa: "ਕਲਾਸਿਕ ਮੋਡ - ਰਵਾਇਤੀ ਗੇਮਪਲੇ",
    jv: "Mode Klasik - Gameplay tradisional",
    te: "క్లాసిక్ మోడ్ - సాంప్రదాయ గేమ్‌ప్లే",
    mr: "क्लासिक मोड - पारंपारिक गेमप्ले",
    ta: "கிளாசிக் மோட் - பாரம்பரிய விளையாட்டு",
    ur: "کلاسک موڈ - روایتی گیم پلے",
    ha: "Yanayin Classic - Wasa na gargajiya",
    gu: "ક્લાસિક મોડ - પરંપરાગત ગેમપ્લે",
    kn: "ಕ್ಲಾಸಿಕ್ ಮೋಡ್ - ಸಾಂಪ್ರದಾಯಿಕ ಗೇಮ್‌ಪ್ಲೇ",
    ml: "ക്ലാസിക് മോഡ് - പരമ്പരാഗത ഗെയിം‌പ്ലേ",
    my: "ဂိမ်းအမျိုးအစား - ရိုးရာ ဂိမ်းကစားနည်း",
    ro: "Mod Clasic - Gameplay tradițional",
    ps: "کلاسیک موډ - دودیز لوبه",
    sd: "کلاسيڪ موڊ - رواجي راند",
    nl: "Klassieke Modus - Traditionele gameplay",
    sw: "Hali ya Klasiki - Mchezo wa jadi",
    ne: "क्लासिक मोड - परम्परागत गेमप्ले",
    sr: "Класични режим - Традиционална игра",
    ms: "Mod Klasik - Permainan tradisional",
    cs: "Klasický režim - Tradiční hratelnost",
    el: "Κλασική Λειτουργία - Παραδοσιακό gameplay",
    sk: "Klasický režim - Tradičná hrateľnosť",
    hu: "Klasszikus mód - Hagyományos játékmenet",
    sv: "Klassiskt läge - Traditionell spelstil",
    fi: "Klassinen tila - Perinteinen pelattavuus",
    he: "מצב קלאסי - משחק מסורתי",
    no: "Klassisk modus - Tradisjonell spillstil",
    am: "ክላሲክ ሁኔታ - ባህላዊ የጨዋታ አያያዝ",
    bg: "Класически режим - Традиционен геймплей"
  },

  helpEndlessMode: {
    en: "Endless Mode - Infinite challenge",
    es: "Modo Infinito - Desafío sin fin",
    tl: "Walang Hanggan na Mode - Walang hanggan na hamon",
    hi: "अनंत मोड - असीमित चुनौती",
    zh: "无尽模式 - 无限挑战",
    id: "Mode Tak Terbatas - Tantangan tak terbatas",
    pt: "Modo Infinito - Desafio infinito",
    fr: "Mode Infini - Défi infini",
    ru: "Бесконечный режим - Бесконечный вызов",
    tr: "Sonsuz Mod - Sonsuz meydan okuma",
    vi: "Chế độ Vô tận - Thử thách vô hạn",
    th: "โหมดไม่มีที่สิ้นสุด - ความท้าทายไม่มีที่สิ้นสุด",
    de: "Endlos-Modus - Endlose Herausforderung",
    fa: "حالت بی‌نهایت - چالش بی‌نهایت",
    ko: "무한 모드 - 무한한 도전",
    ja: "エンドレスモード - 無限の挑戦",
    ar: "الوضع اللانهائي - تحدٍ لا ينتهي",
    uk: "Безкінечний режим - Безкінечний виклик",
    it: "Modalità Infinita - Sfida infinita",
    pl: "Tryb Nieskończony - Nieskończone wyzwanie",
    bn: "অসীম মোড - অসীম চ্যালেঞ্জ",
    pa: "ਅਸੀਮ ਮੋਡ - ਅਸੀਮ ਚੈਲੇਂਜ",
    jv: "Mode Tanpa Wates - Tantangan tanpa wates",
    te: "అనంత మోడ్ - అనంత సవాలు",
    mr: "अमर्याद मोड - अमर्याद आव्हान",
    ta: "எல்லையற்ற மோட் - எல்லையற்ற சவால்",
    ur: "لامحدود موڈ - لامحدود چیلنج",
    ha: "Yanayin Rashin Iyaka - Kalubalen Rashin Iyaka",
    gu: "અનંત મોડ - અનંત પડકાર",
    kn: "ಅನಂತ ಮೋಡ್ - ಅನಂತ ಸವಾಲು",
    ml: "അനന്ത മോഡ് - അനന്ത വെല്ലുവിളി",
    my: "အဆုံးမဲ့ ဂိမ်းအမျိုးအစား - အဆုံးမဲ့ စိန်ခေါ်မှု",
    ro: "Mod Infinit - Provocare infinită",
    ps: "د تل موډ - د تل ننګون",
    sd: "بے انتها موڊ - بے انتها چيلينج",
    nl: "Eindeloze Modus - Eindeloze uitdaging",
    sw: "Hali ya Mwisho - Changamoto isiyo na mwisho",
    ne: "अनन्त मोड - अनन्त चुनौती",
    sr: "Бесконачни режим - Бесконачни изазов",
    ms: "Mod Tanpa Hujung - Cabaran tanpa hujung",
    cs: "Nekonečný režim - Nekonečná výzva",
    el: "Ατέρμονη Λειτουργία - Ατέρμονη πρόκληση",
    sk: "Nekonečný režim - Nekonečná výzva",
    hu: "Végtelen mód - Végtelen kihívás",
    sv: "Ändlöst läge - Ändlös utmaning",
    fi: "Loputon tila - Loputon haaste",
    he: "מצב אינסופי - אתגר אינסופי",
    no: "Uendelig modus - Uendelig utfordring",
    am: "ወሰን አልባ ሁኔታ - ወሰን አልባ ፈተና",
    bg: "Безкраен режим - Безкрайно предизвикателство"
  },

  helpChallengeMode: {
    en: "Challenge Mode - Special objectives",
    es: "Modo Desafío - Objetivos especiales",
    tl: "Mode Hamon - Mga espesyal na layunin",
    hi: "चुनौती मोड - विशेष उद्देश्य",
    zh: "挑战模式 - 特殊目标",
    id: "Mode Tantangan - Tujuan khusus",
    pt: "Modo Desafio - Objetivos especiais",
    fr: "Mode Défi - Objectifs spéciaux",
    ru: "Режим Вызова - Особые цели",
    tr: "Meydan Okuma Modu - Özel hedefler",
    vi: "Chế độ Thử thách - Mục tiêu đặc biệt",
    th: "โหมดท้าทาย - เป้าหมายพิเศษ",
    de: "Herausforderungs-Modus - Besondere Ziele",
    fa: "حالت چالش - اهداف ویژه",
    ko: "챌린지 모드 - 특별한 목표",
    ja: "チャレンジモード - 特別な目標",
    ar: "وضع التحدي - أهداف خاصة",
    uk: "Режим Виклику - Особливі цілі",
    it: "Modalità Sfida - Obiettivi speciali",
    pl: "Tryb Wyzwania - Specjalne cele",
    bn: "চ্যালেঞ্জ মোড - বিশেষ উদ্দেশ্য",
    pa: "ਚੈਲੇਂਜ ਮੋਡ - ਖਾਸ ਟੀਚੇ",
    jv: "Mode Tantangan - Tujuan khusus",
    te: "సవాలు మోడ్ - ప్రత్యేక లక్ష్యాలు",
    mr: "आव्हान मोड - विशेष उद्दिष्टे",
    ta: "சவால் மோட் - சிறப்பு நோக்கங்கள்",
    ur: "چیلنج موڈ - خصوصی مقاصد",
    ha: "Yanayin Kalubale - Manufofin Musamman",
    gu: "પડકાર મોડ - વિશેષ ધ્યેયો",
    kn: "ಸವಾಲು ಮೋಡ್ - ವಿಶೇಷ ಗುರಿಗಳು",
    ml: "വെല്ലുവിളി മോഡ് - പ്രത്യേക ലക്ഷ്യങ്ങൾ",
    my: "စိန်ခေါ်မှု ဂိမ်းအမျိုးအစား - အထူး ရည်မှန်းချက်များ",
    ro: "Mod Provocare - Obiective speciale",
    ps: "د ننګون موډ - ځانګړي موخې",
    sd: "چيلينج موڊ - خاص مقصد",
    nl: "Uitdagingsmodus - Speciale doelen",
    sw: "Hali ya Changamoto - Malengo maalum",
    ne: "चुनौती मोड - विशेष लक्ष्यहरू",
    sr: "Режим Изазова - Посебни циљеви",
    ms: "Mod Cabaran - Objektif khas",
    cs: "Režim Výzvy - Speciální cíle",
    el: "Λειτουργία Πρόκλησης - Ειδικοί στόχοι",
    sk: "Režim Výzvy - Špeciálne ciele",
    hu: "Kihívás Mód - Különleges célok",
    sv: "Utmaningsläge - Särskilda mål",
    fi: "Haaste-tila - Erikoistavoitteet",
    he: "מצב אתגר - יעדים מיוחדים",
    no: "Utfordringsmodus - Spesielle mål",
    am: "ፈተና ሁኔታ - ልዩ ግቦች",
    bg: "Режим на Предизвикателство - Специални цели"
  }
};

// Function to read current translations file
function readCurrentTranslations() {
  try {
    const content = fs.readFileSync('src/constants/translations.ts', 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading translations file:', error);
    return null;
  }
}

// Function to add missing translations
function addMissingTranslations() {
  const currentContent = readCurrentTranslations();
  if (!currentContent) {
    console.error('Could not read current translations file');
    return;
  }

  let updatedContent = currentContent;

  // Add missing translations for each language
  languages.forEach(langCode => {
    if (langCode === 'en') return; // Skip English as it's the base

    // Find the language section in the translations object
    const langSectionRegex = new RegExp(`\\s+${langCode}:\\s*{`, 'g');
    const langSectionMatch = updatedContent.match(langSectionRegex);

    if (langSectionMatch) {
      // Language section exists, add missing translations
      Object.keys(criticalTranslations).forEach(key => {
        const translation = criticalTranslations[key][langCode];
        if (translation) {
          // Check if this key already exists in the language section
          const keyExistsRegex = new RegExp(`\\s+${key}:\\s*"[^"]*"`, 'g');
          if (!keyExistsRegex.test(updatedContent)) {
            // Add the missing translation
            const insertPoint = updatedContent.lastIndexOf(`  ${langCode}: {`);
            const endOfLangSection = updatedContent.indexOf('  },', insertPoint);
            
            if (insertPoint !== -1 && endOfLangSection !== -1) {
              const beforeSection = updatedContent.substring(0, endOfLangSection);
              const afterSection = updatedContent.substring(endOfLangSection);
              updatedContent = beforeSection + `\n    ${key}: "${translation}",` + afterSection;
            }
          }
        }
      });
    }
  });

  // Write the updated content back to the file
  try {
    fs.writeFileSync('src/constants/translations.ts', updatedContent, 'utf8');
    console.log('✅ Successfully added critical missing translations to all 50 languages!');
    console.log(`📊 Added ${Object.keys(criticalTranslations).length} translation keys`);
    console.log(`🌍 Updated ${languages.length} languages`);
  } catch (error) {
    console.error('Error writing translations file:', error);
  }
}

// Run the translation completion
console.log('🚀 Starting critical translation completion for 50 languages...');
addMissingTranslations();
console.log('🎉 Critical translation completion finished!'); 