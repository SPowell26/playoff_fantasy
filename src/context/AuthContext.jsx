import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/api';

// Create the context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentCommissioner, setCurrentCommissioner] = useState(null);
  const [isMaster, setIsMaster] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check current authentication status from backend
   */
  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        setCurrentCommissioner(data.commissioner);
        setIsMaster(data.isMaster || false);
      } else {
        setIsAuthenticated(false);
        setCurrentCommissioner(null);
        setIsMaster(false);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setIsAuthenticated(false);
      setCurrentCommissioner(null);
      setIsMaster(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login commissioner
   * @param {string} email - Commissioner email
   * @param {string} password - Commissioner password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setCurrentCommissioner(data.commissioner);
        // Check both data.isMaster and data.commissioner.isMaster
        const masterStatus = data.isMaster || data.commissioner?.isMaster || false;
        setIsMaster(masterStatus);
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  };

  /**
   * Logout commissioner
   */
  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Always clear local state
    setIsAuthenticated(false);
    setCurrentCommissioner(null);
    setIsMaster(false);
  };

  /**
   * Check if current user is commissioner for a specific league
   * @param {string|number} leagueId - League ID to check
   * @returns {Promise<boolean>}
   */
  const checkCommissionerForLeague = async (leagueId) => {
    if (!isAuthenticated || !leagueId) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/check/${leagueId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // Master accounts always return true, or use the API response
        return data.isMaster || data.isCommissioner;
      }
    } catch (error) {
      console.error('Failed to check commissioner status:', error);
    }

    return false;
  };

  /**
   * Get commissioner status for current league context
   * This is a convenience method for components that need to know if the current user
   * is the commissioner for the league they're viewing
   * Master accounts have access to all leagues
   * @param {string|number} leagueId - League ID
   * @returns {boolean}
   */
  const isCommissionerForLeague = (leagueId) => {
    if (!isAuthenticated || !leagueId) {
      return false;
    }

    // Master accounts have access to all leagues
    if (isMaster) {
      return true;
    }

    // Regular commissioners need to match league_id
    if (!currentCommissioner) {
      return false;
    }

    return currentCommissioner.league_id == leagueId; // Use == for type coercion
  };

  const value = {
    isAuthenticated,
    currentCommissioner,
    isMaster,
    isLoading,
    login,
    logout,
    checkCommissionerForLeague,
    isCommissionerForLeague,
    refreshAuthStatus: checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
