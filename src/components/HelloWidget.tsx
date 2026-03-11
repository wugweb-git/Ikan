import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────
interface WeatherData {
  city: string;
  temp: number;
  high: number;
  low: number;
  feelsLike: number;
  description: string;
  code: number;
}

type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';

// ─── Weather code interpreter ──────────────────────────────────────
function interpretWeatherCode(code: number): {
  description: string;
  type: 'clear' | 'partly-cloudy' | 'cloudy' | 'rain' | 'snow' | 'thunder' | 'fog';
} {
  if (code === 0) return { description: 'Clear sky', type: 'clear' };
  if (code <= 2) return { description: 'Partly cloudy', type: 'partly-cloudy' };
  if (code === 3) return { description: 'Overcast', type: 'cloudy' };
  if (code <= 48) return { description: 'Foggy', type: 'fog' };
  if (code <= 57) return { description: 'Drizzle', type: 'rain' };
  if (code <= 67) return { description: 'Rainy', type: 'rain' };
  if (code <= 77) return { description: 'Snowy', type: 'snow' };
  if (code <= 82) return { description: 'Rain showers', type: 'rain' };
  if (code <= 86) return { description: 'Snow showers', type: 'snow' };
  if (code <= 99) return { description: 'Thunderstorm', type: 'thunder' };
  return { description: 'Unknown', type: 'cloudy' };
}

// ─── Time of day helper ────────────────────────────────────────────
function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

// ─── Gradient backgrounds per time of day ──────────────────────────
function getTimeGradient(tod: TimeOfDay): string {
  switch (tod) {
    case 'dawn': return 'linear-gradient(135deg, var(--color-tod-dawn-1) 0%, var(--color-tod-dawn-2) 40%, var(--color-tod-dawn-3) 100%)';
    case 'morning': return 'linear-gradient(135deg, var(--color-tod-morning-1) 0%, var(--color-tod-morning-2) 40%, var(--color-tod-morning-3) 100%)';
    case 'afternoon': return 'linear-gradient(135deg, var(--color-tod-afternoon-1) 0%, var(--color-tod-afternoon-2) 40%, var(--color-tod-afternoon-3) 100%)';
    case 'evening': return 'linear-gradient(135deg, var(--color-tod-evening-1) 0%, var(--color-tod-evening-2) 40%, var(--color-tod-evening-3) 100%)';
    case 'night': return 'linear-gradient(135deg, var(--color-tod-night-1) 0%, var(--color-tod-night-2) 40%, var(--color-tod-night-3) 100%)';
  }
}

function getTextColor(tod: TimeOfDay): string {
  return tod === 'night' ? 'var(--color-tod-night-text)' : 'var(--color-text-primary)';
}

function getMutedColor(tod: TimeOfDay): string {
  return tod === 'night' ? 'var(--color-tod-night-muted)' : 'var(--color-text-muted)';
}

function getDividerColor(tod: TimeOfDay): string {
  return tod === 'night' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
}

// ─── Celestial Icon (Sun / Moon) ───────────────────────────────────
function CelestialIcon({ tod, size = 48 }: { tod: TimeOfDay; size?: number }) {
  const s = size;
  const isDawn = tod === 'dawn';
  const isEvening = tod === 'evening';

  if (tod === 'night') {
    // Moon with stars — decorative celestial SVG colors use tokens from globals.css
    return (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="moonGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-celestial-moon-fill)" />
            <stop offset="100%" stopColor="var(--color-celestial-moon-shadow)" />
          </linearGradient>
        </defs>
        {/* Moon crescent */}
        <circle cx="30" cy="30" r="16" fill="url(#moonGrad)" />
        <circle cx="38" cy="24" r="14" fill="var(--color-tod-night-2)" />
        {/* Moon craters */}
        <circle cx="24" cy="28" r="2.5" fill="var(--color-celestial-crater)" opacity="0.4" />
        <circle cx="30" cy="36" r="1.8" fill="var(--color-celestial-crater)" opacity="0.3" />
        {/* Stars */}
        <circle cx="52" cy="12" r="1.2" fill="var(--color-celestial-star)" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="48" cy="22" r="0.8" fill="var(--color-celestial-star-alt)" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="56" cy="28" r="1" fill="var(--color-celestial-star)" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="14" cy="14" r="0.7" fill="var(--color-celestial-star-alt)" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="8" cy="24" r="0.9" fill="var(--color-celestial-star)" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  }

  if (isDawn || isEvening) {
    // Half-sun on horizon — decorative celestial SVG colors use tokens
    const sunColor = isDawn ? 'var(--color-celestial-dawn-sun)' : 'var(--color-celestial-evening-sun)';
    const horizonColor = isDawn ? 'var(--color-celestial-dawn-horizon)' : 'var(--color-celestial-evening-horizon)';
    return (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="horizonGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sunColor} />
            <stop offset="100%" stopColor={horizonColor} />
          </linearGradient>
        </defs>
        {/* Rays */}
        {[210, 240, 270, 300, 330].map((a) => {
          const r = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={32 + Math.cos(r) * 20}
              y1={38 + Math.sin(r) * 20}
              x2={32 + Math.cos(r) * 26}
              y2={38 + Math.sin(r) * 26}
              stroke={sunColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          );
        })}
        {/* Horizon line */}
        <line x1="6" y1="40" x2="58" y2="40" stroke={horizonColor} strokeWidth="1.5" opacity="0.5" />
        {/* Half sun */}
        <clipPath id="horizonClip">
          <rect x="0" y="0" width="64" height="40" />
        </clipPath>
        <circle cx="32" cy="40" r="14" fill="url(#horizonGrad)" clipPath="url(#horizonClip)" />
      </svg>
    );
  }

  // Full sun (morning / afternoon) — decorative celestial SVG colors use tokens
  const sunColor = tod === 'afternoon' ? 'var(--color-celestial-afternoon-sun)' : 'var(--color-celestial-morning-sun)';
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={sunColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={sunColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Glow */}
      <circle cx="32" cy="32" r="28" fill="url(#sunGlow)" />
      {/* Rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={32 + Math.cos(r) * 18}
            y1={32 + Math.sin(r) * 18}
            x2={32 + Math.cos(r) * 24}
            y2={32 + Math.sin(r) * 24}
            stroke={sunColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      })}
      {/* Sun body */}
      <circle cx="32" cy="32" r="12" fill={sunColor} />
    </svg>
  );
}

// ─── Weather condition icon (small, for label) ─────────────────────
function WeatherConditionIcon({ type, size = 20, tod }: { type: string; size?: number; tod: TimeOfDay }) {
  const s = size;
  const mutedCloud = tod === 'night' ? 'var(--color-weather-cloud-night)' : 'var(--color-weather-cloud-day)';
  const rain = tod === 'night' ? 'var(--color-weather-rain-night)' : 'var(--color-weather-rain-day)';

  if (type === 'clear') return null; // celestial icon covers it
  if (type === 'partly-cloudy') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="16" cy="8" r="4" fill={tod === 'night' ? 'var(--color-celestial-moon-fill)' : 'var(--color-celestial-afternoon-sun)'} />
        <path d="M6 18c-2 0-3.5-1.5-3.5-3.5S4 11 6 11c.3-2 2-3.5 4-3.5 1.8 0 3.3 1.2 3.8 2.8.4-.2.8-.3 1.2-.3 2.2 0 4 1.8 4 4s-1.8 4-4 4H6z" fill={mutedCloud} />
      </svg>
    );
  }
  if (type === 'cloudy') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M6 18c-2 0-3.5-1.5-3.5-3.5S4 11 6 11c.3-2 2-3.5 4-3.5 1.8 0 3.3 1.2 3.8 2.8.4-.2.8-.3 1.2-.3 2.2 0 4 1.8 4 4s-1.8 4-4 4H6z" fill={mutedCloud} />
      </svg>
    );
  }
  if (type === 'rain') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M6 14c-2 0-3.5-1.5-3.5-3.5S4 7 6 7c.3-2 2-3.5 4-3.5 1.8 0 3.3 1.2 3.8 2.8.4-.2.8-.3 1.2-.3 2.2 0 4 1.8 4 4s-1.8 4-4 4H6z" fill={mutedCloud} />
        <line x1="8" y1="17" x2="7" y2="20" stroke={rain} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="17" x2="11" y2="21" stroke={rain} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="17" x2="15" y2="20" stroke={rain} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'snow') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M6 14c-2 0-3.5-1.5-3.5-3.5S4 7 6 7c.3-2 2-3.5 4-3.5 1.8 0 3.3 1.2 3.8 2.8.4-.2.8-.3 1.2-.3 2.2 0 4 1.8 4 4s-1.8 4-4 4H6z" fill={mutedCloud} />
        <circle cx="8" cy="18" r="1" fill="var(--color-weather-snow)" />
        <circle cx="12" cy="19" r="1" fill="var(--color-weather-snow)" />
        <circle cx="16" cy="18" r="1" fill="var(--color-weather-snow)" />
      </svg>
    );
  }
  if (type === 'thunder') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M6 12c-2 0-3.5-1.5-3.5-3.5S4 5 6 5c.3-2 2-3.5 4-3.5 1.8 0 3.3 1.2 3.8 2.8.4-.2.8-.3 1.2-.3 2.2 0 4 1.8 4 4s-1.8 4-4 4H6z" fill="var(--color-weather-thunder-cloud)" />
        <polygon points="12,14 10,18 12,18 11,22 15,16 13,16 14,14" fill="var(--color-weather-lightning)" />
      </svg>
    );
  }
  if (type === 'fog') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <line x1="4" y1="10" x2="20" y2="10" stroke={mutedCloud} strokeWidth="2" strokeLinecap="round" />
        <line x1="6" y1="14" x2="18" y2="14" stroke={mutedCloud} strokeWidth="2" strokeLinecap="round" />
        <line x1="4" y1="18" x2="20" y2="18" stroke={mutedCloud} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return null;
}

// ─── Geo & Weather fetching (reused from original) ─────────────────
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&accept-language=en`
    );
    const data = await res.json();
    return data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county || 'Your city';
  } catch {
    return 'Your city';
  }
}

async function getLocationByIP(): Promise<{ lat: number; lon: number; city: string } | null> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    if (data.latitude && data.longitude)
      return { lat: data.latitude, lon: data.longitude, city: data.city || 'Your city' };
  } catch {
    /* */
  }
  return { lat: 19.076, lon: 72.8777, city: 'Mumbai' };
}

async function fetchWeatherData(lat: number, lon: number, city: string): Promise<WeatherData> {
  const r = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`
  ).then((r) => r.json());
  return {
    city,
    temp: Math.round(r.current.temperature_2m),
    feelsLike: Math.round(r.current.apparent_temperature),
    high: Math.round(r.daily.temperature_2m_max[0]),
    low: Math.round(r.daily.temperature_2m_min[0]),
    description: interpretWeatherCode(r.current.weather_code).description,
    code: r.current.weather_code,
  };
}

// ─── Live clock ────────────────────────────────────────────────────
function useCurrentTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// ─── Greeting ──────────────────────────────────────────────────────
function getGreeting(tod: TimeOfDay): string {
  switch (tod) {
    case 'dawn': return 'Good Morning';
    case 'morning': return 'Good Morning';
    case 'afternoon': return 'Good Afternoon';
    case 'evening': return 'Good Evening';
    case 'night': return 'Good Night';
  }
}

// ═══════════════════════════════════════════════════════════════════
// HELLO WIDGET — Main Export
// ═══════════════════════════════════════════════════════════════════

export function HelloWidget({ userName }: { userName?: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const now = useCurrentTime();

  useEffect(() => {
    let cancelled = false;
    const doFetch = async (lat: number, lon: number, city: string) => {
      try {
        const data = await fetchWeatherData(lat, lon, city);
        if (!cancelled) {
          setWeather(data);
          localStorage.setItem('ikan-weather-cache', JSON.stringify({ data, ts: Date.now() }));
        }
      } catch {
        /* */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const cached = localStorage.getItem('ikan-weather-cache');
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached);
        if (data && Date.now() - ts < 30 * 60 * 1000) {
          setWeather(data);
          setLoading(false);
          return;
        }
      } catch {
        /* */
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          doFetch(pos.coords.latitude, pos.coords.longitude, city);
        },
        async () => {
          const loc = await getLocationByIP();
          if (loc && !cancelled) doFetch(loc.lat, loc.lon, loc.city);
          else if (!cancelled) setLoading(false);
        },
        { timeout: 5000, maximumAge: 300000 }
      );
    } else {
      getLocationByIP().then((loc) => {
        if (loc && !cancelled) doFetch(loc.lat, loc.lon, loc.city);
        else if (!cancelled) setLoading(false);
      });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Derived values ───────────────────────────────────────────────
  const hour = now.getHours();
  const tod = getTimeOfDay(hour);
  const greeting = getGreeting(tod);
  const weatherType = weather ? interpretWeatherCode(weather.code).type : 'cloudy';

  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateFmt = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const timeFmt = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const textColor = getTextColor(tod);
  const mutedColor = getMutedColor(tod);
  const dividerColor = getDividerColor(tod);

  // ── Loading skeleton ─────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="animate-pulse"
        style={{
          height: 72,
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-bg-muted)',
          flexShrink: 0,
        }}
      />
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════
  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        background: getTimeGradient(tod),
        boxShadow: 'var(--shadow-sm)',
        flexShrink: 0,
        overflow: 'hidden',
        border: tod === 'night' ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--color-border-default)',
        transition: 'background 1s ease',
      }}
    >
      {/* ═══ MOBILE LAYOUT ═══ */}
      <div className="flex md:hidden" style={{ padding: '14px 16px', gap: 12, alignItems: 'center' }}>
        {/* Celestial + weather icon stack */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <CelestialIcon tod={tod} size={44} />
          {weather && weatherType !== 'clear' && (
            <div style={{ position: 'absolute', bottom: -2, right: -4 }}>
              <WeatherConditionIcon type={weatherType} size={18} tod={tod} />
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Row 1: Greeting + temp */}
          <div className="flex items-center justify-between" style={{ gap: 8 }}>
            <span
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 500,
                fontFamily: 'var(--font-family-base)',
                color: textColor,
                lineHeight: 1.2,
              }}
            >
              {greeting}
            </span>
            {weather && (
              <div className="flex items-center" style={{ gap: 4, flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 500,
                    fontFamily: 'var(--font-family-base)',
                    color: textColor,
                    lineHeight: 1,
                  }}
                >
                  {weather.temp}°
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 400,
                    fontFamily: 'var(--font-family-base)',
                    color: mutedColor,
                  }}
                >
                  {weather.description}
                </span>
              </div>
            )}
          </div>

          {/* Row 2: Day · Date · Time · Location */}
          <div className="flex items-center flex-wrap" style={{ gap: 4, marginTop: 5 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                fontFamily: 'var(--font-family-base)',
                color: textColor,
              }}
            >
              {dayName.slice(0, 3)}
            </span>
            <span style={{ fontSize: 10, color: mutedColor }}>·</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 400,
                fontFamily: 'var(--font-family-base)',
                color: mutedColor,
              }}
            >
              {now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span style={{ fontSize: 10, color: mutedColor }}>·</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 400,
                fontFamily: 'var(--font-family-base)',
                color: mutedColor,
              }}
            >
              {timeFmt}
            </span>
            {weather && (
              <>
                <span style={{ fontSize: 10, color: mutedColor }}>·</span>
                <span className="flex items-center" style={{ gap: 2 }}>
                  <MapPin size={9} style={{ color: mutedColor }} />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 400,
                      fontFamily: 'var(--font-family-base)',
                      color: mutedColor,
                    }}
                  >
                    {weather.city}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═══ DESKTOP LAYOUT ═══ */}
      <div className="hidden md:flex" style={{ padding: '20px 24px', gap: 16, alignItems: 'center' }}>
        {/* Celestial + weather icon stack */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <CelestialIcon tod={tod} size={56} />
          {weather && weatherType !== 'clear' && (
            <div style={{ position: 'absolute', bottom: -2, right: -4 }}>
              <WeatherConditionIcon type={weatherType} size={22} tod={tod} />
            </div>
          )}
        </div>

        {/* Greeting + name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 500,
              fontFamily: 'var(--font-family-base)',
              color: textColor,
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {greeting}{userName ? `, ${userName}.` : '.'}
          </h2>
          {/* Date + time + location row */}
          <div className="flex items-center flex-wrap" style={{ gap: 6, marginTop: 6 }}>
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                fontFamily: 'var(--font-family-base)',
                color: textColor,
              }}
            >
              {dayName}
            </span>
            <span style={{ fontSize: 12, color: mutedColor }}>·</span>
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 400,
                fontFamily: 'var(--font-family-base)',
                color: mutedColor,
              }}
            >
              {dateFmt}
            </span>
            <span style={{ fontSize: 12, color: mutedColor }}>·</span>
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 400,
                fontFamily: 'var(--font-family-base)',
                color: mutedColor,
              }}
            >
              {timeFmt}
            </span>
          </div>
        </div>

        {/* Weather info (right side) */}
        {weather && (
          <div className="flex items-center" style={{ gap: 12, flexShrink: 0 }}>
            <div style={{
              height: 40,
              width: 1,
              backgroundColor: dividerColor,
            }} />
            <div className="flex flex-col items-end" style={{ gap: 2 }}>
              <div className="flex items-center" style={{ gap: 4 }}>
                <span
                  style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 500,
                    fontFamily: 'var(--font-family-base)',
                    color: textColor,
                    lineHeight: 1,
                  }}
                >
                  {weather.temp}°C
                </span>
              </div>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 400,
                  fontFamily: 'var(--font-family-base)',
                  color: mutedColor,
                }}
              >
                {weather.description}
              </span>
              <span className="flex items-center" style={{ gap: 3 }}>
                <MapPin size={10} style={{ color: mutedColor }} />
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 400,
                    fontFamily: 'var(--font-family-base)',
                    color: mutedColor,
                  }}
                >
                  {weather.city}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Keep backward-compatible export
export { HelloWidget as WeatherWidget };