'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'destructive' 
  | 'success'
  | 'gradient';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      rounded = 'lg',
      shadow = 'md',
      children,
      leftIcon,
      rightIcon,
      isLoading,
      loadingText,
      disabled,
      ...props
    },
    ref
  ) => {
    // 变体样式
    const variantStyles = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500",
      outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-gray-500",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-gray-500",
      destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500",
      success: "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-500",
      gradient: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500",
    };

    // 尺寸样式
    const sizeStyles = {
      xs: "text-xs px-2.5 py-1.5",
      sm: "text-sm px-3 py-2",
      md: "text-sm px-4 py-2.5",
      lg: "text-base px-5 py-3",
      xl: "text-lg px-6 py-3.5",
    };

    // 圆角样式
    const roundedStyles = {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
    };

    // 阴影样式
    const shadowStyles = {
      none: "",
      sm: "shadow-sm",
      md: "shadow",
      lg: "shadow-lg",
    };

    // 组合所有样式
    const buttonClass = `
      inline-flex items-center justify-center whitespace-nowrap font-medium 
      transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 
      disabled:pointer-events-none disabled:opacity-70
      ${variantStyles[variant]} 
      ${sizeStyles[size]} 
      ${fullWidth ? 'w-full' : ''} 
      ${roundedStyles[rounded]} 
      ${shadowStyles[shadow]}
      hover:scale-[1.02] active:scale-[0.98] 
      ${className}
    `;

    return (
      <button
        className={buttonClass}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className={`animate-spin -ml-1 mr-2 h-4 w-4 ${
              variant === 'outline' || variant === 'ghost'
                ? 'text-gray-700 dark:text-gray-300'
                : 'text-white'
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {isLoading && loadingText ? loadingText : children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button }; 