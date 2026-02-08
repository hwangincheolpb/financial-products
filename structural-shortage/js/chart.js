/**
 * Chart Manager Module
 * Chart.js를 사용한 차트 렌더링
 */

const ChartManager = (function() {
    let priceChart = null;
    let currentItemId = null;
    let currentPeriod = 30;

    // 차트 색상 설정
    const chartColors = {
        primary: '#58a6ff',
        secondary: '#8b949e',
        grid: '#30363d',
        positive: '#3fb950',
        negative: '#f85149',
        text: '#c9d1d9',
        background: 'rgba(88, 166, 255, 0.1)'
    };

    /**
     * 가격 차트 초기화
     */
    function initChart() {
        const ctx = document.getElementById('price-chart').getContext('2d');

        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '가격',
                    data: [],
                    borderColor: chartColors.primary,
                    backgroundColor: chartColors.background,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointBackgroundColor: chartColors.primary,
                    pointBorderColor: '#0d1117',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1c2128',
                        titleColor: chartColors.text,
                        bodyColor: chartColors.text,
                        borderColor: chartColors.grid,
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                const item = DataHandler.getItemById(currentItemId);
                                if (item && item.priceData) {
                                    return `${context.parsed.y.toLocaleString()} ${item.priceData.unit}`;
                                }
                                return context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: chartColors.grid,
                            drawBorder: false
                        },
                        ticks: {
                            color: chartColors.secondary,
                            font: {
                                family: "'JetBrains Mono', monospace",
                                size: 11
                            },
                            maxRotation: 0
                        }
                    },
                    y: {
                        grid: {
                            color: chartColors.grid,
                            drawBorder: false
                        },
                        ticks: {
                            color: chartColors.secondary,
                            font: {
                                family: "'JetBrains Mono', monospace",
                                size: 11
                            },
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                } else if (value >= 1000) {
                                    return (value / 1000).toFixed(1) + 'K';
                                }
                                return value;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * 기간에 따른 레이블 생성
     */
    function generateLabels(period) {
        const labels = [];
        const today = new Date();

        for (let i = period - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            if (period <= 30) {
                labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
            } else if (period <= 90) {
                if (i % 7 === 0) {
                    labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
                } else {
                    labels.push('');
                }
            } else {
                if (i % 30 === 0) {
                    labels.push(`${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`);
                } else {
                    labels.push('');
                }
            }
        }

        return labels;
    }

    /**
     * 히스토리 데이터를 기간에 맞게 보간
     */
    function interpolateData(history, targetLength) {
        if (!history || history.length === 0) return [];

        const result = [];
        const step = (history.length - 1) / (targetLength - 1);

        for (let i = 0; i < targetLength; i++) {
            const index = i * step;
            const lowerIndex = Math.floor(index);
            const upperIndex = Math.ceil(index);

            if (lowerIndex === upperIndex || upperIndex >= history.length) {
                result.push(history[lowerIndex]);
            } else {
                const fraction = index - lowerIndex;
                const interpolated = history[lowerIndex] + (history[upperIndex] - history[lowerIndex]) * fraction;
                result.push(Math.round(interpolated * 100) / 100);
            }
        }

        return result;
    }

    /**
     * 차트 업데이트
     */
    function updateChart(itemId) {
        currentItemId = itemId;
        const item = DataHandler.getItemById(itemId);

        if (!item || !item.priceData) {
            clearChart();
            return;
        }

        const labels = generateLabels(currentPeriod);
        const data = interpolateData(item.priceData.history, currentPeriod);

        // 색상 결정 (상승/하락)
        const firstValue = data[0];
        const lastValue = data[data.length - 1];
        const isUp = lastValue >= firstValue;

        const lineColor = isUp ? chartColors.negative : chartColors.positive;
        const bgColor = isUp
            ? 'rgba(248, 81, 73, 0.1)'
            : 'rgba(63, 185, 80, 0.1)';

        priceChart.data.labels = labels;
        priceChart.data.datasets[0].data = data;
        priceChart.data.datasets[0].borderColor = lineColor;
        priceChart.data.datasets[0].backgroundColor = bgColor;
        priceChart.data.datasets[0].pointBackgroundColor = lineColor;
        priceChart.update();

        // 정보 패널 업데이트
        updateChartInfo(item);
    }

    /**
     * 차트 정보 패널 업데이트
     */
    function updateChartInfo(item) {
        const priceData = item.priceData;

        // 현재 가격
        const currentPriceEl = document.getElementById('current-price');
        currentPriceEl.textContent = DataHandler.formatPrice(priceData.current, priceData.unit);

        // 변화율
        const changeEl = document.getElementById('price-change');
        const changeValue = item.priceYoY;
        changeEl.textContent = DataHandler.formatPercentChange(changeValue);
        changeEl.className = 'info-value ' + (changeValue >= 0 ? 'up' : 'down');

        // 추세
        const trendEl = document.getElementById('price-trend');
        const trendMap = {
            up: { text: '\u25B2 상승', class: 'up' },
            down: { text: '\u25BC 하락', class: 'down' },
            stable: { text: '\u25AC 보합', class: 'stable' }
        };
        const trend = trendMap[priceData.trend] || trendMap.stable;
        trendEl.textContent = trend.text;
        trendEl.className = 'info-value ' + trend.class;
    }

    /**
     * 차트 초기화 (데이터 없음)
     */
    function clearChart() {
        priceChart.data.labels = [];
        priceChart.data.datasets[0].data = [];
        priceChart.update();

        document.getElementById('current-price').textContent = '-';
        document.getElementById('price-change').textContent = '-';
        document.getElementById('price-change').className = 'info-value';
        document.getElementById('price-trend').textContent = '-';
        document.getElementById('price-trend').className = 'info-value';
    }

    /**
     * 기간 설정
     */
    function setPeriod(period) {
        currentPeriod = period;
        if (currentItemId) {
            updateChart(currentItemId);
        }
    }

    /**
     * 초기화
     */
    function init() {
        initChart();
    }

    // Public API
    return {
        init,
        updateChart,
        setPeriod,
        clearChart
    };
})();
