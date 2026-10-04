export const serviceNames = Object.freeze({besok:'Besøksvenn',folge:'Følgetjeneste',hjem:'Hjemmehjelp',usikker:'Jeg er usikker'});

export function validateRequest(data, step) {
  const errors = {};
  if (step === 0 || step === 2) {
    if (!Object.hasOwn(serviceNames, data.service)) errors.service = 'Velg en tjeneste, eller velg «Jeg er usikker».';
  }
  if (step === 1 || step === 2) {
    if (!data.name?.trim()) errors.name = 'Skriv inn navnet ditt.';
    else if (data.name.trim().length > 100) errors.name = 'Navnet kan være opptil 100 tegn.';
    const contact = data.contact?.trim() ?? '';
    if (data.method === 'epost') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) errors.contact = 'Skriv inn en e-postadresse, for eksempel navn@eksempel.no.';
    } else if (data.method === 'telefon') {
      const digits = contact.replace(/\D/g, '');
      if (!/^[+\d\s().-]+$/.test(contact) || digits.length < 8 || digits.length > 15) errors.contact = 'Skriv inn et telefonnummer med 8–15 sifre.';
    } else errors.contact = 'Velg telefon eller e-post som kontaktmåte.';
    if ((data.note ?? '').length > 500) errors.note = 'Beskrivelsen kan være opptil 500 tegn.';
  }
  return errors;
}

/** Local demonstration only. No network request, storage, or booking is performed. */
export function completeDemo({online = true, delay = 650} = {}) {
  return new Promise((resolve, reject) => setTimeout(() => {
    if (!online) reject(new Error('offline'));
    else resolve({mode:'demo',sent:false,booked:false});
  }, delay));
}
