import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HeroSection({ onLearnMoreClick }: { onLearnMoreClick?: () => void }) {
    return (
        <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Predict Your Harvest with{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                            Satellite Intelligence
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Leverage cutting-edge Earth observation technology to forecast
                        crop yields, optimize farming decisions, and maximize your
                        agricultural productivity.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register"
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition shadow-xl hover:shadow-2xl inline-flex items-center justify-center"
                        >
                            Start Free Trial
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <button
                            onClick={onLearnMoreClick}
                            className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition inline-flex items-center justify-center"
                        >
                            Learn More
                        </button>
                    </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                    <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                            95%
                        </div>
                        <div className="text-gray-600">Prediction Accuracy</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                            10M+
                        </div>
                        <div className="text-gray-600">Hectares Monitored</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                            24/7
                        </div>
                        <div className="text-gray-600">Real-time Updates</div>
                    </div>
                </div>
            </div>
        </section>
    );
}