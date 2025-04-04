import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { IMaskInput } from 'react-imask';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  description?: string;
  type?: string;
  mask?: string | RegExp;
  maskOptions?: any;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { 
      className, 
      type = 'text', 
      label, 
      error, 
      leftIcon, 
      rightIcon, 
      description, 
      mask,
      maskOptions,
      ...props 
    },
    ref
  ) => {
    const id = props.id || props.name;

    // Apply specific masks based on type
    const getMaskProps = () => {
      if (type === 'number') {
        return {
          mask: Number,
          scale: 2,
          signed: false,
          thousandsSeparator: '.',
          padFractionalZeros: false,
          normalizeZeros: true,
          radix: ',',
          mapToRadix: ['.'],
          min: props.min ? Number(props.min) : undefined,
          max: props.max ? Number(props.max) : undefined,
          ...maskOptions
        };
      }
      
      if (type === 'tel') {
        return {
          mask: '+{90} 000 000 00 00',
          ...maskOptions
        };
      }
      
      if (mask) {
        return {
          mask,
          ...maskOptions
        };
      }
      
      return null;
    };

    const maskProps = getMaskProps();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          {maskProps ? (
            <IMaskInput
              id={id}
              inputRef={ref as any}
              {...maskProps}
              {...props}
              type={type === 'number' ? 'text' : type}
              className={cn(
                'flex w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-3 text-sm',
                'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                'disabled:cursor-not-allowed disabled:opacity-50',
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                error && 'border-red-500 focus:ring-red-500',
                className
              )}
              unmask={type === 'number'}
              onAccept={(value, mask) => {
                // For number inputs, we need to convert the string value to a number
                if (type === 'number' && props.onChange) {
                  const event = {
                    target: {
                      name: props.name,
                      value: mask.unmaskedValue ? parseFloat(mask.unmaskedValue) : ''
                    }
                  } as React.ChangeEvent<HTMLInputElement>;
                  
                  props.onChange(event as any);
                }
              }}
            />
          ) : (
            <input
              id={id}
              ref={ref}
              type={type}
              className={cn(
                'flex w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-3 text-sm',
                'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                'disabled:cursor-not-allowed disabled:opacity-50',
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                error && 'border-red-500 focus:ring-red-500',
                className
              )}
              {...props}
            />
          )}
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightIcon}
            </div>
          )}
        </div>
        {description && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };