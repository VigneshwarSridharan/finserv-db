import { Container, Stack, Heading, Text, Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  description?: string;
  maxW?: string;
  actions?: ReactNode;
}

const PageContainer = ({ 
  children, 
  title, 
  description, 
  maxW = '7xl',
  actions 
}: PageContainerProps) => {
  return (
    <Container maxW={maxW} py={8}>
      <Stack gap={6}>
        {(title || description || actions) && (
          <Box>
            <Stack 
              direction={{ base: 'column', md: 'row' }} 
              justify="space-between" 
              align={{ base: 'flex-start', md: 'center' }}
              gap={4}
            >
              <Box>
                {title && (
                  <Heading size="lg" color="text.primary" mb={description ? 2 : 0}>
                    {title}
                  </Heading>
                )}
                {description && (
                  <Text fontSize="sm" color="text.secondary">
                    {description}
                  </Text>
                )}
              </Box>
              {actions && <Box>{actions}</Box>}
            </Stack>
          </Box>
        )}
        
        {children}
      </Stack>
    </Container>
  );
};

export default PageContainer;
