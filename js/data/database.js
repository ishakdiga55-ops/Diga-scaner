export const DTC_DATABASE = {
"P0100":{zone:"engine",title:"دائرة حساس MAF",title_en:"MAF Sensor Circuit",severity:"medium"},
"P0101":{zone:"engine",title:"مدى أداء حساس MAF",title_en:"MAF Sensor Range/Performance",severity:"medium"},
"P0102":{zone:"engine",title:"إشارة حساس MAF منخفضة",title_en:"MAF Circuit Low Input",severity:"medium",causes:["تسرب هواء","سلك مفصول"],symptoms:["قراءة MAF منخفضة"]},
"P0103":{zone:"engine",title:"إشارة حساس MAF مرتفعة",title_en:"MAF Circuit High Input",severity:"medium",causes:["حساس متسخ","دائرة قصر"]},
"P0115":{zone:"cooling",title:"عطل في دائرة حساس حرارة المحرك",title_en:"ECT Circuit Malfunction",severity:"medium",causes:["حساس تالف","سلك مقطوع"],symptoms:["قراءة حرارة غير منطقية"],steps:["افحص أسلاك الحساس","قِس مقاومة الحساس"]},
"P0117":{zone:"cooling",title:"إشارة حساس الحرارة منخفضة جداً",title_en:"ECT Circuit Low Input",severity:"medium"},
"P0118":{zone:"cooling",title:"إشارة حساس الحرارة مرتفعة جداً",title_en:"ECT Circuit High Input",severity:"medium"},
"P0128":{zone:"cooling",title:"ترموستات عاطل",title_en:"Thermostat",severity:"medium"},
"P0171":{zone:"fuel",title:"خليط فقير Bank 1",title_en:"Too Lean Bank 1",severity:"high",causes:["تسرب هواء","MAF متسخ"],symptoms:["اهتزاز","ضعف تسارع"]},
"P0172":{zone:"fuel",title:"خليط غني Bank 1",title_en:"Too Rich Bank 1",severity:"high"},
"P0174":{zone:"fuel",title:"خليط فقير Bank 2",title_en:"Too Lean Bank 2",severity:"high"},
"P0175":{zone:"fuel",title:"خليط غني Bank 2",title_en:"Too Rich Bank 2",severity:"high"},
"P0217":{zone:"cooling",title:"ارتفاع حرارة المحرك",title_en:"Overheating",severity:"critical"},
"P0299":{zone:"engine",title:"ضغط التيربو منخفض",title_en:"Turbo Underboost",severity:"high"},
"P0300":{zone:"engine",title:"اشتعال متقطع متعدد",title_en:"Random Misfire",severity:"high"},
"P0301":{zone:"engine",title:"Misfire - أسطوانة 1",title_en:"Cylinder 1 Misfire",severity:"high"},
"P0302":{zone:"engine",title:"Misfire - أسطوانة 2",title_en:"Cylinder 2 Misfire",severity:"high"},
"P0303":{zone:"engine",title:"Misfire - أسطوانة 3",title_en:"Cylinder 3 Misfire",severity:"high"},
"P0304":{zone:"engine",title:"Misfire - أسطوانة 4",title_en:"Cylinder 4 Misfire",severity:"high"},
"P0335":{zone:"engine",title:"دائرة حساس الكرنك",title_en:"Crank Sensor Circuit",severity:"critical"},
"P0340":{zone:"engine",title:"دائرة حساس الكام",title_en:"Cam Sensor Circuit",severity:"high"},
"P0401":{zone:"exhaust",title:"تدفق EGR غير كافٍ",title_en:"EGR Insufficient",severity:"medium"},
"P0420":{zone:"exhaust",title:"كتلايزر ضعيف B1",title_en:"Catalyst B1",severity:"medium"},
"P0430":{zone:"exhaust",title:"كتلايزر ضعيف B2",title_en:"Catalyst B2",severity:"medium"},
"P0442":{zone:"exhaust",title:"تسرب EVAP صغير",title_en:"EVAP Small Leak",severity:"low"},
"P0455":{zone:"exhaust",title:"تسرب EVAP كبير",title_en:"EVAP Large Leak",severity:"medium"},
"P0505":{zone:"engine",title:"نظام الخمول",title_en:"Idle Control",severity:"medium"},
"P0524":{zone:"engine",title:"ضغط الزيت منخفض",title_en:"Oil Pressure Low",severity:"critical"},
"P0700":{zone:"transmission",title:"عطل ناقل الحركة",title_en:"Transmission",severity:"high"},
"P0715":{zone:"transmission",title:"دائرة حساس دخل الجير",title_en:"Input Speed Sensor",severity:"high"},
"P0720":{zone:"transmission",title:"دائرة حساس خرج الجير",title_en:"Output Speed Sensor",severity:"high"},
"P0730":{zone:"transmission",title:"نسبة التروس",title_en:"Gear Ratio",severity:"critical"},
"P0741":{zone:"transmission",title:"TCC أداء",title_en:"TCC",severity:"high"},
"P0750":{zone:"transmission",title:"Solenoid A",title_en:"Shift Sol A",severity:"high"},
"P0755":{zone:"transmission",title:"Solenoid B",title_en:"Shift Sol B",severity:"high"},
"P2002":{brand:"Diesel",zone:"exhaust",title:"DPF مسدود",title_en:"DPF Low",severity:"high"},
"P2463":{brand:"Diesel",zone:"exhaust",title:"تراكم DPF",title_en:"DPF Soot",severity:"high"},
"C0035":{zone:"brakes",title:"دائرة حساس عجلة أمامية يسرى",title_en:"FL Wheel Sensor",severity:"high"},
"C0040":{zone:"brakes",title:"دائرة حساس عجلة أمامية يمنى",title_en:"FR Wheel Sensor",severity:"high"},
"C0045":{zone:"brakes",title:"دائرة حساس خلفية يسرى",title_en:"RL Wheel Sensor",severity:"high"},
"C0050":{zone:"brakes",title:"دائرة حساس خلفية يمنى",title_en:"RR Wheel Sensor",severity:"high"},
"B0001":{zone:"airbag",title:"عطل الوسائد الهوائية",title_en:"Airbag Fault",severity:"critical"},
"U0100":{zone:"electronics",title:"فقدان الاتصال بـ ECU",title_en:"Lost ECU",severity:"critical"},
"U0101":{zone:"transmission",title:"فقدان TCM",title_en:"Lost TCM",severity:"critical"},
"U0121":{zone:"abs",title:"فقدان ABS",title_en:"Lost ABS",severity:"critical"},
"U0140":{zone:"electronics",title:"فقدان BCM",title_en:"Lost BCM",severity:"high"},
"U0155":{zone:"electronics",title:"فقدان لوحة العدادات",title_en:"Lost Instrument",severity:"high"},
"U0167":{zone:"electronics",title:"فقدان مفتاح المنع",title_en:"Lost Immob",severity:"critical"}
};

export const BRAND_INDEX = new Map();
export const BY_PREFIX = new Map();
export const SEARCH_INDEX = [];

export function buildDTCIndex() {
  BRAND_INDEX.clear();
  for (const k of Object.keys(DTC_DATABASE)) {
    const b = k.split('_')[0].toUpperCase();
    if (!BRAND_INDEX.has(b)) BRAND_INDEX.set(b, []);
    BRAND_INDEX.get(b).push(k);
  }
}

export function buildSearchIndex() {
  SEARCH_INDEX.length = 0;
  BY_PREFIX.clear();
  const codes = Object.keys(DTC_DATABASE);
  for (let idx = 0; idx < codes.length; idx++) {
    const code = codes[idx];
    const info = DTC_DATABASE[code];
    const item = {
      code,
      cleanCode: code.replace(/_[A-Z]+$/, ''),
      info,
      _titleLc: null, _titleEnLc: null, _brandLc: null
    };
    SEARCH_INDEX.push(item);
    const up = code.toUpperCase();
    for (let i = 2; i <= 5 && i <= up.length; i++) {
      const k = up.slice(0, i);
      let bucket = BY_PREFIX.get(k);
      if (!bucket) { bucket = []; BY_PREFIX.set(k, bucket); }
      bucket.push(item);
    }
  }
}

export function getInfo(c) {
  c = String(c).trim().toUpperCase();
  if (DTC_DATABASE[c]) return DTC_DATABASE[c];
  const v = BRAND_INDEX.get(c);
  if (v && v.length) return Object.assign({}, DTC_DATABASE[v[0]], { code: c });
  return { zone: 'engine', title: 'عطل غير معروف', title_en: 'Unknown', desc: '', severity: 'medium' };
}
