# Stadsbingo - Bit Academy

Een mobiel-vriendelijke webapplicatie voor het spelen van een stadsbingo, waarbij deelnemers verschillende locaties in Groningen bezoeken en opdrachten voltooien door foto's te uploaden als bewijs.

## ✨ Functies

- **Teamregistratie**: Registreer je team met een naam, captain en aantal leden
- **Locatiegebonden opdrachten**: Navigeer door een reeks van 8 bezienswaardigheden in Groningen
- **Foto-inzendingen**: Upload fotobewijs van voltooide opdrachten
- **Voortgangsbewaking**: Teams kunnen alleen naar de volgende locatie gaan na het voltooien van de huidige taak
- **Admin Paneel**: Beoordeel en scoor teaminzendingen
- **Responsief Ontwerp**: Werkt op mobiele apparaten en desktop browsers
- **Offline Mogelijkheid**: Gebruikt lokale opslag om team- en inzendingsgegevens op te slaan

## 📁 Projectstructuur

```
stadsbingo/
├── public/
│   └── images/            # Statische afbeeldingen voor locaties
├── src/
│   ├── pages/
│   │   ├── admin.jsx      # Admin paneel voor het beoordelen van inzendingen
│   │   ├── bedankt.jsx    # Bedanktpagina na het voltooien van alle opdrachten
│   │   ├── home.jsx       # Home/landingspagina
│   │   ├── quiz.jsx       # Hoofdspelinterface
│   │   └── register.jsx   # Teampregistratiepagina
│   ├── App.jsx            # Hoofdcomponent met routing
│   ├── main.jsx           # Startpunt
│   ├── index.css          # Globale stijlen
│   └── questions.json     # Locatie- en opdrachtgegevens
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── README.md
```

## 🚀 Installatie

1. Clone de repository
   ```sh
   git clone https://github.com/yourusername/stadsbingo.git
   cd stadsbingo
   ```

2. Installeer dependencies
   ```sh
   npm install
   ```

3. Start de ontwikkelingsserver
   ```sh
   npm run dev
   ```

4. Bouw voor productie
   ```sh
   npm run build
   ```

5. Bekijk de productiebuild
   ```sh
   npm run preview
   ```
