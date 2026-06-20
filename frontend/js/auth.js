let currentMode = 'login'; // 'login' or 'signup'

function toggleAuth(mode) {
    currentMode = mode;
    document.getElementById('tab-login').classList.toggle('active', mode === 'login');
    document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
    
    document.getElementById('signup-fields').classList.toggle('hidden', mode === 'login');
    document.getElementById('auth-submit-btn').innerText = mode === 'login' ? 'Login' : 'Create Account';
}

// 1. Handle Standard Email/Password Submit
document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value;
    const role = document.getElementById('auth-role').value;

    const endpoint = currentMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = currentMode === 'login' ? { email, password } : { name, email, password, role };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (result.success) {
            saveSessionAndRedirect(result.token, result.user);
        } else {
            alert(result.message || 'Authentication failed');
        }
    } catch (error) {
        console.error("Auth Error:", error);
        alert("Server error occurred.");
    }
});

// 2. Handle Google Login Callback (Triggered automatically by Google SDK)
async function handleGoogleCredentialResponse(response) {
    try {
        const role = document.getElementById('auth-role').value; // In case they are signing up

        const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential, role })
        });

        const result = await res.json();

        if (result.success) {
            saveSessionAndRedirect(result.token, result.user);
        } else {
            alert(result.message || 'Google Auth failed');
        }
    } catch (error) {
        console.error("Google Auth Error:", error);
        alert("Server error occurred during Google Auth.");
    }
}

// Helper: Save JWT and redirect
function saveSessionAndRedirect(token, user) {
    localStorage.setItem('ib_token', token);
    localStorage.setItem('ib_user', JSON.stringify(user));
    
    alert(`Welcome, ${user.name}!`);
    
    // Redirect based on role
    if (user.role === 'Admin') window.location.href = '/admin-dashboard.html';
    else if (user.role === 'Company') window.location.href = '/company-dashboard.html';
    else window.location.href = '/index.html';
}