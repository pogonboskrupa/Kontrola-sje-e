# 🌲 Kontrola Primke / Sječe

Aplikacija za kontrolu primke i sječe u šumarstvu. Radi **potpuno offline** — nema potrebe za internetom na terenu.

## Karakteristike

- **Offline-first** — jedna HTML datoteka, nula dependencija, nula interneta potrebno
- **Automatsko čuvanje** — sve se sprema u browser lokalnu memoriju (localStorage)
- **Spremi/Učitaj** — JSON format za prenos između uređaja
- **Izvoz CSV** — kompatibilno s Excelom (BOM encoding)
- **Štampanje** — optimizovano za A4
- **Filtriranje** — po vrsti drveta i po razlikama
- **Automatski obračun** — razlike prečnika, dužine, zapremine (V = π·r²·L)

## Dropdownovi

### Vrste drveća
Bukva, Jela, Smrča, Hrast lužnjak, Hrast kitnjak, Grab, Jasen, Javor, Brijest, Lipa, Joha, Topola, Vrba, Bor, Ariš, Duglazija, Ostalo tvrdo, Ostalo meko

### Sortimenti
- Trupac I / II / III
- Furnirski trupac
- Celuloza duga / cijepana / kratka
- Rudničko drvo
- Ogrijev dugi / cijepani / kratki
- Rezonantno drvo, Brodograđevni trupac, Stupovi
- Ostalo tehničko, Otpad

## Upotreba

### Online (GitHub Pages)
Aplikacija je odmah dostupna na:  
`https://<tvoj-username>.github.io/kontrola-primke/`

### Offline (lokalno)
1. Preuzmite `index.html`
2. Otvorite u bilo kom browser-u (Chrome, Firefox, Edge)
3. Koristite bez interneta

### Na mobilnom uređaju (tablet/telefon)
1. Pošaljite `index.html` na uređaj (USB, Bluetooth, email)
2. Otvorite u browser-u
3. Dodajte na početni ekran za app-like iskustvo

## Workflow na terenu

```
Odjel → Datum → Kontrolor → Br. primke
    ↓
[+ Dodaj stablo] za svako stablo
    ↓
Unesi: Vrsta | Pločica | K.Prečnik | K.Dužina | K.Sortiment | Napomena
       (opcionalno) R.Prečnik | R.Dužina | R.Sortiment
    ↓
Razlike se računaju automatski (crveno = razlika, plavo = manji od kontrolnog)
    ↓
[💾 Spremi] → preuzima JSON datoteku
[📊 Izvezi CSV] → otvori u Excelu
[🖨 Štampaj] → A4 izvještaj
```

## Struktura projekta

```
kontrola-primke/
└── index.html    ← cijela aplikacija (sve u jednom fajlu)
```

## GitHub Pages — postavljanje

1. Upload `index.html` na GitHub repozitorij
2. Settings → Pages → Source: `main` branch, folder `/root`
3. Sačekajte 1-2 minute → dostupno na `https://<username>.github.io/<repo>/`

## Format uvoza (CSV/tekst)

Za brzi unos više stabala odjednom:
```
Bukva;4841;37;2.20;Trupac II;napomena;37;2.20;Trupac II
Jela;16426;28;8.60;Celuloza duga;28cm čista treća klasa;28;8.60;Trupac III
```
Kolone: `Vrsta;Pločica;K.Prečnik;K.Dužina;K.Sortiment;Napomena;R.Prečnik;R.Dužina;R.Sortiment`

## Formula za zapreminu

```
V = π × (d/2)² × L
```
gdje je `d` prečnik u cm (dijeli se sa 200 da dobijemo polumjer u metrima), `L` je dužina u metrima.

---
*Razvijeno za potrebe terenskih kontrola šumskog gazdinstva.*
