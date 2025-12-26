'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sprout } from 'lucide-react';

import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import MapSection from './components/MapSection';
import HowItWorksSection from './components/HowItWorksSection';
import CtaSection from './components/CtaSection';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <HeroSection />
            <CtaSection />
          </>
        );
      case 'features':
        return <FeaturesSection />;
      case 'map':
        return <MapSection />;
      case 'how-it-works':
        return <HowItWorksSection />;
      default:
        return (
          <>
            <HeroSection />
            <CtaSection />
          </>
        );
    }
  };

  const getTabClass = (tabName: string) => {
    const baseClass = "text-gray-600 hover:text-green-600 transition cursor-pointer";
    const activeClass = "text-green-600 font-semibold";
    return activeTab === tabName ? activeClass : baseClass;
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setActiveTab('home')}
            >
              <Sprout className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                AgroTrack
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setActiveTab('features')}
                className={getTabClass('features')}
              >
                Features
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={getTabClass('map')}
              >
                Map
              </button>
              <button
                onClick={() => setActiveTab('how-it-works')}
                className={getTabClass('how-it-works')}
              >
                How It Works
              </button>
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

      <main>
        {renderContent()}
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12 px-4 mt-auto">
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
                  <button onClick={() => setActiveTab('features')} className="hover:text-green-500 text-left">
                    Features
                  </button>
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