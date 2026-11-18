import React from 'react';
import { Check, Sparkles, ChevronUp } from 'lucide-react';
import {
  ARIYA_DHAMMA_LOGOS,
  getAriyaDhammaLogoById,
  type AriyaDhammaLogoOption,
} from '../utils/waharakaLogic';

interface AriyaDhammaLogoMarkProps {
  logoId: number;
  className?: string;
}

/**
 * Renders 1 of 10 bespoke sacred Buddhist vector emblems crafted for AriyaDhamma.
 */
export const AriyaDhammaLogoMark: React.FC<AriyaDhammaLogoMarkProps> = ({
  logoId,
  className = 'w-9 h-9',
}) => {
  switch (logoId) {
    case 1:
      // #1: Eight-Spoke Dhammacakka (Wheel of the Noble Law) with AD center
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <linearGradient id="ad-grad-1" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="29" fill="#18181B" stroke="url(#ad-grad-1)" strokeWidth="2.5" />
          <circle cx="32" cy="32" r="23" stroke="url(#ad-grad-1)" strokeWidth="2" />
          <circle cx="32" cy="32" r="19" stroke="#FDE68A" strokeWidth="0.75" strokeDasharray="2 2" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 32 32)`}>
              <line x1="32" y1="9" x2="32" y2="23" stroke="url(#ad-grad-1)" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="32" cy="6" r="1.8" fill="#FBBF24" />
            </g>
          ))}
          <circle cx="32" cy="32" r="9" fill="url(#ad-grad-1)" />
          <text
            x="32"
            y="35.5"
            textAnchor="middle"
            fill="#09090B"
            fontSize="9.5"
            fontWeight="800"
            fontFamily="serif"
          >
            AD
          </text>
        </svg>
      );

    case 2:
      // #2: Sacred Paduma (Eight-Petalled Lotus & Rising Dhamma Sun)
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <linearGradient id="ad-grad-2" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="29" fill="#18181B" stroke="url(#ad-grad-2)" strokeWidth="2.2" />
          {/* Rising Dhamma Sun */}
          <circle cx="32" cy="21" r="8" fill="url(#ad-grad-2)" opacity="0.9" />
          <circle cx="32" cy="21" r="11.5" stroke="#FBBF24" strokeWidth="1" strokeDasharray="2 2" />
          {/* Center & Side Lotus Petals */}
          <path
            d="M32 18C27 26 26 36 32 45C38 36 37 26 32 18Z"
            fill="url(#ad-grad-2)"
            stroke="#FEF3C7"
            strokeWidth="1.2"
          />
          <path
            d="M32 45C23 42 17 34 19 24C24 28 28 35 32 45Z"
            fill="#F59E0B"
            fillOpacity="0.85"
            stroke="#FDE68A"
            strokeWidth="1.1"
          />
          <path
            d="M32 45C41 42 47 34 45 24C40 28 36 35 32 45Z"
            fill="#F59E0B"
            fillOpacity="0.85"
            stroke="#FDE68A"
            strokeWidth="1.1"
          />
          <path
            d="M14 36C19 44 26 47 32 47C38 47 45 44 50 36C44 39 38 42 32 45C26 42 20 39 14 36Z"
            fill="#D97706"
            stroke="#FDE68A"
            strokeWidth="1"
          />
          <path d="M18 51H46" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 3:
      // #3: Jaya Siri Maha Bodhi Leaf & Sacred Wheel
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <linearGradient id="ad-grad-3" x1="16" y1="8" x2="48" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="29" fill="#18181B" stroke="url(#ad-grad-3)" strokeWidth="2.2" />
          {/* Sacred Heart-Shaped Bo Leaf with Drip Tip */}
          <path
            d="M32 8C32 14 49 21 49 36C49 45 41 50 32 46C23 50 15 45 15 36C15 21 32 14 32 8Z"
            fill="url(#ad-grad-3)"
            fillOpacity="0.22"
            stroke="url(#ad-grad-3)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Leaf Central Vein & Ribs */}
          <path d="M32 11V55" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 26L22 22M32 33L20 29M32 40L22 37" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M32 26L42 22M32 33L44 29M32 40L42 37" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />
          {/* Inner Miniature Dhamma Wheel */}
          <circle cx="32" cy="35" r="6.5" fill="#18181B" stroke="#FDE68A" strokeWidth="1.6" />
          <circle cx="32" cy="35" r="2.2" fill="#FBBF24" />
        </svg>
      );

    case 4:
      // #4: Tilakkhana / Triratna Triple Gem Crest (Anicca, Dukkha, Anatta)
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <linearGradient id="ad-grad-4" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="29" fill="#18181B" stroke="url(#ad-grad-4)" strokeWidth="2.2" />
          {/* Three Luminous Gems */}
          <path
            d="M32 11L39 24L32 35L25 24L32 11Z"
            fill="url(#ad-grad-4)"
            stroke="#FEF3C7"
            strokeWidth="1.3"
          />
          <path
            d="M19 19L25 29L20 39L14 29L19 19Z"
            fill="#F59E0B"
            stroke="#FDE68A"
            strokeWidth="1.2"
          />
          <path
            d="M45 19L50 29L44 39L39 29L45 19Z"
            fill="#F59E0B"
            stroke="#FDE68A"
            strokeWidth="1.2"
          />
          {/* Lotus Pedestal */}
          <path
            d="M16 44C22 49 42 49 48 44"
            stroke="#FBBF24"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M21 50H43"
            stroke="#FDE68A"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 5:
      // #5: Hela Stupa / Dagoba Pinnacle & Radiant Halo
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <linearGradient id="ad-grad-5" x1="14" y1="8" x2="50" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="29" fill="#18181B" stroke="url(#ad-grad-5)" strokeWidth="2.2" />
          {/* Radiant Dhamma Aura */}
          <circle cx="32" cy="28" r="19" stroke="#FBBF24" strokeWidth="0.9" strokeDasharray="2 3" />
          {/* Pinnacle Spire (Koth Kerella) */}
          <path d="M32 10L34.5 21H29.5L32 10Z" fill="#FDE68A" />
          {/* Hatharas Kotuwa */}
          <rect x="27" y="21" width="10" height="5" rx="1" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="1" />
          {/* Bubbulakara Dome (Garbha) */}
          <path
            d="M17 44C17 32 23 26 32 26C41 26 47 32 47 44H17Z"
            fill="url(#ad-grad-5)"
            stroke="#FEF3C7"
            strokeWidth="1.4"
          />
          {/* Three Basal Terraces (Pesawa) */}
          <path d="M14 47H50M12 50.5H52" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 6:
      // #6: Sovereign Three-Tiered Chatra (Royal Parasol of Dhamma)
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <linearGradient id="ad-grad-6" x1="12" y1="10" x2="52" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="29" fill="#18181B" stroke="url(#ad-grad-6)" strokeWidth="2.2" />
          {/* Central Staff */}
          <line x1="32" y1="10" x2="32" y2="52" stroke="#FDE68A" strokeWidth="2.4" strokeLinecap="round" />
          {/* Tier 1 (Top Canopy) */}
          <path d="M22 18C26 13 38 13 42 18H22Z" fill="url(#ad-grad-6)" stroke="#FEF3C7" strokeWidth="1.2" />
          {/* Tier 2 (Middle Canopy) */}
          <path d="M17 28C23 22 41 22 47 28H17Z" fill="url(#ad-grad-6)" stroke="#FEF3C7" strokeWidth="1.2" />
          {/* Tier 3 (Main Royal Canopy) */}
          <path d="M13 39C21 31 43 31 51 39H13Z" fill="url(#ad-grad-6)" stroke="#FEF3C7" strokeWidth="1.3" />
          {/* Base Lotus Stand */}
          <path d="M23 52H41" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 7:
      // #7: Aloka Pahana (Traditional Sinhala Oil Lamp of Wisdom)
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <linearGradient id="ad-grad-7" x1="16" y1="8" x2="48" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="45%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="29" fill="#18181B" stroke="url(#ad-grad-7)" strokeWidth="2.2" />
          {/* Radiant Flame of Prajna */}
          <path
            d="M32 10C37 17 39 23 32 29C25 23 27 17 32 10Z"
            fill="#FEF08A"
            stroke="#F97316"
            strokeWidth="1.4"
          />
          <path d="M32 15C34 19 35 23 32 27C29 23 30 19 32 15Z" fill="#EA580C" />
          {/* Traditional Brass Lamp Bowl */}
          <path
            d="M15 33H49C46 41 39 44 32 44C25 44 18 41 15 33Z"
            fill="url(#ad-grad-7)"
            stroke="#FEF3C7"
            strokeWidth="1.4"
          />
          {/* Lamp Stem & Pedestal */}
          <line x1="32" y1="44" x2="32" y2="52" stroke="#FBBF24" strokeWidth="3" />
          <path d="M22 52H42" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 8:
      // #8: Dakshinavarta Sankha (Sacred Right-Turning Conch Shell)
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <linearGradient id="ad-grad-8" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF9C3" />
              <stop offset="55%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="29" fill="#18181B" stroke="url(#ad-grad-8)" strokeWidth="2.2" />
          {/* Conch Shell Body */}
          <path
            d="M32 11C42 16 47 26 44 37C41 46 34 51 28 53C24 47 18 40 20 29C22 19 27 14 32 11Z"
            fill="url(#ad-grad-8)"
            stroke="#FEF3C7"
            strokeWidth="1.5"
          />
          {/* Clockwise Spiral Volutes */}
          <path
            d="M25 27C30 23 37 25 38 31C39 36 34 40 29 38"
            stroke="#18181B"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Sound Waves of Dhamma */}
          <path d="M14 24C11 29 11 35 14 40" stroke="#FBBF24" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M50 24C53 29 53 35 50 40" stroke="#FBBF24" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );

    case 9:
      // #9: Sandakada Pahana (Sacred Moonstone Arc of Nibbana)
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <linearGradient id="ad-grad-9" x1="10" y1="16" x2="54" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="29" fill="#18181B" stroke="url(#ad-grad-9)" strokeWidth="2.2" />
          {/* Semicircular Moonstone Concentric Bands */}
          <path
            d="M11 44A21 21 0 0 1 53 44Z"
            fill="url(#ad-grad-9)"
            fillOpacity="0.22"
            stroke="url(#ad-grad-9)"
            strokeWidth="2.2"
          />
          <path
            d="M16 44A16 16 0 0 1 48 44"
            stroke="#FBBF24"
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
          <path
            d="M22 44A10 10 0 0 1 42 44"
            fill="#F59E0B"
            fillOpacity="0.45"
            stroke="#FEF3C7"
            strokeWidth="1.4"
          />
          <circle cx="32" cy="41" r="4" fill="#FEF08A" />
          <line x1="9" y1="44" x2="55" y2="44" stroke="#FDE68A" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 10:
    default:
      // #10: Ariya Magga Mandala (Auspicious Interwoven Knot & Bodhi Halo)
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <linearGradient id="ad-grad-10" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="29" fill="#18181B" stroke="url(#ad-grad-10)" strokeWidth="2.2" />
          {/* Outer 8-Petal Mandala Ring */}
          <circle cx="32" cy="32" r="22" stroke="#FBBF24" strokeWidth="1.2" strokeDasharray="4 2" />
          {/* Interwoven Sacred Geometric Diamond Knot */}
          <rect
            x="20"
            y="20"
            width="24"
            height="24"
            rx="3"
            stroke="url(#ad-grad-10)"
            strokeWidth="2.2"
          />
          <rect
            x="20"
            y="20"
            width="24"
            height="24"
            rx="3"
            transform="rotate(45 32 32)"
            stroke="#FDE68A"
            strokeWidth="2"
          />
          <circle cx="32" cy="32" r="6.5" fill="url(#ad-grad-10)" />
          <circle cx="32" cy="32" r="2.5" fill="#18181B" />
        </svg>
      );
  }
};

interface AriyaDhammaLogoGalleryProps {
  selectedLogoId: number;
  onSelectLogo: (logo: AriyaDhammaLogoOption) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const AriyaDhammaLogoGallery: React.FC<AriyaDhammaLogoGalleryProps> = ({
  selectedLogoId,
  onSelectLogo,
  isOpen,
  onToggleOpen,
}) => {
  const activeLogo = getAriyaDhammaLogoById(selectedLogoId);

  if (!isOpen) {
    return null;
  }

  return (
    <section
      aria-label="AriyaDhamma 10 Buddhist Symbol Logo Examples"
      data-testid="logo-gallery-section"
      className="mb-4 rounded-3xl border border-amber-500/30 bg-zinc-50/95 dark:bg-zinc-950/95 p-4 sm:p-6 space-y-4 shadow-lg"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>AriyaDhamma Brand Studio · 10 Sacred Buddhist Symbol Logos</span>
          </div>
          <h2 className="text-base sm:text-xl font-bold font-serif-display text-zinc-950 dark:text-white">
            Pick Your Official <span className="text-amber-600 dark:text-amber-400">AriyaDhamma</span> Logo (1–10)
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Tap any of the 10 Buddhist symbol designs below to immediately set it as your active{' '}
            <strong className="text-zinc-900 dark:text-zinc-200">AriyaDhamma</strong> app icon &amp; header lockup.
            Currently active: <strong className="text-amber-700 dark:text-amber-400">#{activeLogo.id} {activeLogo.symbolName}</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleOpen}
          aria-label="Hide 10 logo examples gallery"
          className="min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-zinc-200/80 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-800 transition-colors shrink-0"
        >
          <ChevronUp className="w-4 h-4" />
          <span>Done / Hide Gallery</span>
        </button>
      </div>

      {/* 10 Logo Examples Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {ARIYA_DHAMMA_LOGOS.map((logo) => {
          const isSelected = logo.id === selectedLogoId;
          return (
            <div
              key={logo.id}
              data-testid={`logo-option-card-${logo.id}`}
              className={`rounded-2xl p-3.5 flex flex-col justify-between gap-3 border transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/10 shadow-md ring-1 ring-amber-500/40'
                  : 'border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/70 hover:border-amber-500/50'
              }`}
            >
              <div className="space-y-2.5">
                {/* Top Number & Symbol Subtitle */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono-tabular font-bold text-amber-700 dark:text-amber-400">
                    Logo #{logo.id}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {logo.symbolName}
                  </span>
                </div>

                {/* Live Brand Lockup Preview Implementing "AriyaDhamma" */}
                <div className="p-2.5 rounded-xl bg-zinc-950 text-white border border-zinc-800 flex items-center gap-2.5">
                  <AriyaDhammaLogoMark logoId={logo.id} className="w-11 h-11 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold tracking-tight font-serif-display leading-tight truncate">
                      Ariya<span className="text-amber-400">Dhamma</span>
                    </div>
                    <div className="text-[10px] text-amber-300/90 truncate font-medium">
                      {logo.sinhalaTitle}
                    </div>
                  </div>
                </div>

                {/* Meaning & Tagline */}
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
                    {logo.tagline}
                  </p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {logo.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectLogo(logo)}
                aria-pressed={isSelected}
                aria-label={`Select Logo #${logo.id}: ${logo.symbolName}`}
                className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  isSelected
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Selected (#{logo.id})</span>
                  </>
                ) : (
                  <span>Pick Logo #{logo.id}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
