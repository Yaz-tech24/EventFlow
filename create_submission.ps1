# EventFlow — Create Submission ZIP
# Excludes: .env, database (.db), node_modules, uploads, logs, sensitive files

$dest = "$PSScriptRoot\eventflow_submission_$(Get-Date -Format 'yyyyMMdd_HHmm').zip"

# Files and folders to exclude
$excludes = @(
    '.env',
    'backend\.env',
    'backend\config\eventflow.db',
    'backend\config\eventflow.db-shm',
    'backend\config\eventflow.db-wal',
    'node_modules',
    'backend\node_modules',
    'backend\uploads',
    '.git',
    '*.log',
    'Thumbs.db',
    '.DS_Store',
    'eventflow_submission_*.zip'
)

Write-Host "Creating submission ZIP..."
Write-Host "Output: $dest"

# Build exclude filter
$excludePatterns = $excludes | ForEach-Object { [System.Text.RegularExpressions.Regex]::Escape($_) }
$excludeRegex = '(' + ($excludePatterns -join '|') + ')'

$root = $PSScriptRoot
$files = Get-ChildItem -Path $root -Recurse -File | Where-Object {
    $relativePath = $_.FullName.Substring($root.Length + 1)
    $skip = $false
    foreach ($ex in $excludes) {
        if ($relativePath -like "*$ex*") { $skip = $true; break }
    }
    -not $skip
}

# Create ZIP
Add-Type -AssemblyName System.IO.Compression.FileSystem
if (Test-Path $dest) { Remove-Item $dest }
$zip = [System.IO.Compression.ZipFile]::Open($dest, 'Create')

foreach ($file in $files) {
    $entryName = $file.FullName.Substring($root.Length + 1)
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
}
$zip.Dispose()

Write-Host "Done! $($files.Count) files included."
Write-Host ""
Write-Host "IMPORTANT: The following sensitive files were EXCLUDED:"
Write-Host "  - .env (JWT secret, database config)"
Write-Host "  - eventflow.db (database with user data)"
Write-Host "  - node_modules (install with: npm install)"
Write-Host "  - uploads (generated at runtime)"
Write-Host ""
Write-Host "To run after extracting:"
Write-Host "  cd backend && npm install && node server.js"
