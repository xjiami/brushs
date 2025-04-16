/**
 * 创建一个管理员账号的脚本
 * 用法: node scripts/create-admin.js
 */

require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

// 设置默认管理员信息
const DEFAULT_ADMIN = {
  email: 'xjiami2@gmail.com',
  password: '3122365',
  username: '管理员'
};

async function createAdmin() {
  console.log('准备创建管理员账号...');
  
  // 从环境变量中获取Supabase配置
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('错误: 缺少Supabase环境变量，请确保.env.local文件存在并包含正确的配置。');
    return;
  }
  
  // 创建Supabase客户端
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // 1. 使用邮箱和密码创建用户
    console.log(`正在创建用户: ${DEFAULT_ADMIN.email}...`);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password,
      options: {
        data: {
          username: DEFAULT_ADMIN.username,
        },
        skipEmailConfirmation: true
      }
    });
    
    if (authError) {
      console.error('创建用户失败:', authError.message);
      return;
    }
    
    if (!authData.user) {
      console.error('创建用户后无法获取用户数据');
      return;
    }
    
    const userId = authData.user.id;
    console.log(`用户创建成功，ID: ${userId}`);
    
    // 2. 创建用户配置文件
    console.log('正在创建用户资料...');
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: userId, 
          username: DEFAULT_ADMIN.username,
          subscription_status: 'premium',
          is_admin: true,
          created_at: new Date()
        }
      ]);
    
    if (profileError) {
      console.error('创建用户资料失败:', profileError.message);
      return;
    }
    
    // 3. 确认用户电子邮件
    console.log('正在确认用户电子邮件...');
    
    // 使用服务角色确认用户电子邮件
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      console.warn('警告: 未找到服务角色密钥，无法自动确认电子邮件。');
      console.warn('您可能需要手动登录Supabase并确认此用户的电子邮件。');
    } else {
      const adminAuthClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      const { error: confirmError } = await adminAuthClient.auth.admin.updateUserById(
        userId,
        { email_confirm: true }
      );
      
      if (confirmError) {
        console.error('确认电子邮件失败:', confirmError.message);
        console.warn('您可能需要手动登录Supabase并确认此用户的电子邮件。');
      } else {
        console.log('电子邮件已成功确认');
      }
    }
    
    console.log('\n✅ 管理员账号创建成功!');
    console.log('-------------------------------');
    console.log('邮箱:', DEFAULT_ADMIN.email);
    console.log('密码:', DEFAULT_ADMIN.password);
    console.log('用户名:', DEFAULT_ADMIN.username);
    console.log('-------------------------------');
    console.log('您现在可以使用上述信息登录应用程序。');
    
  } catch (error) {
    console.error('创建管理员账号时出错:', error.message);
  }
}

// 执行主函数
createAdmin().catch(console.error); 