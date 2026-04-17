// src/shared/components/Button/Button.tsx

import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
}

export const Button = styled(MuiButton)<ButtonProps>(() => ({
  borderRadius: 8,
  padding: '12px 24px',
  fontWeight: 700,
  fontSize: '1.1rem',
  textTransform: 'none',
}));
