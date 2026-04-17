// src/features/auth/pages/VerifyCodePage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import { theme } from '@/shared/theme';
import OtpInput from '../components/OtpInput';

const EXPIRE_TIME_SECONDS = 5 * 60; // 5 minutos

export default function VerifyCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [code, setCode] = useState('');
  const [error,] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(EXPIRE_TIME_SECONDS);

  // Redirigir si no hay email
  useEffect(() => {
    if (!email) {
      navigate('/login/forgot-password');
    }
  }, [email, navigate]);

  // Temporizador regresivo
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeComplete = useCallback(async (fullCode: string) => {
    if (fullCode.length !== 6) return;

    // Navegar a cambiar contraseña
    navigate('/login/reset-password', {
      state: {
        email,
        code: fullCode,
      },
    });
  }, [email, navigate]);

  useEffect(() => {
    if (code.length === 6) {
      handleCodeComplete(code);
    }
  }, [code, handleCodeComplete]);

  if (!email) return null;

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
            mb: 2,
            background: 'linear-gradient(90deg, #7b96ff, #ff7e7e)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Verificar código
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
          Enviamos un código de 6 dígitos a:
        </Typography>

        <Typography variant="body1" fontWeight={600} sx={{ mb: 4, textAlign: 'center' }}>
          {email}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <OtpInput 
          onChange={setCode}
        />

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color={timeLeft > 0 ? 'text.secondary' : 'error'}>
            {timeLeft > 0 
              ? `El código expira en: ${formatTime(timeLeft)}`
              : 'El código ha expirado. Por favor solicita uno nuevo.'
            }
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
          <Button
            variant="text"
            onClick={() => setTimeLeft(EXPIRE_TIME_SECONDS)}
            disabled={timeLeft > 0}
          >
            Reenviar código
          </Button>

          <Button
            variant="text"
            onClick={() => navigate('/login')}
          >
            Volver al login
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
}