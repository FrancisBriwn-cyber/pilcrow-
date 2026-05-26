import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import LoadingSpinner from '../components/LoadingSpinner';

// Handles the redirect from the backend after Google OAuth completes.
// The backend sends ?token=<jwt> and we store it then redirect to the feed.
export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        login(token, { id: decoded.id, name: decoded.name, email: decoded.email, avatar_url: decoded.avatar_url });
        navigate('/', { replace: true });
      } catch {
        navigate('/login?error=oauth_failed', { replace: true });
      }
    } else {
      navigate('/login?error=oauth_failed', { replace: true });
    }
  }, []);

  return <LoadingSpinner message="Finishing sign-in…" />;
}
