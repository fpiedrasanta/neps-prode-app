// src/shared/components/Header/Header.tsx

import { useState } from 'react';
import { Box, Typography, Avatar, Menu, MenuItem, IconButton, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/store/authStore';
import { styled } from '@mui/material/styles';
import { getResourceUrl } from '@/shared/config/api';
import { PWAInstallButton } from '@/shared/components/PWAInstallButton';
import { api } from '@/core/api/axios';
import { broadcastLogout } from '@/core/auth/sessionChannel';

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
  const open = Boolean(anchorEl);

  console.log('Auth state:', { token, userId: user?.id, user, isInitialized });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await api.post('auth/logout');
      broadcastLogout();
    } catch (e) {
      console.warn('Logout request failed:', e);
    }

    logout();
    handleClose();
  };

  return (
    <>
      <StyledHeader>
        <Box onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
          <Typography variant="h5">PRODE</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PWAInstallButton variant="icon" />

          {isInitialized && user && (
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
    </>
  );
}