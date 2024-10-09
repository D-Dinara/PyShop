import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie'

const cookies = new Cookies()

const LoginPage = () => {
 const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const getSession = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/session/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }

      });
      if (!response.ok) {
        throw new Error('Failed to authenticate');
      }
      const data = await response.json();

      if (data.isauthenticated) {
        setIsAuthenticated(true);
        setUsername(data.username);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error:', error);
    }
  }

  const handleLogin = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/login/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': cookies.get('csrftoken')
        },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        throw new Error('Failed to login');
      }
      const data = await response.json();
      setIsAuthenticated(true);
      setUsername(data.username);
    } catch (error: any) {
      setError(error.message);
      console.error('Error:', error);
    }
    setLoading(false);
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': cookies.get('csrftoken')
        }
      });
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
      setIsAuthenticated(false);
      setUsername('');
      setPassword('');
    } catch (error: any) {
      setError(error.message);
      console.error('Error:', error);
    }
  }

  const handleRegister = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/register/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': cookies.get('csrftoken')
        },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        throw new Error('Failed to register');
      }
      const data = await response.json();
      setIsAuthenticated(true);
      setUsername(data.username);
    } catch (error: any) {
      setError(error.message);
      console.error('Error:', error);
    }
    setLoading(false);
  }

  useEffect(() => {
    getSession();
  }, []);

  const handleShowLoginForm = () => {
    setShowLoginForm(true);
    setShowRegisterForm(false);
  }

  const handleShowRegisterForm = () => {
    setShowRegisterForm(true);
    setShowLoginForm(false);
  }

  return (
    <>
      {loading && 
        <>
          <CircularProgress />
          <p>Loading...</p>
        </>
      }
      {isAuthenticated ? 
      <Box display='flex' width='100%' justifyContent='flex-end' gap={2}> 
        <Typography variant="h6">
          Logged in as {username}
        </Typography> 
        <Button
          variant="contained"
          onClick={handleLogout}>
          Logout
        </Button>
      </Box> :
      <Box display='flex' width='100%' flexDirection='column' gap={2}>
        <Box display='flex' width='100%' justifyContent='flex-end' gap={2}>
          <Button 
            onClick={handleShowLoginForm}
            style={showLoginForm ? {backgroundColor: 'ButtonHighlight'} : {}}>
            Login
          </Button>
          <Button
            style={showRegisterForm ? {backgroundColor: 'ButtonHighlight'} : {}}
            onClick={handleShowRegisterForm}>
              Register
          </Button>
        </Box>
        {showLoginForm &&
        <Box display='flex' gap={2} alignItems='center' justifyContent='flex-end'>
          <Typography variant="h6">
            Login
          </Typography>
            <TextField
              size='small'
              margin="normal"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: !!username || !!document.querySelector("input:-webkit-autofill"), 
                }
              }}
            />
            <TextField
              size='small'
              margin="normal"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: !!password || !!document.querySelector("input:-webkit-autofill"),
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleLogin}>
              LOGIN
            </Button>
          </Box>
          }
          {showRegisterForm &&
          <Box display='flex' gap={2} alignItems='center' justifyContent='flex-end' >
            <Typography variant="h6">
              Register
            </Typography>
              <TextField
                size='small'
                margin="normal"
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                slotProps={{
                  inputLabel: {
                    shrink: !!username || !!document.querySelector("input:-webkit-autofill"), 
                  }
                }}
              />
              <TextField
                size='small'
                margin="normal"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  inputLabel: {
                    shrink: !!password || !!document.querySelector("input:-webkit-autofill"),
                  }
                }}
              />
            <Button
              variant="contained"
              onClick={handleRegister}>
              REGISTER
            </Button>
          </Box>
          }
        </Box>
        }
        {error && <Alert severity="error">{error}</Alert>}
    </>
  );
}

  export default LoginPage;