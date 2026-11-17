// Runs the reference solution of every lab against the course files and prints PASS or the first
// difference.
//
//     node labs/solutions/check.mjs               every lab and the capstone forms
//     node labs/solutions/check.mjs 1.2 2.1       some of them
//
// What runs for real: everything a participant does by reading a file. The reference tier table
// is marked against the key; every step of the recorded draft is compared with revision D of the
// manual (values, units, isolation points, order, the valve, the step with no source); the faults
// are counted from the coded log and the 50-entry sample is marked; every recorded reading is
// compared with its known value and tolerance; the recorded reports are compared with the keys.
// What does not run: anything a participant does in an AI assistant. The assistant's outputs are
// recorded files with planted faults, and this script proves that the faults a careful reader
// finds are the ones the answer key names. No model is called and nothing is written to disk.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILES = path.join(HERE, '..', 'files');
const REF = path.join(HERE, 'reference');
const only = process.argv.slice(2);
const read = (base, rel) => fs.readFileSync(path.join(base, rel), 'utf8').replace(/^﻿/, '');
const json = rel => JSON.parse(read(REF, rel));
function csv(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
const table = (base, rel) => { const [head, ...rows] = csv(read(base, rel)); return rows.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((h, i) => [h, r[i]]))); };

const LABS = {
  // ---------------------------------------------------------------- 1.1
  '1.1'() {
    const key = json('D1_1_key.json');
    const uses = table(FILES, 'start/risk_tier_table.csv'), ref = table(REF, 'D1_1_risk_tier_table.csv');
    assert.equal(uses.length, 12, 'twelve uses in the starting table');
    const AR = { 'أ': 'A', 'ب': 'B', 'ج': 'C' };
    let right = 0;
    for (const k of key) {
      const r = ref.find(x => x['الرمز'] === k.id);
      if (AR[r['المستوى (أ، ب، ج)']] === k.tier && r['التحقق (V1 إلى V5)'] === k.check) right++;
      if (k.tier === 'C') assert.equal(k.check, 'V5', k.id + ': a never-drives-action use has check V5');
      if (k.tier === 'A') assert.equal(k.check, 'V1', k.id + ': drafting support has check V1');
      if (k.tier === 'B') assert.ok(['V2', 'V3', 'V4'].includes(k.check), k.id + ': tier B has a source, sample or second-reading check');
    }
    assert.equal(right, 12, 'the reference table matches the key on all twelve');
    const n = t => key.filter(k => k.tier === t).length;
    assert.deepEqual([n('A'), n('B'), n('C')], [3, 5, 4]);
    // the card and the key agree on the tool for a drawing
    const card = read(FILES, 'case/ai_use_card.html');
    assert.ok(card.includes('مخطط الأنابيب والأجهزة') && key.find(k => k.id === 'U10').tool === 'T3', 'the diagram is secret: local model only');
    return `12 uses: 3 in tier A, 5 in tier B, 4 in tier C; the reference table scores 12 of 12`;
  },
  // ---------------------------------------------------------------- 1.2
  '1.2'() {
    const D = read(FILES, 'docs/manual_rev_d.html'), C = read(FILES, 'docs/manual_rev_c.html'), draft = read(FILES, 'runs/mikshaf_sop_draft.html');
    const facts = html => Object.fromEntries([...html.matchAll(/data-k="([^"]+)" data-v="([^"]+)"(?: data-u="([^"]+)")?/g)].map(m => [m[1], [m[2], m[3] || '']]));
    const fd = facts(D), fc = facts(C);
    const changed = Object.keys(fd).filter(k => fc[k] && fc[k][0] !== fd[k][0]);
    const steps = [...draft.matchAll(/<li data-step="(\d+)" data-act="([^"]+)"([^>]*)>/g)].map(m => ({ n: +m[1], act: m[2], attrs: m[3] }));
    assert.equal(steps.length, 18, 'eighteen steps in the draft');
    const found = {};
    for (const s of steps) {
      for (const m of s.attrs.matchAll(/data-f\d="([^|]+)\|([^|]+)\|([^"]+)"/g)) {
        const [, k, v, u] = m; const [dv, du] = fd[k];
        if (u !== du) found[s.n] = 'unit'; else if (v !== dv) found[s.n] = fc[k] && fc[k][0] === v ? 'superseded' : 'value';
      }
      const valve = s.attrs.match(/data-k="discharge_valve" data-v="([^"]+)"/);
      if (valve && valve[1] !== fd.discharge_valve[0]) found[s.n] = 'valve';
    }
    // isolation points: every point of revision D appears in the isolating step
    const isoD = [...D.matchAll(/data-iso="([^"]+)"/g)].map(m => m[1]);
    const isoStep = steps.find(s => s.act === 'isolate'); const isoDraft = (isoStep.attrs.match(/data-iso="([^"]+)"/) || [, ''])[1].split(' ');
    const missingIso = isoD.filter(p => !isoDraft.includes(p));
    if (missingIso.length) found[isoStep.n] = 'missing isolation ' + missingIso.join(' ');
    // order: isolate, lock, wait, test
    const seq = [...D.matchAll(/data-seq="([^"]+)"/g)].map(m => m[1]);
    const pos = Object.fromEntries(seq.map(a => [a, steps.find(s => s.act === a).n]));
    for (let i = 1; i < seq.length; i++) if (pos[seq[i]] < pos[seq[i - 1]]) found[pos[seq[i]]] = 'order';
    // a warning the manual requires before an action
    for (const m of D.matchAll(/data-require="([^"]+)" data-before="([^"]+)"/g)) if (!steps.some(s => s.act === m[1])) found[steps.find(s => s.act === m[2]).n] = 'missing ' + m[1];
    // an action the manual forbids
    for (const m of D.matchAll(/data-forbid="([^"]+)"/g)) { const s = steps.find(x => x.act === m[1]); if (s) found[s.n] = 'forbidden'; }
    const key = json('D1_2_faults.json');
    const keySteps = Object.values(key).map(f => f.step).sort((a, b) => a - b), foundSteps = Object.keys(found).map(Number).sort((a, b) => a - b);
    assert.deepEqual(foundSteps, keySteps, 'the faults found on the files are the faults of the key');
    assert.equal(found[10], 'unit'); assert.equal(found[6], 'superseded'); assert.equal(found[17], 'superseded'); assert.equal(found[9], 'superseded');
    const cites = [...draft.matchAll(/المراجعة <span class="ltr">C<\/span>، §/g)].length;
    assert.equal(cites, 3, 'three steps cite the superseded revision openly');
    return `${changed.length} values differ between revisions C and D; 18 steps, 9 faulty (steps ${foundSteps.join(', ')}): 3 superseded values, 1 unit, 1 missing isolation point, 1 order, 1 wrong valve, 1 missing warning, 1 step with no source`;
  },
  // ---------------------------------------------------------------- 2.1
  '2.1'() {
    const log = table(FILES, 'logs/maintenance_log.csv'), coded = table(FILES, 'runs/mikshaf_coding.csv'), truth = table(REF, 'D2_1_true_codes.csv'), sample = table(FILES, 'start/sample_50.csv');
    const num = json('D2_1_numbers.json');
    assert.equal(log.length, num.entries); assert.equal(coded.length, log.length);
    const T = Object.fromEntries(truth.map(r => [r.wo_id, r.true_code]));
    const count = code => {
      const g = {};
      for (const r of coded) { const c = code(r); if (c === 'PM' || c === 'OTH') continue; (g[r.asset + '|' + c] ||= []).push(Date.parse(r.date) / 86400000); }
      const out = {};
      for (const [k, d] of Object.entries(g)) { d.sort((a, b) => a - b); let best = 0; for (let i = 0; i < d.length; i++) { let j = i; while (j < d.length && d[j] - d[i] <= 90) j++; best = Math.max(best, j - i); } out[k] = [d.length, best, best >= 3]; }
      return out;
    };
    const mine = count(r => T[r.wo_id]), bot = count(r => r.mikshaf_code);
    assert.deepEqual(mine, num.true_counts, 'counts from the true codes'); assert.deepEqual(bot, num.mikshaf_counts, 'counts from the recorded coding');
    assert.equal(sample.length, 50);
    const disagree = sample.filter(r => r.mikshaf_code !== T[r.wo_id]).map(r => r.wo_id);
    assert.deepEqual(disagree, num.sample_disagreements);
    const wrong = coded.filter(r => r.mikshaf_code !== T[r.wo_id]).length;
    assert.equal(wrong, num.miscoded);
    const k = ['P-101B|SEAL', 'P-101C|BLK', 'P-101A|BRG', 'LT-101|INST'];
    for (const run of num.chat) for (const x of k) assert.notEqual(run[x], undefined);
    assert.ok(num.chat.every(run => k.some(x => run[x] !== mine[x][0])), 'neither chat run is the count');
    return `${log.length} work orders, ${wrong} miscoded in the recorded coding (${(100 * wrong / log.length).toFixed(1)}%); sample: ${50 - disagree.length} of 50 agree; ` +
      k.map(x => `${x.replace('|', ' ')} true ${mine[x][0]} (max ${mine[x][1]} in 90 days), recorded coding ${(bot[x] || [0])[0]}, chat ${num.chat.map(r => r[x]).join(' then ')}`).join('; ');
  },
  // ---------------------------------------------------------------- 2.2
  '2.2'() {
    const known = table(FILES, 'photos/known_values.csv'), got = table(FILES, 'runs/mikshaf_readings.csv'), ref = json('D2_2_misreads.json');
    assert.equal(known.length, 30);
    for (const k of known) assert.ok(fs.existsSync(path.join(FILES, 'photos', k.photo + '.png')), k.photo + '.png exists');
    assert.ok(fs.existsSync(path.join(FILES, 'drawings', 'pid_ps07.png')));
    const miss = {}; const total = {};
    for (const k of known) {
      const g = got.find(r => r.photo === k.photo); total[k.kind] = (total[k.kind] || 0) + 1;
      const a = Number(k.known_value), b = Number(g.mikshaf_reading); const numeric = k.known_value !== '' && !Number.isNaN(a) && Number(k.tolerance) >= 0 && /^[\d.]+$/.test(k.known_value) && k.kind !== 'لوحة بيانات ونص صغير';
      const ok = numeric ? Math.abs(a - b) <= Number(k.tolerance) + 1e-9 : k.known_value === g.mikshaf_reading;
      assert.equal(k.unit, g.unit, k.photo + ': the recorded reading keeps the unit');
      if (!ok) (miss[k.kind] ||= []).push(k.photo);
    }
    for (const b of ref.by_kind) { assert.equal(total[b.kind], b.n); assert.deepEqual(miss[b.kind] || [], b.misreads, b.kind); }
    const q = table(FILES, 'drawings/pid_questions.csv'), ans = table(FILES, 'runs/local_model_pid_answers.csv');
    const wrong = q.filter(x => ans.find(a => a.question_id === x.question_id).model_answer !== x.known_answer).map(x => x.question_id);
    assert.deepEqual(wrong, ref.diagram_wrong);
    const all = Object.values(miss).flat().length;
    return `30 photos, ${all} misread: ` + ref.by_kind.map(b => `${b.misreads.length} of ${b.n} ${b.kind}`).join(', ') + `; diagram: ${wrong.length} of ${q.length} wrong (${wrong.join(', ')})`;
  },
  // ---------------------------------------------------------------- capstone
  capstone() {
    const keys = json('capstone_keys.json'); const out = [];
    const cells = html => [...html.matchAll(/<tr><td>(.*?)<\/td><td>(.*?)<\/td><\/tr>/g)].map(m => m[2].replace(/<[^>]+>/g, ''));
    const names = Object.keys(keys[1].fields);
    assert.deepEqual(cells(read(FILES, 'capstone/form1_key.html')), names.map(k => keys[1].fields[k]), 'the key of form 1 is the key');
    for (const n of [2, 3]) {
      const draft = cells(read(FILES, `capstone/report_draft_${n}.html`));
      const wrong = names.filter((k, i) => draft[i] !== keys[n].fields[k]);
      assert.deepEqual(wrong, keys[n].draft_wrong, `form ${n}: wrong fields of the recorded report`);
      out.push(`form ${n}: ${keys[n].heard_faults.length} faults in the transcript, ${wrong.length} of 9 fields wrong in the recorded report (${wrong.join(', ')})`);
    }
    for (const n of [1, 2, 3]) {
      const said = read(FILES, `capstone/voice_note_${n}_text.html`).replace(/<[^>]+>/g, '');
      for (const k of ['asset', 'pressure', 'vibration', 'temp', 'level']) assert.ok(said.includes(keys[n].fields[k]), `note ${n} as said holds the ${k} of the key`);
    }
    return out.join('; ');
  }
};

let failed = 0;
for (const [id, run] of Object.entries(LABS)) {
  if (only.length && !only.includes(id)) continue;
  try { console.log(`PASS ${id}: ${run()}`); } catch (e) { failed++; console.log(`FAIL ${id}: ${e.message}`); }
}
process.exit(failed ? 1 : 0);
