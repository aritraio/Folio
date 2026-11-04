// General education only. Keep numerical tax rates/limits out of evergreen lessons.
export const lessons = [
  {
    id: 'budget',
    category: 'Money habits',
    title: 'A budget that fits real life',
    minutes: 3,
    summary: 'Understand income, needs, wants and a little breathing room.',
    sections: [
      [
        'Start with what actually arrives',
        'Use take-home income, then list essential bills and flexible spending. A budget is a plan you can adjust, not a score of how well you are doing.',
      ],
      [
        'Give irregular costs a place',
        'Set money aside for expenses such as annual fees and repairs. Review recent transactions before setting a limit so the plan is realistic.',
      ],
      [
        'Try one small change',
        'Pick one flexible category and choose a manageable reduction. Check the result next month. Moving money between your own accounts is not new income.',
      ],
    ],
    question: 'Which is new income?',
    options: ['Moving money to another bank account', 'Your salary arriving', 'Withdrawing cash'],
    answer: 1,
    source: 'SEBI financial education',
    url: 'https://investor.sebi.gov.in/pdf/downloadable-documents/Financial%20Education%20Booklet%20-%20English.pdf',
  },
  {
    id: 'tax',
    category: 'Tax basics · India',
    title: 'Understand tax before trying to save it',
    minutes: 4,
    summary: 'Taxable income, regimes and the records worth keeping.',
    sections: [
      [
        'Income and tax are different numbers',
        'Taxable income is determined under applicable rules. A deduction reduces eligible taxable income; it does not automatically reduce the final tax bill by the same amount.',
      ],
      [
        'Compare before choosing',
        'India’s old and new tax regimes differ in rates and the deductions they permit. Check the applicable tax year, your eligibility and the official calculator before making a choice. This lesson does not calculate your liability.',
      ],
      [
        'Build a simple document habit',
        'Keep salary records, interest statements and evidence for claims you may be eligible to make. A bank statement alone does not establish whether a payment qualifies. Check current Income Tax Department guidance or a qualified professional for your circumstances.',
      ],
    ],
    question: 'Does a deduction always save its full amount in tax?',
    options: [
      'Yes, every deduction is a refund',
      'No, its effect depends on the applicable rules and tax calculation',
      'Only if paid in cash',
    ],
    answer: 1,
    source: 'Income Tax Department · regime FAQs',
    url: 'https://www.incometax.gov.in/iec/foportal/help/new-tax-vs-old-tax-regime-faqs',
  },
  {
    id: 'tax-saving',
    category: 'Tax basics · India',
    title: 'A sensible approach to tax saving',
    minutes: 3,
    summary: 'Eligibility first. Product suitability second. No last-minute rush.',
    sections: [
      [
        'Check whether a benefit applies',
        'Tax benefits depend on your tax year, regime and personal eligibility. Do not assume an investment qualifies because it is marketed as tax saving. Use official guidance for current limits and conditions.',
      ],
      [
        'Look beyond the tax label',
        'Compare lock-in, fees, liquidity and risk. A tax benefit does not make an unsuitable product suitable, and spending money only to claim a benefit can leave you worse off.',
      ],
      [
        'Plan, document, review',
        'Make a list of relevant income and eligible claims, retain evidence, and compare the full tax calculation. Folio records money movement; it does not verify claims or file returns.',
      ],
    ],
    question: 'What should you check before buying a tax-saving product?',
    options: [
      'Only the advertised deduction',
      'Eligibility, lock-in, risk, fees and suitability',
      'Whether a friend bought it',
    ],
    answer: 1,
    source: 'Income Tax Department · official guidance',
    url: 'https://www.incometax.gov.in/iec/foportal/help/new-tax-vs-old-tax-regime-faqs',
  },
  {
    id: 'mutual-funds',
    category: 'Investing basics',
    title: 'Mutual funds, in plain language',
    minutes: 4,
    summary: 'A pooled investment, not a guaranteed return.',
    sections: [
      [
        'One fund, many investments',
        'A mutual fund pools investors’ money and invests according to its stated objective. Equity, debt and other fund types hold different assets and carry different risks.',
      ],
      [
        'Know what a SIP is',
        'A systematic investment plan is a way to invest regularly. It is not a separate asset class and it does not guarantee profits or protect against every loss.',
      ],
      [
        'Read before investing',
        'Review the objective, portfolio, risk disclosures, costs and withdrawal conditions. Funds can lose value; several funds holding the same securities may provide less diversification than you expect.',
      ],
    ],
    question: 'What does a SIP guarantee?',
    options: ['A fixed positive return', 'No losses', 'Neither; it is a way to invest regularly'],
    answer: 2,
    source: 'AMFI · introduction to mutual funds',
    url: 'https://www.amfiindia.com/investor/knowledge-center-info?zoneName=IntroductionMutualFunds',
  },
  {
    id: 'stocks',
    category: 'Investing basics',
    title: 'What owning a stock means',
    minutes: 3,
    summary: 'A small ownership stake, with real uncertainty.',
    sections: [
      [
        'You own part of a business',
        'A share represents an ownership interest in a company. Its market price can change for business, market and economic reasons. Dividends are not assured.',
      ],
      [
        'Price is not a promise',
        'Past price increases do not establish future returns. Concentrating money in one company exposes you to that company’s risks. Keep your time horizon and capacity for loss in mind.',
      ],
      [
        'Learn before taking risk',
        'Understand the business, disclosures, fees and risks. Avoid tips promising assured returns. Folio tracks manually entered holdings; it does not recommend trades or execute orders.',
      ],
    ],
    question: 'Does past performance guarantee future returns?',
    options: ['Yes', 'No', 'Only for well-known companies'],
    answer: 1,
    source: 'SEBI Investor · factors before investing',
    url: 'https://investor.sebi.gov.in/investment-thingsbeforeinv.html',
  },
  {
    id: 'risk',
    category: 'Investing basics',
    title: 'Risk, liquidity and diversification',
    minutes: 3,
    summary: 'Three ideas to understand before chasing a return.',
    sections: [
      [
        'Match money to its purpose',
        'Consider when you may need the money, how easily it can be accessed and whether you could tolerate a loss. Emergency money and a long-term goal serve different purposes.',
      ],
      [
        'Spread exposure thoughtfully',
        'Diversification reduces dependence on a single investment. It does not eliminate all risk, and simply owning many similar products may not diversify much.',
      ],
      [
        'Separate a balance from a forecast',
        'A recorded investment value is a snapshot. A possible future return is an uncertain estimate. Do not treat either as spendable cash until the relevant money is available.',
      ],
    ],
    question: 'Does diversification remove all investment risk?',
    options: ['Yes', 'No, it helps manage concentration risk', 'Only for stocks'],
    answer: 1,
    source: 'SEBI Investor · investing considerations',
    url: 'https://investor.sebi.gov.in/investment-thingsbeforeinv.html',
  },
];
