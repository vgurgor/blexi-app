import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  color?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  fullScreen = false,
  color = 'border-blue-500'
}: LoadingSpinnerProps) {
  
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
  };
  
  const spinnerElement = (
    <div 
      className={`${sizeClasses[size]} ${color} border-t-transparent rounded-full animate-spin`}
    ></div>
  );
  
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinnerElement}
      </div>
    );
  }
  
  return (
    <div className="flex justify-center py-8">
      {spinnerElement}
    </div>
  );
}