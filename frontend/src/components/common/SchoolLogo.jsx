import React from 'react';
import schoolLogoSvg from '../../assets/school_logo.svg';
import schoolBadgeSvg from '../../assets/school_badge.svg';

export const SchoolLogo = ({ size = 40, showText = true, className = '', variant = 'full' }) => {
  if (!showText || variant === 'badge') {
    return (
      <img
        src={schoolBadgeSvg}
        alt="St. Martin's Badge"
        className={`shrink-0 object-contain ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={schoolBadgeSvg}
        alt="St. Martin's Emblem"
        className="shrink-0 object-contain"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
      <div>
        <h2 className="text-xs sm:text-sm font-extrabold text-[#0B4F8A] leading-tight tracking-wide uppercase">
          ST. MARTIN'S
        </h2>
        <p className="text-[10px] sm:text-[11px] font-bold text-[#073763] tracking-wider uppercase leading-none">
          MATRICULATION HR.SEC. SCHOOL
        </p>
      </div>
    </div>
  );
};
