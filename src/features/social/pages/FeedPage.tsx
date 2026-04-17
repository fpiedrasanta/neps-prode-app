// src/features/social/pages/FeedPage.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { theme } from '@/shared/theme';
import { useAuthStore } from '@/core/store/authStore';
import { postsService } from '../services/postsService';
import PostCard from '../components/PostCard';
import type { Post, PostError } from '@/shared/types';

const PAGE_SIZE = 10;
const RETRY_DELAY_MS = 30000; // 30 segundos
const MAX_RETRIES = 3;

type RetryTimeout = ReturnType<typeof setTimeout> | null;

export default function FeedPage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimeout, setRetryTimeout] = useState<RetryTimeout>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const currentPageRef = useRef(1);

  // Verificar autenticación
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Cargar posts
  const loadPosts = useCallback(async (page: number, append: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    isLoadingRef.current = true;
    
    try {
      const response = await postsService.getPosts({
        pageNumber: page,
        pageSize: PAGE_SIZE,
      });

      setPosts(prev => append ? [...prev, ...response.posts] : response.posts);
      setHasMore(page < response.totalPages);
      hasMoreRef.current = page < response.totalPages;
      currentPageRef.current = response.pageNumber;
      setRetryCount(0); // Resetear reintentos en caso de éxito
    } catch (err) {
      const postError = err as PostError;
      
      // Si es error 401, logout y redirect a login
      if (postError.statusCode === 401) {
        useAuthStore.getState().logout();
        navigate('/login', { replace: true });
        return;
      }

      // Manejo de reintentos
      if (retryCount < MAX_RETRIES) {
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        setError(`${postError.message} (Intento ${newRetryCount}/${MAX_RETRIES}). Reintentando en ${RETRY_DELAY_MS / 1000}s...`);
        
        // Programar reintento
        const timeout = setTimeout(() => {
          loadPosts(page, append);
        }, RETRY_DELAY_MS);
        
        setRetryTimeout(timeout);
      } else {
        setError(postError.message || 'Ocurrió un error al cargar el feed.');
        setHasMore(false); // Detener scroll infinito
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [navigate, retryCount]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [retryTimeout]);

  // Resetear reintentos cuando hay error
  useEffect(() => {
    if (error && retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }
  }, [error, retryTimeout]);

  // Cargar inicialmente
  useEffect(() => {
    if (!token) return;
    
    setPosts([]);
    setHasMore(true);
    loadPosts(1);
  }, [token, loadPosts]);

  // Scroll infinito
  useEffect(() => {
    if (!token) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMoreRef.current && !isLoadingRef.current && !retryTimeout) {
          const nextPage = currentPageRef.current + 1;
          loadPosts(nextPage, true);
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
  }, [retryTimeout, token, loadPosts]);

  // Si no hay token, no renderizamos nada (el useEffect redirigirá)
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
        {/* Título */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography 
            variant="h5" 
            fontWeight={700} 
            sx={{ 
              background: 'linear-gradient(90deg, #7b96ff, #ff7e7e)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Feed de Pronósticos
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Las mejores predicciones de la comunidad
          </Typography>
        </Box>

        {/* Error */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Lista de posts */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            minHeight: 300,
          }}
        >
          {posts.length === 0 && !loading && !error ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="body1" color="text.secondary">
                No hay publicaciones para mostrar.
              </Typography>
            </Box>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
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

          {/* No more posts */}
          {!hasMore && posts.length > 0 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="caption" color="text.secondary">
                No hay más publicaciones para mostrar
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}