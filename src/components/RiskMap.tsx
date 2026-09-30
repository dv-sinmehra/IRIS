import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { Crosshair, Layers3, RotateCcw } from 'lucide-react';
import type { Zone } from '../data/scenario';

export type MapLayers = { surge: boolean; rainfall: boolean; assets: boolean; track: boolean };

type Props = {
  layers: MapLayers;
  onLayersChange: (layers: MapLayers) => void;
  selectedZone: string;
  onZoneSelect: (zone: string) => void;
  intensity: number;
  zones: Zone[];
  surgeMeters: number;
};

const layerLabels: { key: keyof MapLayers; label: string }[] = [
  { key: 'surge', label: 'Storm surge' },
  { key: 'rainfall', label: 'Rainfall' },
  { key: 'assets', label: 'Critical assets' },
  { key: 'track', label: 'Cyclone track' },
];

// Colour stops for surge radius visualisation
const surgeColour = (metres: number) => {
  if (metres >= 5) return '#cc0000';
  if (metres >= 3.5) return '#e05500';
  if (metres >= 2) return '#c97d00';
  if (metres >= 1.2) return '#888800';
  return '#336699';
};

export function RiskMap({ layers, onLayersChange, selectedZone, onZoneSelect, intensity, zones, surgeMeters }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<LeafletMap | null>(null);
  const circlesRef = useRef<any[]>([]);
  const markersRef = useRef<any[]>([]);
  const trackRef = useRef<any | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialise Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    import('leaflet').then((L) => {
      if (!mapRef.current || leafletRef.current) return;

      // Fix default icon paths broken by bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [17.5, 82.5],
        zoom: 5,
        zoomControl: false,
        attributionControl: true,
      });

      // OpenStreetMap base tiles (free, no key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Scenario data: IMD/NDMA/Census 2011',
        maxZoom: 10,
        minZoom: 4,
      }).addTo(map);

      leafletRef.current = map;
      setMapReady(true);
    });

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  // Update circles and markers when zone/layers/intensity change
  useEffect(() => {
    if (!mapReady || !leafletRef.current) return;
    const L = (window as any).L;
    if (!L) {
      // Leaflet not yet on window — import it
      import('leaflet').then((LM) => renderLayers(LM));
    } else {
      renderLayers(L);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, layers, selectedZone, intensity, surgeMeters, zones]);

  function renderLayers(L: any) {
    const map = leafletRef.current!;

    // Clear previous overlays
    circlesRef.current.forEach((c) => c.remove());
    markersRef.current.forEach((m) => m.remove());
    circlesRef.current = [];
    markersRef.current = [];
    if (trackRef.current) { trackRef.current.remove(); trackRef.current = null; }

    const selected = zones.find((z) => z.id === selectedZone);
    if (!selected) return;

    // --- Surge radius overlay ---
    if (layers.surge) {
      const surgeRadiusKm = 25 + surgeMeters * 18; // rough inundation radius in km
      const circle = L.circle([selected.lat, selected.lng], {
        radius: surgeRadiusKm * 1000,
        color: surgeColour(surgeMeters),
        fillColor: surgeColour(surgeMeters),
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6 6',
      }).addTo(map);
      circle.bindTooltip(
        `<b>Storm surge zone</b><br>${surgeMeters.toFixed(1)} m planning band<br>~${surgeRadiusKm.toFixed(0)} km radius`,
        { permanent: false, direction: 'top' }
      );
      circlesRef.current.push(circle);
    }

    // --- Rainfall overlay ---
    if (layers.rainfall) {
      const rainCircle = L.circle([selected.lat + 0.5, selected.lng - 0.5], {
        radius: 90000,
        color: '#336699',
        fillColor: '#336699',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '3 8',
      }).addTo(map);
      rainCircle.bindTooltip('<b>Rainfall band</b><br>Illustrative spatial extent', { direction: 'top' });
      circlesRef.current.push(rainCircle);
    }

    // --- Zone markers for all zones ---
    zones.forEach((zone) => {
      const isSelected = zone.id === selectedZone;
      const riskColour: Record<string, string> = { High: '#cc3300', Elevated: '#cc7700', Watch: '#336699' };
      const colour = riskColour[zone.risk] ?? '#555555';

      const marker = L.circleMarker([zone.lat, zone.lng], {
        radius: isSelected ? 11 : 7,
        color: isSelected ? '#ffffff' : colour,
        fillColor: colour,
        fillOpacity: isSelected ? 0.95 : 0.65,
        weight: isSelected ? 3 : 1.5,
      }).addTo(map);

      marker.bindTooltip(
        `<b>${zone.name}</b><br>${zone.state}<br>Risk: ${zone.risk}<br>Pop. ~${zone.population.toLocaleString('en-IN')}`,
        { direction: 'top' }
      );

      marker.on('click', () => onZoneSelect(zone.id));
      markersRef.current.push(marker);
    });

    // --- Cyclone track (indicative) ---
    if (layers.track && selected) {
      const trackPoints: [number, number][] = [
        [selected.lat - 8, selected.lng + 4],
        [selected.lat - 5, selected.lng + 2.5],
        [selected.lat - 2.5, selected.lng + 1.2],
        [selected.lat, selected.lng],
      ];
      const track = L.polyline(trackPoints, {
        color: '#222222',
        weight: 3,
        dashArray: '8 8',
        opacity: 0.7,
      }).addTo(map);
      track.bindTooltip('<b>Indicative track</b><br>Illustrative — not a real forecast', { direction: 'top' });
      trackRef.current = track;

      // Landfall marker
      const landfallMarker = L.circleMarker([selected.lat, selected.lng], {
        radius: 14,
        color: '#ffffff',
        fillColor: '#cc0000',
        fillOpacity: 0.85,
        weight: 3,
      }).addTo(map).bindTooltip('<b>Simulated landfall</b>', { permanent: false });
      markersRef.current.push(landfallMarker);
    }

    // Pan to selected zone
    map.flyTo([selected.lat, selected.lng], 7, { duration: 1.2 });
  }

  const toggle = (key: keyof MapLayers) => onLayersChange({ ...layers, [key]: !layers[key] });

  return (
    <div className="map-card">
      <div className="map-toolbar">
        <div className="map-toolbar-left">
          <span className="map-live"><i /> SIMULATION VIEW</span>
          <span className="map-coords">
            {zones.find((z) => z.id === selectedZone)
              ? `${zones.find((z) => z.id === selectedZone)!.lat.toFixed(2)}° N · ${zones.find((z) => z.id === selectedZone)!.lng.toFixed(2)}° E`
              : '—'}
          </span>
        </div>
        <button className="map-icon-button" aria-label="Toggle critical asset markers" aria-pressed={layers.assets} title="Toggle critical asset markers" onClick={() => toggle('assets')}>
          <Layers3 size={16} />
        </button>
        <button className="map-icon-button" aria-label="Reset map view" title="Reset map view" onClick={() => leafletRef.current?.flyTo([17.5, 82.5], 5, { duration: 1 })}>
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Leaflet map container */}
      <div ref={mapRef} className="map-canvas leaflet-map-canvas" style={{ height: 380, background: '#f4f4f4' }} />

      <div className="map-footer">
        <div className="layer-toggles" aria-label="Risk map layers">
          {layerLabels.map((layer) => (
            <button key={layer.key} className={`layer-toggle ${layers[layer.key] ? 'is-on' : ''}`} onClick={() => toggle(layer.key)} aria-pressed={layers[layer.key]}>
              <i />{layer.label}
            </button>
          ))}
        </div>
        <div className="map-footer-note"><Crosshair size={13} /><span>Planning scenario · OpenStreetMap tiles · IMD/NDMA data references</span></div>
      </div>

      <div className="map-zone-row">
        <span className="field-label">FOCUS DISTRICT</span>
        {zones.map((zone) => (
          <button key={zone.id} onClick={() => onZoneSelect(zone.id)} className={`zone-chip ${selectedZone === zone.id ? 'selected' : ''}`}>
            {zone.name.split('–')[0].trim()}
          </button>
        ))}
      </div>
    </div>
  );
}
