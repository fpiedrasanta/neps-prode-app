// src/features/social/components/PostCard.tsx

import { useState } from 'react';
import { Card, CardContent, Box, Typography, Avatar, Input } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { Post, PostComment } from '@/shared/types';
import { postsService } from '../services/postsService';
import { getResourceUrl } from '@/shared/config/api';

interface PostCardProps {
  post: Post;
}

const StyledCard = styled(Card)(() => ({
  maxWidth: 480,
  width: '100%',
  borderRadius: 12,
  border: '2px dashed rgba(255, 255, 255, 0.1)',
  background: 'transparent',
  overflow: 'visible',
  margin: '0 auto',
}));

const CardHeader = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  mb: 2,
}));

const UserInfo = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 0.25,
}));

const TeamInfo = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: '0.9rem',
  fontWeight: 600,
}));

const Flag = styled('img')(() => ({
  width: 24,
  height: 24,
  objectFit: 'contain',
  borderRadius: 2,
}));

const ScoreBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
  my: 1,
}));

const ScoreDisplay = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  fontSize: '1.1rem',
  fontWeight: 700,
}));

const getAvatar = (post: Post) => {
  if (post.userAvatarUrl) {
    return (
      <Avatar 
         src={getResourceUrl(post.userAvatarUrl)} 
        alt={post.userFullName}
        sx={{ width: 44, height: 44 }}
      />
    );
  }
  return (
    <Avatar 
      sx={{ 
        width: 44, 
        height: 44, 
        bgcolor: 'primary.main',
        fontWeight: 700,
        fontSize: '1rem',
      }}
    >
      {post.userFullName.substring(0, 2).toUpperCase()}
    </Avatar>
  );
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};


export default function PostCard({ post }: PostCardProps) {
  const [comments, setComments] = useState<PostComment[]>(post.comments);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!commentInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newComment = await postsService.createComment(post.id, commentInput.trim());
      setComments(prev => [...prev, newComment]);
      setCommentInput('');
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitComment();
    }
  };

  return (
    <StyledCard elevation={0}>
      <CardContent sx={{ p: 2 }}>
        {/* Header con usuario y fecha */}
        <CardHeader>
          {getAvatar(post)}
          <UserInfo>
            <Typography variant="subtitle2" fontWeight={600}>
              {post.userFullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(post.createdAt)}
            </Typography>
          </UserInfo>
        </CardHeader>


        {/* Preview del partido */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr auto 1fr', 
          alignItems: 'center', 
          gap: 2,
          mb: 2,
          mt: '40px',
          width: '100%'
        }}>
          {/* LOCAL: Bandera + Equipo a la izquierda */}
          <TeamInfo sx={{ justifyContent: 'flex-start' }}>
             <Flag src={getResourceUrl(post.homeTeamFlagUrl)} alt={post.homeTeamName} />
            <Typography variant="body2" component="span">
              {post.homeTeamName}
            </Typography>
          </TeamInfo>
          
          {/* VS: Perfectamente centrado en toda la card */}
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', minWidth: '30px' }}>
            vs
          </Typography>
          
          {/* VISITANTE: Equipo + Bandera a la derecha */}
          <TeamInfo sx={{ justifyContent: 'flex-end', width: '100%' }}>
            <Typography variant="body2" component="span" sx={{ textAlign: 'right', width: '100%' }}>
              {post.awayTeamName}
            </Typography>
            <Flag src={getResourceUrl(post.awayTeamFlagUrl)} alt={post.awayTeamName} />
          </TeamInfo>
        </Box>

        {/* Marcador del partido */}
        <ScoreBox>
          <ScoreDisplay>
            <span>{post.homeScore}</span>
            <Typography variant="h6" color="text.secondary">-</Typography>
            <span>{post.awayScore}</span>
          </ScoreDisplay>
        </ScoreBox>

        {/* Pronóstico */}
        <Box sx={{ mt: '32px', mb: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Pronóstico de {post.userFullName}: {post.homePrediction} - {post.awayPrediction}
          </Typography>
        </Box>

        {/* Puntos obtenidos */}
        <Box sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: post.pointsEarned >= 0 ? '#4caf50' : '#ff5252',
              fontWeight: 600
            }}
          >
            {post.pointsEarned >= 0 
              ? `¡${post.userFullName} obtuvo ${post.pointsEarned} puntos! 😊` 
              : `¡${post.userFullName} perdió ${post.pointsEarned * -1} puntos! 😢`
            }
          </Typography>
        </Box>

        {/* Comentarios */}
        {comments.length > 0 && (
          <Box sx={{ mt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)', pt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Comentarios
            </Typography>
            {comments.map((comment, index) => (
              <Box key={comment.id || index} sx={{ mb: 2, pb: 2, borderBottom: index < comments.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  {comment.userAvatarUrl ? (
                   <Avatar src={getResourceUrl(comment.userAvatarUrl)} alt={comment.userFullName} sx={{ width: 32, height: 32 }} />
                  ) : (
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                      {comment.userFullName.substring(0, 2).toUpperCase()}
                    </Avatar>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {comment.userFullName}
                    </Typography>
                    <Typography component="span" variant="caption" color="text.secondary">
                      - {formatDate(comment.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.primary">
                  {comment.content}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Input de comentario */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Input
              fullWidth
              disableUnderline
              placeholder="Escribe un comentario..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting}
              sx={{
                flex: 1,
                p: 1,
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 8,
                color: '#ffffff',
                '&::placeholder': {
                  color: '#a0a0a0',
                },
              }}
            />
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: 40, 
                height: 40, 
                bgcolor: 'primary.main', 
                borderRadius: 8, 
                cursor: commentInput.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                opacity: commentInput.trim() && !isSubmitting ? 1 : 0.5,
              }}
              onClick={handleSubmitComment}
            >
              <Typography variant="body2" color="white">
                ➤
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
}
