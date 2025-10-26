import { Input, InputGroup } from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar = ({ value, onChange, placeholder = 'Search...' }: SearchBarProps) => {
  return (
    <InputGroup maxW={{ base: 'full', md: '300px' }} startElement={<LuSearch />}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </InputGroup>
  );
};

export default SearchBar;

