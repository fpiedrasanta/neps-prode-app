// src/features/auth/components/OtpInput.tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { Box, styled } from '@mui/material';

interface OtpInputProps {
  length?: number;
  onChange: (code: string) => void;
  autoFocus?: boolean;
}

const OtpBox = styled('input')(() => ({
  width: 48,
  height: 56,
  fontSize: '1.5rem',
  fontWeight: 700,
  textAlign: 'center',
  borderRadius: 8,
  border: '2px solid rgba(255, 255, 255, 0.2)',
  background: 'rgba(255, 255, 255, 0.05)',
  color: '#ffffff',
  '&:focus': {
    outline: 'none',
    borderColor: '#7b96ff',
    boxShadow: '0 0 0 3px rgba(123, 150, 255, 0.2)',
  },
}));

export default function OtpInput({ length = 6, onChange, autoFocus = true }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    const fullCode = newOtp.join('');
    onChange(fullCode);

    // Auto avanzar al siguiente input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otp, length, onChange]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    const newOtp = Array(length).fill('');
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Focar el ultimo input vacio o el ultimo
    const lastFilledIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();
  }, [length, onChange]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  return (
    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
      {Array.from({ length }, (_, index) => (
        <OtpBox
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
        />
      ))}
    </Box>
  );
}