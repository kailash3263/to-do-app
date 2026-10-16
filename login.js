const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSwitch = document.getElementById('authSwitch');
const authSwitchText = document.getElementById('authSwitchText');
const authStatus = document.getElementById('status');
const authSubmit = document.getElementById('submit');
const passwordInput = document.getElementById('password');
let isRegistering = false;

if (window.todoAuth.getToken()) {
  window.location.replace('index.html');
}

authSwitch.addEventListener('click', () => {
  isRegistering = !isRegistering;
  authTitle.textContent = isRegistering ? 'Create your account' : 'Welcome back';
  authSubmit.textContent = isRegistering ? 'Create account' : 'Sign in';
  authSwitchText.textContent = isRegistering ? 'Already have an account?' : 'New here?';
  authSwitch.textContent = isRegistering ? 'Sign in' : 'Create an account';
  passwordInput.autocomplete = isRegistering ? 'new-password' : 'current-password';
  passwordInput.minLength = isRegistering ? 8 : 0;
  authStatus.textContent = '';
  authStatus.classList.remove('status-error');
});

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  authSubmit.disabled = true;
  authStatus.textContent = '';
  authStatus.classList.remove('status-error');

  const credentials = Object.fromEntries(new FormData(authForm));

  try {
    const endpoint = isRegistering ? '/auth/register' : '/auth/login';
    const response = await fetch(`${window.todoAuth.API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Authentication failed. Please try again.');
    }
    if (typeof result.token !== 'string' || !result.token) {
      throw new Error('The server did not return an access token.');
    }

    window.todoAuth.setToken(result.token);
    window.location.replace('index.html');
  } catch (error) {
    console.error('Authentication failed:', error);
    authStatus.textContent = error.message || 'Could not connect to the server.';
    authStatus.classList.add('status-error');
    authSubmit.disabled = false;
  }
});
