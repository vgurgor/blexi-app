import React, { ReactNode } from 'react';

interface SectionHeadingProps {
  title: string;
  icon?: ReactNode;
  className?: string;
}

export default function SectionHeading({ title, icon, className = '' }: SectionHeadingProps) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 ${className}`}>
      {icon && <div className="text-blue-500 dark:text-blue-400">{icon}</div>}
      {title}
    </h3>
  );
}