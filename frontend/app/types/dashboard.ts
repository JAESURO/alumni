export interface YieldRecord {
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

export interface AvailableDate {
    date: string;
    cloudCoverage: number;
    quality: 'good' | 'medium' | 'poor';
}

export interface DataAvailability {
    totalImages: number;
    availableDates: AvailableDate[];
    dateRange: {
        start: string;
        end: string;
    };
}