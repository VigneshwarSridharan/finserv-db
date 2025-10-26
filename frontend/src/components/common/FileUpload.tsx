import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { LuUpload, LuFile, LuX } from 'react-icons/lu';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
}

const FileUpload = ({ onFileSelect, accept = '.csv', maxSize = 5 }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setError('');
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <VStack gap={4} align="stretch">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      {!selectedFile ? (
        <Box
          borderWidth="2px"
          borderStyle="dashed"
          borderRadius="md"
          p={8}
          textAlign="center"
          cursor="pointer"
          _hover={{ borderColor: 'brand.500', bg: 'brand.50' }}
          onClick={() => inputRef.current?.click()}
        >
          <VStack gap={2}>
            <LuUpload size={32} />
            <Text fontWeight="medium">Click to upload or drag and drop</Text>
            <Text fontSize="sm" color="text.secondary">
              {accept} (max {maxSize}MB)
            </Text>
          </VStack>
        </Box>
      ) : (
        <Box
          borderWidth="1px"
          borderRadius="md"
          p={4}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={2}>
            <LuFile size={20} />
            <Text fontSize="sm">{selectedFile.name}</Text>
            <Text fontSize="xs" color="text.secondary">
              ({(selectedFile.size / 1024).toFixed(2)} KB)
            </Text>
          </Box>
          <Button
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={handleRemove}
          >
            <LuX />
          </Button>
        </Box>
      )}

      {error && (
        <Text color="red.500" fontSize="sm">
          {error}
        </Text>
      )}
    </VStack>
  );
};

export default FileUpload;

