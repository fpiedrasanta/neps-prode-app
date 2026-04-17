// src/features/matches/components/MatchCard.tsx

import { useState } from 'react';
import { Card, CardContent, Box, Typography, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { Match } from '@/shared/types';
import { predictionsService, type PredictionError } from '../services/predictionsService';
import { getResourceUrl } from '@/shared/config/api';

interface MatchCardProps {
  match: Match;
  onUpdate?: () => void;
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

const ScoreInput = styled('input')(() => ({
  width: 40,
  height: 40,
  textAlign: 'center',
  fontSize: '1.2rem',
  fontWeight: 700,
  border: '2px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 8,
  background: 'rgba(255, 255, 255, 0.05)',
  color: '#ffffff',
  '&:focus': {
    outline: 'none',
    borderColor: '#7b96ff',
  },
  '&:disabled': {
    opacity: 0.5,
  },
}));

const StatsPieChart = styled(Box)(() => ({
  width: 60,
  height: 60,
  position: 'relative',
}));

const MatchInfo = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
  mt: 1,
}));

const InfoRow = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  fontSize: '0.8rem',
  color: '#a0a0a0',
}));

export default function MatchCard({ match, onUpdate }: MatchCardProps) {
  const { id, homeTeam, awayTeam, matchDate, city, country, homeScore, awayScore, userPrediction, predictionStats, status } = match;
  const [homeGoals, setHomeGoals] = useState<string>(userPrediction?.homeGoals?.toString() ?? '');
  const [awayGoals, setAwayGoals] = useState<string>(userPrediction?.awayGoals?.toString() ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Determinar estado del partido basado en status
  const isUpcoming = status === 1 || status === null;  // Próximo
  const isLive = status === 2;  // En juego
  const isFinished = status === 3;  // Finalizado
  const hasPrediction = userPrediction !== null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit', 
      minute: '2-digit',
      // Sin timeZone = usa automáticamente la zona horaria local del cliente
    });
  };

  // Crear gráfico de torta simple con conic-gradient
  const pieChartStyle = {
    background: `conic-gradient(
      #7b96ff 0% ${predictionStats.homeWinPercentage}%,
      #a0a0a0 ${predictionStats.homeWinPercentage}% ${predictionStats.homeWinPercentage + predictionStats.drawPercentage}%,
      #ff7e7e ${predictionStats.homeWinPercentage + predictionStats.drawPercentage}% 100%
    )`,
    borderRadius: '50%',
  };

  return (
    <StyledCard elevation={0}>
      <CardContent sx={{ p: 2 }}>
        {/* Encabezado del partido */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr auto 1fr', 
          alignItems: 'center', 
          gap: 2,
          mb: 2,
          width: '100%'
        }}>
          {/* LOCAL: Bandera + Equipo a la izquierda */}
          <TeamInfo sx={{ justifyContent: 'flex-start' }}>
            <Flag src={getResourceUrl(homeTeam.flagUrl)} alt={homeTeam.name} />
            <Typography variant="body2" component="span">
              {homeTeam.name}
            </Typography>
          </TeamInfo>
          
          {/* VS: Perfectamente centrado en toda la card */}
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', minWidth: '30px' }}>
            vs
          </Typography>
          
          {/* VISITANTE: Equipo + Bandera a la derecha */}
          <TeamInfo sx={{ justifyContent: 'flex-end', width: '100%' }}>
            <Typography variant="body2" component="span" sx={{ textAlign: 'right', width: '100%' }}>
              {awayTeam.name}
            </Typography>
            <Flag src={getResourceUrl(awayTeam.flagUrl)} alt={awayTeam.name} />
          </TeamInfo>
        </Box>

        {/* Marcador / Pronóstico según estado */}
        {isFinished ? (
          <>
            {/* Resultado final (siempre mostrar para partidos terminados) */}
            <Box sx={{ textAlign: 'center', mb: 1 }}>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                Resultado
              </Typography>
              <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mt: 0.5 }}>
                {homeScore} - {awayScore}
              </Typography>
              {/* Mostrar pronóstico y puntos solo si existe */}
              {hasPrediction && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Tu pronóstico: {userPrediction.homeGoals} - {userPrediction.awayGoals}
                  </Typography>
                   {userPrediction.points !== null && (
                     <Typography 
                       variant="caption" 
                       fontWeight={600}
                       sx={{ 
                         color: userPrediction.points < 0 ? '#ff4444' : '#44ff44'
                       }}
                     >
                       {userPrediction.points < 0 ? `-1` : `+${userPrediction.points}`} puntos
                     </Typography>
                   )}
                </Box>
              )}
            </Box>
          </>
        ) : isUpcoming ? (
          // Próximo - Permite editar
          <>
            <ScoreBox>
              <ScoreInput
                type="number"
                value={homeGoals}
                onChange={(e) => setHomeGoals(e.target.value)}
                disabled={isSubmitting}
                aria-label="Goles local"
                min="0"
                max="99"
              />
              <Typography variant="h6" color="text.secondary">
                -
              </Typography>
              <ScoreInput
                type="number"
                value={awayGoals}
                onChange={(e) => setAwayGoals(e.target.value)}
                disabled={isSubmitting}
                aria-label="Goles visitante"
                min="0"
                max="99"
              />
            </ScoreBox>

            {/* Botón de guardar/editar pronóstico */}
            <Box sx={{ textAlign: 'center', mt: 1, mb: 1 }}>
              {submitError && (
                <Typography variant="caption" color="error.main" sx={{ display: 'block', mb: 1 }}>
                  {submitError}
                </Typography>
              )}
              <Button
                variant="contained"
                disabled={isSubmitting || homeGoals === '' || awayGoals === ''}
                onClick={async () => {
                  if (homeGoals === '' || awayGoals === '') return;
                  
                  const predictionId = userPrediction?.Id || userPrediction?.id;
                  
                  setIsSubmitting(true);
                  setSubmitError(null);
                  
                  try {
                    if (predictionId) {
                      await predictionsService.updatePrediction(
                        predictionId,
                        parseInt(homeGoals, 10),
                        parseInt(awayGoals, 10)
                      );
                    } else {
                      await predictionsService.createPrediction({
                        matchId: id,
                        homeGoals: parseInt(homeGoals, 10),
                        awayGoals: parseInt(awayGoals, 10),
                      });
                    }
                    onUpdate?.();
                  } catch (err) {
                    const error = err as PredictionError;
                    setSubmitError(error.message);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                sx={{
                  background: 'linear-gradient(90deg, #ff7e7e, #7b96ff)',
                  '&:hover': { opacity: 0.9 },
                  '&:disabled': { opacity: 0.6 },
                }}
              >
                {isSubmitting ? <CircularProgress size={24} /> : hasPrediction ? 'Actualizar' : 'Guardar'}
              </Button>
            </Box>

            {/* Mostrar pronóstico guardado */}
            {hasPrediction && (
              <Box sx={{ textAlign: 'center', mt: 1, mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Tu pronóstico: {userPrediction.homeGoals} - {userPrediction.awayGoals}
                </Typography>
              </Box>
            )}
          </>
        ) : isLive ? (
          // En juego - Solo muestra el pronóstico, no permite editar
          <>
            {hasPrediction && (
              <Box sx={{ textAlign: 'center', mt: 1, mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Tu pronóstico: {userPrediction.homeGoals} - {userPrediction.awayGoals}
                </Typography>
              </Box>
            )}
          </>
        ) : null}

        {/* Información del partido */}
        <MatchInfo>
          <InfoRow>
            <span>📅</span>
            <Typography variant="caption">
              {formatDate(matchDate)}
            </Typography>
          </InfoRow>
          
          <InfoRow>
            <span>📍</span>
            <Typography variant="caption">
              {city?.name}, {country?.name}
            </Typography>
          </InfoRow>

          {/* Estadísticas de predicciones */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, mb: 1 }}>
            <StatsPieChart style={pieChartStyle} />
          </Box>
          
          {/* Leyenda de estadísticas */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              <Box component="span" sx={{ color: '#7b96ff', fontWeight: 600 }}>{homeTeam.name}</Box>: {predictionStats.homeWinPercentage}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              -
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Empate: {predictionStats.drawPercentage}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              -
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <Box component="span" sx={{ color: '#ff7e7e', fontWeight: 600 }}>{awayTeam.name}</Box>: {predictionStats.awayWinPercentage}%
            </Typography>
          </Box>
        </MatchInfo>
      </CardContent>
    </StyledCard>
  );
}