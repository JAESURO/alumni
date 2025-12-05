export interface YieldRecord {
    id: number;
    location: string;
    date: string;
    prediction: number;
    latitude: number;
    longitude: number;
    geometryJson: string;
    parameter: string;
    userId: number;
    startDate: string;
    endDate: string;
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