import React from 'react';

interface LogoIconProps {
  className?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 140 120"
      aria-hidden="true"
    >
      <defs>
        <path
          id="grain"
          d="M0,0 C-2,-4 -2,-6 0,-10 C2,-6 2,-4 0,0 Z"
          fill="#D4A237"
        />
      </defs>
      
      {/* Ground */}
      <path d="M-10,110 C40,100 100,100 150,110 L150,120 L-10,120 Z" fill="#6A994E" />

      {/* Center Stalk */}
      <g transform="translate(70, 108) scale(1.2)">
        <path d="M0,0 V-75" stroke="#D4A237" strokeWidth="1.5" />
        {/* Grains */}
        <use href="#grain" transform="translate(0, -10) rotate(25)" />
        <use href="#grain" transform="translate(0, -10) rotate(-25) scale(-1, 1)" />
        <use href="#grain" transform="translate(0, -20) rotate(25)" />
        <use href="#grain" transform="translate(0, -20) rotate(-25) scale(-1, 1)" />
        <use href="#grain" transform="translate(0, -30) rotate(25)" />
        <use href="#grain" transform="translate(0, -30) rotate(-25) scale(-1, 1)" />
        <use href="#grain" transform="translate(0, -40) rotate(25)" />
        <use href="#grain" transform="translate(0, -40) rotate(-25) scale(-1, 1)" />
        <use href="#grain" transform="translate(0, -50) rotate(25)" />
        <use href="#grain" transform="translate(0, -50) rotate(-25) scale(-1, 1)" />
        <use href="#grain" transform="translate(0, -60) rotate(15)" />
        <use href="#grain" transform="translate(0, -60) rotate(-15) scale(-1, 1)" />
        <path d="M0,-68 L0,-75 M-2,-69 L-4,-78 M2,-69 L4,-78" stroke="#D4A237" strokeWidth="0.8" />
      </g>
      
      {/* Left Stalk */}
      <g transform="translate(45, 108) scale(0.9)">
        <path d="M0,0 V-65" stroke="#D4A237" strokeWidth="1.5" />
        {/* Grains */}
        <use href="#grain" transform="translate(0, -8) rotate(30)" />
        <use href="#grain" transform="translate(0, -8) rotate(-30) scale(-1, 1)" />
        <use href="#grain" transform="translate(0, -18) rotate(30)" />
        <use href="#grain" transform="translate(0, -18) rotate(-30) scale(-1, 1)" />
        <use href="#grain" transform="translate(0, -28) rotate(30)" />
        <use href="#grain" transform="translate(0, -28) rotate(-30) scale(-1, 1)" />
        <use href="#grain" transform="translate(0, -38) rotate(30)" />
        <use href="#grain" transform="translate(0, -38) rotate(-30) scale(-1, 1)" />
        <use href="#grain" transform="translate(0, -48) rotate(20)" />
        <use href="#grain" transform="translate(0, -48) rotate(-20) scale(-1, 1)" />
        <path d="M0,-55 L0,-62 M-1,-56 L-2,-65 M1,-56 L2,-65" stroke="#D4A237" strokeWidth="0.8" />
      </g>

      {/* Right Stalk */}
      <g transform="translate(95, 108) scale(0.9)">
        <path d="M0,0 V-65" stroke="#D4A237" strokeWidth="1.5" />
        {/* Grains */}
        <use href="#grain" transform="translate(0, -8) rotate(30)" />
        <use href="#grain" transform="translate(0, -8) rotate(-30) scale(-1, 1)" />
        <use href="#grain" transform="translate(0, -18) rotate(30)" />
        <use href="#grain" transform="translate(0, -18) rotate(-30) scale(-1, 1)" />
        <use href="#grain" transform="translate(0, -28) rotate(30)" />
        <use href="#grain" transform="translate(0, -28) rotate(-30) scale(-1, 1)" />
        <use href="#grain" transform="translate(0, -38) rotate(30)" />
        <use href="#grain" transform="translate(0, -38) rotate(-30) scale(-1, 1)" />
        <use href="#grain" transform="translate(0, -48) rotate(20)" />
        <use href="#grain" transform="translate(0, -48) rotate(-20) scale(-1, 1)" />
        <path d="M0,-55 L0,-62 M-1,-56 L-2,-65 M1,-56 L2,-65" stroke="#D4A237" strokeWidth="0.8" />
      </g>
    </svg>
  );
};
