document.addEventListener('DOMContentLoaded', () => {
    const industrySelect = document.getElementById('industry-select');
    const refreshBtn = document.getElementById('refresh-matches');

    // Load initial matches for default selected industry
    loadMatches(industrySelect.value);

    refreshBtn.addEventListener('click', () => {
        loadMatches(industrySelect.value);
    });

    industrySelect.addEventListener('change', () => {
        loadMatches(industrySelect.value);
    });
});

async function loadMatches(industry) {
    const resultsGrid = document.getElementById('match-results');
    resultsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center;">Analyzing AI Readiness scores for ${industry}...</p>`;

    try {
        const response = await fetch(`/api/companies/matches?industry=${encodeURIComponent(industry)}`);
        const result = await response.json();

        if (result.success) {
            resultsGrid.innerHTML = '';

            if (result.data.length === 0) {
                resultsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center;">No active innovations found in the ${industry} sector right now.</p>`;
                return;
            }

            result.data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'innovation-card';
                card.innerHTML = `
                    <span style="background:#28a745; color:white; padding:2px 6px; border-radius:4px; font-size:0.8rem;">Level ${item.readinessLevel} Readiness</span>
                    <h3 style="margin-top:0.5rem;">${item.aiTitle || item.originalTitle}</h3>
                    <p style="font-size: 0.9rem; color: #555;">${item.aiSummary ? item.aiSummary.substring(0, 100) + '...' : 'No summary available.'}</p>
                    <p><strong>AI Score: ${item.aiScores?.overall || 0}/100</strong></p>
                    <button class="primary-btn" onclick="initiateContact('${item._id}', '${item.originalTitle}')">Contact Innovator</button>
                `;
                resultsGrid.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Failed to load matches:", error);
        resultsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:red;">Error loading sector matches.</p>`;
    }
}

async function initiateContact(innovationId, title) {
    // Mocking the logged-in company name
    const companyName = "ABC Agriculture Pvt Ltd";

    try {
        const response = await fetch('/api/companies/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                innovationId,
                companyName,
                actionType: 'contact'
            })
        });

        const result = await response.json();

        if (result.success) {
            // Populate and show modal
            const infoDiv = document.getElementById('contact-info');
            infoDiv.innerHTML = `
                <p><strong>Email:</strong> ${result.contactDetails.email}</p>
                <p><strong>Phone:</strong> ${result.contactDetails.phone}</p>
                <p><strong>LinkedIn:</strong> <a href="${result.contactDetails.linkedin}" target="_blank">View Profile</a></p>
            `;
            document.getElementById('contact-modal').style.display = 'flex';
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Contact error:", error);
        alert("Failed to initiate contact.");
    }
}