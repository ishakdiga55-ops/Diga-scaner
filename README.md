<div align="center">

<img src="icon.svg" alt="CheckDiga" width="120"/>

# CheckDiga Pro
### صُنع بحب في 🇩🇿

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Web Bluetooth](https://img.shields.io/badge/Web%20Bluetooth-Supported-0082FC?logo=bluetooth)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
[![DTC Codes](https://img.shields.io/badge/DTC%20Codes-12%2C458-blueviolet)]()
[![Made in Algeria](https://img.shields.io/badge/Made%20in-Algeria%20%F0%9F%87%A9%F0%9F%87%BF-green)]()

تطبيق ويب تقدمي (PWA) لتشخيص أعطال السيارات عبر OBD2.

يعمل مباشرة من المتصفح دون تثبيت، دون خادم، ودون اشتراك.

[🚀 تجربة مباشرة](https://ishakdiga55-ops.github.io/Diga-scaner/) ·
[🐛 الإبلاغ عن خطأ](https://github.com/ishakdiga55-ops/Diga-scaner/issues) ·
[💡 طلب ميزة](https://github.com/ishakdiga55-ops/Diga-scaner/issues/new/choose)

</div>

---

## نبذة سريعة

CheckDiga Pro هو تطبيق فحص سيارات يعمل عبر OBD2 ويتيح للمستخدم:

- 📖 قراءة رموز الأعطال (DTC) وتحليلها
- 🧠 تحليل مبدئي للحالات التقنية (المحرك، ABS، الفرامل، العادم، الكهرباء)
- 📊 عرض مؤشرات حية (RPM، السرعة، حرارة المحرك، مستوى الوقود)
- 🌿 فحص جاهزية الانبعاثات
- 🔋 اختبار البطارية والدينامو
- 📋 استعراض تفاصيل دقيقة لكل كود عطل
- 🌐 عمل التطبيق مباشرة داخل المتصفح عبر Web Bluetooth و Web Serial

---

## المزايا

### الاتصال والتشخيص
- ✅ دعم Web Bluetooth عبر ELM327 BLE 4.0
- ✅ دعم Web Serial عبر USB
- ✅ وضع تجريبي لاختبار التطبيق بدون جهاز
- ✅ إعادة الاتصال التلقائية عند الانقطاع
- ✅ كشف تلقائي لـ 10 بروتوكولات OBD2

### قاعدة بيانات شاملة
- 📦 **12,458 كود عطل** (بعد الدمج الذكي)
- 🏭 تغطية لأكثر من **33 علامة تجارية**
- 🔍 بحث فوري حسب الكود أو الوصف
- 🩺 بحث بالأعراض (اهتزاز المحرك، دخان أسود، ضعف التسارع...)
- 🎯 تصفية حسب مستوى الخطورة
- 🌳 تصفح حسب الفئة (P0xxx، P2xxx، B0xxx، C0xxx، U0xxx)

### تحليل ذكي
- 🎯 تحليل مبدئي يربط الأكواد بأسبابها
- 💯 مؤشر صحة السيارة (من 0 إلى 100)
- 📋 تفاصيل غنية: أعراض، أسباب، خطوات فحص، صعوبة الإصلاح، الزمن المقدر
- 🔗 ربط تلقائي بين الأكواد ذات العلاقة

### قياسات حية
- 📈 4 قراءات مباشرة: RPM، السرعة، حرارة المحرك، الوقود
- 📉 رسومات بيانية مباشرة (Chart.js)
- 🔥 تنبيهات تلقائية (حرارة مرتفعة، RPM شاذ، خمول غير مستقر)

### اختبارات إضافية
- 🔋 اختبار البطارية والدينامو (3 مراحل)
- 🌿 فحص جاهزية الانبعاثات (Mode 01 PID 01)
- 🗑️ مسح الأعطال (Mode 04)

### التصدير والمشاركة
- 📄 تصدير التقارير بصيغة PDF
- 💬 مشاركة النتائج عبر واتساب
- ⭐ حفظ الأكواد المفضلة
- 🕒 سجل آخر 20 فحص

### تجربة المستخدم
- 🌙 وضع ليلي ونهاري
- 🇩🇿 واجهة عربية RTL بخط Cairo
- 📱 تصميم Mobile-First
- ⚡ دعم PWA (ثبّت على الشاشة الرئيسية)
- 💾 إمكانية التشغيل بدون اتصال إنترنت
- 🗜️ تخزين مؤقت مضغوط (ضغط 90%)
- 🎯 تمييز مصدر البيانات (حقيقي / تجريبي)

---

## قاعدة البيانات

المشروع يجمع البيانات من **3 مصادر** عبر دمج ذكي:

| المصدر | الوصف | الترخيص |
|--------|-------|:-------:|
| [**OBDex**](https://github.com/foerbsnavi/OBDex) | أكواد غنية (أعراض، أسباب، خطوات) | مفتوح المصدر |
| [**Wal33D**](https://github.com/Wal33D/dtc-database) | أكواد المصنّعين | مفتوح المصدر |
| **ملفات محلية** | أكواد إضافية (Diga Scaner) | MIT |

### إحصائيات سريعة
- **إجمالي الأكواد:** 12,458
- **مصادر البيانات:** 3
- **عدد المصنّعين:** 33+
- **التغطية:** سيارات متعددة الموديلات والعلامات

### منطق الدمج

1. **OBDex CDN** → بيانات غنية (يُحتفظ بها عند التكرار)
2. **ملفات محلية** → أكواد إضافية وإثراء
3. **Wal33D SQLite** → أكواد المصنّعين (عبر `sql.js`)
4. **النتيجة:** قاعدة نظيفة بدون تكرار، بأعلى جودة

---

## المتطلبات

للاستخدام الحقيقي تحتاج إلى:

- 🚗 سيارة **1996 أو أحدث** تدعم OBD-II
- 🔌 جهاز **ELM327 Bluetooth LE 4.0** أو **USB**
- 🌐 متصفح يدعم Web Bluetooth / Web Serial
- 💻 Chrome أو Edge أو **Bluefy** (على iPhone)
- 🔒 اتصال **HTTPS** إلزامي

---

## التشغيل السريع

### 🌐 استخدام مباشر

1. افتح الرابط:
   **https://ishakdiga55-ops.github.io/Diga-scaner/**
2. اختر **"تجريبي"** لتجربة التطبيق مباشرة
3. أو وصّل جهاز ELM327 عبر **Bluetooth** أو **USB**
4. ابدأ بقراءة رموز الأعطال

> ⏳ التحميل الأول يستغرق 10-15 ثانية (12,458 كود). بعدها من الكاش → فوري.

### 📱 تثبيت التطبيق (PWA)

| النظام | الطريقة |
|--------|---------|
| **Android Chrome** | ⋮ → "إضافة إلى الشاشة الرئيسية" |
| **iPhone Safari** | مشاركة → "إضافة إلى الشاشة الرئيسية" |
| **Windows / Mac** | أيقونة التثبيت في شريط العنوان |

---

## الأجهزة المدعومة

| النوع | الحالة |
|------|:------:|
| ELM327 Bluetooth LE (4.0) | ✅ يعمل |
| ELM327 USB | ✅ يعمل |
| ELM327 Bluetooth Classic | ❌ غير مدعوم |
| ELM327 Wi-Fi | ❌ غير مدعوم |

> **ملاحظة:** معظم أجهزة ELM327 الرخيصة (~5$) هي Bluetooth Classic — لن تظهر في المتصفح. ابحث عن **"BLE 4.0"** في اسم المنتج.

---

## التقنيات المستخدمة

| الفئة | التقنية |
|-------|---------|
| **الواجهة** | HTML5 + Tailwind CSS 3.4 |
| **المنطق** | Vanilla JavaScript (ES2020+) |
| **الرسوم** | Chart.js 4.4 |
| **SQLite** | sql.js 1.10 |
| **YAML** | js-yaml 4.1 |
| **الأيقونات** | Font Awesome 6.4 |
| **الخط** | Cairo (Google Fonts) |
| **التخزين** | localStorage + gzip |
| **الاتصال** | Web Bluetooth API + Web Serial API |
| **PWA** | Service Worker + Manifest |

---

## هيكل المشروع

```bash
Diga-scaner/
├── index.html                    # التطبيق الكامل (SPA)
├── sw.js                         # Service Worker (offline)
├── manifest.json                 # PWA manifest
├── icon.svg                      # الأيقونة
├── README.md                     # هذا الملف
│
├── dtc_codes_v0.1.0.db          # Wal33D SQLite (3.3 MB)
├── dtc_p.json                    # أكواد Powertrain (P)
├── dtc_b.json                    # أكواد Body (B)
├── dtc_c.json                    # أكواد Chassis (C)
├── dtc_u.json                    # أكواد Network (U)
├── dtc_modern.json               # أكواد حديثة
└── dtc_full.json                 # القاعدة الشاملة