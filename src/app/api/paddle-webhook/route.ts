import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 验证Paddle的签名
    // 实际生产环境下需要实现此逻辑
    // const isValid = verifyPaddleSignature(data);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
    
    // 提取必要信息
    const { alert_name, passthrough, subscription_id, status, event_time, next_bill_date, cancellation_effective_date } = data;
    
    // 解析passthrough数据
    let passthroughData;
    try {
      passthroughData = JSON.parse(passthrough);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid passthrough data' }, { status: 400 });
    }
    
    const { userId } = passthroughData;
    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }
    
    const supabase = getSupabaseClient();
    
    // 根据不同的Paddle事件类型处理
    switch (alert_name) {
      case 'subscription_created':
        // 新订阅创建
        await supabase
          .from('user_subscriptions')
          .insert({
            user_id: userId,
            subscription_id,
            status: status || 'active',
            created_at: event_time,
            next_billing_date: next_bill_date,
            paddle_data: data,
          });
        
        // 更新用户的订阅状态
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'premium',
            subscription_expiry: next_bill_date,
            updated_at: new Date(),
          })
          .eq('id', userId);
        
        break;
        
      case 'subscription_updated':
        // 订阅更新
        await supabase
          .from('user_subscriptions')
          .update({
            status: status || 'active',
            next_billing_date: next_bill_date,
            updated_at: event_time,
            paddle_data: data,
          })
          .eq('subscription_id', subscription_id);
        
        // 更新用户的订阅到期时间
        await supabase
          .from('profiles')
          .update({
            subscription_expiry: next_bill_date,
            updated_at: new Date(),
          })
          .eq('id', userId);
        
        break;
        
      case 'subscription_cancelled':
        // 订阅取消
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'cancelled',
            cancellation_date: event_time,
            end_date: cancellation_effective_date,
            updated_at: event_time,
            paddle_data: data,
          })
          .eq('subscription_id', subscription_id);
        
        // 订阅取消后，用户还可以继续使用到当前订阅期结束
        await supabase
          .from('profiles')
          .update({
            updated_at: new Date(),
          })
          .eq('id', userId);
        
        break;
        
      case 'subscription_payment_succeeded':
        // 订阅支付成功
        await supabase
          .from('user_subscriptions')
          .update({
            next_billing_date: next_bill_date,
            updated_at: event_time,
            paddle_data: data,
          })
          .eq('subscription_id', subscription_id);
        
        // 更新用户的订阅到期时间
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'premium',
            subscription_expiry: next_bill_date,
            updated_at: new Date(),
          })
          .eq('id', userId);
        
        break;
        
      case 'subscription_payment_failed':
        // 订阅支付失败
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'past_due',
            updated_at: event_time,
            paddle_data: data,
          })
          .eq('subscription_id', subscription_id);
        
        break;
        
      default:
        // 其他事件，记录但不做特殊处理
        console.log(`Unhandled Paddle webhook event: ${alert_name}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Paddle webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 实际生产环境下验证Paddle签名的函数
// function verifyPaddleSignature(data: any): boolean {
//   // 实现签名验证逻辑
//   return true;
// } 