import React from 'react';
import { convertToArabicDigits } from '../utils/editorUtils';

interface OrnateAyahMedallionProps {
  ayahNumber: number;
  digitType?: 'arabic' | 'latin';
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Authentic Kashmiri / Ottoman Mushaf Crowned Ornate Ayah Medallion
 * Vector SVG reproduction matching the user's provided ornamental scripture cartouche.
 */
export const OrnateAyahMedallion: React.FC<OrnateAyahMedallionProps> = ({
  ayahNumber,
  digitType = 'arabic',
  size = 36,
  color = 'currentColor',
  className = '',
}) => {
  const digits = digitType === 'arabic' ? convertToArabicDigits(ayahNumber) : String(ayahNumber);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 120"
      width={size}
      height={(size * 120) / 100}
      className={`inline-block align-middle select-none shrink-0 ${className}`}
      style={{ verticalAlign: 'middle' }}
    >
      <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
        {/* Central Circular Rings */}
        <circle cx="50" cy="60" r="32" strokeWidth="2.5" />
        <circle cx="50" cy="60" r="25" strokeWidth="1.5" />

        {/* Top Crown Arabesque Scrolls & Apex */}
        <path d="M34 32 C28 22 40 11 50 12 C60 11 72 22 66 32" strokeWidth="2" />
        <path d="M41 29 C43 19 50 17 50 17 C50 17 57 19 59 29" strokeWidth="1.4" />
        <circle cx="50" cy="9" r="2.2" fill={color} />

        {/* Bottom Finial Arabesque Scrolls & Apex */}
        <path d="M34 88 C28 98 40 109 50 108 C60 109 72 98 66 88" strokeWidth="2" />
        <path d="M41 91 C43 101 50 103 50 103 C50 103 57 101 59 91" strokeWidth="1.4" />
        <circle cx="50" cy="111" r="2.2" fill={color} />
      </g>

      {/* Central Verse / Ayah Arabic Number */}
      <text
        x="50"
        y="62"
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={digits.length > 2 ? '22' : digits.length === 2 ? '26' : '30'}
        fontWeight="bold"
        fontFamily="sans-serif, 'Amiri', 'Traditional Arabic', 'Scheherazade New'"
      >
        {digits}
      </text>
    </svg>
  );
};

export default OrnateAyahMedallion;
