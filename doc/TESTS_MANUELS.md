# 🧪 GUIDE TESTS MANUELS - Barades

**Durée estimée**: 30 minutes  
**Objectif**: Valider toutes les fonctionnalités avant déploiement

---

## 🚀 DÉMARRAGE

### Terminal 1 - Backend
```bash
# cd /home/theop/barades
# npx nx serve backend
```
**Attendez**: `Nest application successfully started` sur port 3000

### Terminal 2 - Frontend
```bash
cd /home/theop/barades
npx nx serve frontend
```
**Attendez**: `Compiled successfully` puis ouvrez http://localhost:4200

---

## ✅ SCÉNARIO 1: AUTHENTIFICATION (5 min)

### Test Inscription
1. Cliquer "Connexion" (top-right)
2. Cliquer "S'inscrire"
3. Remplir le formulaire:
   - Username: `test_user_${Date.now()}`
   - Email: `test${Date.now()}@example.com`
   - Password: `TestPassword123!` (12+ chars)
   - Confirm Password: identique
   - Prénom/Nom: optionnel
4. Soumettre
5. ✅ Vérifier: Redirection vers page d'accueil + User menu visible

### Test Connexion
1. Se déconnecter (dropdown user → Déconnexion)
2. Re-cliquer "Connexion"
3. Login avec compte créé
4. ✅ Vérifier: Reconnecté avec succès

### Test Protection Routes
1. Déconnecté, essayer d'accéder `/sessions` (route publique)
2. ✅ Vérifier: Accessible
3. (Optionnel) Essayer route protégée
4. ✅ Vérifier: Redirection vers login si pas authentifié

---

## ✅ SCÉNARIO 2: SESSIONS & RÉSERVATION (10 min)

### Test Liste & Filtres
1. Aller sur "Sessions" (menu)
2. ✅ Vérifier: 5+ sessions affichées
3. Tester filtres:
   - Rechercher "dung" → ✅ Sessions D&D apparaissent
   - Rechercher "dungeon and dragon" (avec faute) → ✅ Autocomplete suggère "Dungeons & Dragons 5e"
   - Filtrer par niveau "Débutant" → ✅ Seulement sessions BEGINNER
   - Filtrer "Disponibles uniquement" → ✅ Sessions non pleines
4. ✅ Vérifier badges: Niveau, Places restantes, En ligne/Sur table

### Test Réservation (IMPORTANT !)
1. Être connecté
2. Trouver session avec places disponibles (playersCurrent < playersMax)
3. ✅ Vérifier: Bouton "Réserver ma place" visible (bleu)
4. Cliquer "Réserver ma place"
5. ✅ Vérifier:
   - Bouton devient "Réservation..."
   - Alert succès "Réservation confirmée"
   - Compteur places +1
   - **Badge bleu "✓ Inscrit" apparaît** à côté du statut
   - **Bouton devient vert "✓ Déjà inscrit"** (désactivé)
6. **Vérifier Email** (console backend):
   - Chercher "✅ Email sent successfully" dans logs
   - Vérifier 2 emails envoyés (confirmation + notification hôte)
7. Essayer de cliquer à nouveau sur le bouton
8. ✅ Vérifier: Bouton reste désactivé (pas d'action possible)

### Test Session Pleine
1. Trouver session avec playersCurrent === playersMax
2. ✅ Vérifier: 
   - Badge "Complet" rouge
   - Bouton "Complet" désactivé (grisé)

### Test Badge Inscription Persistant
1. Recharger la page (F5)
2. ✅ Vérifier:
   - Sessions déjà réservées affichent badge "✓ Inscrit"
   - Bouton reste vert "✓ Déjà inscrit"
   - État persiste après rechargement

---

## ✅ SCÉNARIO 3: CARTE INTERACTIVE (5 min)

### Test Carte Leaflet
1. Aller sur "Lieux" (menu)
2. ✅ Vérifier: Carte visible centrée sur Bruxelles
3. ✅ Vérifier: 3+ markers visibles (rouge/orange/vert)
4. Cliquer sur un marker
5. ✅ Vérifier: Popup s'ouvre avec nom, adresse, type

### Test Géolocalisation
1. Cliquer bouton "Me localiser" (en haut de la carte)
2. Accepter la géolocalisation navigateur
3. ✅ Vérifier:
   - Marker bleu apparaît (votre position)
   - Carte zoom sur lieu le plus proche

### Test Synchronisation Liste ↔ Carte
1. Hover souris sur un lieu dans la liste
2. ✅ Vérifier: Marker correspondant s'agrandit/change de couleur
3. Cliquer marker sur carte
4. ✅ Vérifier: Élément liste correspondant highlight

---

## ✅ SCÉNARIO 4: GROUPES & POLL (10 min)

### Test Liste Groupes
1. Aller sur "Groupes" (menu)
2. ✅ Vérifier: 2+ groupes affichés
3. ✅ Vérifier badges playstyle (Tactique, Narratif, etc.)
4. Cliquer sur un groupe

### Test Détail Groupe
1. ✅ Vérifier affichage:
   - Nom groupe + description
   - Liste membres avec avatars
   - Sessions à venir
   - Widget poll (si existant)

### Test Création Poll
1. Dans groupe, cliquer "Créer un nouveau sondage"
2. Remplir:
   - Titre: "Prochaine session one-shot"
   - Ajouter 3 dates (utiliser input date HTML5):
     * 2025-10-25T18:00
     * 2025-10-26T18:00
     * 2025-10-27T18:00
3. Soumettre
4. ✅ Vérifier: Poll créé et affiché

### Test Vote Poll
1. ✅ Vérifier: 3 dates affichées avec compteurs (0 votes)
2. Cliquer sur première date pour voter
3. ✅ Vérifier:
   - Compteur passe à 1
   - Votre username apparaît dans voters
   - Date marquée comme "votée" (style différent)
   - Pourcentage affiché (ex: 100%)

### Test Changer Vote
1. Cliquer sur deuxième date
2. ✅ Vérifier:
   - Premier vote retiré automatiquement
   - Nouveau vote enregistré
   - Compteurs mis à jour

### Test Meilleure Date
1. (Optionnel) Voter avec compte différent sur dates variées
2. ✅ Vérifier: Badge "🏆 Meilleure date" sur date avec plus de votes

---

## ✅ TESTS EDGE CASES (Bonus - 5 min)

### Session Non Authentifié
1. Se déconnecter (ou naviguer en mode incognito)
2. Aller sur "Sessions" (accessible sans auth)
3. Cliquer sur "Réserver ma place" sur une session disponible
4. ✅ Vérifier: 
   - Redirection automatique vers `/login`
   - URL contient `?returnUrl=/sessions`
5. Se connecter avec un compte existant
6. ✅ Vérifier: Retour automatique vers la page sessions

### Responsive Mobile
1. Ouvrir DevTools (F12)
2. Mode responsive (Ctrl+Shift+M)
3. Tester résolutions: 375px, 768px, 1024px
4. ✅ Vérifier:
   - Menu burger visible sur mobile
   - Cartes stackées verticalement
   - Carte Leaflet responsive
   - Footer 1 colonne → 4 colonnes

### Gestion Erreurs
1. Couper backend (Ctrl+C dans terminal 1)
2. Essayer d'accéder sessions
3. ✅ Vérifier: Message d'erreur "Impossible de charger"
4. Relancer backend
5. Cliquer "Réessayer"
6. ✅ Vérifier: Sessions chargent

---

## 📊 CHECKLIST FINALE

### Fonctionnalités Critiques
- [ ] ✅ Inscription fonctionne
- [ ] ✅ Connexion fonctionne
- [ ] ✅ Protection routes fonctionne
- [ ] ✅ Liste sessions avec filtres
- [ ] ✅ Autocomplete Levenshtein suggère corrections
- [ ] ✅ Réservation session envoie emails
- [ ] ✅ Badge "✓ Inscrit" apparaît après réservation
- [ ] ✅ Bouton devient vert "✓ Déjà inscrit" après réservation
- [ ] ✅ Badge inscription persiste après rechargement
- [ ] ✅ Session pleine → bouton désactivé
- [ ] ✅ Carte Leaflet avec markers
- [ ] ✅ Géolocalisation fonctionne
- [ ] ✅ Sync liste ↔ carte
- [ ] ✅ Liste groupes affichée
- [ ] ✅ Création poll fonctionne
- [ ] ✅ Vote poll fonctionne
- [ ] ✅ Meilleure date calculée

### Qualité
- [ ] ✅ Pas d'erreurs console
- [ ] ✅ Emails envoyés (logs backend)
- [ ] ✅ UI responsive mobile
- [ ] ✅ Messages d'erreur clairs

---

## 🎉 SI TOUT PASSE

**Félicitations !** 🚀

Ton application est **Production Ready** !

**Prochaines étapes** :
1. Ce soir (20h-22h): Charte Graphique + Impact Mapping
2. Demain: Déploiement Vercel + Render
3. Jour 8: Rédaction rapport TFE

---

## 🐛 EN CAS DE BUG

### Bug Email ne part pas
```bash
# Vérifier logs backend
# Chercher "Error sending email"
# Vérifier .env RESEND_API_KEY configuré
```

### Bug Carte ne s'affiche pas
```bash
# Ouvrir console navigateur (F12)
# Chercher erreurs Leaflet
# Vérifier assets Leaflet dans angular.json
```

### Bug 401 Unauthorized
```bash
# Vérifier token JWT dans localStorage
# Se déconnecter/reconnecter
# Vérifier JWT_SECRET backend .env
```

### Autres bugs
```bash
# Vérifier console navigateur (F12)
# Vérifier logs backend terminal
# Relancer backend si nécessaire
```

---

## 💡 NOTES

- **Emails**: Les emails sont envoyés en asynchrone (pas de blocage)
- **Seed Data**: Utiliser comptes pré-existants:
  - alice_dm / password123
  - bob_boardgamer / password123
  - carol_player / password123
- **Base de données**: Reset si besoin avec `npx prisma db push --force-reset`

**Bon tests !** 🧪
