import { Factory, Layers, Mountain, Route, Shovel, Warehouse, Wrench } from 'lucide-react';

// Simulated GPS: every zone sits a few hundred metres from the base point.
export const GPS_BASE = { latitude: 30.7046, longitude: 76.7179 };

export const ZONES = [
  { id: 'pit-a', name: 'Pit A', description: 'Open pit extraction zone', risk: 'HIGH', icon: Mountain, offset: [0, 0] },
  { id: 'pit-b', name: 'Pit B', description: 'Benching and blasting area', risk: 'HIGH', icon: Shovel, offset: [0.0021, -0.0016] },
  { id: 'haul-road', name: 'Haul Road', description: 'Heavy vehicle movement', risk: 'HIGH', icon: Route, offset: [-0.0013, 0.0027] },
  { id: 'crusher', name: 'Crusher Area', description: 'Crushing and screening plant', risk: 'MEDIUM', icon: Factory, offset: [0.0032, 0.0018] },
  { id: 'workshop', name: 'Workshop', description: 'Machinery maintenance', risk: 'MEDIUM', icon: Wrench, offset: [-0.0024, -0.0011] },
  { id: 'stockyard', name: 'Stockyard', description: 'Coal storage and loading', risk: 'LOW', icon: Warehouse, offset: [0.0009, 0.0035] },
  { id: 'overburden', name: 'Overburden Area', description: 'Dump slopes and overburden removal', risk: 'HIGH', icon: Layers, offset: [-0.0031, 0.0009] },
];

export const getZone = (id) => ZONES.find((z) => z.id === id) ?? null;
export const getZoneByName = (name) => ZONES.find((z) => z.name === name) ?? null;

export function zoneGps(zoneId) {
  const z = getZone(zoneId);
  const [dLat, dLon] = z?.offset ?? [0, 0];
  return {
    latitude: Number((GPS_BASE.latitude + dLat).toFixed(4)),
    longitude: Number((GPS_BASE.longitude + dLon).toFixed(4)),
  };
}
