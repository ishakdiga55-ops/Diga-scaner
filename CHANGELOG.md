# 📋 سجل التغييرات — Changelog

جميع التغييرات المهمة في مشروع **CheckDiga Pro** موثقة في هذا الملف.

التنسيق يعتمد على [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)،
والترقيم يتبع [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.5.0] — 2026-10-14

### 🎉 إصدار كبير — إعادة هيكلة شاملة

هذا الإصدار يُعيد تنظيم الكود بالكامل دون تغيير الميزات أو كسر التوافق.

### ✨ أُضيف

#### البنية الجديدة (Modular Architecture)
- **13 ملف JavaScript** منظمين بدل ملف واحد كبير:
  - `js/main.js` — نقطة الدخول
  - `js/state.js` — الحالة العامة
  - `js/obd.js` — Bluetooth + USB + قياسات حية
  - `js/analysis.js` — قواعد التشخيص + مؤشر الصحة
  - `js/obd-commands.js` — قراءة الأعطال + فحص شامل
  - `js/ui-extras.js` — المفضلة + السجل + الإحصاءات
  - `js/extras.js` — Demo + PDF + واتساب + بطارية + جاهزية
  - `js/data/database.js` — قاعدة الأكواد الأساسية
  - `js/data/loader.js` — تحميل OBDex + محلي + Wal33D
  - `js/ui/theme.js` — الوضع الليلي/النهاري
  - `js/ui/tabs.js` — التنقل بين التبويبات
  - `js/ui/search.js` — البحث الذكي
  - `js/ui/events.js` — ربط الأحداث

#### الاحترافية (Professional Standards)
- **`SECURITY.md`** — سياسة الأمان والإبلاغ عن الثغرات
- **`CODE_OF_CONDUCT.md`** — مدونة السلوك للمساهمين
- **`.github/dependabot.yml`** — تحديث تلقائي أسبوعي للحزم
- **`.github/ISSUE_TEMPLATE/bug_report.yml`** — قالب الإبلاغ عن الأخطاء
- **`.github/ISSUE_TEMPLATE/feature_request.yml`** — قالب طلب الميزات
- **`.github/ISSUE_TEMPLATE/config.yml`** — إعدادات Issues
- **`.github/PULL_REQUEST_TEMPLATE.md`** — قالب Pull Requests

#### تحسينات الواجهة (UI Polish)
- **Animations ناعمة** — دخول البطاقات بـ `fadeSlideIn`
- **Hover effects** — الأزرار والبطاقات ترتفع عند اللمس
- **Scrollbar مخصص** — يظهر بشكل أنيق في الوضعين الليلي والنهاري
- **Spinner محسّن** — يظهر بشكل أفضل أثناء التحميل
- **Tab transitions** — انتقال سلس بين التبويبات
- **Input focus effects** — تأثير ظل عند الكتابة في البحث

### 🔄 تغيّر

- **`index.html`** يستخدم الآن `type="module"` مع `js/main.js`
- **`loader.js`** يعيد كتابة كاملة لدعم OBDex CDN + الملفات المحلية + Wal33D
- **`obd-commands.js`** يدعم Demo mode بشكل صحيح بدون تعليق
- تحديث المكتبات:
  - `actions/checkout` من v4 إلى v7
  - `actions/upload-artifact` من v4 إلى v7
  - `actions/setup-node` من v4 إلى v7

### 🐛 إصلاحات

- **Demo mode** — لم يعد يُعلّق الموقع عند "فحص المحرك"
- **`loader.js`** — كان يحمّل 5,000 كود فقط → الآن 15,590
- **تكرار `ui-extras.js`** — تم إصلاح التعريفات المكررة
- **`obd-commands.js`** — أخطاء Syntax في `parseMsgs`
- **`extras.js`** — أُعيد بناؤه بدون تكرار

### 🔒 الأمان

- تفعيل **Dependabot** للتحديثات الأمنية التلقائية
- إضافة سياسة الإبلاغ عن الثغرات
- تحديث الحزم إلى إصدارات أكثر أماناً

### 📦 التبعيات المحدّثة

- `eslint`: `8.57.1` → `10.12.0`
- `vitest`: `1.6.1` → `5.0.3`
- `actions/checkout`: `v4` → `v7`
- `actions/upload-artifact`: `v4` → `v7`
- `actions/setup-node`: `v4` → `v7`

### ⚠️ معروف

- Toast notifications — تم إنشاؤها لكن غير مفعّلة حالياً
- سيتم تفعيلها في إصدار مستقبلي

---

## [0.4.1] — 2026-10-13

### 🐛 إصلاحات حرجة (8 FIX)

- **FIX #1** — تعليم الأنظمة كـ "غير معروف" عند عدم رد السيارة
- **FIX #2** — حماية من العمليات المتزامنة (busy guard)
- **FIX #3** — إعادة استخدام `TextDecoder` (منع memory leak)
- **FIX #4** — التحقق من نطاق الجهد + إعادة محاولة في اختبار البطارية
- **FIX #5** — تحسين معالجة timeout
- **FIX #6** — تهيئة ELM327 أسرع (Auto protocol أولاً)
- **FIX #7** — (داخلي) تحسين `parseMsgs`
- **FIX #8** — كشف تلقائي لحجم UDS DTC

### ✨ أُضيف

- دعم `sql.js` لقراءة قاعدة Wal33D
- كشف تلقائي لـ 10 بروتوكولات OBD2
- تحسين إعادة الاتصال التلقائية

---

## [0.4.0] — 2026-10-12

### ✨ أُضيف

- **قاعدة 15,590 كود** بعد دمج ذكي
- **أكواد أوروبية** (`dtc_european.json`, `dtc_european2.json`)
- **أكواد صينية** (`dtc_chinese.json` → `dtc_chinese4.json`)
- **Wal33D SQLite** — أكواد المصنّعين
- **مؤشر صحة السيارة** (0-100)
- **تحليل مبدئي** ذكي
- **تصدير PDF** ومشاركة واتساب
- **اختبار البطارية والدينامو**
- **فحص جاهزية الانبعاثات**

### 🔄 تغيّر

- تحسين `smartMerge` للدمج الذكي بدون تكرار
- تحسين واجهة المستخدم

---

## [0.3.0] — 2026-10-11

### ✨ أُضيف

- **OBDex CDN** — 9,485 كود غني (أعراض + أسباب + خطوات)
- **PWA كامل** — Service Worker + offline
- **الوضع الليلي/النهاري**
- **سجل الفحوصات** (آخر 20 فحص)

---

## [0.2.0] — 2026-10-10

### ✨ أُضيف

- **بحث بالأعراض** (12 عرض شائع)
- **تصفح حسب الفئة** (P0xxx, P1xxx, ...)
- **فلترة حسب الخطورة**
- **المفضلة** (حفظ أكواد)
- **الرسوم البيانية المباشرة**

---

## [0.1.0] — 2026-10-09

### ✨ الإصدار الأولي

- **الاتصال بـ ELM327** عبر Web Bluetooth
- **قراءة رموز الأعطال** (Mode 03)
- **مسح الأعطال** (Mode 04)
- **قياسات حية** (RPM, Speed, Coolant, Fuel)
- **واجهة عربية RTL**
- **PWA** — يعمل offline

---

## 🔗 روابط

- **الموقع:** https://ishakdiga55-ops.github.io/Diga-scaner/
- **المستودع:** https://github.com/ishakdiga55-ops/Diga-scaner
- **الترخيص:** MIT
- **الإبلاغ عن ثغرة:** [Security Advisory](https://github.com/ishakdiga55-ops/Diga-scaner/security/advisories/new)

---

**صُنع بحب في الجزائر 🇩🇿**
