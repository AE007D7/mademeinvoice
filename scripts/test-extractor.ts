/**
 * Manual extractor test: npx tsx scripts/test-extractor.ts
 * Requires ANTHROPIC_API_KEY in .env.local
 */

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { extractInvoice } from '../lib/ai/anthropic'
import type { ExtractedInvoice } from '../lib/ai/types'

// ─── Test cases ───────────────────────────────────────────────────────────────

type Expect = {
  document_type?: 'invoice' | 'estimation'
  clientNameIncludes?: string
  currency?: string
  itemCount?: number
  firstItemPriceMin?: number
  firstItemPriceMax?: number
  firstItemQty?: number
  tax_rate?: number
  hasDueDate?: boolean
}

type Case = {
  label: string
  input: string
  defaultCurrency: string
  userCountry?: string
  expect: Expect
}

const CASES: Case[] = [
  {
    label: 'English short — 50k INR web design',
    input: 'invoice ravi 50k web design',
    defaultCurrency: 'INR',
    userCountry: 'IN',
    expect: {
      document_type: 'invoice',
      clientNameIncludes: 'ravi',
      currency: 'INR',
      itemCount: 1,
      firstItemPriceMin: 49999,
      firstItemPriceMax: 50001,
    },
  },
  {
    label: 'English detailed — consulting + setup, USD, net 30',
    input: 'Invoice John Smith for 3 hours of consulting at $150/hr and a setup fee of $200. Due in 30 days.',
    defaultCurrency: 'USD',
    userCountry: 'US',
    expect: {
      document_type: 'invoice',
      clientNameIncludes: 'john',
      currency: 'USD',
      itemCount: 2,
      firstItemQty: 3,
      firstItemPriceMin: 149,
      firstItemPriceMax: 151,
      hasDueDate: true,
    },
  },
  {
    label: 'Hinglish — 2 lakh logo design',
    input: 'Ravi ko invoice bhejo — 2 lakh ka logo design',
    defaultCurrency: 'INR',
    userCountry: 'IN',
    expect: {
      document_type: 'invoice',
      clientNameIncludes: 'ravi',
      currency: 'INR',
      itemCount: 1,
      firstItemPriceMin: 199999,
      firstItemPriceMax: 200001,
    },
  },
  {
    label: 'French — estimation 3000 EUR net 15',
    input: "Facture pour Marie — développement site web 3000 euros, délai 15 jours",
    defaultCurrency: 'EUR',
    userCountry: 'FR',
    expect: {
      clientNameIncludes: 'marie',
      currency: 'EUR',
      itemCount: 1,
      firstItemPriceMin: 2999,
      firstItemPriceMax: 3001,
      hasDueDate: true,
    },
  },
  {
    label: 'Ambiguous currency — $ overrides EUR default',
    input: 'Create invoice for Alex — $500 for monthly social media management',
    defaultCurrency: 'EUR',
    userCountry: 'US',
    expect: {
      clientNameIncludes: 'alex',
      currency: 'USD',
      itemCount: 1,
      firstItemPriceMin: 499,
      firstItemPriceMax: 501,
    },
  },
  {
    label: '2.5 lakh number parsing',
    input: 'invoice priya sharma 2.5 lakh branding project',
    defaultCurrency: 'INR',
    userCountry: 'IN',
    expect: {
      clientNameIncludes: 'priya',
      currency: 'INR',
      itemCount: 1,
      firstItemPriceMin: 249999,
      firstItemPriceMax: 250001,
    },
  },
  {
    label: 'Missing client — items only',
    input: 'invoice for 3 WordPress pages at 8000 each',
    defaultCurrency: 'INR',
    userCountry: 'IN',
    expect: {
      currency: 'INR',
      itemCount: 1,
      firstItemQty: 3,
      firstItemPriceMin: 7999,
      firstItemPriceMax: 8001,
    },
  },
  {
    label: 'Multiple line items + 10% tax + estimation',
    input: 'Estimate Carlos: UI design 2000 EUR, frontend dev 5000 EUR, 10% tax',
    defaultCurrency: 'EUR',
    userCountry: 'ES',
    expect: {
      document_type: 'estimation',
      clientNameIncludes: 'carlos',
      currency: 'EUR',
      itemCount: 2,
      firstItemPriceMin: 1999,
      firstItemPriceMax: 2001,
      tax_rate: 10,
    },
  },
]

// ─── Checker ──────────────────────────────────────────────────────────────────

function check(got: ExtractedInvoice | null, exp: Expect): string[] {
  if (!got) return ['extractInvoice returned null']
  const fail: string[] = []

  if (exp.document_type && got.document_type !== exp.document_type)
    fail.push(`document_type: expected ${exp.document_type}, got ${got.document_type}`)

  if (exp.clientNameIncludes) {
    const name = (got.client?.name ?? '').toLowerCase()
    if (!name.includes(exp.clientNameIncludes.toLowerCase()))
      fail.push(`client.name: expected to include "${exp.clientNameIncludes}", got "${got.client?.name}"`)
  }

  if (exp.currency && got.currency !== exp.currency)
    fail.push(`currency: expected ${exp.currency}, got ${got.currency}`)

  if (exp.itemCount !== undefined && got.items.length !== exp.itemCount)
    fail.push(`itemCount: expected ${exp.itemCount}, got ${got.items.length}`)

  const first = got.items[0]
  if (first) {
    if (exp.firstItemQty !== undefined && first.quantity !== exp.firstItemQty)
      fail.push(`items[0].quantity: expected ${exp.firstItemQty}, got ${first.quantity}`)
    if (exp.firstItemPriceMin !== undefined && first.price < exp.firstItemPriceMin)
      fail.push(`items[0].price: expected ≥ ${exp.firstItemPriceMin}, got ${first.price}`)
    if (exp.firstItemPriceMax !== undefined && first.price > exp.firstItemPriceMax)
      fail.push(`items[0].price: expected ≤ ${exp.firstItemPriceMax}, got ${first.price}`)
  }

  if (exp.tax_rate !== undefined && got.tax_rate !== exp.tax_rate)
    fail.push(`tax_rate: expected ${exp.tax_rate}, got ${got.tax_rate}`)

  if (exp.hasDueDate && !got.due_date)
    fail.push(`due_date: expected a value, got null`)

  return fail
}

// ─── Runner ───────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n🧪  Extractor test suite\n' + '─'.repeat(56))

  let passed = 0
  let failed = 0

  for (const tc of CASES) {
    process.stdout.write(`  ${tc.label}… `)
    try {
      const got = await extractInvoice(tc.input, {
        defaultCurrency: tc.defaultCurrency,
        userCountry: tc.userCountry,
        today: '2026-04-29',
      })
      const failures = check(got, tc.expect)

      if (failures.length === 0) {
        console.log('✅  PASS')
        if (got?.confidence) {
          console.log(`      confidence: ${got.confidence.overall} | assumptions: ${got.confidence.assumptions.join('; ') || 'none'}`)
        }
        passed++
      } else {
        console.log('❌  FAIL')
        for (const r of failures) console.log(`      • ${r}`)
        if (got) {
          const preview = JSON.stringify({ client: got.client, currency: got.currency, items: got.items, tax_rate: got.tax_rate, due_date: got.due_date, document_type: got.document_type })
          console.log(`      Got: ${preview}`)
        }
        failed++
      }
    } catch (err) {
      console.log('💥  ERROR')
      console.log(`      ${err instanceof Error ? err.message : String(err)}`)
      failed++
    }
  }

  console.log('\n' + '─'.repeat(56))
  console.log(`  Results: ${passed}/${CASES.length} passed${failed > 0 ? `, ${failed} failed` : ' 🎉'}`)
  console.log()
  process.exit(failed > 0 ? 1 : 0)
}

run()
