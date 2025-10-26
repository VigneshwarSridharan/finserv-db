import { Container } from '@chakra-ui/react';
import type { ContainerProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface PageContainerProps extends ContainerProps {
  children: ReactNode;
}

const PageContainer = ({ children, ...props }: PageContainerProps) => {
  return (
    <Container
      maxW="7xl"
      py={8}
      px={{ base: 4, md: 6 }}
      {...props}
    >
      {children}
    </Container>
  );
};

export default PageContainer;

