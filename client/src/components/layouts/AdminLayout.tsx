import { Navigate, Outlet, useNavigate } from 'react-router';
import Sidebar from '../Sidebar';
import useSession from '@/hooks/useSession';
import { useEffect } from 'react';

const AdminLayout = () => {
	const navigate = useNavigate();

	const session = useSession();

	useEffect(() => {
		if (!session.token) {
			navigate('/', {
				replace: true,
			});
			return;
		}
	}, [session.token, navigate]);

	return session.token ? (
		<>
			<main className="flex flex-1">
				<Sidebar />
				<Outlet />
			</main>
		</>
	) : (
		<Navigate to="/" replace />
	);
};

export default AdminLayout;
