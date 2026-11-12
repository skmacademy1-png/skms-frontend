/* Job Enquiry (hero button) and Guidance Request (Contact page) → POST /api/enquiries/:kind, read by the admin.
   Same card as Write a Review. Pages open it through the outlet context: useOutletContext().openEnquiry('job') */
import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../lib/api.js';

const PHONE = { type: 'tel', inputMode: 'tel', autoComplete: 'tel', maxLength: 20, placeholder: 'eg, +91 98765 43210' };
// [name, label, input props]; required unless `optional`. The API checks the same rules again.
const JOB_FIELDS = [
  ['name', 'Full Name', { autoComplete: 'name', maxLength: 80 }],
  ['qualification', 'Qualification', { maxLength: 120, placeholder: 'eg, MBBS, MD' }],
  ['experience', 'Years of Experience', { type: 'number', inputMode: 'decimal', min: 0, max: 60, step: 0.5 }],
  ['phone', 'Contact Number', PHONE],
  ['specialization', 'Gulf Licensing Examination Qualified Field / Medical Specialization', { maxLength: 120, wide: true }],
];
const ENQUIRY_FORMS = {
  job: { title: 'Job Enquiry', fields: JOB_FIELDS },
  // the same student details as Job Enquiry, plus a short optional message
  guidance: { title: 'Guidance Request', fields: [...JOB_FIELDS,
    ['requirement', 'Guidance Requirement (optional)', { textarea: true, optional: true, rows: 3, maxLength: 1000, placeholder: 'Briefly describe your guidance requirement' }]] },
};

const validPhone = v => /^\+?\d{7,15}$/.test(v.replace(/[\s().-]/g, ''));

export function EnquiryModal({ kind, onClose }) {
  const { title, fields } = ENQUIRY_FORMS[kind];
  const blank = () => Object.fromEntries(fields.map(([k]) => [k, '']));
  const [form, setForm] = useState(blank);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  // one id per fill-in: a double submit or a retry after a timeout is stored once by the API
  const id = useRef(crypto.randomUUID());

  async function send(e) {
    e.preventDefault();
    if (busy) return;
    const f = e.currentTarget;
    const bad = fields.find(([k, , o]) => {
      const v = form[k].trim();
      if (!v) return !o.optional;
      return (o.type === 'tel' && !validPhone(v)) || (o.type === 'number' && !(Number(v) >= 0 && Number(v) <= 60));
    });
    if (bad) {
      f.elements[bad[0]].focus();
      return setMsg({ text: `Please enter a valid ${bad[1].toLowerCase()}.`, bad: true });
    }
    setBusy(true);
    setMsg(null);
    const r = await api(`/api/enquiries/${kind}`, { method: 'POST', body: JSON.stringify({ ...form, id: id.current }) });
    setBusy(false);
    if (!r?.ok) return setMsg({ text: r?.data?.error || 'Could not send your enquiry — please check your connection and try again.', bad: true });
    id.current = crypto.randomUUID();
    setForm(blank());
    setMsg({ text: 'Thank you! Your enquiry has been sent — our team will contact you shortly.' });
  }

  return (
    <div className="modal-veil overflow-y-auto" onClick={e => e.target === e.currentTarget && onClose()}>
      <form noValidate onSubmit={send} className="review-card my-auto" role="dialog" aria-modal="true" aria-labelledby="enq-title">
        <button type="button" onClick={onClose} className="review-card__x" aria-label="Close"><X /></button>
        <h2 id="enq-title" className="mb-6 pr-8 font-display text-[26px] font-bold">{title}</h2>
        <div className="grid sm:grid-cols-2 sm:gap-x-4">
          {fields.map(([k, label, { textarea, wide, optional, ...o }]) => {
            const Input = textarea ? 'textarea' : 'input';
            return (
              <div key={k} className={textarea || wide ? 'sm:col-span-2' : ''}>
                <label className="review-card__label" htmlFor={`enq-${k}`}>{label}</label>
                <Input id={`enq-${k}`} name={k} required={!optional} {...o} className={`review-card__input${textarea ? ' resize-none' : ''}`}
                  value={form[k]} onChange={e => { setForm(s => ({ ...s, [k]: e.target.value })); if (msg?.bad) setMsg(null); }} />
              </div>
            );
          })}
        </div>
        {msg && <p role="status" className="auth-msg mb-4" style={{ color: msg.bad ? '#b42318' : '#4b5b33' }}>{msg.text}</p>}
        <div className="review-card__actions">
          <button type="button" className="review-card__cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary review-card__send" disabled={busy}>{busy ? 'Sending…' : 'Send Enquiry'}</button>
        </div>
      </form>
    </div>
  );
}
