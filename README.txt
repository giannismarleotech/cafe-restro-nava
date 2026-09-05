CAFÉ NAVA — nieuwe website
==========================
index.html  -> de volledige site. Alle foto's zitten IN dit bestand, dus het werkt overal,
               ook als je het gewoon dubbelklikt of ergens anders uploadt.
img/        -> enkel voor je eigen buitenfoto (zie hieronder).

FOTO VAN DE BUITENKANT (bovenaan de site):
- Zet je scherpe buitenfoto als  img/buitenkant.jpg  naast index.html (liggend, ± 2000 px breed).
  Zolang dat bestand er niet is, toont de site de openingsfoto van de oude website (koffiekop).

PRIJZEN EN GERECHTEN:
- Open index.html in een teksteditor en zoek "const D=". Per gerecht staat  p:"15,00"  (prijs),
  n: (naam) en d: (omschrijving in nl/en/fr/de). De pagina-indeling staat in "const PAGES".

TEKSTEN (NL/EN/FR/DE/ES): object "T".  REVIEWS: lijst "REV" (tekst per kaartje).  INSTAGRAM: de zes foto's in "iggrid" linken naar @cafenava.be.
Contactformulier opent het e-mailprogramma van de bezoeker (mailto info@cafenava.be).

RESERVEREN EN AFHALEN:
- Beide modules sturen de aanvraag naar het café via WhatsApp (0494 61 74 13) of e-mail (info@cafenava.be):
  de klant klikt op de knop en het bericht staat klaar. Jullie bevestigen dan zelf.
- Openingsuren zitten in de code: "const OPEN=10,CLOSE=19,CLOSED_DAY=3" (3 = woensdag).
  Reserveren kan van 10:00 tot 18:30, afhalen van 10:30 tot 19:00, nooit op woensdag, nooit in het verleden.
- Welke gerechten af te halen zijn staat in "const TAKE".
- Het WhatsApp-nummer staat in "const WA" (zonder + of spaties, met landcode 32).
