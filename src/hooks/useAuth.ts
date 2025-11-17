import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [isPiAuth, setIsPiAuth] = useState(false);
  const [piUser, setPiUser] = useState(null);

  const checkAuthStatus = () => {
    const savedUsername = localStorage.getItem('flappypi-username');
    const savedPassword = localStorage.getItem('flappypi-password');
    const piAuthStatus = localStorage.getItem('flappypi-pi-auth') === 'true';
    const savedPiUser = localStorage.getItem('flappypi-pi-user');

    if (piAuthStatus && savedPiUser) {
      // Pi authentication
      setIsAuthenticated(true);
      setIsPiAuth(true);
      setPiUser(JSON.parse(savedPiUser));
      setUsername(JSON.parse(savedPiUser).username);
      return true;
    } else if (savedUsername && savedPassword) {
      // Local authentication
      const existingUsers = JSON.parse(localStorage.getItem('flappypi-users') || '[]');
      const user = existingUsers.find((u: any) => u.username === savedUsername && u.password === savedPassword);
      
      if (user) {
        setIsAuthenticated(true);
        setIsPiAuth(false);
        setPiUser(null);
        setUsername(savedUsername);
        return true;
      }
    }

    // Not authenticated
    setIsAuthenticated(false);
    setIsPiAuth(false);
    setPiUser(null);
    setUsername('');
    return false;
  };

  const login = (newUsername: string, password: string) => {
    localStorage.setItem('flappypi-username', newUsername);
    localStorage.setItem('flappypi-password', password);
    checkAuthStatus();
  };

  const loginWithPi = (piUserData: any) => {
    localStorage.setItem('flappypi-username', piUserData.username);
    localStorage.setItem('flappypi-pi-user', JSON.stringify(piUserData));
    localStorage.setItem('flappypi-pi-auth', 'true');
    checkAuthStatus();
  };

  const logout = () => {
    localStorage.removeItem('flappypi-username');
    localStorage.removeItem('flappypi-password');
    localStorage.removeItem('flappypi-pi-user');
    localStorage.removeItem('flappypi-pi-auth');
    // DO NOT remove 'flappypi-users' here!
    setIsAuthenticated(false);
    setIsPiAuth(false);
    setPiUser(null);
    setUsername('');
  };

  // Check auth status on mount and when localStorage changes
  useEffect(() => {
    checkAuthStatus();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    isAuthenticated,
    username,
    isPiAuth,
    piUser,
    login,
    loginWithPi,
    logout,
    checkAuthStatus
  };
}; 