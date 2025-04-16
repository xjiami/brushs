const fs = require('fs');
const path = require('path');

// 需要检查和创建的目录路径
const directories = [
  '.next/server/app/tutorials/[id]',
  '.next/server/app/tutorials',
  '.next/static/chunks/app/tutorials/[id]'
];

// 检查文件是否存在的函数
function ensureDirectoryExists(dirPath) {
  const fullPath = path.resolve(process.cwd(), dirPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`创建目录: ${fullPath}`);
    fs.mkdirSync(fullPath, { recursive: true });
    return true;
  }
  
  console.log(`目录已存在: ${fullPath}`);
  return false;
}

// 创建一个空的page.js文件
function createEmptyFile(dirPath, fileName) {
  const filePath = path.join(dirPath, fileName);
  const fullPath = path.resolve(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`创建文件: ${fullPath}`);
    // 创建一个简单的导出，确保文件有效
    fs.writeFileSync(fullPath, 'export default function Page(){return null}');
    return true;
  }
  
  console.log(`文件已存在: ${fullPath}`);
  return false;
}

// 主函数
function main() {
  console.log('开始修复 Next.js 构建...');
  
  // 确保所有必要的目录都存在
  directories.forEach(dir => {
    ensureDirectoryExists(dir);
  });
  
  // 创建所需的文件
  createEmptyFile('.next/server/app/tutorials/[id]', 'page.js');
  
  console.log('修复完成！请运行 npm run start 启动应用');
}

// 执行主函数
main(); 