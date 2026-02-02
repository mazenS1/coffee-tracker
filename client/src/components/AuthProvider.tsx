import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setAuthTokenGetter } from '../api/client';

/**
 * AuthProvider component that connects Clerk's auth to the API client.
 * This component should wrap the app content inside ClerkProvider.
 * 
 * It sets up the getToken function so all API requests automatically
 * include the Bearer token for authenticated users.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set the token getter for the API client
    setAuthTokenGetter(getToken);
  }, [getToken]);

  return <>{children}</>;
}
