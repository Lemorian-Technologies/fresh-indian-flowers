'use client';
import { members } from '@wix/members';
import { createClient, OAuthStrategy } from '@wix/sdk';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

const myWixClient = createClient({
  modules: { members },
  auth: OAuthStrategy({
    clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID,
    tokens: JSON.parse(Cookies.get('session') || null)
  })
});

export default function LoginPage() {
  return <LoginBar />;
}

function LoginBar() {
  const [member, setMember] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        if (myWixClient.auth.loggedIn()) {
          const { member } = await myWixClient.members.getCurrentMember();
          setMember(member || undefined);
        }
      } catch (err) {
        setError('Failed to fetch member data');
        console.error(err);
      }
    };
    fetchMember();
  }, []);

  const login = async () => {
    try {
      const data = myWixClient.auth.generateOAuthData(
        `https://fa6f-49-204-234-214.ngrok-free.app/login-callback`
      );
      localStorage.setItem('oauthRedirectData', JSON.stringify(data));
      const { authUrl } = await myWixClient.auth.getAuthUrl(data);
      window.location.href = authUrl;
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    }
  };

  const logout = async () => {
    try {
      const { logoutUrl } = await myWixClient.auth.logout(window.location.href);
      Cookies.remove('session');
      window.location.href = logoutUrl;
    } catch (err) {
      setError('Logout failed. Please try again.');
      console.error(err);
    }
  };

  return (
    <div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {member !== null ? (
        <section onClick={() => (myWixClient.auth.loggedIn() ? logout() : login())}>
          <h3>
            Hello{' '}
            {myWixClient.auth.loggedIn()
              ? member.profile?.nickname || member.profile?.slug || 'visitor'
              : 'visitor'}
            ,
          </h3>
          <span>{myWixClient.auth.loggedIn() ? 'Logout' : 'Login'}</span>
        </section>
      ) : (
        <section>
          <h3>Welcome, please log in.</h3>
          <button onClick={login}>Login</button>
        </section>
      )}
    </div>
  );
}
