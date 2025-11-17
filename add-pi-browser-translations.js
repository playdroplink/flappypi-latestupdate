const fs = require('fs');

// Read the translations file
const translationsContent = fs.readFileSync('src/constants/translations.ts', 'utf8');

// Define the new translation keys and their translations for each language
const newTranslations = {
  en: {
    piNetworkGaming: "Pi Network Gaming",
    piBrowserLogin: "Pi Browser Login",
    piBrowserLoginDescription: "Authenticate with Pi Network to access Flappy Pi and all its features.",
    environmentStatus: "Environment Status",
    piBrowser: "Pi Browser",
    piNet: "PiNet",
    piSDK: "Pi SDK",
    secure: "Secure",
    detected: "Detected",
    notDetected: "Not Detected",
    available: "Available",
    notAvailable: "Not Available",
    yes: "Yes",
    no: "No",
    authenticating: "Authenticating...",
    signInWithPi: "Sign in with Pi",
    downloadPiBrowser: "Download Pi Browser",
    refreshAfterInstalling: "Refresh After Installing",
    whyPiBrowser: "Why Pi Browser?",
    securePiNetworkAuth: "Secure Pi Network authentication",
    piCryptocurrencyPayments: "Pi cryptocurrency payments",
    rewardedAdsForInGameRewards: "Rewarded ads for in-game rewards",
    enhancedMobileGamingExperience: "Enhanced mobile gaming experience",
    flappyPiRequiresPiBrowserAuth: "Flappy Pi requires Pi Browser authentication for the best gaming experience"
  },
  es: {
    piNetworkGaming: "Juegos de Pi Network",
    piBrowserLogin: "Inicio de Sesión Pi Browser",
    piBrowserLoginDescription: "Autentica con Pi Network para acceder a Flappy Pi y todas sus características.",
    environmentStatus: "Estado del Entorno",
    piBrowser: "Pi Browser",
    piNet: "PiNet",
    piSDK: "Pi SDK",
    secure: "Seguro",
    detected: "Detectado",
    notDetected: "No Detectado",
    available: "Disponible",
    notAvailable: "No Disponible",
    yes: "Sí",
    no: "No",
    authenticating: "Autenticando...",
    signInWithPi: "Iniciar sesión con Pi",
    downloadPiBrowser: "Descargar Pi Browser",
    refreshAfterInstalling: "Actualizar Después de Instalar",
    whyPiBrowser: "¿Por qué Pi Browser?",
    securePiNetworkAuth: "Autenticación segura de Pi Network",
    piCryptocurrencyPayments: "Pagos con criptomoneda Pi",
    rewardedAdsForInGameRewards: "Anuncios recompensados para recompensas en el juego",
    enhancedMobileGamingExperience: "Experiencia de juego móvil mejorada",
    flappyPiRequiresPiBrowserAuth: "Flappy Pi requiere autenticación de Pi Browser para la mejor experiencia de juego"
  },
  tl: {
    piNetworkGaming: "Pi Network Gaming",
    piBrowserLogin: "Pi Browser Login",
    piBrowserLoginDescription: "Mag-authenticate sa Pi Network para ma-access ang Flappy Pi at lahat ng features nito.",
    environmentStatus: "Status ng Environment",
    piBrowser: "Pi Browser",
    piNet: "PiNet",
    piSDK: "Pi SDK",
    secure: "Secure",
    detected: "Nakita",
    notDetected: "Hindi Nakita",
    available: "Available",
    notAvailable: "Hindi Available",
    yes: "Oo",
    no: "Hindi",
    authenticating: "Nag-authenticate...",
    signInWithPi: "Mag-sign in sa Pi",
    downloadPiBrowser: "I-download ang Pi Browser",
    refreshAfterInstalling: "I-refresh Pagkatapos Mag-install",
    whyPiBrowser: "Bakit Pi Browser?",
    securePiNetworkAuth: "Secure na Pi Network authentication",
    piCryptocurrencyPayments: "Pi cryptocurrency payments",
    rewardedAdsForInGameRewards: "Rewarded ads para sa in-game rewards",
    enhancedMobileGamingExperience: "Enhanced mobile gaming experience",
    flappyPiRequiresPiBrowserAuth: "Kailangan ng Flappy Pi ang Pi Browser authentication para sa pinakamahusay na gaming experience"
  },
  hi: {
    piNetworkGaming: "Pi Network गेमिंग",
    piBrowserLogin: "Pi Browser लॉगिन",
    piBrowserLoginDescription: "Flappy Pi और इसकी सभी सुविधाओं तक पहुंचने के लिए Pi Network के साथ प्रमाणित करें।",
    environmentStatus: "पर्यावरण स्थिति",
    piBrowser: "Pi Browser",
    piNet: "PiNet",
    piSDK: "Pi SDK",
    secure: "सुरक्षित",
    detected: "पता चला",
    notDetected: "पता नहीं चला",
    available: "उपलब्ध",
    notAvailable: "उपलब्ध नहीं",
    yes: "हाँ",
    no: "नहीं",
    authenticating: "प्रमाणीकरण हो रहा है...",
    signInWithPi: "Pi के साथ साइन इन करें",
    downloadPiBrowser: "Pi Browser डाउनलोड करें",
    refreshAfterInstalling: "इंस्टॉल करने के बाद रिफ्रेश करें",
    whyPiBrowser: "Pi Browser क्यों?",
    securePiNetworkAuth: "सुरक्षित Pi Network प्रमाणीकरण",
    piCryptocurrencyPayments: "Pi क्रिप्टोकरेंसी भुगतान",
    rewardedAdsForInGameRewards: "इन-गेम रिवॉर्ड्स के लिए पुरस्कृत विज्ञापन",
    enhancedMobileGamingExperience: "बेहतर मोबाइल गेमिंग अनुभव",
    flappyPiRequiresPiBrowserAuth: "सबसे अच्छे गेमिंग अनुभव के लिए Flappy Pi को Pi Browser प्रमाणीकरण की आवश्यकता है"
  },
  zh: {
    piNetworkGaming: "Pi Network 游戏",
    piBrowserLogin: "Pi Browser 登录",
    piBrowserLoginDescription: "通过 Pi Network 认证以访问 Flappy Pi 及其所有功能。",
    environmentStatus: "环境状态",
    piBrowser: "Pi Browser",
    piNet: "PiNet",
    piSDK: "Pi SDK",
    secure: "安全",
    detected: "已检测",
    notDetected: "未检测",
    available: "可用",
    notAvailable: "不可用",
    yes: "是",
    no: "否",
    authenticating: "认证中...",
    signInWithPi: "使用 Pi 登录",
    downloadPiBrowser: "下载 Pi Browser",
    refreshAfterInstalling: "安装后刷新",
    whyPiBrowser: "为什么选择 Pi Browser？",
    securePiNetworkAuth: "安全的 Pi Network 认证",
    piCryptocurrencyPayments: "Pi 加密货币支付",
    rewardedAdsForInGameRewards: "游戏内奖励的广告",
    enhancedMobileGamingExperience: "增强的移动游戏体验",
    flappyPiRequiresPiBrowserAuth: "Flappy Pi 需要 Pi Browser 认证以获得最佳游戏体验"
  },
  id: {
    piNetworkGaming: "Pi Network Gaming",
    piBrowserLogin: "Login Pi Browser",
    piBrowserLoginDescription: "Autentikasi dengan Pi Network untuk mengakses Flappy Pi dan semua fiturnya.",
    environmentStatus: "Status Lingkungan",
    piBrowser: "Pi Browser",
    piNet: "PiNet",
    piSDK: "Pi SDK",
    secure: "Aman",
    detected: "Terdeteksi",
    notDetected: "Tidak Terdeteksi",
    available: "Tersedia",
    notAvailable: "Tidak Tersedia",
    yes: "Ya",
    no: "Tidak",
    authenticating: "Mengautentikasi...",
    signInWithPi: "Masuk dengan Pi",
    downloadPiBrowser: "Unduh Pi Browser",
    refreshAfterInstalling: "Refresh Setelah Instal",
    whyPiBrowser: "Mengapa Pi Browser?",
    securePiNetworkAuth: "Autentikasi Pi Network yang aman",
    piCryptocurrencyPayments: "Pembayaran kripto Pi",
    rewardedAdsForInGameRewards: "Iklan berhadiah untuk hadiah dalam game",
    enhancedMobileGamingExperience: "Pengalaman gaming mobile yang ditingkatkan",
    flappyPiRequiresPiBrowserAuth: "Flappy Pi memerlukan autentikasi Pi Browser untuk pengalaman gaming terbaik"
  },
  pt: {
    piNetworkGaming: "Pi Network Gaming",
    piBrowserLogin: "Login Pi Browser",
    piBrowserLoginDescription: "Autentique com Pi Network para acessar Flappy Pi e todos os seus recursos.",
    environmentStatus: "Status do Ambiente",
    piBrowser: "Pi Browser",
    piNet: "PiNet",
    piSDK: "Pi SDK",
    secure: "Seguro",
    detected: "Detectado",
    notDetected: "Não Detectado",
    available: "Disponível",
    notAvailable: "Não Disponível",
    yes: "Sim",
    no: "Não",
    authenticating: "Autenticando...",
    signInWithPi: "Entrar com Pi",
    downloadPiBrowser: "Baixar Pi Browser",
    refreshAfterInstalling: "Atualizar Após Instalar",
    whyPiBrowser: "Por que Pi Browser?",
    securePiNetworkAuth: "Autenticação segura do Pi Network",
    piCryptocurrencyPayments: "Pagamentos com criptomoeda Pi",
    rewardedAdsForInGameRewards: "Anúncios recompensados para recompensas no jogo",
    enhancedMobileGamingExperience: "Experiência de gaming móvel aprimorada",
    flappyPiRequiresPiBrowserAuth: "Flappy Pi requer autenticação do Pi Browser para a melhor experiência de gaming"
  },
  fr: {
    piNetworkGaming: "Pi Network Gaming",
    piBrowserLogin: "Connexion Pi Browser",
    piBrowserLoginDescription: "Authentifiez-vous avec Pi Network pour accéder à Flappy Pi et toutes ses fonctionnalités.",
    environmentStatus: "Statut de l'Environnement",
    piBrowser: "Pi Browser",
    piNet: "PiNet",
    piSDK: "Pi SDK",
    secure: "Sécurisé",
    detected: "Détecté",
    notDetected: "Non Détecté",
    available: "Disponible",
    notAvailable: "Non Disponible",
    yes: "Oui",
    no: "Non",
    authenticating: "Authentification...",
    signInWithPi: "Se connecter avec Pi",
    downloadPiBrowser: "Télécharger Pi Browser",
    refreshAfterInstalling: "Actualiser Après Installation",
    whyPiBrowser: "Pourquoi Pi Browser?",
    securePiNetworkAuth: "Authentification sécurisée Pi Network",
    piCryptocurrencyPayments: "Paiements en cryptomonnaie Pi",
    rewardedAdsForInGameRewards: "Publicités récompensées pour les récompenses en jeu",
    enhancedMobileGamingExperience: "Expérience de gaming mobile améliorée",
    flappyPiRequiresPiBrowserAuth: "Flappy Pi nécessite l'authentification Pi Browser pour la meilleure expérience de gaming"
  },
  ru: {
    piNetworkGaming: "Pi Network Gaming",
    piBrowserLogin: "Вход Pi Browser",
    piBrowserLoginDescription: "Аутентифицируйтесь с Pi Network для доступа к Flappy Pi и всем его функциям.",
    environmentStatus: "Статус Окружения",
    piBrowser: "Pi Browser",
    piNet: "PiNet",
    piSDK: "Pi SDK",
    secure: "Безопасно",
    detected: "Обнаружено",
    notDetected: "Не Обнаружено",
    available: "Доступно",
    notAvailable: "Не Доступно",
    yes: "Да",
    no: "Нет",
    authenticating: "Аутентификация...",
    signInWithPi: "Войти с Pi",
    downloadPiBrowser: "Скачать Pi Browser",
    refreshAfterInstalling: "Обновить После Установки",
    whyPiBrowser: "Почему Pi Browser?",
    securePiNetworkAuth: "Безопасная аутентификация Pi Network",
    piCryptocurrencyPayments: "Платежи криптовалютой Pi",
    rewardedAdsForInGameRewards: "Реклама с наградами за внутриигровые награды",
    enhancedMobileGamingExperience: "Улучшенный мобильный игровой опыт",
    flappyPiRequiresPiBrowserAuth: "Flappy Pi требует аутентификации Pi Browser для лучшего игрового опыта"
  },
  tr: {
    piNetworkGaming: "Pi Network Gaming",
    piBrowserLogin: "Pi Browser Giriş",
    piBrowserLoginDescription: "Flappy Pi ve tüm özelliklerine erişmek için Pi Network ile kimlik doğrulaması yapın.",
    environmentStatus: "Ortam Durumu",
    piBrowser: "Pi Browser",
    piNet: "PiNet",
    piSDK: "Pi SDK",
    secure: "Güvenli",
    detected: "Tespit Edildi",
    notDetected: "Tespit Edilmedi",
    available: "Mevcut",
    notAvailable: "Mevcut Değil",
    yes: "Evet",
    no: "Hayır",
    authenticating: "Kimlik Doğrulanıyor...",
    signInWithPi: "Pi ile Giriş Yap",
    downloadPiBrowser: "Pi Browser İndir",
    refreshAfterInstalling: "Kurulumdan Sonra Yenile",
    whyPiBrowser: "Neden Pi Browser?",
    securePiNetworkAuth: "Güvenli Pi Network kimlik doğrulaması",
    piCryptocurrencyPayments: "Pi kripto para ödemeleri",
    rewardedAdsForInGameRewards: "Oyun içi ödüller için ödüllü reklamlar",
    enhancedMobileGamingExperience: "Gelişmiş mobil oyun deneyimi",
    flappyPiRequiresPiBrowserAuth: "En iyi oyun deneyimi için Flappy Pi, Pi Browser kimlik doğrulaması gerektirir"
  },
  vi: {
    piNetworkGaming: "Pi Network Gaming",
    piBrowserLogin: "Đăng nhập Pi Browser",
    piBrowserLoginDescription: "Xác thực với Pi Network để truy cập Flappy Pi và tất cả các tính năng của nó.",
    environmentStatus: "Trạng thái Môi trường",
    piBrowser: "Pi Browser",
    piNet: "PiNet",
    piSDK: "Pi SDK",
    secure: "Bảo mật",
    detected: "Đã phát hiện",
    notDetected: "Không phát hiện",
    available: "Có sẵn",
    notAvailable: "Không có sẵn",
    yes: "Có",
    no: "Không",
    authenticating: "Đang xác thực...",
    signInWithPi: "Đăng nhập với Pi",
    downloadPiBrowser: "Tải xuống Pi Browser",
    refreshAfterInstalling: "Làm mới sau khi cài đặt",
    whyPiBrowser: "Tại sao Pi Browser?",
    securePiNetworkAuth: "Xác thực Pi Network bảo mật",
    piCryptocurrencyPayments: "Thanh toán tiền điện tử Pi",
    rewardedAdsForInGameRewards: "Quảng cáo có thưởng cho phần thưởng trong game",
    enhancedMobileGamingExperience: "Trải nghiệm chơi game di động nâng cao",
    flappyPiRequiresPiBrowserAuth: "Flappy Pi yêu cầu xác thực Pi Browser để có trải nghiệm chơi game tốt nhất"
  },
  th: {
    piNetworkGaming: "Pi Network Gaming",
    piBrowserLogin: "เข้าสู่ระบบ Pi Browser",
    piBrowserLoginDescription: "ยืนยันตัวตนกับ Pi Network เพื่อเข้าถึง Flappy Pi และฟีเจอร์ทั้งหมด",
    environmentStatus: "สถานะสภาพแวดล้อม",
    piBrowser: "Pi Browser",
    piNet: "PiNet",
    piSDK: "Pi SDK",
    secure: "ปลอดภัย",
    detected: "ตรวจพบ",
    notDetected: "ไม่ตรวจพบ",
    available: "พร้อมใช้งาน",
    notAvailable: "ไม่พร้อมใช้งาน",
    yes: "ใช่",
    no: "ไม่",
    authenticating: "กำลังยืนยันตัวตน...",
    signInWithPi: "เข้าสู่ระบบด้วย Pi",
    downloadPiBrowser: "ดาวน์โหลด Pi Browser",
    refreshAfterInstalling: "รีเฟรชหลังติดตั้ง",
    whyPiBrowser: "ทำไมต้อง Pi Browser?",
    securePiNetworkAuth: "การยืนยันตัวตน Pi Network ที่ปลอดภัย",
    piCryptocurrencyPayments: "การชำระเงินด้วยสกุลเงินดิจิทัล Pi",
    rewardedAdsForInGameRewards: "โฆษณาที่ให้รางวัลสำหรับรางวัลในเกม",
    enhancedMobileGamingExperience: "ประสบการณ์การเล่นเกมมือถือที่ปรับปรุงแล้ว",
    flappyPiRequiresPiBrowserAuth: "Flappy Pi ต้องการการยืนยันตัวตน Pi Browser เพื่อประสบการณ์การเล่นเกมที่ดีที่สุด"
  }
};

// Function to add translations to a specific language section
function addTranslationsToLanguage(content, languageCode, translations) {
  const languageSectionRegex = new RegExp(`\\s+${languageCode}:\\s*{([\\s\\S]*?)\\s+},`, 'g');
  
  return content.replace(languageSectionRegex, (match, languageContent) => {
    // Find the end of the flappyPi section to add new translations
    const flappyPiSectionRegex = /(\s+flappyPi:\s*"[^"]*",[\s\S]*?merch:\s*"[^"]*",)/;
    const flappyPiMatch = languageContent.match(flappyPiSectionRegex);
    
    if (flappyPiMatch) {
      // Add new translations after the merch line
      const newTranslationsText = Object.entries(translations)
        .map(([key, value]) => `    ${key}: "${value}",`)
        .join('\n');
      
      const updatedContent = languageContent.replace(
        flappyPiMatch[1],
        flappyPiMatch[1] + '\n    \n    // Pi Browser Login Page\n' + newTranslationsText
      );
      
      return `    ${languageCode}: {${updatedContent}    },`;
    }
    
    return match;
  });
}

// Add translations to all languages
let updatedContent = translationsContent;

// Add English translations (already added manually, so skip)
// Add other languages
Object.entries(newTranslations).forEach(([langCode, translations]) => {
  if (langCode !== 'en') {
    updatedContent = addTranslationsToLanguage(updatedContent, langCode, translations);
  }
});

// Write the updated content back to the file
fs.writeFileSync('src/constants/translations.ts', updatedContent);

console.log('✅ Successfully added Pi Browser login translations to all languages!');
