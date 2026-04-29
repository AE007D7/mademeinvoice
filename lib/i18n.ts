export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
] as const

export type LangCode = (typeof LANGUAGES)[number]['code']

// ─── Invoice label translations ───────────────────────────────────────────────

export type InvoiceT = {
  invoice: string
  estimation: string
  billTo: string
  from: string
  description: string
  qty: string
  price: string
  lineTotal: string
  subtotal: string
  tax: string
  total: string
  amountDue: string
  notes: string
  paymentDetails: string
  thankYou: string
  issueDate: string
  dueDate: string
  dir: 'ltr' | 'rtl'
}

export const INVOICE_T: Record<LangCode, InvoiceT> = {
  en: {
    invoice: 'Invoice', estimation: 'Estimate', billTo: 'Bill To', from: 'From',
    description: 'Description', qty: 'Qty', price: 'Price', lineTotal: 'Total',
    subtotal: 'Subtotal', tax: 'Tax', total: 'Total', amountDue: 'Amount Due',
    notes: 'Notes', paymentDetails: 'Payment Details',
    thankYou: 'Thank you for your business.',
    issueDate: 'Date', dueDate: 'Due', dir: 'ltr',
  },
  fr: {
    invoice: 'Facture', estimation: 'Devis', billTo: 'Facturer à', from: 'De',
    description: 'Description', qty: 'Qté', price: 'Prix', lineTotal: 'Total',
    subtotal: 'Sous-total', tax: 'TVA', total: 'Total', amountDue: 'Montant dû',
    notes: 'Notes', paymentDetails: 'Informations de paiement',
    thankYou: 'Merci pour votre confiance.',
    issueDate: 'Date', dueDate: 'Échéance', dir: 'ltr',
  },
  es: {
    invoice: 'Factura', estimation: 'Presupuesto', billTo: 'Facturar a', from: 'De',
    description: 'Descripción', qty: 'Cant.', price: 'Precio', lineTotal: 'Total',
    subtotal: 'Subtotal', tax: 'IVA', total: 'Total', amountDue: 'Total a pagar',
    notes: 'Notas', paymentDetails: 'Datos de pago',
    thankYou: 'Gracias por su confianza.',
    issueDate: 'Fecha', dueDate: 'Vence', dir: 'ltr',
  },
  de: {
    invoice: 'Rechnung', estimation: 'Kostenvoranschlag', billTo: 'Rechnungsempfänger', from: 'Von',
    description: 'Beschreibung', qty: 'Menge', price: 'Preis', lineTotal: 'Betrag',
    subtotal: 'Zwischensumme', tax: 'MwSt.', total: 'Gesamt', amountDue: 'Fälliger Betrag',
    notes: 'Hinweise', paymentDetails: 'Zahlungsdetails',
    thankYou: 'Vielen Dank für Ihr Vertrauen.',
    issueDate: 'Datum', dueDate: 'Fällig', dir: 'ltr',
  },
  ar: {
    invoice: 'فاتورة', estimation: 'تقدير', billTo: 'فاتورة إلى', from: 'من',
    description: 'الوصف', qty: 'الكمية', price: 'السعر', lineTotal: 'المجموع',
    subtotal: 'المجموع الفرعي', tax: 'الضريبة', total: 'الإجمالي', amountDue: 'المبلغ المستحق',
    notes: 'ملاحظات', paymentDetails: 'تفاصيل الدفع',
    thankYou: 'شكراً لتعاملكم معنا.',
    issueDate: 'التاريخ', dueDate: 'الاستحقاق', dir: 'rtl',
  },
  pt: {
    invoice: 'Fatura', estimation: 'Orçamento', billTo: 'Faturar a', from: 'De',
    description: 'Descrição', qty: 'Qtd.', price: 'Preço', lineTotal: 'Total',
    subtotal: 'Subtotal', tax: 'IVA', total: 'Total', amountDue: 'Valor a pagar',
    notes: 'Observações', paymentDetails: 'Dados de pagamento',
    thankYou: 'Obrigado pela sua preferência.',
    issueDate: 'Data', dueDate: 'Vence em', dir: 'ltr',
  },
  it: {
    invoice: 'Fattura', estimation: 'Preventivo', billTo: 'Intestata a', from: 'Da',
    description: 'Descrizione', qty: 'Qtà', price: 'Prezzo', lineTotal: 'Totale',
    subtotal: 'Subtotale', tax: 'IVA', total: 'Totale', amountDue: 'Importo dovuto',
    notes: 'Note', paymentDetails: 'Dettagli pagamento',
    thankYou: 'Grazie per la fiducia.',
    issueDate: 'Data', dueDate: 'Scadenza', dir: 'ltr',
  },
}

export function getInvoiceT(lang?: string | null): InvoiceT {
  return INVOICE_T[(lang ?? 'en') as LangCode] ?? INVOICE_T.en
}

// ─── UI translations ──────────────────────────────────────────────────────────

export type UiT = {
  nav: { dashboard: string; invoices: string; estimations: string; clients: string; products: string; analytics: string; settings: string; billing: string; chat: string; logout: string }
  invoices: {
    title: string; newInvoice: string; allInvoices: string
    noInvoices: string; createFirst: string
    cols: { number: string; client: string; date: string; amount: string; status: string }
    status: { draft: string; sent: string; paid: string; overdue: string }
    markPaid: string; view: string; paid: string
  }
  clients: {
    title: string; newClient: string; allClients: string; noClients: string; addFirst: string
    colName: string; colEmail: string; colAddress: string; edit: string; invoice: string
  }
  estimations: {
    title: string; newEstimation: string; allEstimations: string
    noEstimations: string; createFirst: string; colNumber: string
  }
  dashboard: {
    title: string; totalRevenue: string; fromPaid: string
    pending: string; awaitingPayment: string
    clients: string; totalClients: string
    invoices: string; allTime: string
    recentInvoices: string; viewAll: string
    noInvoices: string; createFirst: string; noClient: string
    trialEndsIn: string; day: string; days: string
    upgradePro: string; keepAccess: string
  }
  settings: {
    title: string; subtitle: string; account: string; plan: string; trialActive: string
    branding: string; companyName: string; phone: string; email: string
    website: string; address: string; logo: string; watermark: string
    watermarkHint: string; logoHint: string
    payment: string; paymentHint: string
    invoiceLang: string; uiLang: string; language: string
    save: string; saving: string; saved: string
  }
  common: { view: string; cancel: string; save: string; saving: string; error: string; loading: string }
}

export const UI_T: Record<LangCode, UiT> = {
  en: {
    nav: { dashboard: 'Dashboard', invoices: 'Invoices', estimations: 'Estimates', clients: 'Clients', products: 'Products', analytics: 'Analytics', settings: 'Settings', billing: 'Billing', chat: 'Make Invoice with AI', logout: 'Log out' },
    invoices: {
      title: 'Invoices', newInvoice: 'New Invoice', allInvoices: 'All Invoices',
      noInvoices: 'No invoices yet.', createFirst: 'Create your first invoice',
      cols: { number: 'Invoice #', client: 'Client', date: 'Date', amount: 'Amount', status: 'Status' },
      status: { draft: 'Draft', sent: 'Sent', paid: 'Paid', overdue: 'Overdue' },
      markPaid: 'Paid', view: 'View', paid: 'Paid',
    },
    clients: { title: 'Clients', newClient: 'New Client', allClients: 'All Clients', noClients: 'No clients yet.', addFirst: 'Add your first client', colName: 'Name', colEmail: 'Email', colAddress: 'Address', edit: 'Edit', invoice: 'Invoice' },
    estimations: { title: 'Estimates', newEstimation: 'New Estimate', allEstimations: 'All Estimates', noEstimations: 'No estimates yet.', createFirst: 'Create your first estimate', colNumber: 'Estimate #' },
    dashboard: { title: 'Dashboard', totalRevenue: 'Total Revenue', fromPaid: 'From paid invoices', pending: 'Pending', awaitingPayment: 'Awaiting payment', clients: 'Clients', totalClients: 'Total clients', invoices: 'Invoices', allTime: 'All time', recentInvoices: 'Recent Invoices', viewAll: 'View all', noInvoices: 'No invoices yet.', createFirst: 'Create your first invoice', noClient: 'No client', trialEndsIn: 'Your free trial ends in', day: 'day', days: 'days', upgradePro: 'Upgrade to Pro', keepAccess: 'to keep unlimited access.' },
    settings: {
      title: 'Settings', subtitle: 'Manage your account and branding.',
      account: 'Account', plan: 'Plan', trialActive: 'Trial active',
      branding: 'Branding', companyName: 'Company Name', phone: 'Phone', email: 'Email',
      website: 'Website', address: 'Business Address', logo: 'Logo', watermark: 'Watermark',
      watermarkHint: 'Appears faintly behind invoice content.', logoHint: 'Upload a new file to replace it.',
      payment: 'Payment Info (shown on invoices)', paymentHint: 'Shown on invoices for client payments.',
      invoiceLang: 'Invoice Language', uiLang: 'Interface Language', language: 'Language',
      save: 'Save Branding', saving: 'Saving…', saved: 'Branding saved successfully.',
    },
    common: { view: 'View', cancel: 'Cancel', save: 'Save', saving: 'Saving…', error: 'An error occurred.', loading: 'Loading…' },
  },
  fr: {
    nav: { dashboard: 'Tableau de bord', invoices: 'Factures', estimations: 'Devis', clients: 'Clients', products: 'Produits', analytics: 'Analytique', settings: 'Paramètres', billing: 'Facturation', chat: 'Facture avec IA', logout: 'Déconnexion' },
    invoices: {
      title: 'Factures', newInvoice: 'Nouvelle facture', allInvoices: 'Toutes les factures',
      noInvoices: 'Aucune facture.', createFirst: 'Créer votre première facture',
      cols: { number: 'Facture n°', client: 'Client', date: 'Date', amount: 'Montant', status: 'Statut' },
      status: { draft: 'Brouillon', sent: 'Envoyée', paid: 'Payée', overdue: 'En retard' },
      markPaid: 'Payée', view: 'Voir', paid: 'Payée',
    },
    clients: { title: 'Clients', newClient: 'Nouveau client', allClients: 'Tous les clients', noClients: 'Aucun client.', addFirst: 'Ajoutez votre premier client', colName: 'Nom', colEmail: 'E-mail', colAddress: 'Adresse', edit: 'Modifier', invoice: 'Facturer' },
    estimations: { title: 'Devis', newEstimation: 'Nouveau devis', allEstimations: 'Tous les devis', noEstimations: 'Aucun devis.', createFirst: 'Créer votre premier devis', colNumber: 'Devis n°' },
    dashboard: { title: 'Tableau de bord', totalRevenue: 'Revenus totaux', fromPaid: 'Factures payées', pending: 'En attente', awaitingPayment: 'En attente de paiement', clients: 'Clients', totalClients: 'Total clients', invoices: 'Factures', allTime: 'Tous les temps', recentInvoices: 'Factures récentes', viewAll: 'Voir tout', noInvoices: 'Aucune facture.', createFirst: 'Créer votre première facture', noClient: 'Sans client', trialEndsIn: 'Votre essai gratuit se termine dans', day: 'jour', days: 'jours', upgradePro: 'Passer à Pro', keepAccess: 'pour conserver un accès illimité.' },
    settings: {
      title: 'Paramètres', subtitle: 'Gérez votre compte et votre identité visuelle.',
      account: 'Compte', plan: 'Abonnement', trialActive: 'Essai actif',
      branding: 'Identité visuelle', companyName: 'Nom de la société', phone: 'Téléphone', email: 'E-mail',
      website: 'Site web', address: 'Adresse professionnelle', logo: 'Logo', watermark: 'Filigrane',
      watermarkHint: 'Apparaît en filigrane sur les factures.', logoHint: 'Téléversez un nouveau fichier pour le remplacer.',
      payment: 'Informations de paiement (sur les factures)', paymentHint: 'Affiché sur les factures.',
      invoiceLang: 'Langue des factures', uiLang: "Langue de l'interface", language: 'Langue',
      save: 'Enregistrer', saving: 'Enregistrement…', saved: 'Paramètres sauvegardés.',
    },
    common: { view: 'Voir', cancel: 'Annuler', save: 'Enregistrer', saving: 'Enregistrement…', error: 'Une erreur est survenue.', loading: 'Chargement…' },
  },
  es: {
    nav: { dashboard: 'Panel', invoices: 'Facturas', estimations: 'Presupuestos', clients: 'Clientes', products: 'Productos', analytics: 'Analíticas', settings: 'Ajustes', billing: 'Facturación', chat: 'Factura con IA', logout: 'Cerrar sesión' },
    invoices: {
      title: 'Facturas', newInvoice: 'Nueva factura', allInvoices: 'Todas las facturas',
      noInvoices: 'Sin facturas.', createFirst: 'Crea tu primera factura',
      cols: { number: 'Factura n°', client: 'Cliente', date: 'Fecha', amount: 'Importe', status: 'Estado' },
      status: { draft: 'Borrador', sent: 'Enviada', paid: 'Pagada', overdue: 'Vencida' },
      markPaid: 'Pagada', view: 'Ver', paid: 'Pagada',
    },
    clients: { title: 'Clientes', newClient: 'Nuevo cliente', allClients: 'Todos los clientes', noClients: 'Sin clientes.', addFirst: 'Añade tu primer cliente', colName: 'Nombre', colEmail: 'Correo', colAddress: 'Dirección', edit: 'Editar', invoice: 'Facturar' },
    estimations: { title: 'Presupuestos', newEstimation: 'Nuevo presupuesto', allEstimations: 'Todos los presupuestos', noEstimations: 'Sin presupuestos.', createFirst: 'Crea tu primer presupuesto', colNumber: 'Presupuesto n°' },
    dashboard: { title: 'Panel', totalRevenue: 'Ingresos totales', fromPaid: 'Facturas pagadas', pending: 'Pendiente', awaitingPayment: 'Esperando pago', clients: 'Clientes', totalClients: 'Total clientes', invoices: 'Facturas', allTime: 'Todos los tiempos', recentInvoices: 'Facturas recientes', viewAll: 'Ver todo', noInvoices: 'Sin facturas.', createFirst: 'Crea tu primera factura', noClient: 'Sin cliente', trialEndsIn: 'Tu período de prueba termina en', day: 'día', days: 'días', upgradePro: 'Actualizar a Pro', keepAccess: 'para mantener acceso ilimitado.' },
    settings: {
      title: 'Ajustes', subtitle: 'Gestiona tu cuenta y marca.',
      account: 'Cuenta', plan: 'Plan', trialActive: 'Prueba activa',
      branding: 'Marca', companyName: 'Nombre de la empresa', phone: 'Teléfono', email: 'Correo',
      website: 'Sitio web', address: 'Dirección comercial', logo: 'Logo', watermark: 'Marca de agua',
      watermarkHint: 'Aparece en el fondo de las facturas.', logoHint: 'Sube un nuevo archivo para reemplazarlo.',
      payment: 'Información de pago (en facturas)', paymentHint: 'Se muestra en las facturas.',
      invoiceLang: 'Idioma de facturas', uiLang: 'Idioma de la interfaz', language: 'Idioma',
      save: 'Guardar', saving: 'Guardando…', saved: 'Ajustes guardados.',
    },
    common: { view: 'Ver', cancel: 'Cancelar', save: 'Guardar', saving: 'Guardando…', error: 'Ocurrió un error.', loading: 'Cargando…' },
  },
  de: {
    nav: { dashboard: 'Dashboard', invoices: 'Rechnungen', estimations: 'Angebote', clients: 'Kunden', products: 'Produkte', analytics: 'Analytik', settings: 'Einstellungen', billing: 'Abrechnung', chat: 'Rechnung per KI', logout: 'Abmelden' },
    invoices: {
      title: 'Rechnungen', newInvoice: 'Neue Rechnung', allInvoices: 'Alle Rechnungen',
      noInvoices: 'Noch keine Rechnungen.', createFirst: 'Erste Rechnung erstellen',
      cols: { number: 'Rechnungs-Nr.', client: 'Kunde', date: 'Datum', amount: 'Betrag', status: 'Status' },
      status: { draft: 'Entwurf', sent: 'Gesendet', paid: 'Bezahlt', overdue: 'Überfällig' },
      markPaid: 'Bezahlt', view: 'Ansehen', paid: 'Bezahlt',
    },
    clients: { title: 'Kunden', newClient: 'Neuer Kunde', allClients: 'Alle Kunden', noClients: 'Noch keine Kunden.', addFirst: 'Ersten Kunden hinzufügen', colName: 'Name', colEmail: 'E-Mail', colAddress: 'Adresse', edit: 'Bearbeiten', invoice: 'Rechnung' },
    estimations: { title: 'Angebote', newEstimation: 'Neues Angebot', allEstimations: 'Alle Angebote', noEstimations: 'Noch keine Angebote.', createFirst: 'Erstes Angebot erstellen', colNumber: 'Angebot-Nr.' },
    dashboard: { title: 'Dashboard', totalRevenue: 'Gesamtumsatz', fromPaid: 'Bezahlte Rechnungen', pending: 'Ausstehend', awaitingPayment: 'Wartet auf Zahlung', clients: 'Kunden', totalClients: 'Alle Kunden', invoices: 'Rechnungen', allTime: 'Gesamt', recentInvoices: 'Letzte Rechnungen', viewAll: 'Alle anzeigen', noInvoices: 'Noch keine Rechnungen.', createFirst: 'Erste Rechnung erstellen', noClient: 'Kein Kunde', trialEndsIn: 'Ihr kostenloser Test endet in', day: 'Tag', days: 'Tagen', upgradePro: 'Auf Pro upgraden', keepAccess: 'für unbegrenzten Zugang.' },
    settings: {
      title: 'Einstellungen', subtitle: 'Konto und Branding verwalten.',
      account: 'Konto', plan: 'Plan', trialActive: 'Testphase aktiv',
      branding: 'Branding', companyName: 'Firmenname', phone: 'Telefon', email: 'E-Mail',
      website: 'Website', address: 'Geschäftsadresse', logo: 'Logo', watermark: 'Wasserzeichen',
      watermarkHint: 'Erscheint als Wasserzeichen auf Rechnungen.', logoHint: 'Neue Datei hochladen zum Ersetzen.',
      payment: 'Zahlungsinformationen (auf Rechnungen)', paymentHint: 'Wird auf Rechnungen angezeigt.',
      invoiceLang: 'Rechnungssprache', uiLang: 'Oberflächensprache', language: 'Sprache',
      save: 'Speichern', saving: 'Speichern…', saved: 'Einstellungen gespeichert.',
    },
    common: { view: 'Ansehen', cancel: 'Abbrechen', save: 'Speichern', saving: 'Speichern…', error: 'Ein Fehler ist aufgetreten.', loading: 'Laden…' },
  },
  ar: {
    nav: { dashboard: 'لوحة التحكم', invoices: 'الفواتير', estimations: 'عروض الأسعار', clients: 'العملاء', products: 'المنتجات', analytics: 'التحليلات', settings: 'الإعدادات', billing: 'الفوترة', chat: 'فاتورة بالذكاء الاصطناعي', logout: 'تسجيل الخروج' },
    invoices: {
      title: 'الفواتير', newInvoice: 'فاتورة جديدة', allInvoices: 'جميع الفواتير',
      noInvoices: 'لا توجد فواتير بعد.', createFirst: 'أنشئ فاتورتك الأولى',
      cols: { number: 'رقم الفاتورة', client: 'العميل', date: 'التاريخ', amount: 'المبلغ', status: 'الحالة' },
      status: { draft: 'مسودة', sent: 'مرسلة', paid: 'مدفوعة', overdue: 'متأخرة' },
      markPaid: 'مدفوعة', view: 'عرض', paid: 'مدفوعة',
    },
    clients: { title: 'العملاء', newClient: 'عميل جديد', allClients: 'جميع العملاء', noClients: 'لا يوجد عملاء بعد.', addFirst: 'أضف أول عميل', colName: 'الاسم', colEmail: 'البريد الإلكتروني', colAddress: 'العنوان', edit: 'تعديل', invoice: 'فاتورة' },
    estimations: { title: 'عروض الأسعار', newEstimation: 'عرض جديد', allEstimations: 'جميع العروض', noEstimations: 'لا توجد عروض بعد.', createFirst: 'أنشئ أول عرض', colNumber: 'رقم العرض' },
    dashboard: { title: 'لوحة التحكم', totalRevenue: 'إجمالي الإيرادات', fromPaid: 'من الفواتير المدفوعة', pending: 'معلق', awaitingPayment: 'في انتظار الدفع', clients: 'العملاء', totalClients: 'إجمالي العملاء', invoices: 'الفواتير', allTime: 'الكل', recentInvoices: 'الفواتير الأخيرة', viewAll: 'عرض الكل', noInvoices: 'لا توجد فواتير بعد.', createFirst: 'أنشئ أول فاتورة', noClient: 'بدون عميل', trialEndsIn: 'تنتهي تجربتك المجانية خلال', day: 'يوم', days: 'أيام', upgradePro: 'الترقية إلى Pro', keepAccess: 'للحفاظ على وصول غير محدود.' },
    settings: {
      title: 'الإعدادات', subtitle: 'إدارة حسابك وهويتك البصرية.',
      account: 'الحساب', plan: 'الباقة', trialActive: 'التجربة نشطة',
      branding: 'الهوية البصرية', companyName: 'اسم الشركة', phone: 'الهاتف', email: 'البريد الإلكتروني',
      website: 'الموقع الإلكتروني', address: 'العنوان التجاري', logo: 'الشعار', watermark: 'العلامة المائية',
      watermarkHint: 'تظهر خلف محتوى الفاتورة.', logoHint: 'ارفع ملفاً جديداً للاستبدال.',
      payment: 'معلومات الدفع (على الفواتير)', paymentHint: 'تظهر على الفواتير.',
      invoiceLang: 'لغة الفاتورة', uiLang: 'لغة الواجهة', language: 'اللغة',
      save: 'حفظ', saving: 'جارٍ الحفظ…', saved: 'تم الحفظ بنجاح.',
    },
    common: { view: 'عرض', cancel: 'إلغاء', save: 'حفظ', saving: 'جارٍ الحفظ…', error: 'حدث خطأ.', loading: 'تحميل…' },
  },
  pt: {
    nav: { dashboard: 'Painel', invoices: 'Faturas', estimations: 'Orçamentos', clients: 'Clientes', products: 'Produtos', analytics: 'Análises', settings: 'Configurações', billing: 'Faturamento', chat: 'Fatura com IA', logout: 'Sair' },
    invoices: {
      title: 'Faturas', newInvoice: 'Nova fatura', allInvoices: 'Todas as faturas',
      noInvoices: 'Nenhuma fatura ainda.', createFirst: 'Crie sua primeira fatura',
      cols: { number: 'Fatura n°', client: 'Cliente', date: 'Data', amount: 'Valor', status: 'Status' },
      status: { draft: 'Rascunho', sent: 'Enviada', paid: 'Paga', overdue: 'Vencida' },
      markPaid: 'Paga', view: 'Ver', paid: 'Paga',
    },
    clients: { title: 'Clientes', newClient: 'Novo cliente', allClients: 'Todos os clientes', noClients: 'Nenhum cliente ainda.', addFirst: 'Adicione seu primeiro cliente', colName: 'Nome', colEmail: 'E-mail', colAddress: 'Endereço', edit: 'Editar', invoice: 'Faturar' },
    estimations: { title: 'Orçamentos', newEstimation: 'Novo orçamento', allEstimations: 'Todos os orçamentos', noEstimations: 'Nenhum orçamento ainda.', createFirst: 'Crie seu primeiro orçamento', colNumber: 'Orçamento n°' },
    dashboard: { title: 'Painel', totalRevenue: 'Receita total', fromPaid: 'De faturas pagas', pending: 'Pendente', awaitingPayment: 'Aguardando pagamento', clients: 'Clientes', totalClients: 'Total de clientes', invoices: 'Faturas', allTime: 'Todos os tempos', recentInvoices: 'Faturas recentes', viewAll: 'Ver tudo', noInvoices: 'Nenhuma fatura ainda.', createFirst: 'Crie sua primeira fatura', noClient: 'Sem cliente', trialEndsIn: 'Seu período de teste termina em', day: 'dia', days: 'dias', upgradePro: 'Upgrade para Pro', keepAccess: 'para manter acesso ilimitado.' },
    settings: {
      title: 'Configurações', subtitle: 'Gerencie sua conta e identidade visual.',
      account: 'Conta', plan: 'Plano', trialActive: 'Período de teste ativo',
      branding: 'Identidade visual', companyName: 'Nome da empresa', phone: 'Telefone', email: 'E-mail',
      website: 'Site', address: 'Endereço comercial', logo: 'Logotipo', watermark: 'Marca d\'água',
      watermarkHint: 'Aparece atrás do conteúdo da fatura.', logoHint: 'Envie um novo arquivo para substituir.',
      payment: 'Informações de pagamento (nas faturas)', paymentHint: 'Exibido nas faturas.',
      invoiceLang: 'Idioma da fatura', uiLang: 'Idioma da interface', language: 'Idioma',
      save: 'Salvar', saving: 'Salvando…', saved: 'Configurações salvas.',
    },
    common: { view: 'Ver', cancel: 'Cancelar', save: 'Salvar', saving: 'Salvando…', error: 'Ocorreu um erro.', loading: 'Carregando…' },
  },
  it: {
    nav: { dashboard: 'Dashboard', invoices: 'Fatture', estimations: 'Preventivi', clients: 'Clienti', products: 'Prodotti', analytics: 'Analisi', settings: 'Impostazioni', billing: 'Abbonamento', chat: 'Fattura con IA', logout: 'Esci' },
    invoices: {
      title: 'Fatture', newInvoice: 'Nuova fattura', allInvoices: 'Tutte le fatture',
      noInvoices: 'Nessuna fattura.', createFirst: 'Crea la tua prima fattura',
      cols: { number: 'Fattura n°', client: 'Cliente', date: 'Data', amount: 'Importo', status: 'Stato' },
      status: { draft: 'Bozza', sent: 'Inviata', paid: 'Pagata', overdue: 'Scaduta' },
      markPaid: 'Pagata', view: 'Visualizza', paid: 'Pagata',
    },
    clients: { title: 'Clienti', newClient: 'Nuovo cliente', allClients: 'Tutti i clienti', noClients: 'Nessun cliente.', addFirst: 'Aggiungi il primo cliente', colName: 'Nome', colEmail: 'Email', colAddress: 'Indirizzo', edit: 'Modifica', invoice: 'Fattura' },
    estimations: { title: 'Preventivi', newEstimation: 'Nuovo preventivo', allEstimations: 'Tutti i preventivi', noEstimations: 'Nessun preventivo.', createFirst: 'Crea il tuo primo preventivo', colNumber: 'Preventivo n°' },
    dashboard: { title: 'Dashboard', totalRevenue: 'Ricavi totali', fromPaid: 'Fatture pagate', pending: 'In sospeso', awaitingPayment: 'In attesa di pagamento', clients: 'Clienti', totalClients: 'Totale clienti', invoices: 'Fatture', allTime: 'Tutto il tempo', recentInvoices: 'Fatture recenti', viewAll: 'Vedi tutto', noInvoices: 'Nessuna fattura.', createFirst: 'Crea la tua prima fattura', noClient: 'Nessun cliente', trialEndsIn: 'Il tuo periodo di prova termina tra', day: 'giorno', days: 'giorni', upgradePro: 'Aggiorna a Pro', keepAccess: 'per mantenere accesso illimitato.' },
    settings: {
      title: 'Impostazioni', subtitle: 'Gestisci account e branding.',
      account: 'Account', plan: 'Piano', trialActive: 'Prova attiva',
      branding: 'Branding', companyName: 'Nome azienda', phone: 'Telefono', email: 'Email',
      website: 'Sito web', address: 'Indirizzo aziendale', logo: 'Logo', watermark: 'Filigrana',
      watermarkHint: 'Appare in filigrana sulle fatture.', logoHint: 'Carica un nuovo file per sostituirlo.',
      payment: 'Dati di pagamento (sulle fatture)', paymentHint: 'Visualizzato sulle fatture.',
      invoiceLang: 'Lingua fattura', uiLang: "Lingua interfaccia", language: 'Lingua',
      save: 'Salva', saving: 'Salvataggio…', saved: 'Impostazioni salvate.',
    },
    common: { view: 'Visualizza', cancel: 'Annulla', save: 'Salva', saving: 'Salvataggio…', error: 'Si è verificato un errore.', loading: 'Caricamento…' },
  },
}

export function getUiT(lang?: string | null): UiT {
  return UI_T[(lang ?? 'en') as LangCode] ?? UI_T.en
}
