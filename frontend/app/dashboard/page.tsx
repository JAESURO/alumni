'use client';

import { useState, useEffect, useRef } from 'react';
import MapWrapper from '../components/MapWrapper';
import { Sprout, RefreshCw, LogOut, Calendar, MapPin, TrendingUp, Search, X } from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '../config/api';

interface YieldRecord {
    id: number;
    location: string;
    date: string;
    latitude: number;
    longitude: number;
    prediction: number;
    geometryJson?: string;
    parameter?: string;
    indexValue?: number;
}

interface AvailableDate {
    date: string;
    cloudCoverage: number;
    quality: 'good' | 'medium' | 'poor';
}

interface DataAvailability {
    totalImages: number;
    availableDates: AvailableDate[];
    dateRange: {
        start: string;
        end: string;
    };
}

export default function DashboardPage() {
    const [isForecasting, setIsForecasting] = useState(false);
    const [message, setMessage] = useState('');
    const [drawnGeometry, setDrawnGeometry] = useState<any>(null);
    const [selectedGeometry, setSelectedGeometry] = useState<any>(null);
    const [yieldData, setYieldData] = useState<YieldRecord[]>([]);
    const [formData, setFormData] = useState({
        location: '',
        startDate: new Date().toISOString().split('T')[0],
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
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchYieldData();
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    const fetchYieldData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/yields`);
            if (res.ok) {
                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    if (Array.isArray(data)) {
                        setYieldData(data);
                    } else {
                        setYieldData([]);
                        setMessage('Error: Received invalid data format from server');
                    }
                } catch (e) {
                    setMessage('Error parsing data from server');
                }
            } else {
                setMessage(`Error fetching data: ${res.status}`);
            }
        } catch (error) {
            setMessage(`Network error fetching data: ${String(error)}`);
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
                setMessage(`Found: ${data[0].display_name.split(',')[0]}`);
            } else {
                setMessage('Location not found.');
            }
        } catch (error) {
            setMessage('Error searching for location.');
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
                } else {
                    setDataAvailability(data);
                    setMessage(`Found ${data.totalImages} satellite images for this area.`);
                }
            } else {
                const errorText = await res.text();
                setAvailabilityError(`Failed to check availability: ${res.status} ${errorText}`);
                setDataAvailability(null);
                setMessage(`Availability check failed: ${res.status} ${errorText}`);
            }
        } catch (error) {
            setAvailabilityError(`Error checking availability: ${String(error)}`);
            setDataAvailability(null);
            setMessage(`Availability check error: ${String(error)}`);
        } finally {
            setIsCheckingAvailability(false);
        }
    };

    const handleZoneDrawn = (geometry: any) => {
        setDrawnGeometry(geometry);
        setMessage('Zone drawn! You can now run a forecast. Optionally check satellite data availability first.');
        setDataAvailability(null);
        setAvailabilityError(null);
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
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            parameter: 'NDVI'
        });
        setDrawnGeometry(null);
        setSelectedGeometry(null);
        setMessage('');
    };

    const runForecast = async () => {
        if (!formData.location.trim()) {
            setMessage('Please enter a Zone Name.');
            return;
        }
        if (!drawnGeometry) {
            setMessage('Please draw a zone on the map first.');
            return;
        }

        setIsForecasting(true);
        setMessage('Starting forecast process...');

        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }

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
                body: JSON.stringify(payload),
            });

            const rawResText = await res.text().catch(() => null);

            if (res.ok) {
                setMessage(selectedRecordId ? 'Update started! Waiting for completion...' : 'Forecast started! Waiting for completion...');
                let pollCount = 0;
                const maxPolls = 30;
                const statusPollIntervalMs = 2000;

                const pollStatus = async () => {
                    pollCount++;
                    try {
                        const statusRes = await fetch(`${API_URL}/api/forecast/status`);
                        if (statusRes.ok) {
                            const statusJson = await statusRes.json();
                            const running = !!statusJson.running;
                            const msg = String(statusJson.message || '');

                            if (running) {
                                setMessage(`Forecast running... (${pollCount}/${maxPolls}) Status: ${msg}`);
                            }

                            if (!running && /completed|failed/i.test(msg)) {
                                await fetchYieldData();
                                if (pollingIntervalRef.current) {
                                    clearInterval(pollingIntervalRef.current);
                                    pollingIntervalRef.current = null;
                                }
                                setMessage(!running && /failed/i.test(msg) ? `Forecast finished with status: ${msg}` : 'Forecast completed. Results updated.');
                                setIsForecasting(false);
                                return;
                            }
                        }
                    } catch (err) {
                        if (pollCount % 5 === 0) setMessage(`Polling connection error... (${pollCount})`);
                    }

                    if (pollCount >= maxPolls) {
                        if (pollingIntervalRef.current) {
                            clearInterval(pollingIntervalRef.current);
                            pollingIntervalRef.current = null;
                        }
                        setMessage('Polling timed out. Please check backend logs.');
                        setIsForecasting(false);
                    }
                };

                setTimeout(pollStatus, 1000);
                pollingIntervalRef.current = setInterval(pollStatus, statusPollIntervalMs);
            } else {
                const errorText = await res.text();
                setMessage(`Failed to start forecast: ${res.status} ${res.statusText}`);
                setIsForecasting(false);
            }
        } catch (error) {
            setMessage('Error connecting to server.');
            setIsForecasting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
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

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Forecast Settings</h2>

                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm text-blue-800">
                                        <strong>Step 1:</strong> Search for a location or draw a zone on the map.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Location</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            placeholder="e.g. Paris, Texas"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                        <button
                                            onClick={handleSearch}
                                            disabled={isSearching}
                                            className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition"
                                        >
                                            <Search className={`w-5 h-5 text-gray-600 ${isSearching ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="Enter a name for this zone"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parameter</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        value={formData.parameter}
                                        onChange={(e) => setFormData({ ...formData, parameter: e.target.value })}
                                    >
                                        <option value="NDVI">NDVI (Vegetation Index)</option>
                                        <option value="NDMI">NDMI (Moisture Index)</option>
                                        <option value="RECI">RECI (Chlorophyll)</option>
                                    </select>
                                </div>

                                <button
                                    onClick={runForecast}
                                    disabled={isForecasting || !drawnGeometry}
                                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    <RefreshCw className={`w-5 h-5 ${isForecasting ? 'animate-spin' : ''}`} />
                                    <span>{isForecasting ? 'Processing...' : selectedRecordId ? 'Update Record' : 'Run Forecast'}</span>
                                </button>

                                {selectedRecordId && (
                                    <button
                                        onClick={cancelEdit}
                                        className="w-full flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition mt-2"
                                    >
                                        <X className="w-5 h-5" />
                                        <span>Cancel Edit</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-lg ${message.includes('Failed') || message.includes('Error') || message.includes('Please') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                {message}
                            </div>
                        )}

                        {/* Area statistics removed - using satellite-only availability */}

                        {drawnGeometry && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                                    <Calendar className="w-5 h-5 text-green-600" />
                                    <span>Satellite Data Availability</span>
                                    <span className="text-xs font-normal text-gray-500">(Optional)</span>
                                </h3>
                                {isCheckingAvailability ? (
                                    <div className="text-center py-4">
                                        <RefreshCw className="w-6 h-6 mx-auto animate-spin text-gray-400" />
                                        <p className="text-sm text-gray-500 mt-2">Checking satellite data... (may take up to 30s)</p>
                                    </div>
                                ) : availabilityError ? (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                            <div className="text-sm font-medium text-yellow-800">{availabilityError}</div>
                                        </div>
                                        <button
                                            onClick={() => checkDataAvailability(drawnGeometry)}
                                            className="w-full bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition text-sm"
                                        >
                                            Retry Check
                                        </button>
                                    </div>
                                ) : dataAvailability ? (
                                    <div className="space-y-3">
                                        <div className={`p-3 rounded-lg border ${dataAvailability.totalImages > 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                            <div className={`text-sm font-medium ${dataAvailability.totalImages > 0 ? 'text-green-800' : 'text-yellow-800'}`}>
                                                {dataAvailability.totalImages} images available
                                            </div>
                                            <div className={`text-xs mt-1 ${dataAvailability.totalImages > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {dataAvailability.dateRange?.start && dataAvailability.dateRange?.end
                                                    ? `${new Date(dataAvailability.dateRange.start).toLocaleDateString()} - ${new Date(dataAvailability.dateRange.end).toLocaleDateString()}`
                                                    : 'Date range checked'}
                                            </div>
                                        </div>

                                        {dataAvailability.totalImages === 0 && (
                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="text-sm text-blue-800">
                                                    💡 <strong>Tip:</strong> No satellite data found for this date range.
                                                </div>
                                                <div className="text-xs text-blue-600 mt-2">
                                                    • Try selecting a date range in the past (satellite data is not available for future dates)
                                                    <br />
                                                    • Expand the date range to include more days
                                                    <br />
                                                    • The forecast will still work using historical data from the previous year
                                                </div>
                                            </div>
                                        )}

                                        {dataAvailability.availableDates && dataAvailability.availableDates.length > 0 && (
                                            <div className="max-h-64 overflow-y-auto space-y-2">
                                                <div className="text-xs font-medium text-gray-600 mb-2">Recent Dates:</div>
                                                {dataAvailability.availableDates.slice(0, 10).map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`p-2 rounded-lg border ${item.quality === 'good'
                                                            ? 'bg-green-50 border-green-200'
                                                            : item.quality === 'medium'
                                                                ? 'bg-yellow-50 border-yellow-200'
                                                                : 'bg-red-50 border-red-200'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {new Date(item.date).toLocaleDateString()}
                                                            </span>
                                                            <span className={`text-xs px-2 py-1 rounded ${item.quality === 'good'
                                                                ? 'bg-green-100 text-green-700'
                                                                : item.quality === 'medium'
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                {item.cloudCoverage}% clouds
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => checkDataAvailability(drawnGeometry)}
                                        className="w-full bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition text-sm"
                                    >
                                        Check Availability
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Map and Data Area */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Map */}
                        <div className="bg-white rounded-xl shadow-lg p-1 h-[600px]">
                            <MapWrapper onZoneDrawn={handleZoneDrawn} selectedGeometry={selectedGeometry} mapCenter={mapCenter} />
                        </div>

                        {/* Forecast Results Table */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    <span>Forecast Results</span>
                                    <span className="text-sm font-normal text-gray-500">({yieldData.length} records)</span>
                                </h2>
                                <button
                                    onClick={fetchYieldData}
                                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                    title="Refresh Data"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>

                            {yieldData.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Sprout className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>No forecast data yet. Draw a zone and run a forecast to see results.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50">
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinates</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Index</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {yieldData.map((record) => (
                                                <tr
                                                    key={record.id}
                                                    onClick={() => handleRowClick(record)}
                                                    className="hover:bg-blue-50 transition cursor-pointer"
                                                >
                                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            <MapPin className="w-4 h-4 text-green-600" />
                                                            <span>{record.location}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        <div className="flex items-center space-x-2">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            <span>{typeof record.date === 'string' ? record.date : String(record.date)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                                                        {record.latitude?.toFixed(4)}, {record.longitude?.toFixed(4)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{record.parameter || 'NDVI'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 font-mono">{(record.indexValue ?? record.prediction)?.toFixed(4)}</td>
                                                    <td className="px-4 py-3 text-sm text-right">
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (!confirm('Delete this record?')) return;
                                                                try {
                                                                    const res = await fetch(`${API_URL}/api/yields/${record.id}`, { method: 'DELETE' });
                                                                    if (res.ok) {
                                                                        setMessage('Record deleted');
                                                                        fetchYieldData();
                                                                    } else {
                                                                        setMessage('Failed to delete record');
                                                                    }
                                                                } catch (err) {
                                                                    setMessage('Error deleting record');
                                                                }
                                                            }}
                                                            className="text-sm text-red-600 hover:underline"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}