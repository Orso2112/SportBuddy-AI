
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 64, text: 'text-3xl' }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        
        {/* Main Icon */}
        <div className={`relative ${size === 'lg' ? 'p-4' : 'p-2'} bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-white/20`}>
          <svg 
            width={sizes[size].icon} 
            height={sizes[size].icon} 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Hexagonal Base */}
            <path 
              d="M50 5L89.641 27.5V72.5L50 95L10.359 72.5V27.5L50 5Z" 
              fill="url(#logo_gradient)" 
            />
            {/* Dynamic Swoosh */}
            <path 
              d="M30 50C30 50 45 30 70 45C70 45 55 65 30 50Z" 
              fill="white" 
              fillOpacity="0.8" 
            />
            {/* AI Core Node */}
            <circle cx="50" cy="50" r="8" fill="white" />
            <circle cx="50" cy="50" r="12" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
            
            <defs>
              <linearGradient id="logo_gradient" x1="10.359" y1="5" x2="89.641" y2="95" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563EB" />
                <stop offset="1" stopColor="#4F46E5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${sizes[size].text} font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600`}>
            SportBuddy
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
            Intelligence
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
