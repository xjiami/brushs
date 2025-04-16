import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import PaddlePaymentIntegration from './PaddlePaymentIntegration';

type BillingCycle = 'monthly' | 'yearly';

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  isPopular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: '基础计划',
    description: '适合入门级用户和爱好者',
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: [
      '每月可下载5个笔刷',
      '无限浏览所有笔刷',
      '基础客户支持',
      '基础教程访问权限'
    ]
  },
  {
    id: 'pro',
    name: '专业计划',
    description: '适合专业设计师和插画师',
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: [
      '每月可下载20个笔刷',
      '无限浏览所有笔刷',
      '优先客户支持',
      '完整教程访问权限',
      '提前获取新笔刷',
      '商业用途许可'
    ],
    isPopular: true
  },
  {
    id: 'unlimited',
    name: '无限计划',
    description: '适合工作室和专业创作者',
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      '无限下载所有笔刷',
      '无限浏览所有笔刷',
      '24/7优先支持',
      'VIP教程和直播访问权限',
      '定制笔刷请求',
      '商业用途许可',
      '多人团队授权'
    ]
  }
];

const SubscriptionPlans = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const toggleBillingCycle = () => {
    setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly');
  };

  const getPrice = (plan: Plan) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getDiscount = () => {
    return billingCycle === 'yearly' ? 17 : 0;
  };

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      // 如果用户未登录，重定向到登录页面
      window.location.href = `/login?redirect=/plans&plan=${planId}&billing=${billingCycle}`;
      return;
    }

    setSelectedPlan(planId);
  };

  // 检查用户是否已经有高级订阅
  const hasActiveSubscription = profile?.subscription_status === 'premium' || profile?.subscription_status === 'active';

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex justify-center items-center space-x-3 mb-10">
        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-blue-600' : 'text-gray-500'}`}>
          月付
        </span>
        <button 
          onClick={toggleBillingCycle}
          className="relative inline-flex h-6 w-11 items-center rounded-full"
        >
          <span className="sr-only">切换计费周期</span>
          <span 
            className={`
              inline-block h-5 w-10 rounded-full transition
              ${billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'}
            `}
          />
          <span 
            className={`
              absolute inline-block h-4 w-4 rounded-full bg-white transition
              ${billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-1'}
            `}
          />
        </button>
        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-blue-600' : 'text-gray-500'}`}>
          年付
        </span>
        {getDiscount() > 0 && (
          <span className="text-xs font-medium text-green-500 ml-2 bg-green-100 px-2 py-1 rounded-full">
            节省{getDiscount()}%
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`
              relative rounded-lg border p-6 shadow-sm flex flex-col
              ${plan.isPopular ? 'border-blue-500 shadow-blue-100' : 'border-gray-200'}
            `}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                最受欢迎
              </div>
            )}
            
            <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
            
            <div className="mt-4 mb-6 flex items-baseline">
              <span className="text-3xl font-bold tracking-tight text-gray-900">¥{getPrice(plan)}</span>
              <span className="ml-1 text-sm font-medium text-gray-500">
                /{billingCycle === 'monthly' ? '月' : '年'}
              </span>
            </div>
            
            <ul className="mt-2 space-y-3 flex-grow">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 flex-shrink-0 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            {/* 如果用户已登录且选择了该计划，显示支付按钮 */}
            {user && selectedPlan === plan.id ? (
              <div className="mt-6 space-y-4">
                <PaddlePaymentIntegration 
                  planId={plan.id}
                  billingCycle={billingCycle}
                  price={getPrice(plan)}
                  planName={plan.name}
                  onSuccess={() => setSelectedPlan(null)}
                  onCancel={() => setSelectedPlan(null)}
                />
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="block w-full border border-gray-300 text-gray-700 px-4 py-2 text-center text-sm font-medium rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={hasActiveSubscription}
                className={`
                  mt-6 block w-full rounded-md px-4 py-2 text-center text-sm font-medium
                  ${hasActiveSubscription
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : plan.isPopular 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'}
                `}
              >
                {hasActiveSubscription
                  ? '已订阅高级版'
                  : `选择${plan.name}`
                }
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans; 