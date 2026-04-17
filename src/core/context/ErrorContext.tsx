/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar, Alert, Button, Box } from '@mui/material';

interface ErrorContextType {
  showError: (message: string, canReload?: boolean) => void;
  hideError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [canReload, setCanReload] = useState(false);

  const showError = useCallback((msg: string, reload = true) => {
    setMessage(msg);
    setCanReload(reload);
    setOpen(true);
  }, []);

  const hideError = useCallback(() => {
    setOpen(false);
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <ErrorContext.Provider value={{ showError, hideError }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={null}
        onClose={hideError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: canReload ? 8 : 0 }}
      >
        <Alert 
          severity="error" 
          sx={{ 
            width: '100%', 
            minWidth: { xs: '90vw', sm: 400 },
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
          action={
            canReload ? (
              <Box sx={{ mt: 1, width: '100%' }}>
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleReload}
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  🔄 Recargar página
                </Button>
              </Box>
            ) : undefined
          }
        >
          <Box component="span" sx={{ fontWeight: 500 }}>
            {message}
          </Box>
        </Alert>
      </Snackbar>
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
