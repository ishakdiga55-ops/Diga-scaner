<div align="center">

<img src="logo.png" alt="Diga Scanner" width="320"/>

# CheckDiga Pro

### أداة تشخيص أعطال السيارات عبر OBD2 (ويب + أندرويد)

صُنع بحب في 🇩🇿

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Android APK](https://img.shields.io/badge/Android-APK%20Ready-3DDC84?logo=android&logoColor=white)](#)
[![French Support](https://img.shields.io/badge/Language-Arabic%20%7C%20French-blue)](#)
[![DTC Codes](https://img.shields.io/badge/DTC%20Codes-15%2C663-blueviolet)](https://ishakdiga55-ops.github.io/Diga-scaner/)

تطبيق ويب تقدمي (PWA) **وتطبيق أندرويد أصلي (Native)** يعمل مباشرة لفحص السيارات — دون خادم، ودون اشتراك.

[🚀 تجربة الويب](https://ishakdiga55-ops.github.io/Diga-scaner/) ·
[📱 تحميل تطبيق الأندرويد (APK)](https://github.com/ishakdiga55-ops/Diga-scaner/actions) ·
[🐛 الإبلاغ عن خطأ](https://github.com/ishakdiga55-ops/Diga-scaner/issues)

</div>

---

## 📖 نبذة سريعة

**CheckDiga Pro** هو مشروع مفتوح المصدر يتيح للمستخدم تشخيص سيارته بنفسه:
- 📖 قراءة رموز الأعطال (DTC) وتحليلها.
- 🕵️‍♂️ **وضع المفتش (Inspector):** فحص شامل للسيارة قبل الشراء وتوليد تقرير PDF احترافي.
- 📊 عرض مؤشرات حية (RPM، السرعة، حرارة المحرك، مستوى الوقود).
- 🚗 **قراءة عداد المسافة الحقيقي (Odometer)** ومعلومات السيارة (VIN).
- 🌍 **دعم اللغتين:** العربية (RTL) والفرنسية (LTR) بضغطة زر.
- 🔌 يعمل على **المتصفح (PWA)** و **تطبيق أندرويد (APK)**.

---

## ✨ المزايا الجديدة (v0.9.0)

### 🕵️‍♂️ وضع المفتش (Inspector Mode)
- فحص حقيقي للأعطال المسجلة في كمبيوتر السيارة (وليس من الذاكرة).
- قراءة عداد المسافة الحقيقي (Odometer).
- توليد تقرير **PDF** احترافي يحتوي على مؤشر صحة السيارة، رقم الهيكل، والأعطال المكتشفة.
- مثالي للمشترين قبل شراء سيارة مستعملة (كشف الغش).

### 🌍 دعم اللغات
- زر تبديل فوري بين **العربية** و **الفرنسية** (FR).
- تحول تلقائي لاتجاه الشاشة (RTL / LTR).
- ترجمة كاملة لعناوين الواجهة والأزرار الرئيسية.

### 🔌 دعم اتصالات متعدد (Multi-Transport)
- ✅ **الويب:** دعم Web Bluetooth (BLE) و Web Serial (USB).
- ✅ **تطبيق الأندرويد:** دعم **Bluetooth Classic (SPP)** للمحولات الرخيصة جداً، بالإضافة لـ USB OTG.
- ✅ **اكتشاف البروتوكولات:** عرض نوع بروتوكول السيارة (CAN, KWP2000, ISO) تحت رقم الهيكل.
- ✅ **نبضات القلب (Heartbeat):** نظام يكتشف انقطاع الاتصال ويعيد المحاولة تلقائياً.

### 📚 قاعدة بيانات شاملة
- 📦 **15,663 كود عطل** (بعد الدمج الذكي بين OBDex و Wal33D والملفات المحلية).
- 🏭 تغطية لأكثر من **33 علامة تجارية**.
- 🔍 بحث فوري، بحث بالأعراض، وتصفح حسب الفئة.

---

## 📋 المتطلبات والأجهزة المدعومة

| نوع المحول | تطبيق الويب (PWA) | تطبيق الأندرويد (APK) |
|------|:------:|:------:|
| **Bluetooth LE (4.0)** | ✅ يعمل | ✅ يعمل |
| **USB (Serial/OTG)** | ✅ يعمل (كمبيوتر) | ✅ يعمل (عبر OTG) |
| **Bluetooth Classic (SPP)** | ❌ غير مدعوم | ✅ **يعمل (محولات رخيصة)** |
| **Wi-Fi** | ❌ غير مدعوم (متصفح) | ✅ يعمل (عبر WebSocket) |

> **ملاحظة:** معظم أجهزة ELM327 الرخيصة (مثل محولات 1900 دج) هي Bluetooth Classic. يمكنك الآن استخدامها عبر **تطبيق الأندرويد** الخاص بنا.

---

## 📱 كيفية تثبيت تطبيق الأندرويد (APK)

نظراً لأننا نبني التطبيق عبر **GitHub Actions** (سحابياً)، يمكنك تحميل أحدث نسخة كالتالي:
1. اذهب إلى تبويب **Actions** في هذا المستودع.
2. اختر أحدث عملية بناء ناجحة (تحتوي على ✅ واسم `Build Android APK`).
3. انزل لأسفل الصفحة إلى قسم **Artifacts**.
4. حمل الملف `CheckDiga-App-Debug.zip`، وفك الضغط، وثبت ملف `app-debug.apk`.

---

## 📂 هيكل المشروع (Modular Architecture)

```text
Diga-scaner/
├── index.html          # نقطة الدخول والواجهة
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
├── capacitor.config.json # إعدادات تطبيق الأندرويد
├── .github/workflows/  # أتمتة بناء الـ APK
│
├── css/                # الأنماط
│
├── js/                 # المنطق (نمطي)
│   ├── main.js         # نقطة الانطلاق
│   ├── state.js        # الحالة العامة
│   ├── obd.js          # الاتصال (ويب)
│   ├── obd-native.js   # الاتصال (تطبيق أندرويد)
│   ├── inspector.js    # وضع المفتش وتقارير PDF
│   ├── i18n.js         # نظام الترجمة (عربي/فرنسي)
│   ├── analysis.js     # التحليل وقواعد البيانات
│   ├── abs-scan.js     # فحص الوحدات
│   ├── vin.js          # قراءة رقم الهيكل
│   └── ui/             # ملفات الواجهة
│
└── dtc_*.json          # قواعد بيانات الأعطال