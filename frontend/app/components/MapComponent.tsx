'use client';

import { MapContainer, TileLayer, FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useEffect, useRef } from 'react';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapController({ center }: { center?: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13);
        }
    }, [center, map]);
    return null;
}



interface TileLayerData {
    url: string;
    opacity: number;
    visible: boolean;
}

interface MapComponentProps {
    onZoneDrawn?: (geometry: any) => void;
    onZoneEdited?: (geometry: any) => void;
    onZoneDeleted?: () => void;
    selectedGeometry?: any;
    mapCenter?: [number, number];
    tileLayers?: {
        NDVI?: TileLayerData;
        NDMI?: TileLayerData;
        RECI?: TileLayerData;
    };
}

function SelectedGeometryLayer({ geometry }: { geometry: any }) {
    const map = useMap();
    const layerRef = useRef<L.GeoJSON | null>(null);

    useEffect(() => {
        if (geometry) {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
            }

            const feature = {
                type: 'Feature' as const,
                geometry: geometry,
                properties: {}
            };

            const geoJsonLayer = L.geoJSON(feature, {
                style: {
                    color: '#3b82f6',
                    weight: 3,
                    opacity: 0.8,
                    fillOpacity: 0.2
                },
                pointToLayer: (feature, latlng) => {
                    const radius = (feature.geometry as any).radius;
                    if (radius) {
                        return L.circle(latlng, {
                            radius: radius,
                            fillColor: '#3b82f6',
                            color: '#1e40af',
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0.5
                        });
                    }
                    return L.circleMarker(latlng, {
                        radius: 8,
                        fillColor: '#3b82f6',
                        color: '#1e40af',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.5
                    });
                }
            });

            geoJsonLayer.addTo(map);
            layerRef.current = geoJsonLayer;

            const bounds = geoJsonLayer.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }

        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
                layerRef.current = null;
            }
        };
    }, [geometry, map]);

    return null;
}

function TileLayerManager({ tileLayers }: { tileLayers?: { [key: string]: TileLayerData } }) {
    const map = useMap();
    const layersRef = useRef<{ [key: string]: L.TileLayer }>({});

    useEffect(() => {
        if (!tileLayers) return;

        Object.entries(tileLayers).forEach(([key, data]) => {
            if (data && data.url && data.visible) {
                if (layersRef.current[key]) {
                    layersRef.current[key].setOpacity(data.opacity);
                } else {
                    const tileLayer = L.tileLayer(data.url, {
                        opacity: data.opacity,
                        attribution: 'Google Earth Engine'
                    });
                    tileLayer.addTo(map);
                    layersRef.current[key] = tileLayer;
                }
            } else if (layersRef.current[key]) {
                map.removeLayer(layersRef.current[key]);
                delete layersRef.current[key];
            }
        });

        const currentKeys = Object.keys(layersRef.current);
        const newKeys = Object.keys(tileLayers || {});
        const removedKeys = currentKeys.filter(k => !newKeys.includes(k));

        removedKeys.forEach(key => {
            if (layersRef.current[key]) {
                map.removeLayer(layersRef.current[key]);
                delete layersRef.current[key];
            }
        });

        return () => {
            Object.values(layersRef.current).forEach(layer => {
                map.removeLayer(layer);
            });
            layersRef.current = {};
        };
    }, [tileLayers, map]);

    return null;
}



export default function MapComponent({
    onZoneDrawn,
    onZoneEdited,
    onZoneDeleted,
    selectedGeometry,
    mapCenter,
    tileLayers
}: MapComponentProps) {

    const handleCreated = (e: any) => {
        const layer = e.layer;
        const geoJSON = layer.toGeoJSON();
        let geometry = geoJSON.geometry;

        if (e.layerType === 'circle') {
            const radius = layer.getRadius();
            geometry = { ...geometry, radius: radius };
        }

        if (onZoneDrawn) {
            onZoneDrawn(geometry);
        }
    };

    const handleEdited = (e: any) => {
        const layers = e.layers;
        layers.eachLayer((layer: any) => {
            const geoJSON = layer.toGeoJSON();
            let geometry = geoJSON.geometry;
            if (layer instanceof L.Circle) {
                const radius = layer.getRadius();
                geometry = { ...geometry, radius: radius };
            }
            if (onZoneEdited) {
                onZoneEdited(geometry);
            }
        });
    };

    const handleDeleted = (e: any) => {
        if (onZoneDeleted) {
            onZoneDeleted();
        }
    };

    return (
        <div className="h-full w-full rounded-lg overflow-hidden">
            <MapContainer
                center={[51.505, -0.09]}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController center={mapCenter} />
                <TileLayerManager tileLayers={tileLayers} />
                <SelectedGeometryLayer geometry={selectedGeometry} />
                <FeatureGroup>
                    <EditControl
                        position="topright"
                        onCreated={handleCreated}
                        onEdited={handleEdited}
                        onDeleted={handleDeleted}
                        draw={{
                            rectangle: true,
                            polygon: true,
                            circle: true,
                            circlemarker: false,
                            marker: false,
                            polyline: false,
                        }}
                        edit={{
                            edit: true,
                            remove: true,
                        }}
                    />
                </FeatureGroup>

            </MapContainer>


        </div>
    );
}