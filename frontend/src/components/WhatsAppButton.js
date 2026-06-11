import React, { useState } from 'react';

const TEMPLATES = [
  {
    id: 'checkin',
    label: 'Check-in reminder',
    text: (name) => `Hi ${name}, time for your weekly check-in! 💪`,
  },
  {
    id: 'payment',
    label: 'Payment reminder',
    text: (name, extra) => `Hi ${name}, your subscription expires on ${extra || 'soon'}. Let's renew! 💳`,
  },
  {
    id: 'motivation',
    label: 'Motivation',
    text: (name) => `Hi ${name}, great progress this month! Keep it up 🔥`,
  },
];

const WhatsAppButton = ({ client, size = 'md', expiryDate }) => {
  const [open, setOpen] = useState(false);
  const number = client?.number?.replace(/\D/g, '');

  if (!number) return null;

  const send = (template) => {
    const msg = template.text(client.firstName, expiryDate);
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank');
    setOpen(false);
  };

  const btnClass = size === 'sm'
    ? 'text-[11px] px-2 py-1 rounded-[4px]'
    : 'text-[13px] px-3 py-2 rounded-[4px]';

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className={`font-['DM_Sans'] font-medium border border-[#25D366] text-[#25D366] hover:bg-[rgba(37,211,102,0.08)] transition-colors ${btnClass}`}
        title="WhatsApp"
      >
        WhatsApp
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[199]" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-[200] bg-[#1a1a1a] border border-[#383838] rounded-[6px] shadow-xl min-w-[220px]">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => send(t)}
                className="w-full text-left px-4 py-3 text-[13px] font-['DM_Sans'] text-[#888] hover:text-[#f0ede6] hover:bg-[#222] transition-colors border-b border-[#2a2a2a] last:border-0"
              >
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WhatsAppButton;
