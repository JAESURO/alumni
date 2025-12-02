'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Mail,
    Phone,
    MapPin,
    Send,
    Sprout,
    MessageSquare,
} from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <Sprout className="w-8 h-8 text-green-600" />
                            <span className="text-2xl font-bold text-gray-900">
                                YieldForecast
                            </span>
                        </Link>
                        <Link
                            href="/"
                            className="text-gray-600 hover:text-green-600 transition"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Have questions about YieldForecast? We're here to help you maximize
                        your agricultural productivity.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Mail className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Email Us</h3>
                            <p className="text-gray-600 mb-2">
                                Our team typically responds within 24 hours
                            </p>
                            <a
                                href="mailto:support@yieldforecast.com"
                                className="text-green-600 hover:text-green-700 font-medium"
                            >
                                support@yieldforecast.com
                            </a>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Phone className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Call Us</h3>
                            <p className="text-gray-600 mb-2">Mon-Fri from 9am to 6pm</p>
                            <a
                                href="tel:+77001234567"
                                className="text-green-600 hover:text-green-700 font-medium"
                            >
                                +7 (700) 123-45-67
                            </a>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <MapPin className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Visit Us
                            </h3>
                            <p className="text-gray-600">
                                Astana, Kazakhstan
                                <br />
                                Kabanbay Batyr Ave, 53
                                <br />
                                010000
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <MessageSquare className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Live Chat
                            </h3>
                            <p className="text-gray-600 mb-3">
                                Chat with our support team in real-time
                            </p>
                            <button className="text-green-600 hover:text-green-700 font-medium">
                                Start Chat →
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Send Us a Message
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) =>
                                            setFormData({ ...formData, subject: e.target.value })
                                        }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                        placeholder="How can we help you?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        required
                                        rows={6}
                                        value={formData.message}
                                        onChange={(e) =>
                                            setFormData({ ...formData, message: e.target.value })
                                        }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                                >
                                    <Send className="w-5 h-5 mr-2" />
                                    Send Message
                                </button>
                            </form>

                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <p className="text-sm text-gray-600 text-center">
                                    By submitting this form, you agree to our{' '}
                                    <Link
                                        href="/privacy"
                                        className="text-green-600 hover:underline"
                                    >
                                        Privacy Policy
                                    </Link>
                                    . We'll never share your information with third parties.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                        Frequently Asked Questions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h3 className="font-bold text-gray-900 mb-2">
                                How accurate are the yield predictions?
                            </h3>
                            <p className="text-gray-600">
                                Our AI models achieve 95% accuracy by analyzing satellite NDVI
                                data, historical patterns, and weather conditions.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h3 className="font-bold text-gray-900 mb-2">
                                What crops are supported?
                            </h3>
                            <p className="text-gray-600">
                                We currently support wheat, corn, rice, soybeans, and other
                                major crops. Contact us for specific crop requirements.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h3 className="font-bold text-gray-900 mb-2">
                                Is there a free trial?
                            </h3>
                            <p className="text-gray-600">
                                Yes! We offer a 14-day free trial with full access to all
                                features. No credit card required.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h3 className="font-bold text-gray-900 mb-2">
                                Can I use this for multiple farms?
                            </h3>
                            <p className="text-gray-600">
                                Absolutely! Our platform supports unlimited fields and
                                locations. Perfect for farm managers and agricultural
                                consultants.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}