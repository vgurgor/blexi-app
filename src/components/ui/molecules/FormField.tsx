import React from 'react';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  useFormContext,
} from 'react-hook-form';
import { Input, InputProps } from '../atoms/Input';
import { Select, SelectProps } from '../atoms/Select';
import { TextArea, TextAreaProps } from '../atoms/TextArea';
import { Checkbox, CheckboxProps } from '../atoms/Checkbox';

/**
 * Generic form field component using react-hook-form
 */
export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<ControllerProps<TFieldValues, TName>, 'render'> {
  label?: string;
  description?: string;
}

/**
 * Input field component using react-hook-form
 */
export type FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = FormFieldProps<TFieldValues, TName> & Omit<InputProps, 'name'>;

export function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ 
  control,
  name,
  label,
  description,
  defaultValue,
  rules,
  shouldUnregister,
  ...props
}: FormInputProps<TFieldValues, TName>) {
  const { control: formControl } = useFormContext() || { control: undefined };
  const controlToUse = control || formControl;

  if (!controlToUse) {
    throw new Error(
      'FormInput must be used within a FormProvider or be passed a control prop'
    );
  }

  return (
    <Controller
      control={controlToUse}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState }) => (
        <Input
          {...field}
          label={label}
          description={description}
          error={fieldState.error?.message}
          {...props}
        />
      )}
    />
  );
}

/**
 * Select field component using react-hook-form
 */
export type FormSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = FormFieldProps<TFieldValues, TName> & Omit<SelectProps, 'name'>;

export function FormSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  defaultValue,
  rules,
  shouldUnregister,
  options,
  ...props
}: FormSelectProps<TFieldValues, TName>) {
  const { control: formControl } = useFormContext() || { control: undefined };
  const controlToUse = control || formControl;

  if (!controlToUse) {
    throw new Error(
      'FormSelect must be used within a FormProvider or be passed a control prop'
    );
  }

  return (
    <Controller
      control={controlToUse}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState }) => (
        <Select
          {...field}
          options={options}
          label={label}
          description={description}
          error={fieldState.error?.message}
          {...props}
        />
      )}
    />
  );
}

/**
 * TextArea field component using react-hook-form
 */
export type FormTextAreaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = FormFieldProps<TFieldValues, TName> & Omit<TextAreaProps, 'name'>;

export function FormTextArea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  defaultValue,
  rules,
  shouldUnregister,
  ...props
}: FormTextAreaProps<TFieldValues, TName>) {
  const { control: formControl } = useFormContext() || { control: undefined };
  const controlToUse = control || formControl;

  if (!controlToUse) {
    throw new Error(
      'FormTextArea must be used within a FormProvider or be passed a control prop'
    );
  }

  return (
    <Controller
      control={controlToUse}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState }) => (
        <TextArea
          {...field}
          label={label}
          description={description}
          error={fieldState.error?.message}
          {...props}
        />
      )}
    />
  );
}

/**
 * Checkbox field component using react-hook-form
 */
export type FormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = FormFieldProps<TFieldValues, TName> & Omit<CheckboxProps, 'name'>;

export function FormCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  defaultValue,
  rules,
  shouldUnregister,
  ...props
}: FormCheckboxProps<TFieldValues, TName>) {
  const { control: formControl } = useFormContext() || { control: undefined };
  const controlToUse = control || formControl;

  if (!controlToUse) {
    throw new Error(
      'FormCheckbox must be used within a FormProvider or be passed a control prop'
    );
  }

  return (
    <Controller
      control={controlToUse}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState }) => (
        <Checkbox
          {...field}
          checked={field.value}
          label={label}
          description={description}
          error={fieldState.error?.message}
          {...props}
        />
      )}
    />
  );
}