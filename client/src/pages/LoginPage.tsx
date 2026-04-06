import { useMutation } from '@tanstack/react-query';
import api from '@/config/api';
import useSession from '@/hooks/useSession';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';

const LoginPage = () => {
	const session = useSession();

	const navigate = useNavigate();

	const [showErrorModal, setShowErrorModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState('Something went wrong. Please try again later.');

	const login_mutation = useMutation({
		mutationFn: async (password: string) => {
			const response = await api.post('/auth/login', { password });
			return response.data;
		},
		onSuccess: (data) => {
			session.saveToken(data);
			navigate('/dashboard/employees', {
				replace: true,
			});
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				console.error('Login failed:', error.response?.data || error.message);
				setErrorMessage(error.response?.data?.message || 'Login failed. Please try again.');
				setShowErrorModal(true);
			} else {
				console.error('An unexpected error occurred:', error);
				setErrorMessage('An unexpected error occurred. Please try again.');
				setShowErrorModal(true);
			}
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const password = formData.get('password') as string;
		login_mutation.mutate(password);
	};

	useEffect(() => {
		if (session?.token) {
			navigate('/dashboard/employees', { replace: true });
			return;
		}
	}, [session?.token, navigate]);

	return (
		<main className="min-h-screen bg-slate-50 text-slate-900">
			<div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-12">
				<div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
					<div className="mb-6 flex items-center justify-between">
						<div>
							<p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-slate-400">Admin Portal</p>
							<h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Sign in</h1>
						</div>
					</div>
					<p className="mb-6 text-sm text-slate-600">Enter the admin password to continue</p>
					<form className="space-y-5" onSubmit={handleSubmit}>
						<div className="flex flex-col space-y-2">
							<label className="text-sm font-medium text-slate-700" htmlFor="admin-password">
								Password
							</label>
							<input
								className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
								id="admin-password"
								name="password"
								autoComplete="current-password"
								placeholder="Enter admin password"
								required
								type="password"
							/>
						</div>
						<button
							className="h-11 w-full rounded-xl bg-slate-900 text-base font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-slate-500"
							type="submit"
						>
							Continue
						</button>
					</form>
					<p className="mt-6 text-xs uppercase tracking-[0.2em] text-slate-400">Secure internal use only</p>
				</div>
			</div>

			{showErrorModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
						<div className="mb-4 flex items-center gap-3">
							<XCircle className="h-6 w-6 text-red-600" />
							<h3 className="text-lg font-semibold text-slate-800">Error</h3>
						</div>
						<p className="text-sm text-slate-600">{errorMessage}</p>
						<button
							onClick={() => {
								setShowErrorModal(false);
								setErrorMessage('');
							}}
							className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
						>
							Close
						</button>
					</div>
				</div>
			)}
		</main>
	);
};

export default LoginPage;
