const form = document.querySelector('form');
const statusMessage = document.getElementById('status');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!window.todoAuth.requireAuth()) {
        return;
    }

    const data = Object.fromEntries(new FormData(form));
    const submitButton = document.getElementById('submit');
    submitButton.disabled = true;
    statusMessage.textContent = '';
    statusMessage.className = '';

    try {
        const response = await window.todoAuth.fetchWithAuth('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Could not add the task (${response.status}).`);
        }
        form.reset();
        statusMessage.textContent = 'Task saved to the database successfully.';
        statusMessage.classList.add('status-success');
    } catch (error) {
        console.error('Error adding task:', error);
        statusMessage.textContent = 'Could not add the task. Please try again.';
        statusMessage.classList.add('status-error');
    } finally {
        submitButton.disabled = false;
    }
});
