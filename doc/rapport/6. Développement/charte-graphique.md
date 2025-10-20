# 🎨 CHARTE GRAPHIQUE - Bar à Dés

**Projet** : Plateforme de mise en relation pour joueurs de jeux de rôle  
**Date** : 17 octobre 2025  
**Auteur** : Théophile Desmedt

---

## 1. 🎯 IDENTITÉ VISUELLE

### Nom du projet
**Bar à Dés**

### Baseline / Slogan
> "Votre plateforme de Jeu de Rôle"

### Positionnement
- Moderne et accessible
- Communautaire et convivial
- Dark theme pour ambiance immersive
- Gaming-oriented avec touches professionnelles

---

## 2. 🎨 PALETTE DE COULEURS

### Couleurs Principales

| Couleur | Hex Code | Usage | Exemple visuel |
|---------|----------|-------|----------------|
| **Indigo Primaire** | `#667eea` | Boutons CTA, liens, états hover | ███████ |
| **Violet Secondaire** | `#764ba2` | Accents, dégradés, highlights | ███████ |
| **Dark Background** | `#111827` | Fond principal de l'application | ███████ |
| **Gray Surface** | `#1f2937` | Cards, modals, surfaces élevées | ███████ |

### Couleurs Fonctionnelles

| Couleur | Hex Code | Usage |
|---------|----------|-------|
| **Success Green** | `#10b981` | Confirmations, badges "Places disponibles" |
| **Error Red** | `#ef4444` | Alertes, badges "Complet" |
| **Warning Orange** | `#f59e0b` | Avertissements, états intermédiaires |
| **Info Blue** | `#3b82f6` | Informations, tooltips |
| **Text Primary** | `#f3f4f6` | Texte principal sur fond sombre |
| **Text Secondary** | `#9ca3af` | Texte secondaire, labels |

### Dégradé Signature

```css
/* Dégradé utilisé dans les boutons, headers, emails */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Utilisation** :
- Boutons primaires en hover
- Headers de sections importantes
- Backgrounds des emails
- Accents visuels stratégiques

---

## 3. ✍️ TYPOGRAPHIE

### Famille de Police

**Police principale** : [**Inter**](https://fonts.google.com/specimen/Inter) (Google Fonts)

**Raisons du choix** :
- Excellente lisibilité sur écrans
- Support complet des accents français
- Variantes de poids multiples (300-900)
- Open source et performante
- Design moderne et neutre

### Hiérarchie Typographique

| Élément | Police | Poids | Taille | Line-height | Usage |
|---------|--------|-------|--------|-------------|-------|
| **H1 - Titres principaux** | Inter | 700 (Bold) | 48px | 1.2 | Page titles, hero sections |
| **H2 - Sous-titres** | Inter | 700 (Bold) | 32px | 1.3 | Section headers |
| **H3 - Titres sections** | Inter | 600 (SemiBold) | 24px | 1.4 | Card titles, modal headers |
| **Body - Texte courant** | Inter | 400 (Regular) | 16px | 1.6 | Paragraphes, descriptions |
| **Small - Texte secondaire** | Inter | 400 (Regular) | 14px | 1.5 | Labels, metadata |
| **Caption - Annotations** | Inter | 500 (Medium) | 12px | 1.4 | Badges, tags, timestamps |
| **Button - Boutons** | Inter | 600 (SemiBold) | 16px | 1 | Call-to-actions |

### Exemples de Code

```css
/* Titres */
h1 {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 3rem; /* 48px */
  line-height: 1.2;
  color: #f3f4f6;
}

/* Corps de texte */
body {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 1rem; /* 16px */
  line-height: 1.6;
  color: #f3f4f6;
}

/* Badges */
.badge {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 0.75rem; /* 12px */
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## 4. 🧩 COMPOSANTS UI

### 4.1 Boutons

#### Bouton Primaire
```html
<button class="bg-gradient-to-r from-indigo-600 to-purple-600 
               hover:from-indigo-700 hover:to-purple-700
               text-white font-semibold px-6 py-3 rounded-lg
               transition-all duration-300 shadow-lg hover:shadow-xl">
  Réserver ma place
</button>
```

**Caractéristiques** :
- Fond dégradé indigo → violet
- Texte blanc, semi-bold
- Padding : 12px vertical, 24px horizontal
- Border-radius : 8px (arrondi)
- Ombre portée qui s'intensifie au hover
- Transition fluide 300ms

#### Bouton Secondaire
```html
<button class="border-2 border-indigo-500 text-indigo-400
               hover:bg-indigo-500 hover:text-white
               font-semibold px-6 py-3 rounded-lg
               transition-all duration-300">
  En savoir plus
</button>
```

**Caractéristiques** :
- Bordure indigo, fond transparent
- Texte indigo qui devient blanc au hover
- Fond qui se remplit au hover
- Même padding et arrondi que primaire

### 4.2 Cards / Cartes

#### Session Card
```html
<div class="bg-gray-800 rounded-xl shadow-lg p-6 
            hover:shadow-2xl hover:scale-105
            transition-all duration-300 border border-gray-700">
  <div class="flex justify-between items-start mb-4">
    <h3 class="text-xl font-semibold text-white">Dungeons & Dragons 5e</h3>
    <span class="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
      3/6 places
    </span>
  </div>
  <p class="text-gray-400 text-sm mb-4">
    Aventure épique pour débutants et intermédiaires...
  </p>
  <div class="flex items-center justify-between">
    <span class="text-indigo-400 text-sm">📍 Brussels</span>
    <button class="text-indigo-400 hover:text-indigo-300">Voir détails →</button>
  </div>
</div>
```

**Caractéristiques** :
- Fond gris foncé (#1f2937)
- Bordure subtile gris (#374151)
- Ombre portée progressive
- Effet de zoom léger au hover (scale 1.05)
- Border-radius 12px
- Padding 24px

### 4.3 Badges / Tags

#### Badge Disponibilité
```html
<!-- Places disponibles -->
<span class="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
  3/6 places
</span>

<!-- Complet -->
<span class="bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full">
  Complet
</span>

<!-- En attente -->
<span class="bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">
  En attente
</span>
```

#### Badge Niveau
```html
<span class="bg-indigo-500/20 text-indigo-300 text-xs font-medium px-3 py-1 rounded-full border border-indigo-500/50">
  Débutant
</span>
```

### 4.4 Inputs / Formulaires

```html
<input type="text" 
       class="bg-gray-800 border-2 border-gray-700
              focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50
              text-white placeholder-gray-500
              px-4 py-3 rounded-lg w-full
              transition-all duration-300"
       placeholder="Rechercher un jeu...">
```

**Caractéristiques** :
- Fond gris foncé
- Bordure gris clair par défaut
- Bordure indigo + ring au focus
- Placeholder gris moyen
- Border-radius 8px
- Padding 12px vertical, 16px horizontal

### 4.5 Modals / Popups

```html
<div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
  <div class="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-700">
    <h2 class="text-2xl font-bold text-white mb-4">Connexion</h2>
    <!-- Contenu modal -->
  </div>
</div>
```

**Caractéristiques** :
- Overlay noir semi-transparent avec backdrop-blur
- Carte centrale avec fond gris foncé
- Bordure subtile
- Ombre portée importante
- Border-radius 16px
- Padding 32px

---

## 5. 🖼️ ICONOGRAPHIE

### Système d'icônes

**Source** : [Lucide Icons](https://lucide.dev/) (fork de Feather Icons)

**Raisons du choix** :
- Open source et léger
- Style minimaliste cohérent avec Inter
- 1000+ icônes disponibles
- Excellente intégration web
- Personnalisables (stroke-width, color)

### Icônes principales utilisées

| Contexte | Icône | Usage |
|----------|-------|-------|
| Navigation | `menu`, `x`, `home`, `users`, `map-pin` | Menus, navigation |
| Actions | `plus`, `edit`, `trash`, `check`, `x-circle` | CRUD operations |
| Social | `mail`, `message-circle`, `share-2` | Communications |
| Statut | `clock`, `calendar`, `alert-circle`, `check-circle` | États, notifications |
| Gaming | `dice-6`, `gamepad-2`, `trophy` | Contexte JdR |
| Map | `map-pin`, `navigation`, `compass` | Géolocalisation |

### Style des icônes

```html
<!-- Taille standard 24px -->
<svg class="w-6 h-6 text-indigo-400 stroke-2">
  <use href="#icon-dice-6"/>
</svg>
```

**Paramètres** :
- Taille par défaut : 24x24px
- Stroke-width : 2px
- Couleur : selon contexte (indigo-400 pour primaire)

---

## 6. 📐 SPACING & LAYOUT

### Grille de Spacing (Tailwind CSS)

| Classe | Valeur | Usage |
|--------|--------|-------|
| `space-1` | 4px | Espacement minimal |
| `space-2` | 8px | Tags, badges internes |
| `space-3` | 12px | Padding inputs, petits boutons |
| `space-4` | 16px | Espacement standard éléments |
| `space-6` | 24px | Padding cards, sections |
| `space-8` | 32px | Padding modals, grandes sections |
| `space-12` | 48px | Marges entre sections principales |

### Responsive Breakpoints

```css
/* Mobile first approach */
sm: 640px   /* Tablette portrait */
md: 768px   /* Tablette landscape */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

---

## 7. 🎬 ANIMATIONS & TRANSITIONS

### Transitions standards

```css
/* Transition par défaut */
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);

/* Hover states */
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

/* Card hover */
.card:hover {
  transform: scale(1.05);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}
```

### Animations de chargement

```css
/* Skeleton loading */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## 8. 📱 RESPONSIVE DESIGN

### Principes

1. **Mobile First** : Design d'abord pour mobile, puis adaptation desktop
2. **Touch-friendly** : Zones cliquables minimum 44x44px
3. **Lisibilité** : Taille texte minimum 16px sur mobile
4. **Navigation** : Menu hamburger mobile, navbar desktop

### Adaptations par device

| Device | Layout | Navigation | Typography |
|--------|--------|------------|------------|
| **Mobile (<640px)** | Single column, cards empilées | Bottom nav + burger menu | 14-16px base |
| **Tablet (640-1024px)** | 2 colonnes grille | Top navbar | 16px base |
| **Desktop (>1024px)** | 3-4 colonnes grille | Side nav + top bar | 16-18px base |

---

## 9. ✅ CHECKLIST CONFORMITÉ

Utilise cette checklist pour vérifier la cohérence de tes designs :

- [ ] Utilise uniquement la palette de couleurs définie
- [ ] Police Inter chargée depuis Google Fonts
- [ ] Respecte la hiérarchie typographique (H1 > H2 > H3 > Body)
- [ ] Boutons avec états hover/active/disabled
- [ ] Cards avec ombres et effets hover
- [ ] Icônes Lucide avec stroke-width cohérent
- [ ] Spacing basé sur la grille Tailwind (multiples de 4px)
- [ ] Transitions 300ms sur interactions
- [ ] Border-radius cohérent (8px buttons, 12px cards, 16px modals)
- [ ] Contraste texte/fond > 4.5:1 (WCAG AA)
- [ ] Touch targets > 44x44px sur mobile
- [ ] Test responsive sur 3 breakpoints minimum

---

## 10. 📦 EXPORTS & ASSETS

### Fichiers à créer pour le rapport

1. **Logo Bar à Dés** (PNG, 512x512px, fond transparent)
2. **Palette de couleurs** (Screenshot ou mockup Canva)
3. **Exemples typographie** (Titres H1-H3 + body)
4. **Composants UI** (Screenshots : button, card, input, modal)
5. **Screenshots application** (Home, Sessions, Map, Groupes)

### Format d'export recommandé

- **PDF** : Pour intégration rapport (300 DPI)
- **PNG** : Pour assets web (72 DPI, optimisé)
- **SVG** : Pour logo et icônes (vectoriel)

---

**Document créé le** : 17 octobre 2025  
**Version** : 1.0  
**Prochaine mise à jour** : Post-déploiement (ajout screenshots production)
