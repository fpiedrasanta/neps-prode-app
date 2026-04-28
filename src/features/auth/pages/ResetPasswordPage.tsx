// src/features/auth/pages/ResetPasswordPage.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const code = location.state?.code;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirigir si faltan datos
  if (!email || !code) {
    navigate('/login/forgot-password');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/Auth/reset-password', {
        email,
        code,
        newPassword,
      });
      alert('Contraseña actualizada correctamente!');
      navigate('/login');
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
          Nueva contraseña
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Nueva contraseña"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            autoComplete="new-password"
            autoFocus
          />

          <TextField
            label="Confirmar contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading || !newPassword || !confirmPassword}
            sx={{
              py: 1.5,
              background: 'linear-gradient(90deg, #ff7e7e, #7b96ff)',
              '&:hover': { opacity: 0.9 },
              '&:disabled': { opacity: 0.6 },
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Guardar contraseña'}
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