# Stanis Enterprise — Legacy Cleanup Script

$BackupDir = "c:\Users\rajat\Desktop\new_world_legacy_backup"
$ActiveRepoDir = $PSScriptRoot

Write-Host "--- Starting Legacy File Cleanup ---" -ForegroundColor Cyan

# 1. Create backup directories
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Host "Created archive directory at $BackupDir" -ForegroundColor Green
}

# 2. Archive files
$FilesToArchive = @(
    "src/App.tsx",
    "src/main.tsx",
    "src/index.css",
    "src/components/Layout.tsx"
)

foreach ($file in $FilesToArchive) {
    $srcPath = Join-Path $ActiveRepoDir $file
    if (Test-Path $srcPath) {
        $destPath = Join-Path $BackupDir (Split-Path $file -Leaf)
        Copy-Item -Path $srcPath -Destination $destPath -Force
        Write-Host "Archived $file to $destPath" -ForegroundColor Green
    } else {
        Write-Host "File $file not found, skipping archive" -ForegroundColor Yellow
    }
}

# Archive pages_backup folder
$pagesBackupSrc = Join-Path $ActiveRepoDir "src/pages_backup"
if (Test-Path $pagesBackupSrc) {
    $pagesBackupDest = Join-Path $BackupDir "pages_backup"
    Copy-Item -Path $pagesBackupSrc -Destination $pagesBackupDest -Recurse -Force
    Write-Host "Archived src/pages_backup to $pagesBackupDest" -ForegroundColor Green
} else {
    Write-Host "Folder src/pages_backup not found, skipping archive" -ForegroundColor Yellow
}

# 3. Delete files from active repo
Write-Host "`n--- Deleting files from active project tree ---" -ForegroundColor Cyan

foreach ($file in $FilesToArchive) {
    $srcPath = Join-Path $ActiveRepoDir $file
    if (Test-Path $srcPath) {
        Remove-Item -Path $srcPath -Force
        Write-Host "Removed $file from active repo" -ForegroundColor Red
    }
}

if (Test-Path $pagesBackupSrc) {
    Remove-Item -Path $pagesBackupSrc -Recurse -Force
    Write-Host "Removed src/pages_backup from active repo" -ForegroundColor Red
}

# 4. Verify TypeScript and Build
Write-Host "`n--- Verifying Project Compilation ---" -ForegroundColor Cyan

Write-Host "Running TypeScript verification (npx tsc --noEmit)..."
npx tsc --noEmit
if ($LASTEXITCODE -eq 0) {
    Write-Host "TypeScript checks passed successfully!" -ForegroundColor Green
} else {
    Write-Host "TypeScript checks failed!" -ForegroundColor Red
}

Write-Host "`nRunning Next.js production build (npm run build)..."
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "Next.js build passed successfully!" -ForegroundColor Green
} else {
    Write-Host "Next.js build failed!" -ForegroundColor Red
}

Write-Host "`n--- Cleanup Process Completed ---" -ForegroundColor Cyan
