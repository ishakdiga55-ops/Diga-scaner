export const translations = {
  ar: {
    title: "CheckDiga Pro — فحص السيارات",
    heroTitle: "افحص سيارتك من هاتفك",
    heroDesc: "قاعدة بيانات ضخمة + بحث فوري + تحليل ذكي",
    connectBtn: "الاتصال بالجهاز",
    disconnectBtn: "قطع الاتصال",
    clearBtn: "مسح الأعطال",
    tabFaults: "الأعطال",
    tabSearch: "بحث",
    tabFavorites: "المفضلة",
    tabLive: "حية",
    tabReadiness: "الجاهزية",
    tabBattery: "البطارية",
    tabHistory: "السجل",
    tabStats: "إحصائيات",
    scanEngine: "فحص المحرك",
    scanAll: "فحص الكل",
    scanABS: "فحص ABS / Airbag / BCM",
    prePurchase: "فحص ما قبل الشراء (تقرير PDF)",
    modalTitle: "اختر طريقة الاتصال",
    modalDesc: "حدد نوع الجهاز المتصل بسيارتك",
    optBLE: "Bluetooth LE",
    optUSB: "USB Serial",
    optWifi: "Wi-Fi (WebSocket)",
    optDemo: "الوضع التجريبي",
    optDemoDesc: "تجربة الموقع بدون جهاز",
    odometer: "عداد المسافة (Odometer)",
    vin: "رقم الهيكل",
    vehData: "بيانات السيارة"
  },
  fr: {
    title: "CheckDiga Pro — Diagnostic Auto",
    heroTitle: "Diagnostiquez votre voiture depuis votre téléphone",
    heroDesc: "Base de données massive + recherche instantanée + analyse intelligente",
    connectBtn: "Connecter l'appareil",
    disconnectBtn: "Déconnecter",
    clearBtn: "Effacer les codes",
    tabFaults: "Pannes",
    tabSearch: "Recherche",
    tabFavorites: "Favoris",
    tabLive: "En direct",
    tabReadiness: "Prêt",
    tabBattery: "Batterie",
    tabHistory: "Historique",
    tabStats: "Statistiques",
    scanEngine: "Scan Moteur",
    scanAll: "Scan Complet",
    scanABS: "Scan ABS / Airbag / BCM",
    prePurchase: "Inspection avant achat",
    modalTitle: "Choisir le mode de connexion",
    modalDesc: "Sélectionnez le type d'appareil connecté à votre voiture",
    optBLE: "Bluetooth LE",
    optUSB: "USB Serial",
    optWifi: "Wi-Fi (WebSocket)",
    optDemo: "Mode Démo",
    optDemoDesc: "Tester sans appareil",
    odometer: "Compteur kilométrique",
    vin: "Numéro de châssis",
    vehData: "Données du véhicule"
  }
};

export function applyLanguage(lang) {
  const isAr = lang === 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  
  const dict = translations[lang];
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
        el.placeholder = dict[key];
      } else {
        const icon = el.querySelector('i');
        if (icon) {
          el.innerHTML = icon.outerHTML + ' ' + dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    }
  });

  // تحديث النصوص في بطاقة الـ Hero
  const vinLabel = document.querySelector('[data-i18n="vehData"]');
  if (vinLabel) {
      const icon = vinLabel.querySelector('i');
      if(icon) vinLabel.innerHTML = icon.outerHTML + ' ' + dict.vehData;
      else vinLabel.textContent = dict.vehData;
  }
  
  localStorage.setItem('checkdiga_lang', lang);
  
  // تغيير نص زر اللغة
  const langBtn = document.getElementById('langBtn');
  if (langBtn) {
      langBtn.textContent = isAr ? 'FR' : 'AR';
  }
}

export function initLang() {
  const savedLang = localStorage.getItem('checkdiga_lang') || 'ar';
  applyLanguage(savedLang);
  
  const langBtn = document.getElementById('langBtn');
  if (langBtn) {
    langBtn.onclick = () => {
      const current = localStorage.getItem('checkdiga_lang') || 'ar';
      const next = current === 'ar' ? 'fr' : 'ar';
      applyLanguage(next);
    };
  }
}
