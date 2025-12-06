'use client';

import { useState, useEffect } from 'react';
import MapWrapper from '../components/MapWrapper';
import { Sprout, LogOut } from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '../config/api';
import { YieldRecord, DataAvailability } from '../types/dashboard';
import ForecastSettings from '../components/dashboard/ForecastSettings';
import AvailabilityStatus from '../components/dashboard/AvailabilityStatus';
import ForecastResults from '../components/dashboard/ForecastResults';
import NotificationsPanel, { Notification } from '../components/dashboard/NotificationsPanel';
import LayerControl from '../components/dashboard/LayerControl';

export default function DashboardPage() {
    const [isForecasting, setIsForecasting] = useState(false);
    const [message, setMessage] = useState('');
    const [drawnGeometry, setDrawnGeometry] = useState<any>(null);
    const [selectedGeometry, setSelectedGeometry] = useState<any>(null);
    const [yieldData, setYieldData] = useState<YieldRecord[]>([]);
    const [formData, setFormData] = useState({
        location: '',
        startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        parameter: 'NDVI'
    });
    const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
    const [dataAvailability, setDataAvailability] = useState<DataAvailability | null>(null);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState<string | null>(null);


    const [tileLayers, setTileLayers] = useState<{
        NDVI?: { url: string; opacity: number; visible: boolean };
        NDMI?: { url: string; opacity: number; visible: boolean };
        RECI?: { url: string; opacity: number; visible: boolean };
    }>({
        NDVI: { url: '', opacity: 0.7, visible: false },
        NDMI: { url: '', opacity: 0.7, visible: false },
        RECI: { url: '', opacity: 0.7, visible: false }
    });
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        fetchYieldData();
        addNotification({
            type: 'info',
            category: 'system',
            title: 'Welcome to YieldForecast',
            message: 'Draw a zone on the map to start forecasting crop yields.'
        });
    }, []);

    useEffect(() => {
        if (drawnGeometry && formData.parameter) {
            fetchVisualization(formData.parameter);
        } else {
        }
    }, [drawnGeometry, formData.parameter, formData.startDate, formData.endDate]);

    const toggleLayer = (param: string) => {
        setTileLayers(prev => {
            const current = prev[param as keyof typeof prev];
            if (!current) return prev;
            return {
                ...prev,
                [param]: { ...current, visible: !current.visible }
            };
        });
    };

    const changeOpacity = (param: string, opacity: number) => {
        setTileLayers(prev => {
            const current = prev[param as keyof typeof prev];
            if (!current) return prev;
            return {
                ...prev,
                [param]: { ...current, opacity }
            };
        });
    };

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'dismissed'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            dismissed: false
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const dismissNotification = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, dismissed: true } : n)
        );
    };

    const clearAllNotifications = () => {
        setNotifications(prev => prev.map(n => ({ ...n, dismissed: true })));
    };

    const fetchYieldData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/yields`, {
                credentials: 'include'
            });
            if (res.ok) {
                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    if (Array.isArray(data)) {
                        setYieldData(data);
                        if (data.length > 0) {
                            addNotification({
                                type: 'success',
                                category: 'activity',
                                title: 'Data Loaded',
                                message: `Successfully loaded ${data.length} forecast records.`
                            });
                        }
                    } else {
                        setYieldData([]);
                        setMessage('Error: Received invalid data format from server');
                        addNotification({
                            type: 'error',
                            category: 'system',
                            title: 'Data Error',
                            message: 'Received invalid data format from server.'
                        });
                    }
                } catch (e) {
                    setMessage('Error parsing data from server');
                    addNotification({
                        type: 'error',
                        category: 'system',
                        title: 'Parse Error',
                        message: 'Failed to parse data from server.'
                    });
                }
            } else {
                setMessage(`Error fetching data: ${res.status}`);
                addNotification({
                    type: 'error',
                    category: 'system',
                    title: 'Fetch Error',
                    message: `Failed to fetch data: ${res.status}`
                });
            }
        } catch (error) {
            setMessage(`Network error fetching data: ${String(error)}`);
            addNotification({
                type: 'error',
                category: 'system',
                title: 'Network Error',
                message: 'Unable to connect to server.'
            });
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setMapCenter([parseFloat(lat), parseFloat(lon)]);
                const locationName = data[0].display_name.split(',')[0];
                setMessage(`Found: ${locationName}`);
                addNotification({
                    type: 'success',
                    category: 'activity',
                    title: 'Location Found',
                    message: `Map centered on ${locationName}.`
                });
            } else {
                setMessage('Location not found.');
                addNotification({
                    type: 'warning',
                    category: 'system',
                    title: 'Location Not Found',
                    message: 'Could not find the specified location.'
                });
            }
        } catch (error) {
            setMessage('Error searching for location.');
            addNotification({
                type: 'error',
                category: 'system',
                title: 'Search Error',
                message: 'Failed to search for location.'
            });
        } finally {
            setIsSearching(false);
        }
    };

    const checkDataAvailability = async (geometry: any) => {
        if (!geometry) {
            setDataAvailability(null);
            setAvailabilityError(null);
            return;
        }

        setIsCheckingAvailability(true);
        setAvailabilityError(null);
        setMessage('Checking satellite data availability...');

        try {
            const res = await fetch(`${API_URL}/api/forecast/check-availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    geometry: geometry,
                    startDate: formData.startDate,
                    endDate: formData.endDate
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.error) {
                    setAvailabilityError(data.error);
                    setDataAvailability(null);
                    setMessage(`Availability check failed: ${data.error}`);
                    addNotification({
                        type: 'error',
                        category: 'system',
                        title: 'Availability Check Failed',
                        message: data.error
                    });
                } else {
                    setDataAvailability(data);
                    setMessage(`Found ${data.totalImages} satellite images for this area.`);
                    addNotification({
                        type: 'success',
                        category: 'activity',
                        title: 'Satellite Data Available',
                        message: `Found ${data.totalImages} images for the selected area and date range.`
                    });
                }
            } else {
                const errorText = await res.text();
                setAvailabilityError(`Failed to check availability: ${res.status} ${errorText}`);
                setDataAvailability(null);
                setMessage(`Availability check failed: ${res.status} ${errorText}`);
                addNotification({
                    type: 'error',
                    category: 'system',
                    title: 'Availability Check Failed',
                    message: `Server error: ${res.status}`
                });
            }
        } catch (error) {
            setAvailabilityError(`Error checking availability: ${String(error)}`);
            setDataAvailability(null);
            setMessage(`Availability check error: ${String(error)}`);
            addNotification({
                type: 'error',
                category: 'system',
                title: 'Connection Error',
                message: 'Failed to check satellite data availability.'
            });
        } finally {
            setIsCheckingAvailability(false);
        }
    };

    const handleZoneDrawn = (geometry: any) => {
        setDrawnGeometry(geometry);
        setMessage('Zone drawn! You can now run a forecast. Optionally check satellite data availability first.');
        setDataAvailability(null);
        setAvailabilityError(null);
        addNotification({
            type: 'success',
            category: 'activity',
            title: 'Zone Created',
            message: 'New zone drawn on map. Ready to run forecast.'
        });
    };

    const handleZoneEdited = (geometry: any) => {
        setDrawnGeometry(geometry);
        setMessage('Zone updated. You can run a forecast with the new area.');
        setDataAvailability(null);
        setAvailabilityError(null);
        addNotification({
            type: 'info',
            category: 'activity',
            title: 'Zone Updated',
            message: 'Zone boundaries have been modified.'
        });
    };

    const handleZoneDeleted = () => {
        setDrawnGeometry(null);
        setSelectedGeometry(null);
        setMessage('Zone deleted.');
        setDataAvailability(null);
        setAvailabilityError(null);
        if (selectedRecordId) {
            cancelEdit();
        }
        addNotification({
            type: 'info',
            category: 'activity',
            title: 'Zone Deleted',
            message: 'Zone removed from map.'
        });
    };

    const handleRowClick = (record: YieldRecord) => {
        setSelectedRecordId(record.id);
        setFormData({
            location: record.location,
            startDate: typeof record.date === 'string' ? record.date : String(record.date),
            endDate: typeof record.date === 'string' ? record.date : String(record.date),
            parameter: record.parameter || 'NDVI'
        });

        if (record.geometryJson) {
            try {
                const geom = JSON.parse(record.geometryJson);
                setSelectedGeometry(geom);
                setDrawnGeometry(geom);
                setMessage(`Editing record "${record.location}".`);
                addNotification({
                    type: 'info',
                    category: 'activity',
                    title: 'Record Selected',
                    message: `Editing "${record.location}".`
                });
            } catch (e) {
            }
        } else if (record.latitude && record.longitude) {
            const pointGeom = {
                type: "Point",
                coordinates: [record.longitude, record.latitude]
            };
            setSelectedGeometry(pointGeom);
            setDrawnGeometry(pointGeom);
            setMessage(`Editing record "${record.location}" (Point only).`);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setSelectedRecordId(null);
        setFormData({
            location: '',
            startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            parameter: 'NDVI'
        });
        setDrawnGeometry(null);
        setSelectedGeometry(null);
        setMessage('');
    };

    const fetchVisualization = async (parameter: string) => {
        if (!drawnGeometry) return;

        try {
            const res = await fetch(`${API_URL}/api/forecast/visualization`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    geometry: drawnGeometry,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    parameter: parameter
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.tile_url) {
                    setTileLayers(prev => ({
                        ...prev,
                        [parameter]: {
                            url: data.tile_url,
                            opacity: prev[parameter as keyof typeof prev]?.opacity || 0.7,
                            visible: true
                        }
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching visualization:', error);
        }
    };

    const runForecast = async () => {
        if (!formData.location.trim()) {
            setMessage('Please enter a Zone Name.');
            addNotification({
                type: 'warning',
                category: 'system',
                title: 'Missing Zone Name',
                message: 'Please enter a name for the zone.'
            });
            return;
        }
        if (!drawnGeometry) {
            setMessage('Please draw a zone on the map first.');
            addNotification({
                type: 'warning',
                category: 'system',
                title: 'No Zone Selected',
                message: 'Please draw a zone on the map before running forecast.'
            });
            return;
        }

        setIsForecasting(true);
        setMessage('Starting forecast process...');
        addNotification({
            type: 'info',
            category: 'activity',
            title: 'Forecast Started',
            message: `Processing forecast for "${formData.location}". This may take a few minutes...`
        });

        try {
            const payload = {
                id: selectedRecordId,
                location: formData.location || 'Custom Zone',
                geometry: drawnGeometry,
                date: formData.endDate,
                startDate: formData.startDate,
                endDate: formData.endDate,
                parameter: formData.parameter
            };

            const res = await fetch(`${API_URL}/api/forecast/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setMessage(selectedRecordId ? 'Update started! Large areas may take several minutes to process...' : 'Forecast started! Large areas may take several minutes to process...');

                setTimeout(async () => {
                    await fetchYieldData();
                    setMessage('Forecast completed. Results updated.');
                    setIsForecasting(false);
                    addNotification({
                        type: 'success',
                        category: 'crop',
                        title: 'Forecast Complete',
                        message: `Forecast for "${formData.location}" has been completed successfully.`
                    });
                }, 60000);
            } else {
                setMessage(`Failed to start forecast: ${res.status} ${res.statusText}`);
                setIsForecasting(false);
                addNotification({
                    type: 'error',
                    category: 'system',
                    title: 'Forecast Failed',
                    message: `Failed to start forecast: ${res.status}`
                });
            }
        } catch (error) {
            setMessage('Error connecting to server.');
            setIsForecasting(false);
            addNotification({
                type: 'error',
                category: 'system',
                title: 'Connection Error',
                message: 'Unable to connect to forecast service.'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <Sprout className="w-8 h-8 text-green-600" />
                            <span className="text-xl font-bold text-gray-900">YieldForecast Dashboard</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-600">Welcome, User</span>
                            <Link href="/" className="text-gray-500 hover:text-red-600">
                                <LogOut className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">Satellite Map</h2>
                            <div className="bg-white rounded-xl shadow-lg p-1 h-[600px]">
                                <MapWrapper
                                    onZoneDrawn={handleZoneDrawn}
                                    onZoneEdited={handleZoneEdited}
                                    onZoneDeleted={handleZoneDeleted}
                                    selectedGeometry={selectedGeometry}
                                    mapCenter={mapCenter}
                                    tileLayers={tileLayers}
                                />
                            </div>

                            <LayerControl
                                layers={{
                                    NDVI: tileLayers.NDVI ? { ...tileLayers.NDVI, name: 'NDVI', color: '' } : undefined,
                                    NDMI: tileLayers.NDMI ? { ...tileLayers.NDMI, name: 'NDMI', color: '' } : undefined,
                                    RECI: tileLayers.RECI ? { ...tileLayers.RECI, name: 'RECI', color: '' } : undefined,
                                }}
                                onToggleLayer={toggleLayer}
                                onOpacityChange={changeOpacity}
                            />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">Forecast Configuration & Results</h2>
                            <div className="space-y-6">
                                <ForecastSettings
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    handleSearch={handleSearch}
                                    isSearching={isSearching}
                                    formData={formData}
                                    setFormData={setFormData}
                                    runForecast={runForecast}
                                    isForecasting={isForecasting}
                                    drawnGeometry={drawnGeometry}
                                    selectedRecordId={selectedRecordId}
                                    cancelEdit={cancelEdit}
                                    message={message}
                                />

                                <AvailabilityStatus
                                    drawnGeometry={drawnGeometry}
                                    isCheckingAvailability={isCheckingAvailability}
                                    availabilityError={availabilityError}
                                    dataAvailability={dataAvailability}
                                    checkDataAvailability={checkDataAvailability}
                                />

                                <ForecastResults
                                    yieldData={yieldData}
                                    fetchYieldData={fetchYieldData}
                                    handleRowClick={handleRowClick}
                                    setMessage={setMessage}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Alerts & Activity</h2>
                        <NotificationsPanel
                            notifications={notifications}
                            onDismiss={dismissNotification}
                            onClearAll={clearAllNotifications}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}