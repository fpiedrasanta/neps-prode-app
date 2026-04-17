// src/shared/components/Header/Header.tsx

import { useState } from 'react';
import { Box, Typography, Avatar, Menu, MenuItem, IconButton, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/store/authStore';
import { styled } from '@mui/material/styles';
import { getResourceUrl } from '@/shared/config/api';

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
  const { logout, user, token, userId } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // 🔍 DEBUG LOG PARA ENCONTRAR EL PROBLEMA
  console.log('✅ Header montado - Estado Auth Store:', {
    existeToken: !!token,
    userId,
    existeUser: !!user,
    user: user
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleEditProfile = () => {
    navigate('/profile');
    handleClose();
  };

  return (
    <>
      <StyledHeader>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            gap: 0,
          }}
          onClick={() => navigate('/')}
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(90deg, #ff7e7e, #7b96ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '1px',
              lineHeight: 1.2,
            }}
          >
            PRODE
          </Typography>
          <Typography
            component="span"
            sx={{
              color: '#a0a0a0',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              lineHeight: 1.2,
            }}
          >
            {`<neps/>`}
          </Typography>
        </Box>

        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            width: 40,
            height: 40,
            border: '2px solid rgba(255,255,255,0.2)',
          }}
        >
          <Avatar
            src={user?.avatarUrl ? getResourceUrl(user.avatarUrl) : undefined}
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#7b96ff',
              fontSize: '0.875rem',
            }}
          >
            {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'U'}
          </Avatar>
        </IconButton>
      </StyledHeader>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 180,
            bgcolor: '#1a1a2e',
            color: '#fff',
            '& .MuiMenuItem-root': {
              '&:hover': {
                bgcolor: 'rgba(123, 150, 255, 0.2)',
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEditProfile}>
          <Box sx={{ mr: 1 }}>✏️</Box>
          Editar mi perfil
        </MenuItem>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <MenuItem onClick={handleLogout}>
          <Box sx={{ mr: 1 }}>🚪</Box>
          Salir
        </MenuItem>
      </Menu>
    </>
  );
}