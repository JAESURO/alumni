'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface LayerInfo {
    name: string;
    visible: boolean;
    opacity: number;
    color: string;
}

interface LayerControlProps {
    layers: {
        NDVI?: LayerInfo;
        NDMI?: LayerInfo;
        RECI?: LayerInfo;
    };
    onToggleLayer: (parameter: string) => void;
    onOpacityChange: (parameter: string, opacity: number) => void;
}

export default function LayerControl({ layers, onToggleLayer, onOpacityChange }: LayerControlProps) {
    const layerConfig = {
        NDVI: {
            label: 'NDVI',
            description: 'Vegetation Health',
            gradient: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00)'
        },
        NDMI: {
            label: 'NDMI',
            description: 'Moisture Content',
            gradient: 'linear-gradient(to right, #0000ff, #00ffff, #00ff00)'
        },
        RECI: {
            label: 'RECI',
            description: 'Chlorophyll Content',
            gradient: 'linear-gradient(to right, #ffff00, #ff8800, #ff0000)'
        }
    };

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Map Layers</h3>

            <div className="space-y-4">
                {Object.entries(layerConfig).map(([key, config]) => {
                    const layer = layers[key as keyof typeof layers];
                    if (!layer) return null;

                    return (
                        <div key={key} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onToggleLayer(key)}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                            title={layer.visible ? 'Hide layer' : 'Show layer'}
                                        >
                                            {layer.visible ? (
                                                <Eye className="w-4 h-4 text-blue-600" />
                                            ) : (
                                                <EyeOff className="w-4 h-4 text-gray-400" />
                                            )}
                                        </button>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {config.label}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {config.description}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {layer.visible && (
                                <div className="ml-7 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-600 dark:text-gray-400 w-16">
                                            Opacity
                                        </span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={layer.opacity * 100}
                                            onChange={(e) => onOpacityChange(key, parseInt(e.target.value) / 100)}
                                            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                        />
                                        <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
                                            {Math.round(layer.opacity * 100)}%
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        <div
                                            className="h-3 rounded"
                                            style={{ background: config.gradient }}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span>Low</span>
                                            <span>High</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {Object.values(layers).every(layer => !layer?.visible) && (
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                    No layers active
                </div>
            )}
        </div>
    );
}