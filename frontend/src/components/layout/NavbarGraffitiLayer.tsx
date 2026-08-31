export default function NavbarGraffitiLayer() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1400 82"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        zIndex:        1,
        pointerEvents: 'none',
        overflow:      'hidden',
      }}
    >
      {/* ── Angular shard marks ──────────────────────────────── */}
      <polygon points="132,8 157,4 164,24 149,28 134,20"    fill="#6f8f22" opacity="0.38" />
      <polygon points="282,46 308,38 314,62 296,66 280,56"  fill="#c8ff3f" opacity="0.26" />
      <polygon points="422,10 444,6 449,28 432,34 418,22"   fill="#8fae2c" opacity="0.32" />
      <polygon points="612,54 638,48 641,72 622,76 608,66"  fill="#6f8f22" opacity="0.34" />
      <polygon points="752,7 775,4 778,20 762,27 749,16"    fill="#c8ff3f" opacity="0.22" />
      <polygon points="932,40 960,34 964,58 946,63 929,52"  fill="#8fae2c" opacity="0.30" />
      <polygon points="1102,16 1124,12 1128,30 1110,35 1099,26" fill="#6f8f22" opacity="0.32" />
      <polygon points="1222,54 1248,48 1251,70 1234,75 1220,65" fill="#c8ff3f" opacity="0.20" />
      {/* Extra small accent shards */}
      <polygon points="560,30 572,26 575,40 564,43 558,36"  fill="#c8ff3f" opacity="0.28" />
      <polygon points="1340,22 1355,18 1358,32 1346,36 1338,28" fill="#8fae2c" opacity="0.24" />

      {/* ── Stencil stripe marks ─────────────────────────────── */}
      <rect x="245" y="20" width="36" height="3"  rx="1" fill="#6f8f22" opacity="0.34" />
      <rect x="248" y="27" width="26" height="2"  rx="1" fill="#6f8f22" opacity="0.24" />
      <rect x="1278" y="30" width="34" height="3" rx="1" fill="#8fae2c" opacity="0.30" />
      <rect x="1282" y="37" width="22" height="2" rx="1" fill="#8fae2c" opacity="0.22" />
      <rect x="700"  y="62" width="30" height="3" rx="1" fill="#c8ff3f" opacity="0.26" />
      <rect x="704"  y="68" width="20" height="2" rx="1" fill="#c8ff3f" opacity="0.20" />

      {/* ── Drip trails ──────────────────────────────────────── */}
      <rect x="318" y="22" width="3"   height="22" rx="1.5" fill="#c8ff3f" opacity="0.40" transform="rotate(5 319 33)" />
      <rect x="322" y="43" width="2"   height="8"  rx="1"   fill="#c8ff3f" opacity="0.30" transform="rotate(5 323 47)" />
      <rect x="674" y="12" width="2.5" height="18" rx="1.25" fill="#8fae2c" opacity="0.42" transform="rotate(-6 675 21)" />
      <rect x="671" y="29" width="2"   height="7"  rx="1"   fill="#8fae2c" opacity="0.30" transform="rotate(-6 672 33)" />
      <rect x="1042" y="35" width="3"  height="24" rx="1.5" fill="#6f8f22" opacity="0.38" transform="rotate(8 1043 47)" />
      <rect x="382" y="56" width="2"   height="16" rx="1"   fill="#8fae2c" opacity="0.34" transform="rotate(-4 383 64)" />

      {/* ── Spray dot clusters ───────────────────────────────── */}
      {/* Cluster 1 — ~x=200, y=50 */}
      <circle cx="194" cy="47" r="1.5" fill="#8fae2c" opacity="0.42" />
      <circle cx="202" cy="54" r="2"   fill="#8fae2c" opacity="0.36" />
      <circle cx="209" cy="45" r="1.5" fill="#8fae2c" opacity="0.46" />
      <circle cx="197" cy="61" r="1"   fill="#8fae2c" opacity="0.30" />
      <circle cx="213" cy="59" r="2"   fill="#8fae2c" opacity="0.34" />
      <circle cx="206" cy="40" r="1.5" fill="#8fae2c" opacity="0.28" />
      <circle cx="218" cy="50" r="1"   fill="#8fae2c" opacity="0.24" />
      {/* Cluster 2 — ~x=530, y=20 */}
      <circle cx="526" cy="17" r="2"   fill="#c8ff3f" opacity="0.32" />
      <circle cx="534" cy="22" r="1.5" fill="#c8ff3f" opacity="0.28" />
      <circle cx="541" cy="15" r="1"   fill="#c8ff3f" opacity="0.40" />
      <circle cx="529" cy="28" r="2"   fill="#c8ff3f" opacity="0.30" />
      <circle cx="537" cy="30" r="1.5" fill="#c8ff3f" opacity="0.24" />
      <circle cx="544" cy="23" r="1"   fill="#c8ff3f" opacity="0.22" />
      {/* Cluster 3 — ~x=840, y=65 */}
      <circle cx="836" cy="61" r="1.5" fill="#6f8f22" opacity="0.44" />
      <circle cx="844" cy="67" r="2"   fill="#6f8f22" opacity="0.38" />
      <circle cx="851" cy="59" r="1.5" fill="#6f8f22" opacity="0.42" />
      <circle cx="839" cy="74" r="1"   fill="#6f8f22" opacity="0.32" />
      <circle cx="849" cy="73" r="2"   fill="#6f8f22" opacity="0.34" />
      <circle cx="857" cy="65" r="1"   fill="#6f8f22" opacity="0.26" />
      {/* Cluster 4 — ~x=1170, y=30 */}
      <circle cx="1166" cy="27" r="2"   fill="#8fae2c" opacity="0.36" />
      <circle cx="1174" cy="32" r="1.5" fill="#8fae2c" opacity="0.30" />
      <circle cx="1181" cy="24" r="1"   fill="#8fae2c" opacity="0.42" />
      <circle cx="1169" cy="38" r="2"   fill="#8fae2c" opacity="0.28" />
      <circle cx="1179" cy="40" r="1.5" fill="#8fae2c" opacity="0.24" />

      {/* ── Rounded tag blob outlines ─────────────────────────── */}
      <ellipse cx="479"  cy="41" rx="30" ry="19" fill="none" stroke="#8fae2c" strokeWidth="1.5" opacity="0.26" />
      <ellipse cx="1002" cy="37" rx="34" ry="21" fill="none" stroke="#6f8f22" strokeWidth="1.5" opacity="0.24" />
      <rect x="718" y="52" width="46" height="22" rx="8"    fill="none" stroke="#c8ff3f" strokeWidth="1.5" opacity="0.20" />

      {/* ── Graffiti text tags ───────────────────────────────── */}
      {/* "LIVE" — low opacity texture, rotated -4° */}
      <text
        x="455" y="60"
        style={{ fontFamily: 'var(--font-graffiti, cursive)', fontSize: 26, fill: '#c8ff3f', opacity: 0.24 }}
        transform="rotate(-4 455 60)"
      >
        LIVE
      </text>
      {/* Drip from the V in LIVE */}
      <rect x="476" y="62" width="2.5" height="9" rx="1.25" fill="#c8ff3f" opacity="0.18" />

      {/* "LOUD" — low opacity texture, rotated +5° */}
      <text
        x="880" y="44"
        style={{ fontFamily: 'var(--font-graffiti, cursive)', fontSize: 26, fill: '#8fae2c', opacity: 0.23 }}
        transform="rotate(5 880 44)"
      >
        LOUD
      </text>
      {/* Drip from the O in LOUD */}
      <rect x="894" y="46" width="2.5" height="8" rx="1.25" fill="#8fae2c" opacity="0.18" />
    </svg>
  )
}
