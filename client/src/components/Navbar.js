import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleProfileMenuClose();
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    return `/${user.role}-dashboard`;
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, action: () => navigate(getDashboardPath()) },
    ...(user?.role === 'patient'
      ? [{ text: 'Records', icon: <DescriptionIcon />, action: () => navigate('/patient-records') }]
      : []),
    { text: 'Logout', icon: <LogoutIcon />, action: handleLogout },
  ];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo and Brand */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #ec4899 100%)',
                borderRadius: '12px',
                p: 1,
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LocalHospitalIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #2563eb 0%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Smart Health Care
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Healthcare Excellence
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isAuthenticated ? (
                <>
                  <Typography variant="body1" color="text.secondary">
                    Welcome, <span style={{ fontWeight: 600, color: theme.palette.primary.main }}>{user?.name}</span>
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(getDashboardPath())}
                    sx={{
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.dark,
                        backgroundColor: 'rgba(37, 99, 235, 0.04)',
                      },
                    }}
                  >
                    Dashboard
                  </Button>
                  {user?.role === 'patient' && (
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/patient-records')}
                      sx={{
                        borderColor: theme.palette.secondary.main,
                        color: theme.palette.secondary.main,
                        '&:hover': {
                          borderColor: theme.palette.secondary.dark,
                          backgroundColor: 'rgba(236, 72, 153, 0.06)',
                        },
                      }}
                    >
                      Records
                    </Button>
                  )}
                  <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'linear-gradient(135deg, #2563eb 0%, #ec4899 100%)',
                        width: 40,
                        height: 40,
                        fontWeight: 600,
                      }}
                    >
                      {getUserInitials()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleProfileMenuClose}
                    PaperProps={{
                      sx: {
                        borderRadius: '12px',
                        minWidth: 200,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                      },
                    }}
                  >
                    <MenuItem onClick={() => { navigate(getDashboardPath()); handleProfileMenuClose(); }}>
                      <ListItemIcon>
                        <DashboardIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Dashboard</ListItemText>
                    </MenuItem>
                    {user?.role === 'patient' && (
                      <MenuItem onClick={() => { navigate('/patient-records'); handleProfileMenuClose(); }}>
                        <ListItemIcon>
                          <DescriptionIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Records</ListItemText>
                      </MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Logout</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    variant="text"
                    onClick={() => navigate('/login')}
                    sx={{ color: 'text.primary' }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/register')}
                    sx={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #ec4899 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #db2777 100%)',
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              onClick={() => setMobileMenuOpen(true)}
              sx={{ color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            HealthCare
          </Typography>
        </Box>
        <List sx={{ pt: 2 }}>
          {isAuthenticated ? (
            <>
              <ListItem sx={{ px: 3, py: 2 }}>
                <ListItemIcon>
                  <Avatar
                    sx={{
                      bgcolor: 'linear-gradient(135deg, #2563eb 0%, #ec4899 100%)',
                      width: 32,
                      height: 32,
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={user?.name}
                  secondary={user?.role}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
              {menuItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => {
                    item.action();
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    mx: 2,
                    my: 1,
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'primary.main' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </>
          ) : (
            <>
              <ListItem
                button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                sx={{
                  mx: 2,
                  my: 1,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main' }}>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Login" />
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}
                sx={{
                  mx: 2,
                  my: 1,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #ec4899 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #db2777 100%)',
                  },
                }}
              >
                <ListItemText primary="Get Started" sx={{ textAlign: 'center' }} />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
