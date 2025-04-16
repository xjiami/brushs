'use client';

import './globals.css';
import dynamic from 'next/dynamic';
import { useEffect } from "react";

// 动态导入组件
const TopNav = dynamic(
  () => import('../../components/TopNav'),
  { ssr: false }
);

const Sidebar = dynamic(
  () => import('../../components/Sidebar'),
  { ssr: false }
);

// 动态导入上下文提供者
const SupabaseProvider = dynamic(
  () => import('@context/SupabaseContext').then((mod) => mod.SupabaseProvider),
  { ssr: false }
);

const AuthProvider = dynamic(
  () => import('@/contexts/AuthContext').then((mod) => mod.AuthProvider),
  { ssr: false }
);

// Font configuration
const fontSans = {
  fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
  fontStyle: 'normal',
  fontWeight: '400',
  fontDisplay: 'optional',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Prevent zoom on mobile
  useEffect(() => {
    // Check if metaViewport exists
    let metaViewport = document.querySelector('meta[name="viewport"]');
    
    // If it doesn't exist, create it
    if (!metaViewport) {
      metaViewport = document.createElement('meta');
      metaViewport.setAttribute('name', 'viewport');
      document.head.appendChild(metaViewport);
    }
    
    // Set the content attribute
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover');
    }
    
    // 预加载背景图片
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = '/images/procreate-background.jpg';
    preloadLink.type = 'image/jpeg';
    document.head.appendChild(preloadLink);
    
    return () => {
      // 清理函数
      if (document.head.contains(preloadLink)) {
        document.head.removeChild(preloadLink);
      }
    };
  }, []);

  return (
    <html lang="en" className="h-full" translate="no">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <meta name="google" content="notranslate" />
        
        {/* 预加载背景图片 */}
        <link 
          rel="preload" 
          as="image" 
          href="/images/procreate-background.jpg" 
          type="image/jpeg" 
        />
      </head>
      <body className={`${fontSans.fontFamily} bg-gray-50 dark:bg-gray-900 min-h-screen antialiased`}>
        <SupabaseProvider>
          <AuthProvider>
            <TopNav />
            <div className="flex h-full pt-24">
              <Sidebar />
              <div className="w-full md:ml-64 transition-all duration-300">
                <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
                  {children}
                </main>
                
                {/* Footer */}
                <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
                  <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Procreate Brushes</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          High-quality Procreate brush resources to enhance your digital art creation.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Browse</h3>
                        <ul className="space-y-2">
                          <li>
                            <a href="/browse" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                              All Brushes
                            </a>
                          </li>
                          <li>
                            <a href="/categories" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                              Categories
                            </a>
                          </li>
                          <li>
                            <a href="/plans" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                              Subscription Plans
                            </a>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">About</h3>
                        <ul className="space-y-2">
                          <li>
                            <a href="/about" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                              About Us
                            </a>
                          </li>
                          <li>
                            <a href="/contact" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                              Contact Us
                            </a>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Legal</h3>
                        <ul className="space-y-2">
                          <li>
                            <a href="/privacy" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                              Privacy Policy
                            </a>
                          </li>
                          <li>
                            <a href="/terms" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                              Terms of Service
                            </a>
                          </li>
                          <li>
                            <a href="/refund" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                              Refund Policy
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        &copy; {new Date().getFullYear()} Procreate Brush Website. All rights reserved.
                      </p>
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
