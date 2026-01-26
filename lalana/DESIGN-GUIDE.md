# 🎨 Symboles et Statuts - Application Lalana

## 📍 Marqueurs sur la Carte

Les signalements sont maintenant affichés avec des **symboles visuels** au lieu de simples couleurs.

### Représentation Graphique

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ⏱    En Attente    →  Horloge orange                    │
│   ⏱                     Signalement reçu, en attente       │
│                         de validation                       │
│                                                             │
│   ⚙    En Cours      →  Engrenage bleu                    │
│   ⚙                     Travaux en cours de réalisation   │
│                                                             │
│   ✓    Résolu        →  Check vert                        │
│   ✓                     Problème corrigé et terminé       │
│                                                             │
│   ✕    Rejeté        →  Croix rouge                       │
│   ✕                     Signalement refusé ou invalide    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Palette de Couleurs

| Statut | Couleur HEX | RGB | Description |
|--------|-------------|-----|-------------|
| **En Attente** | `#f59e0b` | rgb(245, 158, 11) | Orange ambré |
| **En Cours** | `#3b82f6` | rgb(59, 130, 246) | Bleu vif |
| **Résolu** | `#10b981` | rgb(16, 185, 129) | Vert émeraude |
| **Rejeté** | `#ef4444` | rgb(239, 68, 68) | Rouge corail |

## 📊 Design des Marqueurs

### Structure

```
┌────────────────────┐
│                    │
│   ┌──────────┐    │
│   │   ⏱      │    │  ← Symbole (20px, gras)
│   │          │    │
│   └──────────┘    │
│                    │
│   ↑                │
│   Fond blanc       │
│   Bordure colorée  │
│   Ombre portée     │
│                    │
└────────────────────┘

Dimensions: 40x40px
Border: 3px solid [couleur statut]
Border-radius: 50% (cercle)
Shadow: 0 3px 8px rgba(0,0,0,0.25)
```

## 🗺️ Popup Amélioré

Lors du clic sur un marqueur, le popup affiche :

```
┌─────────────────────────────────────┐
│ 📍 Signalement                      │
│ ────────────────────────────────────│
│                                     │
│ Description:                        │
│ Nid-de-poule important...          │
│                                     │
│ Localisation:                       │
│ Lat: -18.879200                    │
│ Long: 47.507900                    │
│ Avenue de l'Indépendance           │
│                                     │
│ Statut: ┌─────────────┐           │
│         │ ⏱ En attente │           │
│         └─────────────┘           │
│         ↑ Badge coloré             │
│                                     │
│ 📅 15/01/2026, 08:30               │
└─────────────────────────────────────┘
```

### Caractéristiques du Badge Statut

- **Fond** : Couleur du statut à 15% d'opacité (ex: `#f59e0b15`)
- **Bordure** : 1.5px solid avec couleur du statut
- **Texte** : Couleur du statut
- **Icône** : Symbole du statut (16px)
- **Padding** : 4px 12px
- **Border-radius** : 6px

## 🎯 Expérience Utilisateur

### Avantages des Symboles

✅ **Accessibilité** : Les symboles sont compréhensibles même sans couleur
✅ **Clarté** : Identification rapide du statut en un coup d'œil
✅ **Design moderne** : Aspect professionnel et épuré
✅ **Cohérence** : Symboles identiques sur la carte et dans les popups

### Tailles et Lisibilité

| Élément | Taille | Poids |
|---------|--------|-------|
| Symbole marqueur | 20px | Bold (700) |
| Symbole popup | 16px | Bold (600) |
| Texte description | 14px | Regular (400) |
| Texte localisation | 12px | Regular (400) |

## 📱 Responsive Design

Les marqueurs s'adaptent à tous les écrans :

- **Mobile** : Marqueurs 40x40px (touch-friendly)
- **Tablette** : Même taille, meilleure visibilité
- **Desktop** : Hover effects pour interaction

## 🔄 Animation et Feedback

```css
/* Au survol */
.custom-marker:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Au clic */
.custom-marker:active {
  transform: scale(0.95);
}
```

## 📋 Checklist Design

- [x] Symboles Unicode pour compatibilité
- [x] Couleurs contrastées (WCAG AA)
- [x] Taille des marqueurs (min 40x40px)
- [x] Ombre portée pour profondeur
- [x] Fond blanc pour lisibilité
- [x] Bordure colorée distinctive
- [x] Popup cohérent avec les marqueurs
- [x] Animation subtile au hover

## 🛠️ Personnalisation Future

Pour ajouter un nouveau statut :

```typescript
case 'nouveau_statut':
  iconConfig = {
    color: '#hexcolor',      // Couleur principale
    symbol: '◆',             // Symbole Unicode
    bgColor: '#fff'          // Fond (généralement blanc)
  };
  break;
```

### Symboles Recommandés

- ⏱ ⏰ ⏳ (Temps)
- ⚙ ⚡ 🔧 (Travaux)
- ✓ ✔ ☑ (Validation)
- ✕ ✗ ⨯ (Refus)
- ⚠ ⛔ 🚫 (Avertissement)
- 📍 📌 🗺 (Localisation)
- 🔴 🟡 🟢 (Indicateurs)

## 📖 Références

- [Unicode Symbols](https://unicode-table.com/)
- [Tailwind Colors](https://tailwindcss.com/docs/customizing-colors)
- [Leaflet DivIcon](https://leafletjs.com/reference.html#divicon)
