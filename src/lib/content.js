/* Built-in site content — a copy of skms-backend/content.js DEFAULTS. Pages render these instantly (and keep them
   while the Render API is waking up); the admin's saved overrides from /api/cms replace them once they arrive. */

export const DEFAULTS = {
  hero: {
    headline: 'Master Clinical\n*Excellence*\nfor Gulf Licensing',   // one row per line, *word* = green italic
    sub: 'AI-powered clinical learning designed specifically for Gulf licensing examinations. Master 1500+ high-yield Q&As and join successful doctors who passed HAAD, DHA, SLE, QCHP on their first attempt.',
    cta1Text: 'Explore Courses', cta1Link: 'courses.html',
    cta2Text: 'View Plans', cta2Link: 'plans.html',
    image: 'img/hero.jpg',
  },

  /* "Face Real Cases" banner under the hero. *word* = green italic, **words** = bold */
  cases: {
    headline: 'Face Real Cases.\n*Sharpen Your Clinical Thinking.*',
    body: [
      'Highly Recommended for Medical Students for final year examination and Doctors Preparing for Gulf licensing and other Competitive Clinical Examinations Worldwide.',
      'Master the most common, must-know clinical cases faster than ever through realistic AI-powered patient–doctor video learning.',
    ],
    pills: ['Final Year Medical Students', 'Gulf Licensing Candidates', 'Competitive Clinical Examinations Worldwide'],
    quote: 'Our innovative AI-powered live patient videos will bridge the gap between classroom knowledge and real-world clinical practice.',
  },

  /* Plans live in the app database (`plans` table): title, price, days, access label and features come from there.
     These cards are the website's presentation — which plan (planId) a card sells, tone, flag, note, "was" price —
     plus a fallback copy of the database values for when it can't be reached.
     program: id (plans.html#id), label, courseId (app `courses` row), and home-card promo wording (all optional):
     badge, flag, early (note in the price box), tone — never a price.
     card: planId, name (shown only on named cards), price (USD), durationDays, duration (access label), features[],
     was, note, flag, sub, tone (grey|blue|pink), dark */
  plans: [
    { id: 'gp', label: 'GP License Exam', courseId: 22, cards: [
      { planId: 14, name: 'Plan A', price: 60, durationDays: 30, duration: '30 days access', tone: 'grey', features: ['Mock Test', 'Rapid Recalls'] },
      { planId: 15, name: 'Plan B', price: 85, durationDays: 45, duration: '45 days access', tone: 'blue', features: ['MCQ Bank', 'Mock Test', 'Rapid Recalls'] },
      { planId: 16, name: 'Plan C', price: 150, durationDays: 45, duration: '45 days access', tone: 'pink', features: ['MCQ Bank', 'Mock Test', 'Rapid Recalls', 'Video Lectures'] },
    ] },
    { id: 'specialist', label: 'Specialist License Exam', courseId: 19, tone: 'blue', cards: [
      { planId: 23, name: 'Plan A', price: 100, durationDays: 45, duration: '45 days access', tone: 'grey', features: ['MCQ Bank', 'Mock Test'] },
      { planId: 24, name: 'Plan B', price: 200, durationDays: 45, duration: '45 days access', tone: 'blue', features: ['MCQ Bank', 'Mock Test', 'Video Lectures'] },
    ] },
    { id: 'ai', label: 'AI Live Patient', courseId: 20, badge: 'Subscription', flag: '★ Early Bird Available', early: 'Early Bird 30% off', cards: [
      { planId: 25, price: 119, durationDays: 90, duration: '3 months', tone: 'grey',
        note: 'Full AI Live Patient access for 3 months — unlimited clinical scenarios, patient–doctor video learning, and interactive case sessions.' },
      { planId: 26, price: 104.3, was: 149, durationDays: 180, duration: '6 months', dark: true, flag: '★ Early Bird 30% off', sub: 'Save 30% — limited time',
        note: 'Full AI Live Patient access for 6 months — unlimited clinical scenarios, patient–doctor video learning, and interactive case sessions.' },
      { planId: 27, price: 200, durationDays: 365, duration: '12 months', tone: 'blue',
        note: 'Full AI Live Patient access for 12 months — unlimited clinical scenarios, patient–doctor video learning, and interactive case sessions.' },
    ] },
    { id: 'final', label: 'Final Year Medicine Practical', courseId: 21, cards: [
      { planId: 28, name: 'Final year practical', price: 50, durationDays: 45, duration: '45 days full access', tone: 'blue', features: ['Course completion', 'Practical examination techniques'] },
    ] },
  ],

  testimonials: [
    { name: 'Dr. Risi Baderi', role: 'General practitioner - India', rating: 5, body: 'This academy completely transformed my approach to the Kuwait GP licensing examination. The structured study plan, high-yield clinical cases, and AI-powered patient–doctor video scenarios made complex topics much easier to understand. Thank you to the entire team for their outstanding guidance and support.' },
    { name: 'Dr. Nourhan Hussien', role: 'General practitioner - Egypt', rating: 5, body: 'I would like to sincerely thank my amazing doctor and course instructor for all her hard work, dedication, and continuous support throughout my preparation for the Kuwait Prometric Exam. The Prometric questions, revision sessions, practical cases, and exam-oriented guidance were extremely valuable and made a huge difference in my preparation, confidence and every effort she put into helping us succeed. I highly recommend her course to anyone preparing for the Kuwait Prometric Exam.' },
    { name: 'Dr. Rania Ibrahim', role: 'General practitioner - India', rating: 5, body: 'I am happy to share that I have successfully passed the Kuwait prometric Exam. Thank you for the support. The exam was well-structured and focused on practical clinical knowledge and patient management. Consistent study, regular MCQ practice and your guidance were key to my success. I would encourage future candidates to attend the class, practice case-based questions, and manage their time effectively during the exam. Wishing all future candidates the very best.' },
    { name: 'Dr Shanas', role: 'General practitioner - India', rating: 5, body: 'Thank you so much for the incredible support during my Kuwait exam preparation. Your high-yield tips, revision and encouragement gave me the confidence I needed to clear the exam successfully.' },
  ],

  /* "What Our Students Say" — managed in admin → Student Reviews. Never empty: an emptied list falls back
     to these, so the home section always has cards (cmsGet and the server's readReviews both do that). */
  reviews: [
    { name: 'Dr. Fatima Al-Zahra', role: 'DHA Candidate, UAE', rating: 5, body: 'The AI Live Patient cases and clinical reasoning breakdown gave me the exact confidence needed to clear my Dubai Health Authority exam on the first attempt. Outstanding resource!' },
    { name: 'Dr. Arun Varma', role: 'General Practitioner, Oman', rating: 5, body: 'Realistic clinical scenarios that simulate genuine Gulf licensing standards. Highly effective for bridging textbook medicine with high-yield exam stations.' },
    { name: 'Dr. Sarah Jenkins', role: 'Final Year Resident, Bahrain', rating: 5, body: 'Comprehensive practical exam simulations with crystal-clear explanations. It made preparing for viva and clinical stations straightforward and stress-free.' },
    { name: 'Dr. Hrithik Suresh', role: 'Consultant Neurosurgeon, UAE & Saudi Arabia', rating: 5, body: 'The specialized clinical judgment modules and real-time patient case analyses were exceptionally accurate for high-stakes surgical licensing viva. The depth of clinical scenarios provided the exact precision and diagnostic clarity required to clear my specialist board evaluation with ease.' },
    { name: 'Dr. Ananya Nair', role: 'MOH Candidate, Kuwait', rating: 5, body: 'The structured study plan and rapid recalls fit around my hospital shifts, and the mock tests mirrored the real Prometric paper. Every doubt I sent the faculty came back answered the same day.' },
  ],

  faculty: [
    { name: 'Dr. Aravind', role: 'Kuwait Licensed ENT Surgeon', photo: 'img/fac-aravind.jpg' },
    { name: 'Dr. Shahana Kuruniyan', role: 'Dermatology', photo: 'img/fac-shahana.jpg' },
    { name: 'Dr. Saadia', role: 'Gen. Physician-Prometric Exam Tutor', photo: 'img/fac-saadia.jpg' },
    { name: 'Dr. Sofia John', role: 'OMSB Licensed Gen. Surgeon', photo: 'img/fac-sofia.jpg' },
    { name: 'Dr. Nandita', role: 'Specialist pediatrician', photo: 'img/fac-nandita.jpg' },
  ],

  /* thin bar above the site header; admin → Announcement. Hidden while `enabled` is false or `text` is empty */
  announcement: { enabled: false, text: '', linkText: '', link: '' },

  faqs: [
    { q: 'Which Gulf licensing examinations does the Academy cover?', a: 'We cover all major Gulf licensing examinations including HAAD, DHA, and MOH (UAE), SLE (Saudi Arabia). QCHP (Qatar), NHRA (Bahrain), MOH Kuwait, and OMSB (Oman). Content is updated each examination cycle' },
    { q: 'How does the AI clinical learning system work?', a: 'Our AI recreates realistic patient–doctor encounters as video scenarios. You observe history taking, examination technique and reasoning, then work through case-based MCQs built on the same case.' },
    { q: 'Are the courses taught by qualified faculty?', a: 'Yes. Every course is delivered by licensed specialists and surgeons practising in the GCC, supported by our AI media production team.' },
    { q: 'Is there a refund policy?', a: 'Plans are refundable within 48 hours of purchase provided less than 10% of the course content has been accessed. Write to contact@drskmacademy.com to start a request.' },
    { q: 'Can I access the content on mobile?', a: "Yes — the SKM's Academy app is available on the Apple Store and Play Store, and your plan syncs across web and mobile." },
    { q: 'How long does a plan stay active?', a: 'Access length is shown on each plan card — from 30 days up to 12 months for AI Live Patient subscriptions.' },
  ],
};

/* Contact details — navbar, footer and contact page */
export const CONTACT = {
  email: 'contact@drskmacademy.com',
  phone: '+91 9605500678',
  whatsapp: 'https://wa.me/919605500678',
  instagram: 'https://www.instagram.com/drskmsacademy?srtk=ejh4dDZ6amQ4Y3Fq&utm_source=qr',
  facebook: 'https://www.facebook.com/share/1ExuV4wojh/?mibextid=wwXIfr',
  linkedin: 'https://www.linkedin.com/company/dr-skm%E2%80%99s-academy/',
  // paste the real app links here — the navbar pills use them
  appStore: 'https://apps.apple.com/',
  playStore: 'https://play.google.com/store/apps',
};

export const NAV = [
  ['/', 'Home'],
  ['/courses', 'Courses'],
  ['/plans', 'Buy Plans'],
  ['/about', 'About Us'],
  ['/contact', 'Contact Us'],
];

export const COURSE_MENU = [
  ['Gulf Medical Licensing Examinations', '/courses#gp'],
  ['Live patient AI VIDEOS', '/courses#ai'],
  ['Specialist Gulf Licensing Examinations', '/courses#specialist'],
  ['Final year practical exam demo -AI VIDEOS', '/courses#final'],
];

export const money = n => '$' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });   // $150,000
export const planLabel = (group, card) => [group.label, card.name || card.duration].filter(Boolean).join(' — ');
export const initials = name => String(name ?? '').replace(/^Dr\.?\s*/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

/* CMS images and links: uploaded images are data:image URLs, stored paths are relative to the site root
   ("img/hero.jpg", "plans.html#gp" from the static-site days). Every other script-capable scheme is blocked. */
export function safeUrl(u) {
  u = String(u ?? '').trim();
  const s = u.replace(/[\s\x00-\x1f]/g, '');
  if (/^data:/i.test(s)) return /^data:image\/(png|jpe?g|gif|webp|avif);/i.test(s) ? u : '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return /^(https?|mailto|tel):/i.test(s) ? u : '';
  if (u.startsWith('/') || u.startsWith('#')) return u;
  return '/' + u.replace(/^index\.html/, '').replace(/\.html(?=$|[#?])/, '');
}
export const isExternal = u => /^[a-z]+:/i.test(u);
