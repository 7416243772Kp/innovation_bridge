document.addEventListener('DOMContentLoaded', () => {
    console.log("InnovationBridge App Initialized");



    // Button Listeners
    document.getElementById('upload-btn').addEventListener('click', () => {
        alert("Redirecting to Innovation Submission Flow...");
        // window.location.href = '/submit.html'; 
    });

    document.getElementById('companies-btn').addEventListener('click', () => {
        window.location.href = '/company-dashboard.html';
    });

    document.getElementById('explore-btn').addEventListener('click', () => {
        window.location.href = '/explore.html';
    });


    // Fetch and display innovations
    fetchInnovations();
});

async function fetchInnovations() {
    const grid = document.getElementById('featured-innovations');
    grid.innerHTML = '<p>Loading latest innovations via AI...</p>';

    try {
        const response = await fetch('/api/innovations');
        const result = await response.json();

        if (result.success) {
            grid.innerHTML = ''; // Clear loading text
            
            if (result.data.length === 0) {
                grid.innerHTML = '<p>No innovations found. Be the first to upload!</p>';
                return;
            }

            result.data.forEach(innovation => {
                // Generate star rating based on overall score
                const stars = getStars(innovation.aiScores?.overall || 0);

                const card = document.createElement('div');
                card.className = 'innovation-card';
                card.innerHTML = `
                    <h3>${innovation.aiTitle || innovation.originalTitle}</h3>
                    <p class="category">${innovation.category || 'Uncategorized'}</p>
                    <p class="rating">AI Rating: ${stars} (${innovation.aiScores?.overall || 0}/100)</p>
                    <p class="readiness">Readiness Level: Stage ${innovation.readinessLevel || 'N/A'}</p>
                    <p class="funding">Funding Raised: ₹${innovation.fundingRaised || 0}</p>
                    <button onclick="viewDetails('${innovation._id}')">View Details</button>
                `;
                grid.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Error fetching innovations:", error);
        grid.innerHTML = '<p>Error loading innovations. Please try again later.</p>';
    }
}

function getStars(score) {
    if (score >= 90) return '⭐⭐⭐⭐⭐';
    if (score >= 70) return '⭐⭐⭐⭐';
    if (score >= 50) return '⭐⭐⭐';
    if (score >= 30) return '⭐⭐';
    return '⭐';
}

function viewDetails(id) {
    console.log("View details for:", id);
    window.location.href = `/innovation.html?id=${id}`;
}