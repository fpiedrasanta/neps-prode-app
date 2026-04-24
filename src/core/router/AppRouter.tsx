// src/core/router/AppRouter.tsx

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
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
