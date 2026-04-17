// src/shared/components/ComingSoon/ComingSoon.tsx

import { Typography, Container } from '@mui/material';

export default function ComingSoon() {
  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        py: 8,
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: '4rem',
          mb: 2,
        }}
      >
        🚧
      </Typography>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          background: 'linear-gradient(90deg, #ff7e7e, #7b96ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2,
        }}
      >
        En Construcción
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Esta sección estará disponible pronto.
      </Typography>
    </Container>
  );
}