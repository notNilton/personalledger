export const AUTH_TOKEN_KEY = 'auth_token';

export const auth = {
  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
  setToken: (token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    // Redireciona para o login forçando um reload para limpar estados em memória
    window.location.href = '/login';
  },
  isAuthenticated: () => {
    return !!auth.getToken();
  },
};
