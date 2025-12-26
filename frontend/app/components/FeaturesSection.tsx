import {
    Sprout,
    TrendingUp,
    MapPin,
    BarChart3,
    Shield,
    Zap,
} from 'lucide-react';

export default function FeaturesSection() {
    return (
        <section id="features" className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Powerful Features for Modern Agriculture
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Everything you need to make data-driven decisions for your farm
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Yield Prediction
                        </h3>
                        <p className="text-gray-600">
                            AI-powered forecasts using NDVI and satellite imagery to predict
                            crop yields weeks in advance.
                        </p>
                    </div>


                    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <MapPin className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Interactive Maps
                        </h3>
                        <p className="text-gray-600">
                            Visualize your fields with detailed satellite imagery and
                            vegetation health indicators.
                        </p>
                    </div>


                    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <BarChart3 className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Analytics Dashboard
                        </h3>
                        <p className="text-gray-600">
                            Track trends, compare seasons, and gain insights from
                            comprehensive data analytics.
                        </p>
                    </div>


                    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Secure & Private
                        </h3>
                        <p className="text-gray-600">
                            Your farm data is encrypted and protected with enterprise-grade
                            security measures.
                        </p>
                    </div>


                    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Real-time Alerts
                        </h3>
                        <p className="text-gray-600">
                            Get instant notifications about critical changes in crop health
                            and weather conditions.
                        </p>
                    </div>


                    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <Sprout className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Multi-Crop Support
                        </h3>
                        <p className="text-gray-600">
                            Monitor wheat, corn, rice, and other major crops with
                            specialized prediction models.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
