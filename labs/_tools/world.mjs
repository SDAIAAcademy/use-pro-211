// The world of the case study: Aflaj Wastewater Services, Al-Rabwa pumping station PS-07.
// Everything the file pack says comes from the tables in this file, so a fact is written once.
// Nothing here reads a clock or the network: the same file gives the same pack.

export const ORG = { ar: 'شركة أفلاج لخدمات الصرف الصحي', station: 'محطة ضخ الربوة', code: 'PS-07', bot: 'مِكشاف' };

export const PEOPLE = {
  ops: { ar: 'حذيفة العبودي', role: 'مشرف التشغيل، يصدر تصاريح العمل' },
  plan: { ar: 'هيلة السويّد', role: 'مهندسة تخطيط الصيانة، صاحبة سجلات الصيانة' },
  hse: { ar: 'نسيبة المشيقح', role: 'مهندسة السلامة، صاحبة إدارة التغيير' },
  tech: { ar: 'سيّاف الهذلي', role: 'فني ميكانيكي، يسجّل ملاحظات الجولة بصوته' },
  ic: { ar: 'طرفة الهليلي', role: 'مهندسة الأجهزة والتحكم، صاحبة نقاط الضبط' },
  doc: { ar: 'رميساء المحيذيع', role: 'مراقبة الوثائق، صاحبة سجل المراجعات' }
};

// A small seeded generator (mulberry32): the logs and the sample are the same on every run.
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------------------------------------------------------------- lab 1.1: twelve field uses
export const TIERS = {
  A: { ar: 'أ', name: 'دعم صياغة', rule: 'المخرج نص يقرؤه الناس. يراجعه صاحبه قبل أن يرسله.' },
  B: { ar: 'ب', name: 'يدخل وثيقة فنية أو قرارًا', rule: 'المخرج يدخل سجلًّا أو إجراءً أو قرار صيانة. لا يُستعمل قبل أن يتحقق شخص مختص من كل قيمة ووحدة وخطوة في مصدرها.' },
  C: { ar: 'ج', name: 'لا يقود الفعل أبدًا', rule: 'إجراء تحكم أو قرار سلامة. الفعل يأتي من الوثيقة المعتمدة ومن الشخص المخوَّل، ومخرج الذكاء الاصطناعي لا يكون سببه ولا سنده.' }
};
export const CHECKS = {
  V1: 'قراءة صاحب النص قبل الإرسال',
  V2: 'مطابقة كل قيمة ووحدة وخطوة على المراجعة السارية',
  V3: 'عينة يراجعها إنسان، وأعداد يحسبها الكود',
  V4: 'قراءة ثانية يقرؤها إنسان من المعدة أو من التسجيل الأصلي',
  V5: 'لا يُستعمل المخرج: الفعل من الوثيقة المعتمدة والشخص المخوَّل'
};
export const LEVELS = ['عام', 'مقيد', 'سري', 'سري للغاية'];
export const TOOLS = {
  T1: { name: 'مساعد عام على الإنترنت', max: 'عام' },
  T2: { name: 'المساعد المعتمد «مِكشاف»', max: 'مقيد' },
  T3: { name: 'نموذج محلي داخل شبكة المحطة', max: 'سري' }
};
// tier, check, who signs, and for the uses that carry a document: its level and the highest tool
export const USES = [
  { id: 'U01', text: 'يطلب مشرف الوردية من المساعد مسودة حديث السلامة قبل العمل عن الإجهاد الحراري، من نشرة السلامة العامة للشركة.', tier: 'A', check: 'V1', signer: 'مشرف الوردية', level: 'عام', tool: 'T1', why: 'نص يُقرأ على الفريق، ومصدره نشرة عامة. يراجعه المشرف على النشرة.' },
  { id: 'U02', text: 'يترجم فني مذكرة تسليم الوردية إلى الإنجليزية لمقاول، وفيها أن المضخة P-101B معزولة ومقفلة.', tier: 'B', check: 'V2', signer: 'مشرف التشغيل', level: 'مقيد', tool: 'T2', why: 'المذكرة تحمل حالة معدة. خطأ في رمز أو في كلمة «معزولة» يصل إلى من سيعمل عليها.' },
  { id: 'U03', text: 'تسأل مهندسة التخطيط المساعد عن فترة تشحيم محامل المحرك من الدليل التشغيلي لتكتبها في خطة الصيانة الوقائية.', tier: 'B', check: 'V2', signer: 'مهندسة تخطيط الصيانة', level: 'مقيد', tool: 'T2', why: 'القيمة تدخل خطة الصيانة. تُطابق هي ووحدتها على المراجعة السارية من الدليل.' },
  { id: 'U04', text: 'يطلب فني من المساعد قائمة نقاط العزل للمضخة P-101B ليكتبها في تصريح العمل.', tier: 'C', check: 'V5', signer: 'مشرف التشغيل (مصدر التصريح)', level: 'سري', tool: 'T3', why: 'نقاط العزل تحمي حياة من يفتح المضخة. تؤخذ من شهادة العزل المعتمدة ومن المخطط، ويثبتها الشخص المخوَّل.' },
  { id: 'U05', text: 'يقترح المساعد قيمة جديدة لنقطة ضبط إنذار المستوى العالي في بئر التجميع LT-101، ويريد المشغّل إدخالها.', tier: 'C', check: 'V5', signer: 'مهندسة الأجهزة والتحكم، عبر إدارة التغيير', level: 'سري', tool: 'T3', why: 'تغيير نقطة ضبط إجراء تحكم. لا يتغير إلا بنموذج تغيير معتمد.' },
  { id: 'U06', text: 'ترمّز مهندسة التخطيط سجلات الصيانة النصية بالمساعد إلى أنواع أعطال، لمراجعة الموثوقية السنوية.', tier: 'B', check: 'V3', signer: 'مهندسة تخطيط الصيانة', level: 'مقيد', tool: 'T2', why: 'الأعداد تدخل قرار صيانة. الترميز يُراجَع على عينة، والعدّ يحسبه الكود.' },
  { id: 'U07', text: 'يصوّر فني مقياس ضغط الطرد، ويقرأ المساعد القيمة من الصورة لتُكتب في ورقة الجولة اليومية.', tier: 'B', check: 'V4', signer: 'مشرف الوردية', level: 'مقيد', tool: 'T2', why: 'القراءة تدخل سجلًّا يُبنى عليه. تحتاج إلى قراءة إنسان ما لم يُقَس أداء المساعد على هذا النوع من المقاييس.' },
  { id: 'U08', text: 'يكتب المساعد محضر اجتماع الصيانة الأسبوعي من ملاحظات المهندسة المكتوبة.', tier: 'A', check: 'V1', signer: 'صاحبة المحضر', level: 'مقيد', tool: 'T2', why: 'نص إداري يراجعه من حضر الاجتماع. والملاحظات داخلية، فلا تذهب إلى مساعد عام.' },
  { id: 'U09', text: 'يصوّر فني شاشة كاشف الغاز عند فتحة بئر التجميع، ويسأل المساعد: هل الدخول آمن؟', tier: 'C', check: 'V5', signer: 'مشرف التشغيل، وفق تصريح دخول الأماكن المحصورة', level: 'مقيد', tool: 'T2', why: 'قرار دخول مكان محصور قرار سلامة. يقرأ الكاشفَ الشخصُ المخوَّل، ويثبت القراءة في التصريح.' },
  { id: 'U10', text: 'يرفع مهندس جديد مخطط الأنابيب والأجهزة للمحطة إلى مساعد عام على الإنترنت ليسأله عن معنى رمز صمام.', tier: 'A', check: 'V1', signer: 'المهندس نفسه', level: 'سري', tool: 'T3', why: 'الغاية تعلّم، فالمستوى أ. والخطأ في الأداة: المخطط سري ولا يذهب إلى مساعد عام. يُسأل عن الرمز دون المخطط، أو يُستعمل النموذج المحلي.' },
  { id: 'U11', text: 'يحوّل المساعد ملاحظة صوتية سجّلها فني في جولة الفحص إلى تقرير فحص مهيكل يدخل نظام الصيانة.', tier: 'B', check: 'V4', signer: 'مشرف الوردية', level: 'مقيد', tool: 'T2', why: 'التقرير يدخل نظام الصيانة. تُراجَع الرموز والقيم والوحدات على التسجيل نفسه قبل الاعتماد.' },
  { id: 'U12', text: 'في أثناء إنذار، يسأل المشغّل المساعد: أي مضخة أشغّل الآن؟ ويريد أن ينفذ الجواب.', tier: 'C', check: 'V5', signer: 'المشغّل المخوَّل، وفق إجراء الاستجابة للإنذار', level: 'سري', tool: 'T3', why: 'تشغيل مضخة إجراء تحكم في حالة طارئة. يُنفَّذ إجراء الاستجابة المعتمد.' }
];

// ---------------------------------------------------------------- lab 1.2: the manual, the change, the procedure
// One row per fact of chapter 4 of the manual: the value in revision C and in revision D.
export const FACTS = [
  { k: 'motor_kw', sec: '4.1', label: 'قدرة المحرك', c: '75', d: '90', u: 'kW' },
  { k: 'weight', sec: '4.1', label: 'وزن المضخة مع المحرك', c: '480', d: '640', u: 'kg' },
  { k: 'low_level_trip', sec: '4.2', label: 'حد الإيقاف عند المستوى المنخفض في بئر التجميع (LT-101)', c: '0.80', d: '1.10', u: 'm' },
  { k: 'max_pressure', sec: '4.2', label: 'أقصى ضغط طرد عند PT-110', c: '4.5', d: '5.2', u: 'bar' },
  { k: 'barrier_pressure', sec: '4.2', label: 'ضغط سائل الحاجز في مانع التسرب المزدوج (المسموح 1.8 إلى 2.2)', c: null, d: '2.0', u: 'bar' },
  { k: 'vibration', sec: '4.2', label: 'أقصى اهتزاز مقبول على المحامل', c: '7.1', d: '4.5', u: 'mm/s' },
  { k: 'wait', sec: '4.3', label: 'الانتظار بعد العزل وقبل فتح صندوق الأطراف', c: '5', d: '10', u: 'min' },
  { k: 'gas_limit', sec: '4.4', label: 'قراءة كاشف الغاز المحمول لكبريتيد الهيدروجين قبل فتح التصريف: أقل من', c: null, d: '5', u: 'ppm' },
  { k: 'lift_rating', sec: '4.5', label: 'الحمولة المقدرة لمعدة الرفع: لا تقل عن', c: '750', d: '1000', u: 'kg' },
  { k: 'torque', sec: '4.5', label: 'عزم شد مسامير الكوبلنق', c: '85', d: '120', u: 'N·m' },
  { k: 'start_hz', sec: '4.6', label: 'تردد بدء التشغيل من مغيّر السرعة، لمدة دقيقتين', c: '25', d: '30', u: 'Hz' }
];
export const ISOLATION = { c: ['Q-101B'], d: ['Q-101B', 'F-24B'] };
export const VALVES = { suction: 'HV-111B', discharge: 'HV-112B', vent: 'HV-115B', drain: 'HV-116B' };

// Mikshaf's recorded draft of revision 4. Each step: the text, its citation, the facts it states
// (key, value, unit), what it does (act) and, for a planted fault, the fault's id.
export const DRAFT = [
  { t: 'احصل على تصريح العمل من مشرف التشغيل، وسجّل رقمه في رأس هذا الإجراء.', cite: 'الإجراء SOP-M-014، المراجعة 3، الخطوة 1', act: 'permit' },
  { t: 'أوقف المضخة P-101B من لوحة التشغيل، وحوّل مفتاح الاختيار إلى وضع الإيقاف.', cite: 'الدليل، المراجعة D، §4.3', act: 'stop' },
  { t: 'اعزل المضخة كهربائيًّا: افتح القاطع Q-101B في لوحة MCC.', cite: 'الدليل، المراجعة D، §4.3', act: 'isolate', iso: ['Q-101B'], fault: 'F4' },
  { t: 'تحقق من انعدام الجهد على أطراف المحرك بجهاز فحص مجرَّب.', cite: 'الدليل، المراجعة D، §4.3', act: 'test', fault: 'F5' },
  { t: 'ضع القفل وبطاقة التحذير على القاطع Q-101B، واحتفظ بالمفتاح معك.', cite: 'الدليل، المراجعة D، §4.3', act: 'lock' },
  { t: 'انتظر 5 دقائق قبل فتح صندوق الأطراف.', cite: 'الدليل، المراجعة C، §4.3', act: 'wait', facts: [['wait', '5', 'min']], fault: 'F2' },
  { t: 'أغلق صمام السحب HV-111B وصمام الطرد HV-112B، وأقفلهما في وضع الإغلاق.', cite: 'الدليل، المراجعة D، §4.3', act: 'close_valves' },
  { t: 'افتح صمام التصريف HV-116B لتفريغ جسم المضخة إلى حوض التصريف المغلق.', cite: 'الدليل، المراجعة D، §4.4', act: 'drain', fault: 'F7' },
  { t: 'افصل الكوبلنق، وارفع المضخة بمعدة رفع لا تقل حمولتها المقدرة عن 750 kg.', cite: 'الدليل، المراجعة C، §4.5', act: 'lift', facts: [['lift_rating', '750', 'kg']], fault: 'F9' },
  { t: 'بعد الإصلاح أعد المضخة إلى قاعدتها، وشدّ مسامير الكوبلنق بعزم 120 lbf·ft.', cite: 'الدليل، المراجعة D، §4.5', act: 'torque', facts: [['torque', '120', 'lbf·ft']], fault: 'F3' },
  { t: 'تحقق من مستوى سائل الحاجز، ومن أن ضغطه 2.0 bar (المسموح 1.8 إلى 2.2).', cite: 'الدليل، المراجعة D، §4.6', act: 'barrier', facts: [['barrier_pressure', '2.0', 'bar']] },
  { t: 'شغّل المضخة 10 ثوانٍ قبل ملئها للتأكد من اتجاه الدوران.', cite: 'الدليل، المراجعة D، §4.6', act: 'dry_run', fault: 'F8' },
  { t: 'افتح صمام السحب HV-111B كاملًا، ونفّس الهواء من صمام التنفيس HV-115B حتى يخرج السائل.', cite: 'الدليل، المراجعة D، §4.6', act: 'vent' },
  { t: 'افتح صمام التصريف HV-116B ببطء حتى يكتمل فتحه.', cite: 'الدليل، المراجعة D، §4.6', act: 'open_discharge', valve: 'HV-116B', fault: 'F6' },
  { t: 'أزل الأقفال والبطاقات وفق تصريح العمل، وأغلق القاطع Q-101B.', cite: 'الدليل، المراجعة D، §4.6', act: 'restore' },
  { t: 'شغّل المضخة على 30 Hz لمدة دقيقتين، وتأكد أن ضغط الطرد عند PT-110 لا يتجاوز 5.2 bar وأن الاهتزاز لا يتجاوز 4.5 mm/s.', cite: 'الدليل، المراجعة D، §4.2 و§4.6', act: 'start', facts: [['start_hz', '30', 'Hz'], ['max_pressure', '5.2', 'bar'], ['vibration', '4.5', 'mm/s']] },
  { t: 'تأكد أن حد الإيقاف عند المستوى المنخفض في شاشة LT-101 يعرض 0.80 m. أي فرق يُبلَّغ لمهندسة الأجهزة والتحكم ولا يُعدَّل من الميدان.', cite: 'الدليل، المراجعة C، §4.2', act: 'verify_setpoint', facts: [['low_level_trip', '0.80', 'm']], fault: 'F1' },
  { t: 'أغلق تصريح العمل، وسلّم المضخة لمشرف التشغيل.', cite: 'الإجراء SOP-M-014، المراجعة 3، الخطوة 14', act: 'close_permit' }
];
export const FAULTS = {
  F1: { step: 17, kind: 'قيمة من مراجعة ملغاة', fix: 'حد الإيقاف عند المستوى المنخفض 1.10 m (المراجعة D، §4.2). القيمة 0.80 m من المراجعة C.', hazard: 'تشغيل المضخة على مستوى منخفض: دخول هواء وتلف مانع التسرب.' },
  F2: { step: 6, kind: 'قيمة من مراجعة ملغاة', fix: 'الانتظار 10 دقائق (المراجعة D، §4.3): مكثفات مغيّر السرعة الجديد تحتاج إلى وقت أطول للتفريغ.', hazard: 'طاقة كهربائية مخزنة في مغيّر السرعة: صعق.' },
  F3: { step: 10, kind: 'وحدة خطأ', fix: 'العزم 120 N·m (المراجعة D، §4.5). الرقم صحيح والوحدة lbf·ft خطأ: 120 lbf·ft نحو 163 N·m.', hazard: 'شد زائد بنحو الثلث: تلف المسامير أو الكوبلنق.' },
  F4: { step: 3, kind: 'خطوة ناقصة', fix: 'نقطتا عزل لا واحدة: القاطع Q-101B، ومصهر دائرة التحكم F-24B في لوحة UPS-2 (المراجعة D، §4.3).', hazard: 'مصدر طاقة ثانٍ يبقى موصولًا: دائرة تحكم 24 V حية، وأمر تشغيل غير متوقع.' },
  F5: { step: 4, kind: 'ترتيب خطأ', fix: 'الترتيب في المراجعة D: اعزل، ثم اقفل وعلّق البطاقة، ثم انتظر، ثم تحقق من انعدام الجهد. الفحص قبل القفل والانتظار لا يثبت شيئًا.', hazard: 'فحص قبل تفريغ المكثفات وقبل القفل: قراءة «صفر» لا تبقى صحيحة.' },
  F6: { step: 14, kind: 'رمز ومصطلح خطأ', fix: 'الصمام المقصود صمام الطرد HV-112B (discharge valve). HV-116B صمام تصريف جسم المضخة (drain valve).', hazard: 'فتح التصريف والمضخة مملوءة: خروج مياه صرف وغاز إلى غرفة المضخات.' },
  F7: { step: 8, kind: 'تحذير ناقص', fix: 'قبل فتح التصريف: مروحة التهوية FAN-140 تعمل، وقراءة الكاشف المحمول لكبريتيد الهيدروجين أقل من 5 ppm (المراجعة D، §4.4).', hazard: 'انبعاث كبريتيد الهيدروجين عند فتح جسم المضخة.' },
  F8: { step: 12, kind: 'خطوة لا مصدر لها', fix: 'تُحذف. الدليل يمنع التشغيل الجاف ولو لثوانٍ (المراجعة D، §4.2)، والقسم 4.6 لا يذكر هذه الخطوة.', hazard: 'تشغيل جاف: تلف مانع التسرب المزدوج في ثوانٍ.' },
  F9: { step: 9, kind: 'قيمة من مراجعة ملغاة', fix: 'معدة رفع لا تقل حمولتها عن 1000 kg (المراجعة D، §4.5): المضخة الجديدة 640 kg لا 480 kg.', hazard: 'معدة رفع أضعف من الحمل: سقوط المضخة.' }
};

// ---------------------------------------------------------------- lab 2.1: two years of maintenance logs
export const CODES = {
  BLK: 'انسداد أو تليّف في المروحة أو الخط',
  SEAL: 'تسرب من مانع التسرب الميكانيكي',
  BRG: 'محامل أو اهتزاز',
  ELEC: 'عطل كهربائي أو فصل حماية (ومنه فصل الحماية الحرارية للمحرك)',
  INST: 'عطل في جهاز قياس أو كاشف',
  VLV: 'عطل في صمام',
  OVH: 'ارتفاع حرارة مقيس في الملفات أو المحامل',
  PM: 'صيانة وقائية أو فحص دوري بلا عطل',
  OTH: 'غير ذلك'
};
// Free-text variants per code. A variant with `trap` is one the recorded coding gets wrong:
// the value is the code Mikshaf writes instead.
const V = {
  BLK: [
    ['انسداد في المروحة بسبب ألياف ومناديل، تم الفتح والتنظيف'], ['impeller ragging, opened and cleaned'], ['المضخة ما تسحب، لقينا خرق ملفوفة على المروحة وشلناها'],
    ['ضعف التدفق، تنظيف المروحة من الألياف'], ['pump choked with rags - cleared'], ['انسداد جزئي عند مدخل السحب، تم التسليك']
  ],
  SEAL: [
    ['تسرب من مانع التسرب الميكانيكي، تم تغييره'], ['mech seal leaking, replaced seal kit'], ['تهريب ماء من الميكانيكال سيل جهة المحرك، تغيير السيل'],
    ['تسرب واضح عند السيل، استبدال مانع التسرب'], ['seal leak at pump DE, new seal fitted']
  ],
  BRG: [
    ['اهتزاز عالٍ على المحمل الأمامي، تم تغيير المحمل'], ['bearing noise DE side, replaced bearing'], ['vibration high on NDE bearing, regreased and monitored'],
    ['صوت بالبيرنق جهة الكوبلنق، تم التشحيم', 'OTH'], ['تغيير رمان بلي المحرك بعد صوت خشن', 'OTH'], ['البيرنق الخلفي فيه خلوص، تبديل البيرنق', 'OTH']
  ],
  ELEC: [
    ['فصل مغيّر السرعة بإنذار تيار زائد، إعادة ضبط وفحص الكابل'], ['VFD trip overcurrent, reset, checked cable'], ['احتراق مصهر في دائرة التحكم، تم تغييره'],
    ['فصل الحماية الحرارية للمحرك، إعادة تشغيل بعد التبريد', 'OVH'], ['motor thermal overload tripped, reset after cooling', 'OVH'], ['قاطع المضخة يفصل عند البدء، شد الأطراف'], ['earth fault alarm on VFD, megger test OK, reset'], ['تلف كونتاكتور دائرة التحكم، تم تغييره'], ['انقطاع إشارة التشغيل من اللوحة، إصلاح طرف مفكوك']
  ],
  INST: [
    ['قراءة مستوى عالية كاذبة، تنظيف حساس المستوى'], ['level sensor false high, cleaned transducer face'], ['قراءة الضغط ثابتة لا تتغير، تغيير المرسل'],
    ['flow meter reading zero, rewired signal cable'], ['كاشف الغاز يعطي إنذارًا متكررًا، تمت معايرته']
  ],
  VLV: [
    ['صمام عدم الرجوع لا يغلق، تنظيف القرص'], ['NRV stuck open, cleaned flap'], ['صمام الطرد صعب الحركة، تشحيم العمود'], ['isolation valve passing, lapped seat']
  ],
  OVH: [
    ['حرارة ملفات المحرك 142 درجة على الشاشة، إيقاف وتنظيف مجرى التبريد'], ['winding temp high 138 C, cleaned cooling fins'], ['حرارة المحمل 96 درجة بالقياس، تبديل الشحم']
  ],
  PM: [
    ['صيانة وقائية شهرية: فحص وتشحيم، لا ملاحظات'], ['monthly PM done, no findings'], ['فحص دوري للكابلات والأطراف، الحالة سليمة'],
    ['فحص دوري: لا يوجد تسرب من مانع التسرب الميكانيكي', 'SEAL'], ['PM check: no seal leak, no abnormal noise', 'SEAL'], ['فحص ربع سنوي: لا يوجد اهتزاز غير طبيعي على المحامل', 'BRG'],
    ['معايرة دورية للحساس ضمن الخطة، النتيجة ضمن الحد']
  ],
  OTH: [
    ['إصلاح باب غرفة المضخات'], ['تغيير لمبات الإنارة في غرفة اللوحات'], ['painting of handrails'], ['تنظيف المصفاة اليدوية من الرمل'], ['إعادة تثبيت لوحة تعريف مفكوكة']
  ]
};
const PUMPS = ['P-101A', 'P-101B', 'P-101C'];
const ASSET_OF = {
  BLK: PUMPS, SEAL: PUMPS, BRG: PUMPS, OVH: PUMPS, ELEC: ['VFD-101A', 'VFD-101B', 'VFD-101C', 'P-101A', 'P-101C'],
  INST: ['LT-101', 'PT-110', 'FT-120', 'AT-130'], VLV: ['NRV-103A', 'NRV-103B', 'NRV-103C', 'HV-112A'], PM: [...PUMPS, 'LT-101', 'FAN-140', 'VFD-101B'], OTH: ['PS-07', 'FAN-140', 'SC-100']
};
const DAY0 = Date.UTC(2024, 9, 1); // the log covers 1 October 2024 to 30 September 2026: 730 days
const iso = d => new Date(DAY0 + d * 86400000).toISOString().slice(0, 10);

export function buildLog() {
  const r = rng(211);
  const pick = a => a[Math.floor(r() * a.length)];
  const rows = [];
  const add = (day, asset, code, trapOnly) => {
    let vs = V[code];
    if (trapOnly === true) vs = vs.filter(v => v[1]); else if (trapOnly === false) vs = vs.filter(v => !v[1]);
    const v = pick(vs);
    const down = code === 'PM' || code === 'OTH' ? 0 : [2, 3, 4, 4, 6, 8, 12][Math.floor(r() * 7)];
    rows.push({ day, asset, code, text: v[0], bot: v[1] || code, down });
  };
  // planted series
  // P-101B, seal: nine leaks from June 2025 to February 2026, then the pump is replaced (March 2026)
  [250, 281, 322, 345, 371, 402, 431, 466, 498].forEach(d => add(d, 'P-101B', 'SEAL', false));
  // P-101C, blockage: fourteen, bunched in the two summers
  [262, 276, 291, 305, 318, 334, 349, 610, 626, 641, 655, 668, 684, 699].forEach(d => add(d, 'P-101C', 'BLK', false));
  // P-101A, bearings: seven, four of them written the way the workshop talks
  [[505, true], [533, false], [561, true], [590, true], [617, false], [652, true], [689, false]].forEach(([d, t]) => add(d, 'P-101A', 'BRG', t));
  // LT-101, false high level: eight
  [44, 97, 163, 230, 388, 455, 540, 672].forEach(d => add(d, 'LT-101', 'INST', false));
  // monthly preventive maintenance on each pump: 72 entries, some of them the negation trap
  for (let m = 0; m < 24; m++) for (const p of PUMPS) add(m * 30 + 3 + PUMPS.indexOf(p), p, 'PM', (m * 3 + PUMPS.indexOf(p)) % 6 === 1 ? true : false);
  // background
  const weights = [['BLK', 9], ['SEAL', 5], ['BRG', 6], ['ELEC', 26], ['INST', 14], ['VLV', 16], ['OVH', 7], ['PM', 24], ['OTH', 36]];
  for (const [code, n] of weights) for (let i = 0; i < n; i++) {
    let asset = pick(ASSET_OF[code]);
    // keep the planted series clean: background of the same kind goes to another pump
    if (code === 'SEAL' && asset === 'P-101B') asset = 'P-101A';
    if (code === 'BLK' && asset === 'P-101C') asset = r() < 0.5 ? 'P-101A' : 'P-101B';
    if (code === 'BRG' && asset === 'P-101A') asset = 'P-101C';
    if (code === 'INST' && asset === 'LT-101') asset = 'PT-110';
    add(Math.floor(r() * 730), asset, code);
  }
  rows.sort((a, b) => a.day - b.day || a.asset.localeCompare(b.asset) || a.text.localeCompare(b.text));
  return rows.map((x, i) => ({ id: 'WO-' + String(i + 1).padStart(4, '0'), date: iso(x.day), ...x }));
}
// The 50-entry sample: the first seed from 1 whose draw holds every planted pattern at least once.
export function drawSample(rows) {
  for (let seed = 1; seed < 500; seed++) {
    const r = rng(seed); const idx = rows.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const s = idx.slice(0, 50).sort((a, b) => a - b).map(i => rows[i]);
    const wrong = s.filter(x => x.bot !== x.code);
    const kinds = new Set(wrong.map(x => x.code + '>' + x.bot));
    if (wrong.length >= 5 && wrong.length <= 7 && kinds.has('BRG>OTH') && kinds.has('PM>SEAL') && kinds.has('ELEC>OVH')) return { seed, sample: s };
  }
  throw new Error('no sample seed found');
}
export const RECUR = { window: 90, min: 3 };
// Counts per asset and code, and the largest number inside any 90-day window.
export function countFaults(rows, key) {
  const groups = new Map();
  for (const x of rows) { const c = x[key]; if (c === 'PM' || c === 'OTH') continue; const k = x.asset + '|' + c; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(Date.parse(x.date) / 86400000); }
  const out = [];
  for (const [k, days] of groups) {
    days.sort((a, b) => a - b); let best = 0;
    for (let i = 0; i < days.length; i++) { let j = i; while (j < days.length && days[j] - days[i] <= RECUR.window) j++; best = Math.max(best, j - i); }
    const [asset, code] = k.split('|');
    out.push({ asset, code, n: days.length, window: best, recurring: best >= RECUR.min });
  }
  return out.sort((a, b) => b.n - a.n || a.asset.localeCompare(b.asset) || a.code.localeCompare(b.code));
}
// What Mikshaf answered when asked for counts in the chat, twice. Planted: neither run is a count.
export const CHAT_COUNTS = [
  { run: 1, 'P-101B|SEAL': 12, 'P-101C|BLK': 11, 'P-101A|BRG': 3, 'LT-101|INST': 9 },
  { run: 2, 'P-101B|SEAL': 8, 'P-101C|BLK': 15, 'P-101A|BRG': 4, 'LT-101|INST': 6 }
];

// ---------------------------------------------------------------- lab 2.2: thirty photos and one diagram
// kind: G analog gauge, D digital display, N nameplate, L level, T tag or sticker.
// `truth` is what a careful person reads; `bot` is Mikshaf's recorded reading; tol is the allowed
// difference for a number (half a minor division on a gauge). cond is how the picture was taken.
export const KINDS = { G: 'مقياس بمؤشر', D: 'شاشة رقمية', N: 'لوحة بيانات ونص صغير', L: 'مستوى', T: 'بطاقة أو ملصق' };
export const PHOTOS = [
  { id: 'P01', kind: 'G', tag: 'PI-112A', q: 'ضغط الطرد', unit: 'bar', g: { max: 10, major: 2, minor: 0.5 }, truth: 4.0, bot: 4.0, tol: 0.25, cond: 'clean' },
  { id: 'P02', kind: 'G', tag: 'PI-112B', q: 'ضغط الطرد', unit: 'bar', g: { max: 10, major: 2, minor: 0.5 }, truth: 5.5, bot: 5.0, tol: 0.25, cond: 'clean', why: 'المؤشر بين علامتين صغيرتين: قرأ العلامة السابقة' },
  { id: 'P03', kind: 'G', tag: 'PI-112C', q: 'ضغط الطرد', unit: 'bar', g: { max: 10, major: 2, minor: 0.5 }, truth: 3.5, bot: 3.5, tol: 0.25, cond: 'angled' },
  { id: 'P04', kind: 'G', tag: 'PI-110', q: 'ضغط خط الدفع', unit: 'bar', g: { max: 16, major: 4, minor: 1 }, truth: 5.0, bot: 6.0, tol: 0.5, cond: 'glare', why: 'انعكاس الضوء على الزجاج: أخطأ موضع المؤشر بعلامة' },
  { id: 'P05', kind: 'G', tag: 'PI-111A', q: 'ضغط السحب', unit: 'bar', g: { max: 4, major: 1, minor: 0.2 }, truth: 0.6, bot: 0.6, tol: 0.1, cond: 'clean' },
  { id: 'P06', kind: 'G', tag: 'PI-111B', q: 'ضغط السحب', unit: 'bar', g: { max: 4, major: 1, minor: 0.2, dual: true }, truth: 0.8, bot: 11.6, tol: 0.1, cond: 'clean', why: 'مقياس بتدريجين: قرأ تدريج psi الداخلي وكتب الوحدة bar' },
  { id: 'P07', kind: 'G', tag: 'PI-113B', q: 'ضغط سائل الحاجز', unit: 'bar', g: { max: 4, major: 1, minor: 0.2, redmax: 2.8 }, truth: 2.0, bot: 2.8, tol: 0.1, cond: 'clean', why: 'قرأ المؤشر الأحمر (أعلى قيمة مسجلة) لا المؤشر الأسود' },
  { id: 'P08', kind: 'G', tag: 'PI-140', q: 'ضغط هواء التهوية', unit: 'kPa', g: { max: 2.5, major: 0.5, minor: 0.1 }, truth: 1.2, bot: 1.2, tol: 0.05, cond: 'dirty' },
  { id: 'P09', kind: 'G', tag: 'TI-101B', q: 'حرارة محمل المضخة', unit: '°C', g: { max: 120, major: 20, minor: 5 }, truth: 65, bot: 60, tol: 2.5, cond: 'angled', why: 'تصوير مائل: قرأ العلامة الكبيرة الأقرب' },
  { id: 'P10', kind: 'G', tag: 'PI-112B', q: 'ضغط الطرد', unit: 'bar', g: { max: 10, major: 2, minor: 0.5 }, truth: 5.0, bot: 5.0, tol: 0.25, cond: 'dirty' },
  { id: 'P11', kind: 'D', tag: 'FT-120', q: 'التدفق', unit: 'm³/h', d: '412.5', truth: 412.5, bot: 412.5, tol: 0, cond: 'clean' },
  { id: 'P12', kind: 'D', tag: 'LT-101', q: 'مستوى بئر التجميع', unit: 'm', d: '2.35', truth: 2.35, bot: 235, tol: 0, cond: 'glare', why: 'ضاعت الفاصلة العشرية تحت الانعكاس' },
  { id: 'P13', kind: 'D', tag: 'VFD-101B', q: 'تردد مغيّر السرعة', unit: 'Hz', d: '38.0', truth: 38.0, bot: 38.0, tol: 0, cond: 'clean' },
  { id: 'P14', kind: 'D', tag: 'AT-130', q: 'قراءة كاشف كبريتيد الهيدروجين', unit: 'ppm', d: '1.8', truth: 1.8, bot: 7.8, tol: 0, cond: 'low', why: 'شاشة ضعيفة التباين: قرأ الرقم 1 رقمًا آخر' },
  { id: 'P15', kind: 'D', tag: 'VFD-101A', q: 'تيار المحرك', unit: 'A', d: '142', truth: 142, bot: 142, tol: 0, cond: 'angled' },
  { id: 'P16', kind: 'D', tag: 'PT-110', q: 'ضغط خط الدفع', unit: 'bar', d: '4.86', truth: 4.86, bot: 4.86, tol: 0, cond: 'clean' },
  { id: 'P17', kind: 'N', tag: 'P-101B', q: 'قدرة المحرك من لوحة البيانات', unit: 'kW', n: { field: 'kW' }, truth: '90', bot: '90', cond: 'clean' },
  { id: 'P18', kind: 'N', tag: 'P-101B', q: 'الرقم التسلسلي من لوحة البيانات', unit: '', n: { field: 'S/N' }, truth: 'HT300-B8841', bot: 'HT300-88841', cond: 'clean', why: 'نص صغير: خلط بين الحرف B والرقم 8' },
  { id: 'P19', kind: 'N', tag: 'P-101A', q: 'سرعة الدوران من لوحة البيانات', unit: 'rpm', n: { field: 'RPM' }, truth: '1480', bot: '1480', cond: 'angled' },
  { id: 'P20', kind: 'N', tag: 'P-101C', q: 'سرعة الدوران من لوحة البيانات', unit: 'rpm', n: { field: 'RPM' }, truth: '1480', bot: '1450', cond: 'dirty', why: 'نص صغير تحت اتساخ: كتب قيمة شائعة لا المكتوبة' },
  { id: 'P21', kind: 'N', tag: 'VFD-101B', q: 'أقصى تيار خرج من لوحة البيانات', unit: 'A', n: { field: 'I max' }, truth: '180', bot: '180', cond: 'clean' },
  { id: 'P22', kind: 'N', tag: 'P-101A', q: 'سنة الصنع من لوحة البيانات', unit: '', n: { field: 'YEAR' }, truth: '2019', bot: '2019', cond: 'clean' },
  { id: 'P23', kind: 'L', tag: 'LG-150', q: 'مستوى خزان سائل الحاجز', unit: 'L', l: { max: 20, major: 5, minor: 1 }, truth: 13, bot: 13, tol: 0.5, cond: 'clean' },
  { id: 'P24', kind: 'L', tag: 'LG-150', q: 'مستوى خزان سائل الحاجز', unit: 'L', l: { max: 20, major: 5, minor: 1 }, truth: 7, bot: 8, tol: 0.5, cond: 'angled', why: 'تصوير من أعلى: قرأ أعلى السطح المائل' },
  { id: 'P25', kind: 'L', tag: 'LS-101', q: 'مستوى بئر التجميع على المسطرة', unit: 'm', l: { max: 4, major: 1, minor: 0.2 }, truth: 2.4, bot: 2.4, tol: 0.1, cond: 'clean' },
  { id: 'P26', kind: 'L', tag: 'LS-101', q: 'مستوى بئر التجميع على المسطرة', unit: 'm', l: { max: 4, major: 1, minor: 0.2 }, truth: 1.6, bot: 2.4, tol: 0.1, cond: 'dirty', why: 'عدّ من الأعلى إلى الأسفل: قرأ 4 ناقص 1.6' },
  { id: 'P27', kind: 'T', tag: 'HV-112B', q: 'رمز الصمام على البطاقة', unit: '', truth: 'HV-112B', bot: 'HV-1128', cond: 'dirty', why: 'خلط بين الحرف B والرقم 8 في آخر الرمز' },
  { id: 'P28', kind: 'T', tag: 'PT-110', q: 'تاريخ المعايرة القادمة على الملصق', unit: '', t: 'CAL DUE 2027-03', truth: '2027-03', bot: '2027-03', cond: 'clean' },
  { id: 'P29', kind: 'T', tag: 'Q-101B', q: 'رقم تصريح العمل على بطاقة القفل', unit: '', t: 'PTW 2611-07', truth: '2611-07', bot: '2611-07', cond: 'clean' },
  { id: 'P30', kind: 'T', tag: 'F-24B', q: 'رمز المصهر على الملصق', unit: '', truth: 'غير مقروءة', bot: 'F-24B', cond: 'blur', why: 'صورة غير مقروءة: خمّن الرمز من السياق ولم يقل إنه لا يقرؤه' }
];
export const NAMEPLATES = {
  'P-101A': { MODEL: 'KS-250', kW: '75', RPM: '1480', 'S/N': 'KS250-A3127', YEAR: '2019', IP: '68' },
  'P-101B': { MODEL: 'HT-300', kW: '90', RPM: '1485', 'S/N': 'HT300-B8841', YEAR: '2026', IP: '68' },
  'P-101C': { MODEL: 'KS-250', kW: '75', RPM: '1480', 'S/N': 'KS250-C3129', YEAR: '2019', IP: '68' },
  'VFD-101B': { MODEL: 'DR-90', kW: '90', 'I max': '180', 'S/N': 'DR90-51720', YEAR: '2026', IP: '54' }
};
export const PID = [
  { id: 'Q01', q: 'كم مضخة تصب في خط الطرد المشترك؟', truth: '3', bot: '3' },
  { id: 'Q02', q: 'ما رمز مرسل الضغط على خط الطرد المشترك؟', truth: 'PT-110', bot: 'PT-110' },
  { id: 'Q03', q: 'ما رمز صمام الطرد للمضخة P-101B؟', truth: 'HV-112B', bot: 'HV-112B' },
  { id: 'Q04', q: 'هل الصمام HV-116B مفتوح عادةً أم مغلق عادةً؟', truth: 'مغلق عادةً', bot: 'مفتوح عادةً', why: 'رمز الصمام المغلق عادةً مظلَّل: لم يفرّق بين المظلَّل والفارغ' },
  { id: 'Q05', q: 'ما نوع الصمام NRV-103B؟', truth: 'صمام عدم رجوع', bot: 'صمام عدم رجوع' },
  { id: 'Q06', q: 'ما قطر خط الطرد المشترك؟', truth: 'DN400', bot: 'DN300', why: 'نص صغير على الخط: قرأ رقمًا آخر' },
  { id: 'Q07', q: 'أي جهاز يقيس مستوى بئر التجميع؟', truth: 'LT-101', bot: 'LT-101' },
  { id: 'Q08', q: 'أي صمام يعزل سحب المضخة P-101C؟', truth: 'HV-111C', bot: 'HV-111C' },
  { id: 'Q09', q: 'في اتجاه الجريان على خط الطرد المشترك: أيهما أولًا، PT-110 أم FT-120؟', truth: 'PT-110', bot: 'FT-120', why: 'لم يتبع سهم الجريان: رتّب الجهازين كما يُقرأ الرسم من اليسار' },
  { id: 'Q10', q: 'ما رمز صمام التنفيس على المضخة P-101A؟', truth: 'HV-115A', bot: 'HV-116A', why: 'خلط بين رمزين متجاورين: التنفيس 115 والتصريف 116' }
];

// ---------------------------------------------------------------- capstone: three voice notes
// say: the note in spoken words, kept for a recording made later with a voice whose licence allows
// publication (none ships now). text: the note as said, in figures; the course gives this page in
// place of audio. fields: the report a careful person writes.
// heard: the recorded transcript of a speech model, with planted errors; draft: Mikshaf's report
// from that transcript. Form 1 is the baseline, done by hand: no transcript, no draft.
const F = (asset, pressure, vibration, temp, level, finding, severity, action, permit) => ({ asset, pressure, vibration, temp, level, finding, severity, action, permit });
export const FIELDS = { asset: 'رمز المعدة', pressure: 'ضغط الطرد (bar)', vibration: 'الاهتزاز (mm/s)', temp: 'حرارة المحمل (°C)', level: 'مستوى بئر التجميع (m)', finding: 'الملاحظة', severity: 'الخطورة', action: 'الإجراء المطلوب', permit: 'هل يحتاج إلى تصريح عمل؟' };
export const NOTES = [
  {
    n: 1,
    say: ['جولة الفحص اليومية، محطة الربوة.', 'المضخة بي واحد صفر واحد إيه.', 'ضغط الطرد أربعة فاصلة ستة بار.', 'الاهتزاز ثلاثة فاصلة واحد ملي متر في الثانية.', 'حرارة المحمل ثمانية وخمسون درجة.', 'مستوى بئر التجميع اثنان فاصلة أربعة متر.', 'يوجد تسرب خفيف من مانع التسرب، نحو عشر قطرات في الدقيقة.', 'الخطورة متوسطة.', 'المطلوب تغيير مانع التسرب في الصيانة القادمة.', 'نعم، يحتاج إلى تصريح عمل وعزل.'],
    text: 'جولة الفحص اليومية، محطة الربوة. المضخة P-101A. ضغط الطرد 4.6 bar. الاهتزاز 3.1 mm/s. حرارة المحمل 58 درجة. مستوى بئر التجميع 2.4 m. يوجد تسرب خفيف من مانع التسرب، نحو عشر قطرات في الدقيقة. الخطورة متوسطة. المطلوب تغيير مانع التسرب في الصيانة القادمة. نعم، يحتاج إلى تصريح عمل وعزل.',
    fields: F('P-101A', '4.6', '3.1', '58', '2.4', 'تسرب خفيف من مانع التسرب، نحو عشر قطرات في الدقيقة', 'متوسطة', 'تغيير مانع التسرب في الصيانة القادمة', 'نعم')
  },
  {
    n: 2,
    say: ['جولة الفحص اليومية، محطة الربوة.', 'المضخة بي واحد صفر واحد سي.', 'ضغط الطرد خمسة فاصلة واحد بار.', 'الاهتزاز ستة فاصلة ثمانية ملي متر في الثانية، وهذا أعلى من الحد.', 'حرارة المحمل أربعة وسبعون درجة.', 'مستوى بئر التجميع واحد فاصلة تسعة متر.', 'صوت خشن من المحمل الأمامي، ولا يوجد تسرب من مانع التسرب.', 'الخطورة عالية.', 'المطلوب إيقاف المضخة وتشغيل الاحتياطية، ثم فحص المحمل.', 'نعم، يحتاج إلى تصريح عمل وعزل.'],
    text: 'جولة الفحص اليومية، محطة الربوة. المضخة P-101C. ضغط الطرد 5.1 bar. الاهتزاز 6.8 mm/s، وهذا أعلى من الحد. حرارة المحمل 74 درجة. مستوى بئر التجميع 1.9 m. صوت خشن من المحمل الأمامي، ولا يوجد تسرب من مانع التسرب. الخطورة عالية. المطلوب إيقاف المضخة وتشغيل الاحتياطية، ثم فحص المحمل. نعم، يحتاج إلى تصريح عمل وعزل.',
    fields: F('P-101C', '5.1', '6.8', '74', '1.9', 'صوت خشن من المحمل الأمامي، ولا تسرب من مانع التسرب', 'عالية', 'إيقاف المضخة وتشغيل الاحتياطية، ثم فحص المحمل', 'نعم'),
    heard: 'جولة الفحص اليومية محطة الربوة المضخة P-101B ضغط الطرد 5.1 بار الاهتزاز 6.8 ملي متر في الثانية وهذا أعلى من الحد حرارة المحمل 47 درجة مستوى بئر التجميع 1.9 متر صوت خشن من المحمل الأمامي ويوجد تسرب من مانع التسرب الخطورة عالية المطلوب إيقاف المضخة وتشغيل الاحتياطية ثم فحص المحمل نعم يحتاج إلى تصريح عمل وعزل وتم إبلاغ غرفة التحكم بذلك',
    heardFaults: ['الرمز: P-101C صار P-101B', 'الحرارة: 74 صارت 47', 'سقط النفي: «لا يوجد تسرب» صارت «يوجد تسرب»', 'جملة لم تُقل: «وتم إبلاغ غرفة التحكم بذلك»'],
    draft: F('P-101B', '5.1', '6.8', '47', '1.9', 'صوت خشن من المحمل الأمامي، وتسرب من مانع التسرب. أُبلغت غرفة التحكم', 'متوسطة', 'إيقاف المضخة وتشغيل الاحتياطية، ثم فحص المحمل', 'نعم'),
    draftWrong: ['asset', 'temp', 'finding', 'severity']
  },
  {
    n: 3,
    say: ['جولة الفحص اليومية، محطة الربوة.', 'المضخة بي واحد صفر واحد بي.', 'ضغط الطرد أربعة فاصلة تسعة بار.', 'الاهتزاز اثنان فاصلة أربعة ملي متر في الثانية.', 'حرارة المحمل واحد وستون درجة.', 'مستوى بئر التجميع ثلاثة فاصلة صفر متر.', 'ضغط سائل الحاجز واحد فاصلة ستة بار، أقل من المسموح.', 'الخطورة متوسطة.', 'المطلوب تعبئة سائل الحاجز وفحص الخط.', 'لا يحتاج إلى تصريح عمل، المضخة تبقى في الخدمة.'],
    text: 'جولة الفحص اليومية، محطة الربوة. المضخة P-101B. ضغط الطرد 4.9 bar. الاهتزاز 2.4 mm/s. حرارة المحمل 61 درجة. مستوى بئر التجميع 3.0 m. ضغط سائل الحاجز 1.6 bar، أقل من المسموح. الخطورة متوسطة. المطلوب تعبئة سائل الحاجز وفحص الخط. لا يحتاج إلى تصريح عمل، المضخة تبقى في الخدمة.',
    fields: F('P-101B', '4.9', '2.4', '61', '3.0', 'ضغط سائل الحاجز 1.6 bar، أقل من المسموح', 'متوسطة', 'تعبئة سائل الحاجز وفحص الخط', 'لا'),
    heard: 'جولة الفحص اليومية محطة الربوة المضخة P-101B ضغط الطرد 4.9 بار الاهتزاز 24 ملي متر في الثانية حرارة المحمل 61 درجة مستوى بئر التجميع 3.0 متر ضغط سائل الحاجز 1.6 بار أقل من المسموح الخطورة متوسطة المطلوب تعبئة سائل الحاجز وفحص الخط يحتاج إلى تصريح عمل المضخة تبقى في الخدمة',
    heardFaults: ['الاهتزاز: 2.4 صارت 24 (سقطت الفاصلة)', 'سقط النفي: «لا يحتاج إلى تصريح» صارت «يحتاج إلى تصريح»'],
    draft: F('P-101B', '4.9', '24', '61', '3.0', 'ضغط سائل الحاجز 1.6 psi، أقل من المسموح', 'متوسطة', 'تعبئة سائل الحاجز وفحص الخط', 'نعم'),
    draftWrong: ['vibration', 'finding', 'permit']
  }
];
