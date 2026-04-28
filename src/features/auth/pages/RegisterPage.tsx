// src/features/auth/pages/RegisterPage.tsx
import { useState, useRef } from 'react';
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
  Avatar,
  TextField,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { theme } from '@/shared/theme';
import { getResourceUrl } from '@/shared/config/api';
import { api } from '@/core/api/axios';
import CountrySelect from '../components/CountrySelect';
import type { Country } from "@/shared/types/country.types";
import { useAuthStore } from '@/core/store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const setAccessToken = useAuthStore(state => state.setAccessToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('fullName', fullName);
      formData.append('password', password);
      
      if (selectedCountry) {
        formData.append('countryId', selectedCountry.id);
      }
      
      if (avatarFile) {
        formData.append('file', avatarFile);
      }

      await api.post('/Auth/register', formData);
      setRegistrationSuccess(true);
      setError(null);
    } catch (err) {
      console.log(err);
      setError('Error de conexión. Por favor revisa tu conexión a internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setVerifyingCode(true);
    setError(null);

    try {
      const response = await api.post('/Auth/verify-email', {
        email: email,
        code: verificationCode
      });
      const { token, user } = response.data;
      setAccessToken(token, user);
      navigate('/');
    } catch (err) {
      console.log(err);
      setError('Error de conexión. Por favor revisa tu conexión a internet.');
    } finally {
      setVerifyingCode(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container 
        maxWidth="sm" 
        sx={{ 
          minHeight: '100vh', 
          py: 3, 
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {!registrationSuccess ? (
          <>
            <Typography 
              variant="h5" 
              fontWeight={70} 
              sx={{ 
                textAlign: 'center',
                mb: 4,
                background: 'linear-gradient(90deg, #7b96ff, #ff7e7e)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Crear cuenta
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Avatar */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={avatarPreview ? getResourceUrl(avatarPreview) : undefined}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                    mb: 2,
                  }}
                >
                  {fullName?.substring(0, 2).toUpperCase()}
                </Avatar>
                
                <Button
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Subir foto
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </Box>

              <TextField
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                autoComplete="email"
              />

              <TextField
                label="Nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                fullWidth
                autoComplete="name"
              />

              <CountrySelect 
                value={selectedCountry}
                onChange={setSelectedCountry}
              />

              <TextField
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                autoComplete="new-password"
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
                disabled={loading || !email || !fullName || !password || !confirmPassword}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(90deg, #ff7e7e, #7b96ff)',
                  '&:hover': { opacity: 0.9 },
                  '&:disabled': { opacity: 0.6 },
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Crear cuenta'}
              </Button>

              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ mt: 1 }}
              >
                Volver al login
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography 
              variant="h5" 
              fontWeight={70} 
              sx={{ 
                textAlign: 'center',
                mb: 2,
                background: 'linear-gradient(90deg, #7b96ff, #ff7e7e)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Verifica tu correo
            </Typography>

            <Alert severity="success" sx={{ mb: 3 }}>
              Cuenta creada correctamente! Hemos enviado un código de 6 dígitos a {email}. 
              El código es válido por 5 minutos.
            </Alert>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleVerifyCode} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <TextField
                label="Código de verificación"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                fullWidth
                autoComplete="one-time-code"
                inputProps={{
                  maxLength: 6,
                  pattern: '[0-9]*',
                  inputMode: 'numeric'
                }}
                sx={{
                  '& input': {
                    fontSize: '2rem',
                    letterSpacing: '0.5rem',
                    textAlign: 'center',
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={verifyingCode || verificationCode.length !== 6}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(90deg, #ff7e7e, #7b96ff)',
                  '&:hover': { opacity: 0.9 },
                  '&:disabled': { opacity: 0.6 },
                }}
              >
                {verifyingCode ? <CircularProgress size={24} /> : 'Verificar código'}
              </Button>

              <Button
                variant="text"
                onClick={() => {
                  setRegistrationSuccess(false);
                  setVerificationCode('');
                  setError(null);
                }}
                sx={{ mt: 1 }}
              >
                Volver atrás
              </Button>
            </Box>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}