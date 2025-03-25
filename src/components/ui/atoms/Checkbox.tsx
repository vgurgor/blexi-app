import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  description?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, description, ...props }, ref) => {
    const id = props.id || props.name;

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={id}
            type="checkbox"
            ref={ref}
            className={cn(
              'h-4 w-4 rounded border border-gray-300 dark:border-gray-700 text-primary',
              'focus:ring-primary focus:ring-offset-0 focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500',
              className
            )}
            {...props}
          />
        </div>
        <div className="ml-2 text-sm">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                'font-medium text-gray-700 dark:text-gray-300',
                props.disabled && 'opacity-70'
              )}
            >
              {label}
            </label>
          )}
          {description && !error && (
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
          )}
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };