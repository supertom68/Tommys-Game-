# Tommys Game (Lotto PWA)

## Features
- Installierbare Progressive Web App (PWA) mit Start-Icon
- Name: **Tommys Game**
- 14 Tipp-Reihen (6 aus 49) basierend auf historischen Häufigkeiten & Heuristiken
- Erweiterte Regeln: Summen, Gerade/Ungerade, Cluster-Spread, Anti-Duplikat
- Buttons: Neu generieren, Export CSV, Export PDF (mit jsPDF)
- Offline-fähig (Service Worker + Cache)

## Nutzung
1. Entpacken
2. Lokalen Server starten, z.B.:
   ```bash
   python3 -m http.server 8000
   ```
3. Im Browser `http://localhost:8000` öffnen
4. "Zum Startbildschirm hinzufügen" für App-Installation
