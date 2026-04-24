import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, Check, Crown, Lock, Loader2, LogIn, UserPlus } from 'lucide-react';
import {
  getStoredNickname, isAuthed, saveSession,
  validateNickFormat, validatePassword, checkNickAvailable, registerNick, loginNick, isAdminNick,
} from '../../lib/player';
import { t, useLang } from '../../lib/i18n';

export default function AuthGate({ onReady }) {
  const [open, setOpen] = useState(() => !isAuthed());
  const [mode, setMode] = useState('register'); // register | login
  const [nick, setNick] = useState('');
  const [password, setPassword] = useState('');
  const [formatError, setFormatError] = useState(null);
  const [pwError, setPwError] = useState(null);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  useLang();

  useEffect(() => {
    if (!open) {
      onReady?.({ nick: getStoredNickname(), isAdmin: isAdminNick(getStoredNickname()) });
    }
  }, [open, onReady]);

  // Debounced nick check in register mode
  useEffect(() => {
    setCheckResult(null);
    if (mode !== 'register') return;
    const err = validateNickFormat(nick);
    setFormatError(nick.length === 0 ? null : err);
    if (err || nick.length === 0) return;
    let cancelled = false;
    setChecking(true);
    const t = setTimeout(async () => {
      try {
        const data = await checkNickAvailable(nick);
        if (!cancelled) setCheckResult(data);
      } catch { if (!cancelled) setCheckResult({ available: false, valid: false }); }
      finally { if (!cancelled) setChecking(false); }
    }, 350);
    return () => { cancelled = true; clearTimeout(t); setChecking(false); };
  }, [nick, mode]);

  useEffect(() => {
    setPwError(password.length === 0 ? null : validatePassword(password));
  }, [password]);

  const canSubmitRegister = !checking && checkResult?.available && !formatError && !pwError && password.length > 0;
  const canSubmitLogin = nick.length >= 3 && password.length > 0;
  const canSubmit = mode === 'register' ? canSubmitRegister : canSubmitLogin;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true); setSubmitError(null);
    try {
      const res = mode === 'register'
        ? await registerNick(nick, password)
        : await loginNick(nick, password);
      saveSession(res.player.nickname, res.token, res.player.is_admin);
      setOpen(false);
      onReady?.({ nick: res.player.nickname, isAdmin: res.player.is_admin });
    } catch (err) {
      setSubmitError(err?.response?.data?.detail || t('auth.failedTryAgain'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" data-testid="auth-gate">
      <div className="glass-panel slide-up rounded-2xl p-8 max-w-md w-[92%] relative overflow-hidden">
        <div className="scanline" />
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck size={26} className="neon-cyan" />
          <h2 className="font-display text-2xl font-black tracking-tight neon-cyan">
            {mode === 'register' ? t('auth.identifyTitle') : t('auth.accessTitle')}
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-4 tracking-[0.1em]">
          {mode === 'register' ? t('auth.identifyHint') : t('auth.accessHint')}
        </p>

        {/* Mode toggle */}
        <div className="glass-panel-light rounded-full p-1 flex gap-1 mb-5">
          <button type="button" onClick={() => setMode('register')}
            className={`flex-1 px-3 py-1.5 rounded-full font-display text-[10px] tracking-[0.2em] font-semibold uppercase transition-all flex items-center justify-center gap-1.5 ${mode==='register' ? 'bg-[rgba(0,229,255,0.12)] text-[#00E5FF]' : 'text-slate-400'}`}
            data-testid="auth-mode-register"
          ><UserPlus size={11} /> {t('common.register')}</button>
          <button type="button" onClick={() => setMode('login')}
            className={`flex-1 px-3 py-1.5 rounded-full font-display text-[10px] tracking-[0.2em] font-semibold uppercase transition-all flex items-center justify-center gap-1.5 ${mode==='login' ? 'bg-[rgba(0,229,255,0.12)] text-[#00E5FF]' : 'text-slate-400'}`}
            data-testid="auth-mode-login"
          ><LogIn size={11} /> {t('common.login')}</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display block mb-2">{t('auth.callsignLabel')}</label>
            <div className="relative">
              <input className="neon-input pr-10" placeholder={t('auth.callsignPlaceholder')} value={nick}
                onChange={(e) => setNick(e.target.value.trim())} maxLength={20} autoFocus
                data-testid="auth-nick-input" spellCheck={false} autoComplete="off" />
              {mode === 'register' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checking && <Loader2 size={14} className="text-slate-400 animate-spin" />}
                  {!checking && checkResult?.available && <Check size={14} className="neon-lime" />}
                  {!checking && checkResult && !checkResult.available && <AlertCircle size={14} className="neon-coral" />}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] tracking-[0.3em] uppercase text-slate-400 font-display block mb-2">{t('auth.passwordLabel')}</label>
            <input type="password" className="neon-input" placeholder={t('auth.passwordPlaceholder')} value={password}
              onChange={(e) => setPassword(e.target.value)} maxLength={100}
              data-testid="auth-password-input" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
          </div>

          <div className="min-h-[22px] text-[11px] font-mono">
            {formatError && <div className="neon-coral flex items-center gap-1.5" data-testid="nick-format-error"><AlertCircle size={11} /> {formatError}</div>}
            {pwError && <div className="neon-coral flex items-center gap-1.5"><AlertCircle size={11} /> {pwError}</div>}
            {mode === 'register' && !formatError && checkResult?.available && <div className="neon-lime flex items-center gap-1.5" data-testid="nick-available"><Check size={11} /> {t('auth.callsignAvailable')}</div>}
            {mode === 'register' && !formatError && checkResult?.is_admin_nick && <div className="neon-gold flex items-center gap-1.5 mt-1" data-testid="nick-admin-hint"><Crown size={11} /> {t('auth.adminSlot')}</div>}
            {mode === 'register' && !formatError && checkResult && !checkResult.available && checkResult.reason === 'taken' && <div className="neon-coral flex items-center gap-1.5" data-testid="nick-taken"><AlertCircle size={11} /> {t('auth.alreadyTaken')}</div>}
            {submitError && <div className="neon-coral flex items-center gap-1.5" data-testid="auth-submit-error"><AlertCircle size={11} /> {submitError}</div>}
          </div>

          <button type="submit" disabled={!canSubmit || submitting}
            className={`neon-btn w-full py-3 ${(!canSubmit || submitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
            data-testid="auth-submit-btn">
            {submitting ? t('auth.connecting') : (mode === 'register' ? t('common.register') : t('common.login'))}
          </button>

          <p className="text-[10px] text-slate-500 text-center flex items-center gap-1 justify-center">
            <Lock size={9} /> {mode === 'register' ? t('auth.passwordRequiredHint') : t('auth.forgotPasswordHint')}
          </p>
        </form>
      </div>
    </div>
  );
}
