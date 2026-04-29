// src/features/matches/pages/MatchesPage.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import { theme } from '@/shared/theme';
import { useAuthStore } from '@/core/store/authStore';
import { matchesService, type MatchesError } from '../services/matchesService';
import MatchCard from '../components/MatchCard';
import type { Match, MatchesResponse } from '@/shared/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`matches-tabpanel-${index}`}
      sx={{ width: '100%' }}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `matches-tab-${index}`,
    'aria-controls': `matches-tabpanel-${index}`,
  };
}

const TAB_STATUS_MAP = [
  { label: 'Próximos', status: 1 },
  { label: 'En juego', status: 2 },
  { label: 'Finalizados', status: 3 },
];

const PAGE_SIZE = 10;

const RETRY_DELAY_MS = 30000; // 30 segundos
const MAX_RETRIES = 3;

type RetryTimeout = ReturnType<typeof setTimeout> | null;

export default function MatchesPage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [tabValue, setTabValue] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  /*const [currentPage, setCurrentPage] = useState(1);*/
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimeout, setRetryTimeout] = useState<RetryTimeout>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const currentPageRef = useRef(1);

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

  // Cargar partidos
  const loadMatches = useCallback(async (page: number, status: number, append: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    isLoadingRef.current = true;
    
    try {
      const response: MatchesResponse = await matchesService.getMatches({
        status,
        pageNumber: page,
        pageSize: PAGE_SIZE,
      });

      setMatches(prev => append ? [...prev, ...response.items] : response.items);
      setHasMore(response.hasNextPage);
      hasMoreRef.current = response.hasNextPage;
      /*setCurrentPage(response.pageNumber);*/
      currentPageRef.current = response.pageNumber;
      setRetryCount(0); // Resetear reintentos en caso de éxito
    } catch (err) {
      const matchesError = err as MatchesError;
      
      // Si es error 401, logout y redirect a login
      if (matchesError.statusCode === 401) {
        useAuthStore.getState().logout();
        navigate('/login', { replace: true });
        return;
      }

      // Manejo de reintentos
      if (retryCount < MAX_RETRIES) {
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        setError(`${matchesError.message} (Intento ${newRetryCount}/${MAX_RETRIES}). Reintentando en ${RETRY_DELAY_MS / 1000}s...`);
        
        // Programar reintento
        const timeout = setTimeout(() => {
          loadMatches(page, status, append);
        }, RETRY_DELAY_MS);
        
        setRetryTimeout(timeout);
      } else {
        setError(matchesError.message || 'Ocurrió un error al cargar los partidos.');
        setHasMore(false); // Detener scroll infinito
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [navigate]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [retryTimeout]);

  // Resetear reintentos cuando cambia el tab
  useEffect(() => {
    setRetryCount(0);
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }
  }, [tabValue, retryTimeout]);

  // Cargar cuando cambia el tab
  useEffect(() => {
    if (!isInitialized) return;
    if (!token) return; // No cargar si no hay token
    
    setMatches([]);
    /*setCurrentPage(1);*/
    setHasMore(true);
    loadMatches(1, TAB_STATUS_MAP[tabValue].status);
  }, [tabValue, token, loadMatches]);

  // Scroll infinito
  useEffect(() => {
    if (!isInitialized) return;
    if (!token) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMoreRef.current && !isLoadingRef.current && !retryTimeout) {
          const nextPage = currentPageRef.current + 1;
          loadMatches(nextPage, TAB_STATUS_MAP[tabValue].status, true);
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      observer.disconnect();
    };
  }, [tabValue, retryTimeout, token, loadMatches]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Si no hay token, no renderizamos nada (el useEffect redirigirá)
  if (!isInitialized) {
    return null;
  }

  if (!token) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container 
        maxWidth="md" 
        sx={{ 
          minHeight: '100vh', 
          py: 3, 
          px: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabs - Sticky */}
        <Box
          sx={{
            position: 'sticky',
            top: 60,
            zIndex: 1000,
            bgcolor: 'background.default',
            mb: 2,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.85rem', sm: '1rem' },
                fontWeight: 600,
                minHeight: 48,
              },
              '& .Mui-selected': {
                color: '#7b96ff !important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#7b96ff',
              },
            }}
          >
            {TAB_STATUS_MAP.map((tab, index) => (
              <Tab key={index} label={tab.label} {...a11yProps(index)} />
            ))}
          </Tabs>
        </Box>

        {/* Listado de partidos */}
        {TAB_STATUS_MAP.map((tab, index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minHeight: 300,
                pt: 2,
              }}
            >
              {matches.length === 0 && !loading ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="body1" color="text.secondary">
                    No hay partidos {tab.label.toLowerCase()}.
                  </Typography>
                </Box>
              ) : (
                matches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onUpdate={() => {
                      // Recargar la lista cuando se actualiza un pronóstico
                      loadMatches(1, TAB_STATUS_MAP[tabValue].status);
                    }}
                  />
                ))
              )}

              {/* Loading indicator */}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={32} />
                </Box>
              )}

              {/* Observer target for infinite scroll */}
              <div ref={observerTarget} style={{ height: '1px' }} />

              {/* No more matches */}
              {!hasMore && matches.length > 0 && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    No hay más partidos para mostrar
                  </Typography>
                </Box>
              )}
            </Box>
          </TabPanel>
        ))}
      </Container>
    </ThemeProvider>
  );
}