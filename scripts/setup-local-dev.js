#!/usr/bin/env node

/**
 * 本地开发环境设置脚本
 * 用于引导用户快速设置本地开发环境
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');
const chalk = require('chalk'); // 注意：可能需要先安装chalk

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI颜色代码（如果没有chalk）
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// 打印彩色文本
function colorLog(color, text) {
  if (typeof chalk !== 'undefined') {
    console.log(chalk[color](text));
  } else {
    console.log(colors[color] + text + colors.reset);
  }
}

// 执行命令
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// 检查文件是否存在
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// 主函数
async function main() {
  try {
    console.log('\n' + '='.repeat(60));
    colorLog('cyan', '欢迎使用 Procreate 笔刷资源网站 本地开发环境设置向导');
    console.log('='.repeat(60) + '\n');

    colorLog('green', '步骤 1: 检查环境依赖');
    try {
      const nodeVersion = await executeCommand('node --version');
      colorLog('green', `✓ Node.js 版本: ${nodeVersion}`);
    } catch (error) {
      colorLog('red', '✗ 未检测到 Node.js，请安装 Node.js v16 或更高版本');
      process.exit(1);
    }

    try {
      const npmVersion = await executeCommand('npm --version');
      colorLog('green', `✓ npm 版本: ${npmVersion}`);
    } catch (error) {
      colorLog('red', '✗ 未检测到 npm，请安装 npm');
      process.exit(1);
    }

    colorLog('green', '\n步骤 2: 检查项目依赖');
    if (!fileExists(path.join(__dirname, '..', 'node_modules'))) {
      colorLog('yellow', '! 未找到 node_modules 目录，正在安装依赖...');
      try {
        await executeCommand('cd ' + path.join(__dirname, '..') + ' && npm install');
        colorLog('green', '✓ 依赖安装完成');
      } catch (error) {
        colorLog('red', `✗ 依赖安装失败: ${error.message}`);
        colorLog('yellow', '请尝试手动运行 npm install');
      }
    } else {
      colorLog('green', '✓ 已安装项目依赖');
    }

    colorLog('green', '\n步骤 3: 检查环境变量配置');
    const envPath = path.join(__dirname, '..', '.env.local');
    if (!fileExists(envPath)) {
      colorLog('yellow', '! 未找到 .env.local 文件，正在创建...');
      
      let supabaseUrl = '';
      let supabaseKey = '';
      
      await new Promise(resolve => {
        rl.question('请输入您的 Supabase URL: ', (answer) => {
          supabaseUrl = answer;
          resolve();
        });
      });
      
      await new Promise(resolve => {
        rl.question('请输入您的 Supabase Anon Key: ', (answer) => {
          supabaseKey = answer;
          resolve();
        });
      });
      
      const envContent = `# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}

# Paddle支付系统配置（本地测试可忽略）
NEXT_PUBLIC_PADDLE_VENDOR_ID=your-paddle-vendor-id
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
`;
      
      fs.writeFileSync(envPath, envContent);
      colorLog('green', '✓ 已创建 .env.local 文件');
    } else {
      colorLog('green', '✓ 已存在 .env.local 文件');
    }

    colorLog('green', '\n步骤 4: 设置数据库');
    colorLog('yellow', '请确保您已按照以下步骤设置 Supabase 数据库:');
    colorLog('yellow', '1. 登录 Supabase 并创建一个新项目');
    colorLog('yellow', '2. 在 SQL 编辑器中运行 scripts/init-database.sql 文件中的脚本');
    colorLog('yellow', '3. 设置存储桶: brush-previews, brush-files, brush-gallery');
    
    await new Promise(resolve => {
      rl.question('您是否已完成上述 Supabase 设置? (y/n): ', (answer) => {
        if (answer.toLowerCase() !== 'y') {
          colorLog('yellow', '请完成 Supabase 设置后再继续');
        } else {
          colorLog('green', '✓ Supabase 设置已确认');
        }
        resolve();
      });
    });

    colorLog('green', '\n步骤 5: 启动开发服务器');
    colorLog('yellow', '您可以使用以下命令启动开发服务器:');
    colorLog('cyan', '  npm run dev');
    colorLog('yellow', '\n首次使用时，请按照以下步骤操作:');
    colorLog('yellow', '1. 注册一个管理员账户');
    colorLog('yellow', '2. 在 Supabase SQL 编辑器中将该用户设置为管理员');
    colorLog('yellow', '3. 运行 node scripts/generate-test-data.js 生成测试数据');
    
    colorLog('green', '\n设置向导完成！');
    colorLog('cyan', '请参阅 LOCAL-TESTING.md 文件获取更多详细信息和测试说明。');
    
  } catch (error) {
    colorLog('red', `设置过程中出现错误: ${error.message}`);
  } finally {
    rl.close();
  }
}

main(); 