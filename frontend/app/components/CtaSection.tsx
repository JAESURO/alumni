import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CtaSection() {
    return (
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
    );
}