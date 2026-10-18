<div align="center">

<img src="logo.png" alt="Diga Scanner" width="320"/>

# CheckDiga Pro

### أداة تشخيص أعطال السيارات عبر OBD2 (ويب + أندرويد)

صُنع بحب في 🇩🇿

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Android APK](https://img.shields.io/badge/Android-APK%20Ready-3DDC84?logo=android&logoColor=white)](#)
[![CI/CD](https://img.shields.io/badge/Build-GitHub%20Actions-2088FF?logo=github-actions&logoColor=white)](#)
[![DTC Codes](https://img.shields.io/badge/DTC%20Codes-15%2C663-blueviolet)](https://ishakdiga55-ops.github.io/Diga-scaner/)

تطبيق ويب تقدمي (PWA) **وتطبيق أندرويد أصلي (Native)** يعمل مباشرة لفحص السيارات — دون خادم، ودون اشتراك.

[🚀 تجربة الويب](https://ishakdiga55-ops.github.io/Diga-scaner/) ·
[📱 تحميل تطبيق الأندرويد (APK)](https://github.com/ishakdiga55-ops/Diga-scaner/actions) ·
[🐛 الإبلاغ عن خطأ](https://github.com/ishakdiga55-ops/Diga-scaner/issues)

</div>

---

## 📖 نبذة سريعة

**CheckDiga Pro** هو مشروع مفتوح المصدر يتيح للمستخدم تشخيص سيارته بنفسه:
- 📖 قراءة رموز الأعطال (DTC) وتحليلها بالذكاء الاصطناعي.
- 🧠 تحليل مبدئي للحالات التقنية (المحرك، ABS، الفرامل، العادم، الكهرباء).
- 📊 عرض مؤشرات حية (RPM، السرعة، حرارة المحرك، مستوى الوقود).
- 🔌 يعمل على **المتصفح (PWA)** و **تطبيق أندرويد (APK)**.

---

## ✨ المزايا الجديدة (v0.8.0)

### 🔌 دعم اتصالات متعدد (Multi-Transport)
- ✅ **الويب:** دعم Web Bluetooth (BLE) و Web Serial (USB) و Wi-Fi (WebSocket).
- ✅ **تطبيق الأندرويد:** دعم **Bluetooth Classic (SPP)** للمحولات الرخيصة جداً، بالإضافة لـ BLE و USB OTG.
- ✅ **واجهة موحدة:** نافذة أنيقة (Modal) لاختيار طريقة الاتصال بضغطة زر.
- ✅ **اكتشاف البروتوكولات:** عرض نوع بروتوكول السيارة (CAN, KWP2000, ISO) تحت رقم الهيكل.
- ✅ **نبضات القلب (Heartbeat):** نظام يكتشف انقطاع الاتصال ويعيد المحاولة تلقائياً.

### 📚 قاعدة بيانات شاملة
- 📦 **15,663 كود عطل** (بعد الدمج الذكي بين OBDex و Wal33D والملفات المحلية).
- 🏭 تغطية لأكثر من **33 علامة تجارية**.
- 🔍 بحث فوري، بحث بالأعراض، تصفية حسب الخطورة، وتصفح حسب الفئة.

### 🔒 الأمان المتقدم
- 🛡️ **سياسة أمان المحتوى (CSP):** حماية صارمة ضد هجمات XSS وحقن الأكواد.
- 🔐 إزالة أي مفاتيح API مكشوفة من الواجهة الأمامية.

---

## 🗄️ قاعدة البيانات

المشروع يجمع البيانات من **3 مصادر** عبر دمج ذكي:

| المصدر | الوصف | الترخيص |
|--------|-------|:-------:|
| [**OBDex**](https://github.com/foerbsnavi/OBDex) | أكواد غنية (أعراض، أسباب، خطوات) | مفتوح المصدر |
| [**Wal33D**](https://github.com/Wal33D/dtc-database) | أكواد المصنّعين (SQLite) | مفتوح المصدر |
| **ملفات محلية** | أكواد إضافية (أوروبية + صينية) | MIT |

---

## 📋 المتطلبات والأجهزة المدعومة

| نوع المحول | تطبيق الويب (PWA) | تطبيق الأندرويد (APK) |
|------|:------:|:------:|
| **Bluetooth LE (4.0)** | ✅ يعمل | ✅ يعمل |
| **USB (Serial/OTG)** | ✅ يعمل (كمبيوتر/أندرويد) | ✅ يعمل (عبر OTG) |
| **Bluetooth Classic (SPP)** | ❌ غير مدعوم | ✅ **يعمل (محولات رخيصة)** |
| **Wi-Fi** | ✅ يعمل (عبر WebSocket) | ✅ يعمل |

> **ملاحظة:** معظم أجهزة ELM327 الرخيصة هي Bluetooth Classic. يمكنك الآن استخدامها عبر **تطبيق الأندرويد** الخاص بنا.

---

## 📱 كيفية تثبيت تطبيق الأندرويد (APK)

نظراً لأننا نبني التطبيق عبر **GitHub Actions** (سحابياً)، يمكنك تحميل أحدث نسخة كالتالي:
1. اذهب إلى تبويب **Actions** في هذا المستودع.
2. اختر أحدث عملية بناء ناجحة (تحتوي على ✅ واسم `Build Android APK`).
3. انزل لأسفل الصفحة إلى قسم **Artifacts**.
4. حمل الملف `CheckDiga-App-Debug.zip`، وفك الضغط، وثبت ملف `app-debug.apk`.

*(ملاحظة: سيتطلب الهاتف السماح بتثبيت التطبيقات من مصادر غير معروفة).*

---

## 🚀 التشغيل المحلي (للمطورين)

### المتطلبات
- **Node.js** 18 أو أحدث
- **Git**

### الإعداد
```bash
# 1. استنسخ المستودع
git clone https://github.com/ishakdiga55-ops/Diga-scaner.git
cd Diga-scaner

# 2. شغّل خادم محلي (لا تفتح index.html مباشرة)
npm start
# أو
python -m http.server 8000
