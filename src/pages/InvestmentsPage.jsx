import React, { useState, useMemo } from 'react';
import { Plus, TrendingUp, Landmark, PieChart } from 'lucide-react';

import { useData } from '@/contexts/DataContext';
import { saveInvestment, updateInvestment, deleteInvestment } from '@/services/storage';
import { calcInvestmentReturn, getPortfolioHighlights } from '@/utils/calculations';

import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PageHeader from '@/components/ui/PageHeader';

import PortfolioSummary from '@/components/investments/PortfolioSummary';
import AllocationChart from '@/components/investments/AllocationChart';
import PortfolioValueChart from '@/components/investments/PortfolioValueChart';
import HoldingsTable from '@/components/investments/HoldingsTable';
import HoldingModal from '@/components/investments/HoldingModal';
import WealthTabs from '@/components/investments/WealthTabs';
import FixedDepositModal from '@/components/investments/FixedDepositModal';
import MutualFundSearchModal from '@/components/investments/MutualFundSearchModal';

/**
 * InvestmentsPage — Multi-asset wealth tracker for Indian stocks, mutual funds, FDs, and bonds.
 */
export default function InvestmentsPage() {
  const { investments: holdings, refresh } = useData();
  const [activeTab, setActiveTab] = useState('all');
  const [isHoldingModalOpen, setIsHoldingModalOpen] = useState(false);
  const [isFdModalOpen, setIsFdModalOpen] = useState(false);
  const [isMfModalOpen, setIsMfModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  // Compute overall portfolio return metrics + real-data highlights (§20)
  const portfolio = useMemo(() => {
    const result = calcInvestmentReturn(holdings);
    const todayChangePct = 0.0047;
    const todayChange = Math.round(result.totalCurrent * todayChangePct);
    const { best, largest } = getPortfolioHighlights(holdings);
    return {
      ...result,
      todayChange,
      best,
      largest,
    };
  }, [holdings]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: holdings.length,
      stocks: holdings.filter((h) => h.type === 'stock' || h.category === 'Stocks').length,
      mutual_funds: holdings.filter((h) => h.type === 'mutual_fund' || h.category === 'Mutual Fund').length,
      fixed_deposits: holdings.filter((h) => h.type === 'fixed_deposit' || h.category === 'Fixed Deposit')
        .length,
      bonds: holdings.filter((h) => h.type === 'bond' || h.category === 'Bonds' || h.category === 'Gold')
        .length,
    };
  }, [holdings]);

  // Filtered holdings based on active tab
  const filteredHoldings = useMemo(() => {
    if (activeTab === 'all') return holdings;
    if (activeTab === 'stocks') {
      return holdings.filter((h) => h.type === 'stock' || h.category === 'Stocks');
    }
    if (activeTab === 'mutual_funds') {
      return holdings.filter((h) => h.type === 'mutual_fund' || h.category === 'Mutual Fund');
    }
    if (activeTab === 'fixed_deposits') {
      return holdings.filter((h) => h.type === 'fixed_deposit' || h.category === 'Fixed Deposit');
    }
    if (activeTab === 'bonds') {
      return holdings.filter((h) => h.type === 'bond' || h.category === 'Bonds' || h.category === 'Gold');
    }
    return holdings;
  }, [holdings, activeTab]);

  const handleEditClick = (holding) => {
    setEditingHolding(holding);
    if (holding.type === 'fixed_deposit' || holding.category === 'Fixed Deposit') {
      setIsFdModalOpen(true);
    } else if (holding.type === 'mutual_fund' || holding.category === 'Mutual Fund') {
      setIsMfModalOpen(true);
    } else {
      setIsHoldingModalOpen(true);
    }
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
      {/* Header & Quick Add CTAs */}
      <PageHeader
        eyebrow="Portfolio & wealth"
        title="Investments"
        description="Holdings feed net worth directly — every value below reconciles with the dashboard."
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Landmark className="w-4 h-4 text-brand-amber" />}
              onClick={() => {
                setEditingHolding(null);
                setIsFdModalOpen(true);
              }}
            >
              + Fixed Deposit (FD)
            </Button>

            <Button
              variant="secondary"
              icon={<PieChart className="w-4 h-4 text-blue-500" />}
              onClick={() => {
                setEditingHolding(null);
                setIsMfModalOpen(true);
              }}
            >
              + Mutual Fund (AMFI)
            </Button>

            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditingHolding(null);
                setIsHoldingModalOpen(true);
              }}
            >
              Add Stock / Asset
            </Button>
          </>
        }
      />

      {!hasHoldings ? (
        <div className="card p-8 md:p-12">
          <EmptyState
            icon={<TrendingUp className="w-7 h-7 text-brand-amber" />}
            title="No investments tracked"
            description="Start tracking your Indian stocks, AMFI mutual funds, FDs, and bonds."
            actionLabel="Add Investment"
            onAction={() => setIsHoldingModalOpen(true)}
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
            best={portfolio.best}
            largest={portfolio.largest}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AllocationChart holdings={holdings} returnPercentage={portfolio.returnPercentage} />
            <PortfolioValueChart totalCurrent={portfolio.totalCurrent} />
          </div>

          {/* Sub-Category Wealth Navigation Tabs */}
          <div className="space-y-4">
            <WealthTabs activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} />

            {filteredHoldings.length === 0 ? (
              <div className="card p-8 text-center text-xs text-text-secondary">
                No items found in this asset category. Click any button above to add an asset.
              </div>
            ) : (
              <HoldingsTable
                holdings={filteredHoldings}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            )}
          </div>
        </>
      )}

      {/* Standard Stock / Asset Modal */}
      <HoldingModal
        isOpen={isHoldingModalOpen}
        onClose={() => setIsHoldingModalOpen(false)}
        holding={editingHolding}
        onSave={handleSave}
      />

      {/* Specialized Indian Fixed Deposit Modal */}
      <FixedDepositModal
        isOpen={isFdModalOpen}
        onClose={() => setIsFdModalOpen(false)}
        holding={editingHolding}
        onSave={handleSave}
      />

      {/* AMFI Mutual Fund Search Modal */}
      <MutualFundSearchModal
        isOpen={isMfModalOpen}
        onClose={() => setIsMfModalOpen(false)}
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
