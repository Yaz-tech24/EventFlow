<#
.SYNOPSIS
Inicializa o EventFlow: instala dependências, prepara o ambiente, popula a base de dados e arranca o backend.
#>

$root = $PSScriptRoot
$backendDir = Join-Path $root 'backend'
$envPath = Join-Path $backendDir '.env'
$dbPath = Join-Path $backendDir 'config\eventflow.db'

function Write-Section($text) {
    Write-Host "`n=== $text ===" -ForegroundColor Cyan
}

function Confirm($message, $default = $true) {
    $defaultText = if ($default) { 'Y/n' } else { 'y/N' }
    $answer = Read-Host "${message} [$defaultText]"
    if ([string]::IsNullOrWhiteSpace($answer)) { return $default }
    switch ($answer.ToLower()) {
        'y' { return $true }
        'yes' { return $true }
        'n' { return $false }
        'no' { return $false }
        default { return $default }
    }
}

function Run-Command($workingDir, $command, [string[]]$arguments) {
    Write-Host "`n-> Executando: $command $($arguments -join ' ')" -ForegroundColor Yellow
    Push-Location $workingDir
    try {
        & $command @arguments
        if ($LASTEXITCODE -ne 0) {
            throw "O comando falhou com o código $LASTEXITCODE"
        }
    } finally {
        Pop-Location
    }
}

function Ensure-CommandExists($command) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        Write-Error "Erro: '$command' não está disponível. Instale o Node.js e certifique-se de que '$command' está no PATH."
        exit 1
    }
}

function New-RandomSecret($length = 32) {
    $chars = @()
    $chars += 48..57   # 0-9
    $chars += 65..90   # A-Z
    $chars += 97..122  # a-z
    -join ((1..$length) | ForEach-Object { [char]($chars | Get-Random) })
}

function Ensure-EnvFile() {
    $defaultEnv = @(
        "JWT_SECRET=$(New-RandomSecret 48)",
        'PORT=3000',
        'NODE_ENV=development',
        'ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5500,http://127.0.0.1:5500'
    )

    if (-not (Test-Path $envPath)) {
        Write-Section 'Criando ficheiro .env padrão para o backend'
        Set-Content -Path $envPath -Value $defaultEnv -Encoding UTF8
        Write-Host "Ficheiro criado: $envPath" -ForegroundColor Green
        return
    }

    $lines = Get-Content $envPath
    $updated = $false

    if (-not ($lines -match '^JWT_SECRET=')) {
        Add-Content -Path $envPath -Value "JWT_SECRET=$(New-RandomSecret 48)"
        Write-Host 'JWT_SECRET adicionado a .env' -ForegroundColor Green
        $updated = $true
    }
    if (-not ($lines -match '^PORT=')) {
        Add-Content -Path $envPath -Value 'PORT=3000'
        Write-Host 'PORT adicionado a .env' -ForegroundColor Green
        $updated = $true
    }
    if (-not ($lines -match '^NODE_ENV=')) {
        Add-Content -Path $envPath -Value 'NODE_ENV=development'
        Write-Host 'NODE_ENV adicionado a .env' -ForegroundColor Green
        $updated = $true
    }
    if (-not ($lines -match '^ALLOWED_ORIGINS=')) {
        Add-Content -Path $envPath -Value 'ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5500,http://127.0.0.1:5500'
        Write-Host 'ALLOWED_ORIGINS adicionado a .env' -ForegroundColor Green
        $updated = $true
    }

    if (-not $updated) {
        Write-Host 'O ficheiro .env já contém as variáveis necessárias.' -ForegroundColor Green
    }
}

Write-Section 'EventFlow - Preparação do sistema'

Ensure-CommandExists 'node'
Ensure-CommandExists 'npm'

Write-Host "Node disponível: $(node --version)" -ForegroundColor Green
Write-Host "npm disponível: $(npm --version)" -ForegroundColor Green

if (Test-Path (Join-Path $root 'package.json')) {
    if (Confirm 'Instalar dependências do projeto root?' $true) {
        Run-Command $root 'npm' @('install')
    }
}

if (-not (Test-Path $backendDir)) {
    Write-Error 'Erro: pasta backend não encontrada.'
    exit 1
}

if (Confirm 'Instalar dependências do backend?' $true) {
    Run-Command $backendDir 'npm' @('install')
}

Ensure-EnvFile

$runSeed = $true
if (Test-Path $dbPath) {
    if (Confirm "A base de dados já existe em '$dbPath'. Deseja repor os dados de demonstração com seed?" $false) {
        $runSeed = $true
    } else {
        $runSeed = $false
    }
}

if ($runSeed) {
    Write-Section 'Populando a base de dados de demonstração'
    Run-Command $backendDir 'npm' @('run', 'seed')
}

Write-Section 'Pronto para arrancar o servidor'
Write-Host 'Se desejar iniciar o backend agora, responda Sim à próxima pergunta.'

if (Confirm 'Arrancar o servidor backend em modo normal?' $true) {
    Run-Command $backendDir 'npm' @('start')
} else {
    Write-Host "
Tudo preparado. Para arrancar manualmente, execute:
  cd backend
  npm start
" -ForegroundColor Cyan
}
