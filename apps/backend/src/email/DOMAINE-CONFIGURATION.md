# Configuration du domaine barades.com avec Resend

## 🎯 Objectif

Utiliser `noreply@barades.com` au lieu de `onboarding@resend.dev` pour envoyer les emails.

## 📋 Prérequis

- ✅ Compte Resend créé et fonctionnel
- ✅ Domaine `barades.com` enregistré
- ✅ Accès au panneau DNS de votre hébergeur

## 🚀 Étapes de configuration

### 1. Ajouter le domaine dans Resend

1. **Connexion** : https://resend.com/domains
2. **Ajouter un domaine** :
   - Cliquer sur "Add Domain"
   - Entrer : `barades.com`
   - Cliquer sur "Add"

### 2. Récupérer les enregistrements DNS

Resend va générer **3 types d'enregistrements DNS** :

#### A. Enregistrement de vérification (TXT)
```
Type: TXT
Name: @ (ou barades.com)
Value: resend-domain-verification=xxxxxxxxx
TTL: 3600 (ou Auto)
```
**Rôle** : Prouve que vous êtes propriétaire du domaine

#### B. Enregistrement MX
```
Type: MX
Name: @ (ou barades.com)
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10
TTL: 3600 (ou Auto)
```
**Rôle** : Gère les rebonds (bounces) et les réponses

#### C. Enregistrement DMARC (TXT)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@barades.com
TTL: 3600 (ou Auto)
```
**Rôle** : Politique d'authentification des emails

#### D. (Optionnel) SPF - Si vous n'en avez pas déjà un
```
Type: TXT
Name: @ (ou barades.com)
Value: v=spf1 include:amazonses.com ~all
TTL: 3600
```
**Rôle** : Autorise Resend à envoyer des emails pour votre domaine

#### E. (Optionnel) DKIM - Resend peut vous le fournir
```
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
TTL: 3600
```
**Rôle** : Signature cryptographique des emails

### 3. Ajouter les DNS chez votre hébergeur

#### Option A : Cloudflare

1. Connexion : https://dash.cloudflare.com
2. Sélectionner `barades.com`
3. Aller dans **DNS** > **Records**
4. Cliquer sur **Add record**
5. Ajouter chaque enregistrement un par un
6. **Important** : Désactiver le proxy (nuage gris) pour les MX

#### Option B : OVH

1. Connexion : https://www.ovh.com/manager/
2. Domaines > `barades.com`
3. Zone DNS > Ajouter une entrée
4. Sélectionner le type (TXT, MX, CNAME)
5. Remplir les champs
6. Valider

#### Option C : Hostinger

1. Connexion : https://hpanel.hostinger.com
2. Domaines > `barades.com`
3. DNS / Zone DNS
4. Gérer > Ajouter un enregistrement
5. Sélectionner le type et remplir
6. Sauvegarder

#### Option D : Autre hébergeur

Cherchez dans votre panneau :
- "DNS Management"
- "Zone DNS"
- "DNS Records"
- "Gestion DNS"

### 4. Vérifier la propagation DNS

**Outils en ligne** (attendez 5-15 minutes après ajout) :

```bash
# Via ligne de commande
dig TXT barades.com
dig MX barades.com
dig TXT _dmarc.barades.com

# Ou utilisez ces sites :
https://dnschecker.org
https://mxtoolbox.com/SuperTool.aspx
```

Vous devriez voir vos nouveaux enregistrements.

### 5. Vérifier dans Resend

1. Retour sur https://resend.com/domains
2. Cliquer sur **"Verify"** à côté de `barades.com`
3. Resend va vérifier les DNS
4. État devrait passer à **"Verified"** ✅

**Si erreur** :
- Attendre 15-30 minutes (propagation DNS)
- Vérifier que les valeurs sont exactement identiques
- Pas d'espaces avant/après les valeurs
- Pour les TXT, certains hébergeurs ajoutent des guillemets automatiquement

### 6. Mettre à jour le code backend

Une fois le domaine vérifié, je mettrai à jour `email.service.ts` :

```typescript
// Avant (temporaire)
from: 'onboarding@resend.dev'

// Après (production)
from: 'Barades <noreply@barades.com>'
```

**Adresses email possibles** :
- `noreply@barades.com` - Pour les notifications automatiques
- `contact@barades.com` - Pour le support
- `reservations@barades.com` - Pour les confirmations de réservation
- `hello@barades.com` - Pour l'onboarding

## 📊 Checklist de vérification

- [ ] Domaine ajouté dans Resend
- [ ] Enregistrement TXT de vérification ajouté
- [ ] Enregistrement MX ajouté
- [ ] Enregistrement DMARC ajouté
- [ ] (Optionnel) SPF configuré
- [ ] (Optionnel) DKIM configuré
- [ ] DNS propagés (vérifiés via dnschecker.org)
- [ ] Domaine vérifié dans Resend (statut "Verified")
- [ ] Code backend mis à jour
- [ ] Backend redémarré
- [ ] Email de test envoyé et reçu avec `@barades.com`

## ⚠️ Problèmes courants

### Problème 1 : "Domain not verified" après 24h

**Causes** :
- Valeurs DNS incorrectes (espaces, guillemets en trop)
- Enregistrement au mauvais endroit (@ vs domaine.com)
- Proxy Cloudflare activé sur MX

**Solution** :
- Vérifier caractère par caractère les valeurs
- Utiliser `dig` pour voir ce qui est réellement configuré
- Désactiver le proxy Cloudflare (nuage gris)

### Problème 2 : Emails en spam

**Causes** :
- DMARC/SPF/DKIM mal configurés
- Nouveau domaine sans historique
- Contenu suspect

**Solution** :
- Configurer les 3 enregistrements (SPF, DKIM, DMARC)
- Envoyer quelques emails de test
- Demander aux destinataires de marquer "Non spam"
- Vérifier score spam : https://www.mail-tester.com

### Problème 3 : MX en conflit

**Cause** :
- Si vous avez déjà une boîte email (Gmail for Business, etc.)

**Solution** :
- Garder vos MX existants pour la réception
- Ajouter les MX Resend avec priorité plus basse (ex: 20)
- Ou utiliser un sous-domaine : `mail.barades.com`

## 🎓 Alternative : Sous-domaine

Si vous voulez garder `barades.com` pour autre chose :

1. Utiliser `mail.barades.com` ou `notifications.barades.com`
2. Ajouter ce sous-domaine dans Resend
3. Envoyer depuis `noreply@mail.barades.com`

**Avantages** :
- Pas de conflit avec les MX existants
- Isolation des emails transactionnels
- Meilleure délivrabilité (sous-domaine dédié)

## 📚 Ressources

- [Documentation Resend - Domains](https://resend.com/docs/dashboard/domains/introduction)
- [DNS Checker](https://dnschecker.org)
- [MX Toolbox](https://mxtoolbox.com)
- [Mail Tester](https://www.mail-tester.com) - Tester le score spam

## 🚀 Pour aller plus loin

Une fois le domaine configuré, vous pourrez :

1. **Créer des alias** : `support@`, `hello@`, `team@`
2. **Utiliser des templates Resend** pour des emails plus riches
3. **Migrer vers Mailcoach** (solution belge) qui utilisera Resend en backend
4. **Tracker les ouvertures** et clics (analytics)
5. **Gérer les bounces** et désabonnements

## 💡 Note importante

**Tier gratuit Resend** :
- ✅ Domaine personnalisé inclus
- ✅ 3,000 emails/mois
- ✅ 100 emails/jour
- ✅ Envoyer à n'importe quelle adresse (une fois domaine vérifié)

Pas besoin de passer en payant pour utiliser votre domaine !
