import React from 'react';
import { RefreshCw, Calendar } from 'lucide-react';
import { DataAvailability } from '../../types/dashboard';

interface AvailabilityStatusProps {
    drawnGeometry: any;
    isCheckingAvailability: boolean;
    availabilityError: string | null;
    dataAvailability: DataAvailability | null;
    checkDataAvailability: (geometry: any) => void;
}

export default function AvailabilityStatus({
    drawnGeometry,
    isCheckingAvailability,
    availabilityError,
    dataAvailability,
    checkDataAvailability
}: AvailabilityStatusProps) {
    if (!drawnGeometry) return null;

    return (
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
    );
}