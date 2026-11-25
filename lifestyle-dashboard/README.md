# Mon Lifestyle

Inventaire privé de ton lifestyle : tu crées tes collections (immobilier, garage,
horlogerie, joaillerie, art, cave…) et tu ajoutes toi-même chaque bien avec **tes propres photos**.

- **Vue d'ensemble** : patrimoine net, plus-value, capital investi, tes collections en grandes vignettes
  (« Mes univers »), ta dernière évasion, la courbe d'évolution et la répartition
- **Ambiances par collection** : agence de prestige pour l'immobilier, showroom pour le garage,
  écrin pour l'horlogerie, casier pour la cave, mur de galerie pour l'art…
- **Photos** : plusieurs par bien, glisser-déposer partout, visionneuse plein écran
- **Famille** : les biens qui appartiennent à la famille (maison des parents, voiture, montre du
  grand-père…). Tu y as accès dans l'appli, mais ils ne comptent pas dans ton patrimoine
- **Vacances** : un carnet par voyage avec les trajets (choisis parmi tes véhicules, y compris ceux
  de la famille, ou avion, train…), les hébergements (hôtel, location, une de tes propriétés,
  la maison de famille), le récit jour par jour avec photos, l'album et le budget
- **Apparence** : thème Jour (clair et chaleureux) ou Nuit, photo de fond au choix avec voile et flou
- **Sauvegarde** : export / import d'un fichier unique (photos comprises)

Les données restent sur ton ordinateur (menu « Dossier des données »), rien n'est envoyé en ligne.

## Installer l'appli sur Mac

1. Télécharge directement :
   - Mac **M1/M2/M3/M4** : https://github.com/DTKPho/liam-life-os/releases/latest/download/Mon-Lifestyle-arm64.dmg
   - Mac **Intel** : https://github.com/DTKPho/liam-life-os/releases/latest/download/Mon-Lifestyle-x64.dmg
2. (Toutes les versions : onglet **Releases** du repo.)
3. Ouvre le `.dmg` et glisse **Mon Lifestyle** dans **Applications**.
4. L'appli n'est pas signée par Apple : au premier lancement, ouvre le Terminal et tape :

   ```bash
   xattr -cr "/Applications/Mon Lifestyle.app"
   ```

   puis ouvre l'appli normalement.
5. **Raccourci sur le bureau** : dans Finder → Applications, maintiens **⌥ Option + ⌘ Cmd**
   et glisse l'appli sur le bureau (ça crée un alias). Ou clic droit sur l'icône dans le Dock
   → Options → **Garder dans le Dock**.

## Construire l'appli soi-même (sur le Mac)

```bash
cd lifestyle-dashboard
npm install
npm run dist:mac   # le .dmg est créé dans dist/
```

`npm start` lance l'appli sans la construire. Tu peux aussi simplement ouvrir
`app/index.html` dans un navigateur.

## Structure

- `app/index.html` — tout le dashboard (HTML/CSS/JS, sans dépendance)
- `main.js`, `preload.js` — la fenêtre Electron de l'appli desktop
- `resources/icon.png` — icône de l'appli
- `.github/workflows/lifestyle-mac.yml` (à la racine du repo) — construit le `.dmg` sur un Mac GitHub
