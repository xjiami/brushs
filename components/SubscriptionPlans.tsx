'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const SubscriptionPlans = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for beginners',
      price: { monthly: 0, yearly: 0 },
      features: ['Access to free brushes', 'Browse all brush previews', 'Community discussions', 'Limited downloads'],
      buttonText: 'Current Plan',
      isPopular: false,
      disabled: true,
    },
    {
      name: 'Pro',
      description: 'For professional creators',
      price: { monthly: 9.99, yearly: 99.99 },
      features: [
        'Unlimited brush downloads',
        'Priority access to new resources',
        'Premium support',
        'High-resolution brushes',
        'Exclusive tutorials',
      ],
      buttonText: 'Subscribe',
      isPopular: true,
      disabled: false,
    },
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:flex-col sm:align-center">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center">
          Subscription Plans
        </h2>
        <p className="mt-5 text-xl text-gray-500 dark:text-gray-400 text-center">
          Choose a plan that fits your needs. Upgrade or downgrade anytime.
        </p>
        
        {/* Billing period toggle - 改进设计 */}
        <div className="relative self-center mt-8 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 flex shadow-inner">
          <button
            type="button"
            onClick={() => setBillingPeriod('monthly')}
            className={`relative py-2.5 px-8 text-sm font-medium whitespace-nowrap focus:outline-none transition-all duration-200 rounded-lg ${
              billingPeriod === 'monthly'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            aria-pressed={billingPeriod === 'monthly'}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingPeriod('yearly')}
            className={`relative py-2.5 px-8 ml-0.5 text-sm font-medium whitespace-nowrap focus:outline-none transition-all duration-200 rounded-lg ${
              billingPeriod === 'yearly'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            aria-pressed={billingPeriod === 'yearly'}
          >
            Yearly
            <span className="absolute -top-3 -right-3 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 shadow-sm">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className="mt-16 grid gap-10 md:grid-cols-2 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            whileHover={{ y: -8, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
            transition={{ duration: 0.2 }}
            className={`rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg ${
              plan.isPopular ? 'ring-4 ring-blue-500 dark:ring-blue-400' : ''
            }`}
          >
            {plan.isPopular && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2.5 font-medium text-sm">
                Most Popular
              </div>
            )}
            <div className="px-8 py-10">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">{plan.description}</p>
              <div className="mt-8 flex items-baseline">
                <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                  ${plan.price[billingPeriod].toFixed(2)}
                </span>
                <span className="ml-2 text-base font-medium text-gray-500 dark:text-gray-400">
                  {billingPeriod === 'monthly' ? '/month' : '/year'}
                </span>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700 dark:text-gray-300">{feature}</p>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={!plan.disabled ? { scale: 1.03 } : {}}
                whileTap={!plan.disabled ? { scale: 0.98 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                disabled={plan.disabled}
                className={`mt-10 w-full rounded-xl py-4 px-6 text-white font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                  plan.disabled
                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500'
                }`}
              >
                {plan.buttonText}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans; 