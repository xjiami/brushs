'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { initiateSubscription } from '@/lib/supabase-client';

declare global {
  interface Window {
    Paddle: any;
  }
}

interface PaddlePaymentProps {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  price: number;
  planName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PaddlePaymentIntegration = ({
  planId,
  billingCycle,
  price,
  planName,
  onSuccess,
  onCancel
}: PaddlePaymentProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 确保用户已登录
    if (!user) {
      router.push('/login?redirect=/plans');
      return;
    }

    // 加载Paddle脚本
    const paddleScript = document.createElement('script');
    paddleScript.src = 'https://cdn.paddle.com/paddle/paddle.js';
    paddleScript.async = true;
    
    paddleScript.onload = initializePaddle;
    paddleScript.onerror = () => setError('加载支付处理程序失败，请刷新页面重试');
    
    document.body.appendChild(paddleScript);
    
    return () => {
      document.body.removeChild(paddleScript);
    };
  }, [user, router]);

  const initializePaddle = () => {
    try {
      const vendorId = process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID;
      const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
      
      if (!vendorId) {
        throw new Error('未找到Paddle供应商ID');
      }
      
      window.Paddle.Setup({ 
        vendor: vendorId,
        environment
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error('初始化Paddle失败:', err);
      setError('初始化支付处理程序失败，请稍后再试');
      setIsLoading(false);
    }
  };
  
  const handlePayment = async () => {
    if (!user || !window.Paddle) return;
    
    try {
      // 获取Paddle结账信息
      const response = await initiateSubscription(planId, billingCycle);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // 直接使用Paddle.js打开结账弹窗
      window.Paddle.Checkout.open({
        override: response.checkoutUrl, // 使用返回的结账URL
        email: user.email,
        passthrough: JSON.stringify({
          userId: user.id,
          planId,
          billingCycle
        }),
        successCallback: (data: any) => {
          console.log('支付成功:', data);
          if (onSuccess) onSuccess();
          else router.push('/profile/subscription');
        },
        closeCallback: () => {
          console.log('结账窗口关闭');
          if (onCancel) onCancel();
        }
      });
    } catch (err) {
      console.error('启动支付失败:', err);
      setError('启动支付处理失败，请稍后再试');
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className={`w-full py-3 px-4 rounded-lg text-center text-white font-medium ${
        isLoading
          ? 'bg-blue-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700'
      }`}
    >
      {isLoading ? '加载中...' : `订阅 ${planName} (¥${price.toFixed(2)}/${billingCycle === 'monthly' ? '月' : '年'})`}
    </button>
  );
};

export default PaddlePaymentIntegration; 