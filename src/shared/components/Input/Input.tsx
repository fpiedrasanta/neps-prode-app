// src/shared/components/Input/Input.tsx

import { TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Input = styled(TextField)<TextFieldProps>(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    backgroundColor: '#121216',
    color: '#ffffff',
  },
  '& .MuiInputLabel-root': {
    color: '#a0a0a0',
    '&.Mui-focused': {
      color: '#7b96ff',
    },
  },
  '& .MuiInputBase-input': {
    color: '#ffffff',
  },
}));