import { cn } from '@/utils/lib';
import React from 'react';

const Button = ({
	theme = 'default',
	text,
	icon = {
		position: 'left',
		content: null,
	},
	className,
	onClick,
}: {
	theme?: string;
	text: string;
	icon?: {
		position: 'left' | 'right';
		content: React.ReactNode;
	};
	className?: string;
	onClick?: () => void;
}) => {
	return (
		<button
			onClick={onClick}
			className={cn(
				theme === 'default'
					? 'bg-slate-800 hover:bg-slate-900 border border-slate-800'
					: theme === 'outline'
						? 'bg-white hover:bg-slate-100 border border-slate-500'
						: 'bg-slate-800 hover:bg-slate-900',
				' flex items-center gap-2 px-4 py-2 rounded-lg transition',
				className,
			)}
		>
			{icon && icon.position === 'left' && icon.content}
			<span className={cn(theme === 'default' ? 'text-white' : theme === 'outline' ? 'text-slate-800' : 'text-white', 'text-sm font-medium')}>{text}</span>
			{icon && icon.position === 'right' && icon.content}
		</button>
	);
};

export default Button;
