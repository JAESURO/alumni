'use client';

import { MapContainer, TileLayer, Marker, Popup, FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { API_URL } from '../config/api';

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

interface YieldRecord {
    id: number;
    location: string;
    date: string;
    prediction: number;
    indexValue?: number;
    parameter?: string;
    latitude: number;
    longitude: number;
}

interface MapComponentProps {
    onZoneDrawn?: (geometry: any) => void;
    onZoneEdited?: (geometry: any) => void;
    onZoneDeleted?: () => void;
    selectedGeometry?: any;
    mapCenter?: [number, number];
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

export default function MapComponent({ onZoneDrawn, onZoneEdited, onZoneDeleted, selectedGeometry, mapCenter }: MapComponentProps) {
    const [yields, setYields] = useState<YieldRecord[]>([]);

    useEffect(() => {
        fetch(`${API_URL}/api/yields`)
            .then(res => res.text())
            .then(text => {
                try {
                    const data = JSON.parse(text);
                    setYields(Array.isArray(data) ? data : []);
                } catch (e) {
                    setYields([]);
                }
            })
            .catch(() => {
                setYields([]);
            });
    }, []);

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
                            marker: true,
                            polyline: false,
                        }}
                        edit={{
                            edit: true,
                            remove: true,
                        }}
                    />
                </FeatureGroup>
                {yields.map((record: YieldRecord) => (
                    <Marker key={record.id} position={[record.latitude, record.longitude]}>
                        <Popup>
                            <div>
                                <strong>{record.location}</strong><br />
                                Parameter: {record.parameter || 'NDVI'}<br />
                                Index: {(record.indexValue ?? record.prediction)?.toFixed(4)}<br />
                                Date: {record.date}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}