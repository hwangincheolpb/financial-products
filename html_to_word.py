"""
HTML 파일을 그대로 Word 문서로 변환
"""
from htmldocx import HtmlToDocx
from docx import Document

# HTML 파일 읽기
with open(r"c:\dev\active-projects\fund-comparison-web\report.html", "r", encoding="utf-8") as f:
    html_content = f.read()

# Word 문서 생성
doc = Document()

# HTML을 Word로 변환
parser = HtmlToDocx()
parser.add_html_to_document(html_content, doc)

# 문서 저장
output_path = r"c:\dev\active-projects\fund-comparison-web\사모펀드_투자제안서.docx"
doc.save(output_path)

print(f"✅ HTML을 Word로 변환 완료: {output_path}")
