# GitHub에 푸시하는 스크립트
# 사용법: .\deploy-to-github.ps1 [레포지토리URL]

param(
    [string]$RepoUrl = ""
)

$ErrorActionPreference = "Stop"

# 프로젝트 디렉토리로 이동
$ProjectDir = "c:\dev\active-projects\fund-comparison-web"
$SourceDir = "C:\Users\spfe0\Downloads\금상"
$TargetFolder = "fund-2026"
$RepoDir = "$ProjectDir\temp-repo"

Write-Host "🚀 GitHub 배포 스크립트 시작" -ForegroundColor Cyan

# 0. 레포지토리 클론/업데이트
Write-Host "`n📥 레포지토리 준비 중..." -ForegroundColor Yellow
if (-not (Test-Path $RepoDir)) {
    Set-Location $ProjectDir
    git clone https://github.com/hwangincheolpb/financial-products.git temp-repo 2>&1 | Out-Null
    Write-Host "  ✓ 레포지토리 클론 완료" -ForegroundColor Green
} else {
    Set-Location $RepoDir
    try {
        $null = git pull origin master 2>&1 | Out-String
        Write-Host "  ✓ 레포지토리 업데이트 완료" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️ 레포지토리 업데이트 중 경고 (계속 진행)" -ForegroundColor Yellow
    }
}

# 1. Downloads 폴더에서 최신 파일을 하위 폴더로 복사
Write-Host "`n📁 최신 파일 복사 중..." -ForegroundColor Yellow
$TargetPath = "$RepoDir\$TargetFolder"
if (-not (Test-Path $TargetPath)) {
    New-Item -ItemType Directory -Path $TargetPath -Force | Out-Null
}

if (Test-Path $SourceDir) {
    $filesToCopy = @("*.html", "*.css")
    foreach ($pattern in $filesToCopy) {
        $files = Get-ChildItem -Path $SourceDir -Filter $pattern
        foreach ($file in $files) {
            Copy-Item -Path $file.FullName -Destination $TargetPath -Force
            Write-Host "  ✓ $($file.Name) → $TargetFolder/ 복사 완료" -ForegroundColor Green
        }
    }
} else {
    Write-Host "  ⚠️ 소스 폴더를 찾을 수 없습니다: $SourceDir" -ForegroundColor Yellow
}

# 2. 메인 index.html 업데이트
Write-Host "`n📝 메인 페이지 링크 추가 중..." -ForegroundColor Yellow
$MainIndexPath = "$RepoDir\index.html"
if (Test-Path $MainIndexPath) {
    $mainContent = Get-Content $MainIndexPath -Raw -Encoding UTF8
    if ($mainContent -notmatch "2026 주식형 펀드 제안") {
        $mainContent = $mainContent -replace '(?s)(<div class="grid gap-6">.*?</a>)', '$1' + "`n            <a href=`"/financial-products/fund-2026/`" class=`"bg-white p-6 rounded-lg shadow hover:shadow-lg transition`">`n                <h2 class=`"text-2xl font-bold mb-2`">2026 주식형 펀드 제안</h2>`n                <p class=`"text-slate-600`">KOSPI 5,000 시대의 펀드 전략 및 상품 제안</p>`n            </a>"
        Set-Content -Path $MainIndexPath -Value $mainContent -Encoding UTF8
        Write-Host "  ✓ 메인 페이지 링크 추가 완료" -ForegroundColor Green
    } else {
        Write-Host "  ✓ 메인 페이지 링크가 이미 있습니다" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️ 메인 index.html을 찾을 수 없습니다" -ForegroundColor Yellow
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

# 3. Git 사용자 정보 확인 및 설정
Set-Location $RepoDir
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

# 4. 파일 추가 및 커밋
Write-Host "`n📝 변경사항 커밋 중..." -ForegroundColor Yellow
Set-Location $RepoDir
git add .
$commitMessage = "Add: 2026 주식형 펀드 제안 페이지 ($(Get-Date -Format 'yyyy-MM-dd HH:mm'))"
git commit -m $commitMessage
Write-Host "  ✓ 커밋 완료: $commitMessage" -ForegroundColor Green

# 5. GitHub에 푸시
Write-Host "`n☁️ GitHub에 푸시 중..." -ForegroundColor Yellow
try {
    $branch = git branch --show-current 2>$null
    if (-not $branch) {
        # main 또는 master 브랜치 확인
        $mainBranch = git branch -a | Select-String -Pattern "origin/(main|master)"
        if ($mainBranch -match "main") {
            $branch = "main"
        } else {
            $branch = "master"
        }
    }
    
    git push -u origin $branch
    Write-Host "  ✓ 푸시 완료!" -ForegroundColor Green
    Write-Host "`n🎉 배포 성공!" -ForegroundColor Cyan
    Write-Host "`n📌 웹사이트 링크:" -ForegroundColor Cyan
    Write-Host "  메인 페이지: https://hwangincheolpb.github.io/financial-products/" -ForegroundColor Yellow
    Write-Host "  펀드 제안: https://hwangincheolpb.github.io/financial-products/fund-2026/" -ForegroundColor Yellow
} catch {
    Write-Host "  ❌ 푸시 실패: $_" -ForegroundColor Red
    Write-Host "`n💡 수동으로 푸시하세요:" -ForegroundColor Yellow
    Write-Host "  cd $RepoDir" -ForegroundColor Gray
    Write-Host "  git push -u origin master" -ForegroundColor Gray
}

Write-Host "`n✅ 완료!" -ForegroundColor Green
