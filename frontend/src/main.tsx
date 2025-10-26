import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import { queryClient } from './api/queryClient';
import { system } from './theme';
import { Toaster } from './components/ui/toaster';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        <App />
        <Toaster />
      </ChakraProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
