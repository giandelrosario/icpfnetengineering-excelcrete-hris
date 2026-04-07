import useSession from '@/hooks/useSession';
import { HandCoins, LayoutDashboard, LogOut, PanelRightClose, Table, Tickets } from 'lucide-react';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import Dialog from './Dialog';

const filtered_links = [
	{
		id: 1,
		name: 'Employees',
		href: '/dashboard/employees',
		icon: <LayoutDashboard size={16} />,
	},
	{
		id: 2,
		name: 'Payroll',
		href: '/dashboard/payroll',
		icon: <Tickets size={16} />,
	},
	{
		id: 3,
		name: 'Benefits',
		href: '/dashboard/benefits',
		icon: <HandCoins size={16} />,
	},
];

const Sidebar = () => {
	const location = useLocation();

	const [open, setOpen] = React.useState(true);

	const [logOutModalOpen, setLogOutModalOpen] = React.useState(false);

	const session = useSession();

	const navigate = useNavigate();

	const logOut = () => {
		session.clearToken();
		navigate('/', {
			replace: true,
		});
	};

	return (
		<div className="hidden lg:flex flex-row relative">
			{open ? (
				<div>
					{/* links */}
					<div className="flex flex-col w-52 px-4 py-2 h-full overflow-y-auto bg-white border-r border-r-slate-100">
						<div className="flex flex-col justify-between flex-1 mt-6">
							<div className="space-y-2">
								{filtered_links.map((link) => (
									<div key={link.id}>
										<Link
											to={link.href}
											className={`w-full flex items-center px-4 py-2 text-slate-500 rounded-md hover:bg-gray-50 ${location.pathname === link.href ? 'bg-gray-50 text-slate-700' : ''}`}
										>
											{link.icon}
											<span className="ml-2 text-sm font-medium">{link.name}</span>
										</Link>
									</div>
								))}

								<div>
									<button
										onClick={() => setLogOutModalOpen(true)}
										className={`w-full flex items-center px-4 py-2 text-slate-500 rounded-md hover:bg-gray-50 ${location.pathname === '/dashboard/settings' ? 'bg-gray-50 text-slate-700' : ''}`}
									>
										<LogOut size={16} />
										<span className="ml-2 text-sm font-medium">Log out</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			) : (
				<>
					<div className="flex flex-col w-20 px-4 py-2 overflow-y-auto bg-white border-r border-r-slate-100">
						<div className="flex flex-col justify-start space-y-3 flex-1 mt-6">
							{filtered_links.map((link) => (
								<Link to={link.href} key={link.id} className="w-full flex items-center justify-center px-2 py-2 text-slate-500 rounded-md hover:bg-gray-100">
									{link.icon}
								</Link>
							))}
						</div>
						<div className="p-1.5 absolute top-5 -right-3 z-10 bg-white rounded-full border border-slate-100 cursor-pointer" onClick={() => setOpen((prev) => !prev)}>
							<PanelRightClose size={13} className="block text-slate-300" />
						</div>
					</div>
				</>
			)}

			<Dialog
				isOpen={logOutModalOpen}
				icon={<LogOut size={30} className="text-rose-500" />}
				content={{
					title: 'Log out',
					message: 'Are you sure you want to log out?',
				}}
			>
				<div className="flex flex-col items-center justify-center w-full">
					<button onClick={logOut} className={`mt-2 text-xs font-semibold w-full px-5 py-3 text-white bg-rose-500 rounded-lg hover:bg-rose-600`}>
						Log out
					</button>
					<button onClick={() => setLogOutModalOpen(false)} className={`mt-2 text-xs font-semibold w-full px-5 py-3 text-slate-900 rounded-lg hover:bg-slate-50`}>
						Cancel
					</button>
				</div>
			</Dialog>
		</div>
	);
};

export default Sidebar;
