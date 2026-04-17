import { useState, useEffect, useRef, useCallback } from 'react';
import { rankingService, RankingUser } from '../services/rankingService';
import './RankingPage.css';
import { getResourceUrl } from '@/shared/config/api';

const RankingPage = () => {
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>(0);

  const loadRanking = useCallback(async (pageNumber: number, searchQuery: string, reset: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await rankingService.getRanking(pageNumber, 10, searchQuery);
      
      if (reset) {
        setUsers(response.users);
      } else {
        setUsers(prev => [...prev, ...response.users]);
      }
      
      setHasMore(pageNumber < response.totalPages);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error loading ranking:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Initial load
  useEffect(() => {
    loadRanking(1, '', true);
  }, []);

  // Search handler with debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    searchDebounceRef.current = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      loadRanking(1, value, true);
    }, 300);
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadRanking(page + 1, search, false);
      }
    }, { threshold: 0.1 });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [page, hasMore, loading, search, loadRanking]);

  const getPositionBadge = (position: number) => {
    if (position === 1) {
      return <span className="medal gold">🥇</span>;
    } else if (position === 2) {
      return <span className="medal silver">🥈</span>;
    } else if (position === 3) {
      return <span className="medal bronze">🥉</span>;
    }
    return <span className="position-number">{position}</span>;
  };

  const getAvatar = (user: RankingUser) => {
    if (user.avatarUrl) {
      return <img src={getResourceUrl(user.avatarUrl)!} alt={user.fullName} className="avatar" />;
    }
    return (
      <div className="avatar-placeholder">
        {user.fullName.substring(0, 2).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="ranking-page">
      <h1 className="ranking-title">Ranking Global</h1>
      
      {/* Buscador */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={search}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {/* Lista de usuarios */}
      <div className="ranking-list">
        {users.map((user, index) => (
          <div 
            key={user.id || index} 
            className={`ranking-item ${user.position <= 3 ? `top-${user.position}` : ''}`}
          >
            <div className="user-info">
              {getAvatar(user)}
               <div className="user-details">
                 <span className="user-name">{user.fullName}</span>
                 <span className={`user-points ${user.totalPoints < 0 ? 'negative' : 'positive'}`}>
                   {user.totalPoints < 0 ? `-1` : `+${user.totalPoints ?? 0}`} pts
                 </span>
               </div>
            </div>
            {getPositionBadge(user.position)}
          </div>
        ))}
      </div>

      {/* Loader y observador para scroll infinito */}
      <div ref={observerRef} className="load-more">
        {loading && <div className="loading-spinner">Cargando más usuarios...</div>}
        {!hasMore && users.length > 0 && <div className="end-message">No hay más usuarios</div>}
      </div>
    </div>
  );
};

export default RankingPage;