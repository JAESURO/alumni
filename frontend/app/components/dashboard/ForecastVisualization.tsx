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

    const PARAM_COLORS: { [key: string]: string } = {
        NDVI: '#10B981',
        NDMI: '#3B82F6',
        RECI: '#F59E0B',
        DEFAULT: '#6B7280'
    };

    useEffect(() => {
        if (yieldData.length > 0) {
            drawChart();
        }
    }, [yieldData, selectedParameter]);

    const drawChart = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const padding = { top: 40, right: 30, bottom: 50, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        ctx.clearRect(0, 0, width, height);

        if (yieldData.length === 0) {
            ctx.fillStyle = '#9CA3AF';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No data to display', width / 2, height / 2);
            return;
        }

        const dataByParam: { [key: string]: YieldRecord[] } = {};
        const allDatesSet = new Set<string>();

        yieldData.forEach(record => {
            const param = record.parameter || 'NDVI';
            if (!dataByParam[param]) dataByParam[param] = [];
            dataByParam[param].push(record);
            const d = new Date(record.endDate || record.date);
            allDatesSet.add(d.toISOString().split('T')[0]);
        });

        const params = Object.keys(dataByParam);
        const sortedUniqueDates = Array.from(allDatesSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        const allValues = yieldData.map(r => r.indexValue ?? r.prediction ?? 0);
        let globalMin = Math.min(...allValues);
        let globalMax = Math.max(...allValues);

        if (globalMin === globalMax) {
            globalMin -= 0.1;
            globalMax += 0.1;
        }
        const valueRange = globalMax - globalMin;

        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();

            const value = globalMax - (valueRange / 5) * i;
            ctx.fillStyle = '#6B7280';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(value.toFixed(3), padding.left - 10, y + 4);
        }

        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, padding.top + chartHeight);
        ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
        ctx.stroke();

        const labelCount = Math.min(sortedUniqueDates.length, 6);
        const labelStep = Math.ceil(sortedUniqueDates.length / labelCount);

        ctx.fillStyle = '#6B7280';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';

        sortedUniqueDates.forEach((dateStr, index) => {
            if (index % labelStep === 0 || index === sortedUniqueDates.length - 1) {
                const dateObj = new Date(dateStr);
                const label = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

                const x = padding.left + (chartWidth / Math.max(sortedUniqueDates.length - 1, 1)) * index;
                ctx.fillText(label, x, padding.top + chartHeight + 20);
            }
        });

        params.forEach(param => {
            const records = dataByParam[param];
            records.sort((a, b) => new Date(a.endDate || a.date).getTime() - new Date(b.endDate || b.date).getTime());

            const color = PARAM_COLORS[param] || PARAM_COLORS.DEFAULT;
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.beginPath();

            let firstPoint = true;

            records.forEach(record => {
                const val = record.indexValue ?? record.prediction ?? 0;
                const dStr = new Date(record.endDate || record.date).toISOString().split('T')[0];
                const dateIndex = sortedUniqueDates.indexOf(dStr);

                if (dateIndex !== -1) {
                    const x = padding.left + (chartWidth / Math.max(sortedUniqueDates.length - 1, 1)) * dateIndex;
                    const y = padding.top + chartHeight - ((val - globalMin) / valueRange) * chartHeight;

                    if (firstPoint) {
                        ctx.moveTo(x, y);
                        firstPoint = false;
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
            });
            ctx.stroke();

            ctx.fillStyle = color;
            records.forEach(record => {
                const val = record.indexValue ?? record.prediction ?? 0;
                const dStr = new Date(record.endDate || record.date).toISOString().split('T')[0];
                const dateIndex = sortedUniqueDates.indexOf(dStr);

                if (dateIndex !== -1) {
                    const x = padding.left + (chartWidth / Math.max(sortedUniqueDates.length - 1, 1)) * dateIndex;
                    const y = padding.top + chartHeight - ((val - globalMin) / valueRange) * chartHeight;

                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        });

        let legendX = padding.left + 10;
        const legendY = 20;

        params.forEach(param => {
            const color = PARAM_COLORS[param] || PARAM_COLORS.DEFAULT;

            ctx.fillStyle = color;
            ctx.fillRect(legendX, legendY, 12, 12);

            ctx.fillStyle = '#374151';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(param, legendX + 18, legendY + 10);

            legendX += 60;
        });

        ctx.fillStyle = '#374151';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Date', width / 2, height - 10);

        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Value', 0, 0);
        ctx.restore();
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                    Forecast Visualization
                </h2>
            </div>

            {yieldData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No visualization data available.</p>
                    <p className="text-sm">Run a forecast to see the visualization.</p>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <canvas
                        ref={canvasRef}
                        className="w-full"
                        style={{ height: '300px' }}
                    />
                </div>
            )}
        </div>
    );
}
