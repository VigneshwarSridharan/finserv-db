import { Field as ChakraField } from '../ui/field';
import { Input, Textarea, Select as ChakraSelect } from '@chakra-ui/react';
import { forwardRef } from 'react';

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
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
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

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, required, helperText, children, ...props }, ref) => {
    return (
      <ChakraField
        label={label}
        required={required}
        invalid={!!error}
        errorText={error}
        helperText={helperText}
      >
        <ChakraSelect.Root {...props}>
          <ChakraSelect.Trigger ref={ref}>
            <ChakraSelect.ValueText placeholder={props.placeholder} />
          </ChakraSelect.Trigger>
          <ChakraSelect.Content>
            {children}
          </ChakraSelect.Content>
        </ChakraSelect.Root>
      </ChakraField>
    );
  }
);

SelectField.displayName = 'SelectField';

