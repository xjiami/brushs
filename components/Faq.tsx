'use client';

import { useState } from 'react';
import { Button } from './Button';

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  title?: string;
  description?: string;
  items: FaqItem[];
  showContactSupport?: boolean;
}

// 单个FAQ项目组件
const FaqItemComponent = ({ question, answer }: FaqItem) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        className="flex justify-between items-center w-full py-4 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{question}</h3>
        <svg
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="pb-4 text-gray-600 dark:text-gray-300">{answer}</p>
      </div>
    </div>
  );
};

// FAQ部分组件
export const FaqSection = ({
  title = 'Frequently Asked Questions',
  description = 'Find answers to common questions about our subscription plans and services.',
  items,
  showContactSupport = true,
}: FaqSectionProps) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 md:p-10 shadow-md max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h2>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <FaqItemComponent key={index} question={item.question} answer={item.answer} />
        ))}
      </div>
      
      {showContactSupport && (
        <div className="mt-10 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Still have questions? We're here to help.
          </p>
          <Button 
            variant="gradient" 
            size="lg"
            rounded="full"
            shadow="lg"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          >
            Contact Support
          </Button>
        </div>
      )}
    </div>
  );
};

// 默认导出的FAQ数据，方便其他页面使用
export const defaultFaqItems: FaqItem[] = [
  {
    question: "How do I download brushes after subscribing?",
    answer: "After successfully subscribing, you can immediately access all paid brush resources. Click the download button on the brush detail page to get the brush file."
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer: "Yes, you can cancel your subscription at any time in your account settings. After cancellation, you can continue using the service until the end of your current billing period."
  },
  {
    question: "Are the brushes compatible with the latest version of Procreate?",
    answer: "Yes, all our brushes are tested to ensure full compatibility with the latest version of Procreate."
  },
  {
    question: "How do I get technical support?",
    answer: "Pro plan subscribers can receive priority technical support via email or online customer service. Free plan users can seek help in the community forum."
  },
  {
    question: "Can I use the brushes in commercial projects?",
    answer: "Yes, all brushes downloaded with a Pro subscription include a commercial use license. Free brushes may have different licensing terms, which are specified on each brush's detail page."
  },
  {
    question: "How do I import brushes into Procreate?",
    answer: "After downloading a brush file, open Procreate on your device, tap on the 'Brushes' menu, then tap the '+' button and select 'Import'. Navigate to your downloaded brush file and select it to import."
  }
];

export default FaqSection; 