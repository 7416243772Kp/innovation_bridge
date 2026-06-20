document.addEventListener('DOMContentLoaded', () => {
    fetchLeaderboards();
});

async function fetchLeaderboards() {
    const wrapper = document.getElementById('leaderboards-wrapper');

    try {
        const response = await fetch('/api/leaderboards');
        const result = await response.json();

        if (result.success) {
            wrapper.innerHTML = `
                <div class="leaderboard-column">
                    <h2>🏆 Highest Rated by AI</h2>
                    ${renderList(result.data.highestRated, 'aiScores.overall', ' / 100 Score')}
                </div>

                <div class="leaderboard-column">
                    <h2>💰 Most Funded</h2>
                    ${renderList(result.data.mostFunded, 'fundingRaised', ' Raised', '₹')}
                </div>

                <div class="leaderboard-column">
                    <h2>👁️ Most Viewed</h2>
                    ${renderList(result.data.mostViewed, 'viewCount', ' Views')}
                </div>
            `;
        }
    } catch (error) {
        console.error("Error fetching leaderboards:", error);
        wrapper.innerHTML = '<p style="color:red; text-align:center;">Failed to load leaderboards. Please try again later.</p>';
    }
}

function renderList(items, metricKey, suffix = '', prefix = '') {
    if (!items || items.length === 0) return '<p style="text-align:center; color:#666;">No data yet.</p>';

    return items.map((item, index) => {
        // Safely extract the metric value (handling nested keys like 'aiScores.overall')
        const metricValue = metricKey.includes('.') 
            ? metricKey.split('.').reduce((o, i) => o[i], item) 
            : item[metricKey];

        return `
            <div class="rank-item rank-${index + 1}" onclick="window.location.href='/innovation.html?id=${item._id}'">
                <div class="rank-number">#${index + 1}</div>
                <div class="rank-details">
                    <p class="rank-title">${item.aiTitle || item.originalTitle}</p>
                    <p class="rank-metric">${prefix}${metricValue || 0}${suffix} • ${item.category}</p>
                </div>
            </div>
        `;
    }).join('');
}