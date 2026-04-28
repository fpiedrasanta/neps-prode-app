// src/features/auth/pages/ForgotPasswordPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import { theme } from '@/shared/theme';
import { api } from '@/core/api/axios';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await api.post('/Auth/forgot-password', { email: email.trim() });
      navigate('/login/verify-code', { state: { email } });
    } catch (err) {
      console.log(err);
      setError('Error de conexión. Por favor revisa tu conexión a internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container 
        maxWidth="xs" 
        sx={{ 
          minHeight: '100vh', 
          py: 3, 
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Typography 
          variant="h5" 
          fontWeight={700} 
          sx={{ 
            textAlign: 'center',
            mb: 4,
            background: 'linear-gradient(90deg, #7b96ff, #ff7e7e)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Olvidé mi contraseña
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Ingresá tu correo electrónico y te enviaremos un código para restablecer tu contraseña.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            autoComplete="email"
            autoFocus
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading || !email.trim()}
            sx={{
              py: 1.5,
              background: 'linear-gradient(90deg, #ff7e7e, #7b96ff)',
              '&:hover': { opacity: 0.9 },
              '&:disabled': { opacity: 0.6 },
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Enviar código'}
          </Button>

          <Button
            variant="text"
            onClick={() => navigate('/login')}
            sx={{ mt: 1 }}
          >
            Volver al login
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
}