/**
 * Pipeline end-to-end test: npx tsx scripts/test-chat-api.ts
 *
 * Uses the test harness (mocked tools, real Anthropic, in-memory history).
 * Tests the chat pipeline logic — not the HTTP wrapper.
 */

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createHarnessSession } from '../lib/ai/test-harness'

// ─── Assertion helpers ────────────────────────────────────────────────────────

type CheckResult = { pass: true } | { pass: false; reason: string }

function ok(reason: string): CheckResult { return { pass: true } }
function fail(reason: string): CheckResult { return { pass: false, reason } }

function checkNoCreateInvoice(
  toolsCalled: Array<{ name: string; input: Record<string, unknown> }>,
  assistantText: string
): CheckResult {
  if (toolsCalled.some((t) => t.name === 'create_invoice')) {
    return fail(`create_invoice was called before confirmation — payload: ${JSON.stringify(toolsCalled.find((t) => t.name === 'create_invoice')?.input)}`)
  }
  if (!assistantText.trim()) {
    return fail('assistantText is empty — expected a preview')
  }
  return ok('create_invoice not called and preview text present')
}

function checkCreateInvoiceCalled(
  toolsCalled: Array<{ name: string; input: Record<string, unknown> }>,
  assistantText: string
): CheckResult {
  if (!toolsCalled.some((t) => t.name === 'create_invoice')) {
    return fail('create_invoice was NOT called after confirmation')
  }
  if (!assistantText.includes('tok123') && !assistantText.includes('mademeinvoice.com')) {
    return fail(`share URL not in final text: "${assistantText.slice(0, 200)}"`)
  }
  return ok('create_invoice called and share URL present')
}

function checkDocumentType(
  toolsCalled: Array<{ name: string; input: Record<string, unknown> }>,
  expected: 'invoice' | 'estimation'
): CheckResult {
  const call = toolsCalled.find((t) => t.name === 'create_invoice')
  if (!call) return fail('create_invoice was not called')
  const docType = (call.input.document_type as string | undefined) ?? 'invoice'
  if (docType !== expected) {
    return fail(`document_type="${docType}", expected "${expected}"`)
  }
  return ok(`document_type=${expected}`)
}

function logCheck(label: string, result: CheckResult) {
  if (result.pass) {
    console.log(`    ✅  ${label}`)
  } else {
    console.log(`    ❌  ${label}: ${result.reason}`)
  }
}

// ─── Scenarios ────────────────────────────────────────────────────────────────

async function scenario1and2(): Promise<boolean> {
  console.log('\n── S1+S2: Two-turn confirm flow ────────────────────────────')
  let allPass = true

  const session = createHarnessSession('INR', { userCountry: 'IN' })

  // Turn 1 ─ initial request
  console.log('  Turn 1: "invoice ravi 50k web design + 18 gst"')
  const t1 = await session.send('invoice ravi 50k web design + 18 gst')
  console.log(`    Tools called: [${t1.toolsCalled.map((t) => t.name).join(', ')}]`)
  console.log(`    Preview: "${t1.assistantText.slice(0, 180).replace(/\n/g, ' ↵ ')}"`)

  const c1 = checkNoCreateInvoice(t1.toolsCalled, t1.assistantText)
  logCheck('S1a: no create_invoice before confirmation', c1)
  if (!c1.pass) allPass = false

  const c2: CheckResult = t1.toolsCalled.some((t) => t.name === 'get_client')
    ? ok('get_client was called')
    : fail('get_client was not called to look up "ravi"')
  logCheck('S1b: get_client called for client name', c2)
  if (!c2.pass) allPass = false

  const hasAmount = /50[,.]?000|₹|50k/i.test(t1.assistantText)
  const c3: CheckResult = hasAmount ? ok('amount visible') : fail(`amount not in preview: "${t1.assistantText.slice(0, 150)}"`)
  logCheck('S1c: amount shown in preview', c3)
  if (!c3.pass) allPass = false

  // Turn 2 ─ confirm
  console.log('  Turn 2: "yes"')
  const t2 = await session.send('yes')
  console.log(`    Tools called: [${t2.toolsCalled.map((t) => t.name).join(', ')}]`)
  console.log(`    Response: "${t2.assistantText.slice(0, 200).replace(/\n/g, ' ↵ ')}"`)

  const c4 = checkCreateInvoiceCalled(t2.toolsCalled, t2.assistantText)
  logCheck('S2a: create_invoice called after "yes"', c4)
  if (!c4.pass) allPass = false

  const c5 = checkDocumentType(t2.toolsCalled, 'invoice')
  logCheck('S2b: document_type=invoice', c5)
  if (!c5.pass) allPass = false

  return allPass
}

async function scenario3(): Promise<boolean> {
  console.log('\n── S3: Estimate with due date ──────────────────────────────')
  let allPass = true

  const session = createHarnessSession('USD', { userCountry: 'US' })

  // Turn 1 ─ request with "estimate" keyword
  console.log('  Turn 1: "estimate john smith 1000 USD consulting net 30"')
  const t1 = await session.send('estimate john smith 1000 USD consulting net 30')
  console.log(`    Tools called: [${t1.toolsCalled.map((t) => t.name).join(', ')}]`)
  console.log(`    Preview: "${t1.assistantText.slice(0, 200).replace(/\n/g, ' ↵ ')}"`)

  const c1 = checkNoCreateInvoice(t1.toolsCalled, t1.assistantText)
  logCheck('S3a: no create_invoice on first turn', c1)
  if (!c1.pass) allPass = false

  // Turn 2 ─ confirm with "ok"
  console.log('  Turn 2: "ok"')
  const t2 = await session.send('ok')
  console.log(`    Tools called: [${t2.toolsCalled.map((t) => t.name).join(', ')}]`)
  console.log(`    Response: "${t2.assistantText.slice(0, 200).replace(/\n/g, ' ↵ ')}"`)

  const c2 = checkCreateInvoiceCalled(t2.toolsCalled, t2.assistantText)
  logCheck('S3b: create_invoice called after "ok"', c2)
  if (!c2.pass) allPass = false

  const c3 = checkDocumentType(t2.toolsCalled, 'estimation')
  logCheck('S3c: document_type=estimation in payload', c3)
  if (!c3.pass) allPass = false

  // Bonus: check due_date is set (net 30)
  const createCall = t2.toolsCalled.find((t) => t.name === 'create_invoice')
  const c4: CheckResult = createCall?.input.dueDate
    ? ok(`due_date=${createCall.input.dueDate}`)
    : fail('due_date not set — "net 30" should have resolved to a date')
  logCheck('S3d: due_date set from "net 30"', c4)
  if (!c4.pass) allPass = false

  return allPass
}

// ─── Runner ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀  Chat pipeline test suite\n' + '─'.repeat(56))

  const results = await Promise.allSettled([
    scenario1and2(),
    scenario3(),
  ])

  const labels = ['S1+S2 (two-turn confirm flow)', 'S3 (estimate + due date)']
  let failed = 0

  console.log('\n' + '─'.repeat(56))
  console.log('  Summary:')
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    if (r.status === 'rejected') {
      console.log(`  ❌  ${labels[i]}: ERROR — ${r.reason}`)
      failed++
    } else if (!r.value) {
      console.log(`  ❌  ${labels[i]}: some checks failed (see above)`)
      failed++
    } else {
      console.log(`  ✅  ${labels[i]}: all checks passed`)
    }
  }
  console.log()
  process.exit(failed > 0 ? 1 : 0)
}

main()
