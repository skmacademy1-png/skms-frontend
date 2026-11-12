import { Link, useOutletContext } from 'react-router';
import { BriefcaseMedical, ClipboardList, PhoneCall, SquarePen } from 'lucide-react';
import { isExternal, safeUrl } from '../lib/content.js';
import { useCms, usePlans } from '../lib/site.jsx';
import { ABOUT_TEXT, COURSE_COPY, SPECIALIST_COPY } from '../lib/copy.jsx';
import { Clamp, Cta, Faculty, FaqList, Founder, ProgramCard, Rich, StudentReview, Testimonial } from '../components/Sections.jsx';
/* a CMS link: an internal page goes through the router, anything else is a plain link */
function CmsLink({ to, className, children }) {
  const href = safeUrl(to);
  if (!children || !href) return null;
  return isExternal(href) ? <a className={className} href={href}>{children}</a> : <Link className={className} to={href}>{children}</Link>;
}

function Hero() {
  const h = useCms('hero');
  const { openReview, openEnquiry } = useOutletContext();
  return (
    <section className="hero">
      <img className="hero__bg" src={safeUrl(h.image)} alt="Doctor holding a stethoscope in a hospital corridor" />
      <div className="hero__veil" aria-hidden="true" />
      {/* mobile (dr.css ≤768px): vertically grouped, left-aligned — 30px title, 15.5px lede, stacked buttons, pills below */}
      <div className="hero__inner">
        <div className="hero__content">
          <h1 className="hero__title"><Rich text={h.headline} /></h1>
          <p className="hero__lede">{h.sub}</p>
          <div className="hero__actions">
            <CmsLink className="btn btn--primary" to={h.cta1Link}>{h.cta1Text}</CmsLink>
            <CmsLink className="btn btn--ghost" to={h.cta2Link}>{h.cta2Text}</CmsLink>
          </div>
        </div>
        <ul className="hero__quick">
          <li><Link className="quick" to="/demo"><ClipboardList /><span>Free Exam<br />Demo</span></Link></li>
          <li><button className="quick" type="button" onClick={openReview}><SquarePen /><span>Write A<br />Review</span></button></li>
          <li><button className="quick" type="button" onClick={() => openEnquiry('guidance')}><PhoneCall /><span>Guidance<br />Request</span></button></li>
          <li><button className="quick" type="button" onClick={() => openEnquiry('job')}><BriefcaseMedical /><span>Job<br />Enquiry</span></button></li>
        </ul>
      </div>
    </section>
  );
}

function Cases() {
  const c = useCms('cases');
  return (
    <section className="cases" aria-labelledby="cases-title">
      <div className="cases__inner">
        <div className="cases__grid">
          <header className="cases__intro">
            <h2 className="cases__title" id="cases-title"><Rich text={c.headline} /></h2>
          </header>
          <div className="cases__copy">{(c.body || []).map((p, i) => <p key={i}><Rich text={p} /></p>)}</div>
        </div>
        <ul className="pill-row">{(c.pills || []).map((p, i) => <li key={i} className="pill">{p}</li>)}</ul>
        <figure className="quote-card">
          <span className="quote-card__mark" aria-hidden="true">&ldquo;</span>
          <blockquote>{c.quote}</blockquote>
        </figure>
      </div>
    </section>
  );
}

const Course = ({ img, alt, title, reverse, children, rich, lines }) => (
  <article className={`course${reverse ? ' course--reverse' : ''}`}>
    <figure className="course__media"><img src={img} alt={alt} /></figure>
    <div className="course__body">
      <h2 className="course__title">{title}</h2>
      <Clamp as={rich ? 'div' : 'p'} lines={lines} className={`course__text${rich ? ' course-rich' : ''}`}>{children}</Clamp>
    </div>
  </article>
);

function Showcase() {
  return (
    <section className="courses" id="courses" aria-label="Our programs">
      <div className="courses__panel">
        <Course img="/img/card-gulf.jpg" alt="Doctor preparing for the Gulf licensing examination at a laptop" title="Gulf Medical Licensing Examinations">{COURSE_COPY.gp}</Course>
        <Course reverse img="/img/card-ai.jpg" alt="AI live patient video session on a laptop beside study notes" title={<>Live patient AI<br />VIDEOS</>}>{COURSE_COPY.ai}</Course>
        <Course img="/img/card-final.jpg" alt="Final year student reviewing a clinical case video" title="Final Year Practical Exam Demo -AI VIDEOS" lines={5}>{COURSE_COPY.final}</Course>
        <Course reverse rich img="/img/card-specialist.jpg" alt="Specialist doctor studying for the licensing examination" title="Specialist Gulf Licensing Examination.">{SPECIALIST_COPY}</Course>
      </div>
    </section>
  );
}

function AboutDark() {
  return (
    <section className="about-dark" id="about">
      <div className="about-dark__inner">
        <figure className="about-dark__media"><img src="/img/tablet.jpg" alt="Doctor reviewing clinical analytics on a tablet" /></figure>
        <div className="about-dark__body">
          <p className="eyebrow">About Us</p>
          <h2 className="about-dark__title">Dr. SKM&#39;s Academy<br /><em>Leading International Platform</em></h2>
          <p className="about-dark__text">{ABOUT_TEXT}</p>
          <Link className="btn btn--primary about-dark__cta" to="/about">Read More</Link>
          <dl className="stats">
            <div className="stat"><dt>1500+</dt><dd>Practice Questions</dd></div>
            <div className="stat"><dt>95%</dt><dd>First-Attempt Pass</dd></div>
            <div className="stat"><dt>6</dt><dd>Gulf Countries</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function Programs() {
  const plans = usePlans();
  return (
    <section className="programs" id="programs">
      <div className="programs__inner">
        <header className="programs__head">
          <p className="eyebrow">Plans</p>
          <h2 className="programs__title">Choose Your Program</h2>
          <p className="programs__sub">Four distinct pathways — GP licensing, specialist exams, AI live patient simulation, and final year practical preparation.</p>
        </header>
        <div className="programs__grid">{plans.map(g => <ProgramCard key={g.id} g={g} />)}</div>
      </div>
    </section>
  );
}

/* both rails render from the built-in copy at once; the admin's saved lists replace them when the API answers,
   so a sleeping backend never leaves the section empty */
function Reviews() {
  const testimonials = useCms('testimonials'), reviews = useCms('reviews');
  return <>
    <section className="testimonials">
      <header className="section-head">
        <p className="eyebrow">TESTIMONIALS</p>
        <h2 className="section-head__title">Doctors Who Passed</h2>
      </header>
      <div className="rail" id="testimonials">{testimonials.map((t, i) => <Testimonial key={i} t={t} />)}</div>
    </section>
    <section className="testimonials testimonials--students" aria-labelledby="student-reviews-title">
      <header className="section-head">
        <p className="eyebrow">VERIFIED REVIEWS</p>
        <h2 className="section-head__title" id="student-reviews-title">What Our Students Say</h2>
      </header>
      <div className="rail" id="student-reviews">{reviews.map((r, i) => <StudentReview key={i} r={r} />)}</div>
    </section>
  </>;
}

export default function Home() {
  return <>
    <Hero />
    <Cases />
    <Showcase />
    <AboutDark />
    <Founder />
    <Programs />
    <Reviews />
    <Faculty />
    <section className="faq" id="faq">
      <div className="faq__inner">
        <header className="faq__head">
          <p className="eyebrow">Questions</p>
          <h2 className="faq__title">Frequently Asked</h2>
        </header>
        <FaqList limit={4} />
        <Link className="faq__more" to="/faq">View all questions →</Link>
      </div>
    </section>
    <Cta />
  </>;
}
