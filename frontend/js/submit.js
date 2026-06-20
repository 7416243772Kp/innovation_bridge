document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('submission-form');
    const loadingState = document.getElementById('loading-state');
    const successMessage = document.getElementById('success-message');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // UI Updates: Hide form, show loading
        form.classList.add('hidden');
        loadingState.classList.remove('hidden');

        // Package data for multipart/form-data upload
        const formData = new FormData(form);

        try {
            const response = await fetch('/api/innovations/submit', {
                method: 'POST',
                body: formData // Fetch automatically sets the correct boundaries for FormData
            });

            const result = await response.json();

            if (result.success) {
                // UI Updates: Hide loading, show success
                loadingState.classList.add('hidden');
                successMessage.classList.remove('hidden');
                console.log("AI Output Data:", result.data);
            } else {
                throw new Error(result.error || 'Submission failed');
            }

        } catch (error) {
            console.error("Submission Error:", error);
            alert("An error occurred during AI processing: " + error.message);
            
            // Reset UI
            loadingState.classList.add('hidden');
            form.classList.remove('hidden');
        }
    });
});