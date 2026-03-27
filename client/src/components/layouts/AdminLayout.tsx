import React from 'react';
import { Outlet } from 'react-router';
import Sidebar from '../Sidebar';

const AdminLayout = () => {
	return (
		<>
			<main className="flex flex-1">
				<Sidebar />
				<Outlet />
			</main>
		</>
	);
};

export default AdminLayout;
