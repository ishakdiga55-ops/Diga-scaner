# Changelog

جميع التغييرات المهمة في هذا المشروع موثّقة في هذا الملف.

الصيغة مبنية على [Keep a Changelog](https://keepachangelog.com/ar/1.1.0/)،
والمشروع يتبع [Semantic Versioning](https://semver.org/lang/ar/).

---

## [Unreleased]

### في التخطيط
- ترجمة إنجليزية كاملة
- دعم ELM327 Wi-Fi
- تغليف بـ Capacitor (iOS/Android)
- دعم Freeze Frame (Mode 02)
- قراءة VIN (Mode 09)
- اختبارات شاملة (Unit + E2E)

---

## [0.4.0] — 2026-10-12

### ✨ أُضيف
- لوجو احترافي للمشروع (`logo.png` بخلفية شفافة)
- Favicon في المتصفح
- `sw.js` — Service Worker كامل لـ PWA offline
- `LICENSE` — رخصة MIT
- `PRIVACY.md` — سياسة خصوصية عربية
- `README.md` — توثيق شامل مع اللوجو والشارات
- `CHANGELOG.md` — هذا الملف
- 3 استراتيجيات تخزين مؤقت في Service Worker:
  - Cache First للـ CDN
  - Stale While Revalidate للبيانات
  - Network First للـ app shell

### 🔄 تغيّر
- **إعادة هيكلة كاملة للمشروع:**
  - فصل CSS إلى `css/main.css` + `css/themes/light.css`
  - استخراج JavaScript إلى `js/app.js` (1660 سطر)
  - تنظيف `index.html` من 1886 إلى 232 سطر
- README محدّث بالكامل مع:
  - FAQ (10 أسئلة)
  - Troubleshooting (جدول شامل)
  - Roadmap
  - Contributing guidelines
  - Credits
  - Disclaimer

### 🗑️ حُذف
- `index.html` القديم (1886 سطر مع CSS/JS داخلي)
- `logo.JPG` القديم (بخلفية مشطوفة)
- `<style>` الداخلي
- `<script>` الداخلي

### 🐛 أُصلح
- PWA لم يكن يعمل (sw.js مفقود)
- الشفافية في اللوجو (تحويل JPG إلى PNG)

### 🔒 أمان
- إضافة سياسة خصوصية واضحة
- إضافة إخلاء مسؤولية
- توثيق عدم إرسال أي بيانات

---

## [0.3.0] — قبل 2026-10-12

### ✨ أُضيف
- قاعدة بيانات 15,590 كود عطل
- بحث ذكي مع 3 مصادر (OBDex + Wal33D + محلي)
- تحليل مبدئي للأعطال (RULES engine)
- مؤشر صحة السيارة
- اختبار البطارية والدينامو (3 مراحل)
- فحص جاهزية الانبعاثات (Readiness)
- تصدير PDF + مشاركة واتساب
- سجل آخر 20 فحص
- المفضلة
- وضع ليلي/نهاري
- تنبيهات تلقائية للقراءات الحية

### 🔄 تغيّر
- تحسين واجهة المستخدم
- إضافة تصفية حسب الخطورة
- تحسين عرض الأكواد

---

## [0.2.0] — نسخة أولى معروفة

### ✨ أُضيف
- دعم Web Bluetooth (ELM327 BLE 4.0)
- دعم Web Serial (USB)
- قراءة الأعطال (Mode 03, 07, 0A)
- مسح الأعطال (Mode 04)
- المؤشرات الحية (RPM, Speed, Temp, Fuel)
- وضع تجريبي للاختبار

---

## [0.1.0] — الإصدار الأول

### ✨ أُضيف
- الفكرة الأساسية
- هيكل مبدئي للتطبيق
- قاعدة بيانات أساسية (48 كود مدمج)

---

## روابط

- [المستودع](https://github.com/ishakdiga55-ops/Diga-scaner)
- [تجربة مباشرة](https://ishakdiga55-ops.github.io/Diga-scaner/)
- [الإبلاغ عن خطأ](https://github.com/ishakdiga55-ops/Diga-scaner/issues)
- [طلب ميزة](https://github.com/ishakdiga55-ops/Diga-scaner/issues/new/choose)

---

## أنواع التغييرات

- `✨ أُضيف` — ميزات جديدة
- `🔄 تغيّر` — تعديلات على الموجود
- `🗑️ حُذف` — إزالة ميزات
- `🐛 أُصلح` — إصلاح أخطاء
- `🔒 أمان` — تحسينات أمنية
- `⚠️ تحذير` — تنبيهات مهمة

---

**صُنع بحب في الجزائر 🇩🇿**