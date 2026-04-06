import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import useSession from '@/hooks/useSession';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const useAxios = () => {
	const session = useSession();

	const axiosInstance = axios.create({
		baseURL: `${BASE_URL}/api`,
		headers: { Authorization: `Bearer ${session?.token?.access_token}` },
	});

	axiosInstance.interceptors.request.use(async (req) => {
		if (!session?.token?.access_token) return req;

		const user = jwtDecode(session?.token?.access_token);
		const isExpired = dayjs.unix(user.exp as number).diff(dayjs()) < 1;

		if (!isExpired) return req;

		const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
			token: session?.token?.refresh_token,
		});

		session.updateToken(response.data);

		req.headers.Authorization = `Bearer ${response.data?.access_token}`;
		return req;
	});

	return axiosInstance;
};

export default useAxios;
