/* Student session + the login modal (Google sign-in or an emailed 6-digit code).
   requireLogin(onDone) opens the modal and, once signed in, hands the user to onDone — the plans page uses it to go
   straight on to Razorpay after a logged-out visitor clicks Buy Now. */
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { api, ls } from './api.js';
import { GoogleG } from '../components/icons.jsx';

const USER_KEY = 'skm_user';
const Auth = createContext(null);
export const useAuth = () => useContext(Auth);

const storedUser = () => { const u = ls.get(USER_KEY); return u?.exp > Date.now() ? u : null; };

/* Google sign-in uses the OAuth2 token client: requestAccessToken() opens Google's full account-chooser popup — no
   One Tap, no FedCM. The popup has to open inside the user's click, so the client is created up front and the click
   handler stays synchronous. */
const loadGis = () => new Promise((ok, fail) => {
  const el = Object.assign(document.createElement('script'), { src: 'https://accounts.google.com/gsi/client', async: true, onload: ok });
  el.onerror = () => fail(new Error('gsi'));
  document.head.appendChild(el);
});

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(storedUser);
  const [account, setAccount] = useState({ activePlans: [] });
  const [modal, setModal] = useState(null);   // null = closed, else { forPurchase }
  const [msg, setMsg] = useState(null);       // { text, bad }
  const [googleBusy, setGoogleBusy] = useState(false);
  const [emailLogin, setEmailLogin] = useState(true);   // false once /api/config says OTP mail isn't configured
  const pending = useRef(null);               // what to do once signed in
  const tokenClient = useRef(null);
  const gisInit = useRef(false);             // StrictMode/remounts must not load + initialize GIS twice

  const setUser = u => { ls.set(USER_KEY, u); setUserState(u); };
  const say = (text, bad) => setMsg(text ? { text, bad } : null);
  const loadAccount = token => api('/api/account', { headers: { Authorization: `Bearer ${token}` } }).then(r => r?.ok ? r.data : null);
  const updateAccount = profile => api('/api/account', {
    method: 'PUT', headers: { Authorization: `Bearer ${user?.token}` }, body: JSON.stringify(profile),
  }).then(r => {
    if (!r?.ok) throw new Error(r?.data?.error || 'Could not update your profile');
    setUser({ ...user, ...r.data.user });
    return refreshAccount(user.token);
  });

  /* only the newest account request may land: a slow load started at sign-in can't overwrite the fresh one a
     payment asked for, and a sign-out drops anything still in flight */
  const accountSeq = useRef(0);
  const refreshAccount = (token = user?.token) => {
    const n = ++accountSeq.current;
    if (!token) return Promise.resolve();
    return loadAccount(token).then(data => { if (data && n === accountSeq.current) setAccount(data); });
  };
  useEffect(() => {
    setAccount({ activePlans: [] });
    refreshAccount(user?.token);
  }, [user?.token]);

  const close = () => { pending.current = null; setModal(null); };
  function requireLogin(onDone, forPurchase = false) {
    pending.current = onDone;
    say('');
    setModal({ forPurchase });
  }
  function finishLogin(data) {
    const u = { token: data.token, exp: data.exp, role: data.user?.role || 'user', ...data.user };
    setUser(u);
    setModal(null);
    const done = pending.current;
    pending.current = null;
    done?.(u);
  }

  const onToken = useRef();
  onToken.current = async res => {
    if (!res?.access_token) {
      setGoogleBusy(false);
      console.warn('[auth] Google returned no access token:', res?.error, res?.error_description || '');
      return say('Google sign-in failed — please try again.', true);
    }
    console.info('[auth] Google access token received — exchanging with /api/auth/google');
    // api() never rejects: a network failure or timeout comes back as null
    const r = await api('/api/auth/google', { method: 'POST', body: JSON.stringify({ accessToken: res.access_token }) });
    setGoogleBusy(false);
    if (!r?.ok) {
      console.error('[auth] Google token exchange failed:', r ? `${r.status} ${r.data?.error || ''}` : 'backend unreachable');
      return say(r?.data?.error || 'Google sign-in failed — please try again.', true);
    }
    console.info('[auth] Google sign-in complete');
    finishLogin(r.data);
  };

  useEffect(() => {   // best effort: a failure just leaves the Google button reporting it
    if (gisInit.current) return;
    gisInit.current = true;
    (async () => {
      const r = await api('/api/config');
      if (r?.data?.emailLogin === false) setEmailLogin(false);
      const clientId = r?.data?.googleClientId;
      if (!clientId) return console.warn('[auth] no Google client id from /api/config');
      await loadGis();
      tokenClient.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        prompt: 'select_account',   // always show the account chooser, even with one signed-in account
        callback: res => onToken.current(res),
        // popup closed by the user, or blocked: not an error worth a red message, just re-enable the button
        error_callback: e => {
          console.info('[auth] Google popup ended:', e?.type);
          setGoogleBusy(false);
          if (e?.type === 'popup_failed_to_open') say('Your browser blocked the Google popup — allow popups or use your email.', true);
        },
      });
    })().catch(e => console.warn('[auth] Google sign-in unavailable:', e?.message));
  }, []);

  function googleSignIn() {   // stays synchronous so the popup keeps the click
    if (!tokenClient.current) return say('Google sign-in is not available right now — use your email instead.', true);
    say('');
    setGoogleBusy(true);
    tokenClient.current.requestAccessToken();
  }


  return (
    <Auth.Provider value={{ user, account, refreshAccount, updateAccount, requireLogin, logout: () => setUser(null) }}>
      {children}
      {modal && <LoginModal forPurchase={modal.forPurchase} msg={msg} say={say} onClose={close}
        onGoogle={googleSignIn} googleBusy={googleBusy} emailLogin={emailLogin} onLogin={finishLogin} />}
    </Auth.Provider>
  );
}

/* First submit mails a code (/api/auth/otp); second submit verifies it (/api/auth/verify). */
function LoginModal({ forPurchase, msg, say, onClose, onGoogle, googleBusy, emailLogin, onLogin }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit(e) {
    e.preventDefault();
    // Autofill and password managers can fill the field without firing onChange, leaving `email` empty while the
    // input clearly shows an address — that is what produced "Please enter a valid email address" on a filled form.
    // Read the form itself, and normalise the way the backend does, so the checked value is the value we send.
    const address = String(new FormData(e.currentTarget).get('email') || '').trim().toLowerCase();
    if (email.trim().toLowerCase() !== address) setEmail(address);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return say('Please enter a valid email address.', true);
    if (challenge && !/^\d{6}$/.test(otp.trim())) return say('Enter the 6-digit code from your email.', true);
    setBusy(true);
    try {
      if (!challenge) {
        const r = await api('/api/auth/otp', { method: 'POST', body: JSON.stringify({ email: address }) });
        if (!r?.ok) return say(r?.data?.error || 'Could not send the code — please try again.', true);
        setChallenge(r.data.challenge);
        return say(`We sent a 6-digit code to ${address}.`);
      }
      const r = await api('/api/auth/verify', { method: 'POST', body: JSON.stringify({ challenge, otp: otp.trim() }) });
      if (!r?.ok) return say(r?.data?.error || 'Login failed — please try again.', true);
      onLogin(r.data);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="auth-card grid md:grid-cols-2" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className="auth-card__dark">
          <h3 className="auth-card__title">Welcome to<br /><em>SKM&rsquo;s Academy</em></h3>
          <p className="auth-card__lede">Empowering medical professionals with AI-powered clinical learning, expert guidance, and focused preparation for Gulf Medical Licensing Examinations.</p>
        </div>
        <div className="auth-panel">
          <button type="button" onClick={onClose} className="auth-x" aria-label="Close"><X className="h-6 w-6" /></button>
          <h4 className="auth-heading" id="auth-title">{forPurchase ? 'Login to buy this plan' : 'Welcome back'}</h4>
          <p className="auth-sub">{emailLogin ? 'Continue with Google, or log in with a code sent to your email.' : 'Continue with Google to log in.'}</p>
          <button type="button" className="auth-google" onClick={onGoogle} disabled={googleBusy}><GoogleG /><span>Continue with Google</span></button>
          {emailLogin ? <form className="auth-form" noValidate onSubmit={submit}>
            <p className="auth-or">or</p>
            <label className="auth-label" htmlFor="auth-email">Enter your Email address</label>
            <input id="auth-email" name="email" type="email" autoComplete="email" maxLength={200} required className="auth-input" placeholder="eg, ajmal55@gmail.com"
              value={email} onChange={e => { setEmail(e.target.value); setChallenge(null); setOtp(''); say(''); }} />
            {challenge && <>
              <label className="auth-label" htmlFor="auth-otp">Enter the 6-digit code we emailed you</label>
              <input id="auth-otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="auth-input" placeholder="••••••" autoFocus
                value={otp} onChange={e => setOtp(e.target.value)} />
            </>}
            {msg && <p role="status" className="auth-msg" style={{ color: msg.bad ? '#b42318' : '#4b5b33' }}>{msg.text}</p>}
            <button type="submit" className="btn-grad auth-btn" disabled={busy}>{challenge ? 'Verify & Login' : 'Login'}</button>
          </form> : msg && <p role="status" className="auth-msg" style={{ color: msg.bad ? '#b42318' : '#4b5b33' }}>{msg.text}</p>}
          <p className="auth-terms">By continuing you agree to our Terms of Use and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}
