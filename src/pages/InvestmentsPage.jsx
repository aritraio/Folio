import React, { useState, useMemo } from 'react';
import { Plus, TrendingUp } from 'lucide-react';

import { useData } from '@/contexts/DataContext';
import { saveInvestment, updateInvestment, deleteInvestment } from '@/services/storage';
import { calcInvestmentReturn } from '@/utils/calculations';

import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

import PortfolioSummary from '@/components/investments/PortfolioSummary';
import AllocationChart from '@/components/investments/AllocationChart';
import PortfolioValueChart from '@/components/investments/PortfolioValueChart';
import HoldingsTable from '@/components/investments/HoldingsTable';
import HoldingModal from '@/components/investments/HoldingModal';

/**
 * InvestmentsPage — Portfolio tracker with summary, allocation, value chart, and holdings table.
 */
export default function InvestmentsPage() {
  const { investments: holdings, refresh } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const portfolio = useMemo(() => {
    const result = calcInvestmentReturn(holdings);
    // Labelled as estimate in UI — live prices are out of scope for local-first v1.
    const todayChangePct = 0.0047;
    const todayChange = Math.round(result.totalCurrent * todayChangePct);
    return {
      ...result,
      todayChange,
    };
  }, [holdings]);

  const handleAddClick = () => {
    setEditingHolding(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (holding) => {
    setEditingHolding(holding);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm({ open: true, id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      deleteInvestment(deleteConfirm.id);
      refresh();
    }
    setDeleteConfirm({ open: false, id: null });
  };

  const handleSave = (data) => {
    if (editingHolding) {
      updateInvestment({ ...data, id: editingHolding.id });
    } else {
      saveInvestment(data);
    }
    refresh();
  };

  const hasHoldings = holdings.length > 0;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="label mb-1 font-mono">Portfolio</p>
          <h1 className="heading-lg text-[#0A0A0A] dark:text-white">Investments</h1>
        </div>

        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleAddClick}>
          Add Holding
        </Button>
      </div>

      {!hasHoldings ? (
        <div className="card p-8 md:p-12">
          <EmptyState
            icon={<TrendingUp className="w-7 h-7 text-[#0A0A0A] dark:text-white" />}
            title="No investments tracked"
            description="Start tracking your portfolio by adding your first investment holding."
            actionLabel="Add Holding"
            onAction={handleAddClick}
          />
        </div>
      ) : (
        <>
          <PortfolioSummary
            totalInvested={portfolio.totalInvested}
            totalCurrent={portfolio.totalCurrent}
            totalReturn={portfolio.totalReturn}
            returnPercentage={portfolio.returnPercentage}
            todayChange={portfolio.todayChange}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AllocationChart holdings={holdings} />
            <PortfolioValueChart totalCurrent={portfolio.totalCurrent} />
          </div>

          <HoldingsTable holdings={holdings} onEdit={handleEditClick} onDelete={handleDeleteClick} />
        </>
      )}

      <HoldingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        holding={editingHolding}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Holding"
        message="This will permanently remove this investment from your portfolio. This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
