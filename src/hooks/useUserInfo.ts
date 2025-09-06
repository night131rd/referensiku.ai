import { useState, useEffect } from 'react';

export interface UserInfo {
  role: 'guest' | 'free' | 'premium';
  isAuthenticated: boolean;
  userId?: string;
}

export function useUserInfo() {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    role: 'guest',
    isAuthenticated: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/user/info');
        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }
        const data = await response.json();
        setUserInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Keep default guest role on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return { userInfo, loading, error };
}
