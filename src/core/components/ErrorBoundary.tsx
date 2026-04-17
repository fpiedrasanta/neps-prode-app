import React, { Component, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error capturado por Error Boundary:', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 3,
              py: 5
            }}
          >
            <Typography variant="h4" color="error" fontWeight={600}>
              😔 Ocurrió un error
            </Typography>
            
            <Typography variant="body1" color="text.secondary">
              No pudimos cargar esta sección correctamente.
              Esto suele pasar cuando el servidor no está disponible o hay problemas de conexión.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={this.handleReload}
                size="large"
              >
                🔄 Recargar página
              </Button>
              
              <Button 
                variant="outlined"
                onClick={this.handleGoHome}
                size="large"
              >
                🏠 Ir al inicio
              </Button>
            </Box>

            <Typography variant="caption" color="text.disabled" sx={{ mt: 4 }}>
              Detalle técnico: {this.state.error?.message}
            </Typography>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;