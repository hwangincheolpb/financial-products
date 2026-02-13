# PDF 제안서 제작 방법론 (최종 버전)

## 📋 프로젝트 개요

**목적**: HTML 기반 제안서를 텍스트 편집 가능한 Word 문서로 변환  
**핵심 원칙**: 텍스트는 텍스트로, 이미지는 이미지로 분리하여 편집 가능성 극대화  
**대상**: 편집 및 페이지 구분 조정이 필요한 제안서

---

## 🗂️ 파일 구조

```
fund-comparison-web/
├── report.html                      # 원본 HTML 제안서
├── html_to_word_hybrid.py           # Word 변환 스크립트 (최종)
├── 사모펀드_투자제안서.docx          # 최종 출력물
├── images/                          # PDF에서 추출한 이미지들
│   ├── timefolio_performance.png
│   ├── timefolio_strategy.png
│   ├── timefolio_philosophy.png
│   ├── timefolio_mms.png
│   ├── timefolio_tms.png
│   ├── ds_philosophy.png
│   ├── ds_core_strategy.png
│   ├── ds_detail_strategy.png
│   └── ds_4factor.png
└── extract_pdf_pages.py             # PDF 이미지 추출 스크립트
```

---

## 🔧 기술 스택

### 1. PDF 이미지 추출
- **라이브러리**: `PyMuPDF` (fitz)
- **설치**: `pip install PyMuPDF`
- **장점**: Poppler 의존성 없음, 고해상도 추출 가능

### 2. Word 문서 생성
- **라이브러리**: `python-docx`
- **설치**: `pip install python-docx`
- **기능**: 텍스트/이미지 분리, 스타일 제어, 페이지 구분

---

## 📝 핵심 스크립트: `html_to_word_hybrid.py`

### 주요 기능

```python
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
import os

# 1. 제목 추가 (편집 가능한 텍스트)
def add_title(text):
    heading = doc.add_heading(text, level=1)
    heading.runs[0].font.size = Pt(20)
    heading.runs[0].font.bold = True
    return heading

# 2. 부제목 추가
def add_subtitle(text):
    heading = doc.add_heading(text, level=2)
    heading.runs[0].font.size = Pt(14)
    heading.runs[0].font.bold = True
    return heading

# 3. 글머리 기호 텍스트 박스
def add_text_box(title, items):
    p = doc.add_paragraph()
    run = p.add_run(title)
    run.bold = True
    run.font.size = Pt(11)
    
    for item in items:
        p = doc.add_paragraph(item, style='List Bullet')
        p.paragraph_format.left_indent = Inches(0.3)

# 4. 이미지 삽입 (크기 조정 가능)
def add_image(image_path, width=6.5):
    full_path = os.path.join(r"c:\dev\active-projects\fund-comparison-web", image_path)
    if os.path.exists(full_path):
        doc.add_picture(full_path, width=Inches(width))
        last_paragraph = doc.paragraphs[-1]
        last_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

# 5. 페이지 구분
def add_page_break():
    doc.add_page_break()
```

### 문서 구조 예시

```python
# PAGE 1: 비교 & 성과
add_title("타임폴리오 vs 디에스 사모펀드 비교")
add_subtitle("1. 핵심 전략 비교")

add_text_box("타임폴리오 The Time (Long-Short)", [
    "지수 중립 알파 추출 전략. 하락장에서도 수익 추구하는 방어적 절대수익형",
    "10년 누적: +289.3% (KOSPI +131.3%) / 연환산: 15.1% / 샤프지수: 1.26",
    "성과보수: 초과수익의 20% (HWM) / 최소가입: 5억(일반), 1억(전문)"
])

add_subtitle("2. 타임폴리오 10년 성과")
add_image("images/timefolio_performance.png")

add_page_break()

# PAGE 2: 타임폴리오 운용 전략
add_title("타임폴리오 The Time - 운용 전략")
add_subtitle("Long/Short 전략 구성")
add_image("images/timefolio_strategy.png")
```

---

## 🎯 핵심 장점

### 1. 텍스트 편집 가능
- ✅ 제목/부제목 수정 가능
- ✅ 본문 텍스트 복사/붙여넣기 가능
- ✅ 글머리 기호 자동 적용

### 2. 이미지 조정 가능
- ✅ 이미지 크기 조정 (드래그)
- ✅ 이미지 위치 이동
- ✅ 이미지 교체 가능

### 3. 페이지 구분 자유
- ✅ `Ctrl + Enter`로 페이지 나누기 추가
- ✅ 페이지 나누기 삭제 가능
- ✅ 원하는 위치에서 페이지 분할

### 4. 스타일 일관성
- ✅ 맑은 고딕 폰트 통일
- ✅ 제목 크기 자동 적용 (20pt, 14pt)
- ✅ 이미지 중앙 정렬

---

## 🚀 실행 방법

### 1단계: 환경 설정
```bash
pip install PyMuPDF python-docx
```

### 2단계: PDF 이미지 추출 (필요시)
```bash
python extract_pdf_pages.py
```

### 3단계: Word 문서 생성
```bash
# Word가 열려있으면 먼저 닫기
taskkill /F /IM WINWORD.EXE

# Word 문서 생성
python html_to_word_hybrid.py
```

### 4단계: Word에서 편집
- 페이지 나누기: `Ctrl + Enter`
- 이미지 크기 조정: 이미지 클릭 후 모서리 드래그
- 텍스트 편집: 직접 수정

---

## 📊 다른 방법론과 비교

| 방법 | 텍스트 편집 | 이미지 조정 | 페이지 구분 | 권장 |
|------|------------|------------|------------|------|
| **HTML → 캡처 → Word** | ❌ (이미지) | ❌ | ✅ | ❌ |
| **htmldocx 변환** | ⚠️ (불완전) | ⚠️ | ⚠️ | ❌ |
| **python-docx 직접 구성** | ✅ | ✅ | ✅ | ✅ **추천** |

---

## 💡 활용 팁

### 1. 이미지 크기 조정
```python
# 기본: 6.5인치 (A4 너비에 맞춤)
add_image("images/chart.png", width=6.5)

# 작게: 4인치
add_image("images/small.png", width=4.0)

# 크게: 7인치
add_image("images/large.png", width=7.0)
```

### 2. 텍스트 박스 스타일 변경
```python
# 배경색 추가 (Word에서 수동 적용 권장)
# 또는 python-docx의 shading 기능 사용
```

### 3. 페이지 여백 조정
```python
from docx.shared import Inches

sections = doc.sections
for section in sections:
    section.top_margin = Inches(0.5)
    section.bottom_margin = Inches(0.5)
    section.left_margin = Inches(0.75)
    section.right_margin = Inches(0.75)
```

---

## 🔄 업데이트 프로세스

### 1. 내용 수정
1. `html_to_word_hybrid.py` 파일 수정
2. 텍스트 내용 변경 또는 이미지 경로 수정
3. 스크립트 재실행

### 2. 이미지 추가/변경
1. `images/` 폴더에 새 이미지 추가
2. 스크립트에 `add_image()` 호출 추가
3. 스크립트 재실행

### 3. 페이지 구조 변경
1. `add_page_break()` 위치 조정
2. 섹션 순서 변경
3. 스크립트 재실행

---

## ⚠️ 주의사항

### 1. Word 파일 잠금
- **문제**: Word가 열려있으면 저장 실패
- **해결**: `taskkill /F /IM WINWORD.EXE`로 먼저 닫기

### 2. 이미지 경로
- **절대경로 사용**: `os.path.join()`으로 전체 경로 구성
- **상대경로 주의**: 실행 위치에 따라 오류 발생 가능

### 3. 한글 폰트
- **맑은 고딕**: Windows 기본 폰트
- **다른 폰트**: 시스템에 설치된 폰트만 사용 가능

---

## 📚 참고 자료

### Python-docx 문서
- 공식 문서: https://python-docx.readthedocs.io/
- 스타일 가이드: https://python-docx.readthedocs.io/en/latest/user/styles.html

### PyMuPDF 문서
- 공식 문서: https://pymupdf.readthedocs.io/
- 이미지 추출: https://pymupdf.readthedocs.io/en/latest/recipes-images.html

---

## 🎓 핵심 교훈

### 왜 이 방법이 최선인가?

1. **편집성**: 텍스트와 이미지를 모두 자유롭게 수정 가능
2. **유연성**: 페이지 구분을 원하는 대로 조정 가능
3. **품질**: 고해상도 이미지 + 네이티브 텍스트
4. **효율성**: 한 번 설정하면 반복 사용 가능

### 대상 사용자
- ✅ 편집이 필요한 제안서 (페이지 구분 조정 필수)
- ✅ 텍스트 수정이 빈번한 문서
- ✅ 이미지와 텍스트가 혼합된 보고서

### 사용하지 말아야 할 경우
- ❌ 단순 PDF 변환만 필요한 경우 (브라우저 인쇄 사용)
- ❌ 레이아웃이 복잡한 디자인 문서 (InDesign 등 사용)

---

## 📝 요약

**이 방법론의 핵심**: HTML 제안서를 **텍스트는 텍스트로, 이미지는 이미지로** 분리하여 Word 문서로 변환함으로써, 편집 가능성과 페이지 구분 자유도를 극대화한다.

**한 줄 요약**: "병신들도 편집할 수 있는 Word 문서 만들기"

---

**작성일**: 2026-01-27  
**버전**: v1.0 (최종)  
**프로젝트**: fund-comparison-web
