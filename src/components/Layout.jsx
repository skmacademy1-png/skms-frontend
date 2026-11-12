/* Shared chrome on every page: announcement bar, header (44px logo + drawer on mobile), footer and the
   Write-a-Review modal. Pages open that modal through the outlet context: useOutletContext().openReview() */
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { CONTACT, COURSE_MENU, NAV, isExternal, safeUrl } from '../lib/content.js';
import { useCms } from '../lib/site.jsx';
import { useAuth } from '../lib/auth.jsx';
import { api } from '../lib/api.js';
import { Brand } from './icons.jsx';
import { EnquiryModal } from './Enquiry.jsx';

export default function Layout() {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [enquiry, setEnquiry] = useState(null);   // 'job' | 'guidance' | null
  const { pathname, hash } = useLocation();

  // a new page starts at the top; a #hash lands on its section (the sticky header offset is in the CSS)
  useEffect(() => {
    const el = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    el ? el.scrollIntoView() : window.scrollTo(0, 0);
    // web fonts re-wrap the text above and push the section down, so land again once they're in
    if (el) document.fonts.ready.then(() => el.scrollIntoView());
  }, [pathname, hash]);

  return (
    <>
      <Announcement />
      <Header />
      <main><Outlet context={{ openReview: () => setReviewOpen(true), openEnquiry: setEnquiry }} /></main>
      <Footer />
      {reviewOpen && <ReviewModal onClose={() => setReviewOpen(false)} />}
      {enquiry && <EnquiryModal key={enquiry} kind={enquiry} onClose={() => setEnquiry(null)} />}
    </>
  );
}

function Announcement() {
  const a = useCms('announcement');
  if (!a.enabled || !a.text?.trim()) return null;
  const href = safeUrl(a.link);
  return (
    <div className="bg-forest px-4 py-2 text-center text-[13px] leading-5 text-white sm:text-[14px]">
      {a.text}
      {href && a.linkText && (isExternal(href)
        ? <a href={href} target="_blank" rel="noopener" className="ml-2 font-bold underline underline-offset-2">{a.linkText}</a>
        : <Link to={href} className="ml-2 font-bold underline underline-offset-2">{a.linkText}</Link>)}
    </div>
  );
}

const StorePill = ({ kind }) => {
  const Icon = Brand[kind];
  return (
    <a href={kind === 'apple' ? CONTACT.appStore : CONTACT.playStore} target="_blank" rel="noopener" className="store-pill nav-font">
      <span className="store-pill__icon"><Icon /></span>
      <span className="store-pill__label"><span>Get it on</span><b>{kind === 'apple' ? 'Apple Store' : 'Play Store'}</b></span>
    </a>
  );
};

function initials(user) {
  return String(user?.name || user?.email || '?').trim().charAt(0).toUpperCase() || '?';
}

function UserAvatar({ user, className = 'h-8 w-8' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = user?.picture || user?.avatar;

  useEffect(() => setImageFailed(false), [image]);

  if (image && !imageFailed) return <img src={image} alt="" onError={() => setImageFailed(true)} className={`${className} rounded-full object-cover`} />;
  return <span className={`grid ${className} place-items-center rounded-full bg-[#e8f0df] text-[13px] font-bold text-[#2d4a3e]`}>{initials(user)}</span>;
}

function LoginButton({ label, className }) {
  const { user, requireLogin, logout } = useAuth();

  if (!user) return <button type="button" className={className} onClick={requireLogin}>{label}</button>;
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link to="/dashboard" aria-label="Open my dashboard" title="My dashboard" className="grid h-10 w-10 place-items-center rounded-full border border-[#87986b]/35 bg-white transition hover:border-[#87986b] hover:shadow-[0_4px_14px_rgba(45,74,62,.18)]">
        <UserAvatar user={user} className="h-8 w-8" />
      </Link>
      <button type="button" aria-label="Sign out" title="Sign out" onClick={logout} className="grid h-10 w-10 place-items-center rounded-full text-[#2d4a3e] transition hover:scale-105 hover:bg-[#e8f0df] hover:text-[#1e2b24]">
        <LogOut className="h-[18px] w-[18px]" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function Header() {
  const [drawer, setDrawer] = useState(false);
  const { pathname, hash } = useLocation();
  const [coursesOpen, setCoursesOpen] = useState(false);
  useEffect(() => setDrawer(false), [pathname, hash]);   // following a link closes the drawer (a course is only a new #hash)
  useEffect(() => { if (drawer) setCoursesOpen(pathname === '/courses'); }, [drawer]);   // opens expanded while a course is showing

  // the underline spans the padded link box, so it runs 10px past the text on each side (Figma); hover previews it.
  // At xl the links sit centred between the logo and the button group: equal gaps either side, like Figma's 111px/111px
  const link = ([to, label]) => (
    <NavLink key={to} to={to} end={to === '/'}
      className={({ isActive }) => `group relative block px-2.5 pb-3 pt-2.5 leading-[25px] transition ${isActive ? 'text-[#87986b]' : 'text-black hover:text-[#87986b]'}`}>
      {({ isActive }) => <>
        {label}
        <span className={`absolute left-0 right-0 top-full h-[3px] bg-[#87986b] transition-transform ${isActive ? '' : 'scale-x-0 group-hover:scale-x-100'}`} />
      </>}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-black/[.06] bg-mint">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-2 px-4 min-[769px]:h-[106px] min-[769px]:gap-4 min-[769px]:px-6 lg:h-[114px] lg:px-10 min-[90rem]:px-20">
        <Link to="/" className="navbar-brand h-11 w-11 shrink-0 min-[769px]:h-[80px] min-[769px]:w-[80px]">
          <img src="/img/logo.png" alt="Dr. SKM's Academy" className="h-full w-full object-contain" />
        </Link>
        <nav className="nav-font ml-10 hidden items-center gap-[11px] text-[18px] lg:flex xl:mx-auto">
          {NAV.map(item => item[0] !== '/courses' ? link(item) : (
            <div key="courses" className="has-menu relative">
              {link(item)}
              <div className="menu absolute left-1/2 top-full w-[540px] -translate-x-1/2 pt-3">
                <div className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_50px_rgba(0,0,0,.18)]">
                  {COURSE_MENU.map(([t, to]) => (
                    <Link key={to} to={to} className="block border-b border-[#ededed] px-8 py-4 text-[17px] text-[#1a1a1a] transition last:border-0 hover:bg-[#f6faf0]">{t}</Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2.5">
          {/* phones (≤768px): the same pills, icon-only (CSS .navbar-stores); 769–1279px: hidden; xl: full pills */}
          <div className="navbar-stores flex items-center gap-1.5 min-[769px]:hidden xl:flex xl:gap-2.5">
            <StorePill kind="apple" />
            <StorePill kind="play" />
          </div>
          <LoginButton label="Login/Signup" className="btn-grad nav-font h-8 rounded-full px-3.5 text-[13px] leading-none !font-normal min-[769px]:h-auto min-[769px]:px-5 min-[769px]:py-2.5 min-[769px]:text-sm xl:h-[53px] xl:px-7 xl:text-[20px]" />
        </div>
        <button type="button" onClick={() => setDrawer(true)} className="-mr-2 p-2 text-[#1a1a1a] lg:hidden" aria-label="Open menu" aria-expanded={drawer}>
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* mobile drawer: slides in from the right over a dimmed page */}
      <div className={`fixed inset-0 z-50 lg:hidden ${drawer ? '' : 'pointer-events-none'}`} inert={!drawer}>
        <div onClick={() => setDrawer(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${drawer ? 'opacity-100' : 'opacity-0'}`} />
        <nav className={`absolute right-0 top-0 flex h-full w-[min(82vw,320px)] flex-col overflow-y-auto overscroll-contain bg-white px-6 pb-8 pt-4 shadow-2xl transition-transform duration-300 ${drawer ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="mb-4 flex items-center justify-between">
            <img src="/img/logo.png" alt="" className="h-11 w-11 object-contain" />
            <button type="button" onClick={() => setDrawer(false)} className="-mr-2 p-2" aria-label="Close menu"><X className="h-6 w-6" /></button>
          </div>
          {NAV.map(([to, label]) => to !== '/courses' ? (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `block border-b border-black/5 py-3.5 text-[16px] ${isActive ? 'text-[#7d8f57]' : 'text-[#2b2b2b]'}`}>{label}</NavLink>
          ) : (
            /* the desktop Courses dropdown, as an accordion: same courses, same order */
            <div key={to} className="border-b border-black/5">
              <button type="button" onClick={() => setCoursesOpen(o => !o)} aria-expanded={coursesOpen} aria-controls="drawer-courses"
                className={`flex w-full items-center justify-between py-3.5 text-left text-[16px] ${pathname === to ? 'text-[#7d8f57]' : 'text-[#2b2b2b]'}`}>
                {label}<ChevronDown className={`h-5 w-5 transition-transform ${coursesOpen ? 'rotate-180' : ''}`} />
              </button>
              <div id="drawer-courses" hidden={!coursesOpen} className="pb-2">
                {COURSE_MENU.map(([t, href]) => {
                  const on = pathname === to && (hash || '#gp') === href.slice(href.indexOf('#'));
                  return <Link key={href} to={href} aria-current={on ? 'page' : undefined}
                    className={`block rounded-lg border-l-2 py-2.5 pl-3 pr-2 text-[14.5px] leading-snug ${on ? 'border-[#7d8f57] bg-[#f6faf0] text-[#7d8f57]' : 'border-transparent text-[#4a4a4a]'}`}>{t}</Link>;
                })}
              </div>
            </div>
          ))}
          <div className="mt-6 flex flex-wrap gap-3"><StorePill kind="apple" /><StorePill kind="play" /></div>
        </nav>
      </div>
    </header>
  );
}

/* Social buttons — footer and contact page */
export function Socials({ size = 40 }) {
  return ['instagram', 'whatsapp', 'facebook', 'youtube'].map(k => {
    const Icon = Brand[k], href = CONTACT[k];
    return (
      <a key={k} href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})} aria-label={k} title={k}
        className="grid place-items-center rounded-full bg-[#8a9b68] text-white transition hover:bg-[#9bad77]" style={{ width: size, height: size }}>
        <Icon />
      </a>
    );
  });
}

function Footer() {
  const col = (title, items) => (
    <nav className="site-footer__col">
      <p className="site-footer__colhead">{title}</p>
      <ul>{items.map(([t, to]) => <li key={to}><Link to={to}>{t}</Link></li>)}</ul>
    </nav>
  );
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <div className="site-footer__logo">
            <span><img src="/img/logo.png" alt="Dr. SKM's Academy" className="h-full w-full object-contain" /></span>
            <span className="site-footer__name">Dr. SKM&#39;s<br />Academy</span>
          </div>
          <p className="site-footer__blurb">AI-powered clinical learning designed specifically for Medical Licensing Examinations. Trusted by 500+ doctors across the GCC.</p>
          <div className="site-footer__social"><Socials size={44} /></div>
          {/* 769–1279px: the navbar has no room for the store pills (phones get icon-only ones in the navbar) */}
          <div className="mt-6 hidden flex-wrap gap-3 min-[769px]:flex xl:hidden"><StorePill kind="apple" /><StorePill kind="play" /></div>
        </div>
        {col('PLATFORMS', [['HOME', '/'], ['Plans', '/plans'], ['Courses', '/courses'], ['About Us', '/about']])}
        {col('SUPPORT', [['Contact Us', '/contact'], ['FAQs', '/faq']])}
      </div>
      <div className="site-footer__bottom">
        <p>&copy; {new Date().getFullYear()} Dr. SKM&#39;s Academy. All rights reserved.</p>
        <p><a href="#">Privacy Policy</a><a href="#">Terms of Use</a><a href="#">Refund Policy</a></p>
      </div>
    </footer>
  );
}

/* Write a Review → /api/reviews. Kept for the team's Review Inbox; the admin approves what gets published. */
function ReviewModal({ onClose }) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!rating) return setMsg({ text: 'Please pick a star rating.', bad: true });
    if (!name.trim()) return setMsg({ text: 'Please enter your name.', bad: true });
    if (body.trim().length < 10) return setMsg({ text: 'Please write a few words about your experience.', bad: true });
    setBusy(true);
    const r = await api('/api/reviews', { method: 'POST', body: JSON.stringify({ name, rating, body }) });
    setBusy(false);
    if (!r?.ok) return setMsg({ text: r?.data?.error || 'Could not send your review — please try again.', bad: true });
    setName(''); setBody(''); setRating(0);
    setMsg({ text: 'Thank you! Your review has been sent to our team.' });
  }

  return (
    <div className="modal-veil" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="review-card" role="dialog" aria-modal="true" aria-label="Write a review">
        <button type="button" onClick={onClose} className="review-card__x" aria-label="Close"><X /></button>
        <p className="review-card__label">Your Rating</p>
        <div className="review-card__stars">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" aria-label={`${n} star`} className={n <= rating ? 'is-on' : ''} onClick={() => setRating(n)}>&#9733;</button>
          ))}
        </div>
        <label className="review-card__label" htmlFor="rev-name">Name</label>
        <input id="rev-name" className="review-card__input" value={name} onChange={e => setName(e.target.value)} />
        <label className="review-card__label" htmlFor="rev-text">Your Review</label>
        <textarea id="rev-text" className="review-card__input review-card__area" placeholder="Write your message...." value={body} onChange={e => setBody(e.target.value)} />
        {msg && <p role="status" className="auth-msg" style={{ color: msg.bad ? '#b42318' : '#4b5b33' }}>{msg.text}</p>}
        <div className="review-card__actions">
          <button type="button" className="review-card__cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn--primary review-card__send" onClick={send} disabled={busy}>Send Review</button>
        </div>
      </div>
    </div>
  );
}
