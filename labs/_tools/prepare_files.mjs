// Writes the file pack of the course into labs/files/ and the reference answers into
// labs/solutions/reference/, from the tables of world.mjs.
//
//   node labs/_tools/prepare_files.mjs
//
// The same bytes on every run: nothing reads a clock or the network. The pictures (render.mjs)
// are made separately, once, and committed. The voice notes are given as text, as said: the
// course ships no audio. A first version spoke them with a Windows built-in voice, whose terms
// do not clearly allow publishing its output; it was removed, and no licensed voice was sought.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as W from './world.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILES = path.join(HERE, '..', 'files');
const REF = path.join(HERE, '..', 'solutions', 'reference');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const en = s => `<span class="ltr">${esc(s)}</span>`;
// Latin runs (tags, units, numbers with units) are set apart so that an Arabic line keeps its order
const bidi = s => esc(s).replace(/(\d+(?:\.\d+)? ?(?:bar|psi|kg|kW|kPa|Hz|mm\/s|ppm|min|rpm|N·m|lbf·ft|m|V|A|L)(?![A-Za-z])|[A-Za-z][A-Za-z0-9·³°/.-]*(?: [A-Z0-9][A-Za-z0-9-]*)*)/g, m => { const t = m.replace(/[.-]+$/, ''); return '<span class="ltr">' + t + '</span>' + m.slice(t.length); });

const CSS = `body{font-family:"IBM Plex Sans Arabic","Segoe UI",Tahoma,sans-serif;max-width:50rem;margin:0 auto;padding:1rem;line-height:1.85;color:#1e2a36;background:#fbfaf7}
.bar{font-size:.85rem;background:#eef2f4;border:1px solid #d5dde2;border-radius:.4rem;padding:.4rem .8rem}
h1{font-size:1.4rem;line-height:1.5;margin:.8rem 0}h2{font-size:1.12rem;margin:1.4rem 0 .3rem}h3{font-size:1rem;margin:1rem 0 .2rem}
.meta{color:#5b6773;font-size:.9rem}.stamp{border:1px solid #b45309;color:#7c2d12;background:#fff7ed;padding:.4rem .7rem;border-radius:.3rem;font-size:.95rem}
.ok{border:1px solid #0f766e;color:#134e4a;background:#f0fdfa;padding:.4rem .7rem;border-radius:.3rem;font-size:.95rem}
table{border-collapse:collapse;width:100%;font-size:.95rem}td,th{border:1px solid #cfd8dc;padding:.35rem .5rem;text-align:start;vertical-align:top}th{background:#eef2f4}
li{margin:.35rem 0}.s{font-size:.85rem;color:#5b6773}.ltr{direction:ltr;unicode-bidi:isolate;display:inline-block}.scroll{overflow-x:auto}
.warn{border-inline-start:4px solid #b91c1c;background:#fef2f2;padding:.4rem .8rem;margin:.6rem 0}.cite{font-size:.82rem;color:#5b6773;display:block}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr));gap:1rem}.grid figure{margin:0;border:1px solid #d5dde2;border-radius:.4rem;padding:.5rem;background:#fff}.grid img,.wide img{max-width:100%;height:auto;display:block}
blockquote{margin:.6rem 0;padding:.3rem .9rem;border-inline-start:4px solid #94a3b8;background:#f1f5f9}audio{width:100%}`;
const page = (title, inner, bar = `ملف تدريبي اصطناعي · ${W.ORG.ar} · ${W.ORG.station}`) => `<!doctype html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><style>${CSS}</style></head>
<body>
<div class="bar">${esc(bar)}</div>
<h1>${esc(title)}</h1>
${inner}
</body>
</html>
`;
const csv = rows => '﻿' + rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n') + '\n';
const table = (head, rows) => `<div class="scroll"><table><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>`;
let count = 0;
function write(rel, text, base = FILES) { const f = path.join(base, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text, 'utf8'); count++; }
const json = o => JSON.stringify(o, null, 2) + '\n';
const P = W.PEOPLE;

// ------------------------------------------------------------------ the case
write('case/station_brief.html', page('محطة ضخ الربوة PS-07: ملخص الحالة', `
<p>${W.ORG.ar} شركة افتراضية. محطة ضخ الربوة ترفع مياه الصرف من بئر التجميع إلى خط الدفع بثلاث مضخات، تعمل منها اثنتان وتبقى الثالثة احتياطية. كل ما في هذه الملفات اصطناعي: لا محطة حقيقية، ولا أشخاص حقيقيون.</p>
<h2>المعدات ورموزها</h2>
${table(['الرمز', 'المعدة'], [
    ['P-101A، P-101B، P-101C', 'المضخات الثلاث. استُبدلت P-101B في مارس 2026 بطراز أكبر (نموذج التغيير MOC-2026-014)'],
    ['VFD-101A/B/C', 'مغيّرات السرعة'], ['HV-111x، HV-112x', 'صمام السحب وصمام الطرد لكل مضخة'], ['HV-115x، HV-116x', 'صمام التنفيس وصمام تصريف جسم المضخة'],
    ['NRV-103x', 'صمام عدم الرجوع'], ['LT-101، PT-110، FT-120', 'مرسل مستوى بئر التجميع، ومرسل ضغط خط الطرد، ومقياس التدفق'], ['AT-130، FAN-140', 'كاشف كبريتيد الهيدروجين، ومروحة التهوية'],
    ['Q-101B، F-24B', 'قاطع المضخة P-101B في لوحة MCC، ومصهر دائرة التحكم في لوحة UPS-2']
  ].map(r => [en(r[0]), bidi(r[1])]))}
<h2>الأشخاص</h2>
${table(['الاسم', 'الدور'], Object.values(P).map(p => [p.ar, p.role]))}
<h2>المساعد</h2>
<p>«${W.ORG.bot}» مساعد الشركة المعتمد: يجيب من مجموعة وثائق المحطة ويذكر مصدر كل جواب، ويقرأ الصور، ويفرّغ الملاحظات الصوتية. مخرجاته في هذه الملفات جلسات مسجلة كتبها مؤلف المقرر وزرع فيها أخطاء من النوع الذي تقع فيه المساعدات. لم يُشغَّل عليها نموذج.</p>`));

write('case/ai_use_card.html', page('بطاقة استخدام الذكاء الاصطناعي في أفلاج', `
<p class="meta">وثيقة داخلية اصطناعية · تعتمدها ${P.hse.ar}، ${P.hse.role}</p>
<h2>1 · المستوى يحدده ما يحدث بالمخرج</h2>
${table(['المستوى', 'الاسم', 'القاعدة'], Object.values(W.TIERS).map(t => [`<b>${t.ar}</b>`, t.name, t.rule]))}
<p class="warn">قائمة «لا يقود الفعل أبدًا» في المحطة: تغيير نقطة ضبط أو تجاوز إنذار؛ وتشغيل معدة أو إيقافها؛ ونقاط العزل والقفل؛ وقرار دخول مكان محصور وقراءة كاشف الغاز له؛ وإصدار تصريح العمل أو إغلاقه.</p>
<h2>2 · التحقق اللازم</h2>
${table(['الرمز', 'التحقق'], Object.entries(W.CHECKS).map(([k, v]) => [en(k), v]))}
<p>المستوى أ يكفيه <span class="ltr">V1</span>. المستوى ب يحتاج إلى <span class="ltr">V2</span> أو <span class="ltr">V3</span> أو <span class="ltr">V4</span> بحسب نوع المخرج، ويعتمده شخص مختص يُكتب اسم وظيفته. المستوى ج له <span class="ltr">V5</span> دائمًا.</p>
<h2>3 · مستوى تصنيف الوثيقة يحدد الأداة</h2>
${table(['الوثيقة', 'المستوى في أفلاج'], [
    ['نشرات السلامة العامة المنشورة', 'عام'], ['الأدلة التشغيلية والإجراءات وسجلات الصيانة وصور الفحص ومذكرات الوردية', 'مقيد'],
    ['مخطط الأنابيب والأجهزة، وقوائم نقاط الضبط، ومخططات شبكة التحكم، وشهادات العزل', 'سري'], ['ما تصنفه الجهة المختصة فوق ذلك', 'سري للغاية']
  ])}
${table(['الأداة', 'أعلى مستوى يدخلها'], Object.values(W.TOOLS).map(t => [t.name, t.max]).concat([['لا أداة ذكاء اصطناعي', 'سري للغاية']]))}
<p class="s">المستويات الأربعة هي مستويات سياسة تصنيف البيانات الوطنية. توزيع وثائق المحطة عليها قرار اصطناعي لهذه الحالة: في جهتك يقرره صاحب البيانات. والنموذج المحلي يحل مسألة أين تذهب الوثيقة، ولا يحل مسألة صحة الجواب.</p>`));

// ------------------------------------------------------------------ lab 1.1
write('uses/twelve_uses.html', page('اثنا عشر استخدامًا ميدانيًّا للذكاء الاصطناعي', `
<p>اثنا عشر استخدامًا جُمعت من أسبوع واحد في المحطة، من حديث السلامة قبل العمل إلى تغيير نقطة ضبط. صنّف كل واحد منها ببطاقة الاستخدام، دون أي مساعد.</p>
${table(['#', 'الاستخدام'], W.USES.map(u => [en(u.id), bidi(u.text)]))}`));
write('start/risk_tier_table.csv', csv([['الرمز', 'الاستخدام', 'المستوى (أ، ب، ج)', 'التحقق (V1 إلى V5)', 'من يعتمد', 'مستوى تصنيف الوثيقة', 'أعلى أداة مسموحة'], ...W.USES.map(u => [u.id, u.text, '', '', '', '', ''])]));
write('D1_1_key.json', json(W.USES.map(({ id, tier, check, signer, level, tool, why }) => ({ id, tier, check, signer, level, tool, why }))), REF);
write('D1_1_risk_tier_table.csv', csv([['الرمز', 'الاستخدام', 'المستوى (أ، ب، ج)', 'التحقق (V1 إلى V5)', 'من يعتمد', 'مستوى تصنيف الوثيقة', 'أعلى أداة مسموحة'], ...W.USES.map(u => [u.id, u.text, W.TIERS[u.tier].ar, u.check, u.signer, u.level, W.TOOLS[u.tool].name])]), REF);

// ------------------------------------------------------------------ lab 1.2
const fact = (k, rev) => { const f = W.FACTS.find(x => x.k === k); const v = rev === 'C' ? f.c : f.d; return `<span class="ltr" data-k="${k}" data-v="${v}" data-u="${f.u}">${v} ${f.u}</span>`; };
function manual(rev) {
  const D = rev === 'D';
  const row = k => { const f = W.FACTS.find(x => x.k === k); return (rev === 'C' ? f.c : f.d) === null ? '' : `<tr><td>${bidi(f.label)}</td><td>${fact(k, rev)}</td></tr>`; };
  const iso = W.ISOLATION[rev.toLowerCase()];
  return page(`الدليل التشغيلي لمحطة ضخ الربوة · الفصل 4: المضخة P-101B · المراجعة ${rev}`, `
${D ? `<p class="ok" data-rev="D" data-status="current">المراجعة <span class="ltr">D</span> · سارية · صدرت في مارس 2026 بعد نموذج التغيير <span class="ltr">MOC-2026-014</span></p>` : `<p class="stamp" data-rev="C" data-status="superseded">المراجعة <span class="ltr">C</span> · ملغاة · حلّت محلها المراجعة <span class="ltr">D</span> في مارس 2026. تبقى في الأرشيف للرجوع إليها فقط.</p>`}
<h2 id="s4-1">4.1 بيانات المضخة</h2>
<table><tr><td>الطراز</td><td>${en(D ? 'HT-300' : 'KS-250')}</td></tr>${row('motor_kw')}${row('weight')}<tr><td>مانع التسرب</td><td>${D ? 'ميكانيكي مزدوج بسائل حاجز' : 'ميكانيكي مفرد'}</td></tr><tr><td>التشغيل</td><td>${bidi(D ? 'مغيّر السرعة VFD-101B، طراز DR-90' : 'مغيّر السرعة VFD-101B، الطراز السابق')}</td></tr></table>
<h2 id="s4-2">4.2 حدود التشغيل</h2>
<table>${row('low_level_trip')}${row('max_pressure')}${row('barrier_pressure')}${row('vibration')}</table>
<p class="warn" data-forbid="dry_run">لا تُشغَّل المضخة جافة ولو لثوانٍ: التشغيل الجاف يتلف مانع التسرب.</p>
<p>نقاط الضبط لا تُعدَّل من الميدان. أي فرق بين الشاشة وهذا الجدول يُبلَّغ لمهندسة الأجهزة والتحكم.</p>
<h2 id="s4-3">4.3 العزل</h2>
<p>نقاط العزل الكهربائي: ${iso.map(p => `<span class="ltr" data-iso="${p}">${p}</span>`).join(' و')}. ${bidi(D ? 'Q-101B قاطع المضخة في لوحة MCC، وF-24B مصهر دائرة التحكم 24 V في لوحة UPS-2: مغيّر السرعة الجديد يتغذى من مصدرين.' : 'Q-101B قاطع المضخة في لوحة MCC.')}</p>
<p>الترتيب، ولا يُغيَّر:</p>
<ol>
<li data-seq="isolate">اعزل: افتح نقاط العزل كلها.</li>
<li data-seq="lock">اقفل كل نقطة عزل وعلّق بطاقة التحذير.</li>
<li data-seq="wait">انتظر ${fact('wait', rev)} حتى تتفرغ مكثفات مغيّر السرعة.</li>
<li data-seq="test">تحقق من انعدام الجهد على أطراف المحرك بجهاز فحص مجرَّب.</li>
</ol>
<p>العزل الميكانيكي: أغلق صمام السحب ${en(W.VALVES.suction)} وصمام الطرد ${en(W.VALVES.discharge)} وأقفلهما.</p>
<h2 id="s4-4">4.4 تصريف جسم المضخة</h2>
<p>افتح صمام تصريف جسم المضخة ${`<span class="ltr" data-k="drain_valve" data-v="${W.VALVES.drain}">${W.VALVES.drain}</span>`} (<span class="ltr">drain valve</span>) إلى حوض التصريف المغلق.</p>
${D ? `<p class="warn" data-require="gas_test" data-before="drain">قبل فتح التصريف: مروحة التهوية <span class="ltr">FAN-140</span> تعمل، وقراءة الكاشف المحمول لكبريتيد الهيدروجين أقل من ${fact('gas_limit', 'D')}. جسم المضخة قد يحبس غازًا.</p>` : '<p>تأكد من تهوية الغرفة.</p>'}
<h2 id="s4-5">4.5 الرفع وإعادة التركيب</h2>
<table>${row('lift_rating')}${row('torque')}</table>
<h2 id="s4-6">4.6 الإعادة إلى الخدمة</h2>
<ol>
${D ? `<li>تحقق من مستوى سائل الحاجز ومن ضغطه: ${fact('barrier_pressure', 'D')}.</li>` : ''}
<li>افتح صمام السحب ${en(W.VALVES.suction)} كاملًا.</li>
${D ? `<li>نفّس الهواء من صمام التنفيس ${en(W.VALVES.vent)} (<span class="ltr">vent valve</span>) حتى يخرج السائل.</li>` : ''}
<li>افتح صمام الطرد <span class="ltr" data-k="discharge_valve" data-v="${W.VALVES.discharge}">${W.VALVES.discharge}</span> (<span class="ltr">discharge valve</span>) ببطء.</li>
<li>أزل الأقفال وفق تصريح العمل، وأعد نقاط العزل كلها.</li>
<li>شغّل على ${fact('start_hz', rev)} لمدة دقيقتين، وراقب ضغط الطرد والاهتزاز على حدود القسم 4.2.</li>
</ol>`, `ملف تدريبي اصطناعي · ${W.ORG.ar} · وثيقة مقيدة`);
}
write('docs/manual_rev_c.html', manual('C'));
write('docs/manual_rev_d.html', manual('D'));
write('docs/moc_2026_014.html', page('نموذج تغيير MOC-2026-014: استبدال المضخة P-101B', `
<table>
<tr><th>سبب التغيير</th><td>تسرب متكرر من مانع التسرب الميكانيكي في المضخة <span class="ltr">P-101B</span> منذ يونيو 2025 (سجل الصيانة).</td></tr>
<tr><th>التغيير</th><td>استبدال المضخة بطراز <span class="ltr">HT-300</span> بمحرك <span class="ltr">90 kW</span> ومانع تسرب مزدوج بسائل حاجز، واستبدال مغيّر السرعة بطراز <span class="ltr">DR-90</span>.</td></tr>
<tr><th>أهم ما تغيّر</th><td>قدرة المحرك ووزن المضخة؛ وحد الإيقاف عند المستوى المنخفض؛ وأقصى ضغط طرد؛ ودائرة سائل الحاجز؛ وتغذية مغيّر السرعة. <b>هذه القائمة ملخص: القيم كلها في المراجعة <span class="ltr">D</span> من الدليل، الفصل 4.</b></td></tr>
<tr><th>الوثائق المتأثرة</th><td>الدليل التشغيلي، الفصل 4: صدرت المراجعة <span class="ltr">D</span>. الإجراء <span class="ltr">SOP-M-014</span> (عزل المضخة وإعادتها إلى الخدمة): المراجعة 3 مبنية على المراجعة <span class="ltr">C</span> من الدليل، ويلزم تحديثها إلى المراجعة 4. مخطط الأنابيب والأجهزة: حُدِّث.</td></tr>
<tr><th>الموافقات</th><td>${P.hse.ar} (السلامة): موافقة. ${P.ic.ar} (الأجهزة والتحكم): موافقة، ونقاط الضبط أُدخلت. ${P.ops.ar} (التشغيل): موافقة.</td></tr>
<tr><th>اعتماد الإجراء المحدَّث</th><td>يراجعه ${P.hse.ar} و${P.ops.ar}، ولا يُعمل به قبل توقيعهما. ${P.doc.ar} تسحب المراجعة 3 من الميدان عند الاعتماد.</td></tr>
</table>`, `ملف تدريبي اصطناعي · ${W.ORG.ar} · وثيقة مقيدة`));
const SOP3 = ['احصل على تصريح العمل من مشرف التشغيل، وسجّل رقمه.', 'أوقف المضخة P-101B من لوحة التشغيل.', 'اعزل كهربائيًّا: افتح القاطع Q-101B في لوحة MCC.', 'ضع القفل وبطاقة التحذير على القاطع Q-101B.', 'انتظر 5 min قبل فتح صندوق الأطراف.', 'تحقق من انعدام الجهد بجهاز فحص مجرَّب.',
  'أغلق صمام السحب HV-111B وصمام الطرد HV-112B وأقفلهما.', 'افتح صمام تصريف جسم المضخة HV-116B إلى الحوض المغلق، وتأكد من تهوية الغرفة.', 'افصل القارنة وارفع المضخة بمعدة رفع لا تقل حمولتها عن 750 kg.', 'بعد الإصلاح: شدّ مسامير القارنة بعزم 85 N·m.',
  'افتح صمام السحب HV-111B كاملًا، ثم صمام الطرد HV-112B ببطء.', 'أزل الأقفال وفق تصريح العمل، وأغلق القاطع Q-101B.', 'شغّل على 25 Hz لمدة دقيقتين، وتأكد أن ضغط الطرد لا يتجاوز 4.5 bar.', 'أغلق تصريح العمل، وسلّم المضخة لمشرف التشغيل.'];
write('docs/sop_m014_rev3.html', page('الإجراء SOP-M-014: عزل المضخة P-101B وإعادتها إلى الخدمة · المراجعة 3', `
<p class="stamp">المراجعة 3 · مبنية على المراجعة <span class="ltr">C</span> من الدليل · قيد التحديث بعد نموذج التغيير <span class="ltr">MOC-2026-014</span></p>
<ol>${SOP3.map(s => `<li>${bidi(s)}</li>`).join('\n')}</ol>`, `ملف تدريبي اصطناعي · ${W.ORG.ar} · وثيقة مقيدة`));
write('runs/mikshaf_sop_draft.html', page('مسودة «مِكشاف»: الإجراء SOP-M-014، المراجعة 4', `
<p class="stamp">جلسة مسجلة · مسودة من المساعد لم تُراجَع · كتبها مؤلف المقرر وفيها أخطاء مزروعة. لم يُشغَّل عليها نموذج.</p>
<blockquote><b>الطلب:</b> حدّث الإجراء <span class="ltr">SOP-M-014</span> ليوافق نموذج التغيير <span class="ltr">MOC-2026-014</span> والدليل التشغيلي. اذكر مصدر كل خطوة.<br><b>مجموعة الوثائق:</b> نموذج التغيير، والإجراء (المراجعة 3)، والدليل: المراجعة <span class="ltr">C</span> والمراجعة <span class="ltr">D</span>.</blockquote>
<p>حدّثتُ الإجراء وفق المراجعة السارية من الدليل. الخطوات الثماني عشرة التالية جاهزة للاعتماد:</p>
<ol>
${W.DRAFT.map((s, i) => `<li data-step="${i + 1}" data-act="${s.act}"${s.iso ? ` data-iso="${s.iso.join(' ')}"` : ''}${s.valve ? ` data-k="discharge_valve" data-v="${s.valve}"` : ''}${(s.facts || []).map((f, j) => ` data-f${j}="${f.join('|')}"`).join('')}>${bidi(s.t)}<span class="cite">المصدر: ${bidi(s.cite)}</span></li>`).join('\n')}
</ol>
<p>راجعتُ الخطوات كلها على الدليل، وهي مطابقة للمراجعة <span class="ltr">D</span>.</p>`, `جلسة مسجلة اصطناعية · المساعد «${W.ORG.bot}»`));
write('runs/mikshaf_tutor_run.html', page('جلسة مسجلة: «مِكشاف» مرشدًا في أثناء تأشير التعديلات', `
<p class="stamp">جلسة مسجلة اصطناعية · في هذا الوضع يسأل المساعد عن المخاطر ولا يكتب خطوة ولا قيمة.</p>
<blockquote><b>الطلب:</b> أراجع مسودة إجراء لعزل مضخة صرف صحي وإعادتها إلى الخدمة بعد استبدالها. كن مرشدًا: اسألني عن المخاطر سؤالًا سؤالًا، ولا تكتب أي خطوة ولا أي قيمة، ولا تقل لي هل جوابي صحيح قبل أن أذكر أين وجدته في الدليل.</blockquote>
<ol>
<li>كم مصدرًا للطاقة يغذي هذه المضخة ومغيّر سرعتها؟ وأين قرأت ذلك في المراجعة السارية؟</li>
<li>بعد فتح القاطع، ما الذي يبقى مشحونًا؟ وكم يطلب الدليل أن تنتظر؟</li>
<li>متى يكون فحص انعدام الجهد دليلًا، ومتى لا يثبت شيئًا؟</li>
<li>ما الذي قد يخرج من جسم المضخة حين تفتح تصريفه؟ وما الذي يطلبه الدليل قبل ذلك؟</li>
<li>كم تزن المضخة الجديدة؟ وهل تكفيها معدة الرفع التي كانت تكفي القديمة؟</li>
<li>في المسودة صمامان بكلمة «التصريف». ما رمز كل منهما، وما وظيفته في الدليل؟</li>
<li>هل في المسودة خطوة لا تجدها في أي قسم من الدليل؟ وماذا يقول الدليل عنها؟</li>
</ol>`, `جلسة مسجلة اصطناعية · المساعد «${W.ORG.bot}»`));
const RH = ['الخطوة', 'نص المسودة', 'القسم في المراجعة D', 'الحكم (مطابق، قيمة، وحدة، ترتيب، ناقص، رمز، لا مصدر)', 'التصحيح', 'الخطر'];
write('start/redline_table.csv', csv([RH, ...W.DRAFT.map((s, i) => [i + 1, s.t, '', '', '', '']), ['', 'ما في المراجعة D ولا خطوة له في المسودة:', '', '', '', '']]));
const faultOf = i => Object.entries(W.FAULTS).find(([, f]) => f.step === i + 1);
write('D1_2_redline_table.csv', csv([RH, ...W.DRAFT.map((s, i) => { const f = faultOf(i); return [i + 1, s.t, '', f ? f[1].kind : 'مطابق', f ? f[1].fix : '', f ? f[1].hazard : '']; })]), REF);
write('D1_2_faults.json', json(W.FAULTS), REF);

// ------------------------------------------------------------------ lab 2.1
const LOG = W.buildLog();
const { seed: SEED, sample: SAMPLE } = W.drawSample(LOG);
write('logs/maintenance_log.csv', csv([['wo_id', 'date', 'asset', 'text', 'downtime_h'], ...LOG.map(x => [x.id, x.date, x.asset, x.text, x.down])]));
write('runs/mikshaf_coding.csv', csv([['wo_id', 'date', 'asset', 'text', 'downtime_h', 'mikshaf_code'], ...LOG.map(x => [x.id, x.date, x.asset, x.text, x.down, x.bot])]));
write('start/sample_50.csv', csv([['wo_id', 'date', 'asset', 'text', 'mikshaf_code', 'my_code', 'agree'], ...SAMPLE.map(x => [x.id, x.date, x.asset, x.text, x.bot, '', ''])]));
write('start/fault_table.csv', csv([['asset', 'code', 'count', 'max_in_90_days', 'recurring', 'rows_checked_by'], ['', '', '', '', '', '']]));
write('logs/codebook.html', page('دليل ترميز سجلات الصيانة', `
<p class="meta">تعتمده ${P.plan.ar}، ${P.plan.role}</p>
${table(['الرمز', 'المعنى'], Object.entries(W.CODES).map(([k, v]) => [en(k), v]))}
<h2>قواعد</h2>
<ul>
<li>الرمز للعطل الذي وقع، لا للكلمة التي وردت: «لا يوجد تسرب» في فحص دوري ليس تسربًا.</li>
<li>فصل الحماية الحرارية للمحرك <span class="ltr">ELEC</span>. <span class="ltr">OVH</span> لحرارة قيست وكُتبت قيمتها.</li>
<li>الفنيون يكتبون بالعربية والإنجليزية وبلغة الورشة: «بيرنق» و«رمان بلي» محمل، و«سيل» مانع تسرب.</li>
<li><b>العطل المتكرر:</b> الرمز نفسه في المعدة نفسها ${W.RECUR.min} مرات أو أكثر خلال أي ${W.RECUR.window} يومًا.</li>
<li>السجل من 1 أكتوبر 2024 إلى 30 سبتمبر 2026: ${LOG.length} أمر عمل.</li>
</ul>`));
const key = k => W.CHAT_COUNTS.map(c => c[k]);
write('runs/mikshaf_counts_chat.html', page('جلسة مسجلة: سؤال «مِكشاف» عن الأعداد مباشرة', `
<p class="stamp">جلستان مسجلتان اصطناعيتان · السؤال نفسه مرتين على ملف السجل نفسه · الأرقام مزروعة. لم يُشغَّل عليها نموذج.</p>
<blockquote><b>السؤال:</b> من ملف سجل الصيانة المرفق: كم مرة تسرب مانع التسرب في <span class="ltr">P-101B</span>؟ وكم مرة انسدت <span class="ltr">P-101C</span>؟ وكم عطل محامل في <span class="ltr">P-101A</span>؟ وكم عطلًا في مرسل المستوى <span class="ltr">LT-101</span>؟</blockquote>
${table(['المعدة والعطل', 'جواب الجلسة الأولى', 'جواب الجلسة الثانية'], [['P-101B · SEAL', 'P-101B|SEAL'], ['P-101C · BLK', 'P-101C|BLK'], ['P-101A · BRG', 'P-101A|BRG'], ['LT-101 · INST', 'LT-101|INST']].map(([l, k]) => [en(l), ...key(k)]))}
<p>في الجلستين ختم المساعد جوابه بالجملة نفسها: «عددتُ الصفوف كلها بعناية، والأرقام دقيقة».</p>`, `جلسة مسجلة اصطناعية · المساعد «${W.ORG.bot}»`));
const TRUE = W.countFaults(LOG, 'code'), BOT = W.countFaults(LOG, 'bot');
write('D2_1_true_codes.csv', csv([['wo_id', 'date', 'asset', 'text', 'true_code', 'mikshaf_code'], ...LOG.map(x => [x.id, x.date, x.asset, x.text, x.code, x.bot])]), REF);
write('D2_1_sample_key.csv', csv([['wo_id', 'text', 'mikshaf_code', 'true_code', 'agree'], ...SAMPLE.map(x => [x.id, x.text, x.bot, x.code, x.bot === x.code ? 'yes' : 'no'])]), REF);
write('D2_1_fault_table.csv', csv([['asset', 'code', 'count', 'max_in_90_days', 'recurring', 'count_from_mikshaf_coding'], ...TRUE.filter(x => x.recurring || x.n >= 6).map(x => [x.asset, x.code, x.n, x.window, x.recurring ? 'yes' : 'no', (BOT.find(b => b.asset === x.asset && b.code === x.code) || { n: 0 }).n])]), REF);
const wrong = LOG.filter(x => x.bot !== x.code);
const patterns = {}; for (const x of wrong) patterns[x.code + '>' + x.bot] = (patterns[x.code + '>' + x.bot] || 0) + 1;
write('D2_1_numbers.json', json({
  entries: LOG.length, miscoded: wrong.length, patterns, sample_seed: SEED, sample_size: SAMPLE.length, sample_disagreements: SAMPLE.filter(x => x.bot !== x.code).map(x => x.id),
  true_counts: Object.fromEntries(TRUE.map(x => [x.asset + '|' + x.code, [x.n, x.window, x.recurring]])), mikshaf_counts: Object.fromEntries(BOT.map(x => [x.asset + '|' + x.code, [x.n, x.window, x.recurring]])), chat: W.CHAT_COUNTS
}), REF);

// ------------------------------------------------------------------ lab 2.2
const fmt = v => typeof v === 'number' ? String(v) : v;
write('photos/index.html', page('صور الفحص الثلاثون', `
<p>ثلاثون صورة من جولة فحص في المحطة، لكل منها سؤال واحد وقيمة معروفة قرأها شخصان من المعدة نفسها. الصور رسوم تؤدي دور الصور الفوتوغرافية.</p>
<div class="grid">
${W.PHOTOS.map(p => `<figure><img src="${p.id}.png" width="640" height="480" alt="${esc(W.KINDS[p.kind])}، ${p.tag}: ${esc(p.q)}"><figcaption>${en(p.id)} · ${esc(W.KINDS[p.kind])} · ${bidi(p.q)}${p.unit ? ` (${en(p.unit)})` : ''}</figcaption></figure>`).join('\n')}
</div>`, `ملف تدريبي اصطناعي · ${W.ORG.ar} · صور مقيدة`));
write('photos/known_values.csv', csv([['photo', 'kind', 'tag', 'question', 'known_value', 'unit', 'tolerance'], ...W.PHOTOS.map(p => [p.id, W.KINDS[p.kind], p.tag, p.q, fmt(p.truth), p.unit, p.tol ?? 0])]));
write('runs/mikshaf_readings.csv', csv([['photo', 'question', 'mikshaf_reading', 'unit'], ...W.PHOTOS.map(p => [p.id, p.q, fmt(p.bot), p.unit])]));
write('drawings/pid.html', page('مخطط الأنابيب والأجهزة لمحطة ضخ الربوة', `
<p class="stamp">وثيقة سرية في الحالة: لا تدخل المساعد المعتمد. في القاعة الملف اصطناعي، والقرار الذي تتدرب عليه قرار المخطط الحقيقي في جهتك.</p>
<div class="wide scroll"><img src="pid_ps07.png" width="1200" height="760" alt="مخطط الأنابيب والأجهزة: بئر تجميع، وثلاث مضخات بصماماتها، وخط طرد مشترك عليه مرسل ضغط ومقياس تدفق"></div>`, `ملف تدريبي اصطناعي · ${W.ORG.ar} · وثيقة سرية في الحالة`));
write('drawings/pid_questions.csv', csv([['question_id', 'question', 'known_answer'], ...W.PID.map(q => [q.id, q.q, q.truth])]));
write('runs/local_model_pid_answers.csv', csv([['question_id', 'question', 'model_answer'], ...W.PID.map(q => [q.id, q.q, q.bot])]));
write('start/misread_table.csv', csv([['النوع', 'عدد الصور أو الأسئلة', 'القراءات الخاطئة', 'النسبة', 'أخطر خطأ فيها'], ...Object.values(W.KINDS).map(k => [k, '', '', '', '']), ['المخطط', '', '', '', ''], [], ['قاعدة القراءة: متى يجب أن يقرأ إنسان؟', ''], ['من يعتمد القاعدة؟', '']]));
const isMiss = p => typeof p.truth === 'number' ? !(typeof p.bot === 'number' && Math.abs(p.bot - p.truth) <= (p.tol || 0) + 1e-9) : String(p.bot) !== String(p.truth);
const byKind = Object.entries(W.KINDS).map(([k, name]) => { const ps = W.PHOTOS.filter(p => p.kind === k); return { kind: name, n: ps.length, misreads: ps.filter(isMiss).map(p => p.id) }; });
write('D2_2_misreads.json', json({ by_kind: byKind, photos_total: W.PHOTOS.length, photos_misread: W.PHOTOS.filter(isMiss).length, why: Object.fromEntries(W.PHOTOS.filter(isMiss).map(p => [p.id, p.why])), diagram_total: W.PID.length, diagram_wrong: W.PID.filter(q => q.bot !== q.truth).map(q => q.id), diagram_why: Object.fromEntries(W.PID.filter(q => q.bot !== q.truth).map(q => [q.id, q.why])) }), REF);
write('D2_2_misread_table.csv', csv([['النوع', 'العدد', 'القراءات الخاطئة', 'النسبة', 'الصور أو الأسئلة'], ...byKind.map(b => [b.kind, b.n, b.misreads.length, Math.round(100 * b.misreads.length / b.n) + '%', b.misreads.join(' ')]), ['المخطط', W.PID.length, W.PID.filter(q => q.bot !== q.truth).length, Math.round(100 * W.PID.filter(q => q.bot !== q.truth).length / W.PID.length) + '%', W.PID.filter(q => q.bot !== q.truth).map(q => q.id).join(' ')]]), REF);

// ------------------------------------------------------------------ capstone
const FK = Object.keys(W.FIELDS);
const report = (f, blank) => table(['الحقل', 'القيمة'], FK.map(k => [W.FIELDS[k].replace(/\(([^)]+)\)/, (m, u) => `(<span class="ltr">${u}</span>)`), blank ? '' : bidi(f[k])]));
write('capstone/prework_guide.html', page('العمل التحضيري: خط الأساس', `
<p>ساعتان قبل اليوم الأول. تخرج منهما بسطر واحد في سجل القياس: كم دقيقة أخذ منك تقرير فحص واحد بيدك، وكم حقلًا أخطأت فيه. دونه لا قياس في المشروع الختامي.</p>
<ol>
<li><b>اقرأ</b> <a href="../case/station_brief.html">ملخص الحالة</a> و<a href="../case/ai_use_card.html">بطاقة استخدام الذكاء الاصطناعي</a>. (30 دقيقة)</li>
<li><b>راجع</b> بطاقة التفويض التي كتبتها في المقرر <span class="ltr">USE-FLU-201</span>: أي خطوة سلّمتها للمساعد، وأيها أبقيتها. (20 دقيقة)</li>
<li><b>خط الأساس.</b> شغّل مؤقتًا. اقرأ <a href="voice_note_1_text.html">الملاحظة الصوتية 1 كما قالها الفني</a>، واملأ <a href="report_template.html">تقرير الفحص</a> بيدك، دون أي مساعد. أوقف المؤقت حين تنتهي من مراجعته. (20 دقيقة)</li>
<li><b>صحّح</b> تقريرك بـ<a href="form1_key.html">مفتاح النموذج 1</a>، وعدّ الحقول الخاطئة والناقصة. اكتب الدقائق والعدد في سطر «خط الأساس» من <a href="../start/measurement_log.csv" download>سجل القياس</a>. (15 دقيقة)</li>
<li><b>اختر</b> مهمة توثيق ميدانية تتكرر في عملك، وصفها في ثلاثة أسطر عامة: ما المدخل، وما المخرج، ومن يعتمده. لا اسم منشأة ولا رمز معدة حقيقي. (35 دقيقة)</li>
</ol>`));
write('capstone/report_template.html', page('تقرير فحص مهيكل', `<p>تسعة حقول. يُكتب الرمز كما هو، والقيمة برقمها ووحدتها.</p>${report({}, true)}<p>من يعتمد التقرير: مشرف الوردية، بعد مطابقته على الملاحظة كما قيلت.</p>`));
write('start/inspection_report.csv', csv([['الحقل', 'النموذج 1', 'النموذج 2', 'النموذج 3'], ...FK.map(k => [W.FIELDS[k], '', '', ''])]));
write('start/measurement_log.csv', csv([['التشغيل', 'النموذج', 'الأداة', 'الدقائق حتى آخر تحقق', 'حقول خاطئة أو ناقصة (من 9)', 'ما غيّرته قبل هذا التشغيل'], ['خط الأساس', 1, 'باليد', '', '', ''], ['التشغيل الأول', 2, 'المساعد', '', '', ''], ['التشغيل الثاني', 3, 'المساعد، بعد تعديل واحد', '', '', '']]));
write('capstone/form1_key.html', page('مفتاح النموذج 1', `<p>قارن تقريرك بهذا حقلًا حقلًا. الحقل الخاطئ: رمز أو رقم أو وحدة غير ما قيل، أو معنى انقلب. والناقص حقل تُرك فارغًا.</p>${report(W.NOTES[0].fields)}`));
for (const n of W.NOTES) write(`capstone/voice_note_${n.n}_text.html`, page(`الملاحظة الصوتية ${n.n}: النص كما قيل`, `<p class="ok">ما قاله الفني ${esc(W.PEOPLE.tech.ar)} في جولة الفحص، كلمة بكلمة. في هذا المقرر يقوم هذا النص مقام التسجيل الصوتي: منه يُكتب التقرير في خط الأساس، وعليه يُطابَق التفريغ وتقرير المساعد حقلًا حقلًا.</p><blockquote>${bidi(n.text)}</blockquote>`));
for (const n of W.NOTES.slice(1)) {
  write(`capstone/transcript_${n.n}.html`, page(`جلسة مسجلة: تفريغ الملاحظة الصوتية ${n.n}`, `<p class="stamp">تفريغ مسجل اصطناعي من نموذج كلام · فيه أخطاء مزروعة. لم يُشغَّل نموذج.</p><blockquote>${bidi(n.heard)}</blockquote><p class="s">ما قيل فعلًا: <a href="voice_note_${n.n}_text.html">الملاحظة الصوتية ${n.n} كما قيلت</a>.</p>`, `جلسة مسجلة اصطناعية · المساعد «${W.ORG.bot}»`));
  write(`capstone/report_draft_${n.n}.html`, page(`جلسة مسجلة: تقرير «مِكشاف» من الملاحظة الصوتية ${n.n}`, `<p class="stamp">مسودة مسجلة اصطناعية · كتبها المساعد من التفريغ · لم تُراجَع.</p>${report(n.draft)}`, `جلسة مسجلة اصطناعية · المساعد «${W.ORG.bot}»`));
}
write('capstone/redesign_card.html', page('بطاقة إعادة التصميم', `
<p>صفحة واحدة عن مهمة توثيق ميدانية تتكرر في عملك. وصف عام: لا اسم منشأة، ولا رمز معدة حقيقي، ولا صورة.</p>
${table(['الخانة', 'ما يُكتب فيها'], [
    ['المهمة', 'ما المدخل وما المخرج، وكم تتكرر، ومن يستلم المخرج'], ['المستوى والبيانات', 'أ أو ب أو ج، ومستوى تصنيف المدخلات، وأعلى أداة مسموحة'],
    ['الخطوات', 'من يؤدي كل خطوة: أنت، أم المساعد، أم أنتما'], ['التحقق', 'ما الذي يُطابَق حقلًا حقلًا، وعلى أي مصدر، وأين يُسجَّل'],
    ['اعتماد الشخص المختص', 'اسم الوظيفة التي توقّع قبل أن يُبنى على المخرج أي عمل'], ['قاعدة التوقف', 'العلامة التي تترك عندها المساعد وتكمل بيدك'],
    ['القياس', 'الأسطر الثلاثة من سجل القياس، وما تستنتجه منها وما لا تستنتجه']
  ])}`));
write('capstone_keys.json', json(Object.fromEntries(W.NOTES.map(n => [n.n, { fields: n.fields, heard_faults: n.heardFaults || [], draft_wrong: n.draftWrong || [] }]))), REF);

console.log(`wrote ${count} files; log ${LOG.length} entries, ${wrong.length} miscoded; sample seed ${SEED}`);
