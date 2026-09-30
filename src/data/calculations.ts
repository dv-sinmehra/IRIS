// ============================================================
// IRIS — Physics-grounded scenario calculations
// Surge formula basis: IMD Storm Surge Atlas (INCOIS/NIOT)
// Saffir-Simpson / IMD cyclone category wind-surge relationships
// Rainfall reference: IMD EP/BoB cyclone climatology
// These remain illustrative planning estimates — not live forecasts
// ============================================================

export type Tide = 'High tide' | 'Mean tide';
export type SeaLevel = 'Baseline' | '+0.3 m SLR';

export type ScenarioCalculationInputs = {
  intensity: number;       // 1–5, maps to IMD Cyclone Category 1–5 (SCS to ESCS)
  selectedZone: string;
  tide: Tide;
  seaLevel: SeaLevel;
};

export type ScenarioCalculationOutputs = {
  tideFactor: number;
  seaLevelFactor: number;
  surgeMeters: number;
  regionalExposureEstimate: number;
  rainfall24hMm: number;
  scenarioIndex: number;
  estimatedLiquidityCrore: number;
  rainfallProfileMultiplier: number;
  imdCategory: string;
  windSpeedKmh: number;
};

// ---------------------------------------------------------------------------
// IMD cyclone category → estimated surge range (Bay of Bengal coastal geometry)
// Reference: INCOIS Storm Surge Atlas 2020; NIOT surge hindcasts (Fani, Amphan)
// Category 1 (SCS)   : 65–89 km/h  → surge 0.5–1.2 m
// Category 2 (CS)    : 89–117 km/h → surge 1.2–2.0 m
// Category 3 (SCS+)  : 117–167 km/h → surge 2.0–3.5 m
// Category 4 (VSCS)  : 167–221 km/h → surge 3.5–5.5 m
// Category 5 (ESCS)  : >221 km/h   → surge 5.0–8.0 m (Amphan: 5.1 m at Sagar)
// ---------------------------------------------------------------------------
const IMD_CATEGORIES = ['', 'SCS (Cat-1)', 'CS (Cat-2)', 'SCS+ (Cat-3)', 'VSCS (Cat-4)', 'ESCS (Cat-5)'];
const BASE_SURGE     = [0, 0.85, 1.60, 2.75, 4.50, 6.20];   // median of range, metres
const WIND_SPEED_KMH = [0, 77, 103, 142, 194, 245];          // representative central estimate
// Rainfall climatology (BoB landfall, 24-hour accumulation estimate)
const BASE_RAINFALL  = [0, 155, 210, 275, 340, 420];         // mm/24h, IMD EP statistics

export function calculateScenarioOutputs(input: ScenarioCalculationInputs): ScenarioCalculationOutputs {
  const i = Math.max(1, Math.min(5, input.intensity));

  // Tide adds to surge (spring vs neap: ~0.5 m typical BoB meso-tidal coast)
  const tideFactor = input.tide === 'High tide' ? 0.48 : 0.0;

  // Sea-level rise scenario (+0.3 m is IPCC AR6 RCP4.5 mid-century median for BoB)
  const seaLevelFactor = input.seaLevel === '+0.3 m SLR' ? 0.30 : 0.0;

  // Zone geography modifier (delta geometry vs open coast)
  const zoneModifiers: Record<string, number> = {
    sundarbans: 0.60,   // Funnel geometry amplifies surge (Amphan 5.1 m precedent)
    puri: 0.30,         // Shallow shelf
    nagapattinam: 0.25, // Cauvery delta
    krishna: 0.20,
    nellore: 0.10,
    prakasam: 0.10,
    'south-odisha': 0.05,
    srikakulam: 0.15,
    kutch: 0.20,        // Gulf of Kutch resonance
    ratnagiri: -0.10,   // Steep shelf reduces surge
  };
  const zoneGeometry = zoneModifiers[input.selectedZone] ?? 0;

  const surgeMeters = Math.max(0.4, BASE_SURGE[i] + tideFactor + seaLevelFactor + zoneGeometry);

  // Population exposure scales with surge extent and zone population
  const zonePop: Record<string, number> = {
    sundarbans: 412000, puri: 186000, nagapattinam: 176000, krishna: 318000,
    nellore: 298000, prakasam: 231000, 'south-odisha': 142000, srikakulam: 184000,
    kutch: 98000, ratnagiri: 143000,
  };
  const basePop = zonePop[input.selectedZone] ?? 200000;
  // Fraction exposed grows with surge height (simplistic linear, capped at 65%)
  const exposureFraction = Math.min(0.65, 0.08 + (surgeMeters / 8) * 0.60);
  const regionalExposureEstimate = Math.round(basePop * exposureFraction);

  const rainfall24hMm = Math.round(
    BASE_RAINFALL[i]
    + (input.selectedZone === 'krishna' || input.selectedZone === 'sundarbans' ? 30 : 0)
    + (input.selectedZone === 'kutch' ? -40 : 0)   // Arabian Sea drier
  );

  // Scenario severity index (0–100, planning heuristic only)
  const scenarioIndex = Math.min(97, Math.round(
    (surgeMeters / 8) * 55
    + (rainfall24hMm / 420) * 25
    + (tideFactor > 0 ? 8 : 0)
    + (seaLevelFactor > 0 ? 5 : 0)
    + (input.selectedZone === 'sundarbans' ? 4 : 0)
  ));

  // Parametric liquidity estimate (₹ crore) — illustrative scaling
  // Reference: NDMA post-cyclone damage reports for equivalent category events
  const estimatedLiquidityCrore = Number((
    8.0 + (surgeMeters * 6.5) + (rainfall24hMm * 0.04) + (regionalExposureEstimate / 12000)
  ).toFixed(1));

  const rainfallProfileMultiplier = 0.72 + (i - 1) * 0.09;

  return {
    tideFactor,
    seaLevelFactor,
    surgeMeters,
    regionalExposureEstimate,
    rainfall24hMm,
    scenarioIndex,
    estimatedLiquidityCrore,
    rainfallProfileMultiplier,
    imdCategory: IMD_CATEGORIES[i],
    windSpeedKmh: WIND_SPEED_KMH[i],
  };
}

export const FIXED_LANDFALL_WINDOW_HOURS = 22;

export function formatPopulation(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}
