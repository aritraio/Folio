import React from 'react';
import { LineChart } from 'lucide-react';
import { formatMoney } from '../../utils/formatCurrency';
export default function PortfolioValueChart({ totalCurrent = 0 }) {
  return (
    <section className="v-panel">
      <div className="v-row">
        <h2>Portfolio valuation</h2>
        <LineChart size={20} />
      </div>
      <p className="v-large-money">{formatMoney(totalCurrent)}</p>
      <p className="v-muted">Current manually recorded value</p>
      <p className="v-caption">
        Historical prices are not recorded yet. A growth chart will appear when real valuation snapshots are
        available; no performance history is generated.
      </p>
    </section>
  );
}
