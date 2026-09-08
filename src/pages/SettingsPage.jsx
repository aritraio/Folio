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
  Sparkles,
  Key,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import {
  saveSettings,
  downloadBackup,
  createPreImportBackup,
  importData,
  resetToDemo,
  eraseAllData,
} from '../services/storage';
import { testGeminiApiKey } from '../services/geminiService';
import { CURRENCIES } from '../constants/finance';
import { Input, Select, Button, ConfirmDialog } from '../components/ui';

export default function SettingsPage() {
  const { settings, accounts, refresh } = useData();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isEraseDialogOpen, setIsEraseDialogOpen] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState(null);
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

  const handleTestKey = async () => {
    setIsTestingKey(true);
    setKeyTestStatus(null);
    try {
      const res = await testGeminiApiKey(settings.geminiApiKey, settings.geminiModel || 'gemini-1.5-flash');
      setKeyTestStatus(res);
    } catch (err) {
      setKeyTestStatus({ valid: false, message: err.message });
    } finally {
      setIsTestingKey(false);
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
        <p className="label mb-1">Preferences</p>
        <h1 className="heading-lg text-zinc-900 dark:text-text-dark-primary">Settings</h1>
      </div>

      {alertMsg && (
        <div
          role={alertMsg.type === 'error' ? 'alert' : 'status'}
          className={`p-4 rounded-lg text-sm font-medium ${
            alertMsg.type === 'success'
              ? 'bg-brand-emerald/10 text-brand-emerald'
              : 'bg-brand-red/10 text-brand-red'
          }`}
        >
          {alertMsg.text}
        </div>
      )}

      <section className="card p-6 md:p-8" aria-labelledby="settings-profile">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-surface-dark flex items-center justify-center">
            <User className="w-5 h-5 text-zinc-500 dark:text-text-dark-secondary" />
          </div>
          <h2 id="settings-profile" className="heading-sm text-zinc-900 dark:text-text-dark-primary">
            Profile
          </h2>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div
            className="w-20 h-20 rounded-full bg-brand-amber/10 text-brand-amber flex items-center justify-center text-2xl font-serif shrink-0"
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
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-surface-dark flex items-center justify-center">
            <Palette className="w-5 h-5 text-zinc-500 dark:text-text-dark-secondary" />
          </div>
          <h2 id="settings-prefs" className="heading-sm text-zinc-900 dark:text-text-dark-primary">
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

      {/* AI & Statement Ingestion Settings */}
      <section className="card p-6 md:p-8" aria-labelledby="settings-ai">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-brand-amber flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 id="settings-ai" className="heading-sm text-zinc-900 dark:text-text-dark-primary">
              AI Statement Parsing & Advisor
            </h2>
            <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
              Configure your Google Gemini API key for automatic PDF parsing and spending insights
            </p>
          </div>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-900 dark:text-text-dark-primary flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-brand-amber" />
                Google Gemini API Key
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-brand-amber hover:underline inline-flex items-center gap-1 text-[11px]"
              >
                Get Free Key from Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={settings.geminiApiKey || ''}
                onChange={(e) => handleChange('geminiApiKey', e.target.value.trim())}
                placeholder="AIzaSy..."
                className="
                  flex-1 px-3.5 py-2 rounded-lg text-xs
                  bg-white dark:bg-surface-dark-card
                  border border-ivory-border dark:border-surface-dark-border
                  text-zinc-900 dark:text-text-dark-primary
                  focus:ring-2 focus:ring-brand-amber focus:outline-none
                "
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={!settings.geminiApiKey || isTestingKey}
                onClick={handleTestKey}
              >
                {isTestingKey ? 'Testing...' : 'Test Key'}
              </Button>
            </div>
            {keyTestStatus && (
              <p
                className={`text-xs mt-1.5 ${keyTestStatus.valid ? 'text-brand-emerald' : 'text-brand-red'}`}
              >
                {keyTestStatus.valid
                  ? '✓ Connection successful! Key is active.'
                  : `✗ ${keyTestStatus.message}`}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Gemini Model"
              value={settings.geminiModel || 'gemini-1.5-flash'}
              onChange={(e) => handleChange('geminiModel', e.target.value)}
              options={[
                { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast & Free Tier)' },
                { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Next-Gen)' },
              ]}
              hint="Flash models offer zero-latency extraction"
            />
          </div>

          <div className="p-3.5 rounded-lg bg-ivory-warm/30 dark:bg-surface-dark-card/50 border border-ivory-border dark:border-surface-dark-border text-xs text-text-secondary dark:text-text-dark-secondary flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-900 dark:text-text-dark-primary">
                Zero-Backend Privacy Guarantee:{' '}
              </span>
              Your API key and statement texts are stored solely in your browser&apos;s localStorage and sent
              straight to Google&apos;s API. No middleman server ever accesses or logs your financial data.
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6 md:p-8" aria-labelledby="settings-data">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-surface-dark flex items-center justify-center">
            <Database className="w-5 h-5 text-zinc-500 dark:text-text-dark-secondary" />
          </div>
          <h2 id="settings-data" className="heading-sm text-zinc-900 dark:text-text-dark-primary">
            Data Management
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-text-dark-primary">Export Data</h3>
            <p className="text-xs text-zinc-500 dark:text-text-dark-secondary leading-relaxed">
              Download a versioned JSON backup of everything.
            </p>
            <Button variant="secondary" onClick={handleExport} className="mt-auto justify-center">
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-text-dark-primary">Import Data</h3>
            <p className="text-xs text-zinc-500 dark:text-text-dark-secondary leading-relaxed">
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
            <h3 className="text-sm font-medium text-zinc-900 dark:text-text-dark-primary">Reset to Demo</h3>
            <p className="text-xs text-zinc-500 dark:text-text-dark-secondary leading-relaxed">
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
            <h3 className="text-sm font-medium text-brand-red">Erase Everything</h3>
            <p className="text-xs text-zinc-500 dark:text-text-dark-secondary leading-relaxed">
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
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-surface-dark flex items-center justify-center">
            <Info className="w-5 h-5 text-zinc-500 dark:text-text-dark-secondary" />
          </div>
          <h2 id="settings-about" className="heading-sm text-zinc-900 dark:text-text-dark-primary">
            About
          </h2>
        </div>
        <div className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-text-dark-secondary">
          <p className="font-medium text-zinc-900 dark:text-text-dark-primary mb-1">
            Ledger — Personal Finance Tracker
          </p>
          <p>Version 1.0.0 · Schema v2 · Local-first (localStorage)</p>
          <p>A personal finance dashboard built with React + Vite.</p>
          <p className="mt-2 text-xs flex items-center gap-1">
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
