'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AdvancedSearchProps {
  tags?: string[];
  compatibilityOptions?: string[];
  onFilterChange?: (filters: any) => void;
}

export default function AdvancedSearch({ 
  tags = [], 
  compatibilityOptions = ['Procreate 5+', 'Procreate 4', 'Procreate Pocket'],
  onFilterChange 
}: AdvancedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get current filter values from URL
  const currentTags = searchParams.get('tags')?.split(',') || [];
  const currentCompatibility = searchParams.get('compatibility')?.split(',') || [];
  const currentMinPrice = parseFloat(searchParams.get('minPrice') || '0');
  const currentMaxPrice = parseFloat(searchParams.get('maxPrice') || '100');
  const currentMinRating = parseInt(searchParams.get('minRating') || '0');
  
  // State for filter values
  const [selectedTags, setSelectedTags] = useState<string[]>(currentTags);
  const [selectedCompatibility, setSelectedCompatibility] = useState<string[]>(currentCompatibility);
  const [priceRange, setPriceRange] = useState<[number, number]>([currentMinPrice, currentMaxPrice]);
  const [minRating, setMinRating] = useState<number>(currentMinRating);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Apply filters to URL
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or clear parameters
    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','));
    } else {
      params.delete('tags');
    }
    
    if (selectedCompatibility.length > 0) {
      params.set('compatibility', selectedCompatibility.join(','));
    } else {
      params.delete('compatibility');
    }
    
    if (priceRange[0] > 0) {
      params.set('minPrice', priceRange[0].toString());
    } else {
      params.delete('minPrice');
    }
    
    if (priceRange[1] < 100) {
      params.set('maxPrice', priceRange[1].toString());
    } else {
      params.delete('maxPrice');
    }
    
    if (minRating > 0) {
      params.set('minRating', minRating.toString());
    } else {
      params.delete('minRating');
    }
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    // Navigate to new URL with filters
    router.push(`/browse?${params.toString()}`);
    
    // Call callback if provided
    if (onFilterChange) {
      onFilterChange({
        tags: selectedTags,
        compatibility: selectedCompatibility,
        priceRange,
        minRating
      });
    }
  };
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Toggle compatibility option
  const toggleCompatibility = (option: string) => {
    if (selectedCompatibility.includes(option)) {
      setSelectedCompatibility(selectedCompatibility.filter(c => c !== option));
    } else {
      setSelectedCompatibility([...selectedCompatibility, option]);
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedTags([]);
    setSelectedCompatibility([]);
    setPriceRange([0, 100]);
    setMinRating(0);
    
    // Remove filter parameters from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tags');
    params.delete('compatibility');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('minRating');
    params.set('page', '1');
    
    router.push(`/browse?${params.toString()}`);
  };
  
  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      selectedTags.length > 0 ||
      selectedCompatibility.length > 0 ||
      priceRange[0] > 0 ||
      priceRange[1] < 100 ||
      minRating > 0
    );
  };

  // 处理最小价格变化
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setPriceRange([value, priceRange[1]]);
  };

  // 处理最大价格变化
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setPriceRange([priceRange[0], value]);
  };
  
  useEffect(() => {
    // Apply filters on mount if there are any in the URL
    if (
      currentTags.length > 0 ||
      currentCompatibility.length > 0 ||
      currentMinPrice > 0 ||
      currentMaxPrice < 100 ||
      currentMinRating > 0
    ) {
      setIsExpanded(true);
    }
  }, []);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center"
        >
          {isExpanded ? 'Hide Filters' : 'Show Filters'}
          <svg 
            className={`ml-1 h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-6">
          {/* Tags Filter */}
          {tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Compatibility Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Compatibility</h3>
            <div className="flex flex-wrap gap-2">
              {compatibilityOptions.map(option => (
                <button
                  key={option}
                  onClick={() => toggleCompatibility(option)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    selectedCompatibility.includes(option)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* 替换价格范围滑块为HTML原生滑块 */}
          <div>
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Range</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ${priceRange[0]} - ${priceRange[1]}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 my-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min Price</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={priceRange[0]}
                  onChange={handleMinPriceChange}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max Price</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={priceRange[1]}
                  onChange={handleMaxPriceChange}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
          
          {/* Rating Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Rating</h3>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={minRating}
                onChange={(e) => setMinRating(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="ml-4 flex items-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`h-5 w-5 ${
                        star <= minRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  ({minRating}+)
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={resetFilters}
              className={`px-4 py-2 text-sm ${
                hasActiveFilters()
                  ? 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300'
                  : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
              disabled={!hasActiveFilters()}
            >
              Reset Filters
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 