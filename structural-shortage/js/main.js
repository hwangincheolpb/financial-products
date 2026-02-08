/**
 * Main Application Entry Point
 * 구조적 쇼티지 모니터링 대시보드
 */

(function() {
    'use strict';

    /**
     * 로딩 상태 표시
     */
    function showLoading() {
        const main = document.querySelector('.main-content');
        main.innerHTML = `
            <div class="loading-container" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 60vh;
                color: var(--text-muted);
            ">
                <div class="loading-spinner"></div>
                <p style="margin-top: 16px; font-size: 14px;">데이터를 불러오는 중...</p>
            </div>
        `;
    }

    /**
     * 에러 상태 표시
     */
    function showError(message) {
        const main = document.querySelector('.main-content');
        main.innerHTML = `
            <div class="error-container" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 60vh;
                color: var(--alert-red);
            ">
                <svg viewBox="0 0 24 24" fill="currentColor" style="width: 48px; height: 48px; margin-bottom: 16px;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <h3 style="font-size: 18px; margin-bottom: 8px;">데이터 로드 실패</h3>
                <p style="color: var(--text-muted); font-size: 14px;">${message}</p>
                <button onclick="location.reload()" style="
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: var(--accent-blue);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">다시 시도</button>
            </div>
        `;
    }

    /**
     * 원본 HTML 복원 (로딩 후)
     */
    function restoreMainContent() {
        const main = document.querySelector('.main-content');
        main.innerHTML = `
            <!-- 섹션 1: 경보 요약 -->
            <section id="summary" class="section">
                <div class="section-header">
                    <h2>경보 요약 <span class="section-subtitle">Alert Summary</span></h2>
                </div>
                <div class="summary-cards">
                    <div class="summary-card critical">
                        <div class="card-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                        </div>
                        <div class="card-content">
                            <span class="card-value" id="red-count">0</span>
                            <span class="card-label">CRITICAL</span>
                            <span class="card-desc">즉시 대응 필요</span>
                        </div>
                    </div>
                    <div class="summary-card warning">
                        <div class="card-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                            </svg>
                        </div>
                        <div class="card-content">
                            <span class="card-value" id="yellow-count">0</span>
                            <span class="card-label">WARNING</span>
                            <span class="card-desc">주의 관찰 필요</span>
                        </div>
                    </div>
                    <div class="summary-card stable">
                        <div class="card-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                        </div>
                        <div class="card-content">
                            <span class="card-value" id="green-count">0</span>
                            <span class="card-label">STABLE</span>
                            <span class="card-desc">안정 상태</span>
                        </div>
                    </div>
                    <div class="summary-card total">
                        <div class="card-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                            </svg>
                        </div>
                        <div class="card-content">
                            <span class="card-value" id="total-count">0</span>
                            <span class="card-label">TOTAL</span>
                            <span class="card-desc">모니터링 항목</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 섹션 2: 핵심 병목 노드 테이블 -->
            <section id="choke-points" class="section">
                <div class="section-header">
                    <h2>핵심 병목 노드 <span class="section-subtitle">Choke Points</span></h2>
                    <div class="table-controls">
                        <div class="filter-group">
                            <label>경보 등급</label>
                            <select id="alert-filter">
                                <option value="all">전체</option>
                                <option value="red">CRITICAL</option>
                                <option value="yellow">WARNING</option>
                                <option value="green">STABLE</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>카테고리</label>
                            <select id="category-filter">
                                <option value="all">전체</option>
                            </select>
                        </div>
                        <div class="search-group">
                            <input type="text" id="search" placeholder="노드명 검색...">
                            <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="table-container">
                    <table class="data-table" id="choke-points-table">
                        <thead>
                            <tr>
                                <th data-sort="id">#</th>
                                <th data-sort="name">노드명</th>
                                <th data-sort="category">카테고리</th>
                                <th data-sort="inventory">재고량 <span class="unit">(주)</span></th>
                                <th data-sort="leadTime">리드타임 <span class="unit">(배수)</span></th>
                                <th data-sort="priceYoY">가격 YoY <span class="unit">(%)</span></th>
                                <th data-sort="utilization">가동률 <span class="unit">(%)</span></th>
                                <th data-sort="alertLevel">경보</th>
                            </tr>
                        </thead>
                        <tbody id="table-body">
                        </tbody>
                    </table>
                </div>
                <div class="table-footer">
                    <span id="showing-count">0개 항목 표시</span>
                </div>
            </section>

            <!-- 섹션 3: 원자재 가격 트래킹 -->
            <section id="price-tracking" class="section">
                <div class="section-header">
                    <h2>원자재 가격 트래킹 <span class="section-subtitle">Price Tracking</span></h2>
                    <div class="chart-controls">
                        <div class="filter-group">
                            <label>원자재</label>
                            <select id="commodity-select">
                                <option value="">선택하세요</option>
                            </select>
                        </div>
                        <div class="period-buttons">
                            <button class="period-btn active" data-period="30">30일</button>
                            <button class="period-btn" data-period="90">90일</button>
                            <button class="period-btn" data-period="365">1년</button>
                        </div>
                    </div>
                </div>
                <div class="chart-container">
                    <div class="chart-wrapper">
                        <canvas id="price-chart"></canvas>
                    </div>
                    <div class="chart-info" id="chart-info">
                        <div class="info-item">
                            <span class="info-label">현재 가격</span>
                            <span class="info-value" id="current-price">-</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">YoY 변화</span>
                            <span class="info-value" id="price-change">-</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">추세</span>
                            <span class="info-value" id="price-trend">-</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 섹션 4: 상호의존성 체인 -->
            <section id="interdependency" class="section">
                <div class="section-header">
                    <h2>상호의존성 체인 <span class="section-subtitle">Interdependency Chains</span></h2>
                </div>
                <div class="chains-grid" id="chains-grid">
                </div>
            </section>

            <!-- 섹션 5: 선행지표 모니터링 -->
            <section id="leading-indicators" class="section">
                <div class="section-header">
                    <h2>선행지표 모니터링 <span class="section-subtitle">Leading Indicators</span></h2>
                </div>
                <div class="indicators-grid" id="indicators-grid">
                </div>
            </section>
        `;
    }

    /**
     * 애플리케이션 초기화
     */
    async function initApp() {
        console.log('[Shortage Monitor] 초기화 시작...');

        try {
            // 데이터 로드
            showLoading();
            await DataHandler.loadData();
            console.log('[Shortage Monitor] 데이터 로드 완료');

            // HTML 복원
            restoreMainContent();

            // 차트 초기화
            ChartManager.init();
            console.log('[Shortage Monitor] 차트 초기화 완료');

            // 대시보드 초기화
            Dashboard.init();
            console.log('[Shortage Monitor] 대시보드 초기화 완료');

            console.log('[Shortage Monitor] 초기화 완료!');

        } catch (error) {
            console.error('[Shortage Monitor] 초기화 실패:', error);
            showError(error.message);
        }
    }

    // DOM 로드 완료 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

    // 전역 에러 핸들링
    window.addEventListener('error', (event) => {
        console.error('[Shortage Monitor] 전역 에러:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('[Shortage Monitor] 처리되지 않은 Promise 거부:', event.reason);
    });

})();
