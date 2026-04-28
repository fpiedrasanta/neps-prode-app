// src/core/router/AppRouter.tsx

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Box, CssBaseline, ThemeProvider, CircularProgress } from "@mui/material";
import { theme } from "@/shared/theme";
import { ErrorProvider } from "@/core/context/ErrorContext";
import ErrorBoundary from "@/core/components/ErrorBoundary";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import VerifyCodePage from "@/features/auth/pages/VerifyCodePage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import ProfilePage from "@/features/auth/pages/ProfilePage";
import MatchesPage from "@/features/matches/pages/MatchesPage";
import Header from "@/shared/components/Header";
import BottomNav from "@/shared/components/BottomNav";
import RankingPage from "@/features/ranking/pages/RankingPage";
import FriendsPage from "@/features/friends/pages/FriendsPage";
import FeedPage from "@/features/social/pages/FeedPage";
import { PWAButtons } from "@/shared/components/PWAButtons";
import { useAuthStore } from "@/core/store/authStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';

// Layout con Header y BottomNav
function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  const hideLayout = 
    location.pathname === '/login' || 
    location.pathname === '/register' ||
    location.pathname.startsWith('/login/');

  return (
    <ErrorProvider>
      <ThemeProvider theme={theme}>
      <CssBaseline />


      {!hideLayout && <Header />}
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
      {!hideLayout && <BottomNav />}
      
      {/* Botones PWA Instalar + Notificaciones */}
      {!hideLayout && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: 80, 
          right: 16, 
          zIndex: 1100,
          flexDirection: 'column',
          gap: 1
        }}>
          <PWAButtons />
        </Box>
      )}

      </ThemeProvider>
    </ErrorProvider>
  );
}

export default function AppRouter() {
  const isInitialized = useAuthStore(state => state.isInitialized);
  const token = useAuthStore(state => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ SOLAMENTE cuando ya terminamos de inicializar
    if (isInitialized) {
      // Si NO hay token y NO estamos ya en login, recien ahi redirigimos
      if (!token && !window.location.pathname.startsWith('/login') && window.location.pathname !== '/register') {
        navigate('/login');
      }
    }
  }, [isInitialized, token, navigate]);

  // ✅ MIENTRAS NO ESTA INICIALIZADO MOSTRAMOS SPINNER, NUNCA REDIRIGIMOS
  if (!isInitialized) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <MainLayout>
        <ErrorBoundary>
          <Routes>
          <Route path="/" element={<MatchesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/login/verify-code" element={<VerifyCodePage />} />
          <Route path="/login/reset-password" element={<ResetPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/ranking-friends" element={<RankingPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </ErrorBoundary>
      </MainLayout>
    </BrowserRouter>
  );
}
