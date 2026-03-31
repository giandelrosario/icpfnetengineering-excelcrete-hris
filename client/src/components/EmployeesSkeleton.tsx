const SkeletonLoader = () => {
	return (
		<main className="bg-white min-h-screen w-full">
			<div className="max-w-6xl mx-auto p-4 space-y-4">
				{/* Header Skeleton */}
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
						<div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
					</div>
					<div className="h-10 w-40 bg-slate-200 rounded-lg animate-pulse"></div>
				</div>

				{/* Search Bar Skeleton */}
				<div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>

				{/* Table Skeleton */}
				<div className="space-y-4">
					<div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
						<table className="w-full text-left text-xs">
							<thead>
								<tr className="border-b border-slate-200 bg-slate-50">
									<th className="px-6 py-3 font-semibold text-slate-700">Name</th>
									<th className="px-6 py-3 font-semibold text-slate-700 text-center">SSS</th>
									<th className="px-6 py-3 font-semibold text-slate-700 text-center">PhilHealth</th>
									<th className="px-6 py-3 font-semibold text-slate-700 text-center">Pag-IBIG</th>
									<th className="px-6 py-3 font-semibold text-slate-700"></th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200">
								{Array.from({ length: 10 }).map((_, index) => (
									<tr key={index} className="hover:bg-slate-50 transition">
										<td className="px-6 py-2">
											<div className="h-4 w-40 bg-slate-200 rounded animate-pulse"></div>
										</td>
										<td className="px-6 py-2 text-center">
											<div className="h-4 w-8 bg-slate-200 rounded animate-pulse mx-auto"></div>
										</td>
										<td className="px-6 py-2 text-center">
											<div className="h-4 w-8 bg-slate-200 rounded animate-pulse mx-auto"></div>
										</td>
										<td className="px-6 py-2 text-center">
											<div className="h-4 w-8 bg-slate-200 rounded animate-pulse mx-auto"></div>
										</td>
										<td className="px-6 py-2">
											<div className="flex gap-2">
												<div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
												<div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination Skeleton */}
					<div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-6 py-2">
						<div className="h-4 w-40 bg-slate-200 rounded animate-pulse"></div>
						<div className="flex items-center gap-2">
							<div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
							<div className="flex items-center gap-1">
								{Array.from({ length: 5 }).map((_, i) => (
									<div key={i} className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
								))}
							</div>
							<div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default SkeletonLoader;
