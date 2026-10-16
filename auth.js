(() => {
  const API_BASE_URL = 'http://localhost:3000';
  const TOKEN_KEY = 'todo_access_token';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function requireAuth() {
    if (getToken()) {
      return true;
    }

    window.location.replace('login.html');
    return false;
  }

  async function fetchWithAuth(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const token = getToken();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.replace('login.html');
    }

    return response;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    window.location.replace('login.html');
  }

  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', logout);
  });

  document.querySelectorAll('[data-auth-required]').forEach((page) => {
    if (!requireAuth()) {
      page.setAttribute('aria-hidden', 'true');
    }
  });

  window.todoAuth = {
    API_BASE_URL,
    fetchWithAuth,
    getToken,
    logout,
    requireAuth,
    setToken(token) {
      localStorage.setItem(TOKEN_KEY, token);
    },
  };
})();
