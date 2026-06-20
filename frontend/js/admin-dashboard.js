document.addEventListener('DOMContentLoaded', () => {
    fetchStats();
    fetchPendingUsers();
    fetchFlaggedProjects();
});

// --- Tab Navigation ---
function switchTab(tabName) {
    document.querySelectorAll('.admin-content section').forEach(sec => sec.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    event.currentTarget.classList.add('active');
}

// --- Data Fetching ---
async function fetchStats() {
    try {
        const res = await fetch('/api/admin/dashboard-stats');
        const result = await res.json();
        if (result.success) {
            document.getElementById('stat-users').innerText = result.data.totalUsers;
            document.getElementById('stat-pending').innerText = result.data.pendingUsers;
            document.getElementById('stat-innovations').innerText = result.data.totalInnovations;
            document.getElementById('stat-flagged').innerText = result.data.flaggedInnovations;
        }
    } catch (error) {
        console.error("Failed to load stats", error);
    }
}

async function fetchPendingUsers() {
    const tbody = document.getElementById('verifications-table-body');
    try {
        const res = await fetch('/api/admin/pending-users');
        const result = await res.json();
        
        if (result.success) {
            tbody.innerHTML = result.data.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span style="background:#0056b3; color:white; padding:3px 6px; border-radius:4px; font-size:0.8rem;">${user.role}</span></td>
                    <td>
                        <button class="action-btn btn-success" onclick="verifyUser('${user._id}')">Verify</button>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="4" style="text-align:center;">No pending verifications.</td></tr>';
        }
    } catch (error) {
        console.error("Failed to load pending users", error);
    }
}

async function fetchFlaggedProjects() {
    const tbody = document.getElementById('moderation-table-body');
    try {
        const res = await fetch('/api/admin/flagged-innovations');
        const result = await res.json();
        
        if (result.success) {
            tbody.innerHTML = result.data.map(project => `
                <tr>
                    <td><strong>${project.originalTitle}</strong></td>
                    <td>${project.innovator ? project.innovator.name : 'Unknown'}</td>
                    <td><span style="color:${project.aiScores?.overall < 40 ? 'red' : 'black'}">${project.aiScores?.overall || 0}/100</span></td>
                    <td><span style="color:${project.similarityScore > 85 ? 'red' : 'black'}">${project.similarityScore || 0}% Similar</span></td>
                    <td>
                        <button class="action-btn btn-warning" onclick="window.open('/innovation.html?id=${project._id}', '_blank')">Review</button>
                        <button class="action-btn btn-danger" onclick="moderateProject('${project._id}', 'remove')">Remove Spam</button>
                        <button class="action-btn btn-success" onclick="moderateProject('${project._id}', 'approve')">Approve</button>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="5" style="text-align:center;">No flagged projects currently.</td></tr>';
        }
    } catch (error) {
        console.error("Failed to load flagged projects", error);
    }
}

// --- Admin Actions ---
async function verifyUser(userId) {
    if(!confirm("Are you sure you want to verify this user?")) return;
    try {
        const res = await fetch(`/api/admin/verify-user/${userId}`, { method: 'PUT' });
        const result = await res.json();
        if (result.success) {
            alert("User verified!");
            fetchPendingUsers(); // Refresh list
            fetchStats();
        }
    } catch (error) {
        alert("Action failed.");
    }
}

async function moderateProject(projectId, action) {
    const actionText = action === 'remove' ? "mark as spam and archive" : "approve and remove flags from";
    if(!confirm(`Are you sure you want to ${actionText} this project?`)) return;
    
    try {
        const res = await fetch(`/api/admin/moderate-innovation/${projectId}`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        const result = await res.json();
        if (result.success) {
            alert(`Project ${action}d!`);
            fetchFlaggedProjects(); // Refresh list
            fetchStats();
        }
    } catch (error) {
        alert("Action failed.");
    }
}