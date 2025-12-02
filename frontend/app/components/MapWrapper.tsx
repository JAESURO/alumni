'use client';

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg"></div>
});

export default function MapWrapper({ onZoneDrawn, selectedGeometry, mapCenter }: { onZoneDrawn?: (geometry: any) => void, selectedGeometry?: any, mapCenter?: [number, number] }) {
    return <MapComponent onZoneDrawn={onZoneDrawn} selectedGeometry={selectedGeometry} mapCenter={mapCenter} />;
}