"""
HTML 페이지를 캡처해서 Word 문서로 생성
"""
from playwright.sync_api import sync_playwright
from docx import Document
from docx.shared import Inches
import os
import time

# 출력 디렉토리
screenshot_dir = r"c:\dev\active-projects\fund-comparison-web\screenshots"
os.makedirs(screenshot_dir, exist_ok=True)

# HTML 파일 경로
html_path = r"c:\dev\active-projects\fund-comparison-web\report.html"
html_url = f"file:///{html_path.replace(chr(92), '/')}"

print(f"📸 HTML 캡처 시작: {html_url}")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 794, 'height': 1123})  # A4 크기 (72 DPI)
    
    # HTML 열기
    page.goto(html_url)
    page.wait_for_load_state('networkidle')
    time.sleep(2)  # 렌더링 대기
    
    # 전체 페이지 수 계산 (CSS page-break-after로 나뉜 페이지들)
    pages = page.query_selector_all('.page')
    print(f"📄 총 {len(pages)} 페이지 발견")
    
    screenshots = []
    
    for i, page_elem in enumerate(pages, 1):
        screenshot_path = f"{screenshot_dir}/page_{i}.png"
        page_elem.screenshot(path=screenshot_path)
        screenshots.append(screenshot_path)
        print(f"✓ 페이지 {i} 캡처 완료")
    
    browser.close()

# Word 문서 생성
print("\n📝 Word 문서 생성 중...")
doc = Document()

# 페이지 여백 최소화
sections = doc.sections
for section in sections:
    section.top_margin = Inches(0.5)
    section.bottom_margin = Inches(0.5)
    section.left_margin = Inches(0.5)
    section.right_margin = Inches(0.5)

# 캡처한 이미지를 Word에 추가
for i, screenshot_path in enumerate(screenshots, 1):
    if i > 1:
        doc.add_page_break()
    
    # A4 너비에 맞춰 이미지 추가 (여백 고려)
    doc.add_picture(screenshot_path, width=Inches(7.5))
    print(f"✓ 페이지 {i} Word에 추가")

# 문서 저장
output_path = r"c:\dev\active-projects\fund-comparison-web\사모펀드_투자제안서.docx"
doc.save(output_path)

print(f"\n✅ 완료! Word 문서 생성: {output_path}")
print(f"📸 캡처 이미지: {screenshot_dir}")
