'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// 定义设置的类型接口
interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNav: boolean;
}

// 定义设置键的类型
type SettingKey = keyof AccessibilitySettings;

export default function AccessibilityPage() {
  const router = useRouter();
  
  // State for various accessibility settings
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(false);
  
  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('accessibility_settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings) as AccessibilitySettings;
          setHighContrast(settings.highContrast || false);
          setFontSize(settings.fontSize || 'medium');
          setReducedMotion(settings.reducedMotion || false);
          setScreenReader(settings.screenReader || false);
          setKeyboardNav(settings.keyboardNav || false);
          
          // Apply settings
          applySettings({
            highContrast: settings.highContrast || false,
            fontSize: settings.fontSize || 'medium',
            reducedMotion: settings.reducedMotion || false,
            screenReader: settings.screenReader || false,
            keyboardNav: settings.keyboardNav || false
          });
        } catch (error) {
          console.error('Error parsing saved accessibility settings:', error);
        }
      }
    }
  }, []);
  
  // Save and apply settings when changed
  const saveSettings = () => {
    const settings: AccessibilitySettings = {
      highContrast,
      fontSize,
      reducedMotion,
      screenReader,
      keyboardNav
    };
    
    localStorage.setItem('accessibility_settings', JSON.stringify(settings));
    applySettings(settings);
  };
  
  // Apply settings to the DOM
  const applySettings = (settings: AccessibilitySettings) => {
    const html = document.documentElement;
    
    // High contrast mode
    if (settings.highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }
    
    // Font size
    html.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    switch (settings.fontSize) {
      case 'small':
        html.classList.add('text-sm');
        break;
      case 'medium':
        html.classList.add('text-base');
        break;
      case 'large':
        html.classList.add('text-lg');
        break;
      case 'extra-large':
        html.classList.add('text-xl');
        break;
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      html.classList.add('reduced-motion');
    } else {
      html.classList.remove('reduced-motion');
    }
    
    // Screen reader enhancements
    if (settings.screenReader) {
      html.classList.add('sr-enhancements');
    } else {
      html.classList.remove('sr-enhancements');
    }
    
    // Keyboard navigation
    if (settings.keyboardNav) {
      html.classList.add('keyboard-nav');
    } else {
      html.classList.remove('keyboard-nav');
    }
  };
  
  // Reset all settings to default
  const resetSettings = () => {
    setHighContrast(false);
    setFontSize('medium');
    setReducedMotion(false);
    setScreenReader(false);
    setKeyboardNav(false);
    
    // Apply reset settings
    const settings: AccessibilitySettings = {
      highContrast: false,
      fontSize: 'medium',
      reducedMotion: false,
      screenReader: false,
      keyboardNav: false
    };
    
    localStorage.setItem('accessibility_settings', JSON.stringify(settings));
    applySettings(settings);
  };
  
  // Handler for settings changes
  const handleSettingChange = (setting: SettingKey, value: boolean | 'small' | 'medium' | 'large' | 'extra-large') => {
    switch (setting) {
      case 'highContrast':
        setHighContrast(value as boolean);
        break;
      case 'fontSize':
        setFontSize(value as 'small' | 'medium' | 'large' | 'extra-large');
        break;
      case 'reducedMotion':
        setReducedMotion(value as boolean);
        break;
      case 'screenReader':
        setScreenReader(value as boolean);
        break;
      case 'keyboardNav':
        setKeyboardNav(value as boolean);
        break;
    }
  };
  
  // Save settings when any setting changes
  useEffect(() => {
    saveSettings();
  }, [highContrast, fontSize, reducedMotion, screenReader, keyboardNav]);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Accessibility Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Customize your browsing experience to meet your accessibility needs.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            {/* High Contrast Mode */}
            <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">High Contrast Mode</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Enhances visual distinction between elements to improve readability.
                  </p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={highContrast}
                    onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                    <p className="text-gray-900 dark:text-white font-medium mb-1">Normal Mode</p>
                    <div className="flex space-x-2">
                      <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded">Button</span>
                      <span className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded">Button</span>
                    </div>
                  </div>
                  <div className="bg-black p-3 rounded border border-white">
                    <p className="text-white font-medium mb-1">High Contrast Mode</p>
                    <div className="flex space-x-2">
                      <span className="inline-block px-3 py-1 bg-yellow-400 text-black text-sm rounded border border-white">Button</span>
                      <span className="inline-block px-3 py-1 bg-white text-black text-sm rounded border border-white">Button</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Font Size */}
            <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Text Size</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Adjust the size of text throughout the website.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleSettingChange('fontSize', 'small')}
                  className={`px-4 py-2 rounded-md text-sm ${
                    fontSize === 'small'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Small
                </button>
                <button
                  onClick={() => handleSettingChange('fontSize', 'medium')}
                  className={`px-4 py-2 rounded-md text-sm ${
                    fontSize === 'medium'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Medium (Default)
                </button>
                <button
                  onClick={() => handleSettingChange('fontSize', 'large')}
                  className={`px-4 py-2 rounded-md text-sm ${
                    fontSize === 'large'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Large
                </button>
                <button
                  onClick={() => handleSettingChange('fontSize', 'extra-large')}
                  className={`px-4 py-2 rounded-md text-sm ${
                    fontSize === 'extra-large'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Extra Large
                </button>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white">Sample Text</p>
                <p className="text-gray-600 dark:text-gray-300 mt-2">This is how your text will appear across the website.</p>
              </div>
            </div>
            
            {/* Motion and Animation */}
            <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Reduced Motion</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Minimizes animations and transitions for users sensitive to motion.
                  </p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={reducedMotion}
                    onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            {/* Screen Reader Optimization */}
            <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Screen Reader Enhancements</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Adds additional accessibility features for screen reader users.
                  </p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={screenReader}
                    onChange={(e) => handleSettingChange('screenReader', e.target.checked)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            {/* Keyboard Navigation */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Enhanced Keyboard Navigation</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Improves focus indicators and keyboard shortcuts for navigation.
                  </p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={keyboardNav}
                    onChange={(e) => handleSettingChange('keyboardNav', e.target.checked)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            {/* Reset and Save Buttons */}
            <div className="flex justify-between pt-4">
              <button
                onClick={resetSettings}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Reset to Default
              </button>
              <button
                onClick={saveSettings}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
        
        {/* WCAG Compliance Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Our Commitment to Accessibility</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We are committed to making our website accessible to all users, including those with disabilities. Our website is designed to comply with WCAG 2.1 AA standards.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Image 
              src="https://via.placeholder.com/120x60/FFFFFF/000000?text=WCAG+2.1+AA" 
              alt="WCAG 2.1 AA Compliance Badge"
              width={120}
              height={60}
              className="rounded"
            />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              If you encounter any accessibility issues or have suggestions for improvement, please contact us through our <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact page</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 