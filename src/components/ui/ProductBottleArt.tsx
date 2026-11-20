import { BottleSilhouette } from '../../types/glowup';

interface ProductBottleArtProps {
  silhouette: BottleSilhouette;
  accentHex: string;
  label: string;
}

export function ProductBottleArt({ silhouette, accentHex, label }: ProductBottleArtProps) {
  const idSafe = label.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'bottle';

  return (
    <div
      className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-[#FFF9F0]/10"
      style={{
        background: `radial-gradient(circle at 50% 35%, ${accentHex}26 0%, rgba(28, 18, 25, 0.92) 72%)`,
      }}
    >
      {/* Subtle studio pedestal shadow */}
      <div
        aria-hidden="true"
        className="absolute bottom-4 h-4 w-28 rounded-full bg-black/50 blur-md"
      />
      <svg
        viewBox="0 0 140 160"
        className="relative z-10 h-36 w-32 drop-shadow-[0_14px_22px_rgba(0,0,0,0.45)]"
        role="img"
        aria-label={`${label} luxury skincare vessel`}
      >
        <defs>
          <linearGradient id={`glass-${idSafe}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF9F0" stopOpacity="0.65" />
            <stop offset="48%" stopColor={accentHex} stopOpacity="0.42" />
            <stop offset="100%" stopColor="#67445B" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={`gold-${idSafe}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A67C58" />
            <stop offset="42%" stopColor="#F1D5B8" />
            <stop offset="75%" stopColor="#D9B18C" />
            <stop offset="100%" stopColor="#8E6747" />
          </linearGradient>
          <linearGradient id={`serum-${idSafe}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentHex} stopOpacity="0.82" />
            <stop offset="100%" stopColor="#67445B" stopOpacity="0.68" />
          </linearGradient>
        </defs>

        {silhouette === 'dropper' && (
          <g>
            {/* Rubber dropper bulb */}
            <path d="M62 16 C62 9, 78 9, 78 16 L79 34 L61 34 Z" fill="#FFF9F0" fillOpacity="0.88" />
            {/* Rose gold collar */}
            <rect x="57" y="34" width="26" height="12" rx="2" fill={`url(#gold-${idSafe})`} />
            {/* Bottle shoulder & frosted glass body */}
            <path
              d="M58 46 L52 58 L42 66 L42 134 C42 139, 46 142, 51 142 L89 142 C94 142, 98 139, 98 134 L98 66 L88 58 L82 46 Z"
              fill={`url(#glass-${idSafe})`}
              stroke="rgba(255,249,240,0.45)"
              strokeWidth="1.2"
            />
            {/* Inner serum liquid */}
            <rect x="47" y="76" width="46" height="60" rx="4" fill={`url(#serum-${idSafe})`} />
            {/* Pipette */}
            <line x1="70" y1="54" x2="70" y2="122" stroke="rgba(255,249,240,0.55)" strokeWidth="2.5" />
            {/* Minimal label */}
            <rect x="49" y="88" width="42" height="32" rx="1.5" fill="rgba(255,249,240,0.86)" />
            <text x="70" y="103" textAnchor="middle" fill="#3B2332" fontSize="6" fontFamily="Cormorant Garamond, serif" fontWeight="600">
              GLOWUP
            </text>
            <line x1="57" y1="108" x2="83" y2="108" stroke="#D9B18C" strokeWidth="0.8" />
          </g>
        )}

        {silhouette === 'jar' && (
          <g>
            {/* Rose gold metallic lid */}
            <rect x="37" y="54" width="66" height="17" rx="3" fill={`url(#gold-${idSafe})`} />
            <line x1="37" y1="67" x2="103" y2="67" stroke="rgba(255,249,240,0.4)" strokeWidth="1" />
            {/* Frosted cream jar */}
            <rect
              x="34"
              y="71"
              width="72"
              height="62"
              rx="8"
              fill={`url(#glass-${idSafe})`}
              stroke="rgba(255,249,240,0.45)"
              strokeWidth="1.2"
            />
            <rect x="40" y="78" width="60" height="48" rx="5" fill={`url(#serum-${idSafe})`} fillOpacity="0.65" />
            <rect x="44" y="88" width="52" height="28" rx="1.5" fill="rgba(255,249,240,0.88)" />
            <text x="70" y="102" textAnchor="middle" fill="#3B2332" fontSize="6.5" fontFamily="Cormorant Garamond, serif" fontWeight="600">
              GLOWUP
            </text>
            <line x1="54" y1="107" x2="86" y2="107" stroke="#D9B18C" strokeWidth="0.8" />
          </g>
        )}

        {silhouette === 'pump' && (
          <g>
            {/* Pump nozzle */}
            <path d="M65 24 L82 24 L82 29 L65 29 Z" fill={`url(#gold-${idSafe})`} />
            <rect x="63" y="20" width="11" height="14" rx="2" fill={`url(#gold-${idSafe})`} />
            <rect x="57" y="34" width="26" height="10" rx="2" fill={`url(#gold-${idSafe})`} />
            {/* Tall cylindrical bottle */}
            <rect
              x="44"
              y="44"
              width="52"
              height="98"
              rx="10"
              fill={`url(#glass-${idSafe})`}
              stroke="rgba(255,249,240,0.45)"
              strokeWidth="1.2"
            />
            <rect x="48" y="58" width="44" height="78" rx="7" fill={`url(#serum-${idSafe})`} fillOpacity="0.6" />
            <rect x="50" y="76" width="40" height="42" rx="1.5" fill="rgba(255,249,240,0.86)" />
            <text x="70" y="96" textAnchor="middle" fill="#3B2332" fontSize="6" fontFamily="Cormorant Garamond, serif" fontWeight="600">
              GLOWUP
            </text>
          </g>
        )}

        {silhouette === 'mist' && (
          <g>
            <rect x="62" y="20" width="16" height="15" rx="2" fill={`url(#gold-${idSafe})`} />
            <rect x="58" y="35" width="24" height="8" rx="1.5" fill={`url(#gold-${idSafe})`} />
            <rect
              x="46"
              y="43"
              width="48"
              height="98"
              rx="8"
              fill={`url(#glass-${idSafe})`}
              stroke="rgba(255,249,240,0.45)"
              strokeWidth="1.2"
            />
            <rect x="50" y="56" width="40" height="80" rx="5" fill={`url(#serum-${idSafe})`} fillOpacity="0.55" />
            <line x1="70" y1="45" x2="70" y2="132" stroke="rgba(255,249,240,0.4)" strokeWidth="2" />
            <rect x="52" y="78" width="36" height="36" rx="1.5" fill="rgba(255,249,240,0.86)" />
            <text x="70" y="96" textAnchor="middle" fill="#3B2332" fontSize="5.8" fontFamily="Cormorant Garamond, serif" fontWeight="600">
              GLOWUP
            </text>
          </g>
        )}

        {silhouette === 'tube' && (
          <g>
            {/* Inverted luxury SPF tube */}
            <path
              d="M42 26 L98 26 L88 118 L52 118 Z"
              fill={`url(#glass-${idSafe})`}
              stroke="rgba(255,249,240,0.45)"
              strokeWidth="1.2"
            />
            <rect x="42" y="22" width="56" height="6" rx="1" fill="rgba(255,249,240,0.7)" />
            <rect x="54" y="118" width="32" height="20" rx="3" fill={`url(#gold-${idSafe})`} />
            <rect x="52" y="55" width="36" height="40" rx="1.5" fill="rgba(255,249,240,0.88)" />
            <text x="70" y="74" textAnchor="middle" fill="#3B2332" fontSize="5.8" fontFamily="Cormorant Garamond, serif" fontWeight="600">
              GLOWUP
            </text>
            <text x="70" y="84" textAnchor="middle" fill="#67445B" fontSize="4.5" fontFamily="Plus Jakarta Sans, sans-serif">
              SPF 50
            </text>
          </g>
        )}

        {silhouette === 'ampoule' && (
          <g>
            <rect x="61" y="22" width="18" height="22" rx="3" fill={`url(#gold-${idSafe})`} />
            <path
              d="M54 44 L86 44 L94 64 L94 134 C94 139, 90 142, 85 142 L55 142 C50 142, 46 139, 46 134 L46 64 Z"
              fill={`url(#glass-${idSafe})`}
              stroke="rgba(255,249,240,0.45)"
              strokeWidth="1.2"
            />
            <rect x="50" y="72" width="40" height="64" rx="4" fill={`url(#serum-${idSafe})`} />
            <rect x="52" y="86" width="36" height="32" rx="1.5" fill="rgba(255,249,240,0.88)" />
            <text x="70" y="102" textAnchor="middle" fill="#3B2332" fontSize="5.8" fontFamily="Cormorant Garamond, serif" fontWeight="600">
              GLOWUP
            </text>
          </g>
        )}

        {/* Specular vertical highlight */}
        <line x1="48" y1="68" x2="48" y2="128" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
