"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle, Heart, Share2, Home, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DonationSuccessPage() {
    const params = useParams();

    useEffect(() => {
        const timer = setTimeout(() => {
            toast.success('Thank you for your kindness!');
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const handleShare = async () => {
        const shareData = {
            title: 'I just donated to help a pet in need!',
            text: 'Join me in supporting pets who need food assistance. Every donation makes a difference! 🐾❤️',
            url: window.location.origin + `/website/food-donations/donate/${params.petId}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                navigator.clipboard.writeText(shareData.url);
                toast.success('Link copied to clipboard!');
            }
        } else {
            navigator.clipboard.writeText(shareData.url);
            toast.success('Link copied to clipboard!');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-dark-main dark:via-dark-main dark:to-dark-main py-16 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center">
                    {/* Success Icon */}
                    <div className="mb-8">
                        <div className="relative inline-block">
                            <div className="w-32 h-32 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                            </div>

                        </div>
                    </div>

                    {/* Success Message */}
                    <div className="bg-white dark:bg-dark-card rounded-3xl shadow-xl border border-gray-200 dark:border-dark-divider p-12 mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Thank You!
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                            Your donation has been successfully processed. You've just made a real difference in a pet's life!
                        </p>



                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                            <button
                                onClick={handleShare}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/25"
                            >
                                <Share2 className="h-4 w-4" />
                                Share the Love
                            </button>
                            <Link
                                href="/website/pets"
                                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-dark-divider text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-card transition-colors font-medium"
                            >
                                <Heart className="h-4 w-4" />
                                Help Another Pet
                            </Link>
                        </div>

                        <div className="border-t border-gray-200 dark:border-dark-divider pt-8">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Continue exploring</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Link
                                    href="/"
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-raised rounded-xl hover:bg-gray-100 dark:hover:bg-dark-card transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Home className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        <span className="font-medium text-gray-900 dark:text-white">Back to Home</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                                </Link>
                                <Link
                                    href="/website/pets"
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-raised rounded-xl hover:bg-gray-100 dark:hover:bg-dark-card transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Heart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        <span className="font-medium text-gray-900 dark:text-white">Browse Pets</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Impact Message */}
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 text-center border border-gray-100 dark:border-dark-divider">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Impact</h3>
                        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                            Thanks to donors like you, we've provided over <span className="font-bold text-blue-600 dark:text-blue-400">45,000 PLN</span> worth of food
                            to <span className="font-bold text-blue-600 dark:text-blue-400">1,247 pets</span> in need across Poland.
                        </p>
                        <div className="flex justify-center items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">89</div>
                                <div>Partner Shelters</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,247</div>
                                <div>Pets Helped</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">45k</div>
                                <div>Food Donated</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
