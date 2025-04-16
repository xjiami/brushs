/**
 * 执行SQL迁移脚本
 * 用法: node scripts/execute-migration.js
 */

require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function executeMigration() {
  console.log('准备执行数据库迁移...');
  
  // 从环境变量中获取Supabase配置
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('错误: 缺少Supabase环境变量，请确保.env.local文件存在并包含正确的配置。');
    return;
  }
  
  // 创建Supabase客户端，优先使用服务角色密钥
  const supabase = createClient(
    supabaseUrl, 
    supabaseServiceKey || supabaseAnonKey
  );
  
  try {
    // 读取迁移脚本
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'add_image_url_to_categories.sql'),
      'utf8'
    );
    
    console.log('执行以下SQL:');
    console.log(migrationSQL);
    
    // 执行SQL
    const { error } = await supabase.rpc('pgfunction', {
      query: migrationSQL
    });
    
    if (error) {
      console.error('执行迁移脚本失败:', error.message);
      
      // 如果rpc不可用，尝试直接通过REST API执行
      console.log('尝试通过SQL API执行...');
      const { error: sqlError } = await supabase.sql(migrationSQL);
      
      if (sqlError) {
        console.error('SQL API执行也失败:', sqlError.message);
        console.error('请尝试直接在Supabase Studio的SQL编辑器中执行迁移脚本');
        console.error('或使用服务角色密钥进行身份验证');
        return;
      }
    }
    
    console.log('数据库迁移执行成功！');
    
  } catch (error) {
    console.error('执行迁移脚本时出错:', error.message);
  }
}

// 执行主函数
executeMigration().catch(console.error); 