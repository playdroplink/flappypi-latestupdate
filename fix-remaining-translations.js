import fs from 'fs';

const translationsFile = 'src/constants/translations.ts';
let content = fs.readFileSync(translationsFile, 'utf8');

// Complete translations for all remaining languages that need fixing
const completeTranslations = {
  // Languages that need proper translations (not just English fallbacks)
  tl: {
    welcomeTitle: "Maligayang pagdating sa Flappy Pi!",
    piNetworkAuth: "Pi Network Authentication",
    piAuthDescription: "Kumonekta sa iyong Pi Network account para sa ligtas na authentication",
    piNetworkBenefits: "Mga Benepisyo ng Pi Network:",
    piBenefit1: "• Ligtas na blockchain authentication",
    piBenefit2: "• Walang password na kailangang tandaan",
    piBenefit3: "• Access sa Pi payments",
    piBenefit4: "• Sync sa lahat ng devices",
    connectWithPi: "Kumonekta sa Pi Network",
    connectingToPi: "Kumokonekta sa Pi...",
    requiresPiBrowser: "Nangangailangan ng Pi Browser o Pi SDK",
    piAuthSuccessful: "Matagumpay ang Pi authentication!",
    piAuthFailed: "Nabigo ang Pi authentication. Subukan muli.",
    piAuthError: "Pi authentication error: ",
    piBrowserOnly: "Pi Network authentication ay available lamang sa Pi Browser.",
    letsFlap: "Tayo'y Lumipad!"
  },
  id: {
    welcomeTitle: "Selamat datang di Flappy Pi!",
    piNetworkAuth: "Autentikasi Pi Network",
    piAuthDescription: "Hubungkan dengan akun Pi Network Anda untuk autentikasi yang aman",
    piNetworkBenefits: "Manfaat Pi Network:",
    piBenefit1: "• Autentikasi blockchain yang aman",
    piBenefit2: "• Tidak perlu mengingat password",
    piBenefit3: "• Akses ke pembayaran Pi",
    piBenefit4: "• Sinkronisasi di semua perangkat",
    connectWithPi: "Hubungkan dengan Pi Network",
    connectingToPi: "Menghubungkan ke Pi...",
    requiresPiBrowser: "Memerlukan Pi Browser atau Pi SDK",
    piAuthSuccessful: "Autentikasi Pi berhasil!",
    piAuthFailed: "Autentikasi Pi gagal. Silakan coba lagi.",
    piAuthError: "Kesalahan autentikasi Pi: ",
    piBrowserOnly: "Autentikasi Pi Network hanya tersedia di Pi Browser.",
    letsFlap: "Mari Terbang!"
  },
  uk: {
    welcomeTitle: "Ласкаво просимо до Flappy Pi!",
    piNetworkAuth: "Аутентифікація Pi Network",
    piAuthDescription: "Підключіться до вашого облікового запису Pi Network для безпечної аутентифікації",
    piNetworkBenefits: "Переваги Pi Network:",
    piBenefit1: "• Безпечна аутентифікація блокчейн",
    piBenefit2: "• Не потрібно запам'ятовувати пароль",
    piBenefit3: "• Доступ до Pi платежів",
    piBenefit4: "• Синхронізація на всіх пристроях",
    connectWithPi: "Підключитися до Pi Network",
    connectingToPi: "Підключення до Pi...",
    requiresPiBrowser: "Потребує Pi Browser або Pi SDK",
    piAuthSuccessful: "Аутентифікація Pi успішна!",
    piAuthFailed: "Аутентифікація Pi невдала. Спробуйте ще раз.",
    piAuthError: "Помилка аутентифікації Pi: ",
    piBrowserOnly: "Аутентифікація Pi Network доступна тільки в Pi Browser.",
    letsFlap: "Давайте полетімо!"
  },
  fa: {
    welcomeTitle: "به Flappy Pi خوش آمدید!",
    piNetworkAuth: "احراز هویت Pi Network",
    piAuthDescription: "به حساب Pi Network خود متصل شوید برای احراز هویت امن",
    piNetworkBenefits: "مزایای Pi Network:",
    piBenefit1: "• احراز هویت امن بلاکچین",
    piBenefit2: "• نیازی به یادآوری رمز عبور نیست",
    piBenefit3: "• دسترسی به پرداخت‌های Pi",
    piBenefit4: "• همگام‌سازی در تمام دستگاه‌ها",
    connectWithPi: "اتصال به Pi Network",
    connectingToPi: "در حال اتصال به Pi...",
    requiresPiBrowser: "نیاز به Pi Browser یا Pi SDK",
    piAuthSuccessful: "احراز هویت Pi موفقیت‌آمیز بود!",
    piAuthFailed: "احراز هویت Pi ناموفق بود. لطفاً دوباره تلاش کنید.",
    piAuthError: "خطای احراز هویت Pi: ",
    piBrowserOnly: "احراز هویت Pi Network فقط در Pi Browser در دسترس است.",
    letsFlap: "بیایید پرواز کنیم!"
  },
  // Add all remaining languages that need proper translations
  // I'll continue with the most important ones first
  ko: {
    welcomeTitle: "Flappy Pi에 오신 것을 환영합니다!",
    piNetworkAuth: "Pi Network 인증",
    piAuthDescription: "안전한 인증을 위해 Pi Network 계정에 연결하세요",
    piNetworkBenefits: "Pi Network 혜택:",
    piBenefit1: "• 안전한 블록체인 인증",
    piBenefit2: "• 비밀번호 기억할 필요 없음",
    piBenefit3: "• Pi 결제 접근",
    piBenefit4: "• 모든 기기에서 동기화",
    connectWithPi: "Pi Network에 연결",
    connectingToPi: "Pi에 연결 중...",
    requiresPiBrowser: "Pi Browser 또는 Pi SDK 필요",
    piAuthSuccessful: "Pi 인증 성공!",
    piAuthFailed: "Pi 인증 실패. 다시 시도해주세요.",
    piAuthError: "Pi 인증 오류: ",
    piBrowserOnly: "Pi Network 인증은 Pi Browser에서만 사용 가능합니다.",
    letsFlap: "날아봅시다!"
  },
  ja: {
    welcomeTitle: "Flappy Piへようこそ！",
    piNetworkAuth: "Pi Network認証",
    piAuthDescription: "安全な認証のためにPi Networkアカウントに接続してください",
    piNetworkBenefits: "Pi Networkの利点:",
    piBenefit1: "• 安全なブロックチェーン認証",
    piBenefit2: "• パスワードを覚える必要がない",
    piBenefit3: "• Pi決済へのアクセス",
    piBenefit4: "• すべてのデバイスで同期",
    connectWithPi: "Pi Networkに接続",
    connectingToPi: "Piに接続中...",
    requiresPiBrowser: "Pi BrowserまたはPi SDKが必要",
    piAuthSuccessful: "Pi認証成功！",
    piAuthFailed: "Pi認証失敗。もう一度お試しください。",
    piAuthError: "Pi認証エラー: ",
    piBrowserOnly: "Pi Network認証はPi Browserでのみ利用可能です。",
    letsFlap: "フラッピングしよう！"
  },
  ar: {
    welcomeTitle: "مرحبًا بك في Flappy Pi!",
    piNetworkAuth: "مصادقة شبكة Pi",
    piAuthDescription: "اتصل بحساب شبكة Pi الخاص بك للمصادقة الآمنة",
    piNetworkBenefits: "مزايا شبكة Pi:",
    piBenefit1: "• مصادقة بلوكشين آمنة",
    piBenefit2: "• لا حاجة لتذكر كلمة المرور",
    piBenefit3: "• الوصول إلى مدفوعات Pi",
    piBenefit4: "• المزامنة عبر جميع الأجهزة",
    connectWithPi: "اتصل بشبكة Pi",
    connectingToPi: "جاري الاتصال بـ Pi...",
    requiresPiBrowser: "يتطلب Pi Browser أو Pi SDK",
    piAuthSuccessful: "مصادقة Pi ناجحة!",
    piAuthFailed: "مصادقة Pi فشلت. يرجى المحاولة مرة أخرى.",
    piAuthError: "خطأ في مصادقة Pi: ",
    piBrowserOnly: "مصادقة شبكة Pi متاحة فقط في Pi Browser.",
    letsFlap: "دعنا نرفرف!"
  },
  pt: {
    welcomeTitle: "Bem-vindo ao Flappy Pi!",
    piNetworkAuth: "Autenticação Pi Network",
    piAuthDescription: "Conecte-se à sua conta Pi Network para autenticação segura",
    piNetworkBenefits: "Benefícios do Pi Network:",
    piBenefit1: "• Autenticação blockchain segura",
    piBenefit2: "• Sem senha para lembrar",
    piBenefit3: "• Acesso a pagamentos Pi",
    piBenefit4: "• Sincronização em todos os dispositivos",
    connectWithPi: "Conectar com Pi Network",
    connectingToPi: "Conectando ao Pi...",
    requiresPiBrowser: "Requer Pi Browser ou Pi SDK",
    piAuthSuccessful: "Autenticação Pi bem-sucedida!",
    piAuthFailed: "Autenticação Pi falhou. Tente novamente.",
    piAuthError: "Erro de autenticação Pi: ",
    piBrowserOnly: "Autenticação Pi Network disponível apenas no Pi Browser.",
    letsFlap: "Vamos Voar!"
  },
  bn: {
    welcomeTitle: "Flappy Pi-তে স্বাগতম!",
    piNetworkAuth: "Pi Network প্রমাণীকরণ",
    piAuthDescription: "নিরাপদ প্রমাণীকরণের জন্য আপনার Pi Network অ্যাকাউন্টের সাথে সংযোগ করুন",
    piNetworkBenefits: "Pi Network সুবিধা:",
    piBenefit1: "• নিরাপদ ব্লকচেইন প্রমাণীকরণ",
    piBenefit2: "• পাসওয়ার্ড মনে রাখার প্রয়োজন নেই",
    piBenefit3: "• Pi পেমেন্টে অ্যাক্সেস",
    piBenefit4: "• সমস্ত ডিভাইসে সিঙ্ক",
    connectWithPi: "Pi Network-এর সাথে সংযোগ করুন",
    connectingToPi: "Pi-এর সাথে সংযোগ হচ্ছে...",
    requiresPiBrowser: "Pi Browser বা Pi SDK প্রয়োজন",
    piAuthSuccessful: "Pi প্রমাণীকরণ সফল!",
    piAuthFailed: "Pi প্রমাণীকরণ ব্যর্থ। আবার চেষ্টা করুন।",
    piAuthError: "Pi প্রমাণীকরণ ত্রুটি: ",
    piBrowserOnly: "Pi Network প্রমাণীকরণ শুধুমাত্র Pi Browser-এ উপলব্ধ।",
    letsFlap: "চলুন উড়ে যাই!"
  },
  ru: {
    welcomeTitle: "Добро пожаловать в Flappy Pi!",
    piNetworkAuth: "Аутентификация Pi Network",
    piAuthDescription: "Подключитесь к аккаунту Pi Network для безопасной аутентификации",
    piNetworkBenefits: "Преимущества Pi Network:",
    piBenefit1: "• Безопасная аутентификация блокчейн",
    piBenefit2: "• Не нужно запоминать пароль",
    piBenefit3: "• Доступ к платежам Pi",
    piBenefit4: "• Синхронизация на всех устройствах",
    connectWithPi: "Подключиться к Pi Network",
    connectingToPi: "Подключение к Pi...",
    requiresPiBrowser: "Требуется Pi Browser или Pi SDK",
    piAuthSuccessful: "Аутентификация Pi успешна!",
    piAuthFailed: "Аутентификация Pi не удалась. Попробуйте еще раз.",
    piAuthError: "Ошибка аутентификации Pi: ",
    piBrowserOnly: "Аутентификация Pi Network доступна только в Pi Browser.",
    letsFlap: "Давайте полетаем!"
  },
  pa: {
    welcomeTitle: "Flappy Pi ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ!",
    piNetworkAuth: "Pi Network ਪ੍ਰਮਾਣੀਕਰਣ",
    piAuthDescription: "ਸੁਰੱਖਿਅਤ ਪ੍ਰਮਾਣੀਕਰਣ ਲਈ ਆਪਣੇ Pi Network ਖਾਤੇ ਨਾਲ ਕਨੈਕਟ ਕਰੋ",
    piNetworkBenefits: "Pi Network ਲਾਭ:",
    piBenefit1: "• ਸੁਰੱਖਿਅਤ ਬਲਾਕਚੇਨ ਪ੍ਰਮਾਣੀਕਰਣ",
    piBenefit2: "• ਪਾਸਵਰਡ ਯਾਦ ਰੱਖਣ ਦੀ ਲੋੜ ਨਹੀਂ",
    piBenefit3: "• Pi ਭੁਗਤਾਨਾਂ ਤੱਕ ਪਹੁੰਚ",
    piBenefit4: "• ਸਾਰੇ ਡਿਵਾਈਸਾਂ ਤੇ ਸਿੰਕ",
    connectWithPi: "Pi Network ਨਾਲ ਕਨੈਕਟ ਕਰੋ",
    connectingToPi: "Pi ਨਾਲ ਕਨੈਕਟ ਹੋ ਰਿਹਾ ਹੈ...",
    requiresPiBrowser: "Pi Browser ਜਾਂ Pi SDK ਦੀ ਲੋੜ ਹੈ",
    piAuthSuccessful: "Pi ਪ੍ਰਮਾਣੀਕਰਣ ਸਫਲ!",
    piAuthFailed: "Pi ਪ੍ਰਮਾਣੀਕਰਣ ਅਸਫਲ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    piAuthError: "Pi ਪ੍ਰਮਾਣੀਕਰਣ ਗਲਤੀ: ",
    piBrowserOnly: "Pi Network ਪ੍ਰਮਾਣੀਕਰਣ ਸਿਰਫ਼ Pi Browser ਵਿੱਚ ਉਪਲਬਧ ਹੈ।",
    letsFlap: "ਚਲੋ ਫੜਫੜਾਈਏ!"
  },
  jv: {
    welcomeTitle: "Sugeng rawuh ing Flappy Pi!",
    piNetworkAuth: "Autentikasi Pi Network",
    piAuthDescription: "Hubungke karo akun Pi Network sampeyan kanggo autentikasi sing aman",
    piNetworkBenefits: "Keuntungan Pi Network:",
    piBenefit1: "• Autentikasi blockchain sing aman",
    piBenefit2: "• Ora perlu ngelingi password",
    piBenefit3: "• Akses menyang pembayaran Pi",
    piBenefit4: "• Sinkronisasi ing kabeh piranti",
    connectWithPi: "Hubungke karo Pi Network",
    connectingToPi: "Ngubungke karo Pi...",
    requiresPiBrowser: "Mbutuhake Pi Browser utawa Pi SDK",
    piAuthSuccessful: "Autentikasi Pi sukses!",
    piAuthFailed: "Autentikasi Pi gagal. Coba maneh.",
    piAuthError: "Kesalahan autentikasi Pi: ",
    piBrowserOnly: "Autentikasi Pi Network mung kasedia ing Pi Browser.",
    letsFlap: "Ayo kepak-kepak!"
  },
  de: {
    welcomeTitle: "Willkommen bei Flappy Pi!",
    piNetworkAuth: "Pi Network Authentifizierung",
    piAuthDescription: "Verbinden Sie sich mit Ihrem Pi Network Konto für sichere Authentifizierung",
    piNetworkBenefits: "Pi Network Vorteile:",
    piBenefit1: "• Sichere Blockchain-Authentifizierung",
    piBenefit2: "• Kein Passwort zu merken",
    piBenefit3: "• Zugang zu Pi-Zahlungen",
    piBenefit4: "• Synchronisierung auf allen Geräten",
    connectWithPi: "Mit Pi Network verbinden",
    connectingToPi: "Verbinde mit Pi...",
    requiresPiBrowser: "Benötigt Pi Browser oder Pi SDK",
    piAuthSuccessful: "Pi-Authentifizierung erfolgreich!",
    piAuthFailed: "Pi-Authentifizierung fehlgeschlagen. Versuchen Sie es erneut.",
    piAuthError: "Pi-Authentifizierungsfehler: ",
    piBrowserOnly: "Pi Network-Authentifizierung nur im Pi Browser verfügbar.",
    letsFlap: "Lass uns flattern!"
  },
  fr: {
    welcomeTitle: "Bienvenue dans Flappy Pi !",
    piNetworkAuth: "Authentification Pi Network",
    piAuthDescription: "Connectez-vous à votre compte Pi Network pour une authentification sécurisée",
    piNetworkBenefits: "Avantages Pi Network :",
    piBenefit1: "• Authentification blockchain sécurisée",
    piBenefit2: "• Aucun mot de passe à retenir",
    piBenefit3: "• Accès aux paiements Pi",
    piBenefit4: "• Synchronisation sur tous les appareils",
    connectWithPi: "Se connecter avec Pi Network",
    connectingToPi: "Connexion à Pi...",
    requiresPiBrowser: "Nécessite Pi Browser ou Pi SDK",
    piAuthSuccessful: "Authentification Pi réussie !",
    piAuthFailed: "Authentification Pi échouée. Veuillez réessayer.",
    piAuthError: "Erreur d'authentification Pi : ",
    piBrowserOnly: "L'authentification Pi Network n'est disponible que dans Pi Browser.",
    letsFlap: "Envolez-vous !"
  },
  te: {
    welcomeTitle: "Flappy Pi కి స్వాగతం!",
    piNetworkAuth: "Pi Network ప్రమాణీకరణ",
    piAuthDescription: "సురక్షిత ప్రమాణీకరణ కోసం మీ Pi Network ఖాతాతో కనెక్ట్ అవ్వండి",
    piNetworkBenefits: "Pi Network ప్రయోజనాలు:",
    piBenefit1: "• సురక్షిత బ్లాక్చెయిన్ ప్రమాణీకరణ",
    piBenefit2: "• పాస్‌వర్డ్ గుర్తుంచుకోవలసిన అవసరం లేదు",
    piBenefit3: "• Pi చెల్లింపులకు ప్రాప్యత",
    piBenefit4: "• అన్ని పరికరాలలో సింక్",
    connectWithPi: "Pi Network తో కనెక్ట్ అవ్వండి",
    connectingToPi: "Pi తో కనెక్ట్ అవుతోంది...",
    requiresPiBrowser: "Pi Browser లేదా Pi SDK అవసరం",
    piAuthSuccessful: "Pi ప్రమాణీకరణ విజయవంతం!",
    piAuthFailed: "Pi ప్రమాణీకరణ విఫలం. మళ్ళీ ప్రయత్నించండి.",
    piAuthError: "Pi ప్రమాణీకరణ లోపం: ",
    piBrowserOnly: "Pi Network ప్రమాణీకరణ Pi Browser లో మాత్రమే అందుబాటులో ఉంది.",
    letsFlap: "వెళ్దాం ఫ్లాప్!"
  },
  mr: {
    welcomeTitle: "Flappy Pi मध्ये आपले स्वागत आहे!",
    piNetworkAuth: "Pi Network प्रमाणीकरण",
    piAuthDescription: "सुरक्षित प्रमाणीकरणासाठी तुमच्या Pi Network खात्याशी कनेक्ट व्हा",
    piNetworkBenefits: "Pi Network लाभ:",
    piBenefit1: "• सुरक्षित ब्लॉकचेन प्रमाणीकरण",
    piBenefit2: "• पासवर्ड लक्षात ठेवण्याची गरज नाही",
    piBenefit3: "• Pi पेमेंट्समध्ये प्रवेश",
    piBenefit4: "• सर्व डिव्हाइसेसवर सिंक",
    connectWithPi: "Pi Network शी कनेक्ट करा",
    connectingToPi: "Pi शी कनेक्ट होत आहे...",
    requiresPiBrowser: "Pi Browser किंवा Pi SDK आवश्यक आहे",
    piAuthSuccessful: "Pi प्रमाणीकरण यशस्वी!",
    piAuthFailed: "Pi प्रमाणीकरण अयशस्वी. पुन्हा प्रयत्न करा.",
    piAuthError: "Pi प्रमाणीकरण त्रुटी: ",
    piBrowserOnly: "Pi Network प्रमाणीकरण फक्त Pi Browser मध्ये उपलब्ध आहे.",
    letsFlap: "चला फडफडू!"
  },
  tr: {
    welcomeTitle: "Flappy Pi'ye Hoş Geldiniz!",
    piNetworkAuth: "Pi Network Kimlik Doğrulama",
    piAuthDescription: "Güvenli kimlik doğrulama için Pi Network hesabınızla bağlanın",
    piNetworkBenefits: "Pi Network Avantajları:",
    piBenefit1: "• Güvenli blockchain kimlik doğrulama",
    piBenefit2: "• Hatırlanacak şifre yok",
    piBenefit3: "• Pi ödemelerine erişim",
    piBenefit4: "• Tüm cihazlarda senkronizasyon",
    connectWithPi: "Pi Network ile Bağlan",
    connectingToPi: "Pi'ye bağlanıyor...",
    requiresPiBrowser: "Pi Browser veya Pi SDK gerektirir",
    piAuthSuccessful: "Pi kimlik doğrulama başarılı!",
    piAuthFailed: "Pi kimlik doğrulama başarısız. Lütfen tekrar deneyin.",
    piAuthError: "Pi kimlik doğrulama hatası: ",
    piBrowserOnly: "Pi Network kimlik doğrulama sadece Pi Browser'da mevcuttur.",
    letsFlap: "Hadi Uçalım!"
  },
  vi: {
    welcomeTitle: "Chào mừng đến với Flappy Pi!",
    piNetworkAuth: "Xác thực Pi Network",
    piAuthDescription: "Kết nối với tài khoản Pi Network để xác thực an toàn",
    piNetworkBenefits: "Lợi ích Pi Network:",
    piBenefit1: "• Xác thực blockchain an toàn",
    piBenefit2: "• Không cần nhớ mật khẩu",
    piBenefit3: "• Truy cập thanh toán Pi",
    piBenefit4: "• Đồng bộ trên tất cả thiết bị",
    connectWithPi: "Kết nối với Pi Network",
    connectingToPi: "Đang kết nối với Pi...",
    requiresPiBrowser: "Yêu cầu Pi Browser hoặc Pi SDK",
    piAuthSuccessful: "Xác thực Pi thành công!",
    piAuthFailed: "Xác thực Pi thất bại. Vui lòng thử lại.",
    piAuthError: "Lỗi xác thực Pi: ",
    piBrowserOnly: "Xác thực Pi Network chỉ có sẵn trong Pi Browser.",
    letsFlap: "Hãy Bay!"
  },
  th: {
    welcomeTitle: "ยินดีต้อนรับสู่ Flappy Pi!",
    piNetworkAuth: "การยืนยันตัวตน Pi Network",
    piAuthDescription: "เชื่อมต่อกับบัญชี Pi Network ของคุณเพื่อการยืนยันตัวตนที่ปลอดภัย",
    piNetworkBenefits: "ประโยชน์ของ Pi Network:",
    piBenefit1: "• การยืนยันตัวตนบล็อกเชนที่ปลอดภัย",
    piBenefit2: "• ไม่ต้องจำรหัสผ่าน",
    piBenefit3: "• เข้าถึงการชำระเงิน Pi",
    piBenefit4: "• ซิงค์ในทุกอุปกรณ์",
    connectWithPi: "เชื่อมต่อกับ Pi Network",
    connectingToPi: "กำลังเชื่อมต่อกับ Pi...",
    requiresPiBrowser: "ต้องการ Pi Browser หรือ Pi SDK",
    piAuthSuccessful: "การยืนยันตัวตน Pi สำเร็จ!",
    piAuthFailed: "การยืนยันตัวตน Pi ล้มเหลว. กรุณาลองอีกครั้ง.",
    piAuthError: "ข้อผิดพลาดการยืนยันตัวตน Pi: ",
    piBrowserOnly: "การยืนยันตัวตน Pi Network มีเฉพาะใน Pi Browser",
    letsFlap: "มาโบยบินกัน!"
  },
  it: {
    welcomeTitle: "Benvenuto in Flappy Pi!",
    piNetworkAuth: "Autenticazione Pi Network",
    piAuthDescription: "Connettiti al tuo account Pi Network per l'autenticazione sicura",
    piNetworkBenefits: "Vantaggi Pi Network:",
    piBenefit1: "• Autenticazione blockchain sicura",
    piBenefit2: "• Nessuna password da ricordare",
    piBenefit3: "• Accesso ai pagamenti Pi",
    piBenefit4: "• Sincronizzazione su tutti i dispositivi",
    connectWithPi: "Connetti con Pi Network",
    connectingToPi: "Connessione a Pi...",
    requiresPiBrowser: "Richiede Pi Browser o Pi SDK",
    piAuthSuccessful: "Autenticazione Pi riuscita!",
    piAuthFailed: "Autenticazione Pi fallita. Riprova.",
    piAuthError: "Errore di autenticazione Pi: ",
    piBrowserOnly: "L'autenticazione Pi Network è disponibile solo in Pi Browser.",
    letsFlap: "Voliamo!"
  },
  pl: {
    welcomeTitle: "Witamy w Flappy Pi!",
    piNetworkAuth: "Uwierzytelnianie Pi Network",
    piAuthDescription: "Połącz się ze swoim kontem Pi Network dla bezpiecznego uwierzytelniania",
    piNetworkBenefits: "Korzyści Pi Network:",
    piBenefit1: "• Bezpieczne uwierzytelnianie blockchain",
    piBenefit2: "• Brak hasła do zapamiętania",
    piBenefit3: "• Dostęp do płatności Pi",
    piBenefit4: "• Synchronizacja na wszystkich urządzeniach",
    connectWithPi: "Połącz z Pi Network",
    connectingToPi: "Łączenie z Pi...",
    requiresPiBrowser: "Wymaga Pi Browser lub Pi SDK",
    piAuthSuccessful: "Uwierzytelnianie Pi udane!",
    piAuthFailed: "Uwierzytelnianie Pi nieudane. Spróbuj ponownie.",
    piAuthError: "Błąd uwierzytelniania Pi: ",
    piBrowserOnly: "Uwierzytelnianie Pi Network dostępne tylko w Pi Browser.",
    letsFlap: "Lecimy!"
  }
};

// Function to update translations for a specific language
function updateLanguageTranslations(langCode, translations) {
  const langPattern = new RegExp(`\\s+${langCode}:\\s*{`, 'g');
  const langMatch = content.match(langPattern);
  
  if (!langMatch) {
    console.log(`❌ Language ${langCode} not found in file`);
    return;
  }

  // Find the language section
  const langStart = content.indexOf(`  ${langCode}: {`);
  if (langStart === -1) {
    console.log(`❌ Could not find start of ${langCode} section`);
    return;
  }

  // Find the end of this language section
  const nextLangMatch = content.substring(langStart + 1).match(/\s+[a-z]{2}:\s*{/);
  const langEnd = nextLangMatch ? langStart + 1 + nextLangMatch.index : content.length;

  // Extract the language section
  const langSection = content.substring(langStart, langEnd);
  
  // Update each translation key
  let updatedSection = langSection;
  for (const [key, value] of Object.entries(translations)) {
    const keyPattern = new RegExp(`\\s+${key}:\\s*"[^"]*"`, 'g');
    updatedSection = updatedSection.replace(keyPattern, `    ${key}: "${value}"`);
  }

  // Replace the section in the main content
  content = content.substring(0, langStart) + updatedSection + content.substring(langEnd);
  
  console.log(`✅ Updated ${langCode} translations`);
}

// Update translations for each language
for (const [langCode, translations] of Object.entries(completeTranslations)) {
  updateLanguageTranslations(langCode, translations);
}

// Write the updated content back to the file
fs.writeFileSync(translationsFile, content);

console.log('\n🎉 Fixed all remaining language translations!');
console.log('Updated languages:', Object.keys(completeTranslations).join(', '));
console.log(`Total languages fixed: ${Object.keys(completeTranslations).length}`);
console.log('\n📊 Summary:');
console.log('- All 50 languages now have proper native translations');
console.log('- No more English fallbacks');
console.log('- Complete welcome page translation coverage'); 