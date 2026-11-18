/* Buy Plans: program tabs → plan cards → one-click Razorpay checkout.
   No buyer form: the buyer is the signed-in account, and Razorpay's own overlay collects a phone number when the
   profile has none. A logged-out Buy Now opens the login modal and continues to payment once signed in. */
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { money, planLabel, planTitle, programName } from '../lib/content.js';
import { usePlans } from '../lib/site.jsx';
import { useAuth } from '../lib/auth.jsx';
import { api } from '../lib/api.js';
import { PlanCard } from '../components/Sections.jsx';

const wait = ms => new Promise(r => setTimeout(r, ms));
const loadRazorpay = () => window.Razorpay ? Promise.resolve() : new Promise((ok, no) => {
  const s = Object.assign(document.createElement('script'), { src: 'https://checkout.razorpay.com/v1/checkout.js', onload: ok });
  s.onerror = () => no(new Error('Could not load Razorpay. Check your connection and try again.'));
  document.head.append(s);
});

export default function Plans() {
  const plans = usePlans();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [picked, setPicked] = useState(null);
  useEffect(() => setPicked(null), [hash]);   // /plans#ai from another page opens that tab
  const active = plans.find(g => g.id === (picked ?? decodeURIComponent(hash.slice(1)))) || plans[0];

  /* ≤620px the grid is a one-card swipe carousel (CSS scroll-snap); the arrows and dots drive the same scroll */
  const grid = useRef(null);
  const [slide, setSlide] = useState(0);
  useEffect(() => { grid.current?.scrollTo({ left: 0 }); setSlide(0); }, [active?.id]);
  const step = () => { const [a, b] = grid.current.children; return b ? b.offsetLeft - a.offsetLeft : 1; };   // one card + gap
  const goTo = i => grid.current.scrollTo({ left: i * step(), behavior: 'smooth' });

  const { user, requireLogin, logout, refreshAccount } = useAuth();
  const [co, setCo] = useState(null);             // checkout dialog: { step, bar } | { error }
  const [receipt, setReceipt] = useState(null);
  const order = useRef(null), busy = useRef(false);

  function buy(g, index) {
    const c = g.cards[index];
    order.current = { planId: g.id, index, planRef: c.planId, label: planLabel(g, c), price: Number(c.price) };
    user ? pay(user) : requireLogin(pay, true);
  }

  async function pay(u) {
    if (busy.current || !order.current) return;
    busy.current = true;
    const o = order.current, buyer = { name: u.name || 'Student', email: u.email, phone: u.phone || '' };
    const progress = (step, bar) => setCo({ step, bar });
    progress('Preparing your order…', 0);
    try {
      const r = await api('/api/checkout/razorpay', {
        method: 'POST', headers: { Authorization: `Bearer ${u.token}` },
        body: JSON.stringify({ planId: o.planId, index: o.index, planRef: o.planRef, ...buyer }),
      });
      if (!r) throw new Error('We could not reach the payment server — please try again in a minute.');
      if (r.status === 401) {   // session expired mid-checkout: sign in again and land back here
        busy.current = false;
        setCo(null);
        logout();
        return requireLogin(pay, true);
      }
      if (!r.ok) throw new Error(r.data.error || 'Could not start the payment. Please try again.');

      let enrollment;
      if (r.data.mock) {   // the API has no Razorpay keys (local development): the order is already saved as paid
        for (const [i, step] of ['Connecting to Razorpay…', 'Authorising payment…', 'Confirming enrollment…'].entries()) {
          progress(step, (i + 1) / 3 * 100);
          await wait(900);
        }
        enrollment = r.data.enrollment;
      } else {
        progress('Opening secure Razorpay checkout…', 40);
        await loadRazorpay();
        const paid = await new Promise((ok, no) => new window.Razorpay({
          key: r.data.keyId, order_id: r.data.orderId, amount: r.data.amount, currency: r.data.currency,
          name: "Dr. SKM's Academy", description: o.label,
          prefill: { name: buyer.name, email: buyer.email, contact: buyer.phone },
          theme: { color: '#2D4A3E' },
          handler: ok,
          modal: { ondismiss: () => no(new Error('Payment cancelled.')) },
        }).open());
        progress('Verifying payment…', 85);
        const v = await api('/api/checkout/razorpay/verify', { method: 'POST', body: JSON.stringify(paid) });
        if (!v?.ok) throw new Error(`${v?.data?.error || 'We could not verify your payment.'} If money was deducted, contact us with payment ID ${paid.razorpay_payment_id}.`);
        enrollment = v.data.enrollment;
      }
      await refreshAccount(u.token);   // u, not this render's user: a buyer who signed in mid-checkout is only in u
      setCo(null);
      navigate('/dashboard', { state: { success: true, plan: enrollment.plan } });
    } catch (x) {
      setCo({ error: x.message });
    } finally {
      busy.current = false;
    }
  }

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') { if (!busy.current) setCo(null); setReceipt(null); } };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  return (
    <section className="bg-mint pb-24 pt-16 lg:pt-20">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
        <div className="text-center">
          <p className="eyebrow">Enrollment</p>
          <h1 className="mt-3 font-display text-[34px] font-bold sm:text-[44px]">Choose Your Plan</h1>
          <p className="mx-auto mt-5 max-w-[700px] text-[15px] leading-8 text-[#5f5f5f]">Flexible plans for every stage of your medical career — Gulf licensing, specialist examinations, AI clinical learning, and final year preparation.</p>
        </div>

        <div className="rail mt-12 flex justify-start gap-6 overflow-x-auto text-[17px] sm:justify-center sm:gap-[35px]" id="tabs" role="tablist">
          {plans.map(g => (
            <button key={g.id} type="button" role="tab" aria-selected={g === active} className={`plan-tab${g === active ? ' is-on' : ''}`} onClick={() => setPicked(g.id)}>{programName(g.label)}</button>
          ))}
        </div>
        {active && (
          <div className="mt-9" id="panels">
            <div id={active.id} ref={grid} className="plan-grid" style={{ '--cols': Math.min(active.cards.length, 4) }}
              onScroll={e => setSlide(Math.round(e.currentTarget.scrollLeft / step()))}>
              {active.cards.map((c, i) => <PlanCard key={c.planId ?? i} c={c} onBuy={() => buy(active, i)} />)}
            </div>
            {active.cards.length > 1 && (
              <div className="plan-nav" aria-label="Plan cards">
                <button type="button" className="plan-nav__arrow" onClick={() => goTo(slide - 1)} disabled={slide === 0} aria-label="Previous plan"><ChevronLeft /></button>
                <div className="plan-nav__dots">
                  {active.cards.map((c, i) => <button key={i} type="button" className={`plan-nav__dot${i === slide ? ' is-on' : ''}`} onClick={() => goTo(i)} aria-label={`Show ${c.name || c.duration}`} aria-current={i === slide} />)}
                </div>
                <button type="button" className="plan-nav__arrow" onClick={() => goTo(slide + 1)} disabled={slide >= active.cards.length - 1} aria-label="Next plan"><ChevronRight /></button>
              </div>
            )}
          </div>
        )}

        <p className="mx-auto mt-20 max-w-[980px] text-center text-[12px] leading-6 text-[#8a8a8a]">
          Payments should only be made through the official SKM&#39;s academy website www.dr.skmsacademy.com or the SKM&#39;s academy app. We do not authorize payments to individual accounts or direct bank transfers. SKM&#39;s academy is not liable for payments made through unauthorized channels.
        </p>
      </div>

      {co && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#1E231E]/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true"
          onClick={e => e.target === e.currentTarget && !busy.current && setCo(null)}>
          <div className="w-full max-w-[360px] rounded-[22px] bg-white px-6 pb-8 pt-10 text-center shadow-[0_40px_90px_-20px_rgba(7,38,84,.55)]">
            {co.error ? <>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 8v5M12 16.5v.5" /><circle cx="12" cy="12" r="9" /></svg>
              </div>
              <p className="mt-5 text-[14px] leading-6 text-slate-600" role="alert">{co.error}</p>
              <button type="button" onClick={() => (user ? pay(user) : requireLogin(pay, true))} className="mt-6 w-full rounded-xl bg-forest py-3.5 text-[15px] font-semibold text-white transition hover:brightness-110">Try again</button>
              <button type="button" onClick={() => setCo(null)} className="mt-2 w-full rounded-xl py-3 text-[14px] font-medium text-slate-500 transition hover:bg-slate-50">Close</button>
            </> : <div aria-live="polite">
              <div className="relative mx-auto grid h-24 w-24 place-items-center">
                <span className="absolute inset-0 animate-spin rounded-full border-4 border-[#3395FF]/15 border-t-[#3395FF]" />
                <svg viewBox="0 0 26 30" className="h-10 w-9 animate-pulse" aria-hidden="true"><path d="M11 0h15L12.4 30H4.8l5.3-11.6H2.4z" fill="#072654" /></svg>
              </div>
              <p className="mt-6 text-[15px] font-semibold text-[#072654]">{co.step}</p>
              <div className="mx-auto mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-[#3395FF] to-[#22C55E] transition-[width] duration-700" style={{ width: `${co.bar}%` }} />
              </div>
              <p className="mt-6 text-[11px] text-slate-400">Please don&#39;t close or refresh this window.</p>
            </div>}
          </div>
        </div>
      )}

      {receipt && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#1E231E]/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="rc-title"
          onClick={e => e.target === e.currentTarget && setReceipt(null)}>
          <div className="w-full max-w-[420px] overflow-hidden rounded-[22px] bg-[#F4F8F3] shadow-2xl">
            <div className="bg-[#1E231E] px-6 pb-8 pt-9 text-center text-white">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-b from-[#34D399] to-[#22C55E] shadow-[0_0_0_10px_rgba(52,211,153,.14)]">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="#1E231E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 10 17 19 7.5" /></svg>
              </div>
              <h2 id="rc-title" className="mt-6 font-display text-[26px] font-bold">Enrollment Successful</h2>
              <p className="mt-1 text-[13px] text-white/60">Welcome to Dr. SKM&#39;s Academy, {receipt.name}</p>
            </div>
            <dl className="divide-y divide-dashed divide-[#1E231E]/10 px-6 py-3 text-[13px]">
              {[['Payment ID', receipt.paymentId || receipt.id], ['Plan', planTitle(receipt.plan)], ['Amount paid', money(receipt.price)],
                ['Email', receipt.email], ['Phone', receipt.phone || '—'], ['Date', new Date(receipt.date).toLocaleString()], ['Status', receipt.status],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-2.5">
                  <dt className="shrink-0 text-[#1E231E]/55">{k}</dt>
                  <dd className={`break-all text-right font-medium ${k === 'Status' ? 'text-[#16a34a]' : 'text-[#1E231E]'}`}>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="px-6 pb-6">
              <button type="button" onClick={() => setReceipt(null)} className="w-full rounded-full bg-gradient-to-b from-[#34D399] to-[#22C55E] py-3 text-[15px] font-semibold text-[#1E231E] transition hover:brightness-105">Done</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
