'use client';

import Image from "next/image";
import Link from "next/link";
import BrushCard from "../../components/BrushCard";
import { useEffect, useState } from "react";
import { getBrushes } from "@/lib/supabase-client";

// Define brush type interface
interface Brush {
  id: string;
  title: string;
  description: string;
  preview_image_url: string;
  categories?: { id: string; name: string; slug: string };
  is_featured: boolean;
  is_free: boolean;
  download_count: number;
  [key: string]: any; // Allow other properties
}

export default function Home() {
  const [featuredBrushes, setFeaturedBrushes] = useState<Brush[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBrushes() {
      try {
        setLoading(true);
        // Get featured brushes, first try to get brushes marked as featured
        const brushes = await getBrushes({ 
          limit: 6,  // Get more brushes in case some don't have preview images
          sortBy: 'created_at' // Sort by creation date, newest first
        });
        
        console.log('Brushes loaded from database:', brushes);
        
        // Only set if we have valid data
        if (brushes && brushes.length > 0) {
          setFeaturedBrushes(brushes as Brush[]);
        } else {
          // Set a friendly error message if no data
          setError('No brush data available at the moment');
        }
      } catch (err) {
        console.error('Failed to load brush data:', err);
        setError('Error loading data, please try again later');
      } finally {
        setLoading(false);
      }
    }

    loadBrushes();
  }, []);

  return (
    <div className="space-y-16 mt-4">
      {/* Hero section */}
      <section className="relative bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-3xl overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Unleash Your Creative Potential<br />
                <span className="text-blue-600 dark:text-blue-400">High-Quality Procreate Brushes</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Explore our carefully designed collection of Procreate brushes to enhance your digital art. From traditional media to innovative effects, all available here.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/browse" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  Browse Brushes
                </Link>
                <Link href="/plans" className="px-6 py-3 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                  View Subscription Plans
                </Link>
              </div>
            </div>
            <div className="relative h-72 sm:h-80 md:h-[400px] rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20 flex items-center justify-center">
              <div className="absolute inset-0 opacity-50 bg-pattern"></div>
              <div className="relative z-10 w-full max-w-lg px-4 py-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md p-2 md:p-3 border border-gray-100 dark:border-gray-700">
                  <Image
                    src="/images/procreate-paintbox.jpg"
                    alt="Procreate Brushes Paint Box"
                    width={600}
                    height={400}
                    className="object-contain w-full h-auto rounded-lg"
                    quality={95}
                    priority
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallbackElement = document.createElement('div');
                      fallbackElement.className = "w-full h-64 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold rounded-lg";
                      fallbackElement.innerText = "Procreate Brushes";
                      e.currentTarget.parentNode?.appendChild(fallbackElement);
                    }}
                  />
                </div>
              </div>
              <style jsx>{`
                .bg-pattern {
                  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
                }
              `}</style>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-blue-200 dark:bg-blue-800 rounded-full opacity-50"></div>
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-purple-200 dark:bg-purple-800 rounded-full opacity-50"></div>
      </section>

      {/* Featured brushes */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Brushes</h2>
          <Link href="/browse" className="text-blue-600 dark:text-blue-400 hover:underline">
            View All
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md text-yellow-800 dark:text-yellow-200">
            {error}
          </div>
        ) : featuredBrushes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBrushes.map((brush) => (
              <BrushCard key={brush.id} 
                id={brush.id}
                title={brush.title}
                description={brush.description}
                imageUrl={brush.preview_image_url || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'}
                category={brush.categories?.name || 'Uncategorized'}
                isFeatured={brush.is_featured}
                isFree={brush.is_free}
                downloadCount={brush.download_count || 0}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-300">No brush data available yet. Please add some brushes first.</p>
            <Link href="/admin/brushes/new" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md">
              Add Brush
            </Link>
          </div>
        )}
      </section>

      {/* Feature highlights */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Why Choose Our Brushes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Professional Quality</h3>
            <p className="text-gray-600 dark:text-gray-300">Carefully crafted by professional designers to ensure the highest quality drawing experience.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Diverse Selection</h3>
            <p className="text-gray-600 dark:text-gray-300">From traditional media to innovative effects, meeting various artistic creation needs.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Customizable</h3>
            <p className="text-gray-600 dark:text-gray-300">Brush parameters can be adjusted to meet your personalized creative needs.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
