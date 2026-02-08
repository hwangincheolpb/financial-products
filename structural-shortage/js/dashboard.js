/**
 * Dashboard Module
 * 대시보드 UI 렌더링 및 인터랙션
 */

const Dashboard = (function() {
    // 상태 관리
    let currentSort = { key: 'id', direction: 'asc' };
    let currentFilters = { alert: 'all', category: 'all', search: '' };

    /**
     * 경보 요약 카드 업데이트
     */
    function updateSummaryCards(summary) {
        document.getElementById('red-count').textContent = summary.red;
        document.getElementById('yellow-count').textContent = summary.yellow;
        document.getElementById('green-count').textContent = summary.green;
        document.getElementById('total-count').textContent = summary.total;

        // 헤더 미니 배지
        document.getElementById('header-red').textContent = summary.red;
        document.getElementById('header-yellow').textContent = summary.yellow;
        document.getElementById('header-green').textContent = summary.green;
    }

    /**
     * 업데이트 시간 표시
     */
    function updateTime(lastUpdated) {
        document.getElementById('update-time').textContent = `업데이트: ${lastUpdated}`;
    }

    /**
     * 카테고리 필터 옵션 생성
     */
    function populateCategoryFilter(categories) {
        const select = document.getElementById('category-filter');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }

    /**
     * 원자재 선택 옵션 생성
     */
    function populateCommoditySelect(items) {
        const select = document.getElementById('commodity-select');
        const commoditiesWithPriceData = items.filter(item => item.priceData);

        commoditiesWithPriceData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            select.appendChild(option);
        });
    }

    /**
     * 테이블 행 생성
     */
    function createTableRow(item) {
        const inventoryColor = DataHandler.getColorCode(item.inventory, 'inventory');
        const leadTimeColor = DataHandler.getColorCode(item.leadTime, 'leadTime');
        const priceColor = DataHandler.getColorCode(Math.abs(item.priceYoY), 'priceYoY');
        const utilizationColor = DataHandler.getColorCode(item.utilization, 'utilization');

        const alertEmoji = {
            red: '!',
            yellow: '!',
            green: '\u2713'
        };

        return `
            <tr data-id="${item.id}">
                <td class="cell-id">${item.id}</td>
                <td class="cell-name">${item.name}</td>
                <td class="cell-category">${item.category}</td>
                <td class="cell-value ${inventoryColor}">${item.inventory}</td>
                <td class="cell-value ${leadTimeColor}">${item.leadTime.toFixed(1)}x</td>
                <td class="cell-value ${item.priceYoY >= 0 ? 'red' : 'green'}">
                    ${item.priceYoY >= 0 ? '+' : ''}${item.priceYoY}%
                </td>
                <td>
                    <div class="progress-cell">
                        <div class="progress-bar">
                            <div class="progress-fill ${utilizationColor}" style="width: ${item.utilization}%"></div>
                        </div>
                        <span class="progress-value ${utilizationColor}">${item.utilization}%</span>
                    </div>
                </td>
                <td class="cell-alert">
                    <span class="alert-indicator ${item.alertLevel}">${alertEmoji[item.alertLevel]}</span>
                </td>
            </tr>
        `;
    }

    /**
     * 테이블 렌더링
     */
    function renderTable(items) {
        const tbody = document.getElementById('table-body');

        if (items.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                        검색 결과가 없습니다
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = items.map(createTableRow).join('');
        }

        // 표시 카운트 업데이트
        document.getElementById('showing-count').textContent = `${items.length}개 항목 표시`;

        // 행 클릭 이벤트 추가
        tbody.querySelectorAll('tr[data-id]').forEach(row => {
            row.addEventListener('click', () => {
                const id = parseInt(row.dataset.id);
                showItemModal(id);
            });
        });
    }

    /**
     * 테이블 필터링 및 정렬 적용
     */
    function applyFiltersAndSort() {
        let items = DataHandler.filterItems(
            currentFilters.alert,
            currentFilters.category,
            currentFilters.search
        );
        items = DataHandler.sortItems(items, currentSort.key, currentSort.direction);
        renderTable(items);
    }

    /**
     * 정렬 헤더 업데이트
     */
    function updateSortHeaders() {
        document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.sort === currentSort.key) {
                th.classList.add(`sort-${currentSort.direction}`);
            }
        });
    }

    /**
     * 상호의존성 체인 카드 렌더링
     */
    function renderChains(chains) {
        const grid = document.getElementById('chains-grid');

        grid.innerHTML = chains.map(chain => `
            <div class="chain-card ${chain.status}">
                <div class="chain-header">
                    <span class="chain-title">${chain.name}</span>
                    <span class="chain-status ${chain.status}">
                        ${chain.status === 'critical' ? 'CRITICAL' : chain.status === 'warning' ? 'WARNING' : 'NORMAL'}
                    </span>
                </div>
                <div class="chain-flow">
                    ${chain.nodes.map((node, i) => `
                        <span class="chain-node">${node}</span>
                        ${i < chain.nodes.length - 1 ? '<span class="chain-arrow">\u2192</span>' : ''}
                    `).join('')}
                </div>
                <div class="chain-monitor">
                    <strong>모니터링:</strong> ${chain.monitoringPoint}
                </div>
            </div>
        `).join('');
    }

    /**
     * 선행지표 카드 렌더링
     */
    function renderIndicators(indicators) {
        const grid = document.getElementById('indicators-grid');

        grid.innerHTML = indicators.map(ind => {
            const trendIcon = ind.trend === 'up' ? '\u25B2' : ind.trend === 'down' ? '\u25BC' : '\u25AC';
            const trendClass = ind.trend === 'up' ? 'up' : ind.trend === 'down' ? 'down' : 'stable';

            return `
                <div class="indicator-card ${ind.status}">
                    <div class="indicator-header">
                        <span class="indicator-name">${ind.name}</span>
                        <span class="indicator-trend ${trendClass}">${trendIcon}</span>
                    </div>
                    <div class="indicator-value">
                        ${ind.value}<span class="indicator-unit">${ind.unit}</span>
                    </div>
                    <div class="indicator-footer">
                        <span class="indicator-threshold">임계: ${ind.threshold}${ind.unit}</span>
                        <span class="indicator-source">${ind.source}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 항목 상세 모달 표시
     */
    function showItemModal(id) {
        const item = DataHandler.getItemById(id);
        if (!item) return;

        const modal = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        title.textContent = item.name;

        const alertLabel = {
            red: 'CRITICAL',
            yellow: 'WARNING',
            green: 'STABLE'
        };

        body.innerHTML = `
            <div class="modal-section">
                <h4 class="modal-section-title">기본 정보</h4>
                <div class="modal-grid">
                    <div class="modal-item">
                        <span class="modal-item-label">카테고리</span>
                        <span class="modal-item-value">${item.category}</span>
                    </div>
                    <div class="modal-item">
                        <span class="modal-item-label">경보 등급</span>
                        <span class="modal-item-value alert-${item.alertLevel}">${alertLabel[item.alertLevel]}</span>
                    </div>
                </div>
            </div>

            <div class="modal-section">
                <h4 class="modal-section-title">핵심 지표</h4>
                <div class="modal-grid">
                    <div class="modal-item">
                        <span class="modal-item-label">재고량</span>
                        <span class="modal-item-value ${DataHandler.getColorCode(item.inventory, 'inventory')}">${item.inventory}주</span>
                    </div>
                    <div class="modal-item">
                        <span class="modal-item-label">리드타임</span>
                        <span class="modal-item-value ${DataHandler.getColorCode(item.leadTime, 'leadTime')}">${item.leadTime}x</span>
                    </div>
                    <div class="modal-item">
                        <span class="modal-item-label">가격 YoY</span>
                        <span class="modal-item-value ${item.priceYoY >= 0 ? 'red' : 'green'}">${item.priceYoY >= 0 ? '+' : ''}${item.priceYoY}%</span>
                    </div>
                    <div class="modal-item">
                        <span class="modal-item-label">가동률</span>
                        <span class="modal-item-value ${DataHandler.getColorCode(item.utilization, 'utilization')}">${item.utilization}%</span>
                    </div>
                </div>
            </div>

            ${item.priceData ? `
            <div class="modal-section">
                <h4 class="modal-section-title">가격 정보</h4>
                <div class="modal-grid">
                    <div class="modal-item">
                        <span class="modal-item-label">현재 가격</span>
                        <span class="modal-item-value">${DataHandler.formatPrice(item.priceData.current, item.priceData.unit)}</span>
                    </div>
                    <div class="modal-item">
                        <span class="modal-item-label">추세</span>
                        <span class="modal-item-value ${item.priceData.trend === 'up' ? 'red' : item.priceData.trend === 'down' ? 'green' : ''}">${item.priceData.trend === 'up' ? '\u25B2 상승' : item.priceData.trend === 'down' ? '\u25BC 하락' : '\u25AC 보합'}</span>
                    </div>
                </div>
            </div>
            ` : ''}

            ${item.leadingIndicators && item.leadingIndicators.length > 0 ? `
            <div class="modal-section">
                <h4 class="modal-section-title">선행지표</h4>
                <div class="modal-grid">
                    ${item.leadingIndicators.map(ind => `
                        <div class="modal-item">
                            <span class="modal-item-label">${ind.name}</span>
                            <span class="modal-item-value ${ind.status === 'critical' ? 'red' : ind.status === 'warning' ? 'yellow' : ''}">${ind.value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;

        modal.classList.add('active');
    }

    /**
     * 모달 닫기
     */
    function closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    }

    /**
     * 이벤트 리스너 설정
     */
    function setupEventListeners() {
        // 필터 변경
        document.getElementById('alert-filter').addEventListener('change', (e) => {
            currentFilters.alert = e.target.value;
            applyFiltersAndSort();
        });

        document.getElementById('category-filter').addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            applyFiltersAndSort();
        });

        // 검색
        let searchTimeout;
        document.getElementById('search').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.search = e.target.value;
                applyFiltersAndSort();
            }, 300);
        });

        // 테이블 정렬
        document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const key = th.dataset.sort;
                if (currentSort.key === key) {
                    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSort.key = key;
                    currentSort.direction = 'asc';
                }
                updateSortHeaders();
                applyFiltersAndSort();
            });
        });

        // 모달 닫기
        document.getElementById('modal-close').addEventListener('click', closeModal);
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        // 원자재 선택
        document.getElementById('commodity-select').addEventListener('change', (e) => {
            const id = parseInt(e.target.value);
            if (id) {
                ChartManager.updateChart(id);
            }
        });

        // 기간 버튼
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                ChartManager.setPeriod(parseInt(btn.dataset.period));
            });
        });
    }

    /**
     * 대시보드 초기화
     */
    function init() {
        const data = DataHandler.getData();

        // 업데이트 시간
        updateTime(data.lastUpdated);

        // 경보 요약
        const counts = DataHandler.calculateAlertCounts(data.items);
        updateSummaryCards(counts);

        // 카테고리 필터 옵션
        populateCategoryFilter(data.categories);

        // 원자재 선택 옵션
        populateCommoditySelect(data.items);

        // 테이블 렌더링
        applyFiltersAndSort();

        // 상호의존성 체인
        renderChains(data.interdependencyChains);

        // 선행지표
        renderIndicators(data.leadingIndicators);

        // 이벤트 리스너
        setupEventListeners();
    }

    // Public API
    return {
        init,
        applyFiltersAndSort,
        showItemModal,
        closeModal,
        updateSummaryCards
    };
})();
