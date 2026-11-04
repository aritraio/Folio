# Folio V2

This checkout implements the approved responsive design on `V2`. The assignment version on `main` and its deployment configuration are unchanged. Nothing has been deployed by this task.

## Run and review

```sh
npm install
npm run dev
npm run test
npm run lint
npm run format
npm run build
```

The normal Vite preview serves the full local app. It intentionally does not expose an unauthenticated AI proxy. `npm run dev:cloud` runs the V2 Worker and its built assets when testing server-backed behavior.

## Available now

- White/light and charcoal/dark themes, system preference, persistent desktop sidebar and five-item mobile navigation. Header search, profile selection and amount hiding.
- Overview with current bank/cash balances separate from net worth, month-filtered spending, income, six-month interactive cash-flow chart, category links to Activity, upcoming commitments and goals.
- Existing account/transaction/budget/investment CRUD, styled with semantic theme tokens; mobile transaction cards; searchable person tags. Credit-card forms include credit limit, statement amount, minimum due, statement date and due date. These statement figures are manually recorded, not an automatic statement-payment ledger.
- Goals allocate existing bank/cash balances; creation/edit prevents over-allocation. Recurring commitments can be edited, removed or skipped to their next date. They never auto-post payments.
- Local CSV import: quoted fields, signed amounts or Debit/Credit columns, explicit date-order choice, validation, category rules, editable dates/amounts/type/category, transfer destination, duplicate candidates, explicit balance strategy, atomic batch commit and guarded undo.
- Assistant: supported local question patterns for totals, merchant/person/category lookup, a calculated spending-reduction scenario, and sourced literacy lessons. Responses link to matching ledger records. Clear local/AI modes; conversations reset on navigation/profile change.
- Learn is under **More**. Six short lessons cover budgeting, tax concepts and tax-saving considerations in India, mutual funds/SIPs, stocks and risk. Each has a knowledge check, locally saved completion and official references. No numerical tax slabs/limits, trading or tax-return calculations.
- Optional server-backed sign-in, explicit user-owned cloud snapshot backup/restore/delete, AI intent interpretation and PDF extraction endpoints. These features require the configuration below; they are not active simply because the frontend builds.

## Isolation and data model

All V2 records live in one namespaced localStorage envelope, `folio_v2_workspace:local`; the internal logical key names remain compatible with existing record readers. V2 never reads or writes the assignment's top-level `ledger_*` keys. Existing V1 data is brought in only by explicitly importing a JSON backup. V2 starts with separate synthetic demo profiles.

Financial mutations and import batches stage changes and commit the envelope once. A storage-write failure leaves persisted accounts and transactions unchanged. Planning and import histories are profile-scoped. Backups include active-profile goals, commitments, lesson completion and import history.

Expenses increase credit-card liabilities; card repayments are transfers and do not count as a second expense. Cash advances increase card liabilities. Credit-card overpayments reduce net debt rather than being converted into positive liabilities. Investment contributions are excluded from everyday consumption. Net worth uses holdings instead of also adding aggregate investment-account balances. Historical imports can explicitly preserve the current balance. This is not a complete double-entry accounting system.

Values at the existing storage boundary remain decimal major units for compatibility. Transaction balance arithmetic rounds to currency precision; duplicate matching compares minor units. A full integer-money schema migration and historical asset valuations remain follow-up work. The app does not generate fictional investment-performance history.

## Cloud setup (requires your accounts and credentials)

1. Create a separate managed Supabase project for V2. Enable email/password authentication and email confirmation, configure its password policy/rate limits and set approved app URLs. Recovery-email UI and automatic session refresh are not part of this release; sessions expire after at most one hour and the app asks users to sign in again.
2. Run [server/schema.sql](../../server/schema.sql). It creates an owner-scoped snapshot table, row-level policies, compare-and-swap snapshot saves and a 20-request-per-user-per-day AI quota. Folio uses the public anonymous project key plus each verified user's JWT; never configure a service-role key.
3. Copy `.dev.vars.example` to `.dev.vars` and fill the values locally. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `OPENAI_API_KEY` and `OPENAI_MODEL`. Select a model your account can access that supports strict structured output and PDF input. No model is silently substituted.
4. Run `npm run dev:cloud` and use the displayed Worker URL for the entire app, including `/api`. Secure HttpOnly same-site session cookies must be supported by the browser/origin. Production requires HTTPS. The static Vite/Vercel/Pages build alone cannot run these APIs.
5. Before public use, run two-user authorization tests against the real project, check email verification and provider controls, and configure edge rate limits for authentication. Mock tests verify the application boundary but cannot verify your deployed database policies or provider account.
6. For a later deployment, use **only** `wrangler.v2.toml`, with Worker name `folio-v2`. Add the same server secrets to that Worker, then explicitly run `npm run deploy:v2`. Do not use the assignment's `deploy:cf` command or change its Cloudflare/Vercel target. Deployment has not been performed.

Cloud backups are deliberate snapshots, not continuous multi-device sync. The user checks the cloud revision before uploading; concurrent changes are rejected by a database compare-and-swap. Restore downloads a pre-restore local backup. Cloud deletion deletes the snapshot, not the managed identity account or local records. Full identity-account deletion and backup-retention lifecycle integration remain follow-up work.

The native Capacitor app currently supports local mode. The cookie-based cloud flow is for same-origin web hosting; a native authenticated deep-link/session flow needs separate integration before advertising native cloud support.

## AI behavior and privacy

The implementation follows [OpenAI structured output documentation](https://developers.openai.com/api/docs/guides/structured-outputs) and [PDF input documentation](https://developers.openai.com/api/docs/guides/file-inputs).

- The assistant sends only the consented question and selected month to the server/provider, not a full ledger. Questions themselves may contain personal details. The model returns a restricted intent; local application code calculates figures and chooses evidence links. No model write tools are provided.
- AI mode requires a verified server session, explicit consent, server credentials and remaining quota. Local helper mode remains available without any network calls containing financial records.
- PDF beta sends the whole selected PDF through the authenticated Worker to OpenAI; PDFs can contain identifying and financial information. The UI asks for consent and makes this distinction from local CSV parsing explicit.
- Folio does not save PDF originals or model conversations. Provider requests use `store:false`, which is not a promise of zero provider retention. Review [provider data controls](https://developers.openai.com/api/docs/guides/your-data) before processing personal records.
- Input body size, output schema, required fields, category values, amounts and dates are validated. Incomplete output is rejected. Upload limits are 5 MB and at most 1,000 extracted rows; model output limits can make shorter statements necessary.
- PDF extraction is a review-required beta, not a validated universal bank parser. No supported-bank accuracy corpus has been run yet. It can miss rows even when the schema validates. Scanned, encrypted, ambiguous or long files should be exported as CSV. Running-balance reconciliation, asynchronous durable jobs, cancellation and an OCR pipeline are follow-up work.
- No spending amounts are generated by the model. Reduction suggestions are clearly identified as scenarios. Learn contains general education, and does not choose securities, file taxes or claim individual deduction eligibility.

## Verification and remaining release work

Automated coverage includes assignment-key isolation, persistence after erase/reload, atomic storage failure, card overpayment/cash advances, net-worth investment deduplication, CSV validation, import idempotency/undo conflicts, goal allocation, recurrence, merchant/person grounding, consent/auth/quota checks and owner-scoped API calls. Existing tests continue to run.

Browser checks cover the desktop and mobile themes, period/category drill-down, assistant ledger evidence, and More → Learn navigation. Live provider calls, real user-to-user RLS enforcement and bank-specific PDF accuracy require configured external services and are not claimed as verified.

The next releases should add the integer-money migration, account reconciliation and dated balance anchors, real valuation snapshots, complete cloud account deletion/recovery, automatic sync with conflict resolution if needed, native auth, a representative bank-PDF corpus and durable import jobs. The original proposed plan is retained in [implementation-plan.md](implementation-plan.md), with this file recording the actual delivered scope.
