import React from 'react';
import {
  useForm,
  FormProvider,
  UseFormProps,
  UseFormReturn,
  FieldValues,
  SubmitHandler,
  SubmitErrorHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { cn } from '@/utils/cn';

interface FormProps<TFormValues extends FieldValues> extends React.FormHTMLAttributes<HTMLFormElement> {
  form: UseFormReturn<TFormValues>;
  onSubmit: SubmitHandler<TFormValues>;
  onError?: SubmitErrorHandler<TFormValues>;
  children: React.ReactNode;
}

function Form<TFormValues extends FieldValues>({
  form,
  onSubmit,
  onError,
  children,
  className,
  ...props
}: FormProps<TFormValues>) {
  return (
    <FormProvider {...form}>
      <form
        className={cn('space-y-6', className)}
        onSubmit={form.handleSubmit(onSubmit, onError)}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}

interface UseZodFormProps<TFormValues extends FieldValues> extends UseFormProps<TFormValues> {
  schema: ZodSchema;
}

function useZodForm<TFormValues extends FieldValues>({
  schema,
  ...formProps
}: UseZodFormProps<TFormValues>) {
  return useForm<TFormValues>({
    ...formProps,
    resolver: zodResolver(schema),
  });
}

export { Form, useZodForm };