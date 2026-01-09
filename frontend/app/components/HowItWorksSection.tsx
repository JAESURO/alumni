export default function HowItWorksSection() {
    return (
        <section
            id="how-it-works"
            className="py-20 px-4 bg-gradient-to-br from-green-50 to-emerald-50"
        >
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        How It Works
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Three simple steps to smarter farming
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                            1
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Define Your Fields
                        </h3>
                        <p className="text-gray-600">
                            Mark your agricultural areas on the interactive map or import
                            existing field boundaries.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                            2
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            AI Analysis
                        </h3>
                        <p className="text-gray-600">
                            Our system analyzes satellite data, NDVI values, and historical
                            patterns automatically.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                            3
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Get Predictions
                        </h3>
                        <p className="text-gray-600">
                            Receive accurate yield forecasts and actionable insights to
                            optimize your harvest.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}