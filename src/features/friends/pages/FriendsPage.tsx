import { useState, useEffect } from 'react';
import { friendsService, Friend, FriendRequest, SearchUser, CurrentUser } from '../services/friendsService';
import './FriendsPage.css';
import { getResourceUrl } from '@/shared/config/api';

interface ListItem {
  id: string;
  type: 'user' | 'friend' | 'sent';
  fullName: string;
  avatarUrl: string | null;
  points: number | null;
  status?: number;
  isCurrentUser: boolean;
  isPending: boolean;
}

const FriendsPage = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [maxFriends] = useState(5);

  const loadData = async () => {
    setLoading(true);
    try {
      const summary = await friendsService.getSummary();
      
      setFriends(summary.friends);
      setSentRequests(summary.sentRequests);
      setReceivedRequests(summary.receivedRequests);
      setCurrentUser(summary.currentUser);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Buscador de usuarios para agregar amigo
  useEffect(() => {
    if (searchUser.length >= 2) {
      const timer = setTimeout(async () => {
        const users = await friendsService.searchUsers(searchUser);
        setSearchResults(users);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchUser]);

  const handleRemoveFriend = async (friendId: string) => {
    await friendsService.removeFriend(friendId);
    loadData();
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    await friendsService.acceptFriendship(friendshipId);
    loadData();
  };

  const handleDeclineRequest = async (friendshipId: string) => {
    await friendsService.declineFriendship(friendshipId);
    loadData();
  };

  const handleSendRequest = async (userId: string) => {
    await friendsService.sendFriendRequest(userId);
    setShowAddModal(false);
    setSearchUser('');
    setSearchResults([]);
    loadData();
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return <span className="medal gold">🥇</span>;
    if (position === 2) return <span className="medal silver">🥈</span>;
    if (position === 3) return <span className="medal bronze">🥉</span>;
    return <span className="position-number">{position}</span>;
  };

  const getAvatar = (avatarUrl: string | undefined | null, fullName: string | undefined | null) => {
    if (avatarUrl) {
      return <img src={getResourceUrl(avatarUrl)!} alt={fullName || 'Usuario'} className="avatar" />;
    }
    return (
      <div className="avatar-placeholder">
        {(fullName || '??').substring(0, 2).toUpperCase()}
      </div>
    );
  };

  // Construir lista combinada: usuario actual + amigos + solicitudes enviadas
  const getCombinedList = (): ListItem[] => {
    const list: ListItem[] = [];

    // Agregar usuario actual
    if (currentUser) {
      list.push({
        id: currentUser.id,
        type: 'user',
        fullName: currentUser.fullName,
        avatarUrl: currentUser.avatarUrl,
        points: currentUser.totalPoints,
        isCurrentUser: true,
        isPending: false
      });
    }

    // Agregar amigos aceptados
    friends.forEach(friend => {
      list.push({
        id: friend.id,
        type: 'friend',
        fullName: friend.friendFullName,
        avatarUrl: friend.friendAvatarUrl,
        points: friend.friendTotalPoints,
        status: friend.status,
        isCurrentUser: false,
        isPending: false
      });
    });

    // Agregar solicitudes enviadas (pendientes)
    sentRequests.forEach(request => {
      list.push({
        id: request.id,
        type: 'sent',
        fullName: request.friendFullName,
        avatarUrl: request.friendAvatarUrl,
        points: request.friendTotalPoints,
        status: request.status,
        isCurrentUser: false,
        isPending: true
      });
    });

    // Ordenar de mayor a menor por puntos
    return list.sort((a, b) => {
      const pointsA = a.points ?? 0;
      const pointsB = b.points ?? 0;
      return pointsB - pointsA;
    });
  };

  const combinedList = getCombinedList();
  
  // Generar slots vacíos (maxFriends menos la cantidad de elementos que tenemos (usuario + amigos + solicitudes enviadas)
  const emptySlots = Array.from({ length: maxFriends - combinedList.length }, (_, i) => i);

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h1 className="friends-title">Amigos</h1>
        <button className="add-friend-btn" onClick={() => setShowAddModal(true)}>
          <span className="icon">👤+</span> Agregar amigo
        </button>
      </div>

      {/* Lista combinada: Usuario + Amigos + Solicitudes Enviadas */}
      <div className="friends-list">
        {combinedList.map((item, index) => (
          <div key={item.id} className={`friend-item top-${index + 1} ${item.isPending ? 'pending-item' : ''}`}>
            <div className="user-info">
              {getAvatar(item.avatarUrl, item.fullName)}
              <div className="user-details">
                <span className="user-name">{item.fullName}</span>
                <div className="user-status">
                  <span className="user-points">{item.points ?? 0} pts</span>
                  {item.isPending && <span className="pending">Esperando...</span>}
                </div>
              </div>
            </div>
            <div className="friend-actions">
              {getPositionBadge(index + 1)}
              {!item.isCurrentUser && (
                <button 
                  className="remove-btn" 
                  onClick={() => handleRemoveFriend(item.id)}
                >
                  Quitar
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Slots vacíos */}
        {emptySlots.map((_, index) => (
          <div key={`empty-${index}`} className="friend-item empty-slot">
            <div className="user-info">
              <div className="empty-avatar"></div>
              <span className="empty-text">Disponible</span>
            </div>
          </div>
        ))}
      </div>

      {/* Solicitudes recibidas */}
      {receivedRequests.length > 0 && (
        <>
          <h2 className="requests-title">Solicitudes recibidas:</h2>
          <div className="requests-list">
            {receivedRequests.map((request) => (
              <div key={request.id} className="request-item">
                <div className="user-info">
                  {getAvatar(request.friendAvatarUrl, request.friendFullName)}
                  <div className="user-details">
                    <span className="user-name">{request.friendFullName}</span>
                    <span className="request-status">Recibido</span>
                  </div>
                </div>
                <div className="request-actions">
                  <button 
                    className="accept-btn"
                    onClick={() => handleAcceptRequest(request.id)}
                  >
                    Aceptar
                  </button>
                  <button 
                    className="decline-btn"
                    onClick={() => handleDeclineRequest(request.id)}
                  >
                    Denegar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal Agregar Amigo */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Agregar amigo</h3>
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="search-input"
            />
            
            <div className="search-results">
              {searchResults.map((user) => (
                <div key={user.id} className="search-user-item">
                  <div className="user-info">
                    {getAvatar(user.avatarUrl, user.fullName)}
                    <span className="user-name">{user.fullName}</span>
                  </div>
                  <button 
                    className="send-request-btn"
                    onClick={() => handleSendRequest(user.id)}
                  >
                    Enviar solicitud
                  </button>
                </div>
              ))}
            </div>

            <button 
              className="close-modal-btn" 
              onClick={() => setShowAddModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsPage;