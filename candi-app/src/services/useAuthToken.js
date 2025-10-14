import { useEffect, useState } from 'react';
import { getValidAccessToken } from '../services/authService';

export function useAuthToken() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    async function load() {
      const validToken = await getValidAccessToken();
      setToken(validToken);
    }
    load();
  }, []);

  return token;
}