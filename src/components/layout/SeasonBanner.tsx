import React, { useEffect, useState } from 'react';
import { SeasonTheme, seasonForDate, seasonLabel } from '../../utils/seasonTheme';

const MARKS: Record<Exclude<SeasonTheme, 'default'>, string> = {
  thanksgiving: '🍂  🍁  🦃',
  christmas: '🎄  ✨  🎁',
  newyear: '🥂  ✨  🎆',
};

export function useSeasonTheme(): SeasonTheme {
  const [season, setSeason] = useState<SeasonTheme>(() => seasonForDate(new Date()));

  useEffect(() => {
    const apply = () => setSeason(seasonForDate(new Date()));
    apply();
    const timer = window.setInterval(apply, 60 * 60 * 1000);
    document.addEventListener('visibilitychange', apply);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', apply);
    };
  }, []);

  useEffect(() => {
    if (season === 'default') delete document.documentElement.dataset.season;
    else document.documentElement.dataset.season = season;
    return () => {
      delete document.documentElement.dataset.season;
    };
  }, [season]);

  return season;
}

export const SeasonBanner: React.FC<{ season: SeasonTheme }> = ({ season }) => {
  if (season === 'default') return null;
  const label = seasonLabel(season);
  return (
    <div className="season-banner" role="note" aria-label={label}>
      <span className="season-banner-marks" aria-hidden="true">{MARKS[season]}</span>
      <span className="season-banner-label">{label}</span>
      <span className="season-banner-marks" aria-hidden="true">{MARKS[season]}</span>
    </div>
  );
};
