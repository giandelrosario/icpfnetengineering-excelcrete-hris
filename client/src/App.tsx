import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Login from './pages/Login';
import Employees from './pages/Employees';
import CreateEmployee from './pages/CreateEmployee';
import AdminLayout from './components/layouts/AdminLayout';
import Employee from '@/pages/Employee';

const queryClient = new QueryClient();

const router = createBrowserRouter([
	{
		path: '/',
		element: <Login />,
	},
	{
		path: '/dashboard',
		element: <AdminLayout />,
		children: [
			{
				path: 'employees',
				children: [
					{
						index: true,
						element: <Employees />,
					},
					{
						path: ':id',
						element: <Employee />,
					},
					{
						path: 'create',
						element: <CreateEmployee />,
					},
				],
			},
		],
	},
	{},
]);

const App = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	);
};

export default App;
