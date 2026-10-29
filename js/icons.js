// أيقونات SVG مضمّنة (خطية وحديثة)، بلا اعتماد على أي مكتبة خارجية.

function svg(paths, viewBox = '0 0 24 24') {
  return `<svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function svgFilled(paths, viewBox = '0 0 24 24') {
  return `<svg viewBox="${viewBox}" fill="currentColor" stroke="none" aria-hidden="true">${paths}</svg>`;
}

export const Icon = {
  home: svg('<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9"/>'),
  homeFilled: svgFilled('<path d="M12 3.2 2.5 11.2c-.5.4-.2 1.3.5 1.3H5v7.3c0 .7.6 1.2 1.2 1.2H10v-6h4v6h3.8c.7 0 1.2-.5 1.2-1.2V12.5h2c.7 0 1-.9.5-1.3L12 3.2z"/>'),
  people: svg('<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="8" r="2.6"/><path d="M15.5 14.2c2.6.4 4.5 2.7 4.5 5.8"/>'),
  peopleFilled: svgFilled('<circle cx="9" cy="7.5" r="3.5"/><path d="M2.2 20c0-4 3-7 6.8-7s6.8 3 6.8 7c0 .6-.4 1-1 1H3.2c-.6 0-1-.4-1-1z"/><circle cx="17" cy="8" r="2.6" opacity=".55"/><path d="M15.2 13.6c2.9.6 5 3.3 5 6.4 0 .5-.4 1-1 1h-2.4" opacity=".55"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  chatHeart: svg('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'),
  whatsapp: svg('<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"/><path d="M8.5 8.6c.2-.6.5-.6.8-.6h.5c.2 0 .4 0 .6.5.2.5.7 1.7.7 1.9.1.2.1.3 0 .5-.1.2-.2.3-.3.4-.2.2-.3.3-.1.6.6 1 1.3 1.7 2.3 2.2.3.1.4.1.6-.1.1-.2.6-.7.7-.9.2-.2.3-.2.5-.1.2.1 1.4.6 1.6.7.2.1.3.2.4.3 0 .2 0 .9-.4 1.5-.4.6-1.7 1.1-2.3 1.1-.6 0-1.3 0-3-1.2-2-1.4-3.3-3.4-3.4-3.6-.1-.2-.9-1.2-.9-2.3 0-1.1.6-1.7.8-1.9z" fill="currentColor" stroke="none"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  history: svg('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v4l3 2"/>'),
  edit: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>'),
  archive: svg('<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M10 12h4"/>'),
  copy: svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>'),
  back: svg('<path d="M9 6l-6 6 6 6"/><path d="M3 12h18"/>'),
  close: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
  check: svg('<path d="M4 12l5 5L20 6"/>'),
  chevronLeft: svg('<path d="M15 6l-6 6 6 6"/>'),
  trash: svg('<path d="M4 7h16"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>'),
  calendar: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>'),
  phoneCall: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
  visit: svg('<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/><circle cx="12" cy="8.2" r="0" />'),
  sparkle: svgFilled('<path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"/>'),
  contactBook: svg('<rect x="4" y="3" width="15" height="18" rx="2.5"/><circle cx="11.5" cy="9.5" r="2.3"/><path d="M8 16.5c0-2 1.6-3.2 3.5-3.2s3.5 1.2 3.5 3.2"/><path d="M19 7h2M19 12h2M19 17h2"/>'),
  fileUp: svg('<path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4"/><path d="M12 18v-6M9.5 14.5 12 12l2.5 2.5"/>'),
  penLine: svg('<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z"/>'),
  mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>'),
  shield: svg('<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/>'),
  cloud: svg('<path d="M7 18h10.5a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 8.3 8.06 4 4 0 0 0 7 16"/>'),
  cloudCheck: svg('<path d="M6.5 15H16a3.2 3.2 0 0 0 .4-6.38A4.6 4.6 0 0 0 7.6 5.5 3.6 3.6 0 0 0 6.5 13"/><path d="m8.5 17.5 2 2 4-4.2"/>'),
  google: svg('<path d="M20.5 12.2c0-.7-.06-1.36-.18-2H12v3.8h4.8a4.1 4.1 0 0 1-1.78 2.7v2.2h2.9c1.7-1.56 2.58-3.86 2.58-6.7z" fill="currentColor" stroke="none"/><path d="M12 21c2.4 0 4.42-.8 5.9-2.14l-2.9-2.24c-.8.55-1.84.87-3 .87-2.3 0-4.26-1.56-4.96-3.64H4.05v2.3A9 9 0 0 0 12 21z" fill="currentColor" stroke="none"/><path d="M7.04 13.85a5.4 5.4 0 0 1 0-3.7v-2.3H4.05a9 9 0 0 0 0 8.3l2.99-2.3z" fill="currentColor" stroke="none"/><path d="M12 6.7c1.3 0 2.47.45 3.39 1.33l2.54-2.54C16.4 3.9 14.4 3 12 3a9 9 0 0 0-7.95 4.85l2.99 2.3C7.74 8.26 9.7 6.7 12 6.7z" fill="currentColor" stroke="none"/>'),
  download: svg('<path d="M12 4v11m0 0 4-4m-4 4-4-4"/><path d="M4 18v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1"/>'),
  upload: svg('<path d="M12 20V9m0 0 4 4m-4-4-4 4"/><path d="M4 18v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1"/>'),
};

// تركيب بصري تجريدي دافئ يعبّر عن التقارب بين شخصين — لا رسمة كرتونية، أشكال هندسية ناعمة فقط
export const Illustration = {
  connectHero: `<svg viewBox="0 0 200 200" aria-hidden="true">
    <circle cx="100" cy="106" r="90" fill="#F5E2D3" opacity="0.5"/>
    <circle cx="79" cy="114" r="46" fill="#B5502C"/>
    <circle cx="128" cy="99" r="41" fill="#5B6E52"/>
    <circle cx="105" cy="106" r="17" fill="#B07A22" opacity="0.55"/>
    <circle cx="85" cy="55" r="5" fill="#B07A22"/>
    <circle cx="101" cy="46" r="6.5" fill="#B07A22"/>
    <circle cx="117" cy="53" r="5" fill="#B07A22"/>
  </svg>`,
};
