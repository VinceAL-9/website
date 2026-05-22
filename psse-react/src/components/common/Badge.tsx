import type { BadgeVariant } from '../../types';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-psse-accent text-white',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-gray-900',
  info: 'bg-cyan-500 text-white',
  secondary: 'bg-gray-500 text-white',
  danger: 'bg-red-500 text-white',
};

const MAX_BADGE_LENGTH = 20;

export const Badge = ({ variant = 'primary', children, className = '' }: BadgeProps) => {
  const displayContent = typeof children === 'string' && children.length > MAX_BADGE_LENGTH
    ? `${children.slice(0, MAX_BADGE_LENGTH)}...`
    : children;

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        text-xs font-medium rounded-full
        ${variantStyles[variant]}
        ${className}
      `}
      title={typeof children === 'string' ? children : undefined}
    >
      {displayContent}
    </span>
  );
};
