# GitHub에 푸시하는 스크립트
# 사용법: .\deploy-to-github.ps1 [레포지토리URL]

param(
    [string]$RepoUrl = ""
)

$ErrorActionPreference = "Stop"

# 프로젝트 디렉토리로 이동
$ProjectDir = "c:\dev\active-projects\fund-comparison-web"
$SourceDir = "C:\Users\spfe0\Downloads\금상"

Write-Host "🚀 GitHub 배포 스크립트 시작" -ForegroundColor Cyan

# 1. Downloads 폴더에서 최신 파일 복사
Write-Host "`n📁 최신 파일 복사 중..." -ForegroundColor Yellow
if (Test-Path $SourceDir) {
    $filesToCopy = @("*.html", "*.css")
    foreach ($pattern in $filesToCopy) {
        $files = Get-ChildItem -Path $SourceDir -Filter $pattern
        foreach ($file in $files) {
            Copy-Item -Path $file.FullName -Destination $ProjectDir -Force
            Write-Host "  ✓ $($file.Name) 복사 완료" -ForegroundColor Green
        }
    }
} else {
    Write-Host "  ⚠️ 소스 폴더를 찾을 수 없습니다: $SourceDir" -ForegroundColor Yellow
}

# 2. Git 초기화 확인
Set-Location $ProjectDir
if (-not (Test-Path ".git")) {
    Write-Host "`n🔧 Git 레포지토리 초기화 중..." -ForegroundColor Yellow
    git init
    Write-Host "  ✓ Git 초기화 완료" -ForegroundColor Green
}

# Git 사용자 정보 확인 및 설정
$gitUser = git config user.name 2>$null
$gitEmail = git config user.email 2>$null
if (-not $gitUser -or -not $gitEmail) {
    Write-Host "`n⚙️ Git 사용자 정보 설정 중..." -ForegroundColor Yellow
    if (-not $gitUser) {
        git config user.name "hwangincheolpb"
        Write-Host "  ✓ 사용자 이름 설정: hwangincheolpb" -ForegroundColor Green
    }
    if (-not $gitEmail) {
        git config user.email "hwangincheolpb@users.noreply.github.com"
        Write-Host "  ✓ 이메일 설정: hwangincheolpb@users.noreply.github.com" -ForegroundColor Green
    }
}

# 3. GitHub 레포지토리 연결
$GitHubUser = "hwangincheolpb"
$PossibleRepos = @(
    "financial-products",
    "fund-comparison",
    "fund-strategy",
    "fund-comparison-web",
    "fund-web"
)

if ($RepoUrl) {
    $finalRepoUrl = $RepoUrl
} else {
    Write-Host "`n🔍 기존 레포지토리 확인 중..." -ForegroundColor Yellow
    $existingRemote = $null
    try {
        $existingRemote = git remote get-url origin 2>&1 | Out-String
        if ($existingRemote -match "error") {
            $existingRemote = $null
        } else {
            $existingRemote = $existingRemote.Trim()
        }
    } catch {
        $existingRemote = $null
    }
    
    if ($existingRemote -and $existingRemote -notmatch "error") {
        Write-Host "  ✓ 기존 remote 발견: $existingRemote" -ForegroundColor Green
        $finalRepoUrl = $existingRemote
    } else {
        Write-Host "  ⚠️ 기존 remote가 없습니다. 가능한 레포지토리 이름:" -ForegroundColor Yellow
        for ($i = 0; $i -lt $PossibleRepos.Count; $i++) {
            Write-Host "    $($i+1). $($PossibleRepos[$i])" -ForegroundColor Gray
        }
        Write-Host "`n  기본값 'financial-products' 사용" -ForegroundColor Yellow
        $repoName = "financial-products"
        $finalRepoUrl = "https://github.com/$GitHubUser/$repoName.git"
        Write-Host "  → 사용할 URL: $finalRepoUrl" -ForegroundColor Cyan
    }
}

if ($finalRepoUrl) {
    Write-Host "`n🔗 GitHub 레포지토리 연결 중..." -ForegroundColor Yellow
    $existingRemote = $null
    try {
        $remoteOutput = git remote get-url origin 2>&1 | Out-String
        if ($remoteOutput -notmatch "error" -and $remoteOutput.Trim()) {
            $existingRemote = $remoteOutput.Trim()
        }
    } catch {
        $existingRemote = $null
    }
    
    if ($existingRemote -and $existingRemote -notmatch "error") {
        if ($existingRemote -ne $finalRepoUrl) {
            Write-Host "  ℹ️ 기존 remote: $existingRemote" -ForegroundColor Cyan
            Write-Host "  → 새 remote: $finalRepoUrl" -ForegroundColor Cyan
            Write-Host "  → Remote URL 자동 업데이트" -ForegroundColor Yellow
            git remote set-url origin $finalRepoUrl
            Write-Host "  ✓ Remote URL 업데이트 완료" -ForegroundColor Green
        } else {
            Write-Host "  ✓ Remote URL이 이미 올바르게 설정되어 있습니다" -ForegroundColor Green
        }
    } else {
        git remote add origin $finalRepoUrl
        Write-Host "  ✓ Remote 추가 완료: $finalRepoUrl" -ForegroundColor Green
    }
}

# 4. 파일 추가 및 커밋
Write-Host "`n📝 변경사항 커밋 중..." -ForegroundColor Yellow
git add .
$commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git commit -m $commitMessage
Write-Host "  ✓ 커밋 완료: $commitMessage" -ForegroundColor Green

# 5. GitHub에 푸시
Write-Host "`n☁️ GitHub에 푸시 중..." -ForegroundColor Yellow
try {
    $branch = git branch --show-current 2>$null
    if (-not $branch) {
        git branch -M main
        $branch = "main"
    }
    
    git push -u origin $branch
    Write-Host "  ✓ 푸시 완료!" -ForegroundColor Green
    Write-Host "`n🎉 배포 성공!" -ForegroundColor Cyan
} catch {
    Write-Host "  ❌ 푸시 실패: $_" -ForegroundColor Red
    Write-Host "`n💡 수동으로 푸시하세요:" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor Gray
}

Write-Host "`n✅ 완료!" -ForegroundColor Green
