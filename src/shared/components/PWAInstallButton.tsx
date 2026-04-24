import { Button, IconButton, Tooltip } from "@mui/material";
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop';
import { usePWAInstall } from "@/shared/hooks/usePWAInstall";

export function PWAInstallButton({ variant = 'icon' }: { variant?: 'icon' | 'button' }) {
  const { isInstallable, install } = usePWAInstall();

  if (!isInstallable) return null;

  if (variant === 'button') {
    return (
      <Button
        variant="outlined"
        startIcon={<InstallDesktopIcon />}
        onClick={install}
        fullWidth
        sx={{ mt: 2 }}
      >
        Instalar App
      </Button>
    );
  }

  return (
    <Tooltip title="Instalar App">
      <IconButton color="primary" onClick={install}>
        <InstallDesktopIcon />
      </IconButton>
    </Tooltip>
  );
}