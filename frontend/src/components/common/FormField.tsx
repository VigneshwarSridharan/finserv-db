import { Field as ChakraField } from '../ui/field';
import { Input, Textarea } from '@chakra-ui/react';
import { forwardRef } from 'react';
import Select from './Select';
import type { SelectOption, SelectProps } from './Select';

interface BaseFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

interface InputFieldProps extends BaseFieldProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'ref'> {
  // All HTML input attributes are now supported
}

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

interface SelectFieldProps extends BaseFieldProps {
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number | null) => void;
  options: SelectOption[];
  isDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isClearable?: boolean;
  isMulti?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, required, helperText, ...props }, ref) => {
    return (
      <ChakraField
        label={label}
        required={required}
        invalid={!!error}
        errorText={error}
        helperText={helperText}
      >
        <Input ref={ref} {...props} />
      </ChakraField>
    );
  }
);

InputField.displayName = 'InputField';

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, required, helperText, rows = 4, ...props }, ref) => {
    return (
      <ChakraField
        label={label}
        required={required}
        invalid={!!error}
        errorText={error}
        helperText={helperText}
      >
        <Textarea ref={ref} rows={rows} {...props} />
      </ChakraField>
    );
  }
);

TextareaField.displayName = 'TextareaField';

export const SelectField = forwardRef<any, SelectFieldProps>(
  ({ label, error, required, helperText, options, value, onChange, size = 'md', isDisabled, isClearable, isMulti, placeholder }, ref) => {
    // Convert value to option format
    const selectedOption = options.find(opt => opt.value === value) || null;

    // Handle onChange by extracting the value
    const handleChange = (option: SelectOption | null) => {
      onChange?.(option ? option.value : null);
    };

    return (
      <ChakraField
        label={label}
        required={required}
        invalid={!!error}
        errorText={error}
        helperText={helperText}
      >
        <Select
          ref={ref}
          options={options}
          value={selectedOption}
          onChange={handleChange as any}
          placeholder={placeholder}
          size={size}
          isDisabled={isDisabled}
          isInvalid={!!error}
          isRequired={required}
          isClearable={isClearable}
          isMulti={isMulti}
        />
      </ChakraField>
    );
  }
);

SelectField.displayName = 'SelectField';

// Export Select component for direct use without Field wrapper
export { Select, type SelectOption, type SelectProps };

