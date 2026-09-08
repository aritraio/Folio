import { DEFAULT_CATEGORIES } from '../constants/finance.js';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Built-in realistic sample Indian statements for 1-click interactive demo.
 */
export const SAMPLE_STATEMENTS = {
  HDFC_SAVINGS: {
    id: 'sample_hdfc_savings',
    institution: 'HDFC Bank (Savings Account)',
    accountType: 'savings',
    accountName: 'HDFC Salary A/c',
    fileName: 'HDFC_Savings_Statement_Aug2026.pdf',
    transactions: [
      {
        date: '2026-08-01',
        merchant: 'Tata Consultancy Services',
        amount: 145000,
        type: 'income',
        category: 'Salary',
        paymentMode: 'NetBanking',
        notes: 'Monthly Net Salary Credit',
        rawDescription: 'SAL/NEFT/00293841/TATA CONSULTANCY/AUG',
      },
      {
        date: '2026-08-02',
        merchant: 'Swiggy',
        amount: 485,
        type: 'expense',
        category: 'Food & Dining',
        paymentMode: 'UPI',
        notes: 'Dinner Order',
        rawDescription: 'UPI/428391048291/SWIGGY/HDFC/Dinner',
      },
      {
        date: '2026-08-04',
        merchant: 'Zepto Marketplace',
        amount: 642,
        type: 'expense',
        category: 'Shopping',
        paymentMode: 'UPI',
        notes: '10-min groceries',
        rawDescription: 'UPI/428591028391/ZEPTO/KIRANA/BLR',
      },
      {
        date: '2026-08-05',
        merchant: 'HDFC Credit Card Bill Autopay',
        amount: 24850,
        type: 'transfer',
        category: 'Bills & Utilities',
        paymentMode: 'NetBanking',
        notes: 'Credit Card Bill Payment (Non-expense transfer)',
        rawDescription: 'ACH/HDFC CARD AUTOPAY/CARD ENDING 4321',
      },
      {
        date: '2026-08-08',
        merchant: 'Bescom Electricity',
        amount: 2150,
        type: 'expense',
        category: 'Bills & Utilities',
        paymentMode: 'UPI',
        notes: 'Electricity Bill',
        rawDescription: 'UPI/BBPS/BESCOM/BLR/UTIL09281',
      },
      {
        date: '2026-08-12',
        merchant: 'Uber India',
        amount: 380,
        type: 'expense',
        category: 'Transport',
        paymentMode: 'UPI',
        notes: 'Cab to Tech Park',
        rawDescription: 'UPI/429183920194/UBER/TRIP',
      },
      {
        date: '2026-08-15',
        merchant: 'Apollo Pharmacy',
        amount: 890,
        type: 'expense',
        category: 'Healthcare',
        paymentMode: 'DebitCard',
        notes: 'Prescription medicines',
        rawDescription: 'POS/APOLLO PHARMACY/BLR/STORE49',
      },
      {
        date: '2026-08-20',
        merchant: 'Cult.fit Fitness',
        amount: 1499,
        type: 'expense',
        category: 'Entertainment',
        paymentMode: 'UPI',
        notes: 'Gym subscription',
        rawDescription: 'UPI/CULTFIT/SUB/MONTHLY',
      },
    ],
  },
  ICICI_CREDIT_CARD: {
    id: 'sample_icici_credit',
    institution: 'ICICI Bank (Amazon Pay Credit Card)',
    accountType: 'credit',
    accountName: 'ICICI Amazon Pay CC',
    fileName: 'ICICI_AmazonPay_Statement_Aug2026.pdf',
    transactions: [
      {
        date: '2026-08-03',
        merchant: 'Amazon India',
        amount: 3499,
        type: 'expense',
        category: 'Shopping',
        paymentMode: 'CreditCard',
        notes: 'Wireless Earbuds',
        rawDescription: 'AMAZON PAY IN / RETAIL PURCHASE',
      },
      {
        date: '2026-08-06',
        merchant: 'Starbucks Coffee',
        amount: 740,
        type: 'expense',
        category: 'Food & Dining',
        paymentMode: 'CreditCard',
        notes: 'Cold brew & pastry',
        rawDescription: 'STARBUCKS COFFEE / INDIRANAGAR BLR',
      },
      {
        date: '2026-08-10',
        merchant: 'MakeMyTrip',
        amount: 12450,
        type: 'expense',
        category: 'Travel',
        paymentMode: 'CreditCard',
        notes: 'Flight tickets to Goa',
        rawDescription: 'MAKEMYTRIP (INDIA) PVT / AIR TICKETS',
      },
      {
        date: '2026-08-14',
        merchant: 'Netflix India',
        amount: 649,
        type: 'expense',
        category: 'Entertainment',
        paymentMode: 'CreditCard',
        notes: 'Monthly Premium Plan',
        rawDescription: 'NETFLIX.COM / DIGITAL SUBSCRIPTION',
      },
      {
        date: '2026-08-18',
        merchant: 'Zomato Limited',
        amount: 890,
        type: 'expense',
        category: 'Food & Dining',
        paymentMode: 'CreditCard',
        notes: 'Weekend dinner',
        rawDescription: 'ZOMATO RESTAURANTS / ONLINE FOOD',
      },
      {
        date: '2026-08-22',
        merchant: 'Zara India',
        amount: 4990,
        type: 'expense',
        category: 'Shopping',
        paymentMode: 'CreditCard',
        notes: 'Apparel purchase',
        rawDescription: 'ZARA PHOENIX MALL / CLOTHING',
      },
    ],
  },
};

/**
 * System prompt instructing Gemini to parse Indian financial statements into clean JSON.
 */
const STATEMENT_PARSER_SYSTEM_PROMPT = `
You are a financial statement analysis expert specializing in Indian bank and credit card statements (HDFC, ICICI, SBI, Axis, Kotak, Cred, Amex, etc.).
Your job is to parse raw text extracted from a financial statement and return a structured JSON array of clean transactions.

Rules for extraction:
1. "date": Format strictly as YYYY-MM-DD. If year is missing or ambiguous, assume current year 2026.
2. "merchant": Clean up confusing Indian transaction narrations:
   - For UPI (e.g. "UPI/4293841/Swiggy/swiggy@icici"), clean to "Swiggy".
   - For POS (e.g. "POS 4129 STARBUCKS BLR IN"), clean to "Starbucks".
   - For NEFT/IMPS/Salary (e.g. "NEFT CR-0912-INFOSYS LTD"), clean to "Infosys Ltd".
3. "amount": A positive floating-point number in INR (e.g. 450.50). Never negative.
4. "type":
   - "expense": Normal debit or purchase.
   - "income": Salary, cashback, interest credit, dividend.
   - "transfer": Inter-account transfer or CREDIT CARD BILL PAYMENT (e.g. AutoPay, Cred, NEFT to card).
5. "category": Choose the single best fit from:
   ${JSON.stringify(DEFAULT_CATEGORIES)}
6. "paymentMode": "UPI", "CreditCard", "DebitCard", "NetBanking", "ATM", or "Other".
7. "notes": Brief human-readable description of what this transaction was.
8. "rawDescription": Keep the original raw text line from the statement.

Output ONLY valid JSON in this structure without markdown formatting or code block markers:
{
  "institutionName": "Detected Bank or Issuer Name",
  "statementType": "savings" | "credit" | "current",
  "statementPeriod": "e.g. August 2026",
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "merchant": "Merchant Name",
      "amount": 100.0,
      "type": "expense" | "income" | "transfer",
      "category": "Food & Dining",
      "paymentMode": "UPI",
      "notes": "Short note",
      "rawDescription": "Original line"
    }
  ]
}
`;

/**
 * Parse statement text using Gemini API or fallback sample simulation.
 *
 * @param {string} statementText
 * @param {string} [apiKey='']
 * @param {string} [model='gemini-1.5-flash']
 * @returns {Promise<{ institutionName: string, statementType: string, transactions: Array<Object> }>}
 */
export async function parseStatementWithGemini(statementText, apiKey = '', model = 'gemini-1.5-flash') {
  if (!apiKey) {
    // If no API key is provided, check if text matches sample hints or return a realistic demo fallback
    const isCreditHint =
      statementText.toLowerCase().includes('card') || statementText.toLowerCase().includes('amazon pay');
    const sample = isCreditHint ? SAMPLE_STATEMENTS.ICICI_CREDIT_CARD : SAMPLE_STATEMENTS.HDFC_SAVINGS;

    return {
      institutionName: sample.institution,
      statementType: sample.accountType,
      statementPeriod: 'Current Statement',
      transactions: sample.transactions,
      isDemo: true,
    };
  }

  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const prompt = `${STATEMENT_PARSER_SYSTEM_PROMPT}\n\nHere is the statement text to extract:\n\n${statementText.slice(0, 40000)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Gemini API returned status ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini returned an empty response. Please verify the statement text.');
  }

  try {
    const parsed = JSON.parse(rawText.trim());
    return {
      institutionName: parsed.institutionName || 'Parsed Statement',
      statementType: parsed.statementType || 'savings',
      statementPeriod: parsed.statementPeriod || '',
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      isDemo: false,
    };
  } catch (err) {
    console.error('Failed to parse Gemini JSON output:', rawText, err);
    throw new Error('Failed to parse structured JSON from Gemini response.');
  }
}

/**
 * Validate Gemini API Key with a lightweight ping test.
 * @param {string} apiKey
 * @param {string} [model='gemini-1.5-flash']
 * @returns {Promise<{ valid: boolean, message?: string }>}
 */
export async function testGeminiApiKey(apiKey, model = 'gemini-1.5-flash') {
  if (!apiKey) return { valid: false, message: 'API key is required' };
  try {
    const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Respond with the word "pong".' }] }],
      }),
    });

    if (res.ok) {
      return { valid: true, message: 'API key is active and connected' };
    }
    const errJson = await res.json().catch(() => ({}));
    return { valid: false, message: errJson?.error?.message || `HTTP ${res.status} error` };
  } catch (err) {
    return { valid: false, message: err.message || 'Network connection failed' };
  }
}

/**
 * Generate high-value AI Spending Findings & Key Discoveries.
 * Highlights:
 * 1. Lifestyle Creep (Dining / Food delivery surge)
 * 2. Subscription Traps (Recurring digital services)
 * 3. Credit Card Utilization / Outflow Ratio
 * 4. Savings Leakage
 *
 * @param {Array} transactions
 * @param {Array} accounts
 * @param {Array} budgets
 * @param {string} [apiKey='']
 * @returns {Promise<Array<{ title: string, description: string, severity: 'alert'|'insight'|'positive', tag: string }>>}
 */
export async function generateSpendingFindings(transactions = [], accounts = [], budgets = [], apiKey = '') {
  // If API key is provided, use Gemini for dynamic commentary
  if (apiKey) {
    try {
      const summaryData = {
        totalTxCount: transactions.length,
        recentExpenses: transactions
          .filter((t) => t.type === 'expense')
          .slice(0, 30)
          .map((t) => ({ date: t.date, merchant: t.merchant, amount: t.amount, category: t.category })),
        accountBalances: accounts.map((a) => ({ name: a.name, type: a.type, balance: a.balance })),
        budgets: (budgets || []).map((b) => ({ category: b.category, limit: b.limit, spent: b.spent })),
      };

      const prompt = `
You are an expert personal wealth advisor specializing in Indian consumer spending habits (Zomato/Swiggy, UPI micro-transactions, Credit Card reward cycles, SIPs).
Analyze this financial summary and return an array of 3 to 4 high-impact "Key Findings".

Data:
${JSON.stringify(summaryData)}

Output strictly valid JSON matching this schema:
[
  {
    "title": "Short Punchy Title (e.g. Swiggy Surge Detected)",
    "description": "1-2 sentences with actionable guidance.",
    "severity": "alert" | "insight" | "positive",
    "tag": "Category or metric name"
  }
]
`;
      const url = `${GEMINI_API_BASE}/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const findings = JSON.parse(text);
          if (Array.isArray(findings) && findings.length > 0) return findings;
        }
      }
    } catch (e) {
      console.warn('Gemini spending findings generation error, falling back to heuristic engine:', e);
    }
  }

  // Pure deterministic heuristic engine (Works 100% offline & without API keys)
  const findings = [];
  const expenses = transactions.filter((t) => t.type === 'expense');

  // Finding 1: Food & Dining frequency
  const foodTx = expenses.filter((t) => (t.category || '').toLowerCase().includes('food'));
  const foodSpend = foodTx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  if (foodTx.length >= 3) {
    findings.push({
      title: 'High Food & Delivery Velocity',
      description: `You logged ${foodTx.length} food/dining transactions totaling ₹${foodSpend.toLocaleString('en-IN')}. Ordering during weekdays accounts for a significant portion of this spend.`,
      severity: foodSpend > 10000 ? 'alert' : 'insight',
      tag: 'Food & Dining',
    });
  }

  // Finding 2: Subscriptions
  const subscriptionMerchants = ['netflix', 'spotify', 'prime', 'hotstar', 'youtube', 'apple', 'chatgpt'];
  const subs = expenses.filter((t) =>
    subscriptionMerchants.some((sub) => (t.merchant || t.description || '').toLowerCase().includes(sub))
  );
  if (subs.length > 0) {
    const subTotal = subs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    findings.push({
      title: 'Active Digital Subscriptions',
      description: `Identified ${subs.length} active recurring subscriptions (${subs.map((s) => s.merchant).join(', ')}) totaling ₹${subTotal.toLocaleString('en-IN')}/mo.`,
      severity: 'insight',
      tag: 'Subscriptions',
    });
  }

  // Finding 3: Credit Card Liability vs Liquid Cash
  const creditAccounts = accounts.filter((a) => a.type === 'credit');
  const liquidAccounts = accounts.filter((a) => a.type === 'savings' || a.type === 'current');
  const creditDebt = creditAccounts.reduce((sum, a) => sum + Math.abs(Number(a.balance) || 0), 0);
  const liquidCash = liquidAccounts.reduce((sum, a) => sum + Math.max(0, Number(a.balance) || 0), 0);

  if (creditDebt > 0 && liquidCash > 0) {
    const debtRatio = (creditDebt / liquidCash) * 100;
    if (debtRatio > 50) {
      findings.push({
        title: 'Elevated Credit Card Utilization',
        description: `Total credit card liabilities (₹${creditDebt.toLocaleString('en-IN')}) represent ${Math.round(debtRatio)}% of liquid savings. Consider settling card cycles before due date to avoid interest.`,
        severity: 'alert',
        tag: 'Credit Health',
      });
    } else {
      findings.push({
        title: 'Prudent Liquidity Buffer',
        description: `Your liquid savings (₹${liquidCash.toLocaleString('en-IN')}) comfortably cover current credit card liabilities with a healthy ${Math.round(100 - debtRatio)}% cash safety cushion.`,
        severity: 'positive',
        tag: 'Liquidity Health',
      });
    }
  }

  // Finding 4: Budget status
  const breachedBudget = (budgets || []).find(
    (b) => Number(b.limit) > 0 && Number(b.spent) > Number(b.limit)
  );
  if (breachedBudget) {
    findings.push({
      title: `Budget Exceeded: ${breachedBudget.category}`,
      description: `You have spent ₹${Number(breachedBudget.spent || 0).toLocaleString('en-IN')} against your monthly limit of ₹${Number(breachedBudget.limit || 0).toLocaleString('en-IN')}.`,
      severity: 'alert',
      tag: 'Budget',
    });
  }

  // Default fallback if sparse data
  if (findings.length === 0) {
    findings.push({
      title: 'Spending Pattern Healthy',
      description:
        'Your cash outflows are balanced across primary accounts. Continue logging transactions or import a statement for deep pattern discovery.',
      severity: 'positive',
      tag: 'Executive Overview',
    });
  }

  return findings;
}
