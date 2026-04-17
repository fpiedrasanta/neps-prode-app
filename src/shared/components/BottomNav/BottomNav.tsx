// src/shared/components/BottomNav/BottomNav.tsx

import { useNavigate, useLocation } from 'react-router-dom';
import { Box, styled } from '@mui/material';

const StyledBottomNav = styled(Box)(() => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: 70,
  background: 'linear-gradient(90deg, #1a1a2e, #16213e)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1100,
  boxShadow: '0 -2px 8px rgba(0,0,0,0.3)',
}));

const NavItemsContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  width: '100%',
  maxWidth: 800,
  padding: '8px 0',
}));

const NavItem = styled(Box, {
  shouldForwardProp: (prop) => !['$active', '$center'].includes(prop.toString()),
})<{ $active: boolean; $center?: boolean }>(({ $active, $center }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: $center ? '12px 20px' : '8px 12px',
  borderRadius: 12,
  transition: 'all 0.2s',
  background: $active ? 'rgba(123, 150, 255, 0.2)' : 'transparent',
  transform: $center ? 'scale(1.1)' : 'scale(1)',
  '&:hover': {
    background: $active ? 'rgba(123, 150, 255, 0.3)' : 'rgba(255,255,255,0.05)',
  },
}));

const NavIcon = styled('span', {
  shouldForwardProp: (prop) => prop !== '$active',
})<{ $active: boolean }>(({ $active }) => ({
  fontSize: $active ? '1.5rem' : '1.3rem',
  filter: $active ? 'drop-shadow(0 0 4px rgba(123, 150, 255, 0.5))' : 'none',
}));

const NavLabel = styled('span', {
  shouldForwardProp: (prop) => prop !== '$active',
})<{ $active: boolean }>(({ $active }) => ({
  fontSize: '0.625rem',
  color: $active ? '#7b96ff' : '#a0a0a0',
  marginTop: 2,
  textAlign: 'center',
}));

interface NavItemData {
  path: string;
  icon: string;
  label: string;
  isCenter?: boolean;
}

const navItems: NavItemData[] = [
  { path: '/friends', icon: '👥', label: 'Amigos' },
  { path: '/ranking-friends', icon: '🏆', label: 'Ranking' },
  { path: '/', icon: '🏠', label: 'Inicio', isCenter: true },
  { path: '/feed', icon: '📰', label: 'Feed' },
  { path: '/profile', icon: '👤', label: 'Perfil' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <StyledBottomNav>
      <NavItemsContainer>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavItem
              key={item.path}
              $active={isActive}
              $center={item.isCenter}
              onClick={() => navigate(item.path)}
            >
              <NavIcon $active={isActive}>{item.icon}</NavIcon>
              <NavLabel $active={isActive}>{item.label}</NavLabel>
            </NavItem>
          );
        })}
      </NavItemsContainer>
    </StyledBottomNav>
  );
}