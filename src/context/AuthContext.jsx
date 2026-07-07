import { createContext, useContext, useState, useEffect } from 'react';
import { 
  loginUser as apiLogin, 
  registerUser as apiRegister, 
  getMyProfile, 
  refreshSession,
  setTokenRefreshedCallback,
  setLogoutTriggeredCallback,
  logoutSession
} from '../api/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync callbacks from the api interceptor to the react state
  useEffect(() => {
    setTokenRefreshedCallback((newToken, newUser) => {
      setToken(newToken);
      setUser(newUser);
    });
    setLogoutTriggeredCallback(() => {
      logout();
    });
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const savedRefreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (savedRefreshToken) {
        try {
          const refreshData = await refreshSession(savedRefreshToken);
          
          const isLocal = !!localStorage.getItem('refreshToken');
          if (isLocal) {
            localStorage.setItem('token', refreshData.token);
            localStorage.setItem('refreshToken', refreshData.refreshToken);
            localStorage.setItem('user', JSON.stringify(refreshData.user));
          } else {
            sessionStorage.setItem('token', refreshData.token);
            sessionStorage.setItem('refreshToken', refreshData.refreshToken);
            sessionStorage.setItem('user', JSON.stringify(refreshData.user));
          }
          
          setToken(refreshData.token);
          setUser(refreshData.user);
        } catch (error) {
          console.error('Session restore via refresh token failed:', error);
          logout();
        }
      } else if (savedToken) {
        try {
          const freshUser = await getMyProfile(savedToken);
          setToken(savedToken);
          setUser(freshUser);
        } catch (error) {
          console.error('Session restore via access token failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const data = await apiLogin(email, password); // returns { message, token, refreshToken, user }
    
    const fullUser = await getMyProfile(data.token);

    setToken(data.token);
    setUser(fullUser);

    if (rememberMe) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(fullUser));
      
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
    } else {
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('refreshToken', data.refreshToken);
      sessionStorage.setItem('user', JSON.stringify(fullUser));
      
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }

    return fullUser;
  };

  const register = async (username, name, email, password) => {
    const data = await apiRegister(username, name, email, password);
    return data;
  };

  const logout = () => {
    const savedRefreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    if (savedRefreshToken) {
      logoutSession(savedRefreshToken).catch(err => console.error('Error logging out from server:', err));
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
  };

  const updateUserLocalState = (updatedUser) => {
    setUser(updatedUser);
    const isLocal = !!localStorage.getItem('user');
    if (isLocal) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    updateUserLocalState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
