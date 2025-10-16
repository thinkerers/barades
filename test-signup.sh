#!/bin/bash

echo "🧪 Test d'inscription Barades"
echo "=============================="
echo ""

# Générer un timestamp unique
TIMESTAMP=$(date +%s)
USERNAME="test_user_${TIMESTAMP}"
EMAIL="test${TIMESTAMP}@example.com"
PASSWORD="TestPassword123!"

echo "📝 Données de test:"
echo "  Username: ${USERNAME}"
echo "  Email: ${EMAIL}"
echo "  Password: ${PASSWORD}"
echo ""

echo "🚀 Envoi requête POST /auth/signup..."
echo ""

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"${USERNAME}\",
    \"email\": \"${EMAIL}\",
    \"password\": \"${PASSWORD}\",
    \"confirmPassword\": \"${PASSWORD}\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

# Extraire le code HTTP
HTTP_CODE=$(echo "$RESPONSE" | grep -oP 'HTTP_CODE:\K\d+')
BODY=$(echo "$RESPONSE" | sed 's/HTTP_CODE:.*//')

echo "📊 Réponse:"
echo "  Status: ${HTTP_CODE}"
echo "  Body: ${BODY}"
echo ""

if [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "200" ]; then
    echo "✅ SUCCÈS - Inscription réussie!"
    echo ""
    echo "🔑 Token JWT reçu (extrait):"
    echo "$BODY" | grep -oP '"accessToken":"[^"]*"' | head -c 100
    echo "..."
else
    echo "❌ ÉCHEC - Inscription échouée"
    echo ""
    echo "🔍 Détails de l'erreur:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
fi

echo ""
echo "=============================="
