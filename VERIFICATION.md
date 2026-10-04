# Kontroll av nettsideversjon 2

Kontrollert lokalt 4. oktober 2026. Disse resultatene gjelder implementasjonen i denne grenen, ikke en offentlig produksjonsside.

## Utførte kontroller

- 12 automatiske tester passerer: kontaktvalidering, gyldige tjenestevalg, tekstgrenser, ærlig demosuksess, offlinefeil, lokale ressurser, lenkemål og låst CSS-palett.
- Fem sider er sjekket ved 320, 390, 768, 1024 og 1440 piksler i Chrome 154. Totalt 25 kombinasjoner uten horisontal sideoverflow eller manglende bilder.
- Mobilmenyen er kontrollert for åpning, lukking, navigasjon og Escape med fokus tilbake til menyknappen.
- Forespørselsdemoen er kontrollert for forhåndsvalgt tjeneste, valideringsfeil, bytte av kontaktmåte uten tap av inndata, redigering, ventetilstand, offlinefeil, ny innsending, fullføring og nullstilling.
- Oppsummeringen viser tekst som tekst; en test med HTML-lignende innhold opprettet ikke et bilde eller kjørte innhold som kode.
- Ingen JavaScript-feil eller feil ved henting av side-/bildefiler ble registrert i nettlesertesten.
- Navigasjon og kontaktalternativer er kontrollert med JavaScript deaktivert.
- Synlige skjemafelt har etiketter. Hopp-lenken og FAQ er kontrollert med tastatur.
- Ved redusert bevegelse er ingen seksjoner skjult av inngangsbevegelser.
- Alle fem sider er kontrollert ved 360 pikslers reflowbredde og en ekstra stresstest med doblede tekststørrelser, uten horisontal sideoverflow.
- Desktop- og mobilskjermbilder er visuelt kontrollert. Layoutene bevarer originalbilder og den gule sollogoen.

## Merkevare og kontrast

Interfacepaletten bruker bare de fem opprinnelige Figma-fargene. Hovedtekst på turkis er marineblå; hvit og elektrisk blå brukes på marineblå flater. Sollogoen og illustrasjonene er originale filer. Se `BRAND.md`.

## Begrensninger

- Det er ikke gjennomført en full WCAG-audit eller en skjermlesertest med en bruker. Automatiske og målrettede kontroller er ikke en sertifisering.
- Reflowkontrollen emulerer tilgjengelig visningsbredde, ikke nettleserens zoomknapp. Doblede tekststørrelser er en stresstest, ikke en full erstatning for alle zoomkombinasjoner.
- Safari, Firefox og en fysisk mobil er ikke testet i denne gjennomgangen.
- Ingen produksjonsmålinger, Lighthouse-score eller feltdata for Core Web Vitals er rapportert. Den lokale webserveren representerer ikke en offentlig vertstjeneste.
- Kontaktdetaljer og teamroller er videreført fra originalmaterialet og må bekreftes før offentlig lansering. Tilbudet om gratis første time er utelatt fordi nåværende vilkår ikke er bekreftet.
- Forespørselsskjemaet er en demo. Det er ingen server, lagring eller e-postlevering bak skjemaet.
- De opprinnelige Figma-rammene er inspisert, men nye Figma-redesignrammer er ikke opprettet i denne leveransen.

## Kjør kontrollene på nytt

Se README for kommandoer. `npm test` og `npm run check` krever bare Node.js. Nettleserkontrollene krever Playwright og en kompatibel nettleser. GitHub Actions kjører de vanlige kontrollene på fremtidige endringer.
