/* Building blocks shared by several pages. CMS text is rendered as React text (never innerHTML):
   *word* becomes the green italic, **words** bold, and a newline a line break. */
import { Fragment, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, Star } from 'lucide-react';
import { DEFAULTS, initials, money, safeUrl } from '../lib/content.js';
import { useCms, useFaculty } from '../lib/site.jsx';

export function Rich({ text }) {
  return String(text ?? '').split('\n').map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line.split(/(\*\*.+?\*\*|\*.+?\*)/g).map((part, j) =>
        part.startsWith('**') && part.endsWith('**') && part.length > 4 ? <strong key={j}>{part.slice(2, -2)}</strong>
        : part.startsWith('*') && part.endsWith('*') && part.length > 2 ? <em key={j}>{part.slice(1, -1)}</em>
        : part)}
    </Fragment>
  ));
}

/* 7-line clamp (or `lines`) with "See more" — the button only shows when the text is actually cut off (the labels come from CSS) */
export function Clamp({ as: Tag = 'p', className, lines, children }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [cut, setCut] = useState(false);
  useEffect(() => {
    const check = () => ref.current && !open && setCut(ref.current.scrollHeight > ref.current.clientHeight + 1);
    check();
    addEventListener('resize', check);
    document.fonts?.ready.then(check);   // web fonts change the line count
    return () => removeEventListener('resize', check);
  }, [open]);
  return <>
    <Tag ref={ref} data-clamp="" style={lines && { WebkitLineClamp: lines }} className={`${className}${open ? ' is-open' : ''}`}>{children}</Tag>
    {(cut || open) && <button type="button" className="see-more" onClick={() => setOpen(o => !o)} />}
  </>;
}

/* figma: the testimonial card's own sage star (img/star.svg); else lucide stars in the card's colour */
export function Stars({ rating, figma }) {
  const n = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
  return (
    <div className="tcard__stars" role="img" aria-label={`${n} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map(i => figma
        ? <img key={i} src="/img/star.svg" width="16" height="16" alt="" className={i < n ? '' : 'is-off'} />
        : <Star key={i} className={i < n ? '' : 'is-off'} />)}
    </div>
  );
}

function cleanReview(body) {
  return String(body ?? '').trim().replace(/^(["“”])+|(["“”])+$/g, '').trim();
}

export function Testimonial({ t }) {
  return (
    <article className="tcard">
      <Stars rating={t.rating} figma />
      <p className="tcard__quote">{cleanReview(t.body)}</p>
      <footer className="tcard__by">
        <span className="tcard__avatar">{String(t.name ?? '').replace(/^Dr\.?\s*/i, '')[0] || '?'}</span>
        <span><b>{t.name}</b><span>{t.role}</span></span>
      </footer>
    </article>
  );
}

export function StudentReview({ r }) {
  return (
    <article className="tcard tcard--student">
      <Stars rating={r.rating} />
      <p className="tcard__quote">{cleanReview(r.body)}</p>
      <footer className="tcard__by">
        <span className="tcard__avatar">{initials(r.name)}</span>
        <span><b>{r.name}</b><span>{r.role}</span><span className="tcard__verified">✓ Verified Student</span></span>
      </footer>
    </article>
  );
}

/* home page "Choose Your Program" summary card */
export function ProgramCard({ g }) {
  // promo wording: the saved program first, else the built-in default (a copy saved before these fields existed)
  const d = DEFAULTS.plans.find(x => x.id === g.id) || {}, promo = k => g[k] ?? d[k];
  const dark = g.cards.some(c => c.dark), flag = promo('flag') ?? g.cards.find(c => c.flag)?.flag, early = promo('early');
  const badge = promo('badge') ?? (g.cards.length === 1 ? 'One Plan' : `${g.cards.length} Plans`);
  const tone = dark ? 'dark' : promo('tone') || g.cards[0].tone || 'grey';
  // one plan: the title already names it · named plans: name, price, access · unnamed (AI): access, price, offer
  const line = c => g.cards.length === 1 ? `${money(c.price)} — ${c.duration}`
    : c.name ? `${c.name} — ${money(c.price)} (${c.duration})`
    : `${c.duration} — ${money(c.price)}${c.was ? '  Early Bird' : ''}`;
  return (
    <article className={`plan-card${dark ? ' plan-card--dark' : ''}`}>
      {flag && <span className="plan-card__flag">{flag}</span>}
      <div className="plan-card__top">
        <div className={`plan-card__head plan-card__head--${tone}`}>
          <span className="plan-card__badge">{badge}</span>
          {early && <p className="plan-card__early">{early}</p>}
          <p className="plan-card__price">from <strong>{money(Math.min(...g.cards.map(c => Number(c.price) || 0)))}</strong></p>
        </div>
        <h3 className="plan-card__title">{g.label}</h3>
        <Link className={`plan-card__btn${dark ? ' plan-card__btn--solid' : ''}`} to={`/plans#${encodeURIComponent(g.id)}`}>View Plans <span aria-hidden="true">→</span></Link>
      </div>
      <ul className="plan-card__list">{g.cards.map((c, i) => <li key={i}>{line(c)}</li>)}</ul>
    </article>
  );
}

/* one buyable plan on the Buy Plans page */
export function PlanCard({ c, onBuy }) {
  return (
    <article className={`plan-card${c.dark ? ' plan-card--dark' : ''}`}>
      {c.flag && <span className="plan-card__flag">{c.flag}</span>}
      <div className="plan-card__top">
        <div className={`plan-card__head plan-card__head--${c.dark ? 'dark' : c.tone || 'grey'}`}>
          {c.name && <span className="plan-card__badge">{c.name}</span>}
          {c.was && <span className="plan-card__badge plan-card__badge--was">{money(c.was)}</span>}
          <p className="plan-card__price"><strong>{money(c.price)}</strong></p>
        </div>
        <p className="plan-card__access">{c.duration}</p>
        {c.sub && <p className="plan-card__sub">{c.sub}</p>}
        <button type="button" onClick={onBuy} className={`plan-card__btn${c.dark ? ' plan-card__btn--solid' : ''}`}>Buy Now</button>
      </div>
      {c.features?.length > 0 && <ul className="plan-card__list plan-card__list--check">{c.features.map((f, i) => <li key={i}>{f}</li>)}</ul>}
      {c.note && <p className="plan-card__note">{c.note}</p>}
    </article>
  );
}

export function Faculty() {
  const { faculty, failed, retry } = useFaculty(), hasCards = faculty?.length > 0;
  const rail = useRef(null), group = useRef(null);
  const [loop, setLoop] = useState(false);
  useEffect(() => {
    if (!hasCards) return;
    const measure = () => setLoop(group.current.offsetWidth > rail.current.clientWidth);
    const ro = new ResizeObserver(measure);
    ro.observe(rail.current);
    ro.observe(group.current);
    return () => ro.disconnect();
  }, [hasCards]);
  if (faculty && !hasCards) return null;   // the admin emptied the list on purpose

  const cards = hasCards && faculty.map((f, i) => (
    <figure key={i} className="fac">
      <img src={safeUrl(f.photo)} alt={f.name} loading="lazy" />
      <figcaption><b>{f.name}</b><span>{f.role}</span></figcaption>
    </figure>
  ));
  return (
    <section className="faculty">
      <header className="section-head">
        <p className="eyebrow">Expert Faculty</p>
        <h2 className="section-head__title">Learn From the Best</h2>
        <p className="section-head__sub">Our multidisciplinary team of licensed specialists, surgeons, and AI media professionals — each an expert in their field.</p>
      </header>
      {/* the second copy only exists when the row overflows the screen and has to loop seamlessly */}
      {hasCards ? (
        <div className="marquee" ref={rail}><div id="faculty" className={loop ? undefined : 'is-static'}>
          <div className="marquee-group" ref={group}>{cards}</div>
          {loop && <div className="marquee-group" aria-hidden="true">{cards}</div>}
        </div></div>
      ) : (
        <div className="faculty__status" role="status">
          {failed
            ? <><p>We couldn&#39;t load our faculty right now.</p><button type="button" onClick={retry}>Try again</button></>
            : <p>Loading our faculty…</p>}
        </div>
      )}
    </section>
  );
}

export function FaqList({ limit }) {
  const faqs = useCms('faqs');
  return (
    <div className="faq__list">
      {faqs.slice(0, limit || faqs.length).map((f, i) => (
        <details key={i} className="faq-item">
          <summary>{f.q}<ChevronDown className="chev" /></summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Founder() {
  return (
    <section className="founder" id="ceo">
      <div className="founder__inner">
        <div className="founder__body">
          <p className="eyebrow">CEO &amp; Founder</p>
          <h2 className="founder__title">Meet the Mind Behind the Mission-<br /><em>From Vision to Reality!</em></h2>
          <p className="founder__name">Dr. Shameema K Mohammed</p>
          <div className="founder__card">
            <p>A Kuwait licensed Family physician, Dr.Shameema K Mohammed is a medical educator renowned for her dedication to mentoring aspiring healthcare professionals. With a strong global presence,she has successfully trained and mentored doctors through AI-powered video learning resources,interactive webinars and individualized guidance. Driven by her passion for medical education, Dr.Shameema K Mohammed spent years mentoring doctors through her educational programs and digital platforms. Today, the academy has helped numerous doctors successfully clear Gulf Medical Licensing Examinations through comprehensive training and AI-based clinical case video learning for medical professionals.</p>
          </div>
        </div>
        <figure className="founder__media">
          <img src="/img/ceo-portrait.png" alt="Dr. Shameema K Mohammed, founder of Dr. SKM's Academy" />
        </figure>
      </div>
    </section>
  );
}

export function Cta({ to = '/contact', label = 'Contact Us' }) {
  return (
    <section className="cta">
      <div className="cta__inner">
        <h2 className="cta__title">Your Gulf Licensing Journey<br /><em>Starts Here</em></h2>
        <p className="cta__text">Join 500+ doctors who trusted Dr. SKM&#39;s Academy to prepare them for Gulf licensing examinations. Structured. Intelligent. Proven.</p>
        <Link className="btn btn--primary cta__btn" to={to}>{label}</Link>
      </div>
    </section>
  );
}
