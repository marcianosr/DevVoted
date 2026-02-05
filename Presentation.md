
1 Slide intro - DevVoted: Van Slack Poll naar Roguelite
- Een beetje een inzicht geven in het proces van 0 naar nu
- Mijn filosofie voor DevVoted: "Learning is done best through play"


2 Slide - Dit is DevVoted
DevVoted is een roguelite game waarin spelers deelnemen aan dagelijkse polls over development topics, met als doel hun kennis te vergroten en te concurreren tegen anderen.
- Dev = developer
- Voted = stemmen
- Devotion = toewijding
Dev + Voted + Devotion = DevVoted


3 Slide - Roguelite in het kort
- Korte “runs”, falen hoort erbij, je leert elke keer iets en wordt langzaam sterker via meta-progressie

4 Slide -
- En precies dát lijkt verdacht veel op software development!
- Beide draaien om iteratie, experimentatie, en leren van fouten en het aanpassen van strategieën om succesvoller te worden.

4b Slide
- Ik was overtuigd dat een roguelite format de perfecte manier zou zijn om leren leuker en boeiender te maken voor software developers.

5 Slide - van idee naar DevVoted

Van idee naar DevVoted
- 2022 – polls + gamification (te vlak)
- 2023 – redesign poging (geen richting)
- 2024 – ontdekking roguelite
- 2025 – bouwen + beta
- 2026 – Kabisa + iteratie


6 Slide - Het proces
- Brainstorm → Wireframe → Build → Test → Feel → Repeat

## Voorbeeld: Progressie systeem

### Startidee
- Klassiek XP systeem (levels + levens)

### Mijn gevoel
- Leuk om punten te krijgen…
- maar ik had geen idee wat mijn XP eigenlijk zei over mijn kennis

### Analyse
- XP gaf voortgang, maar betekende niks

## Pivot
- XP vervangen door iets wat dichterbij developers leeft: "coverage" per categorie.
- Mastery zichtbaar maken

### Proces
- ideeën ontstaan in rustige momenten, games of met AI
- wireframes om gevoel te testen
- bouwen -> tastbaar maken
- testers bevestigen of iets werkt


7 Slide - Dev themed Roguelite game - Devvoted - Doel
Hoe ziet dat er dan uit? Jullie hebben nu een beter beeld van wat een roguelite is.
Het is dus een roguelite, maar dan thematisch passend voor software developers.

- Spelers kunnen "coverage" scoren door vragen correct te beantwoorden in dagelijkse polls
- Spelers "strijden" door dagelijkse polls tegen een CI coverage gate, met zichzelf maar ook tegen elkaar.
- Spelers kunnen powerups gebruiken om hun kansen/strategie in de run te verbeteren (installable configs), of die van andereren te dwarsbomen
- Spelen is leren: door deel te nemen aan de polls, leren spelers over verschillende development topics.
- Verlies je tegen een gate? Geen probleem, begin een nieuwe run met nieuwe polls en uitdagingen.

Uiteindeljk is dit een enorme mix uitgebeeld in een app die alles zegt over mijn persoonlijkheid en interesses: games, software dev, leergierigheid, craftsmanship, leren, community building, competitie, en zelfverbetering etc.



8 Slide - Tech stack - een excuus om ook technisch te experimenteren
- ik koos bewust tools buiten mijn comfort zone, omdat het een hobbyproject was kon ik risico nemen
- dat gaf me snelheid én leerervaring

- Supabase - BaaS  - Using mainly for Auth and DB - Postgres DB + realtime
- Tanstack Start Framework - SSR approach
  - Had al eerder een Next.js versie prototype, maar werd getriggered door de aankondiging van Tanstack Start Framework
  - Was bij de bouw nog niet eens een 1.0 release, maar ik wilde het graag proberen na een avondje experimenteren (tijdens een avond sessie)
    Built-in:
        - Router - for routing and server side data fetching and type safety
    - Query - for client side data fetching and caching
- AI - for (technical) brainstorming and idea generation


### Structuur
 - Domain driven design met Screaming architecture - duidelijke scheiding tussen ui, domain logic en data laag:
 -  ├── polls/      # Core quiz vragen
    ├── runs/       # Game sessies
    ├── configs/    # Power-up systeem
    ├── score/      # Scoring berekeningen
    └── economy/    # Shop & storage



10 Wat is DevVoted?

DevVoted = ik
Games	- creativiteit + emotie
Polls	- kennis delen
Runs	- consistent bouwen (zoals trainingsblokken)
Gates	- kwaliteitsdrempels
Configs	- frontend-tinkering
Community	- Kabisa + mijn behoefte aan verbinding


11 Slide - Lessons (re)learned of gewoon takeaways
- Snelle iteratie is key - zowel in development als in game design
- Documenteer je ideeën en beslissingen - helpt bij reflectie en toekomstige iteraties. Zelf gebruik ik Notion en soms Slack ik ideeën naar mezelf
- Beta testers zijn goud waard: Feedback van spelers is cruciaal - zowel voor balans als content
- Een spel maken is echt moeilijk
- Een spel maken is echt leuk


1 Intro
2 Wat is DevVoted
3 Roguelite
4 Dev parallel
5 Timeline
6 Proces (case)
7 Mechanics
8 Tech
10 DevVoted = ik
11 Lessons