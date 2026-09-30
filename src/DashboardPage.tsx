import { useEffect, useMemo, useState, useRef, type CSSProperties, type ReactNode } from 'react';
import CalculationsDialog from './components/CalculationsDialog';
import { calculateScenarioOutputs, FIXED_LANDFALL_WINDOW_HOURS, type SeaLevel, type Tide } from './data/calculations';
import { generateAdvisory, generateRiskNarrative, type Language } from './data/gemini';
import {
  Activity, ArrowDownRight, ArrowLeft, ArrowUpRight, Bell, Building2, Calculator, Check, ChevronDown, CircleHelp,
  ClipboardCheck, Clock3, CloudRain, Droplets, FileText, Globe, HeartPulse, Info, Map, Menu,
  MessageSquareText, Radio, Route, Shield, ShieldAlert, ShieldCheck, SlidersHorizontal,
  Sparkles, Target, Timer, UsersRound, Waves, Wind, Zap, Loader2, Wind as WindIcon,
} from 'lucide-react';
import { RiskMap, type MapLayers } from './components/RiskMap';
import { areaOptions, pathwaySteps, rainfallHours, responseActions, zones, getAssetsForZone } from './data/scenario';

type NavItem = { id: string; label: string; icon: typeof Map };

const navItems: NavItem[] = [
  { id: 'overview', label: 'Command overview', icon: Activity },
  { id: 'risk-map', label: 'Risk map', icon: Map },
  { id: 'pathways', label: 'Impact pathways', icon: Waves },
  { id: 'infrastructure', label: 'Critical assets', icon: Building2 },
  { id: 'communities', label: 'Communities', icon: UsersRound },
  { id: 'planner', label: 'Action planner', icon: ClipboardCheck },
  { id: 'liquidity', label: 'Parametric cover', icon: Shield },
  { id: 'advisories', label: 'Advisories', icon: MessageSquareText },
];

const LANGUAGES: Language[] = [
  'English',
  'हिन्दी (Hindi)',
  'తెలుగు (Telugu)',
  'বাংলা (Bengali)',
  'தமிழ் (Tamil)',
  'ગુજરાતી (Gujarati)',
];

const formatCompact = (value: number) => {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  return `${Math.round(value / 1000)}k`;
};
const statusColor = (status: string) => status === 'Critical' || status === 'High' ? 'danger' : status === 'At risk' || status === 'Elevated' ? 'warning' : 'neutral';

function SectionTitle({ eyebrow, title, subtitle, marker = 'SCENARIO' }: { eyebrow: string; title: string; subtitle?: string; marker?: string }) {
  return <div className="section-heading"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><span className="sim-tag"><span />{marker}</span></div>;
}
function PanelHeading({ icon, title, action }: { icon: ReactNode; title: string; action?: ReactNode }) {
  return <div className="panel-heading"><div className="panel-title">{icon}<h3>{title}</h3></div>{action}</div>;
}
function MetricCard({ label, value, unit, note, icon, tone = 'teal', trend }: { label: string; value: string; unit?: string; note: string; icon: ReactNode; tone?: string; trend?: string }) {
  return <article className={`metric-card metric-${tone}`}><div className="metric-top"><span>{label}</span><span className="metric-icon">{icon}</span></div><div className="metric-value">{value}{unit && <small>{unit}</small>}</div><div className="metric-note">{trend && <b><ArrowUpRight size={12} />{trend}</b>}{note}</div></article>;
}
function RainfallChart({ totalRainfall, profileMultiplier }: { totalRainfall: number; profileMultiplier: number }) {
  const chartHeight = 140;
  const max = 55;
  const points = rainfallHours.map((point, index) => ({ ...point, x: 30 + index * 68, y: chartHeight - (point.amount * profileMultiplier / max) * 106 }));
  const line = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const area = `${line} L ${points.at(-1)?.x} ${chartHeight - 18} L ${points[0].x} ${chartHeight - 18} Z`;
  return <div className="rain-chart-wrap">
    <div className="chart-legend"><span><i className="legend-dot cyan" />IMD rainfall profile · relative shape (BoB climatology)</span><span className="chart-total">{totalRainfall}<small> mm / 24h · planning estimate</small></span></div>
    <svg viewBox="0 0 600 150" className="rain-chart" role="img" aria-label="Rainfall accumulation curve based on Bay of Bengal cyclone climatology">
      <defs><linearGradient id="rainFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#333333" stopOpacity=".23"/><stop offset="1" stopColor="#333333" stopOpacity="0"/></linearGradient></defs>
      {[28, 61, 94, 127].map((y) => <line key={y} x1="28" x2="584" y1={y} y2={y} stroke="#d0d0d0" strokeDasharray="3 6" />)}
      <path d={area} fill="url(#rainFill)" />
      <path d={line} fill="none" stroke="#333333" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((point) => <g key={point.time}><circle cx={point.x} cy={point.y} r="3.7" fill="#ffffff" stroke="#222222" strokeWidth="2" /><text x={point.x} y="146" textAnchor="middle" fill="#777777" fontSize="9" fontFamily="monospace">{point.time}h</text></g>)}
    </svg>
    <div className="chart-footnote"><span>Shape peaks near <b>15:00–18:00</b></span><span>IMD BoB cyclone climatology · illustrative shape</span></div>
  </div>;
}
function RiskPathway({ intensity }: { intensity: number }) {
  const severity = intensity >= 4 ? 'High stress' : intensity >= 3 ? 'Elevated' : 'Watch';
  return <div className="pathway-card">
    <PanelHeading icon={<Route size={16} />} title="Rainfall → disruption pathway" action={<span className="mini-chip">{severity}</span>} />
    <div className="pathway-flow">
      {pathwaySteps.map((step, index) => {
        const icons = [<CloudRain size={18} key="cloud" />, <Waves size={18} key="waves" />, <Droplets size={18} key="flood" />, <Route size={18} key="road" />, <HeartPulse size={18} key="medical" />];
        return <div className="pathway-step-wrap" key={step.stage}>
          <div className={`pathway-step ${index === pathwaySteps.length - 1 ? 'impact-step' : ''}`}><div className="pathway-icon">{icons[index]}</div><div><b>{step.stage}</b><span>{step.detail}</span></div></div>
          {index < pathwaySteps.length - 1 && <div className="pathway-connector"><span /></div>}
        </div>;
      })}
    </div>
    <div className="pathway-insight"><Info size={14} /><span>Pathway: rainfall exceeds canal capacity → river overflow + flash flooding → low-lying road isolation → delayed medical transfers. (Ref: NDMA damage reports, Fani 2019, Amphan 2020)</span></div>
  </div>;
}
function AssetIcon({ category }: { category: string }) {
  if (category === 'Power') return <Zap size={15} />;
  if (category === 'Road') return <Route size={15} />;
  if (category === 'Hospital') return <HeartPulse size={15} />;
  return <ShieldCheck size={15} />;
}

function DashboardPage({ onNavigateHome }: { onNavigateHome: () => void }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [intensity, setIntensity] = useState(3);
  const [selectedZone, setSelectedZone] = useState('nellore');
  const [tide, setTide] = useState<Tide>('High tide');
  const [seaLevel, setSeaLevel] = useState<SeaLevel>('Baseline');
  const [layers, setLayers] = useState<MapLayers>({ surge: true, rainfall: false, assets: true, track: true });
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [audience, setAudience] = useState('Coastal communities');
  const [advisory, setAdvisory] = useState('');
  const [draftStatus, setDraftStatus] = useState('No advisory drafted yet');
  const [advisoryLang, setAdvisoryLang] = useState<Language>('English');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [narrativeText, setNarrativeText] = useState('');
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);
  const [showCalculations, setShowCalculations] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<'sidebar' | 'topbar' | null>(null);
  // API key: read from .env (VITE_GEMINI_API_KEY) first, localStorage as runtime override
  const envKey = import.meta.env.VITE_GEMINI_API_KEY ?? '';
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('iris_gemini_key') || envKey);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const apiKeyRef = useRef<HTMLInputElement>(null);

  const selected = zones.find((zone) => zone.id === selectedZone) ?? zones[0];
  const calculationInputs = { intensity, selectedZone, tide, seaLevel };
  const outputs = calculateScenarioOutputs(calculationInputs);
  const surge = outputs.surgeMeters.toFixed(1);
  const exposedPopulation = outputs.regionalExposureEstimate;
  const rainfall = outputs.rainfall24hMm;
  const scenarioIndex = outputs.scenarioIndex;
  const estimatedLiquidity = outputs.estimatedLiquidityCrore.toFixed(1);
  const activeTitle = navItems.find((item) => item.id === activeSection)?.label ?? 'Command overview';
  const currentAssets = getAssetsForZone(selectedZone);

  const saveKey = (key: string) => {
    setApiKey(key);
    if (key) localStorage.setItem('iris_gemini_key', key);
    else localStorage.removeItem('iris_gemini_key');
    setShowKeyInput(false);
  };

  const navigate = (id: string) => {
    setActiveSection(id);
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: '-15% 0px -68% 0px', threshold: [0.05, 0.25, 0.5] });
    navItems.forEach((item) => { const element = document.getElementById(item.id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!notificationsOpen && !profileAnchor && !openHelp) return;
    const dismissOutside = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('[data-iris-popover]')) return;
      setNotificationsOpen(false); setProfileAnchor(null); setOpenHelp(false);
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setNotificationsOpen(false); setProfileAnchor(null); setOpenHelp(false); }
    };
    document.addEventListener('pointerdown', dismissOutside);
    window.addEventListener('keydown', dismissOnEscape);
    return () => { document.removeEventListener('pointerdown', dismissOutside); window.removeEventListener('keydown', dismissOnEscape); };
  }, [notificationsOpen, profileAnchor, openHelp]);

  const rankedZones = useMemo(() => [...zones].sort((a, b) => b.vulnerability - a.vulnerability), []);

  // Auto-generate AI risk narrative when zone/intensity changes (if key is set)
  useEffect(() => {
    if (!apiKey || apiKey.length < 20) return;
    setNarrativeText('');
    setNarrativeLoading(true);
    generateRiskNarrative({
      zone: selected.name,
      state: selected.state,
      surgeMeters: outputs.surgeMeters,
      rainfall24hMm: outputs.rainfall24hMm,
      imdCategory: outputs.imdCategory,
      exposedPopulation: outputs.regionalExposureEstimate,
      historicalCyclones: selected.historicalCyclones,
      apiKey,
    }).then((res) => {
      setNarrativeLoading(false);
      if (res.error) setNarrativeText('');
      else setNarrativeText(res.text);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZone, intensity, tide, seaLevel, apiKey]);

  const createDraft = async () => {
    if (!apiKey || apiKey.length < 20) {
      // Fallback template if no key
      const message = `PLANNING SCENARIO — NOT AN OFFICIAL WARNING\n\nTo: ${audience}\n\nThis is an illustrative cyclone preparedness scenario for ${selected.name}, ${selected.state}.\n\nScenario parameters (IMD ${outputs.imdCategory}): Storm surge planning band ~${surge} m, estimated 24-hour rainfall ${rainfall} mm, estimated wind speed ~${outputs.windSpeedKmh} km/h. Approximately ${exposedPopulation.toLocaleString('en-IN')} people may be in the hazard zone.\n\nAction steps:\n1. Identify the nearest designated cyclone shelter (${selected.shelterCount} shelters in your district)\n2. Keep essential medicines, documents, and drinking water ready\n3. Plan assisted evacuation for people with mobility constraints\n4. Follow instructions from your District Disaster Management Authority and IMD\n\nThis draft has not been reviewed by an authority. Check IMD (imd.gov.in) and your State DDMA for official advisories.\n\n[Add Gemini API key in Settings to generate AI-powered, multilingual advisories]`;
      setAdvisory(message);
      setDraftStatus(`Template draft · ${audience} · add API key for AI advisory`);
      return;
    }

    setAiLoading(true);
    setAiError('');
    setDraftStatus('Gemini AI generating advisory…');

    const result = await generateAdvisory({
      zone: selected.name,
      state: selected.state,
      audience,
      surgeMeters: outputs.surgeMeters,
      rainfall24hMm: outputs.rainfall24hMm,
      imdCategory: outputs.imdCategory,
      windSpeedKmh: outputs.windSpeedKmh,
      landingWindowHours: FIXED_LANDFALL_WINDOW_HOURS,
      language: advisoryLang,
      apiKey,
    });

    setAiLoading(false);
    if (result.error) {
      setAiError(result.error);
      setDraftStatus('AI generation failed — check API key');
    } else {
      setAdvisory(result.text);
      setDraftStatus(`AI advisory drafted · ${advisoryLang} · ${audience} · not sent`);
    }
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="brand-row"><img className="brand-icon" src="/favicon.png" alt=""/><div className="brand-text"><b>IRIS</b><span aria-label="Intelligent Risk and Impact Simulator">INTELLIGENT RISK AND<br/>IMPACT SIMULATOR</span></div><button className="mobile-close" aria-label="Close menu" onClick={() => setMobileMenu(false)}>×</button></div>
        <div className="workspace-selector"><div className="workspace-pin"><Map size={15}/></div><div><b>Bay of Bengal</b><span>Regional operations</span></div><ChevronDown size={14}/></div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Dashboard sections">
          {navItems.map((item) => { const Icon = item.icon; return <button key={item.id} className={`nav-item ${activeSection === item.id ? 'nav-active' : ''}`} onClick={() => navigate(item.id)}><Icon size={17}/><span>{item.label}</span>{item.id === 'advisories' && <i className="nav-count">{advisory.trim() ? 1 : 0}</i>}</button>; })}
        </nav>
        <div className="sidebar-bottom">
          <div className="feed-status">
            <div className="feed-status-top"><span className={`status-dot ${apiKey ? 'active' : 'muted'}`}/>GEMINI STATUS</div>
            <b>{apiKey ? 'AI connected' : 'No API key'}</b>
            <span>{apiKey ? 'gemini-3.8-flash active' : 'Add key for AI advisories'}</span>
            <button className="text-button" style={{ marginTop: 6 }} onClick={() => { setShowKeyInput((v) => !v); setTimeout(() => apiKeyRef.current?.focus(), 100); }}>
              {apiKey ? 'Change API key' : '+ Add Gemini API key'}
            </button>
            {showKeyInput && (
              <form className="key-form" onSubmit={(e) => { e.preventDefault(); saveKey((e.currentTarget.elements.namedItem('key') as HTMLInputElement).value.trim()); }}>
                <input ref={apiKeyRef} name="key" type="password" defaultValue={apiKey} placeholder="AIza..." className="key-input" autoComplete="off" />
                <button type="submit" className="key-save">Save</button>
              </form>
            )}
          </div>
          <div className="help-anchor" data-iris-popover>
            <button className="help-button" aria-expanded={openHelp} onClick={() => setOpenHelp((value) => !value)}><CircleHelp size={16}/><span>About this prototype</span></button>
            {openHelp && <div className="help-popover" role="status">IRIS uses Gemini 1.5 Flash for AI advisories and risk narratives, Leaflet/OpenStreetMap for real mapping, IMD/NDMA/Census 2011 for data references. Scenario figures are planning estimates, not live forecasts. No emergency dispatch is connected.</div>}
          </div>
          <div className="sidebar-profile-anchor" data-iris-popover>
            <button type="button" className="profile-row" aria-expanded={profileAnchor === 'sidebar'} onClick={() => { setProfileAnchor((value) => value === 'sidebar' ? null : 'sidebar'); setNotificationsOpen(false); }}>
              <span className="avatar">DM</span><span className="profile-detail"><b>District planning</b><span>DDMA concept demo</span></span><span className="profile-menu">•••</span>
            </button>
            {profileAnchor === 'sidebar' && <div className="dashboard-popover profile-popover sidebar-profile-popover" role="dialog" aria-label="Demo profile">
              <div className="popover-heading"><div><b>District planning</b><span>DDMA concept demo</span></div><button className="popover-close" aria-label="Close profile" onClick={() => setProfileAnchor(null)}>×</button></div>
              <p>IRIS is a planning concept for District Disaster Management Authorities. No personal profile is stored.</p>
              <button className="popover-action" onClick={() => { setShowCalculations(true); setProfileAnchor(null); }}>View data & calculations</button>
            </div>}
          </div>
        </div>
      </aside>
      {mobileMenu && <button className="sidebar-scrim" aria-label="Close menu" onClick={() => setMobileMenu(false)}/>}

      <main className="main-frame">
        <header className="topbar">
          <div className="topbar-left"><button className="mobile-menu-button" aria-label="Open menu" onClick={() => setMobileMenu(true)}><Menu size={19}/></button><div className="crumb">Regional workspace <span>/</span> <b>{activeTitle}</b></div></div>
          <div className="topbar-right">
            <button className="button-secondary dashboard-home-button" onClick={onNavigateHome}><ArrowLeft size={17}/>Back to home</button>
            <div className={`connection-pill ${apiKey ? 'connected' : ''}`}>
              <span className={`status-dot ${apiKey ? 'active' : 'muted'}`}/>
              {apiKey ? 'GEMINI AI CONNECTED' : 'NO LIVE FEEDS'}
            </div>
            <div className="notification-anchor" data-iris-popover>
              <button type="button" className="top-icon" aria-label="Open notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((value) => !value); setProfileAnchor(null); }}><Bell size={17}/>{!notificationsRead && <i/>}</button>
              {notificationsOpen && <div className="dashboard-popover notification-popover" role="dialog" aria-label="Notifications">
                <div className="popover-heading"><div><b>Notifications</b><span>System notices</span></div><button className="popover-close" aria-label="Close" onClick={() => setNotificationsOpen(false)}>×</button></div>
                <div className="notification-list">
                  <article className="notification-item"><span className="notice-mark">01</span><div><b>Gemini AI</b><p>{apiKey ? 'gemini-1.5-flash connected. AI advisories available.' : 'Add your Gemini API key to enable AI-powered advisories.'}</p></div></article>
                  <article className="notification-item"><span className="notice-mark">02</span><div><b>Map data</b><p>Real OpenStreetMap tiles loaded. 10 Indian coastal zones active.</p></div></article>
                  <article className="notification-item"><span className="notice-mark">03</span><div><b>Planner state</b><p>{completedActions.length} of {responseActions.length} checklist items marked ready.</p></div></article>
                </div>
                <button className="popover-action" onClick={() => setNotificationsRead(true)}>{notificationsRead ? 'Notices read' : 'Mark as read'}</button>
              </div>}
            </div>
            <div className="top-profile-anchor" data-iris-popover>
              <button type="button" className="top-avatar" aria-label="Open profile" aria-expanded={profileAnchor === 'topbar'} onClick={() => { setProfileAnchor((value) => value === 'topbar' ? null : 'topbar'); setNotificationsOpen(false); }}>DM</button>
              {profileAnchor === 'topbar' && <div className="dashboard-popover profile-popover top-profile-popover" role="dialog" aria-label="Profile">
                <div className="popover-heading"><div><b>District planning</b><span>DDMA concept demo</span></div><button className="popover-close" aria-label="Close" onClick={() => setProfileAnchor(null)}>×</button></div>
                <p>Planning concept for DDMAs. No personal profile stored.</p>
                <button className="popover-action" onClick={() => { setShowCalculations(true); setProfileAnchor(null); }}>View data & calculations</button>
              </div>}
            </div>
          </div>
        </header>

        <div className="content-wrap">
          <div className="simulation-banner" role="note"><div className="banner-symbol"><ShieldAlert size={17}/></div><div><b>Planning scenario · not an official warning</b><span>Gemini 3.8 Flash AI · IMD/NDMA/Census 2011 data references · OpenStreetMap · Scenario figures are planning estimates only.</span></div><span className="banner-status"><i/>{apiKey ? 'AI ACTIVE' : 'DEMO MODE'}</span></div>

          {/* AI Risk Narrative */}
          {(narrativeLoading || narrativeText) && (
            <div className="ai-narrative-bar" role="note">
              <span className="ai-tag"><Sparkles size={14}/> GEMINI AI ANALYSIS</span>
              {narrativeLoading ? (
                <span className="ai-loading"><Loader2 size={14} className="spin-icon"/> Analysing scenario…</span>
              ) : (
                <p>{narrativeText}</p>
              )}
            </div>
          )}

          <section className="page-intro" id="overview">
            <div><div className="intro-eyebrow"><span className="live-dot"/>SCENARIO WORKSPACE <span className="intro-divider">/</span> COASTAL INDIA · 10 DISTRICTS</div><h1>Scenario analytics.</h1><p>Explore simulated risks, exposure and pre-landfall decisions across Indian coastal districts — Andhra Pradesh, Odisha, West Bengal, Tamil Nadu, Gujarat, Maharashtra.</p></div>
            <div className="intro-actions"><div className="scenario-status"><span className="scenario-status-dot"/><div><b>IMD {outputs.imdCategory}</b><span>~{outputs.windSpeedKmh} km/h · planning scenario</span></div><Info size={15}/></div><button className="button-secondary calculation-open-button" aria-haspopup="dialog" onClick={() => setShowCalculations(true)}><Calculator size={16}/>Data & calculations</button><button className="button-secondary" onClick={() => { setIntensity(3); setSelectedZone('nellore'); setTide('High tide'); setSeaLevel('Baseline'); }}><SlidersHorizontal size={15}/>Reset scenario</button></div>
          </section>

          <section className="metric-grid" aria-label="Scenario summary metrics">
            <MetricCard label="SIMULATED LANDFALL WINDOW" value={String(FIXED_LANDFALL_WINDOW_HOURS)} unit="h" note="Fixed example · not an estimate" icon={<Timer size={16}/>} tone="teal" />
            <MetricCard label="PEAK SURGE PLANNING BAND" value={surge} unit="m" note={`${tide} · ${seaLevel} · ${outputs.imdCategory}`} icon={<Waves size={16}/>} tone="coral" trend="↑" />
            <MetricCard label="WIND SPEED ESTIMATE" value={`${outputs.windSpeedKmh}`} unit="km/h" note={`IMD ${outputs.imdCategory} · Saffir-Simpson ref.`} icon={<WindIcon size={16}/>} tone="blue" />
            <MetricCard label="REGIONAL EXPOSURE ESTIMATE" value={formatCompact(exposedPopulation)} note={`~${Math.round((exposedPopulation / selected.population) * 100)}% of district pop. · Census 2011 base`} icon={<UsersRound size={16}/>} tone="amber" />
          </section>

          <section className="decision-strip" aria-label="Pre-landfall decision timeline">
            <div className="decision-title"><span className="decision-icon"><Clock3 size={15}/></span><div><b>Decision runway</b><span>Scenario timeline</span></div></div>
            <div className="runway-track"><div className="runway-line"><i style={{ width: '54%' }} /></div><div className="runway-stop completed"><span><Check size={11}/></span><b>Now</b><small>Assess</small></div><div className="runway-stop current"><span>1</span><b>T–24h</b><small>Prepare</small></div><div className="runway-stop"><span>2</span><b>T–12h</b><small>Mobilize</small></div><div className="runway-stop"><span>3</span><b>Landfall</b><small>Protect</small></div></div>
            <div className="confidence-meter"><span>SCENARIO INDEX · NOT CONFIDENCE</span><b>{scenarioIndex} / 100</b><div className="confidence-track"><i style={{ width: `${scenarioIndex}%` }} /></div><small>Composite of surge, rainfall and tide · planning heuristic only</small></div>
          </section>

          <section className="content-section map-section" id="risk-map">
            <SectionTitle eyebrow="01 / EXPOSURE AT A GLANCE" title="Coastal risk map" subtitle="Real map with OpenStreetMap tiles · 10 Indian coastal districts · IMD/NDMA data references" />
            <div className="map-layout">
              <RiskMap layers={layers} onLayersChange={setLayers} selectedZone={selectedZone} onZoneSelect={setSelectedZone} intensity={intensity} zones={zones} surgeMeters={outputs.surgeMeters} />
              <aside className="scenario-panel">
                <PanelHeading icon={<SlidersHorizontal size={16}/>} title="Scenario assumptions" action={<span className="small-text">LOCAL DEMO</span>} />
                <p className="panel-description">Adjust inputs to explore how planning summaries change across districts.</p>
                <label className="control-label" htmlFor="intensity-range"><span>Scenario intensity</span><b>IMD {outputs.imdCategory}</b></label>
                <input id="intensity-range" className="range-input" type="range" min="1" max="5" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} style={{ '--range-fill': `${((intensity - 1) / 4) * 100}%` } as CSSProperties} />
                <div className="range-ends"><span>Cat-1 (SCS)</span><span>Cat-5 (ESCS)</span></div>
                <label className="control-label" htmlFor="landfall-select"><span>Landfall area</span><Map size={14}/></label>
                <select id="landfall-select" className="select-control" value={selectedZone} onChange={(event) => setSelectedZone(event.target.value)}>{areaOptions.map((area) => <option value={area.id} key={area.id}>{area.label}</option>)}</select>
                <label className="control-label" htmlFor="tide-select"><span>Tide state</span><Droplets size={14}/></label>
                <select id="tide-select" className="select-control" value={tide} onChange={(event) => setTide(event.target.value as Tide)}><option>High tide</option><option>Mean tide</option></select>
                <label className="control-label" htmlFor="sea-select"><span>Sea-level scenario</span><Waves size={14}/></label>
                <select id="sea-select" className="select-control" value={seaLevel} onChange={(event) => setSeaLevel(event.target.value as SeaLevel)}><option>Baseline</option><option>+0.3 m SLR</option></select>
                <div className="scenario-note"><Info size={14}/><span>Surge formula based on IMD Storm Surge Atlas (INCOIS/NIOT) category relationships. Zone geometry modifiers applied.</span></div>
                <div className="focus-district"><div className="district-heading"><span>FOCUS DISTRICT</span><span className="risk-pill"><i/>{selected.risk.toUpperCase()} RISK</span></div><b>{selected.name}</b><span>{selected.state} · {selected.shelterCount} cyclone shelters · Hist.: {selected.historicalCyclones}</span></div>
              </aside>
            </div>
          </section>

          <section className="content-section" id="pathways">
            <SectionTitle eyebrow="02 / CASCADING IMPACTS" title="Follow the damage pathways" subtitle="Rainfall and surge conditions traced through local services — based on IMD/NDMA post-event reports" />
            <div className="two-column-grid">
              <article className="panel rainfall-panel"><PanelHeading icon={<CloudRain size={17}/>} title="Rainfall accumulation" action={<span className="unit-tag">IMD CLIMATOLOGY</span>} /><RainfallChart totalRainfall={rainfall} profileMultiplier={outputs.rainfallProfileMultiplier}/><div className="stress-callouts"><div><span className="callout-icon"><Droplets size={14}/></span><span><b>Drainage stress</b><small>Canal exceedance likely in scenario</small></span><em className={intensity >= 4 ? 'text-danger' : 'text-warning'}>{intensity >= 4 ? 'SEVERE' : 'ELEVATED'}</em></div><div><span className="callout-icon"><Waves size={14}/></span><span><b>River overflow</b><small>Low-lying approaches at risk</small></span><em className="text-warning">WATCH</em></div></div></article>
              <RiskPathway intensity={intensity}/>
            </div>
            <div className="surge-summary-row"><div className="surge-summary-icon"><Waves size={18}/></div><div><b>Storm-surge planning band — {outputs.imdCategory}</b><span>Reference: IMD Storm Surge Atlas (INCOIS), NIOT surge hindcasts (Fani 2019: ~4.8 m, Amphan 2020: ~5.1 m at Sagar Island). Zone geometry and tide state applied.</span></div><div className="surge-number"><strong>{surge}</strong><small>m illustrative</small></div></div>
          </section>

          <section className="content-section" id="infrastructure">
            <SectionTitle eyebrow="03 / SERVICE CONTINUITY" title="Critical infrastructure exposure" subtitle="Zone-specific view across power, roads, hospitals and cyclone shelters — updates when district changes" />
            <div className="panel assets-panel">
              <div className="assets-panel-head">
                <PanelHeading icon={<Building2 size={17}/>} title={`Priority assets · ${selected.name}`} action={<button className="text-button" onClick={() => navigate('risk-map')}>View on map <ArrowDownRight size={14}/></button>} />
                <div className="asset-summary-pills">
                  <span><i className="dot-danger"/>{currentAssets.filter(a => a.status === 'Critical').length} critical</span>
                  <span><i className="dot-warning"/>{currentAssets.filter(a => a.status === 'At risk').length} at risk</span>
                  <span><i className="dot-neutral"/>{currentAssets.filter(a => a.status === 'Monitor').length} monitor</span>
                </div>
              </div>
              <div className="asset-table-wrap"><table className="asset-table"><thead><tr><th>ASSET</th><th>TYPE</th><th>ZONE</th><th>SCENARIO EXPOSURE</th><th>STATUS</th></tr></thead><tbody>{currentAssets.map((asset) => <tr key={asset.id}><td><div className="asset-name"><span className={`asset-icon ${asset.category.toLowerCase()}`}><AssetIcon category={asset.category}/></span><b>{asset.name}</b></div></td><td>{asset.category}</td><td>{asset.zone}</td><td className="asset-detail">{asset.detail}</td><td><span className={`status-pill ${statusColor(asset.status)}`}><i/>{asset.status}</span></td></tr>)}</tbody></table></div>
              <div className="table-footnote"><Info size={13}/>Asset list updates dynamically with district selection. Types reference NDMA infrastructure vulnerability frameworks. Statuses are planning indicators, not live sensor data.</div>
            </div>
          </section>

          <section className="content-section" id="communities">
            <SectionTitle eyebrow="04 / PEOPLE & ACCESS" title="Prioritize communities, not just assets" subtitle="10 coastal districts · Census 2011 population base · NDMA shelter counts · IMD vulnerability composite" />
            <div className="community-grid">
              <div className="panel priority-panel"><PanelHeading icon={<UsersRound size={17}/>} title="Evacuation-priority zones" action={<span className="unit-tag">10 DISTRICTS</span>} /><div className="community-list">{rankedZones.map((zone, index) => <button key={zone.id} className={`community-row ${selectedZone === zone.id ? 'community-selected' : ''}`} onClick={() => setSelectedZone(zone.id)}><div className="priority-rank">0{index + 1}</div><div className="community-main"><b>{zone.name}</b><span>{zone.state} · {formatCompact(zone.population)} pop. (Census 2011) · mobility {zone.mobility} · {zone.shelterCount} shelters · sensitivity {zone.sensitivity}/100</span><div className="vulnerability-bar"><i style={{ width: `${zone.vulnerability}%` }}/></div></div><div className="vulnerability-score"><b>{zone.vulnerability}</b><span>INDEX</span></div><span className={`status-pill ${statusColor(zone.risk)}`}><i/>{zone.risk}</span></button>)}</div><div className="table-footnote"><Info size={13}/>Vulnerability index: composite of IMD exposure band, NDMA shelter access, Census 2011 mobility proxy, and IPCC AR6 socioeconomic sensitivity guidance.</div></div>
              <div className="panel access-panel"><PanelHeading icon={<Target size={17}/>} title="Access & shelter" /><div className="access-stat"><span className="access-stat-icon"><UsersRound size={16}/></span><div><b>{formatCompact(exposedPopulation)}</b><span>Estimated people in hazard band · Census 2011 base</span></div></div><div className="access-stat"><span className="access-stat-icon amber"><Timer size={16}/></span><div><b>{selected.shelter}</b><span>Shelter access window · {selected.shelterCount} cyclone shelters (NDMA 2022)</span></div></div><div className="access-stat"><span className="access-stat-icon coral"><Wind size={16}/></span><div><b>{selected.mobility} mobility constraints</b><span>Assisted-evacuation planning cue</span></div></div><div className="access-callout"><ShieldAlert size={16}/><span><b>Plan for inclusive access</b><small>Confirm transport, accessible shelters, language needs and trusted local messengers in each community.</small></span></div></div>
            </div>
          </section>

          <section className="content-section" id="planner">
            <SectionTitle eyebrow="05 / PRE-LANDFALL READINESS" title="Move from signal to action" subtitle="Illustrative sequence for District Disaster Management Authorities — based on NDMA SOP framework" />
            <div className="panel planner-panel"><div className="planner-top"><PanelHeading icon={<ClipboardCheck size={17}/>} title="Priority actions" action={<span className="planner-counter">{completedActions.length} / {responseActions.length} marked ready</span>} /><p>Readiness marks are saved in this browser session only. Based on NDMA Pre-cyclone Checklist SOP.</p></div><div className="action-list">{responseActions.map((action) => { const done = completedActions.includes(action.id); return <label key={action.id} className={`action-row ${done ? 'action-done' : ''}`}><input type="checkbox" checked={done} onChange={() => setCompletedActions((previous) => done ? previous.filter((id) => id !== action.id) : [...previous, action.id])}/><span className="custom-check">{done && <Check size={13}/>}</span><span className="action-time">{action.due}<small>TIME TO IMPACT</small></span><span className="action-copy"><b>{action.title}</b><small>{action.owner}</small></span><span className="action-trigger"><Info size={13}/>{action.trigger}</span><span className="action-state">{done ? 'READY' : 'OPEN'}</span><ArrowDownRight size={15} className="action-arrow"/></label>; })}</div><div className="planner-footer"><div><span className="trigger-pill"><Activity size={13}/>SCENARIO TRIGGER</span><span>If simulated surge exceeds <b>1.5 m</b>, prioritize assisted evacuation within <b>6 hours</b>. (Ref: NDMA cyclone SOP threshold)</span></div><small>Planning cue only · not an authorized threshold</small></div></div>
          </section>

          <section className="content-section" id="liquidity">
            <SectionTitle eyebrow="06 / LIVELIHOOD CONTINUITY" title="Illustrative parametric liquidity" subtitle="Model a possible pre-arranged payout pathway — without initiating a transaction." />
            <div className="insurance-grid">
              <div className="insurance-main panel"><div className="insurance-head"><div><div className="eyebrow">DEMO PORTFOLIO · {selected.state.toUpperCase()}</div><h3>Rapid liquidity, before recovery stalls</h3></div><div className="insurance-symbol"><ShieldCheck size={20}/></div></div><div className="liquidity-amount"><span>Potential pre-arranged liquidity</span><b>₹{estimatedLiquidity}<small> Cr</small></b><div className="liquidity-change"><ArrowUpRight size={13}/>Scales with surge + rainfall intensity · planning estimate</div></div><div className="liquidity-track"><div className="liquidity-step done"><i><Check size={11}/></i><b>Trigger met</b><small>Hypothetical</small></div><div className="liquidity-step active"><i>2</i><b>Review</b><small>Illustrative 2–5 days</small></div><div className="liquidity-step"><i>3</i><b>Liquidity</b><small>Subject to contract</small></div></div><div className="insurance-footer"><span><Info size={13}/> No insurance policy, quote, payout or payment is connected to this prototype. Reference: NDMA parametric insurance feasibility study 2021.</span><button className="button-secondary compact" onClick={() => navigate('advisories')}>Open planning workspace <ArrowDownRight size={13}/></button></div></div>
              <div className="panel trigger-panel"><PanelHeading icon={<Zap size={16}/>} title="Potential trigger conditions" action={<span className="mini-chip">SIMULATED</span>} /><div className="trigger-row"><span className="trigger-index">01</span><span><b>Coastal surge index</b><small>Planning threshold above 1.5 m · IMD Storm Surge Atlas ref.</small></span><span className="trigger-state">IN RANGE</span></div><div className="trigger-row"><span className="trigger-index">02</span><span><b>24-hour rainfall</b><small>Accumulation above 250 mm · IMD EP climatology</small></span><span className="trigger-state">WATCH</span></div><div className="trigger-row"><span className="trigger-index">03</span><span><b>Affected portfolio</b><small>{selected.name} · {selected.state}</small></span><span className="trigger-state">DEMO</span></div><div className="trigger-disclaimer">Actual parametric products require verified data, policy terms and insurer review.</div></div>
            </div>
          </section>

          <section className="content-section" id="advisories">
            <SectionTitle eyebrow="07 / LOCAL COMMUNICATION" title="AI-powered advisory drafting" subtitle="Gemini 1.5 Flash generates audience-aware advisories in 6 Indian languages. Dispatch is disabled." marker="GEMINI AI" />
            <div className="advisory-grid">
              <div className="panel advisory-compose">
                <div className="advisory-heading">
                  <div>
                    <span className="compose-icon"><Sparkles size={16}/></span>
                    <div><h3>Advisory workspace</h3><span>{apiKey ? 'Gemini 1.5 Flash · AI-powered multilingual' : 'Add API key to enable AI generation'}</span></div>
                  </div>
                  <span className="draft-unsent"><i/>NOT SENT</span>
                </div>
                <div className="compose-controls">
                  <label htmlFor="audience-select">AUDIENCE</label>
                  <select id="audience-select" value={audience} onChange={(event) => setAudience(event.target.value)}>
                    <option>Coastal communities</option>
                    <option>Municipal response teams</option>
                    <option>Health and shelter coordinators</option>
                    <option>Power & road operators</option>
                    <option>NDRF / SDRF teams</option>
                  </select>
                  <label htmlFor="language-select"><Globe size={13}/> LANGUAGE</label>
                  <select id="language-select" value={advisoryLang} onChange={(event) => setAdvisoryLang(event.target.value as Language)}>
                    {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                  </select>
                  <button className={`button-primary ${aiLoading ? 'button-loading' : ''}`} onClick={createDraft} disabled={aiLoading}>
                    {aiLoading ? <><Loader2 size={15} className="spin-icon"/>Generating…</> : <><FileText size={15}/>Generate AI advisory</>}
                  </button>
                </div>
                {aiError && <div className="ai-error-bar"><ShieldAlert size={14}/> {aiError}</div>}
                <label className="advisory-text-label" htmlFor="advisory-text">AI-GENERATED DRAFT <span>Editable · all values from current scenario</span></label>
                <textarea id="advisory-text" value={advisory} onChange={(event) => { setAdvisory(event.target.value); setDraftStatus('Draft edited · not sent'); }} placeholder={apiKey ? `Click "Generate AI advisory" to create a Gemini-powered advisory in ${advisoryLang} for ${audience}…` : 'Add your Gemini API key in the sidebar to generate AI-powered multilingual advisories. Or use the template mode without a key.'} rows={9}/>
                <div className="advisory-bottom"><span className="draft-state"><Check size={13}/>{draftStatus}</span><button className="button-disabled" disabled title="Dispatch not connected"><Radio size={15}/>Dispatch unavailable</button></div>
                <div className="advisory-safety"><ShieldAlert size={15}/><span>For concept exploration only. Review with authorized agencies (DDMA/IMD) before any real-world use.</span></div>
              </div>
              <aside className="panel audience-panel">
                <PanelHeading icon={<MessageSquareText size={16}/>} title="Message guardrails" />
                <div className="guardrail-item"><span className="guardrail-icon green"><Check size={14}/></span><span><b>Use trusted local messengers</b><small>DDMA, health workers, Sarpanch, community leaders.</small></span></div>
                <div className="guardrail-item"><span className="guardrail-icon green"><Check size={14}/></span><span><b>Include accessible next steps</b><small>Shelter location, transport, medicine readiness.</small></span></div>
                <div className="guardrail-item"><span className="guardrail-icon amber"><Info size={14}/></span><span><b>Separate scenario from official warning</b><small>Do not imply a verified IMD forecast or government order.</small></span></div>
                <div className="guardrail-item"><span className="guardrail-icon green"><Globe size={14}/></span><span><b>6 Indian languages supported</b><small>English, Hindi, Telugu, Bengali, Tamil, Gujarati — via Gemini AI.</small></span></div>
                <div className="audience-note"><b>Delivery status</b><span><i className="status-dot muted"/> No SMS, email, radio or municipal system connected</span></div>
                <div className="audience-note" style={{ marginTop: 8 }}><b>Data sources cited</b><span>IMD · NDMA · Census 2011 · INCOIS · NIOT</span></div>
              </aside>
            </div>
          </section>

          <footer className="page-footer"><div><img src="/favicon.png" alt=""/><span><b>IRIS</b><small>Intelligent Risk and Impact Simulator · Gemini AI · IMD/NDMA data · OpenStreetMap</small></span></div><div className="footer-stamps"><span><i/>PLANNING SCENARIO</span><span>Version 1.0.0</span><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</button></div></footer>
        </div>
      </main>
      {showCalculations && <CalculationsDialog inputs={calculationInputs} outputs={outputs} onClose={() => setShowCalculations(false)} />}
    </div>
  );
}

export default DashboardPage;
