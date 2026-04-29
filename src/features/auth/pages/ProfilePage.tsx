// src/features/auth/pages/ProfilePage.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { theme } from '@/shared/theme';
import { useAuthStore } from '@/core/store/authStore';
import { userService } from '../services/userService';
import { getResourceUrl } from '@/shared/config/api';
import CountrySelect from '../components/CountrySelect';
import type { User } from "@/shared/types/auth.types";
import type { Country } from "@/shared/types/country.types";

export default function ProfilePage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar autenticación
  /*
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);
  */

  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) return;

    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, isInitialized, navigate]);

  // Cargar perfil
  const loadProfile = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const userProfile = await userService.getProfile(userId);
      setProfile(userProfile);
      setEmail(userProfile.email);
      setFullName(userProfile.fullName);
      setAvatarPreview(userProfile.avatarUrl);
    } catch (err: unknown) {
      let errorMessage = 'Error al cargar el perfil';
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);


  // Cargar inicial
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Cuando terminan de cargar los países, seleccionar automaticamente el del usuario
  const handleCountriesLoaded = (countriesList: Country[]) => {
    setCountries(countriesList);
    
    if (profile?.countryId) {
      const userCountry = countriesList.find(c => c.id === profile.countryId);
      if (userCountry) {
        setSelectedCountry(userCountry);
      }
    }
  };

  // Manejar selección de archivo de avatar
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

  // Abrir cámara
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error abriendo cámara:', err);
      alert('No se pudo acceder a la cámara. Por favor verifica los permisos.');
    }
  };

  // Capturar foto desde cámara
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
            setAvatarFile(file);
            setAvatarPreview(canvasRef.current!.toDataURL('image/jpeg'));
            closeCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  // Cerrar cámara
  const closeCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  };

  // Guardar perfil
  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('fullName', fullName);
      if (selectedCountry) {
        formData.append('countryId', selectedCountry.id);
      }
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const updatedProfile = await userService.updateProfile(profile.id, formData);
      setProfile(updatedProfile);
      setAvatarPreview(updatedProfile.avatarUrl);
      setAvatarFile(null);
      alert('Perfil actualizado correctamente!');
    } catch (err: unknown) {
      let errorMessage = 'Error al guardar el perfil';
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Si no hay token, no renderizamos nada
  if (!isInitialized) {
    return null;
  }

  if (!token) {
    return null;
  }

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ minHeight: '100vh', py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Container>
      </ThemeProvider>
    );
  }

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
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Mi Perfil
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Avatar */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={getResourceUrl(avatarPreview)}
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
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PhotoCamera />}
              onClick={() => fileInputRef.current?.click()}
            >
              Subir imagen
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
            
            <Button
              variant="outlined"
              onClick={openCamera}
            >
              Tomar foto
            </Button>
          </Box>
        </Box>

        {/* Campos del formulario */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />

          <TextField
            label="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
          />

          <CountrySelect 
            value={selectedCountry}
            onChange={setSelectedCountry}
            onCountriesLoaded={handleCountriesLoaded}
          />

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !email || !fullName}
            sx={{
              mt: 2,
              py: 1.5,
              background: 'linear-gradient(90deg, #ff7e7e, #7b96ff)',
              '&:hover': { opacity: 0.9 },
              '&:disabled': { opacity: 0.6 },
            }}
          >
            {saving ? <CircularProgress size={24} /> : 'Guardar cambios'}
          </Button>
        </Box>

        {/* Dialog de cámara */}
        <Dialog open={cameraOpen} onClose={closeCamera} maxWidth="md" fullWidth>
          <DialogTitle>Tomar foto</DialogTitle>
          <DialogContent>
            <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9', bgcolor: 'black' }}>
              <video
                ref={videoRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeCamera}>Cancelar</Button>
            <Button onClick={capturePhoto} variant="contained">Capturar</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}