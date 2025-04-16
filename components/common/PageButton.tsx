'use client';

import React from 'react';
import Link from 'next/link';

type PageButtonVariant = 'filled' | 'outline' | 'ghost';

interface PageButtonProps {
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: PageButtonVariant;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 导航按钮组件，可用于分页、导航等场景
 */
export const PageButton = ({
  href,
  onClick,
  disabled = false,
  active = false,
  children,
  className = '',
  variant = 'filled',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  size = 'md',
}: PageButtonProps) => {
  // 尺寸样式
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  // 变体样式
  const variantClasses = {
    filled: active
      ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700',
    outline: active
      ? 'border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
      : 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800',
    ghost: active
      ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
  };

  const buttonClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg transition-colors
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
    ${className}
  `;

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={buttonClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={buttonClasses}>
      {content}
    </button>
  );
};

/**
 * 分页按钮组，用于展示分页导航
 */
export const PaginationGroup = ({
  currentPage,
  totalPages,
  basePath,
  queryParams = {},
  size = 'md',
  variant = 'filled',
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  queryParams?: Record<string, string>;
  size?: 'sm' | 'md' | 'lg';
  variant?: PageButtonVariant;
}) => {
  // 构建查询字符串
  const buildQueryString = (page: number) => {
    const params = new URLSearchParams({ ...queryParams, page: page.toString() });
    return params.toString();
  };

  // 构建分页URL
  const buildPageUrl = (page: number) => {
    const queryString = buildQueryString(page);
    return `${basePath}?${queryString}`;
  };

  // 计算要显示的页码范围
  const getPageRange = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // 如果总页数小于等于maxPagesToShow，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // 总是显示第一页
      pageNumbers.push(1);

      // 计算范围
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // 确保我们展示5个页码（包括第一页和最后一页）
      if (startPage === 2) {
        endPage = Math.min(totalPages - 1, 4);
      }
      if (endPage === totalPages - 1) {
        startPage = Math.max(2, totalPages - 3);
      }

      // 添加省略号
      if (startPage > 2) {
        pageNumbers.push('...');
      }

      // 添加中间的页码
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // 添加省略号
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }

      // 总是显示最后一页
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageRange = getPageRange();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <PageButton
        href={currentPage > 1 ? buildPageUrl(currentPage - 1) : undefined}
        disabled={currentPage <= 1}
        variant={variant}
        size={size}
        icon={
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        }
        aria-label="Previous page"
      >
        Previous
      </PageButton>

      <div className="flex flex-wrap gap-1">
        {pageRange.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-500">
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          return (
            <PageButton
              key={pageNumber}
              href={currentPage !== pageNumber ? buildPageUrl(pageNumber) : undefined}
              active={currentPage === pageNumber}
              variant={variant}
              size={size}
            >
              {pageNumber}
            </PageButton>
          );
        })}
      </div>

      <PageButton
        href={currentPage < totalPages ? buildPageUrl(currentPage + 1) : undefined}
        disabled={currentPage >= totalPages}
        variant={variant}
        size={size}
        icon={
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        }
        iconPosition="right"
        aria-label="Next page"
      >
        Next
      </PageButton>
    </div>
  );
}; 