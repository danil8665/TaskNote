import * as React from 'react';
import { Button, Box, Typography, Alert, Stack } from '@mui/material';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import { Global } from '@emotion/react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [shadowOffset, setShadowOffset] = React.useState({ x: 0, y: 0 });

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      localStorage.setItem('showLoginAlert', '1');
      navigate('/');
    } catch (error) {
      setError('Ошибка входа: ' + (error as Error).message);
    }
  };

  React.useEffect(() => {
    if (localStorage.getItem('showLogoutAlert') === '1') {
      setError('Ви вийшли з акаунту');
      localStorage.removeItem('showLogoutAlert');
    }
  }, []);

  return (
    <>
      <Global
        styles={{
          body: {
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
            overflow: 'hidden',
            background: 'none',
          },
          html: {
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
            overflow: 'hidden',
            background: 'none',
          },
        }}
      />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          width: '100vw',
          height: '100vh',
          minHeight: '100vh',
          minWidth: '100vw',
          background: 'linear-gradient(120deg, #181818 0%, #23272f 100%)',
          overflow: 'hidden',
          p: 0,
          m: 0,
          boxSizing: 'border-box',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 0,
        }}
      >
        <Stack
          spacing={3}
          alignItems="center"
          sx={{ width: '100%', maxWidth: 420, p: 4, bgcolor: 'transparent' }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            color="#fff"
            textAlign="center"
          >
            Вітаємо у TaskNote!
          </Typography>
          <Typography variant="subtitle1" color="#bdbdbd" textAlign="center">
            Увійдіть через Google, щоб керувати своїми завданнями
          </Typography>
          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}
          <Button
            variant="contained"
            sx={{
              background: '#8e24aa',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.1rem',
              width: '100%',
              textTransform: 'none',
              boxShadow: `${shadowOffset.x || shadowOffset.y ? `${(shadowOffset.x - 100) / 10}px ${(shadowOffset.y - 24) / 10}px 32px 0 rgba(142,36,170,0.75)` : '0 4px 32px 0 rgba(142,36,170,0.75)'}`,
              transition: 'transform 0.18s cubic-bezier(.4,2,.6,1)',
              ':hover': {
                background: '#6d1b7b',
                transform: 'scale(1.04)',
                boxShadow: `${shadowOffset.x || shadowOffset.y ? `${(shadowOffset.x - 100) / 6}px ${(shadowOffset.y - 24) / 6}px 48px 0 rgba(142,36,170,1)` : '0 8px 48px 0 rgba(142,36,170,1)'}`,
              },
              ':active': {
                transform: 'scale(0.98)',
              },
            }}
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            size="large"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setShadowOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }}
            onMouseLeave={() => setShadowOffset({ x: 0, y: 0 })}
          >
            Увійти з Google
          </Button>
        </Stack>
      </Box>
    </>
  );
}
