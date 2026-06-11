# ============================================================
#  Script de connexion et d'initialisation de la base de données
#  Usage : depuis le dossier "Maison Eburne" → .\scripts\setup-db.ps1
# ============================================================

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Maison Éburne — Setup base de données" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier que .env existe
if (-not (Test-Path ".env")) {
    Write-Host "[ERREUR] Fichier .env introuvable." -ForegroundColor Red
    Write-Host "  → Copie .env.example vers .env et remplis les valeurs." -ForegroundColor Yellow
    exit 1
}

# 2. Lire DATABASE_URL depuis .env
$dbUrl = (Get-Content ".env" | Where-Object { $_ -match "^DATABASE_URL=" }) -replace '^DATABASE_URL="?([^"]*)"?$', '$1'

if (-not $dbUrl -or $dbUrl -match "UTILISATEUR|MOT_DE_PASSE") {
    Write-Host "[ERREUR] DATABASE_URL n'est pas configurée dans .env" -ForegroundColor Red
    Write-Host "  → Remplace la valeur de DATABASE_URL par ta vraie chaîne de connexion." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Exemples :" -ForegroundColor Cyan
    Write-Host "    Local    : postgresql://postgres:monpass@localhost:5432/maison_eburne"
    Write-Host "    Supabase : postgresql://postgres:[pass]@db.[ref].supabase.co:5432/postgres"
    Write-Host "    Railway  : postgresql://postgres:[pass]@[host]:5432/railway"
    exit 1
}

Write-Host "[OK] DATABASE_URL détectée." -ForegroundColor Green

# 3. Tester la connexion via prisma db execute
Write-Host ""
Write-Host "Test de connexion à la base de données..." -ForegroundColor Yellow
$testResult = npx prisma db execute --stdin --schema=./prisma/schema.prisma 2>&1 <<< "SELECT 1;"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Impossible de se connecter à la base de données." -ForegroundColor Red
    Write-Host "  Vérifie :" -ForegroundColor Yellow
    Write-Host "    1. Que le serveur PostgreSQL est démarré"
    Write-Host "    2. Que l'utilisateur et le mot de passe sont corrects"
    Write-Host "    3. Que la base '$($dbUrl -replace '.*/', '')' existe"
    Write-Host ""
    Write-Host "  Pour créer la base localement :"
    Write-Host "    psql -U postgres -c `"CREATE DATABASE maison_eburne;`""
    exit 1
}
Write-Host "[OK] Connexion réussie." -ForegroundColor Green

# 4. Générer le client Prisma
Write-Host ""
Write-Host "Génération du client Prisma..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) { Write-Host "[ERREUR] prisma generate a échoué." -ForegroundColor Red; exit 1 }
Write-Host "[OK] Client Prisma généré." -ForegroundColor Green

# 5. Appliquer les migrations
Write-Host ""
Write-Host "Application des migrations..." -ForegroundColor Yellow
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "[INFO] migrate deploy a échoué, tentative avec migrate dev..." -ForegroundColor Yellow
    npx prisma migrate dev --name init
}
Write-Host "[OK] Tables créées." -ForegroundColor Green

# 6. Seed (données initiales)
Write-Host ""
$seed = Read-Host "Insérer les données initiales (4 produits + compte admin) ? [O/n]"
if ($seed -ne 'n' -and $seed -ne 'N') {
    Write-Host "Insertion des données..." -ForegroundColor Yellow
    npx tsx prisma/seed.ts
    if ($LASTEXITCODE -ne 0) { Write-Host "[ERREUR] Seed a échoué." -ForegroundColor Red; exit 1 }
    Write-Host "[OK] Données insérées." -ForegroundColor Green
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  Base de données prête !" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Lance le serveur de développement :" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Ouvre Prisma Studio (visualiser les données) :" -ForegroundColor Cyan
Write-Host "  npm run db:studio" -ForegroundColor White
Write-Host ""
