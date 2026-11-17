# Mon Lifestyle

Dashboard personnel de ton lifestyle : tu crées des catégories (maisons, voitures,
montres, sneakers, art…) et tu ajoutes toi-même chaque élément dans ses slots.

- **Chiffres clés** : valeur totale, plus/moins-value vs prix d'achat, montant investi, total de la wishlist
- **Répartition** du patrimoine par catégorie
- **Fiches** : nom, marque/modèle, année, prix d'achat, valeur actuelle, date, emplacement, photo (lien ou fichier), notes
- **Statuts** : possédé, wishlist / objectif, vendu
- **Recherche**, filtres par catégorie et statut
- **Sauvegarde** : export / import JSON (bouton en haut à droite)

Les données restent sur ton ordinateur, rien n'est envoyé en ligne.

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
