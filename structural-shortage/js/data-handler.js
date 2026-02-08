/**
 * Data Handler Module
 * JSON 데이터 로드 및 관리
 */

const DataHandler = (function() {
    let dashboardData = null;
    const DATA_PATH = 'data/master-dashboard.json';

    /**
     * JSON 데이터 로드
     */
    async function loadData() {
        try {
            const response = await fetch(DATA_PATH);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            dashboardData = await response.json();
            return dashboardData;
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            throw error;
        }
    }

    /**
     * 전체 데이터 반환
     */
    function getData() {
        return dashboardData;
    }

    /**
     * 항목 목록 반환
     */
    function getItems() {
        return dashboardData?.items || [];
    }

    /**
     * 특정 항목 반환
     */
    function getItemById(id) {
        return dashboardData?.items?.find(item => item.id === id) || null;
    }

    /**
     * 카테고리 목록 반환
     */
    function getCategories() {
        return dashboardData?.categories || [];
    }

    /**
     * 상호의존성 체인 반환
     */
    function getInterdependencyChains() {
        return dashboardData?.interdependencyChains || [];
    }

    /**
     * 선행지표 반환
     */
    function getLeadingIndicators() {
        return dashboardData?.leadingIndicators || [];
    }

    /**
     * 경보 요약 반환
     */
    function getSummary() {
        return dashboardData?.summary || { red: 0, yellow: 0, green: 0, total: 0 };
    }

    /**
     * 마지막 업데이트 시간 반환
     */
    function getLastUpdated() {
        return dashboardData?.lastUpdated || '-';
    }

    /**
     * 경보 등급 계산
     */
    function calculateAlertLevel(item) {
        let redCount = 0;
        let yellowCount = 0;

        // RED 조건 체크
        if (item.inventory < 4) redCount++;
        if (item.leadTime >= 2.0) redCount++;
        if (item.priceYoY >= 50) redCount++;
        if (item.utilization >= 95) redCount++;

        if (redCount >= 2) return 'red';

        // YELLOW 조건 체크
        if (item.inventory < 8) yellowCount++;
        if (item.leadTime >= 1.5) yellowCount++;
        if (item.priceYoY >= 30) yellowCount++;
        if (item.utilization >= 85) yellowCount++;

        if (yellowCount >= 1) return 'yellow';
        return 'green';
    }

    /**
     * 경보 등급 카운트 계산
     */
    function calculateAlertCounts(items) {
        const counts = { red: 0, yellow: 0, green: 0, total: items.length };
        items.forEach(item => {
            const level = item.alertLevel || calculateAlertLevel(item);
            if (level === 'red') counts.red++;
            else if (level === 'yellow') counts.yellow++;
            else counts.green++;
        });
        return counts;
    }

    /**
     * 필터링된 항목 반환
     */
    function filterItems(alertFilter = 'all', categoryFilter = 'all', searchTerm = '') {
        let items = getItems();

        // 경보 등급 필터
        if (alertFilter !== 'all') {
            items = items.filter(item => item.alertLevel === alertFilter);
        }

        // 카테고리 필터
        if (categoryFilter !== 'all') {
            items = items.filter(item => item.category === categoryFilter);
        }

        // 검색어 필터
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            items = items.filter(item =>
                item.name.toLowerCase().includes(term) ||
                item.category.toLowerCase().includes(term)
            );
        }

        return items;
    }

    /**
     * 항목 정렬
     */
    function sortItems(items, sortKey, sortDirection = 'asc') {
        return [...items].sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];

            // 문자열 비교
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            // 경보 등급 정렬 (red > yellow > green)
            if (sortKey === 'alertLevel') {
                const order = { red: 0, yellow: 1, green: 2 };
                valA = order[valA] ?? 3;
                valB = order[valB] ?? 3;
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    /**
     * 가격 데이터 포맷팅
     */
    function formatPrice(value, unit) {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M ${unit}`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K ${unit}`;
        } else if (value < 1) {
            return `${value.toFixed(3)} ${unit}`;
        }
        return `${value.toLocaleString()} ${unit}`;
    }

    /**
     * 퍼센트 변화 포맷팅
     */
    function formatPercentChange(value) {
        const prefix = value > 0 ? '+' : '';
        return `${prefix}${value}%`;
    }

    /**
     * 색상 코드 반환
     */
    function getColorCode(value, type) {
        switch(type) {
            case 'inventory':
                if (value < 4) return 'red';
                if (value < 8) return 'yellow';
                return 'green';
            case 'leadTime':
                if (value >= 2.0) return 'red';
                if (value >= 1.5) return 'yellow';
                return 'green';
            case 'priceYoY':
                if (value >= 50) return 'red';
                if (value >= 30) return 'yellow';
                return 'green';
            case 'utilization':
                if (value >= 95) return 'red';
                if (value >= 85) return 'yellow';
                return 'green';
            default:
                return 'green';
        }
    }

    // Public API
    return {
        loadData,
        getData,
        getItems,
        getItemById,
        getCategories,
        getInterdependencyChains,
        getLeadingIndicators,
        getSummary,
        getLastUpdated,
        calculateAlertLevel,
        calculateAlertCounts,
        filterItems,
        sortItems,
        formatPrice,
        formatPercentChange,
        getColorCode
    };
})();
