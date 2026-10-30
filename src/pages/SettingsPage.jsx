import React, { useState, useRef } from 'react';
import {
  User,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  Info,
  Eraser,
  GraduationCap,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import {
  saveSettings,
  downloadBackup,
  createPreImportBackup,
  importData,
  resetToDemo,
  resetDemoProfile,
  eraseAllData,
} from '../services/storage';
import { CURRENCIES } from '../constants/finance';
import { Input, Select, Button, ConfirmDialog } from '../components/ui';

export default function SettingsPage() {
  const { settings, accounts, activeProfileId, demoProfiles, switchProfile, refresh } = useData();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isEraseDialogOpen, setIsEraseDialogOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const fileInputRef = useRef(null);

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleChange = (key, value) => {
    try {
      saveSettings({ [key]: value });
      refresh();
      showAlert('success', 'Settings updated successfully.');
    } catch {
      showAlert('error', 'Could not save settings (storage may be full).');
    }
  };

  const handleExport = () => {
    try {
      const name = downloadBackup();
      showAlert('success', `Backup downloaded (${name}).`);
    } catch {
      showAlert('error', 'Failed to export data.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        createPreImportBackup();
        importData(event.target.result);
        refresh();
        showAlert('success', 'Data imported successfully. A pre-import backup was downloaded.');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        showAlert('error', err.message || 'Failed to import data. Invalid backup file.');
      }
    };
    reader.onerror = () => showAlert('error', 'Could not read the selected file.');
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleResetDemo = () => {
    try {
      downloadBackup(`ledger_backup_before_reset_${new Date().toISOString().split('T')[0]}.json`);
    } catch {
      /* best-effort */
    }
    resetToDemo();
    setIsResetDialogOpen(false);
    showAlert('success', 'Reset to demo data. Reloading...');
    setTimeout(() => window.location.reload(), 1200);
  };

  const handleErase = () => {
    try {
      downloadBackup(`ledger_backup_before_erase_${new Date().toISOString().split('T')[0]}.json`);
    } catch {
      /* best-effort */
    }
    eraseAllData();
    setIsEraseDialogOpen(false);
    showAlert('success', 'All data erased. Reloading...');
    setTimeout(() => window.location.reload(), 1200);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const accountOptions = [
    { value: '', label: 'None' },
    ...accounts.map((a) => ({ value: a.id, label: a.name })),
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <p className="label mb-1 font-mono">Preferences</p>
        <h1 className="heading-lg text-[#0A0A0A] dark:text-white">Settings</h1>
      </div>

      {alertMsg && (
        <div
          role={alertMsg.type === 'error' ? 'alert' : 'status'}
          className={`p-4 rounded text-sm font-medium font-mono border ${
            alertMsg.type === 'success'
              ? 'bg-[rgba(0,184,148,0.12)] text-[#00a383] dark:text-[#00b894] border-[#00b894]/30'
              : 'bg-[rgba(255,107,107,0.12)] text-[#e84118] dark:text-[#ff6b6b] border-[#ff6b6b]/30'
          }`}
        >
          {alertMsg.text}
        </div>
      )}

      {/* ── Demo Student Profiles ── */}
      <section className="card p-6 md:p-8" aria-labelledby="settings-demo-profiles">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1E1E1E] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-[#0A0A0A] dark:text-white" />
          </div>
          <div>
            <h2 id="settings-demo-profiles" className="heading-sm text-[#0A0A0A] dark:text-white">
              Demo Student Profiles
            </h2>
            <p className="text-xs text-[#8E9192]">
              Switch between authentic Indian college student datasets (₹10,000–₹15,000 budget range)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demoProfiles?.map((p) => {
            const isActive = p.id === activeProfileId;
            return (
              <div
                key={p.id}
                className={`
                  p-5 rounded-lg border transition-all flex flex-col justify-between
                  ${
                    isActive
                      ? 'border-[#0A0A0A] dark:border-white bg-[#FAFAFA] dark:bg-[#181818] shadow-sm ring-1 ring-[#0A0A0A] dark:ring-white'
                      : 'border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#141414] hover:border-[#A1A1AA]'
                  }
                `}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`
                        w-10 h-10 rounded flex items-center justify-center font-mono text-sm font-bold
                        ${
                          isActive
                            ? 'bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]'
                            : 'bg-[#F0F0F0] text-[#52525B] dark:bg-[#262626] dark:text-[#A1A1AA]'
                        }
                      `}
                    >
                      {p.avatar}
                    </div>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[rgba(0,184,148,0.15)] text-[#00a383] dark:text-[#00b894]">
                        <Check className="w-3 h-3" /> Active Profile
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-[#8E9192]">
                        ₹{(p.monthlyAllowance / 1000).toFixed(1)}k / mo
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-[#0A0A0A] dark:text-white">{p.name}</h3>
                  <p className="text-xs font-mono text-[#8E9192] mb-1">{p.tagline}</p>
                  <p className="text-[11px] text-[#8E9192] font-mono mb-2">{p.college}</p>
                  <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] line-clamp-3 leading-relaxed mb-4">
                    {p.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E5E5E5] dark:border-[#262626] flex items-center gap-2">
                  <Button
                    variant={isActive ? 'secondary' : 'primary'}
                    size="sm"
                    className="flex-1 justify-center text-xs"
                    onClick={() => {
                      if (!isActive) {
                        switchProfile(p.id);
                        showAlert('success', `Switched to ${p.name}'s profile.`);
                      }
                    }}
                    disabled={isActive}
                  >
                    {isActive ? 'Current Profile' : `Switch to ${p.name}`}
                  </Button>
                  <button
                    onClick={() => {
                      resetDemoProfile(p.id);
                      if (isActive) refresh();
                      showAlert('success', `Reset ${p.name}'s data to initial demo state.`);
                    }}
                    title={`Reset ${p.name}'s data to default`}
                    className="p-2 rounded border border-[#E5E5E5] dark:border-[#262626] text-[#8E9192] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card p-6 md:p-8" aria-labelledby="settings-profile">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1E1E1E] flex items-center justify-center">
            <User className="w-5 h-5 text-[#0A0A0A] dark:text-white" />
          </div>
          <h2 id="settings-profile" className="heading-sm text-[#0A0A0A] dark:text-white">
            Profile
          </h2>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div
            className="w-20 h-20 rounded bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center text-2xl font-mono font-bold shrink-0"
            aria-hidden="true"
          >
            {getInitials(settings.userName)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            <Input
              label="Display Name"
              value={settings.userName || ''}
              maxLength={40}
              onChange={(e) => handleChange('userName', e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              value={settings.email || ''}
              maxLength={80}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="card p-6 md:p-8" aria-labelledby="settings-prefs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1E1E1E] flex items-center justify-center">
            <Palette className="w-5 h-5 text-[#0A0A0A] dark:text-white" />
          </div>
          <h2 id="settings-prefs" className="heading-sm text-[#0A0A0A] dark:text-white">
            Preferences
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
          <Select
            label="Currency Display"
            value={settings.currency || 'INR'}
            onChange={(e) => handleChange('currency', e.target.value)}
            options={Object.values(CURRENCIES).map((c) => ({ value: c.code, label: c.label }))}
            hint="Applies to all amounts instantly"
          />
          <Select
            label="Theme"
            value={settings.theme || 'system'}
            onChange={(e) => handleChange('theme', e.target.value)}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System Default' },
            ]}
          />
          <Select
            label="Default Account"
            value={settings.defaultAccount || ''}
            onChange={(e) => handleChange('defaultAccount', e.target.value)}
            options={accountOptions}
            hint="For new transactions"
          />
        </div>
      </section>

      <section className="card p-6 md:p-8" aria-labelledby="settings-data">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1E1E1E] flex items-center justify-center">
            <Database className="w-5 h-5 text-[#0A0A0A] dark:text-white" />
          </div>
          <h2 id="settings-data" className="heading-sm text-[#0A0A0A] dark:text-white">
            Data Management
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-[#0A0A0A] dark:text-white">Export Data</h3>
            <p className="text-xs text-[#8E9192] leading-relaxed">
              Download a versioned JSON backup of everything.
            </p>
            <Button variant="secondary" onClick={handleExport} className="mt-auto justify-center">
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-[#0A0A0A] dark:text-white">Import Data</h3>
            <p className="text-xs text-[#8E9192] leading-relaxed">
              Restore from a backup. Validated first; a pre-import backup is auto-downloaded.
            </p>
            <Button variant="secondary" onClick={handleImportClick} className="mt-auto justify-center">
              <Upload className="w-4 h-4 mr-2" />
              Import JSON
            </Button>
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-[#0A0A0A] dark:text-white">Reset to Demo</h3>
            <p className="text-xs text-[#8E9192] leading-relaxed">
              Wipe current data and restore the demo dataset. A backup is downloaded first.
            </p>
            <Button
              variant="secondary"
              onClick={() => setIsResetDialogOpen(true)}
              className="mt-auto justify-center"
            >
              <Database className="w-4 h-4 mr-2" />
              Reset Demo
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-[#e84118] dark:text-[#ff6b6b]">Erase Everything</h3>
            <p className="text-xs text-[#8E9192] leading-relaxed">
              Permanently delete all data with no re-seed. App shows empty states.
            </p>
            <Button
              variant="destructive"
              onClick={() => setIsEraseDialogOpen(true)}
              className="mt-auto justify-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Erase Data
            </Button>
          </div>
        </div>
      </section>

      <section className="card p-6 md:p-8" aria-labelledby="settings-about">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1E1E1E] flex items-center justify-center">
            <Info className="w-5 h-5 text-[#0A0A0A] dark:text-white" />
          </div>
          <h2 id="settings-about" className="heading-sm text-[#0A0A0A] dark:text-white">
            About
          </h2>
        </div>
        <div className="flex flex-col gap-1 text-sm text-[#404040] dark:text-[#C4C7C8]">
          <p className="font-medium text-[#0A0A0A] dark:text-white mb-1 font-mono">
            FOLIO — Personal Finance Terminal
          </p>
          <p className="font-mono text-xs">Version 1.0.0 · Schema v2 · Local-first (localStorage)</p>
          <p>A personal finance dashboard built with React + Vite.</p>
          <p className="mt-2 text-xs flex items-center gap-1 font-mono">
            <Eraser className="w-3 h-3" /> Backups include a schema version for safe restores.
          </p>
        </div>
      </section>

      <ConfirmDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleResetDemo}
        title="Reset to demo data?"
        message="Current data will be backed up as a download first, then replaced with the demo dataset."
        confirmLabel="Yes, Reset"
        variant="primary"
      />

      <ConfirmDialog
        isOpen={isEraseDialogOpen}
        onClose={() => setIsEraseDialogOpen(false)}
        onConfirm={handleErase}
        title="Erase everything?"
        message="This permanently deletes all transactions, accounts, budgets and investments with no re-seed. A backup is downloaded first."
        confirmLabel="Yes, Erase Data"
      />
    </div>
  );
}
