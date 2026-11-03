const SECTIONS: { title: string; items: string[] }[] = [
  {
    title: '1. Your token',
    items: [
      'A token holds your place in the queue for one person and one date. It cannot be sold, transferred or shared.',
      'You can only take a token for a date the temple has opened for the queue. Dates are in Singapore time (SGT).',
      'Please give your real name and a mobile number that you can receive WhatsApp messages on.',
    ],
  },
  {
    title: '2. Being called',
    items: [
      'Please be at the temple when your number is called. If you are not there, your token may be skipped.',
      'Token numbers are issued in order and the temple decides the order of service. We cannot promise an exact waiting time.',
      'The temple may pause, close or change the queue at any time, for example for a ceremony or an emergency.',
    ],
  },
  {
    title: '3. Notifications',
    items: [
      'By taking a token you agree to receive a one-time verification code and a message when your token is called, by WhatsApp or SMS to the number you gave.',
      'We only use these messages for the queue. We do not send advertising.',
    ],
  },
  {
    title: '4. Your personal data',
    items: [
      'We collect your name and mobile number only to run the queue and to contact you about your token.',
      'We do not sell your details. Staff who run the queue can see them, and they are kept only as long as needed for the temple records.',
      'To ask us to correct or delete your details, speak to the temple staff.',
    ],
  },
  {
    title: '5. Using the service',
    items: [
      'Do not misuse the service, for example by taking tokens in other people\'s names or with a number that is not yours.',
      'The temple may cancel a token that is misused.',
    ],
  },
];

/** The terms text, shared by the /terms page and the pop-up on the token form. */
export function TermsContent() {
  return (
    <div className="grid gap-5">
      {SECTIONS.map((section) => (
        <section key={section.title}>
          <h2 className="text-[1.0625rem] font-bold text-violet-dark">{section.title}</h2>
          <ul className="mt-2 grid list-disc gap-2 pl-5 text-sm leading-6 text-ink">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
