import { forwardRef, useMemo } from 'react';
import ReactSelect from 'react-select';
import type { Props as ReactSelectProps, GroupBase, StylesConfig } from 'react-select';

export interface SelectOption {
    value: string | number;
    label: string;
    isDisabled?: boolean;
}

export interface SelectProps
    extends Omit<ReactSelectProps<SelectOption, boolean, GroupBase<SelectOption>>, 'size'> {
    size?: 'sm' | 'md' | 'lg';
    isInvalid?: boolean;
    isRequired?: boolean;
}

const Select = forwardRef<any, SelectProps>(
    ({ size = 'md', isInvalid = false, isDisabled = false, isRequired = false, ...props }, ref) => {
        // Size configurations
        const sizeConfig = {
            sm: {
                minHeight: '32px',
                fontSize: '14px',
                padding: '0 8px',
            },
            md: {
                minHeight: '40px',
                fontSize: '14px',
                padding: '0 12px',
            },
            lg: {
                minHeight: '48px',
                fontSize: '18px',
                padding: '0 16px',
            },
        };

        const currentSize = sizeConfig[size];

        // Custom styles that integrate with Chakra UI theme
        const customStyles: StylesConfig<SelectOption, boolean, GroupBase<SelectOption>> = useMemo(
            () => ({
                container: (base) => ({
                    ...base,
                    width: '100%',
                }),
                control: (base, state) => ({
                    ...base,
                    minHeight: currentSize.minHeight,
                    fontSize: currentSize.fontSize,
                    borderRadius: 'var(--chakra-radii-md)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: isInvalid
                        ? 'var(--error-color)'
                        : state.isFocused
                            ? 'var(--focus-ring-color)'
                            : 'var(--chakra-colors-border)',

                    backgroundColor: isDisabled
                        ? 'var(--chakra-colors-gray-100)'
                        : 'var(--chakra-colors-bg-surface)',
                    boxShadow: state.isFocused
                        ? `0 0 0 1px ${isInvalid ? 'var(--error-color)' : 'var(--chakra-colors-border)'}`
                        : 'none',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                        borderColor: isInvalid
                            ? 'var(--error-color)'
                            : state.isFocused
                                ? 'var(--focus-ring-color)'
                                : 'var(--chakra-colors-border)',
                    },
                }),
                valueContainer: (base) => ({
                    ...base,
                    padding: currentSize.padding,
                }),
                input: (base) => ({
                    ...base,
                    color: 'var(--chakra-colors-text-primary)',
                    margin: 0,
                    padding: 0,
                }),
                placeholder: (base) => ({
                    ...base,
                    color: 'var(--chakra-colors-text-secondary)',
                    opacity: 0.6,
                }),
                singleValue: (base) => ({
                    ...base,
                    color: 'var(--chakra-colors-text-primary)',
                }),
                multiValue: (base) => ({
                    ...base,
                    backgroundColor: 'var(--chakra-colors-blue-100)',
                    borderRadius: 'var(--chakra-radii-md)',
                }),
                multiValueLabel: (base) => ({
                    ...base,
                    color: 'var(--chakra-colors-blue-800)',
                    padding: '2px 6px',
                }),
                multiValueRemove: (base) => ({
                    ...base,
                    color: 'var(--chakra-colors-blue-600)',
                    cursor: 'pointer',
                    '&:hover': {
                        backgroundColor: 'var(--chakra-colors-blue-200)',
                        color: 'var(--chakra-colors-blue-900)',
                    },
                }),
                menu: (base) => ({
                    ...base,
                    backgroundColor: 'var(--chakra-colors-bg-panel)',
                    borderRadius: 'var(--chakra-radii-md)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--chakra-colors-border)',
                    boxShadow: 'var(--chakra-shadows-lg)',
                    marginTop: '4px',
                    overflow: 'hidden',
                    zIndex: 1000,
                }),
                menuList: (base) => ({
                    ...base,
                    padding: '4px',
                    maxHeight: '240px',
                }),
                option: (base, state) => ({
                    ...base,
                    fontSize: currentSize.fontSize,
                    backgroundColor: state.isSelected
                        ? 'var(--mix-background, var(--chakra-colors-bg-emphasized))'
                        : state.isFocused
                            ? 'var(--mix-background, var(--chakra-colors-bg-muted))'
                            : 'transparent',
                    color: state.isSelected
                        ? 'var(--chakra-colors-text-active)'
                        : 'var(--chakra-colors-text-primary)',
                    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
                    padding: '8px 12px',
                    borderRadius: 'var(--chakra-radii-sm)',
                    transition: 'all 0.15s',
                    '&:active': {
                        backgroundColor: 'var(--chakra-colors-bg-active)',
                    },
                }),
                indicatorSeparator: (base) => ({
                    ...base,
                    backgroundColor: 'var(--chakra-colors-border-default)',
                }),
                dropdownIndicator: (base, state) => ({
                    ...base,
                    color: 'var(--chakra-colors-fg-muted)',
                    padding: '8px',
                    transition: 'all 0.2s',
                    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    '&:hover': {
                        color: 'var(--chakra-colors-text-primary)',
                    },
                }),
                clearIndicator: (base) => ({
                    ...base,
                    color: 'var(--chakra-colors-text-secondary)',
                    padding: '8px',
                    cursor: 'pointer',
                    '&:hover': {
                        color: 'var(--chakra-colors-red-500)',
                    },
                }),
                loadingIndicator: (base) => ({
                    ...base,
                    color: 'var(--chakra-colors-blue-500)',
                }),
                noOptionsMessage: (base) => ({
                    ...base,
                    color: 'var(--chakra-colors-text-secondary)',
                    fontSize: currentSize.fontSize,
                    padding: '12px',
                }),
                loadingMessage: (base) => ({
                    ...base,
                    color: 'var(--chakra-colors-text-secondary)',
                    fontSize: currentSize.fontSize,
                    padding: '12px',
                }),
            }),
            [size, isInvalid, isDisabled, currentSize]
        );

        return (
            <ReactSelect
                ref={ref}
                styles={customStyles}
                isDisabled={isDisabled}
                isSearchable={true}
                required={isRequired}
                classNamePrefix="chakra-select"
                {...props}
            />
        );
    }
);

Select.displayName = 'Select';

export default Select;

