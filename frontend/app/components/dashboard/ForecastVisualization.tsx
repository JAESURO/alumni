'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';
import { YieldRecord } from '../../types/dashboard';

interface ForecastVisualizationProps {
    yieldData: YieldRecord[];
    selectedParameter: string;
}

export default function ForecastVisualization({
    yieldData,
    selectedParameter
}: ForecastVisualizationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stats, setStats] = useState<{
        mean: number;
        min: number;
        max: number;
        count: number;
    } | null>(null);

    useEffect(() => {
        if (yieldData.length > 0) {
            calculateStats();
            drawChart();
        }
    }, [yieldData, selectedParameter]);

    const calculateStats = () => {
        const values = yieldData
            .map(record => record.indexValue ?? record.prediction)
            .filter(val => val !== undefined && val !== null) as number[];

        if (values.length === 0) {
            setStats(null);
            return;
        }

        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        setStats({
            mean,
            min,
            max,
            count: values.length
        });
    };

    const drawChart = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const padding = { top: 30, right: 30, bottom: 50, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (yieldData.length === 0) {
            ctx.fillStyle = '#9CA3AF';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No data to display', width / 2, height / 2);
            return;
        }

        // Prepare data
        const sortedData = [...yieldData].sort((a, b) => {
            const dateA = new Date(a.endDate || a.date).getTime();
            const dateB = new Date(b.endDate || b.date).getTime();
            return dateA - dateB;
        });

        const values = sortedData.map(record => record.indexValue ?? record.prediction ?? 0);
        const dates = sortedData.map(record => {
            const date = new Date(record.endDate || record.date);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        });

        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const valueRange = maxValue - minValue || 1;

        // Draw grid lines
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();

            // Y-axis labels
            const value = maxValue - (valueRange / 5) * i;
            ctx.fillStyle = '#6B7280';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(value.toFixed(3), padding.left - 10, y + 4);
        }

        // Draw axes
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, padding.top + chartHeight);
        ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
        ctx.stroke();

        // Draw line chart
        if (values.length > 0) {
            ctx.strokeStyle = '#10B981';
            ctx.lineWidth = 3;
            ctx.beginPath();

            values.forEach((value, index) => {
                const x = padding.left + (chartWidth / Math.max(values.length - 1, 1)) * index;
                const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            // Draw points
            values.forEach((value, index) => {
                const x = padding.left + (chartWidth / Math.max(values.length - 1, 1)) * index;
                const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

                ctx.fillStyle = '#10B981';
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();

                // Draw point border
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
            });
        }

        // Draw X-axis labels
        ctx.fillStyle = '#6B7280';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        dates.forEach((date, index) => {
            const x = padding.left + (chartWidth / Math.max(dates.length - 1, 1)) * index;
            ctx.fillText(date, x, padding.top + chartHeight + 20);
        });

        // Draw axis titles
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Date', width / 2, height - 10);

        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(selectedParameter || 'Index Value', 0, 0);
        ctx.restore();
    };

    const formatValue = (value: number) => {
        return value.toFixed(4);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                    Forecast Visualization
                </h2>
                {selectedParameter && (
                    <span className="text-sm text-gray-500">({selectedParameter})</span>
                )}
            </div>

            {yieldData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No visualization data available.</p>
                    <p className="text-sm">Run a forecast to see the visualization.</p>
                </div>
            ) : (
                <>
                    {/* Statistics Cards */}
                    {stats && (
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                <div className="text-xs text-blue-600 font-medium mb-1">COUNT</div>
                                <div className="text-2xl font-bold text-blue-900">{stats.count}</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                                <div className="text-xs text-green-600 font-medium mb-1">MEAN</div>
                                <div className="text-2xl font-bold text-green-900">{formatValue(stats.mean)}</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                                <div className="text-xs text-orange-600 font-medium mb-1">MIN</div>
                                <div className="text-2xl font-bold text-orange-900">{formatValue(stats.min)}</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                                <div className="text-xs text-purple-600 font-medium mb-1">MAX</div>
                                <div className="text-2xl font-bold text-purple-900">{formatValue(stats.max)}</div>
                            </div>
                        </div>
                    )}

                    {/* Chart */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <canvas
                            ref={canvasRef}
                            className="w-full"
                            style={{ height: '300px' }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
