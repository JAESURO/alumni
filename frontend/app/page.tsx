import Link from 'next/link';
import {
  Sprout,
  TrendingUp,
  MapPin,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

import MapWrapper from './components/MapWrapper';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">


      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sprout className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                AgroTrack

              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-gray-600 hover:text-green-600 transition"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-600 hover:text-green-600 transition"
              >
                How It Works
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-green-600 transition"
              >
                Contact
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-green-600 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>


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
              <Link
                href="#how-it-works"
                className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition inline-flex items-center justify-center"
              >
                Learn More
              </Link>
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


      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl mb-8 text-green-50">
            Join thousands of farmers using satellite intelligence to boost
            productivity
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg inline-flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition inline-flex items-center justify-center"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>


      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sprout className="w-6 h-6 text-green-500" />
                <span className="text-xl font-bold text-white">
                  AgroTrack

                </span>
              </div>
              <p className="text-sm text-gray-400">
                Empowering farmers with satellite-powered yield predictions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#features" className="hover:text-green-500">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-green-500">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-green-500">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-green-500">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-green-500">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-green-500">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-green-500">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-green-500">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>
              © 2025 AgroTrack. All rights reserved. Built with 🌾 for

              farmers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}