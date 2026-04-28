// src/features/auth/pages/LoginPage.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  CssBaseline,
  Link,
  Typography,
  Alert,
  Paper,
  ThemeProvider,
} from "@mui/material";
import { loginSchema, LoginFormData } from "../components/loginSchema";
import { authService, type LoginError } from "../services/authService";
import { useAuthStore } from "@/core/store/authStore";
import { theme } from "@/shared/theme";
import { Button, Input } from "@/shared/components";
import { API_CONFIG } from '@/shared/config/api';
import { usePWAInstall } from "@/shared/hooks/usePWAInstall";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isInstallable, install } = usePWAInstall();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(data);
      
      // Extraer userId desde el token JWT (claim 'sub' es el subject = userId)
      const tokenParts = response.token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.sub;

      if (userId) {
        // ✅ Ambos endpoints devuelven TODOS los campos directamente en la raiz
        // Cast al tipo real que devuelve la API (no coincide con la definicion AuthResponse actual)
        const apiResponse = response as unknown as {
          token: string;
          refreshToken: string;
          fullName: string;
          email: string;
          avatarUrl: string | null;
          countryId: string | null;
          countryDescription: string | null;
          roles: string[];
          requiresEmailVerification: boolean;
        };

        const normalizedUser = {
          id: userId,
          fullName: apiResponse.fullName,
          email: apiResponse.email,
          avatarUrl: apiResponse.avatarUrl,
          countryId: apiResponse.countryId ?? undefined,
          countryDescription: apiResponse.countryDescription ?? undefined,
          roles: apiResponse.roles,
          requiresEmailVerification: apiResponse.requiresEmailVerification,
        };
        
        setAccessToken(response.token, userId, normalizedUser);
        navigate("/");
      } else {
        setError("Token inválido. Por favor, inténtalo de nuevo.");
      }
    } catch (error) {
      const loginError = error as LoginError;
      setError(loginError.message || "Ocurrió un error. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: 2,
          boxSizing: "border-box",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            padding: { xs: 3, sm: 4 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            border: "2px dashed rgba(255, 255, 255, 0.1)",
            borderRadius: 5,
          }}
        >
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontSize: { xs: "2.5rem", sm: "3rem" },
                fontWeight: 700,
                background: "linear-gradient(90deg, #ff7e7e, #7b96ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "2px",
              }}
            >
              PRODE
            </Typography>
            <Typography
              component="p"
              sx={{
                color: "#a0a0a0",
                fontFamily: "monospace",
                fontSize: "1.2rem",
                mt: -0.5,
              }}
            >
              {`<neps/>`}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          {isInstallable && (
            <Alert 
              severity="info" 
              sx={{ width: '100%', mb: 2, cursor: 'pointer', pointerEvents: 'auto' }}
              onClick={(e) => install(e)}
              icon={false}
              action={false}
            >
              📥 Instalar la App para mejor experiencia
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Input
              {...register("email")}
              label="Email / Gmail"
              type="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <Input
              {...register("password")}
              label="Contraseña"
              type="password"
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                background: "linear-gradient(90deg, #ff7e7e, #7b96ff)",
                '&:hover': {
                  opacity: 0.9,
                },
                '&:disabled': {
                  opacity: 0.6,
                },
              }}
            >
              {isLoading ? "Ingresando..." : "Ingresar"}
            </Button>

            <Link
              component="button"
              type="button"
              underline="always"
              sx={{
                color: "#a0a0a0",
                fontSize: "0.9rem",
                textAlign: "center",
                mt: 1,
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                '&:hover': {
                  color: "#7b96ff",
                },
              }}
              onClick={() => navigate('/login/forgot-password')}
            >
              Olvidé mi contraseña
            </Link>

            <Button
              variant="outlined"
              fullWidth
              sx={{
                mt: 1,
                borderColor: "#7b96ff",
                color: "#7b96ff",
                '&:hover': {
                  borderColor: "#7b96ff",
                  bgcolor: "rgba(123, 150, 255, 0.1)",
                },
              }}
              onClick={() => navigate('/register')}
            >
              Registrarse
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', my: 2, gap: 2 }}>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Typography variant="caption" color="text.secondary">
                o
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.1)' }} />
            </Box>

            <Button
              fullWidth
              sx={{
                py: 1.2,
                bgcolor: '#ffffff',
                color: '#202124',
                fontWeight: 500,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#f8f9fa',
                },
              }}
              onClick={async () => {
                // @ts-expect-error ¿error?
                const google = window.google;
                
                const client = google.accounts.oauth2.initTokenClient({
                  client_id: "231080589893-lo89nu7gl5rd0gcnd72f3s8b9vd2vvcq.apps.googleusercontent.com",
                  scope: "email profile",
                  callback: async (response: { access_token?: string; error?: string }) => {
                    if (response.access_token) {
                      try {
                        const res = await fetch(`${API_CONFIG.apiUrl}/Auth/login/google`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ googleToken: response.access_token }),
                        });

                        if (res.ok) {
                          const data = await res.json();
                          
                          const tokenParts = data.token.split('.');
                          const payload = JSON.parse(atob(tokenParts[1]));
                          const userId = payload.sub;
                          
                          // ✅ El endpoint de Google devuelve los campos user DIRECTAMENTE en la raiz, NO dentro de .user
                          const normalizedUser = {
                            id: userId,
                            fullName: data.fullName,
                            email: data.email,
                            avatarUrl: data.avatarUrl,
                            countryId: data.countryId ?? undefined,
                            countryDescription: data.countryDescription,
                            roles: data.roles,
                            requiresEmailVerification: data.requiresEmailVerification,
                          };
                          
                          setAccessToken(data.token, userId, normalizedUser);
                          navigate("/");
                        } else {
                          const errorData = await res.json().catch(() => ({}));
                          setError(errorData.message || "No se pudo iniciar sesión con Google");
                        }
                      } catch (err) {
                        console.log(err);
                        setError("Error de conexión con Google");
                      }
                    }
                  },
                });

                client.requestAccessToken();
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.18 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.99 12.59 18.05 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.22l7.59 5.91C42.69 37.87 46.98 31.77 46.98 24.55z"/>
                  <path fill="#FBBC05" d="M10.05 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.93 0 20.32 0 24c0 3.68.92 7.07 2.56 10.19l7.98-6.19z"/>
                  <path fill="#34A853" d="M24 46c6.47 0 11.94-2.19 16.12-5.91l-7.59-5.91c-2.11 1.41-4.81 2.25-8.53 2.25-5.95 0-11.01-3.09-13.96-7.66l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continuar con Google
              </Box>
            </Button>

          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}