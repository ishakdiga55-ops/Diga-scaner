<div align="center">

<img src="icon.svg" alt="CheckDiga Logo" width="150" height="150">

# 🔧 CheckDiga

### أداة فحص السيارات المتكاملة

**قراءة أكواد الأعطال • Mode 06 • اختبار البطارية • جاهزية الانبعاثات**

[![Live Demo](https://img.shields.io/badge/Live_Demo-success?style=for-the-badge)](https://ishakdiga55-ops.github.io/Diga-scaner/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blueviolet?style=for-the-badge)](https://ishakdiga55-ops.github.io/Diga-scaner/)
[![GitHub Stars](https://img.shields.io/github/stars/ishakdiga55-ops/Diga-scaner?style=for-the-badge&logo=github&color=yellow)](https://github.com/ishakdiga55-ops/Diga-scaner/stargazers)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)

</div>

---

<div dir="rtl">

## 📖 نظرة عامة

**CheckDiga** أداة تشخيص سيارات احترافية تعمل **مباشرة في المتصفح** — بدون تثبيت، بدون خوادم، بدون اشتراكات.

تستخدم شريحة **ELM327** عبر **USB** أو **Bluetooth** لقراءة بيانات السيارة، وتدعم أكثر من **1696 كود عطل** مع تشخيص ذكي بالعربية والإنجليزية.

> 💡 **لا حاجة لأي برامج على الحاسوب أو الهاتف** — فقط افتح الرابط، وصّل الكابل، وابدأ الفحص!

---

## ✨ الميزات الرئيسية

### 📚 قاعدة بيانات ضخمة

- **1696+ كود عطل** قياسي (P, C, B, U)
- **أكواد الشركات الخاصة** (PSA, VW, BMW, Toyota...)
- **تفاصيل كاملة** لكل كود: الأسباب، الأعراض، خطوات الفحص
- **ترجمة عربية وإنجليزية** لكل كود

### 🔌 اتصالات متعددة

- **USB** عبر Web Serial API
- **Bluetooth BLE** عبر Web Bluetooth API
- **وضع تجريبي** للاختبار بدون سيارة
- **إعادة محاولة تلقائية** عند فشل الأوامر

### 🧠 تشخيص ذكي

- **قواعد تشخيص متقدمة** تربط الأعطال ببعضها
- **مؤشر صحة السيارة** من 0 إلى 100
- **اقتراحات إصلاح** مبنية على الأعراض
- **أولوية الإصلاح** حسب الخطورة

### 🔬 اختبارات متقدمة

- **Mode 06** — اختبارات المراقبة الذاتية
- **جاهزية الانبعاثات** (Readiness Monitors)
- **اختبار البطارية والدينامو** (3 مراحل)
- **Freeze Frame** — لحظة تسجيل العطل

### 📊 واجهة احترافية

- **عدادات تفاعلية** (RPM, Speed, Temp, Fuel)
- **رسوم بيانية حية** (Chart.js)
- **واجهة عربية RTL** كاملة
- **تبديل فوري** بين العربية والإنجليزية
- **تصميم متجاوب** لكل الأجهزة

### 📄 تصدير وتقارير

- **تصدير PDF** احترافي
- **مشاركة WhatsApp** بنقرة واحدة
- **سجل الفحوصات** (IndexedDB)
- **إحصائيات حية** للأعطال الشائعة

### 📱 Progressive Web App

- **تثبيت على الهاتف** كتطبيق أصلي
- **يعمل بدون إنترنت**
- **Service Worker** للعمل offline
- **أيقونة احترافية** على الشاشة الرئيسية

---

## 🌍 الشركات المدعومة

| الشركة | عدد الأكواد | أمثلة |
|--------|-------------|--------|
| Peugeot / Citroën | 250+ | P1100, P1120, P1335 |
| Volkswagen / Audi / Skoda | 200+ | P1136, P1557, P1640 |
| Toyota / Lexus | 50+ | P1349, P1604, P1605 |
| BMW / Mini | 50+ | P1345, P1346, P1686 |
| Ford | 100+ | P1000, P1260, P1299 |
| GM / Chevrolet / Opel | 50+ | P1106, P1111, P1133 |
| Honda / Nissan | 100+ | P1101, P1121, P1320 |
| Hyundai / Kia | 50+ | P1326 (مشكلة مصنعية) |
| Mercedes | 50+ | P1120, P1187, P1350 |
| Renault | 50+ | P1140, P1200, P1300 |
| Diesel (DPF / SCR / AdBlue) | 100+ | P2002, P20E8, P2463 |

---

## 🚀 البدء السريع

### 🌐 الطريقة الأولى: استخدام مباشر

افتح الرابط في متصفح حديث:
