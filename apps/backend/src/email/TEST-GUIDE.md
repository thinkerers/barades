# 🧪 Guide de test des emails - Barades

## ✅ Étape 1 : Obtenir une clé API Resend

1. **Créer un compte** sur https://resend.com/signup
   - Pas de carte bancaire requise
   - Tier gratuit : 3,000 emails/mois

2. **Vérifier votre email** (lien envoyé par Resend)

3. **Générer une clé API**
   - Aller sur https://resend.com/api-keys
   - Cliquer sur "Create API Key"
   - Nom : `Barades TFE` (ou autre)
   - Permissions : "Full Access" (pour les tests)
   - Copier la clé qui commence par `re_...`

4. **Ajouter la clé dans votre .env**
   ```bash
   # Ouvrir le fichier .env
   cd /home/theop/barades/apps/backend
   nano .env  # ou code .env
   
   # Ajouter cette ligne (remplacer par votre vraie clé)
   RESEND_API_KEY="re_votre_cle_api_ici"
   ```

## 🚀 Étape 2 : Démarrer le backend

```bash
# Dans un terminal
cd /home/theop/barades
npx nx serve backend
```

Le backend démarrera sur `http://localhost:3000`

## 📧 Étape 3 : Envoyer des emails de test

### Option A : Via cURL (terminal)

```bash
# Test 1 : Email de confirmation de réservation
curl -X POST http://localhost:3000/email/test/confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "votre-email@example.com",
    "recipientName": "Votre Nom"
  }'

# Test 2 : Notification à l'hôte
curl -X POST http://localhost:3000/email/test/host-notification \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "votre-email@example.com",
    "recipientName": "Votre Nom"
  }'

# Test 3 : Rappel de session
curl -X POST http://localhost:3000/email/test/reminder \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "votre-email@example.com",
    "recipientName": "Votre Nom"
  }'

# Test 4 : Envoyer les 3 emails d'un coup
curl -X POST http://localhost:3000/email/test/all \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "votre-email@example.com",
    "recipientName": "Votre Nom"
  }'
```

### Option B : Via un fichier HTML de test

Créer un fichier `test-email.html` :

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Emails Barades</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
    input, button { padding: 10px; margin: 5px 0; width: 100%; box-sizing: border-box; }
    button { background: #667eea; color: white; border: none; cursor: pointer; border-radius: 5px; }
    button:hover { background: #764ba2; }
    .result { margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>🎲 Test Emails Barades</h1>
  
  <form id="testForm">
    <label>Votre email :</label>
    <input type="email" id="email" required placeholder="votre@email.com">
    
    <label>Votre nom :</label>
    <input type="text" id="name" placeholder="Votre Nom">
    
    <button type="button" onclick="sendEmail('confirmation')">
      ✉️ Tester Confirmation
    </button>
    
    <button type="button" onclick="sendEmail('host-notification')">
      📬 Tester Notification Hôte
    </button>
    
    <button type="button" onclick="sendEmail('reminder')">
      ⏰ Tester Rappel
    </button>
    
    <button type="button" onclick="sendEmail('all')">
      🚀 Envoyer les 3 emails
    </button>
  </form>
  
  <div id="result" class="result" style="display: none;"></div>

  <script>
    async function sendEmail(type) {
      const email = document.getElementById('email').value;
      const name = document.getElementById('name').value;
      const result = document.getElementById('result');
      
      if (!email) {
        alert('Veuillez entrer votre email');
        return;
      }
      
      result.style.display = 'block';
      result.innerHTML = '⏳ Envoi en cours...';
      
      try {
        const response = await fetch(`http://localhost:3000/email/test/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientEmail: email, recipientName: name })
        });
        
        const data = await response.json();
        
        if (data.success) {
          result.innerHTML = `✅ ${data.message}<br><br><pre>${JSON.stringify(data, null, 2)}</pre>`;
        } else {
          result.innerHTML = `❌ Erreur : ${data.message}`;
        }
      } catch (error) {
        result.innerHTML = `❌ Erreur réseau : ${error.message}<br><br>Vérifiez que le backend est démarré sur http://localhost:3000`;
      }
    }
  </script>
</body>
</html>
```

Ouvrir le fichier dans votre navigateur et tester !

### Option C : Via Postman/Insomnia

1. **URL** : `http://localhost:3000/email/test/confirmation`
2. **Méthode** : POST
3. **Headers** : `Content-Type: application/json`
4. **Body (JSON)** :
   ```json
   {
     "recipientEmail": "votre@email.com",
     "recipientName": "Votre Nom"
   }
   ```

## 🔍 Étape 4 : Vérifier la réception

1. **Vérifier votre boîte email** (inbox)
2. **Vérifier les spams** si rien reçu
3. **Vérifier les logs du backend** dans le terminal

Vous devriez voir dans les logs :
```
[EmailService] Confirmation email sent to votre@email.com
```

## 📊 Tableau de bord Resend

Consultez https://resend.com/emails pour voir :
- ✅ Les emails envoyés
- 📊 Le taux de délivrabilité
- 🔍 Les détails de chaque envoi
- 📈 Votre quota utilisé

## ⚠️ Troubleshooting

### Problème : "RESEND_API_KEY not configured"

**Solution** : Vérifier que :
1. Le fichier `.env` existe dans `apps/backend/`
2. La clé est bien au format `RESEND_API_KEY="re_..."`
3. Le backend a été redémarré après l'ajout de la clé

### Problème : Email non reçu

**Vérifier** :
1. Les spams
2. Le dashboard Resend (email envoyé mais bounced ?)
3. L'adresse email utilisée (typo ?)

### Problème : Erreur 401 Unauthorized

**Cause** : Clé API invalide ou expirée

**Solution** : Régénérer une nouvelle clé sur Resend

### Problème : Backend ne démarre pas

**Vérifier** :
1. Que le port 3000 n'est pas déjà utilisé
2. Les logs d'erreur
3. Que `npm install` a bien installé `resend`

## 📸 Captures d'écran pour le TFE

N'oubliez pas de capturer :
1. ✅ Dashboard Resend montrant les emails envoyés
2. ✅ Un email reçu dans votre boîte
3. ✅ Les logs du backend
4. ✅ La requête POST réussie

## 🎯 Prochaines étapes

Une fois les tests validés :
1. [ ] Supprimer le EmailController de test en production
2. [ ] Intégrer l'envoi dans le flow de réservation
3. [ ] Implémenter le système de rappels automatiques (CRON)
4. [ ] Ajouter des templates additionnels (bienvenue, annulation, etc.)

## 🔒 Sécurité

⚠️ **IMPORTANT** :
- Ne jamais commiter votre `.env` avec la vraie clé API
- Ajouter `.env` dans `.gitignore`
- En production, utiliser des variables d'environnement sécurisées
