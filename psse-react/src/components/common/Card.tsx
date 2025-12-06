import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card = ({ children, className = '', hover = true, onClick }: CardProps) => {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-lg overflow-hidden
        ${hover ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export const CardBody = ({ children, className = '' }: CardBodyProps) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter = ({ children, className = '' }: CardFooterProps) => {
  return <div className={`px-6 py-4 border-t border-gray-100 ${className}`}>{children}</div>;
};

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const CardImage = ({ src, alt, className = '' }: CardImageProps) => {
  return (
    <div className="relative overflow-hidden bg-gray-200">
      <img
        src={src}
        alt={alt}
        className={`w-full h-48 object-cover ${className}`}
        onError={(e) => {
          e.currentTarget.src = '/images/placeholder-image.jpg';
        }}
      />
    </div>
  );
};
