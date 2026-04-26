import { ZONES, ZONE_LABELS } from '../config/qualificationRules.js';

const LEGEND_ORDER = [
  ZONES.UCL_LEAGUE,
  ZONES.UCL_QUALIFYING,
  ZONES.UEL_LEAGUE,
  ZONES.UEL_QUALIFYING,
  ZONES.UECL_QUALIFYING,
  ZONES.RELEGATION_PLAYOFF,
  ZONES.RELEGATED,
];

export default function ZoneLegend() {
  return (
    <div className="legend" role="list" aria-label="Qualification zone legend">
      {LEGEND_ORDER.map((zone) => (
        <div key={zone} className="legend__item" role="listitem" data-zone={zone}>
          <span className="legend__swatch" />
          <span className="legend__label">{ZONE_LABELS[zone]}</span>
        </div>
      ))}
    </div>
  );
}
