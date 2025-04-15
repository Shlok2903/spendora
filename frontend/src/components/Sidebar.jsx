import { useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemButton,
  Divider, 
  IconButton, 
  Box, 
  Avatar, 
  Typography,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  CurrencyRupee as RupeeIcon, 
  AccountBalance as IncomeIcon, 
  Category as CategoryIcon, 
  Settings as SettingsIcon, 
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Chat as ChatIcon,
  KeyboardArrowRight as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Drawer width
const drawerWidth = 250;

const Sidebar = ({ open, setOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/app/dashboard' },
    { text: 'Expenses', icon: <RupeeIcon />, path: '/app/expenses' },
    { text: 'Income', icon: <IncomeIcon />, path: '/app/income' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/app/categories' },
    { text: 'Chat', icon: <ChatIcon />, path: '/app/chat', badge: 2 },
    { text: 'Settings', icon: <SettingsIcon />, path: '/app/settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Successfully logged out. See you again soon!');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || 
           location.pathname === path.replace('/app/', '/') || 
           (location.pathname === '/app' && path === '/app/dashboard');
  };

  const drawer = (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
    >
      {/* App Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(2, 3),
          justifyContent: isMobile ? 'space-between' : 'center',
          height: 70,
        }}
      >
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            fontWeight: 700, 
            color: 'primary.main',
            letterSpacing: '-0.5px',
            fontFamily: 'Blauer Nue, sans-serif',
          }}
        >
          Spendora
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      
      {/* User profile section */}
      <Box 
        sx={{ 
          padding: theme.spacing(3, 2), 
          display: 'flex', 
          alignItems: 'center', 
          mb: 1,
        }}
      >
        <Avatar 
          src={user?.profile_image}
          sx={{ 
            width: 46, 
            height: 46, 
            mr: 2, 
            bgcolor: 'primary.main',
            boxShadow: '0px 3px 8px rgba(17, 187, 229, 0.3)',
            border: '2px solid #fff',
          }}
        >
          {user?.first_name?.charAt(0) || 'U'}
        </Avatar>
        <Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600,
              fontFamily: 'Blauer Nue, sans-serif',
            }}
          >
            {user ? `${user.first_name} ${user.last_name}` : 'User'}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              fontSize: '0.8rem',
              opacity: 0.8,
            }}
          >
            {user?.email || 'user@example.com'}
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Navigation list */}
      <List 
        sx={{ 
          flexGrow: 1, 
          pt: 2,
          px: 1.5,
        }}
      >
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem 
              key={item.text} 
              disablePadding
              sx={{ 
                mb: 1,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Tooltip title={open ? '' : item.text} placement="right">
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={active}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: -4,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 4,
                        height: '70%',
                        backgroundColor: 'white',
                        borderRadius: '0 4px 4px 0',
                      },
                    },
                    '&:hover': {
                      backgroundColor: active ? 'primary.main' : 'rgba(17, 187, 229, 0.08)',
                      transform: 'translateX(2px)',
                      '& .MuiListItemIcon-root': {
                        color: active ? 'white' : 'primary.main',
                      },
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: active ? 'white' : 'inherit',
                      minWidth: 46,
                    }}
                  >
                    {item.badge ? (
                      <Badge badgeContent={item.badge} color="error" 
                        sx={{
                          '& .MuiBadge-badge': {
                            right: -3,
                            top: 3,
                          }
                        }}
                      >
                        {item.icon}
                      </Badge>
                    ) : item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontFamily: 'Blauer Nue, sans-serif',
                      fontWeight: active ? 600 : 500, 
                      fontSize: '0.95rem',
                    }} 
                  />
                  {active && <ArrowIcon fontSize="small" sx={{ color: 'white', opacity: 0.7 }} />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
      
      <Box sx={{ p: 2, mb: 1 }}>
        <Divider sx={{ mb: 2 }} />
        
        {/* Logout button */}
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: 1.2,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                color: 'error.main',
                transform: 'translateX(2px)',
                '& .MuiListItemIcon-root': {
                  color: 'error.main',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 46 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ 
                fontFamily: 'Blauer Nue, sans-serif',
                fontWeight: 500, 
                fontSize: '0.95rem' 
              }} 
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile hamburger menu button */}
      {isMobile && !open && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          edge="start"
          sx={{ 
            mr: 2, 
            display: { sm: 'none' },
            position: 'fixed',
            top: 10,
            left: 10,
            zIndex: 1100,
            bgcolor: 'background.paper',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            '&:hover': {
              bgcolor: 'background.paper',
            }
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      
      <Box
        component="nav"
        sx={{ 
          width: { md: drawerWidth }, 
          flexShrink: { md: 0 },
        }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={open}
          onClose={handleDrawerToggle}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: isMobile ? '0 0 20px rgba(0,0,0,0.1)' : 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};

export default Sidebar; 