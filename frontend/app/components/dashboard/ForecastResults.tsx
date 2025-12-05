import React from 'react';
import { TrendingUp, RefreshCw, Sprout, MapPin, Calendar } from 'lucide-react';
import { YieldRecord } from '../../types/dashboard';
import { API_URL } from '../../config/api';

interface ForecastResultsProps {
    yieldData: YieldRecord[];
    fetchYieldData: () => void;
    handleRowClick: (record: YieldRecord) => void;
    setMessage: (msg: string) => void;
}

export default function ForecastResults({
    yieldData,
    fetchYieldData,
    handleRowClick,
    setMessage
}: ForecastResultsProps) {
    const formatDate = (dateStr: string | Date): string => {
        try {
            let date: Date;
            if (typeof dateStr === 'string') {
                const parts = dateStr.split('-');
                if (parts.length === 3) {
                    date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                } else {
                    date = new Date(dateStr);
                }
            } else {
                date = dateStr;
            }

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            return `${day}/${month}/${year}`;
        } catch {
            return String(dateStr);
        }
    };

    return (
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
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
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
                                            <span>{record.startDate ? formatDate(record.startDate) : 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span>{record.endDate ? formatDate(record.endDate) : 'N/A'}</span>
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
                                                    const res = await fetch(`${API_URL}/api/yields/${record.id}`, {
                                                        method: 'DELETE',
                                                        credentials: 'include'
                                                    });
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
    );
}