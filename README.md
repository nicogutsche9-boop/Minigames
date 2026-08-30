# 🎮 Mini Arcade

Eine kleine Arcade-Web-App mit HTML, CSS und JavaScript.

## Aktuell

- Neon-Arcade-Startmenü
- Reaction Game
- Memory Game mit 8 Kartenpaaren
- Snake Game auf einem 20×20 Spielfeld
- 30-Sekunden-Runde
- Score & Highscore via localStorage
- Game-Over-Screen
- Highscore-Seite
- Einstellungen
- Responsive Layout
- Memory mit Züge-Zähler und Neustart
- Snake mit Tastatursteuerung, Essen, Wachstum und Game Over

## Lokal starten

Die App nutzt ES-Module. Deshalb sollte `index.html` über einen lokalen Webserver geöffnet werden.

Mit VS Code z. B. über die Erweiterung **Live Server**.

Alternativ im Projektordner:

```bash
python -m http.server 8000
```

Danach `http://localhost:8000` öffnen.

## GitHub Pages

Das Repository kann direkt über GitHub Pages veröffentlicht werden:

Settings → Pages → Deploy from a branch → `main` → `/ (root)`.


## 🏆 Gemeinsames Profil

Alle drei Spiele verwenden jetzt ein gemeinsames Profil:

- XP und Level
- Coins
- separate Highscores für Reaction, Memory und Snake
- Belohnungen nach jeder Runde
- Speicherung im Browser über `localStorage`


## 🏅 Profil & Motivation

- Spielerprofil mit Level und XP-Balken
- 6 Achievements mit Coin-Belohnungen
- 3 tägliche Challenges
- Fortschritt wird pro Tag automatisch zurückgesetzt
- Achievements und Challenges belohnen XP und Coins


## 📱 Snake auf Mobilgeräten

Snake besitzt jetzt ein touchfreundliches Steuerkreuz. Auf Desktop bleibt die Tastatursteuerung mit WASD/Pfeiltasten erhalten.


## 🧱 Block Rush

Das vierte Minigame ist Block Rush – ein eigenes Falling-Blocks-Arcade-Spiel mit:
- 7 Blocktypen
- Drehen, Bewegen, Soft Drop und Hard Drop
- Reihen löschen
- Level und steigende Geschwindigkeit
- Vorschau des nächsten Steins
- Desktop- und Touch-Steuerung


## 🧠 Memory-Modi

- **8 Paare** – Classic
- **16 Paare** – Pro
- **32 Paare** – **Memory Marathon**, zeitlich begrenztes Event bis 13.09.2026
