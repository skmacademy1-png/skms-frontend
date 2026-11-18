import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../lib/auth.jsx';
import { money, planTitle } from '../lib/content.js';
import { LogOut } from 'lucide-react';

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—';
}

export default function Dashboard() {
  const { user, account, updateAccount, requireLogin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const askedLogin = useRef(false);
  const [view, setView] = useState('overview');
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!user && !askedLogin.current) {
      askedLogin.current = true;
      requireLogin(() => navigate('/dashboard'));
    }
  }, [user, requireLogin, navigate]);

  useEffect(() => {
    if (user) setProfile({ name: user.name || '', phone: user.phone || account.user?.phone || '' });
  }, [user, account.user?.phone]);

  if (!user) return (
    <section className="bg-mint px-6 py-24 text-center">
      <p className="eyebrow">My Account</p>
      <h1 className="mt-3 font-display text-[36px] font-bold text-[#1d1f1b]">Sign in to view your dashboard</h1>
      <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-7 text-[#687066]">Your purchased plans, dates, and access status will appear here.</p>
      <button type="button" onClick={() => requireLogin(() => navigate('/dashboard'))} className="btn-grad mt-8 px-7 py-3 text-[15px]">Login / Signup</button>
    </section>
  );

  const plans = account.activePlans || [];
  const displayName = user.name || user.email.split('@')[0];
  async function saveProfile(event) {
    event.preventDefault(); setSaving(true); setMessage(null);
    try { await updateAccount(profile); setMessage({ good: true, text: 'Profile updated successfully.' }); }
    catch (error) { setMessage({ good: false, text: error.message }); }
    finally { setSaving(false); }
  }
  const nav = [['overview', 'Overview'], ['plans', 'My Plans'], ['profile', 'Profile details']];
  return (
    <section className="min-h-[calc(100vh-114px)] bg-[#f4f7f0] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 lg:flex-row">
        <aside className="h-fit w-full shrink-0 rounded-3xl border border-[#87986b]/25 bg-[#1e2b24] p-5 text-white shadow-[0_18px_50px_rgba(30,43,36,.22)] lg:sticky lg:top-[134px] lg:w-[250px]">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f4f7f0] p-1.5 shadow-[0_6px_18px_rgba(0,0,0,.16)]">
              <img src="/img/logo.png" alt="Dr. SKM's Academy" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0"><p className="truncate text-[15px] font-semibold">{displayName}</p><p className="truncate text-[11px] text-white/55">{user.email}</p></div>
          </div>
          <nav className="mt-5 grid gap-1" aria-label="Account navigation">
            {nav.map(([id, label]) => <button key={id} type="button" onClick={() => setView(id)} className={`rounded-xl border-l-2 px-3 py-2.5 text-left text-[13px] transition ${view === id ? 'border-[#a5b589] bg-[#87986b]/25 text-white' : 'border-transparent text-white/60 hover:bg-white/10 hover:text-white'}`}>{label}</button>)}
          </nav>
          <button type="button" onClick={logout} className="mt-6 flex w-full items-center gap-2 border-t border-white/10 px-3 pt-5 text-left text-[13px] text-white/60 hover:text-white"><LogOut className="h-4 w-4" /> Sign out</button>
        </aside>

        <main className="min-w-0 flex-1 rounded-3xl border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(38,54,20,.07)] sm:p-8">
          {view === 'overview' && <>
            <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">My Account</p>
            <h1 className="mt-2 font-display text-[36px] font-bold text-[#1d1f1b] sm:text-[48px]">Welcome back, {displayName}</h1>
            <p className="mt-2 text-[14px] text-[#687066]">{user.email}</p>
          </div>
          <Link to="/plans" className="btn-grad px-6 py-3 text-[14px]">Browse Plans</Link>
        </div>

        {location.state?.success && <div className="mt-8 rounded-2xl border border-[#b8d9b8] bg-[#eef8ee] px-5 py-4 text-[14px] text-[#2d6a3e]" role="status">
          Enrollment successful. Your plan is now listed below.
        </div>}

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#f4f8ee] p-5"><p className="text-[12px] text-black/50">Active plans</p><p className="mt-2 text-[30px] font-semibold text-[#2d4a3e]">{plans.length}</p><button type="button" onClick={() => setView('plans')} className="mt-2 text-[12px] font-semibold text-[#87986b]">View my plans →</button></div>
          <div className="rounded-2xl bg-[#f4f8ee] p-5"><p className="text-[12px] text-black/50">Profile completion</p><p className="mt-2 text-[18px] font-semibold text-[#2d4a3e]">{user.phone ? 'Complete' : 'Add your phone'}</p><button type="button" onClick={() => setView('profile')} className="mt-2 text-[12px] font-semibold text-[#87986b]">Update profile →</button></div>
        </div>
        <div className="mt-10 flex items-center justify-between gap-4">
          <div><p className="eyebrow">Subscriptions</p><h2 className="mt-2 font-display text-[28px] font-bold text-[#1d1f1b]">Your active plans</h2></div>
          <span className="rounded-full bg-[#e8f0df] px-3 py-1.5 text-[12px] font-semibold text-[#58703f]">{plans.length} active</span>
        </div>

        {plans.length ? <div className="mt-6 grid gap-5 md:grid-cols-2">
          {plans.map(plan => <article id={`plan-${plan.id}`} key={plan.id} className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(38,54,20,.08)]">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#87986b]">Active subscription</p><h3 className="mt-2 text-[20px] font-semibold text-[#1d1f1b]">{planTitle(plan.plan)}</h3></div>
              <span className="rounded-full bg-[#e5f5e8] px-3 py-1 text-[11px] font-semibold text-[#23874a]">{plan.appSync ? 'Access granted' : 'Paid'}</span>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-black/5 pt-5 text-[13px]">
              <div><dt className="text-black/50">Purchased</dt><dd className="mt-1 font-medium">{formatDate(plan.date)}</dd></div>
              <div><dt className="text-black/50">Amount paid</dt><dd className="mt-1 font-medium">{money(plan.price)}</dd></div>
              <div><dt className="text-black/50">Payment status</dt><dd className="mt-1 font-medium text-[#23874a]">{plan.status || 'Success'}</dd></div>
              <div><dt className="text-black/50">Access status</dt><dd className="mt-1 font-medium">{plan.appSync ? 'Active' : 'Processing'}</dd></div>
            </dl>
          </article>)}
        </div> : <div className="mt-6 rounded-3xl border border-dashed border-black/15 bg-white/60 px-6 py-14 text-center"><p className="text-[16px] font-semibold">No active plans yet</p><p className="mt-2 text-[14px] text-black/55">Choose a plan to start your learning journey.</p><Link to="/plans" className="btn-grad mt-6 inline-block px-6 py-3 text-[14px]">Explore Plans</Link></div>}
          </>}

          {view === 'plans' && <section><p className="eyebrow">Purchase history</p><h1 className="mt-2 font-display text-[36px] font-bold text-[#1d1f1b]">My Plans</h1><p className="mt-2 text-[14px] text-black/55">Your enrolled courses and payment records.</p>
            {plans.length ? <div className="mt-7 grid gap-4">{plans.map(plan => <article key={plan.id} className="rounded-2xl border border-black/10 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[11px] uppercase tracking-[.16em] text-[#87986b]">Order {plan.id}</p><h2 className="mt-2 text-[18px] font-semibold">{planTitle(plan.plan)}</h2></div><span className="rounded-full bg-[#e5f5e8] px-3 py-1 text-[11px] font-semibold text-[#23874a]">{plan.status || 'Success'}</span></div><dl className="mt-5 grid gap-3 border-t border-black/5 pt-4 text-[13px] sm:grid-cols-3"><div><dt className="text-black/50">Purchased</dt><dd className="mt-1 font-medium">{formatDate(plan.date)}</dd></div><div><dt className="text-black/50">Total amount</dt><dd className="mt-1 font-medium">{money(plan.price)}</dd></div><div><dt className="text-black/50">Access</dt><dd className="mt-1 font-medium">{plan.appSync ? 'Active' : 'Processing'}</dd></div></dl></article>)}</div> : <p className="mt-8 rounded-2xl bg-[#f4f8ee] p-6 text-[14px] text-black/55">No purchases yet. <Link className="font-semibold text-[#87986b]" to="/plans">Browse plans</Link></p>}
          </section>}

          {view === 'profile' && <section><p className="eyebrow">Account settings</p><h1 className="mt-2 font-display text-[36px] font-bold text-[#1d1f1b]">Profile details</h1><p className="mt-2 text-[14px] text-black/55">Keep your contact details up to date for enrollment and support.</p>
            <form onSubmit={saveProfile} className="mt-8 max-w-[560px] space-y-5"><label className="block"><span className="mb-2 block text-[13px] font-semibold">Full name</span><input className="w-full rounded-xl border border-black/10 bg-[#f8faf6] px-4 py-3 text-[14px] outline-none focus:border-[#87986b]" value={profile.name} onChange={event => setProfile({ ...profile, name: event.target.value })} required maxLength={100} /></label><label className="block"><span className="mb-2 block text-[13px] font-semibold">Email address</span><input className="w-full rounded-xl border border-black/10 bg-[#eeeeeb] px-4 py-3 text-[14px] text-black/55" value={user.email} readOnly /></label><label className="block"><span className="mb-2 block text-[13px] font-semibold">Phone number</span><input className="w-full rounded-xl border border-black/10 bg-[#f8faf6] px-4 py-3 text-[14px] outline-none focus:border-[#87986b]" placeholder="+91 9876543210" value={profile.phone} onChange={event => setProfile({ ...profile, phone: event.target.value })} /></label>{message && <p className={`rounded-xl px-4 py-3 text-[13px] ${message.good ? 'bg-[#eef8ee] text-[#2d6a3e]' : 'bg-red-50 text-red-700'}`}>{message.text}</p>}<button disabled={saving} className="btn-grad px-6 py-3 text-[14px]">{saving ? 'Saving...' : 'Save changes'}</button></form>
          </section>}
        </main>
      </div>
    </section>
  );
}