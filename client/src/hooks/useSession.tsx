import React from 'react';

const useSession = () => {
	const [token, setToken] = React.useState(JSON.parse(sessionStorage.getItem('auth_token') as string) as { access_token: string; refresh_token: string } | null);

	const saveToken = (newToken: { access_token: string; refresh_token: string }) => {
		sessionStorage.setItem('auth_token', JSON.stringify(newToken));
		setToken(newToken);
	};

	const updateToken = (newToken: { access_token: string; refresh_token: string }) => {
		sessionStorage.setItem('auth_token', JSON.stringify(newToken));
		setToken(newToken);
	};

	const clearToken = () => {
		sessionStorage.removeItem('auth_token');
		setToken(null);
	};

	return { token, saveToken, updateToken, clearToken };
};

export default useSession;
