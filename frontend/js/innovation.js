document.addEventListener('DOMContentLoaded', () => {
    // Get the ID from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const innovationId = urlParams.get('id');

    if (!innovationId) {
        document.getElementById('detail-container').innerHTML = '<h2>Error: No Innovation ID provided.</h2>';
        return;
    }

    fetchInnovationDetails(innovationId);
});

async function fetchInnovationDetails(id) {
    const container = document.getElementById('detail-container');

    try {
        const response = await fetch(`/api/innovations/${id}`);
        const result = await response.json();

        if (result.success) {
            const data = result.data;
            renderInnovation(container, data);
        } else {
            container.innerHTML = `<h2>Innovation not found.</h2>`;
}

// --- RAZORPAY FUNDING SYSTEM LOGIC ---
let chosenAmount = 500; // Default tier

function openFundingModal() {
    document.getElementById('funding-modal').style.display = 'flex';
}

function selectTier(amt) {
    chosenAmount = amt;
    document.getElementById('custom-funding').value = '';
    alert(`Selected Tier: ₹${amt}`);
}

function clearPresetTier() {
    chosenAmount = document.getElementById('custom-funding').value;
}

async function initiateRazorpay() {
    const finalAmount = parseInt(chosenAmount || document.getElementById('custom-funding').value);
    const funderName = document.getElementById('funder-name').value.trim();
    const funderEmail = document.getElementById('funder-email').value.trim();

    const urlParams = new URLSearchParams(window.location.search);
    const innovationId = urlParams.get('id');

    if (!finalAmount || finalAmount < 10) return alert("Please select a valid funding amount.");
    if (!funderName || !funderEmail) return alert("Please provide your name and email.");

    try {
        // Step 1: Tell our Node backend to generate an official Razorpay Order
        const orderRes = await fetch('/api/funding/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: finalAmount, innovationId, funderName, funderEmail })
        });
        const orderData = await orderRes.json();

        if (!orderData.success) throw new Error(orderData.error);

        // Step 2: Configure the Razorpay Overlay Window
        const options = {
            key: "rzp_test_your_key_here", // Pass your public key ID here
            amount: orderData.amount,
            currency: "INR",
            name: "InnovationBridge AI",
            description: "Innovation Backing Escrow",
            order_id: orderData.orderId,
            
            // Step 3: Handle the payment success token
            handler: async function (response) {
                const verifyRes = await fetch('/api/funding/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        innovationId: innovationId
                    })
                });

                const verifyResult = await verifyRes.json();
                if (verifyResult.success) {
                    alert("Payment Successful! Thank you for backing Indian Innovation.");
                    window.location.reload(); // Reload page to update the live ₹ total!
                } else {
                    alert("Payment verification failed.");
                }
            },
            prefill: { name: funderName, email: funderEmail },
            theme: { color: "#0056b3" }
        };

        const rzpOverlay = new Razorpay(options);
        rzpOverlay.open();

    } catch (err) {
        console.error("Payment setup failed:", err);
        alert("Unable to initialize Razorpay checkout: " + err.message);
    }
}

    } catch (error) {
        console.error("Error fetching details:", error);
        container.innerHTML = `<h2>Error loading data.</h2>`;
    }
}

function renderInnovation(container, data) {
    // Generate the HTML based on the AI data
    container.innerHTML = `
        <div class="detail-header">
            <span class="badge">Stage ${data.readinessLevel}: ${getReadinessText(data.readinessLevel)}</span>
            <h1>${data.aiTitle || data.originalTitle}</h1>
            <p>Category: <strong>${data.category}</strong> | Views: ${data.viewCount}</p>
        </div>

        <div class="grid-2-col">
            <div class="main-content">
                <div class="media-gallery">
                    ${data.images.length > 0 ? `<img src="${data.images[0]}" alt="Innovation Image">` : '<div style="background:#ddd; height:200px; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-bottom:1rem;">No Image Provided</div>'}
                </div>

                <h3>Executive Summary</h3>
                <p>${data.aiSummary || data.originalDescription}</p>

                <h3>Technical Description</h3>
                <p>${data.aiTechnicalDescription || 'N/A'}</p>

                <h3>Key Benefits</h3>
                <p>${data.aiBenefits || 'N/A'}</p>
            </div>

            <div class="sidebar">
                <div class="action-card">
                    <h3>AI Validation Scores</h3>
                    <div class="score-item"><span>Overall Rating</span> <strong>${data.aiScores?.overall || 0}/100</strong></div>
                    <div class="score-item"><span>Novelty</span> <strong>${data.aiScores?.novelty || 0}</strong></div>
                    <div class="score-item"><span>Impact</span> <strong>${data.aiScores?.impact || 0}</strong></div>
                    <div class="score-item"><span>Scalability</span> <strong>${data.aiScores?.scalability || 0}</strong></div>
                    <div class="score-item"><span>Sustainability</span> <strong>${data.aiScores?.sustainability || 0}</strong></div>
                    <div class="score-item"><span>Feasibility</span> <strong>${data.aiScores?.feasibility || 0}</strong></div>
                    
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #eee;">
                        <div class="score-item"><span>Similarity Check</span> <strong>${data.similarityScore || 0}% Similar</strong></div>
                    </div>
                </div>

                <div class="action-card">
                    <h3>Funding Progress</h3>
                    <h2>₹${data.fundingRaised || 0} Raised</h2>
                    <button class="primary-btn" style="width: 100%; margin-top: 1rem;" onclick="openFundingModal()">Support This Innovation</button>
                </div>

                <div class="action-card">
                    <h3>Innovator</h3>
                    <p><strong>${data.innovator?.name || 'Anonymous User'}</strong></p>
                    <button style="width: 100%; background: #333;" onclick="alert('Contact details: ${data.innovator?.email || 'N/A'}')">Contact Innovator</button>
                </div>
            </div>
        </div>
    `;
}

function getReadinessText(level) {
    const levels = {
        1: "Idea Stage",
        2: "Proof of Concept",
        3: "Prototype Developed",
        4: "Field Tested",
        5: "Commercial Ready"
    };
    return levels[level] || "Unknown";
}