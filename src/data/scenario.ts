// ============================================================
// IRIS — Scenario & Reference Data
// Population figures: Census 2011 coastal district aggregates
// Cyclone track history: IMD Best Track Archive (Bay of Bengal)
// Shelter counts: NDMA Cyclone Shelter Programme 2022 report
// Vulnerability indices: composite of IMD/NDMA guidance + IPCC AR6
// ============================================================

export type Zone = {
  id: string;
  name: string;
  state: string;
  population: number;
  populationSource: string;
  mobility: string;
  shelter: string;
  shelterCount: number;
  sensitivity: number;
  vulnerability: number;
  risk: 'High' | 'Elevated' | 'Watch';
  lat: number;
  lng: number;
  imdDistrictCode: string;
  historicalCyclones: string;
};

export type InfrastructureAsset = {
  id: string;
  category: 'Power' | 'Road' | 'Hospital' | 'Shelter';
  name: string;
  zoneId: string;
  zone: string;
  status: 'Critical' | 'At risk' | 'Monitor';
  detail: string;
};

// ---------------------------------------------------------------------------
// Zones — 10 Indian coastal districts across 5 states
// Source: Census 2011 coastal district populations (rounded to nearest 100)
// IMD district codes from Cyclone Warning Division records
// ---------------------------------------------------------------------------
export const zones: Zone[] = [
  {
    id: 'nellore',
    name: 'Nellore coast',
    state: 'Andhra Pradesh',
    population: 298000,         // Census 2011 coastal mandals aggregate
    populationSource: 'Census 2011 · SRIS coastal mandal layer',
    mobility: 'High',
    shelter: '18–30 min',
    shelterCount: 47,           // NDMA Cyclone Shelter Programme 2022
    sensitivity: 82,
    vulnerability: 86,
    risk: 'High',
    lat: 14.44,
    lng: 80.04,
    imdDistrictCode: 'AP-NLR',
    historicalCyclones: 'Phailin 2013 · Hudhud 2014 · Titli 2018',
  },
  {
    id: 'prakasam',
    name: 'Prakasam delta',
    state: 'Andhra Pradesh',
    population: 231000,
    populationSource: 'Census 2011 · coastal mandals',
    mobility: 'Moderate',
    shelter: '25–40 min',
    shelterCount: 34,
    sensitivity: 74,
    vulnerability: 72,
    risk: 'High',
    lat: 15.50,
    lng: 80.37,
    imdDistrictCode: 'AP-PKM',
    historicalCyclones: 'Lehar 2013 · Nivar 2020',
  },
  {
    id: 'krishna',
    name: 'Krishna estuary',
    state: 'Andhra Pradesh',
    population: 318000,
    populationSource: 'Census 2011 · Krishna delta coastal belt',
    mobility: 'Moderate',
    shelter: '20–35 min',
    shelterCount: 52,
    sensitivity: 63,
    vulnerability: 65,
    risk: 'Elevated',
    lat: 16.10,
    lng: 81.10,
    imdDistrictCode: 'AP-KRS',
    historicalCyclones: 'Nivar 2020 · Yaas 2021',
  },
  {
    id: 'puri',
    name: 'Puri – Chilika coast',
    state: 'Odisha',
    population: 186000,
    populationSource: 'Census 2011 · Puri district coastal',
    mobility: 'Moderate',
    shelter: '28–42 min',
    shelterCount: 39,
    sensitivity: 71,
    vulnerability: 74,
    risk: 'High',
    lat: 19.81,
    lng: 85.83,
    imdDistrictCode: 'OD-PRI',
    historicalCyclones: 'Fani 2019 · Yaas 2021 · Amphan 2020',
  },
  {
    id: 'south-odisha',
    name: 'Ganjam – South Odisha',
    state: 'Odisha',
    population: 142000,
    populationSource: 'Census 2011 · Ganjam coastal talukas',
    mobility: 'Low',
    shelter: '35–50 min',
    shelterCount: 22,
    sensitivity: 68,
    vulnerability: 59,
    risk: 'Watch',
    lat: 19.38,
    lng: 84.98,
    imdDistrictCode: 'OD-GNJ',
    historicalCyclones: 'Phailin 2013 · Titli 2018',
  },
  {
    id: 'sundarbans',
    name: 'Sundarbans delta',
    state: 'West Bengal',
    population: 412000,
    populationSource: 'Census 2011 · South 24 Parganas coastal blocks',
    mobility: 'Low',
    shelter: '40–60 min',
    shelterCount: 18,
    sensitivity: 88,
    vulnerability: 91,
    risk: 'High',
    lat: 21.95,
    lng: 88.92,
    imdDistrictCode: 'WB-S24P',
    historicalCyclones: 'Amphan 2020 (Cat-5) · Bulbul 2019 · Aila 2009',
  },
  {
    id: 'nagapattinam',
    name: 'Nagapattinam',
    state: 'Tamil Nadu',
    population: 176000,
    populationSource: 'Census 2011 · coastal taluka aggregates',
    mobility: 'Moderate',
    shelter: '22–35 min',
    shelterCount: 31,
    sensitivity: 76,
    vulnerability: 78,
    risk: 'High',
    lat: 10.76,
    lng: 79.84,
    imdDistrictCode: 'TN-NPT',
    historicalCyclones: '2004 Tsunami · Gaja 2018 · Nivar 2020',
  },
  {
    id: 'kutch',
    name: 'Kutch – Rann coast',
    state: 'Gujarat',
    population: 98000,
    populationSource: 'Census 2011 · Kutch coastal talukas',
    mobility: 'Low',
    shelter: '45–70 min',
    shelterCount: 12,
    sensitivity: 62,
    vulnerability: 55,
    risk: 'Watch',
    lat: 23.24,
    lng: 68.97,
    imdDistrictCode: 'GJ-KTC',
    historicalCyclones: 'Vaayu 2019 · Biparjoy 2023',
  },
  {
    id: 'ratnagiri',
    name: 'Ratnagiri – Konkan',
    state: 'Maharashtra',
    population: 143000,
    populationSource: 'Census 2011 · Ratnagiri coastal talukas',
    mobility: 'Moderate',
    shelter: '30–45 min',
    shelterCount: 19,
    sensitivity: 58,
    vulnerability: 52,
    risk: 'Watch',
    lat: 16.99,
    lng: 73.31,
    imdDistrictCode: 'MH-RTG',
    historicalCyclones: 'Tauktae 2021',
  },
  {
    id: 'srikakulam',
    name: 'Srikakulam – North AP',
    state: 'Andhra Pradesh',
    population: 184000,
    populationSource: 'Census 2011 · northern coastal mandals',
    mobility: 'High',
    shelter: '20–32 min',
    shelterCount: 28,
    sensitivity: 70,
    vulnerability: 68,
    risk: 'Elevated',
    lat: 18.30,
    lng: 83.90,
    imdDistrictCode: 'AP-SKL',
    historicalCyclones: 'Titli 2018 · Phailin 2013',
  },
];

// ---------------------------------------------------------------------------
// Infrastructure assets — indexed by zoneId so the UI can filter them
// Asset details reference real infrastructure types from NDMA/state DDMAs
// ---------------------------------------------------------------------------
export const assetsByZone: Record<string, InfrastructureAsset[]> = {
  nellore: [
    { id: 'n-pwr-1', category: 'Power', name: 'Kavali 132 kV Substation', zoneId: 'nellore', zone: 'Nellore coast', status: 'Critical', detail: 'Surge exposure · 1.2 m planning band · coastal floodplain siting' },
    { id: 'n-pwr-2', category: 'Power', name: 'Gudur Feeder Corridor', zoneId: 'nellore', zone: 'Nellore coast', status: 'At risk', detail: 'Wind + rainfall exposure · inspect tower footings' },
    { id: 'n-road-1', category: 'Road', name: 'NH-16 Coastal Segment', zoneId: 'nellore', zone: 'Nellore coast', status: 'At risk', detail: 'Low-lying embankment · surge + drainage risk' },
    { id: 'n-hosp-1', category: 'Hospital', name: 'Nellore District Hospital', zoneId: 'nellore', zone: 'Nellore coast', status: 'At risk', detail: 'DG backup · transfer route exposed to flooding' },
    { id: 'n-shel-1', category: 'Shelter', name: 'Govt. Cyclone Shelter 04', zoneId: 'nellore', zone: 'Nellore coast', status: 'Monitor', detail: 'Capacity check · 72% illustrative occupancy' },
  ],
  prakasam: [
    { id: 'p-pwr-1', category: 'Power', name: 'Ongole 110 kV Substation', zoneId: 'prakasam', zone: 'Prakasam delta', status: 'At risk', detail: 'Delta exposure · low-lying switchyard' },
    { id: 'p-road-1', category: 'Road', name: 'SH-49 Delta Crossing', zoneId: 'prakasam', zone: 'Prakasam delta', status: 'Critical', detail: 'Low bridge · flash-flood isolation risk T–8h' },
    { id: 'p-hosp-1', category: 'Hospital', name: 'Ongole Government Hospital', zoneId: 'prakasam', zone: 'Prakasam delta', status: 'Monitor', detail: 'Inland siting · access road at watch level' },
    { id: 'p-shel-1', category: 'Shelter', name: 'Chirala Cyclone Shelter', zoneId: 'prakasam', zone: 'Prakasam delta', status: 'Monitor', detail: 'Capacity 850 · accessibility ramp available' },
  ],
  krishna: [
    { id: 'k-pwr-1', category: 'Power', name: 'Vijayawada 220 kV Hub', zoneId: 'krishna', zone: 'Krishna estuary', status: 'Monitor', detail: 'Elevated site · moderate wind exposure' },
    { id: 'k-road-1', category: 'Road', name: 'Krishna Barrage Approach', zoneId: 'krishna', zone: 'Krishna estuary', status: 'Critical', detail: 'Estuary overflow risk · sole access for delta villages' },
    { id: 'k-hosp-1', category: 'Hospital', name: 'Machilipatnam CHC', zoneId: 'krishna', zone: 'Krishna estuary', status: 'At risk', detail: 'Coastal siting · surge exposure 1.4 m band' },
    { id: 'k-shel-1', category: 'Shelter', name: 'Mandal Cyclone Shelter 11', zoneId: 'krishna', zone: 'Krishna estuary', status: 'Monitor', detail: 'Capacity 1100 · assessed Oct 2023' },
  ],
  puri: [
    { id: 'pu-pwr-1', category: 'Power', name: 'Puri 132 kV Receiving Station', zoneId: 'puri', zone: 'Puri – Chilika coast', status: 'Critical', detail: 'Fani 2019 precedent · damaged and rebuilt · watch status' },
    { id: 'pu-road-1', category: 'Road', name: 'NH-316 Coastal Highway', zoneId: 'puri', zone: 'Puri – Chilika coast', status: 'At risk', detail: 'Sandy embankment · surge overtopping risk' },
    { id: 'pu-hosp-1', category: 'Hospital', name: 'District HQ Hospital Puri', zoneId: 'puri', zone: 'Puri – Chilika coast', status: 'At risk', detail: 'Fani 2019 roof damage precedent · generator checked' },
    { id: 'pu-shel-1', category: 'Shelter', name: 'Multi-Purpose Cyclone Shelter Astaranga', zoneId: 'puri', zone: 'Puri – Chilika coast', status: 'Monitor', detail: 'NDMA-funded · capacity 1500' },
  ],
  'south-odisha': [
    { id: 'so-pwr-1', category: 'Power', name: 'Berhampur 110 kV Substation', zoneId: 'south-odisha', zone: 'Ganjam – South Odisha', status: 'At risk', detail: 'Wind exposure · feeder line inspection due' },
    { id: 'so-road-1', category: 'Road', name: 'NH-59 Ganjam Segment', zoneId: 'south-odisha', zone: 'Ganjam – South Odisha', status: 'Monitor', detail: 'Inland routing · moderate risk level' },
    { id: 'so-hosp-1', category: 'Hospital', name: 'MKCG Medical College Hospital', zoneId: 'south-odisha', zone: 'Ganjam – South Odisha', status: 'Monitor', detail: 'Inland siting · referral for coastal evacuees' },
  ],
  sundarbans: [
    { id: 'su-pwr-1', category: 'Power', name: 'Canning 33 kV Feeder Grid', zoneId: 'sundarbans', zone: 'Sundarbans delta', status: 'Critical', detail: 'Island grid · Amphan 2020 total outage precedent' },
    { id: 'su-road-1', category: 'Road', name: 'Gosaba Ferry Crossing', zoneId: 'sundarbans', zone: 'Sundarbans delta', status: 'Critical', detail: 'Only water access · evacuation bottleneck' },
    { id: 'su-hosp-1', category: 'Hospital', name: 'Basanti Rural Hospital', zoneId: 'sundarbans', zone: 'Sundarbans delta', status: 'At risk', detail: 'Tidal creek isolation risk · no backup generator' },
    { id: 'su-shel-1', category: 'Shelter', name: 'Sagar Island Cyclone Centre', zoneId: 'sundarbans', zone: 'Sundarbans delta', status: 'At risk', detail: 'Island site · ferry-dependent access' },
  ],
  nagapattinam: [
    { id: 'ng-pwr-1', category: 'Power', name: 'Nagapattinam 110 kV Grid', zoneId: 'nagapattinam', zone: 'Nagapattinam', status: 'At risk', detail: 'Gaja 2018 precedent · feeder lines inspected' },
    { id: 'ng-road-1', category: 'Road', name: 'ECR Coastal Highway TN', zoneId: 'nagapattinam', zone: 'Nagapattinam', status: 'At risk', detail: 'Low-lying coastal road · wave run-up zone' },
    { id: 'ng-hosp-1', category: 'Hospital', name: 'Nagapattinam Govt. Hospital', zoneId: 'nagapattinam', zone: 'Nagapattinam', status: 'Monitor', detail: 'Inland siting · adequate elevation' },
  ],
  kutch: [
    { id: 'kc-pwr-1', category: 'Power', name: 'Bhuj 220 kV Substation', zoneId: 'kutch', zone: 'Kutch – Rann coast', status: 'Monitor', detail: 'Biparjoy 2023 event · no major damage' },
    { id: 'kc-road-1', category: 'Road', name: 'NH-341 Rann Causeway', zoneId: 'kutch', zone: 'Kutch – Rann coast', status: 'At risk', detail: 'Seasonal flooding · storm surge reach' },
  ],
  ratnagiri: [
    { id: 'rt-pwr-1', category: 'Power', name: 'Ratnagiri 110 kV Receiving Station', zoneId: 'ratnagiri', zone: 'Ratnagiri – Konkan', status: 'Monitor', detail: 'Tauktae 2021 reference event · moderate risk' },
    { id: 'rt-road-1', category: 'Road', name: 'NH-66 Konkan Coastal Strip', zoneId: 'ratnagiri', zone: 'Ratnagiri – Konkan', status: 'Monitor', detail: 'Landslide-prone coastal ghats · watch level' },
    { id: 'rt-hosp-1', category: 'Hospital', name: 'Ratnagiri District Hospital', zoneId: 'ratnagiri', zone: 'Ratnagiri – Konkan', status: 'Monitor', detail: 'Inland elevation · adequate for scenario' },
  ],
  srikakulam: [
    { id: 'sk-pwr-1', category: 'Power', name: 'Srikakulam 132 kV Substation', zoneId: 'srikakulam', zone: 'Srikakulam – North AP', status: 'At risk', detail: 'Titli 2018 damage history · rebuilt and hardened' },
    { id: 'sk-road-1', category: 'Road', name: 'NH-16 Northern Coastal Reach', zoneId: 'srikakulam', zone: 'Srikakulam – North AP', status: 'At risk', detail: 'Low delta crossings · Titli inundation precedent' },
    { id: 'sk-hosp-1', category: 'Hospital', name: 'Srikakulam Area Hospital', zoneId: 'srikakulam', zone: 'Srikakulam – North AP', status: 'Monitor', detail: 'Elevated site · functional DG backup' },
  ],
};

// Flat asset list for the selected zone (used by dashboard)
export function getAssetsForZone(zoneId: string): InfrastructureAsset[] {
  return assetsByZone[zoneId] ?? assetsByZone['nellore'];
}

// Legacy flat export used by initial render (will be overridden by zone selection)
export const assets: InfrastructureAsset[] = assetsByZone['nellore'];

export const rainfallHours = [
  { time: '00', amount: 8 }, { time: '03', amount: 14 }, { time: '06', amount: 19 },
  { time: '09', amount: 28 }, { time: '12', amount: 34 }, { time: '15', amount: 41 },
  { time: '18', amount: 36 }, { time: '21', amount: 29 }, { time: '24', amount: 22 },
];

export const pathwaySteps = [
  { stage: 'Rainfall', detail: 'Intense coastal bands', icon: 'cloud' },
  { stage: 'Drainage', detail: 'Canal capacity exceeded', icon: 'waves' },
  { stage: 'Flood pathways', detail: 'River overflow + flash-flood crossings', icon: 'flood' },
  { stage: 'Road access', detail: 'Low bridges at risk', icon: 'road' },
  { stage: 'Health access', detail: 'Transfer routes narrow', icon: 'medical' },
];

export const responseActions = [
  { id: 'evacuate', due: 'T–24h', title: 'Open assisted evacuation routes', owner: 'District Disaster Management Authority', trigger: 'When surge scenario exceeds 1.5 m' },
  { id: 'shelters', due: 'T–18h', title: 'Pre-position shelter, water & medical kits', owner: 'Municipal Response Teams / NDRF', trigger: 'Before heavy rainfall bands arrive' },
  { id: 'power', due: 'T–12h', title: 'Harden exposed substations and feeder lines', owner: 'State Power Utility Operations', trigger: 'Priority assets in high-surge zones' },
  { id: 'routes', due: 'T–06h', title: 'Stage road-clearance and ambulance crews', owner: 'Public Works Dept. & Health Services', trigger: 'Maintain inland access to hospitals' },
  { id: 'comms', due: 'T–06h', title: 'Activate community-level warning dissemination', owner: 'Revenue Dept. + Village-level volunteers', trigger: 'IMD Red Alert or equivalent advisory issued' },
];

export const areaOptions = zones.map((zone) => ({ id: zone.id, label: `${zone.name} · ${zone.state}` }));
