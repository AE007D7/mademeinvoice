# Extractor prompt — placeholder

Replace this file with your extraction prompt before running tests.

The prompt should instruct the model to:
- Parse the user's natural-language invoice request
- Return ONLY a raw JSON object (no markdown fences, no explanation)
- Handle number formats: "50k" → 50000, "2 lakh" → 200000, "1.5k" → 1500
- Use the provided default currency if none is mentioned
- Return this exact shape:

```json
{
  "clientName": "Ravi",
  "items": [
    { "description": "Web design", "quantity": 1, "price": 50000 }
  ],
  "currency": "INR",
  "taxRate": 0,
  "dueDate": null,
  "notes": null
}
```
