"""
PDF 페이지를 이미지로 추출하는 스크립트 (PyMuPDF 사용)
타임폴리오 + 디에스 핵심 페이지 추출
"""
import fitz  # PyMuPDF
import os

# 출력 디렉토리 생성
output_dir = r"c:\dev\active-projects\fund-comparison-web\images"
os.makedirs(output_dir, exist_ok=True)

def extract_page_as_image(pdf_path, page_num, output_name):
    """PDF의 특정 페이지를 이미지로 추출"""
    try:
        doc = fitz.open(pdf_path)
        page = doc[page_num - 1]  # 0-based index
        
        # 고해상도로 렌더링 (200 DPI)
        mat = fitz.Matrix(2.0, 2.0)  # 2배 확대 = 200 DPI
        pix = page.get_pixmap(matrix=mat)
        
        output_path = f"{output_dir}/{output_name}.png"
        pix.save(output_path)
        doc.close()
        print(f"✓ {output_name} 저장 완료: {output_path}")
        return True
    except Exception as e:
        print(f"✗ {output_name} 처리 실패: {e}")
        return False

# ========== 타임폴리오 ==========
timefolio_pdf = r"C:\Users\spfe0\Downloads\금상\타임폴리오 The Time 통합PT_20260108_CY26대응.pdf"
print(f"타임폴리오 PDF 처리 중: {timefolio_pdf}")

extract_page_as_image(timefolio_pdf, 2, "timefolio_performance")
extract_page_as_image(timefolio_pdf, 3, "timefolio_strategy")
extract_page_as_image(timefolio_pdf, 5, "timefolio_philosophy")
extract_page_as_image(timefolio_pdf, 6, "timefolio_mms")
extract_page_as_image(timefolio_pdf, 8, "timefolio_tms")
extract_page_as_image(timefolio_pdf, 10, "timefolio_market_outlook")
extract_page_as_image(timefolio_pdf, 11, "timefolio_market_outlook2")

# ========== 디에스 ==========
ds_pdf = r"C:\Users\spfe0\Downloads\금상\2. 53510_디에스BraveS일반사모투자신탁_제안서 v6 출력불가.pdf"
print(f"\n디에스 PDF 처리 중: {ds_pdf}")

# Page 7: 운용철학 및 투자스타일
extract_page_as_image(ds_pdf, 7, "ds_philosophy")

# Page 8: 핵심운용전략
extract_page_as_image(ds_pdf, 8, "ds_core_strategy")

# Page 9: 세부운용전략 (대형주/중소형주 비중)
extract_page_as_image(ds_pdf, 9, "ds_detail_strategy")

# Page 10-11: 신성장/구조적 성장 산업
extract_page_as_image(ds_pdf, 10, "ds_growth_industry")
extract_page_as_image(ds_pdf, 11, "ds_growth_industry2")

# Page 13: 종목선정 프로세스 (4-Factor)
extract_page_as_image(ds_pdf, 13, "ds_4factor")

# Page 14-15: 투자사례
extract_page_as_image(ds_pdf, 14, "ds_case_study1")
extract_page_as_image(ds_pdf, 15, "ds_case_study2")

# Page 16: 2025 Market View
extract_page_as_image(ds_pdf, 16, "ds_market_view")

# Page 22: 투자 스펙트럼 (비상장~상장)
extract_page_as_image(ds_pdf, 22, "ds_spectrum")

# ========== 기타 ==========
market_pdf = r"C:\Users\spfe0\Downloads\금상\시황자료_26Jan.pdf"
print(f"\n시황자료 PDF 처리 중: {market_pdf}")
extract_page_as_image(market_pdf, 1, "market_view")

fund_perf_pdf = r"C:\Users\spfe0\Downloads\금상\주요펀드_수익률_현황_260123.pdf"
print(f"\n펀드 수익률 PDF 처리 중: {fund_perf_pdf}")
extract_page_as_image(fund_perf_pdf, 1, "fund_performance")

print(f"\n✅ 모든 이미지가 {output_dir} 에 저장되었습니다.")
