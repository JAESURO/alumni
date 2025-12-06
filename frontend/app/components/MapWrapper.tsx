'use client';

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg"></div>
});

export default function MapWrapper({
    onZoneDrawn,
    onZoneEdited,
    onZoneDeleted,
    selectedGeometry,
    mapCenter,
    tileLayers,
    onToggleLayer,
    onOpacityChange
}: {
    onZoneDrawn?: (geometry: any) => void,
    onZoneEdited?: (geometry: any) => void,
    onZoneDeleted?: () => void,
    selectedGeometry?: any,
    mapCenter?: [number, number],
    tileLayers?: any,
    onToggleLayer?: (parameter: string) => void,
    onOpacityChange?: (parameter: string, opacity: number) => void
}) {
    return <MapComponent
        onZoneDrawn={onZoneDrawn}
        onZoneEdited={onZoneEdited}
        onZoneDeleted={onZoneDeleted}
        selectedGeometry={selectedGeometry}
        mapCenter={mapCenter}
        tileLayers={tileLayers}
        onToggleLayer={onToggleLayer}
        onOpacityChange={onOpacityChange}
    />;
}