import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cloud, Download, Upload, LogOut } from 'lucide-react';
import { PageHeading, Panel } from '../components/ui/WorkspaceUI';
import { api, cloudStatus } from '../services/cloud';
import { snapshotWorkspace, restoreWorkspace } from '../services/workspace';
import { downloadBackup, notifyDataUpdated, validateBackup } from '../services/storage';
export default function LoginPage() {
  const [status, setStatus] = useState(null),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [revision, setRevision] = useState(null),
    [confirm, setConfirm] = useState('');
  useEffect(() => {
    cloudStatus()
      .then(setStatus)
      .catch(() => setStatus({ configured: false }));
  }, []);
  async function run(action) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (action === 'login' || action === 'signup') {
        const result = await api(`auth/${action}`, {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setPassword('');
        setStatus(await cloudStatus());
        setNotice(result.message || 'Signed in. Your local workspace has not been uploaded.');
      }
      if (action === 'logout') {
        await api('auth/logout', { method: 'POST', body: '{}' });
        setStatus(await cloudStatus());
        setRevision(null);
        setNotice('Signed out. Local records remain on this device.');
      }
      if (action === 'check') {
        const result = await api('workspace');
        setRevision(result.revision);
        setNotice(
          result.revision
            ? 'Cloud backup found. You can now replace it with a new backup.'
            : 'No cloud backup yet. You can create your first backup.'
        );
      }
      if (action === 'upload') {
        const result = await api('workspace', {
          method: 'PUT',
          body: JSON.stringify({ revision, data: snapshotWorkspace() }),
        });
        setRevision(result.revision);
        setNotice('Workspace backed up to your account. Changes remain local until you back up again.');
      }
      if (action === 'restore') {
        const result = await api('workspace');
        if (!result.data) throw new Error('There is no cloud backup to restore.');
        const active = result.data.ledger_active_profile || 'sagnik';
        const backup = {
          ...Object.fromEntries(
            ['transactions', 'accounts', 'budgets', 'investments'].map((k) => [
              k,
              JSON.parse(result.data[`ledger_${k}`] || '[]'),
            ])
          ),
          planning: JSON.parse(
            result.data[`planning_${active}`] || '{"goals":[],"recurring":[],"completedLessons":[]}'
          ),
        };
        const valid = validateBackup(backup);
        if (!valid.ok) throw new Error('Cloud backup did not pass validation.');
        downloadBackup();
        restoreWorkspace(result.data);
        notifyDataUpdated();
        window.dispatchEvent(new Event('ledger_settings_updated'));
        setRevision(result.revision);
        setNotice('Cloud backup restored. A copy of your previous local records was downloaded.');
        setConfirm('');
      }
      if (action === 'delete') {
        await api('workspace', { method: 'DELETE', body: '{}' });
        setRevision(0);
        setNotice('Cloud backup deleted. Your local workspace is unchanged.');
        setConfirm('');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="v-stack">
      <PageHeading
        title="Your space, across devices."
        description="An optional cloud account. Local mode always remains available."
      />
      <div className="v-auth-layout">
        <div className="v-auth-pitch">
          <ShieldCheck size={30} />
          <h2>
            Less money admin.
            <br />
            More living.
          </h2>
          <p>
            Keep control of what you share. Your local records are uploaded only when you choose to back them
            up. The assistant’s AI mode needs a signed-in account.
          </p>
          <p className="v-caption">
            Local storage is not encrypted. Sign-in protects server access; it does not lock this device’s
            existing records.
          </p>
        </div>
        <Panel>
          {error && (
            <p className="v-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="v-notice" role="status">
              {notice}
            </p>
          )}
          {!status ? (
            <p role="status">Checking cloud availability…</p>
          ) : !status.configured ? (
            <>
              <Cloud size={28} />
              <h2 className="mt-4">Cloud services haven’t been connected yet.</h2>
              <p className="v-muted mt-4">
                This build works locally. The managed sign-in, cloud backup and AI endpoints need server
                configuration before they can be used.
              </p>
              <Link to="/" className="v-button v-primary mt-5">
                Continue with local workspace
              </Link>
            </>
          ) : status.user ? (
            <div className="v-form">
              <h2>Signed in as {status.user.email}</h2>
              <p className="v-caption">
                Backups are explicit snapshots, not automatic sync. Check the cloud version before uploading
                to avoid overwriting another device’s changes.
              </p>
              <button disabled={busy} className="v-button" onClick={() => run('check')}>
                Check cloud backup
              </button>
              <button
                disabled={busy || revision === null}
                className="v-button v-primary"
                onClick={() => run('upload')}
              >
                <Upload size={16} />
                Back up this workspace
              </button>
              <button disabled={busy} className="v-button" onClick={() => setConfirm('restore')}>
                <Download size={16} />
                Restore cloud backup
              </button>
              <button disabled={busy} className="v-button v-destructive" onClick={() => setConfirm('delete')}>
                Delete cloud backup
              </button>
              {confirm && (
                <div className="v-notice">
                  <p>
                    {confirm === 'restore'
                      ? 'Replace this local workspace with the cloud snapshot? A local backup will be downloaded first.'
                      : 'Delete your cloud snapshot permanently? Your local records remain.'}
                  </p>
                  <div className="v-actions mt-3">
                    <button disabled={busy} className="v-button v-primary" onClick={() => run(confirm)}>
                      Confirm {confirm}
                    </button>
                    <button className="v-button" onClick={() => setConfirm('')}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <button disabled={busy} className="v-text-link" onClick={() => run('logout')}>
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          ) : (
            <form
              className="v-form"
              onSubmit={(e) => {
                e.preventDefault();
                run('login');
              }}
            >
              <h2>Make yourself at home.</h2>
              <label className="v-field">
                Email address
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="v-field">
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <button className="v-button v-primary" disabled={busy}>
                {busy ? 'Please wait…' : 'Sign in'}
              </button>
              <button
                type="button"
                className="v-button"
                disabled={busy || password.length < 8 || !email}
                onClick={() => run('signup')}
              >
                Create account
              </button>
              <p className="v-caption">
                Account creation uses your configured managed authentication service. Check your email for
                verification. Passwords are never saved in the browser.
              </p>
              <Link className="v-text-link" to="/">
                Continue locally without an account
              </Link>
            </form>
          )}
        </Panel>
      </div>
    </div>
  );
}
