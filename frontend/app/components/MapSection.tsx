import MapWrapper from './MapWrapper';

export default function MapSection() {
    return (
        <section className="py-20 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Live Yield Map
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Explore real-time yield predictions across different regions.
                    </p>
                </div>
                <MapWrapper />
            </div>
        </section>
    );
}
