// src/shared/components/BottomNav/BottomNav.tsx

import { useNavigate, useLocation } from 'react-router-dom';
import { Box, styled, Badge } from '@mui/material';
import { useEffect, useState } from 'react';
import { friendsService } from '@/features/friends/services/friendsService';

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
  position: 'relative',
}));

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
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        const summary = await friendsService.getSummary();
        setPendingRequestsCount(summary.receivedRequests.length);
      } catch (error) {
        console.error('Error loading pending requests:', error);
      }
    };

    loadPendingRequests();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadPendingRequests, 30000);
    return () => clearInterval(interval);
  }, []);

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
              {item.path === '/friends' && pendingRequestsCount > 0 ? (
                <NotificationBadge badgeContent={pendingRequestsCount} max={9}>
                  <NavIcon $active={isActive}>{item.icon}</NavIcon>
                </NotificationBadge>
              ) : (
                <NavIcon $active={isActive}>{item.icon}</NavIcon>
              )}
              <NavLabel $active={isActive}>{item.label}</NavLabel>
            </NavItem>
          );
        })}
      </NavItemsContainer>
    </StyledBottomNav>
  );
}