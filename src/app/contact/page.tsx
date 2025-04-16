'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

// 定义表单数据类型
interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// 定义错误类型
interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  [key: string]: string | undefined;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // 清除相应的错误
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入您的姓名';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '请输入您的电子邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的电子邮箱地址';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = '请输入主题';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = '请输入您的留言';
    } else if (formData.message.length < 10) {
      newErrors.message = '留言内容至少需要10个字符';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // 模拟API调用（此处应替换为实际的API调用）
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 设置提交成功状态
      setSubmitSuccess(true);
      
      // 重置表单
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // 3秒后重置成功状态
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error('提交表单出错:', error);
      setSubmitError('提交表单时出错，请稍后再试。');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">联系我们</h1>
        <p className="text-gray-600 dark:text-gray-300">
          如果您有任何问题、建议或合作意向，请随时通过以下方式与我们联系。我们会尽快回复您。
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">联系方式</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  客户支持
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  support@procreatebrush-example.com
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  工作时间: 周一至周五 9:00-18:00
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  商务合作
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  business@procreatebrush-example.com
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  社交媒体
                </h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-blue-500">
                    <span className="sr-only">微博</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.173 9.887c-.077-.53-.428-.872-.938-.909-.49-.036-.927.247-1.087.702-.16.454-.077.945.24 1.24.318.295.774.436 1.156.318.49-.155.85-.604.9-1.115.05-.51-.092-.994-.271-1.236zm-9.11 7.873c-.926.366-2.053.182-2.62-.565-.579-.747-.366-1.73.474-2.286.84-.556 1.995-.592 2.763.046.742.637.788 1.828-.618 2.805zm1.854-5.223c-.225-.061-.518-.03-.706.159-.188.19-.216.457-.177.671.037.215.196.385.429.431.232.043.495-.053.637-.244.142-.19.131-.478 0-.685-.136-.208-.342-.268-.183-.332zm2.363-2.781c-2.957-.8-6.036.328-7.278 2.678-1.244 2.35-.048 4.96 2.879 5.817 3.064.876 6.66-.485 7.837-3.026 1.14-2.465-.433-4.683-3.448-5.469h.01zm8.86-3.344c-.79-3.307-3.617-5.55-6.796-6.079-3.327-.557-6.79.402-9.24 2.861-2.453 2.456-3.418 5.863-2.835 9.112.583 3.249 2.86 6.03 6.215 6.804 3.465.784 7.034-.348 9.486-2.997 2.534-2.648 3.957-6.395 3.17-9.701zm1.852-2.982c-1.762-7.149-8.63-11.727-15.552-10.765-6.915.962-11.856 7.119-11.04 14.103.816 6.984 7.116 12.243 14.08 11.574 7.304-.686 13.27-6.456 13.25-13.554.005-2.811-1.332-5.18-.733-1.358h-.005z" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-blue-500">
                    <span className="sr-only">微信</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.328.328 0 0 0 .166-.054l1.89-1.106a.804.804 0 0 1 .376-.099.781.781 0 0 1 .213.03c.996.279 2.088.434 3.227.434 .293 0 .585-.012.872-.037C9.18 15.123 8.93 13.318 8.93 11.42c0-4.458 4.297-8.088 9.598-8.088 .2 0 .399.008.596.022-1.23-3.375-5.087-5.166-10.434-5.166M5.805 7.12a1.057 1.057 0 1 1 0-2.115 1.057 1.057 0 0 1 0 2.115m7.005 0a1.057 1.057 0 1 1 0-2.115 1.057 1.057 0 0 1 0 2.115m6.577 4.293c0-3.356-3.22-6.103-7.182-6.103s-7.182 2.747-7.182 6.103c0 3.356 3.22 6.103 7.182 6.103.842 0 1.652-.123 2.417-.354a.55.55 0 0 1 .157-.023c.055 0 .11.011.16.032l1.416.87a.243.243 0 0 0 .122.033.218.218 0 0 0 .21-.218c0-.055-.016-.104-.035-.15l-.292-1.103a.441.441 0 0 1 .159-.493c1.378-1.005 2.195-2.505 2.195-4.191m-9.606-1.807a.791.791 0 1 1 0-1.582.791.791 0 0 1 0 1.582m4.86 0a.791.791 0 1 1 0-1.582.791.791 0 0 1 0 1.582" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-blue-500">
                    <span className="sr-only">知乎</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="m5.721 0 2.546 6.46h-4.703s-.97-2.106-.199-3.18c.552-.611 2.356-3.28 2.356-3.28zm5.368 3.32 4.717-.02-.161 1.353h-2.608c-.002 0 .37.641.803 1.824h1.729l-.12 1.25h-1.77c.002 0 1.07 3.386 1.07 3.386h-2.2c-.002 0 .953-3.386.953-3.386h-3.582s-1.7 4.693-1.982 5.143c-.52.57-1.21.961-2.121.781-.912-.18-1.322-.893-1.321-1.251 0-.36.452-.87 1.19-1.001.697-.118 1.856.25 1.856.25s1.528-4.221 1.764-4.922c.17-.52 0 0 0 0h-5.578l.156-1.353h5.199s-.47-1.482-.916-2.261c-.446-.78-.973-1.353-1.675-1.203-.7.151-1.094.88-1.094.88l-1.032-.88s.52-1.051 1.649-1.505c1.129-.453 2.152-.213 3.573.932.88.675 2.294 2.203 2.294 2.203zm12.669 4.779c.19 1.396-.707 2.67-2.022 2.847-1.315.178-2.535-.81-2.726-2.206-.19-1.396.707-2.67 2.022-2.847 1.315-.178 2.536.81 2.726 2.205zm-2.658 4.457c-2.294.178-4.586-.742-5.917-2.255-.154.476-4.147 6.215-4.147 6.215h-2.546s2.853-4.055 4.254-6.215c-1.325-.696-2.235-1.822-2.518-3.19l2.448.02s.124.771.519 1.408c0 0 .837-2.026 1.26-3.815.424-1.79.745-3.119.745-3.119l2.023.006s-.278 1.104-.63 2.396c0 0 2.643-2.753 5.018-4.251 2.374-1.498 3.426-1.312 3.426-1.312l-1.499 1.975s-1.833-.025-3.426.793c-1.594.819-3.148 2.307-3.148 2.307s2.384-.268 5.018.82c2.633 1.086 3.407 2.106 3.407 2.106s-.635 1.353-1.889 1.353c0 0-1.086-.849-3.21-1.233-2.127-.386-4.524.291-4.524.291s-.076 2.493 2.517 3.794c2.592 1.3 5.47.49 5.47.49l-.651 2.416z" />
                    </svg>
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  总部地址
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  上海市浦东新区张江高科技园区
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">发送消息</h2>
            
            {submitSuccess ? (
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md text-green-800 dark:text-green-200 mb-6">
                <div className="flex">
                  <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p>您的消息已成功发送！我们会尽快回复您。</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {submitError && (
                  <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-800 dark:text-red-200">
                    {submitError}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      姓名
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full rounded-md px-4 py-2 border ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      电子邮箱
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full rounded-md px-4 py-2 border ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    主题
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`block w-full rounded-md px-4 py-2 border ${errors.subject ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    留言内容
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className={`block w-full rounded-md px-4 py-2 border ${errors.message ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>
                  )}
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        提交中...
                      </>
                    ) : '发送消息'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 