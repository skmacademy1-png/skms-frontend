/* The message opens in the visitor's own email app, addressed to the academy — nothing is sent from the page */
import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { CONTACT } from '../lib/content.js';
import { Socials } from '../components/Layout.jsx';

const field = 'w-full rounded-2xl bg-[#e6eade] px-6 py-4 text-[15px] outline-none placeholder:text-[#9a9a9a] focus:ring-2 focus:ring-[#33d375]/40';

export default function Contact() {
  const [msg, setMsg] = useState(null);
  const { openEnquiry } = useOutletContext();

  function submit(e) {
    e.preventDefault();
    const f = e.currentTarget;
    const bad = [...f.elements].find(el => el.name && !el.value.trim())
      || (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value) ? f.email : null);
    if (bad) { bad.focus(); return setMsg({ text: `Please fill in a valid ${bad.name}.`, bad: true }); }
    const body = `${f.message.value.trim()}\n\n— ${f.name.value.trim()} (${f.email.value.trim()})`;
    location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(`Enquiry from ${f.name.value.trim()}`)}&body=${encodeURIComponent(body)}`;
    setMsg({ text: 'Your email app is opening with this message — press Send there and we will get back to you shortly.' });
  }

  return (
    <section className="bg-mint pt-20 pb-8 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24 lg:px-24">
        <div>
          <h1 className="font-display text-[34px] font-bold tracking-tight sm:text-[42px]">GET IN TOUCH</h1>
          <p className="mt-6 text-[15px] leading-8 text-[#5f5f5f]">Join 1500+ students who trusted Dr. SKM&#39;s Academy to prepare them for Gulf licensing examinations. Structured. Intelligent. Proven.</p>
          <p className="mt-9 text-[14px] text-[#8a8a8a]">Email</p>
          <a href={`mailto:${CONTACT.email}`} className="break-all text-[16px] font-medium hover:underline">{CONTACT.email}</a>
          <p className="mt-5 text-[14px] text-[#8a8a8a]">Phone</p>
          <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="text-[16px] font-medium hover:underline">{CONTACT.phone}</a>
          <div className="mt-8 flex gap-3"><Socials size={44} /></div>
          <p className="mt-9 text-[14px] text-[#8a8a8a]">Need help choosing your exam or plan?</p>
          <button type="button" className="btn btn--primary mt-3" onClick={() => openEnquiry('guidance')}>Request Guidance</button>
        </div>

        <form noValidate onSubmit={submit}>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block"><span className="mb-2 block text-[14px]">Your name</span>
              <input name="name" required placeholder="eg, ajmal" className={field} /></label>
            <label className="block"><span className="mb-2 block text-[14px]">Email address</span>
              <input name="email" type="email" required placeholder="eg, ajmal55@gmail.com" className={field} /></label>
          </div>
          <label className="mt-6 block"><span className="mb-2 block text-[14px]">Message</span>
            <textarea name="message" required rows={7} placeholder="write something..." className={`${field} resize-none py-5`} /></label>
          <button className="btn-grad mt-7 w-full rounded-full py-4 text-[16px] lg:h-[53px] lg:py-0 lg:text-[20px] lg:!font-normal">Send Message</button>
          {msg && <p role="status" className={`mt-4 text-[14px] ${msg.bad ? 'text-[#c0483f]' : 'text-[#3a8f5c]'}`}>{msg.text}</p>}
        </form>
      </div>
    </section>
  );
}
