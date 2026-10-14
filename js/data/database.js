export const DTC_DATABASE = {
// ============================================
// أكواد P — المحرك (Powertrain)
// ============================================
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

// ============================================
// أكواد C0xxx — حساسات السرعة (Wheel Speed Sensors)
// ============================================
"C0035":{zone:"abs",title:"حساس عجلة أمامية يسرى",title_en:"FL Wheel Speed Sensor",severity:"high"},
"C0040":{zone:"abs",title:"حساس عجلة أمامية يمنى",title_en:"FR Wheel Speed Sensor",severity:"high"},
"C0045":{zone:"abs",title:"حساس عجلة خلفية يسرى",title_en:"RL Wheel Speed Sensor",severity:"high"},
"C0050":{zone:"abs",title:"حساس عجلة خلفية يمنى",title_en:"RR Wheel Speed Sensor",severity:"high"},
"C0051":{zone:"abs",title:"حساس سرعة العجلة الأمامية",title_en:"Front Wheel Speed Sensor",severity:"high"},
"C0055":{zone:"abs",title:"حساس سرعة العجلة الخلفية",title_en:"Rear Wheel Speed Sensor",severity:"high"},

// ============================================
// أكواد C0xxx — صمامات ABS (Solenoid Valves)
// ============================================
"C0060":{zone:"abs",title:"صمام ABS أمامي يسرى",title_en:"FL ABS Solenoid Valve",severity:"high"},
"C0061":{zone:"abs",title:"صمام ABS أمامي يمنى",title_en:"FR ABS Solenoid Valve",severity:"high"},
"C0065":{zone:"abs",title:"صمام ABS خلفي",title_en:"Rear ABS Solenoid Valve",severity:"high"},
"C0070":{zone:"abs",title:"صمام ABS خلفي يسرى",title_en:"RL ABS Solenoid Valve",severity:"high"},
"C0071":{zone:"abs",title:"صمام ABS خلفي يمنى",title_en:"RR ABS Solenoid Valve",severity:"high"},
"C0075":{zone:"abs",title:"دائرة صمام ABS",title_en:"ABS Solenoid Circuit",severity:"high"},
"C0080":{zone:"abs",title:"صمام عزل ABS",title_en:"ABS Isolation Valve",severity:"high"},
"C0081":{zone:"abs",title:"صمام تخفيض ABS",title_en:"ABS Dump Valve",severity:"high"},
"C0085":{zone:"abs",title:"صمام ABS أمامي",title_en:"Front ABS Valve",severity:"high"},
"C0090":{zone:"abs",title:"صمام ABS خلفي",title_en:"Rear ABS Valve",severity:"high"},
"C0095":{zone:"abs",title:"دائرة صمام ABS",title_en:"ABS Valve Circuit",severity:"high"},
"C0096":{zone:"abs",title:"صمام ABS عالي",title_en:"ABS Valve High",severity:"high"},
"C0097":{zone:"abs",title:"صمام ABS منخفض",title_en:"ABS Valve Low",severity:"high"},
"C0098":{zone:"abs",title:"صمام ABS أداء",title_en:"ABS Valve Performance",severity:"high"},
"C0099":{zone:"abs",title:"صمام ABS عام",title_en:"ABS Valve Generic",severity:"medium"},

// ============================================
// أكواد C01xx — مضخة ABS + EBCM
// ============================================
"C0100":{zone:"abs",title:"دائرة مضخة ABS",title_en:"ABS Pump Motor Circuit",severity:"critical"},
"C0101":{zone:"abs",title:"مضخة ABS عالية",title_en:"ABS Pump Motor High",severity:"high"},
"C0105":{zone:"abs",title:"مضخة ABS أداء",title_en:"ABS Pump Performance",severity:"high"},
"C0110":{zone:"abs",title:"دائرة مضخة ABS",title_en:"ABS Pump Motor Circuit",severity:"critical"},
"C0111":{zone:"abs",title:"مضخة ABS",title_en:"ABS Pump Motor",severity:"high"},
"C0115":{zone:"abs",title:"مضخة ABS عالية",title_en:"ABS Pump Motor High",severity:"high"},
"C0120":{zone:"abs",title:"ريلاي صمام ABS",title_en:"ABS Valve Relay",severity:"high"},
"C0121":{zone:"abs",title:"دائرة ريلاي الصمام",title_en:"Valve Relay Circuit",severity:"high"},
"C0125":{zone:"abs",title:"ريلاي الصمام منخفض",title_en:"Valve Relay Low",severity:"high"},
"C0128":{zone:"abs",title:"مستوى سائل الفرامل منخفض",title_en:"Low Brake Fluid",severity:"critical"},
"C0130":{zone:"abs",title:"ريلاي الصمام عالي",title_en:"Valve Relay High",severity:"high"},
"C0131":{zone:"abs",title:"دائرة ريلاي ABS",title_en:"ABS Relay Circuit",severity:"high"},
"C0135":{zone:"abs",title:"ريلاي ABS عالي",title_en:"ABS Relay High",severity:"high"},
"C0140":{zone:"abs",title:"ريلاي ABS منخفض",title_en:"ABS Relay Low",severity:"high"},
"C0145":{zone:"abs",title:"دائرة RSC",title_en:"RSC Circuit",severity:"high"},
"C0150":{zone:"abs",title:"دائرة ريلاي RSC",title_en:"RSC Relay Circuit",severity:"high"},
"C0151":{zone:"abs",title:"RSC عالي",title_en:"RSC High",severity:"high"},
"C0155":{zone:"abs",title:"دائرة صمام RSC",title_en:"RSC Valve Circuit",severity:"high"},
"C0160":{zone:"abs",title:"مفتاح الفرامل ABS/TCS",title_en:"ABS/TCS Brake Switch",severity:"medium"},
"C0161":{zone:"abs",title:"دائرة مفتاح الفرامل",title_en:"Brake Switch Circuit",severity:"medium"},
"C0170":{zone:"abs",title:"ضغط الفرامل",title_en:"Brake Pressure",severity:"medium"},
"C0175":{zone:"abs",title:"إشارة ضغط الفرامل",title_en:"Brake Pressure Signal",severity:"medium"},
"C0180":{zone:"abs",title:"مفتاح ABS/TCS",title_en:"ABS/TCS Switch",severity:"medium"},
"C0185":{zone:"abs",title:"مفتاح TCS",title_en:"TCS Switch",severity:"medium"},
"C0190":{zone:"abs",title:"دائرة TCS",title_en:"TCS Circuit",severity:"high"},
"C0195":{zone:"abs",title:"TCS أداء",title_en:"TCS Performance",severity:"high"},

// ============================================
// أكواد C02xx — حساسات السرعة + EBCM
// ============================================
"C0200":{zone:"abs",title:"حساس عجلة أمامية يسرى",title_en:"LF Wheel Speed Sensor",severity:"high"},
"C0201":{zone:"abs",title:"حساس عجلة أمامية يسرى عالي",title_en:"LF Wheel Speed Sensor High",severity:"high"},
"C0205":{zone:"abs",title:"حساس عجلة أمامية يسرى منخفض",title_en:"LF Wheel Speed Sensor Low",severity:"high"},
"C0210":{zone:"abs",title:"حساس عجلة أمامية يمنى",title_en:"RF Wheel Speed Sensor",severity:"high"},
"C0211":{zone:"abs",title:"حساس عجلة أمامية يمنى عالي",title_en:"RF Wheel Speed Sensor High",severity:"high"},
"C0215":{zone:"abs",title:"حساس عجلة أمامية يمنى منخفض",title_en:"RF Wheel Speed Sensor Low",severity:"high"},
"C0220":{zone:"abs",title:"حساس عجلة خلفية يمنى",title_en:"RR Wheel Speed Sensor",severity:"high"},
"C0221":{zone:"abs",title:"حساس عجلة خلفية يمنى عالي",title_en:"RR Wheel Speed Sensor High",severity:"high"},
"C0225":{zone:"abs",title:"حساس عجلة خلفية يمنى منخفض",title_en:"RR Wheel Speed Sensor Low",severity:"high"},
"C0230":{zone:"abs",title:"حساس عجلة خلفية يسرى",title_en:"LR Wheel Speed Sensor",severity:"high"},
"C0235":{zone:"abs",title:"حساس عجلة خلفية يسرى منخفض",title_en:"LR Wheel Speed Sensor Low",severity:"high"},
"C0240":{zone:"abs",title:"حساس عجلة أمامية يسرى أداء",title_en:"LF Wheel Speed Performance",severity:"high"},
"C0245":{zone:"abs",title:"حساس عجلة أمامية يمنى أداء",title_en:"RF Wheel Speed Performance",severity:"high"},
"C0250":{zone:"abs",title:"حساس عجلة خلفية يمنى أداء",title_en:"RR Wheel Speed Performance",severity:"high"},
"C0251":{zone:"abs",title:"حساس عجلة خلفية يسرى أداء",title_en:"LR Wheel Speed Performance",severity:"high"},
"C0260":{zone:"abs",title:"ريلاي EBCM",title_en:"EBCM Relay",severity:"high"},
"C0265":{zone:"abs",title:"دائرة ريلاي EBCM",title_en:"EBCM Relay Circuit",severity:"high"},
"C0266":{zone:"abs",title:"EBCM عالي",title_en:"EBCM High",severity:"high"},
"C0267":{zone:"abs",title:"دائرة مضخة منخفضة",title_en:"Pump Motor Circuit Low",severity:"high"},
"C0270":{zone:"abs",title:"EBCM أداء",title_en:"EBCM Performance",severity:"critical"},
"C0271":{zone:"abs",title:"عطل EBCM",title_en:"EBCM Malfunction",severity:"critical"},
"C0272":{zone:"abs",title:"EBCM داخلي",title_en:"EBCM Internal",severity:"critical"},
"C0273":{zone:"abs",title:"EBCM مفتوح",title_en:"EBCM Open",severity:"critical"},
"C0274":{zone:"abs",title:"EBCM داخلي",title_en:"EBCM Internal",severity:"critical"},
"C0275":{zone:"abs",title:"EBCM غير معاير",title_en:"EBCM Not Calibrated",severity:"high"},
"C0276":{zone:"abs",title:"صمام كهربائي ABS",title_en:"ABS Solenoid Valve",severity:"high"},
"C0277":{zone:"abs",title:"حساس موضع دواسة الفرامل",title_en:"Brake Pedal Position Sensor",severity:"medium"},
"C0278":{zone:"abs",title:"مفتاح الفرامل",title_en:"Brake Switch",severity:"medium"},
"C0281":{zone:"abs",title:"دائرة مفتاح الفرامل",title_en:"Brake Switch Circuit",severity:"medium"},
"C0286":{zone:"abs",title:"حساس ضغط الفرامل",title_en:"Brake Pressure Sensor",severity:"high"},
"C0290":{zone:"abs",title:"مضخم الفرامل",title_en:"Brake Booster",severity:"high"},
"C0292":{zone:"abs",title:"حساس الفراغ",title_en:"Vacuum Sensor",severity:"medium"},
"C0296":{zone:"abs",title:"حساس معدل الانحراف",title_en:"Yaw Rate Sensor",severity:"high"},
"C0297":{zone:"abs",title:"حساس Yaw أداء",title_en:"Yaw Rate Performance",severity:"high"},
"C0299":{zone:"abs",title:"إشارة حساس الانحراف",title_en:"Yaw Rate Sensor Signal",severity:"high"},

// ============================================
// أكواد C03xx — حساسات ESC + صمامات متقدمة
// ============================================
"C0300":{zone:"abs",title:"حساس معدل الانحراف",title_en:"Yaw Rate Sensor Circuit",severity:"high"},
"C0305":{zone:"abs",title:"مقياس تسارع جانبي",title_en:"Lateral Accelerometer",severity:"high"},
"C0310":{zone:"abs",title:"إشارة حساس السرعة",title_en:"Speed Sensor Signal",severity:"medium"},
"C0315":{zone:"abs",title:"إشارة حساس السرعة",title_en:"Speed Sensor Signal",severity:"medium"},
"C0321":{zone:"abs",title:"دائرة حساس السرعة",title_en:"Speed Sensor Circuit",severity:"high"},
"C0325":{zone:"abs",title:"إشارة حساس السرعة",title_en:"Speed Sensor Signal",severity:"medium"},
"C0330":{zone:"abs",title:"حساس السرعة",title_en:"Speed Sensor",severity:"high"},
"C0335":{zone:"abs",title:"حساس السرعة",title_en:"Speed Sensor",severity:"high"},
"C0340":{zone:"abs",title:"حساس السرعة",title_en:"Speed Sensor",severity:"high"},
"C0350":{zone:"abs",title:"صمام دخل أمامي يسرى",title_en:"LF Inlet Valve",severity:"high"},
"C0351":{zone:"abs",title:"صمام خرج أمامي يسرى",title_en:"LF Outlet Valve",severity:"high"},
"C0355":{zone:"abs",title:"صمام دخل أمامي يمنى",title_en:"RF Inlet Valve",severity:"high"},
"C0356":{zone:"abs",title:"صمام خرج أمامي يمنى",title_en:"RF Outlet Valve",severity:"high"},
"C0360":{zone:"abs",title:"صمام دخل خلفي يسرى",title_en:"LR Inlet Valve",severity:"high"},
"C0361":{zone:"abs",title:"صمام خرج خلفي يسرى",title_en:"LR Outlet Valve",severity:"high"},
"C0365":{zone:"abs",title:"صمام دخل خلفي يمنى",title_en:"RR Inlet Valve",severity:"high"},
"C0366":{zone:"abs",title:"صمام خرج خلفي يمنى",title_en:"RR Outlet Valve",severity:"high"},
"C0370":{zone:"abs",title:"صمام دخل أمامي",title_en:"Front Inlet Valve",severity:"high"},
"C0375":{zone:"abs",title:"صمام خرج أمامي",title_en:"Front Outlet Valve",severity:"high"},
"C0380":{zone:"abs",title:"صمام دخل خلفي",title_en:"Rear Inlet Valve",severity:"high"},
"C0385":{zone:"abs",title:"صمام خرج خلفي",title_en:"Rear Outlet Valve",severity:"high"},
"C0390":{zone:"abs",title:"صمام عزل",title_en:"Isolation Valve",severity:"high"},
"C0395":{zone:"abs",title:"صمام تخفيض",title_en:"Dump Valve",severity:"high"},

// ============================================
// أكواد C04xx-C05xx — ESC + TCS + RSC
// ============================================
"C0400":{zone:"abs",title:"صمام TCS أمامي",title_en:"TCS Front Valve",severity:"high"},
"C0405":{zone:"abs",title:"صمام TCS خلفي",title_en:"TCS Rear Valve",severity:"high"},
"C0410":{zone:"abs",title:"مضخة TCS",title_en:"TCS Pump",severity:"high"},
"C0415":{zone:"abs",title:"دائرة TCS",title_en:"TCS Circuit",severity:"high"},
"C0420":{zone:"abs",title:"صمام ESC أمامي",title_en:"ESC Front Valve",severity:"high"},
"C0425":{zone:"abs",title:"صمام ESC خلفي",title_en:"ESC Rear Valve",severity:"high"},
"C0430":{zone:"abs",title:"مضخة ESC",title_en:"ESC Pump",severity:"high"},
"C0435":{zone:"abs",title:"دائرة ESC",title_en:"ESC Circuit",severity:"high"},
"C0440":{zone:"abs",title:"صمام RSC",title_en:"RSC Valve",severity:"high"},
"C0445":{zone:"abs",title:"مضخة RSC",title_en:"RSC Pump",severity:"high"},
"C0450":{zone:"abs",title:"دائرة RSC",title_en:"RSC Circuit",severity:"high"},
"C0455":{zone:"abs",title:"حساس ضغط ESC",title_en:"ESC Pressure Sensor",severity:"high"},
"C0460":{zone:"abs",title:"حساس زاوية المقود",title_en:"Steering Angle Sensor",severity:"high"},
"C0465":{zone:"abs",title:"زاوية المقود أداء",title_en:"Steering Angle Performance",severity:"high"},
"C0470":{zone:"abs",title:"حساس سرعة المقود",title_en:"Steering Rate Sensor",severity:"high"},
"C0475":{zone:"abs",title:"مفتاح ESC",title_en:"ESC Switch",severity:"medium"},
"C0480":{zone:"abs",title:"مفتاح TCS",title_en:"TCS Switch",severity:"medium"},
"C0485":{zone:"abs",title:"حساس ميل",title_en:"Tilt Sensor",severity:"medium"},
"C0490":{zone:"abs",title:"حساس انحراف ESC",title_en:"ESC Yaw Sensor",severity:"high"},
"C0495":{zone:"abs",title:"مقياس تسارع ESC",title_en:"ESC Accelerometer",severity:"high"},

// ============================================
// أكواد C1xxx — مصنّعين (Manufacturer Specific)
// ============================================
"C1000":{zone:"abs",title:"عطل ABS مصنّع",title_en:"ABS Manufacturer Fault",severity:"high",brand:"عام"},
"C1010":{zone:"abs",title:"حساس عجلة أمامية يسرى مصنّع",title_en:"FL Wheel Sensor (Mfr)",severity:"high",brand:"عام"},
"C1015":{zone:"abs",title:"حساس عجلة أمامية يمنى مصنّع",title_en:"FR Wheel Sensor (Mfr)",severity:"high",brand:"عام"},
"C1020":{zone:"abs",title:"حساس عجلة خلفية يسرى مصنّع",title_en:"RL Wheel Sensor (Mfr)",severity:"high",brand:"عام"},
"C1025":{zone:"abs",title:"حساس عجلة خلفية يمنى مصنّع",title_en:"RR Wheel Sensor (Mfr)",severity:"high",brand:"عام"},
"C1030":{zone:"abs",title:"مضخة ABS مصنّع",title_en:"ABS Pump (Mfr)",severity:"high",brand:"عام"},
"C1035":{zone:"abs",title:"صمام ABS مصنّع",title_en:"ABS Valve (Mfr)",severity:"high",brand:"عام"},
"C1040":{zone:"abs",title:"EBCM مصنّع",title_en:"EBCM (Mfr)",severity:"critical",brand:"عام"},
"C1045":{zone:"abs",title:"حساس ESC مصنّع",title_en:"ESC Sensor (Mfr)",severity:"high",brand:"عام"},
"C1050":{zone:"abs",title:"مضخة ESC مصنّع",title_en:"ESC Pump (Mfr)",severity:"high",brand:"عام"},
"C1060":{zone:"abs",title:"ABS مصنّع - محرّك",title_en:"ABS Motor (Mfr)",severity:"high",brand:"عام"},
"C1065":{zone:"abs",title:"ABS مصنّع - صمام",title_en:"ABS Valve (Mfr)",severity:"high",brand:"عام"},
"C1070":{zone:"abs",title:"ABS مصنّع - حساس",title_en:"ABS Sensor (Mfr)",severity:"high",brand:"عام"},
"C1080":{zone:"abs",title:"ABS مصنّع - نظام",title_en:"ABS System (Mfr)",severity:"high",brand:"عام"},
"C1090":{zone:"abs",title:"ABS مصنّع - وحدة",title_en:"ABS Module (Mfr)",severity:"critical",brand:"عام"},
"C1100":{zone:"abs",title:"ABS مصنّع - اتصال",title_en:"ABS Communication (Mfr)",severity:"high",brand:"عام"},
"C1110":{zone:"abs",title:"ABS مصنّع - برمجة",title_en:"ABS Programming (Mfr)",severity:"medium",brand:"عام"},
"C1120":{zone:"abs",title:"ABS مصنّع - معايرة",title_en:"ABS Calibration (Mfr)",severity:"medium",brand:"عام"},
"C1130":{zone:"abs",title:"ABS مصنّع - إشارة",title_en:"ABS Signal (Mfr)",severity:"high",brand:"عام"},
"C1140":{zone:"abs",title:"ABS مصنّع - جهد",title_en:"ABS Voltage (Mfr)",severity:"high",brand:"عام"},

// ============================================
// أكواد B0xxx — الهيكل (Body)
// ============================================
"B0001":{zone:"airbag",title:"عطل الوسائد الهوائية",title_en:"Airbag Fault",severity:"critical"},
"B0010":{zone:"airbag",title:"دائرة الوسادة الهوائية",title_en:"Airbag Circuit",severity:"critical"},
"B1000":{zone:"airbag",title:"عطل وحدة الوسائد",title_en:"Airbag Module",severity:"critical"},

// ============================================
// أكواد U0xxx — الشبكة (Network) — مهمة لـ ABS
// ============================================
"U0100":{zone:"electronics",title:"فقدان الاتصال بـ ECU",title_en:"Lost ECU",severity:"critical"},
"U0101":{zone:"transmission",title:"فقدان TCM",title_en:"Lost TCM",severity:"critical"},
"U0121":{zone:"abs",title:"فقدان الاتصال بـ ABS",title_en:"Lost ABS",severity:"critical"},
"U0125":{zone:"abs",title:"فقدان حساس الانحراف",title_en:"Lost Yaw Rate Sensor",severity:"high"},
"U0126":{zone:"abs",title:"فقدان حساس زاوية المقود",title_en:"Lost Steering Angle Sensor",severity:"high"},
"U0127":{zone:"abs",title:"فقدان ضغط الإطارات",title_en:"Lost TPMS",severity:"medium"},
"U0128":{zone:"abs",title:"فقدان فرامل الانتظار",title_en:"Lost Parking Brake",severity:"medium"},
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
