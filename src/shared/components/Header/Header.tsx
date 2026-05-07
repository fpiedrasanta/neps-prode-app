// src/shared/components/Header/Header.tsx

import { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Menu, MenuItem, IconButton, Divider, Badge, Dialog, DialogContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/store/authStore';
import { styled } from '@mui/material/styles';
import { getResourceUrl } from '@/shared/config/api';
import { PWAInstallButton } from '@/shared/components/PWAInstallButton';
import { api } from '@/core/api/axios';
import { broadcastLogout } from '@/core/auth/sessionChannel';
import { friendsService, FriendRequest } from '@/features/friends/services/friendsService';

const NotificationBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '0.6rem',
    minWidth: 10,
    height: 10,
    borderRadius: '50%',
    padding: 0,
    top: 2,
    right: 2,
  }
}));

const StyledHeader = styled(Box)(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: 60,
  background: 'linear-gradient(90deg, #1a1a2e, #16213e)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  zIndex: 1100,
  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
}));

export default function Header() {
  const navigate = useNavigate();
  const { logout, user, token, isInitialized } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [requestsModalOpen, setRequestsModalOpen] = useState(false);
  const open = Boolean(anchorEl);

  const loadPendingRequests = async () => {
    try {
      const summary = await friendsService.getSummary();
      setPendingRequestsCount(summary.receivedRequests.length);
      setFriendRequests(summary.receivedRequests);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  useEffect(() => {
    if (user) {
      // Ejecutar en siguiente tick para evitar renderizado en cascada
      setTimeout(loadPendingRequests, 0);
      
      // Actualizar cada 30 segundos
      const interval = setInterval(loadPendingRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  console.log('Auth state:', { token, userId: user?.id, user, isInitialized });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    // Primero limpiamos el estado LOCALMENTE SIEMPRE, no importa que pase con el servidor
    logout();
    handleClose();
    broadcastLogout();
    
    try {
      // Despues intentamos notificar al servidor, si falla no importa igual ya salimos
      // @ts-expect-error - Flag especial para no intentar refresh token en logout
      await api.post('auth/logout', {}, { _skipRefreshToken: true });
    } catch (e) {
      console.warn('Logout request al servidor falló (normal si token ya expiró):', e);
    }
  };

  return (
    <>
      <StyledHeader>
        <Box onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
          <Typography variant="h5">PRODE</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PWAInstallButton variant="icon" />

          {user && (
            <IconButton 
              onClick={() => setRequestsModalOpen(true)} 
              size="small" 
              sx={{ color: '#a0a0a0' }}
            >
              {pendingRequestsCount > 0 ? (
                <NotificationBadge badgeContent={pendingRequestsCount} max={9}>
                  <span style={{ fontSize: '1.3rem' }}>🔔</span>
                </NotificationBadge>
              ) : (
                <span style={{ fontSize: '1.3rem' }}>🔔</span>
              )}
            </IconButton>
          )}

          {user && (
            <IconButton onClick={handleClick} size="small">
              <Avatar
                src={user?.avatarUrl ? getResourceUrl(user.avatarUrl) : undefined}
              >
                {!user?.avatarUrl && user?.fullName
                  ? user.fullName
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((name: string) => name[0])
                      .join('')
                      .toUpperCase()
                  : 'U'}
              </Avatar>
            </IconButton>
          )}
        </Box>
      </StyledHeader>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => navigate('/profile')}>
          Editar perfil
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          Salir
        </MenuItem>
      </Menu>

      {/* Modal de Solicitudes de Amistad */}
      <Dialog 
        open={requestsModalOpen} 
        onClose={() => setRequestsModalOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1a1a2e',
            borderRadius: 3,
            minWidth: 350,
            maxWidth: 500,
            width: '95%'
          }
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: 'white' }}>
            Solicitudes de amistad
          </Typography>

          {friendRequests.length === 0 ? (
            <Typography sx={{ color: '#a0a0a0', textAlign: 'center', py: 4 }}>
              No tienes solicitudes pendientes
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {friendRequests.map((request) => (
                  <Box 
                    key={request.id} 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: 2,
                      bgcolor: '#16162a',
                      border: '1px solid #6366f1',
                      borderRadius: 2,
                      p: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {request.friendAvatarUrl ? (
                        <Box 
                          component="img" 
                          src={getResourceUrl(request.friendAvatarUrl)!}
                          sx={{ width: 45, height: 45, borderRadius: '50%' }} 
                        />
                      ) : (
                        <Box 
                          sx={{ 
                            width: 45, 
                            height: 45, 
                            borderRadius: '50%', 
                            bgcolor: '#3a3a5a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                          }}
                        >
                          {request.friendFullName?.substring(0,2).toUpperCase() ?? '?'}
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>{request.friendFullName}</Typography>
                        <Typography sx={{ color: '#a0a0a0', fontSize: '0.85rem' }}>{request.friendTotalPoints ?? 0} pts</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                      <Box 
                        component="button"
                        onClick={async () => {
                          await friendsService.acceptFriendship(request.id);
                          loadPendingRequests();
                        }}
                        sx={{
                          flex: 1,
                          bgcolor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: 2,
                          py: 1.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          transition: 'opacity 0.2s',
                          '&:hover': { opacity: 0.9 }
                        }}
                      >
                        ✅ Aceptar
                      </Box>
                      <Box 
                        component="button"
                        onClick={async () => {
                          await friendsService.declineFriendship(request.id);
                          loadPendingRequests();
                        }}
                        sx={{
                          flex: 1,
                          bgcolor: '#47476b',
                          color: 'white',
                          border: 'none',
                          borderRadius: 2,
                          py: 1.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          transition: 'opacity 0.2s',
                          '&:hover': { opacity: 0.9 }
                        }}
                      >
                        ❌ Rechazar
                      </Box>
                    </Box>
                  </Box>
              ))}
            </Box>
          )}

          <Box 
            sx={{ 
              mt: 3, 
              display: 'flex', 
              justifyContent: 'center' 
            }}
          >
            <IconButton 
              onClick={() => setRequestsModalOpen(false)}
              sx={{ color: '#a0a0a0' }}
            >
              Cerrar
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}