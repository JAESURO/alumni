import React from 'react';
import { Search, RefreshCw, X, CloudRain } from 'lucide-react';

interface ForecastSettingsProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleSearch: () => void;
    isSearching: boolean;
    formData: {
        location: string;
        startDate: string;
        endDate: string;
        parameter: string;
    };
    setFormData: (data: any) => void;
    runForecast: () => void;
    isForecasting: boolean;
    drawnGeometry: any;
    selectedRecordId: number | null;
    cancelEdit: () => void;
    message: string;
    checkDataAvailability: () => void;
    isCheckingAvailability: boolean;
}

export default function ForecastSettings({
    searchQuery,
    setSearchQuery,
    handleSearch,
    isSearching,
    formData,
    setFormData,
    runForecast,
    isForecasting,
    drawnGeometry,
    selectedRecordId,
    cancelEdit,
    message,
    checkDataAvailability,
    isCheckingAvailability
}: ForecastSettingsProps) {
    return (
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

                <div className="flex space-x-2">
                    <button
                        onClick={checkDataAvailability}
                        disabled={isCheckingAvailability || !drawnGeometry}
                        className="flex-1 flex items-center justify-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        <CloudRain className={`w-5 h-5 ${isCheckingAvailability ? 'animate-bounce' : ''}`} />
                        <span>Check Availability</span>
                    </button>

                    <button
                        onClick={runForecast}
                        disabled={isForecasting || !drawnGeometry}
                        className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        <RefreshCw className={`w-5 h-5 ${isForecasting ? 'animate-spin' : ''}`} />
                        <span>{isForecasting ? 'Processing...' : selectedRecordId ? 'Run New Forecast' : 'Run Forecast'}</span>
                    </button>
                </div>

                {selectedRecordId && (
                    <button
                        onClick={cancelEdit}
                        className="w-full flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition mt-2"
                    >
                        <X className="w-5 h-5" />
                        <span>Clear Selection</span>
                    </button>
                )}
            </div>

            {message && (
                <div className={`mt-4 p-4 rounded-lg ${message.includes('Failed') || message.includes('Error') || message.includes('Please') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                    {message}
                </div>
            )}
        </div>
    );
}