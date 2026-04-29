/**
 * Manual extractor test: npx tsx scripts/test-extractor.ts
 *
 * Requires ANTHROPIC_API_KEY in .env.local (loaded via dotenv below).
 * The extractor.md prompt must be filled in before running.
 */

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { extractInvoice } from '../lib/ai/anthropic'
import type { ExtractedInvoice } from '../lib/ai/types'

// ─── Test cases ───────────────────────────────────────────────────────────────

type TestCase = {
  label: string
  input: string
  defaultCurrency: string
  expect: Partial<ExtractedInvoice> & {
    itemCount?: number
    firstItemPriceMin?: number
    firstItemPriceMax?: number
  }
}

const CASES: TestCase[] = [
  {
    label: 'English short',
    input: 'invoice ravi 50k web design',
    defaultCurrency: 'INR',
    expect: {
      clientName: 'ravi',
      currency: 'INR',
      itemCount: 1,
      firstItemPriceMin: 49999,
      firstItemPriceMax: 50001,
    },
  },
  {
    label: 'English detailed',
    input: 'Invoice John Smith for 3 hours of consulting at $150/hr and a setup fee of $200. Due in 30 days.',
    defaultCurrency: 'USD',
    expect: {
      clientName: 'john',
      currency: 'USD',
      itemCount: 2,
      firstItemPriceMin: 149,
      firstItemPriceMax: 151,
    },
  },
  {
    label: 'Hinglish',
    input: 'Ravi ko invoice bhejo — 2 lakh ka logo design',
    defaultCurrency: 'INR',
    expect: {
      clientName: 'ravi',
      currency: 'INR',
      itemCount: 1,
      firstItemPriceMin: 199999,
      firstItemPriceMax: 200001,
    },
  },
  {
    label: 'French',
    input: "Facture pour Marie — développement site web 3000 euros, délai 15 jours",
    defaultCurrency: 'EUR',
    expect: {
      clientName: 'marie',
      currency: 'EUR',
      itemCount: 1,
      firstItemPriceMin: 2999,
      firstItemPriceMax: 3001,
    },
  },
  {
    label: 'Ambiguous currency — USD inferred from $',
    input: 'Create invoice for Alex — $500 for monthly social media management',
    defaultCurrency: 'EUR',
    expect: {
      clientName: 'alex',
      currency: 'USD',
      itemCount: 1,
      firstItemPriceMin: 499,
      firstItemPriceMax: 501,
    },
  },
  {
    label: '2 lakh number parsing',
    input: 'invoice priya sharma 2.5 lakh branding project',
    defaultCurrency: 'INR',
    expect: {
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
    expect: {
      currency: 'INR',
      itemCount: 1,
      firstItemPriceMin: 7999,
      firstItemPriceMax: 8001,
    },
  },
  {
    label: 'Multiple line items',
    input: 'Invoice Carlos: UI design 2000 EUR, frontend dev 5000 EUR, 10% tax',
    defaultCurrency: 'EUR',
    expect: {
      clientName: 'carlos',
      currency: 'EUR',
      itemCount: 2,
      firstItemPriceMin: 1999,
      firstItemPriceMax: 2001,
    },
  },
]

// ─── Runner ───────────────────────────────────────────────────────────────────

type PassResult = { pass: true }
type FailResult = { pass: false; reasons: string[] }
type Result = PassResult | FailResult

function check(got: ExtractedInvoice | null, exp: TestCase['expect']): Result {
  if (!got) return { pass: false, reasons: ['extractInvoice returned null'] }

  const reasons: string[] = []

  if (exp.clientName !== undefined) {
    const gotName = (got.clientName ?? '').toLowerCase()
    if (!gotName.includes(exp.clientName.toLowerCase())) {
      reasons.push(`clientName: expected to include "${exp.clientName}", got "${got.clientName}"`)
    }
  }

  if (exp.currency !== undefined && got.currency !== exp.currency) {
    reasons.push(`currency: expected ${exp.currency}, got ${got.currency}`)
  }

  if (exp.itemCount !== undefined && got.items.length !== exp.itemCount) {
    reasons.push(`itemCount: expected ${exp.itemCount}, got ${got.items.length}`)
  }

  const firstPrice = got.items[0]?.price ?? 0
  if (exp.firstItemPriceMin !== undefined && firstPrice < exp.firstItemPriceMin) {
    reasons.push(`firstItem.price: expected ≥ ${exp.firstItemPriceMin}, got ${firstPrice}`)
  }
  if (exp.firstItemPriceMax !== undefined && firstPrice > exp.firstItemPriceMax) {
    reasons.push(`firstItem.price: expected ≤ ${exp.firstItemPriceMax}, got ${firstPrice}`)
  }

  return reasons.length === 0 ? { pass: true } : { pass: false, reasons }
}

async function run() {
  console.log('\n🧪  Extractor test suite\n' + '─'.repeat(50))

  let passed = 0
  let failed = 0

  for (const tc of CASES) {
    process.stdout.write(`  ${tc.label}… `)
    try {
      const got = await extractInvoice(tc.input, { defaultCurrency: tc.defaultCurrency })
      const result = check(got, tc.expect)

      if (result.pass) {
        console.log('✅  PASS')
        passed++
      } else {
        console.log('❌  FAIL')
        for (const r of result.reasons) console.log(`      • ${r}`)
        if (got) {
          console.log(`      Got: ${JSON.stringify(got, null, 2).replace(/\n/g, '\n      ')}`)
        }
        failed++
      }
    } catch (err) {
      console.log('💥  ERROR')
      console.log(`      ${err instanceof Error ? err.message : String(err)}`)
      failed++
    }
  }

  console.log('\n' + '─'.repeat(50))
  console.log(`  Results: ${passed}/${CASES.length} passed${failed > 0 ? `, ${failed} failed` : ''}`)
  console.log()
  process.exit(failed > 0 ? 1 : 0)
}

run()
