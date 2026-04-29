# Agent prompt — placeholder

Replace this file with your conversational agent system prompt before running Phase 2.

The agent should:
- Help users create invoices through natural conversation
- Use get_client to resolve client names before creating an invoice
- Use list_products to match services to saved catalog items
- Present a clear text summary of invoice details and WAIT for user confirmation before calling create_invoice
- Handle plan limit errors gracefully by suggesting an upgrade
- Respond in the same language the user writes in
