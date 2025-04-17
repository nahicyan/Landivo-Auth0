// client/src/utils/apiInterceptor.js
import { api } from './api';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState, useCallback } from 'react';

/**
 * Hook to set up axios interceptors that automatically add the Auth0 token
 * to all outgoing requests to the API
 */
export function useApiAuthInterceptor() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [cachedToken, setCachedToken] = useState(null);
  const [lastTokenFetch, setLastTokenFetch] = useState(0);
  const TOKEN_TTL = 5 * 60 * 1000; // 5 minutes
  
  const getTokenCached = useCallback(async () => {
    const now = Date.now();
    if (!cachedToken || now - lastTokenFetch > TOKEN_TTL) {
      try {
        const token = await getAccessTokenSilently();
        setCachedToken(token);
        setLastTokenFetch(now);
        return token;
      } catch (error) {
        console.error('Error refreshing token:', error);
        return cachedToken;
      }
    }
    return cachedToken;
  }, [getAccessTokenSilently, cachedToken, lastTokenFetch]);
  
  useEffect(() => {
    const interceptorId = api.interceptors.request.use(
      async (config) => {
        if (isAuthenticated) {
          try {
            const token = await getTokenCached();
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
              
              // Reduce logging
              if (!config.url?.includes('/user/profile')) {
                console.log(`Added auth token to request: ${config.url}`);
              }
            }
          } catch (error) {
            console.error('Error getting access token:', error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    return () => {
      api.interceptors.request.eject(interceptorId);
    };
  }, [getTokenCached, isAuthenticated]);
}