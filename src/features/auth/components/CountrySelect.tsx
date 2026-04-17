// src/features/auth/components/CountrySelect.tsx
import { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { getResourceUrl, API_CONFIG } from '@/shared/config/api';
import type { Country } from "@/shared/types/country.types";

interface CountrySelectProps {
  value: Country | null;
  onChange: (country: Country | null) => void;
  onCountriesLoaded?: (countries: Country[]) => void;
}

export default function CountrySelect({ value, onChange, onCountriesLoaded }: CountrySelectProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar todos los países una sola vez
  useEffect(() => {
    const loadCountries = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_CONFIG.apiUrl}/Countries/all`);
        const data = await response.json();
        setCountries(data);
        if (onCountriesLoaded) {
          onCountriesLoaded(data);
        }
      } catch (err) {
        console.error('Error cargando países:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  return (
    <Autocomplete
      options={countries}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      getOptionLabel={(option) => option.name}
      loading={loading}
      filterOptions={(options, params) => {
        const inputValue = params.inputValue.toLowerCase();
        return options.filter(c => c.name.toLowerCase().includes(inputValue));
      }}
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
          <img 
            src={getResourceUrl(option.flagUrl)!} 
            alt={option.name} 
            style={{ 
              width: 28, 
              height: 28, 
              objectFit: 'contain', 
              borderRadius: 4 
            }}
          />
          <span>{option.name}</span>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="País"
          fullWidth
          InputLabelProps={{ shrink: true }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
