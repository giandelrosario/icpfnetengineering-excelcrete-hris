const EmployeeSkeleton = () => {
	return (
		<main className="bg-white min-h-screen w-full pb-12">
			<div className="container mx-auto px-4 py-8">
				{/* Personal Information Skeleton */}
				<div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
					<div className="flex justify-between items-center gap-2 bg-white px-6 py-4 border-b border-slate-200">
						<div className="flex items-center gap-2">
							<div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
							<div className="h-5 w-40 bg-slate-200 rounded animate-pulse"></div>
						</div>
						<div className="h-9 w-20 bg-slate-200 rounded animate-pulse"></div>
					</div>
					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
									<div className="w-5 h-5 bg-slate-200 rounded animate-pulse shrink-0"></div>
									<div className="flex-1 min-w-0 space-y-2">
										<div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
										<div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Contact Information Skeleton */}
				<div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
					<div className="flex justify-between items-center gap-2 bg-white px-6 py-4 border-b border-slate-200">
						<div className="flex items-center gap-2">
							<div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
							<div className="h-5 w-40 bg-slate-200 rounded animate-pulse"></div>
						</div>
						<div className="h-9 w-20 bg-slate-200 rounded animate-pulse"></div>
					</div>
					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{Array.from({ length: 2 }).map((_, i) => (
								<div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
									<div className="w-5 h-5 bg-slate-200 rounded animate-pulse shrink-0"></div>
									<div className="flex-1 min-w-0 space-y-2">
										<div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
										<div className="h-4 w-40 bg-slate-200 rounded animate-pulse"></div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Current Salary Skeleton */}
				<div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
					<div className="flex justify-between items-center gap-2 bg-white px-6 py-4 border-b border-slate-200">
						<div className="flex items-center gap-2">
							<div className="h-5 w-8 bg-slate-200 rounded animate-pulse"></div>
							<div className="h-5 w-40 bg-slate-200 rounded animate-pulse"></div>
						</div>
						<div className="h-9 w-32 bg-slate-200 rounded animate-pulse"></div>
					</div>
					<div className="p-6">
						<div className="flex items-center justify-between">
							<div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
							<div className="h-8 w-40 bg-slate-200 rounded animate-pulse"></div>
						</div>
					</div>
				</div>

				{/* Family Members Section Skeleton */}
				<div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
					<div className="flex justify-between items-center gap-2 bg-white px-6 py-4 border-b border-slate-200">
						<div className="flex items-center gap-2">
							<div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
							<div className="h-5 w-40 bg-slate-200 rounded animate-pulse"></div>
						</div>
						<div className="h-9 w-20 bg-slate-200 rounded animate-pulse"></div>
					</div>
					<div className="p-6 space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="border border-slate-200 rounded-lg p-4 space-y-2">
								<div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
								<div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
								<div className="h-4 w-40 bg-slate-200 rounded animate-pulse"></div>
							</div>
						))}
					</div>
				</div>

				{/* Statutory Settings Section Skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
							<div className="flex justify-between items-center gap-2 bg-white px-6 py-4 border-b border-slate-200">
								<div className="h-5 w-32 bg-slate-200 rounded animate-pulse"></div>
								<div className="h-9 w-16 bg-slate-200 rounded animate-pulse"></div>
							</div>
							<div className="p-6 space-y-4">
								<div className="space-y-2">
									<div className="h-3 w-24 bg-slate-200 rounded animate-pulse"></div>
									<div className="h-8 w-full bg-slate-200 rounded animate-pulse"></div>
								</div>
								<div className="space-y-2">
									<div className="h-3 w-24 bg-slate-200 rounded animate-pulse"></div>
									<div className="h-8 w-full bg-slate-200 rounded animate-pulse"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	);
};

export default EmployeeSkeleton;
