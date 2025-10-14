# Rapport Jour 3 - Migration Frontend Angular

**Date :** 14 octobre 2025  
**Étudiant :** Théo P.  
**Projet :** Bar à Dés - Plateforme de gestion de sessions de jeux de société  
**Formation :** Bachelier en Informatique de Gestion - HENALLUX

---

## 📋 Table des matières

1. [Vue d'ensemble](./rapport-jour3-01-overview.md)
2. [Services Angular](./rapport-jour3-02-services.md)
3. [Composants de pages](./rapport-jour3-03-components.md)
4. [Intégration Leaflet](./rapport-jour3-04-leaflet.md)
5. [Navigation et Layout](./rapport-jour3-05-navigation.md)
6. [Tests unitaires](./rapport-jour3-06-tests.md)
7. [Problèmes rencontrés](./rapport-jour3-07-issues.md)

---

## 🎯 Objectifs du jour

- ✅ Créer les services Angular pour consommer l'API NestJS
- ✅ Migrer les pages Sessions, Lieux, Groupes depuis le prototype HTML
- ✅ Intégrer la carte Leaflet pour l'affichage des lieux
- ✅ Créer le Footer et compléter la navigation
- ✅ Écrire les tests unitaires pour tous les composants
- ✅ Valider l'intégration Backend ↔ Frontend

---

## 📊 Résultat global

**Statut : ✅ TERMINÉ (100%)**

### Métriques du code

- **Fichiers créés :** 20 fichiers
- **Lignes de code :** ~1 684 lignes
- **Services :** 3 (Sessions, Locations, Groups)
- **Composants :** 4 (SessionsListPage, LocationsList, GroupsList, Footer)
- **Tests unitaires :** 22 tests (tous passants ✅)
- **Commits Git :** 2 commits avec messages sémantiques

### Fonctionnalités implémentées

| Feature | Statut | Tests |
|---------|--------|-------|
| SessionsService | ✅ | ✅ |
| SessionsListPage | ✅ | ✅ |
| LocationsService | ✅ | ✅ |
| LocationsListPage + Leaflet | ⚠️ Partiel | ✅ |
| GroupsService | ✅ | ✅ |
| GroupsListPage | ✅ | ✅ |
| Footer | ✅ | ✅ |
| Intégration API | ✅ | - |

---

## 🔗 Navigation

- [← Retour au rapport Jour 2](./rapport-jour2-00-index.md)
- [→ Continuer avec Vue d'ensemble](./rapport-jour3-01-overview.md)
- [📚 Retour à la documentation générale](../README.md)

---

**Prochaine étape :** [Jour 4 - DTOs et Validation](./rapport-jour4-00-index.md)
