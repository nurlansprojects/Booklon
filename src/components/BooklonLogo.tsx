import React from 'react';

interface BooklonLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withContainer?: boolean;
  className?: string;
}

export const BooklonLogo: React.FC<BooklonLogoProps> = ({
  size = 'md',
  withContainer = false,
  className = '',
}) => {
  const sizeMap = {
    sm: { container: 'w-8 h-8 rounded-lg', icon: 18 },
    md: { container: 'w-11 h-11 rounded-xl', icon: 26 },
    lg: { container: 'w-16 h-16 rounded-2xl', icon: 38 },
    xl: { container: 'w-24 h-24 rounded-3xl', icon: 56 },
  };

  const { container, icon } = sizeMap[size];

  const svgContent = (
    <svg
      width={icon}
      height={icon}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Outer book frame matching the open book contour */}
      <path
        d="M50 21.5C41.2 17.2 30.5 16 19 16C13.8 16 10 19.8 10 25V74.8C10 77.2 12 79.2 14.4 79.5C25.5 80.9 36.8 82.8 47.8 87.2C49.2 87.7 50.8 87.7 52.2 87.2C63.2 82.8 74.5 80.9 85.6 79.5C88 79.2 90 77.2 90 74.8V25C90 19.8 86.2 16 81 16C69.5 16 58.8 17.2 50 21.5Z"
        stroke="#FFFFFF"
        strokeWidth="6.5"
        strokeLinejoin="round"
      />
      {/* Center spine division */}
      <path
        d="M50 23V86"
        stroke="#FFFFFF"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      {/* Left page inner cut */}
      <path
        d="M17 24C27 24 37 25 44 28V79C37 76 27 74.5 17 73V24Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />
      {/* Right page inner cut */}
      <path
        d="M83 24C73 24 63 25 56 28V79C63 76 73 74.5 83 73V24Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />
    </svg>
  );

  if (withContainer) {
    return (
      <div
        className={`${container} bg-[#6546D7] flex items-center justify-center shadow-lg shadow-[#6546D7]/30 ${className}`}
        style={{ backgroundColor: '#6546D7' }}
      >
        {svgContent}
      </div>
    );
  }

  return <div className={`inline-flex items-center justify-center ${className}`}>{svgContent}</div>;
};
