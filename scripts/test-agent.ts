/**
 * Agent turn-by-turn test: npx tsx scripts/test-agent.ts
 *
 * Mocks all four tools so no real DB or invoice creation happens.
 * Runs three conversation scenarios and checks agent behaviour.
 */

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam, ToolUseBlock, ToolResultBlockParam } from '@anthropic-ai/sdk/resources/messages'
import { readFileSync } from 'fs'
import { join } from 'path'

// ─── Mock tool responses ──────────────────────────────────────────────────────

const MOCK_TOOLS: Record<string, (input: Record<string, unknown>) => unknown> = {
  get_client: (_input) => null,                  // client not found
  list_recent_clients: (_input) => [],
  list_products: (_input) => [],
  create_invoice: (_input) => ({
    id: 'test-id-123',
    share_token: 'tok123',
    share_url: 'https://mademeinvoice.com/i/tok123',
    invoice_number: 'INV-001',
  }),
}

// ─── Tool definitions (copied from production) ────────────────────────────────

import { TOOL_DEFINITIONS } from '../lib/ai/tools'

// ─── Agentic loop with mocked tools ──────────────────────────────────────────

type TurnLog = {
  toolsCalled: string[]
  toolInputs: Record<string, unknown>[]
  assistantText: string
}

async function runAgentTurn(
  messages: MessageParam[],
  defaultCurrency: string
): Promise<TurnLog> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')

  const anthropic = new Anthropic({ apiKey })
  const system = readFileSync(join(process.cwd(), 'prompts', 'agent.md'), 'utf-8')
  const systemWithContext = [
    system,
    '',
    '## Runtime context',
    `- User default currency: ${defaultCurrency}`,
    `- today: 2026-04-29`,
    `- user_country: IN`,
  ].join('\n')

  const log: TurnLog = { toolsCalled: [], toolInputs: [], assistantText: '' }
  const currentMessages = [...messages]

  while (true) {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemWithContext,
      tools: TOOL_DEFINITIONS,
      messages: currentMessages,
    })

    stream.on('text', (chunk) => { log.assistantText += chunk })

    const finalMsg = await stream.finalMessage()
    currentMessages.push({ role: 'assistant', content: finalMsg.content })

    if (finalMsg.stop_reason !== 'tool_use') break

    const toolResults: ToolResultBlockParam[] = []
    for (const block of finalMsg.content) {
      if (block.type !== 'tool_use') continue
      const tb = block as ToolUseBlock
      log.toolsCalled.push(tb.name)
      log.toolInputs.push(tb.input as Record<string, unknown>)

      const handler = MOCK_TOOLS[tb.name]
      const output = handler ? handler(tb.input as Record<string, unknown>) : { error: 'unknown tool' }
      toolResults.push({ type: 'tool_result', tool_use_id: tb.id, content: JSON.stringify(output) })
    }
    currentMessages.push({ role: 'user', content: toolResults })
  }

  // Write final messages back so caller can continue the conversation
  messages.length = 0
  messages.push(...currentMessages)

  return log
}

// ─── Scenario helpers ─────────────────────────────────────────────────────────

function pass(label: string, note?: string) {
  console.log(`  ✅  PASS  ${label}${note ? `\n         ${note}` : ''}`)
}

function fail(label: string, reason: string) {
  console.log(`  ❌  FAIL  ${label}\n         ${reason}`)
}

// ─── Scenarios ────────────────────────────────────────────────────────────────

async function scenarioA() {
  console.log('\n── Scenario A: normal confirm flow ─────────────────────────')
  const messages: MessageParam[] = []
  let allPassed = true

  // Turn 1: user sends request
  messages.push({ role: 'user', content: 'invoice ravi 50k web design + 18 gst' })
  const turn1 = await runAgentTurn(messages, 'INR')

  console.log(`  Turn 1 tools called: [${turn1.toolsCalled.join(', ')}]`)
  console.log(`  Turn 1 text preview:\n    "${turn1.assistantText.slice(0, 200).replace(/\n/g, '\n    ')}"`)

  // Expect: create_invoice NOT called yet
  if (turn1.toolsCalled.includes('create_invoice')) {
    fail('A1: no create_invoice on first turn', `create_invoice was called: ${JSON.stringify(turn1.toolInputs[turn1.toolsCalled.indexOf('create_invoice')])}`)
    allPassed = false
  } else {
    pass('A1: create_invoice not called before confirmation')
  }

  // Expect: get_client WAS called (agent should look up "ravi")
  if (!turn1.toolsCalled.includes('get_client')) {
    fail('A2: get_client called for client name', 'get_client was not called')
    allPassed = false
  } else {
    pass('A2: get_client called to look up "ravi"')
  }

  // Expect: preview text mentions key figures
  const preview = turn1.assistantText.toLowerCase()
  if (!preview.includes('50') && !preview.includes('50,000') && !preview.includes('₹')) {
    fail('A3: preview shows amount', `amount not visible in preview: "${turn1.assistantText.slice(0, 150)}"`)
    allPassed = false
  } else {
    pass('A3: preview includes amount')
  }

  // Turn 2: user confirms
  messages.push({ role: 'user', content: 'yes' })
  const turn2 = await runAgentTurn(messages, 'INR')

  console.log(`  Turn 2 tools called: [${turn2.toolsCalled.join(', ')}]`)
  console.log(`  Turn 2 text:\n    "${turn2.assistantText.slice(0, 200).replace(/\n/g, '\n    ')}"`)

  // Expect: create_invoice called
  if (!turn2.toolsCalled.includes('create_invoice')) {
    fail('A4: create_invoice called after confirmation', 'create_invoice was NOT called after "yes"')
    allPassed = false
  } else {
    pass('A4: create_invoice called after "yes"')
  }

  // Expect: final message contains share URL
  if (!turn2.assistantText.includes('tok123') && !turn2.assistantText.includes('mademeinvoice.com')) {
    fail('A5: share URL in final message', `URL not found in: "${turn2.assistantText.slice(0, 200)}"`)
    allPassed = false
  } else {
    pass('A5: share URL present in final message')
  }

  return allPassed
}

async function scenarioB() {
  console.log('\n── Scenario B: "just" → immediate create ───────────────────')
  const messages: MessageParam[] = []
  let allPassed = true

  messages.push({ role: 'user', content: 'just make an invoice for ravi 50k web design' })
  const turn1 = await runAgentTurn(messages, 'INR')

  console.log(`  Tools called: [${turn1.toolsCalled.join(', ')}]`)
  console.log(`  Text:\n    "${turn1.assistantText.slice(0, 200).replace(/\n/g, '\n    ')}"`)

  // Expect: create_invoice called in the SAME first turn
  if (!turn1.toolsCalled.includes('create_invoice')) {
    fail('B1: create_invoice called immediately', '"just" keyword did not trigger immediate creation — create_invoice not called')
    allPassed = false
  } else {
    pass('B1: create_invoice called immediately (no wait for confirmation)')
  }

  // Expect: share URL in response
  if (!turn1.assistantText.includes('tok123') && !turn1.assistantText.includes('mademeinvoice.com')) {
    fail('B2: share URL in response', `URL not found in: "${turn1.assistantText.slice(0, 200)}"`)
    allPassed = false
  } else {
    pass('B2: share URL present in response')
  }

  return allPassed
}

async function scenarioC() {
  console.log('\n── Scenario C: "estimate" → document_type=estimation ───────')
  const messages: MessageParam[] = []
  let allPassed = true

  messages.push({ role: 'user', content: 'estimate ravi 50k web design' })
  const turn1 = await runAgentTurn(messages, 'INR')

  console.log(`  Turn 1 tools called: [${turn1.toolsCalled.join(', ')}]`)
  console.log(`  Turn 1 text:\n    "${turn1.assistantText.slice(0, 200).replace(/\n/g, '\n    ')}"`)

  // Confirm
  messages.push({ role: 'user', content: 'yes' })
  const turn2 = await runAgentTurn(messages, 'INR')

  console.log(`  Turn 2 tools called: [${turn2.toolsCalled.join(', ')}]`)

  // Expect: create_invoice called
  if (!turn2.toolsCalled.includes('create_invoice')) {
    fail('C1: create_invoice called', 'create_invoice not called after confirmation')
    allPassed = false
    return allPassed
  }
  pass('C1: create_invoice called after confirmation')

  // Expect: document_type = 'estimation' in the payload
  const createIdx = turn2.toolsCalled.indexOf('create_invoice')
  const payload = turn2.toolInputs[createIdx] as Record<string, unknown>
  const docType = payload?.document_type as string | undefined

  if (docType !== 'estimation') {
    fail('C2: document_type=estimation in payload', `Got document_type="${docType ?? 'undefined'}" — expected "estimation"`)
    allPassed = false
  } else {
    pass('C2: document_type=estimation in create_invoice payload')
  }

  return allPassed
}

async function scenarioD() {
  console.log('\n── Scenario D: new client auto-save via `client` field ──────')
  const messages: MessageParam[] = []
  let allPassed = true

  messages.push({ role: 'user', content: 'invoice for brand new client Sarah Lee 1000 USD logo design' })
  const turn1 = await runAgentTurn(messages, 'USD')

  console.log(`  Turn 1 tools called: [${turn1.toolsCalled.join(', ')}]`)
  console.log(`  Turn 1 text:\n    "${turn1.assistantText.slice(0, 200).replace(/\n/g, '\n    ')}"`)

  // Confirm
  messages.push({ role: 'user', content: 'yes' })
  const turn2 = await runAgentTurn(messages, 'USD')

  console.log(`  Turn 2 tools called: [${turn2.toolsCalled.join(', ')}]`)

  if (!turn2.toolsCalled.includes('create_invoice')) {
    fail('D1: create_invoice called', 'create_invoice not called after confirmation')
    allPassed = false
    return allPassed
  }
  pass('D1: create_invoice called after confirmation')

  // Expect: create_invoice payload has client.name = "Sarah Lee" (no clientId)
  const createIdx = turn2.toolsCalled.indexOf('create_invoice')
  const payload = turn2.toolInputs[createIdx] as Record<string, unknown>
  const client = payload?.client as { name?: string } | undefined
  const clientId = payload?.clientId as string | undefined

  if (!client?.name || !/sarah lee/i.test(client.name)) {
    fail('D2: client.name=Sarah Lee in payload', `Got client=${JSON.stringify(client)}, clientId=${clientId}`)
    allPassed = false
  } else {
    pass(`D2: client.name="${client.name}" passed to create_invoice`)
  }

  if (clientId) {
    fail('D3: no clientId when client is new', `clientId was provided (${clientId}) but client is brand-new — should use client field instead`)
    allPassed = false
  } else {
    pass('D3: no clientId for brand-new client (correct)')
  }

  return allPassed
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🤖  Agent test suite\n' + '─'.repeat(56))

  const results = await Promise.allSettled([
    scenarioA(),
    scenarioB(),
    scenarioC(),
    scenarioD(),
  ])

  const labels = ['Scenario A', 'Scenario B', 'Scenario C', 'Scenario D']
  let totalFailed = 0

  console.log('\n' + '─'.repeat(56))
  console.log('  Summary:')
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    if (r.status === 'rejected') {
      console.log(`  ❌  ${labels[i]}: ERROR — ${r.reason}`)
      totalFailed++
    } else if (!r.value) {
      console.log(`  ❌  ${labels[i]}: some checks failed (see above)`)
      totalFailed++
    } else {
      console.log(`  ✅  ${labels[i]}: all checks passed`)
    }
  }
  console.log()
  process.exit(totalFailed > 0 ? 1 : 0)
}

main()
