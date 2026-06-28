import {
  AppBar, Badge, Box, Button, Container,
  IconButton, Toolbar, Typography,
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
];

const Layout = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', background: '#FAFAF8' }}>
      <AppBar position="sticky" elevation={0} sx={{
        background: 'rgba(250,250,248,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        color: '#0D0D0D',
      }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: '64px !important', justifyContent: 'space-between' }}>
            <Typography component={Link} to="/" sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: '1.5rem',
              fontWeight: 500,
              letterSpacing: '0.06em',
              color: '#0D0D0D',
              textDecoration: 'none',
            }}>
              OpsNova
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {navLinks.map((link) => (
                <Button key={link.to} component={Link} to={link.to} sx={{
                  color: location.pathname === link.to ? '#0D0D0D' : '#888',
                  fontSize: '0.72rem',
                  fontWeight: location.pathname === link.to ? 600 : 400,
                  letterSpacing: '0.12em',
                  px: 1.5,
                  '&:hover': { color: '#0D0D0D', background: 'transparent' },
                }}>
                  {link.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <IconButton component={Link} to="/profile" size="small" sx={{ color: '#0D0D0D' }}>
                <PersonOutlineIcon sx={{ fontSize: '1.15rem' }} />
              </IconButton>
              <IconButton component={Link} to="/cart" size="small" sx={{ color: '#0D0D0D' }}>
                <Badge badgeContent={totalItems} color="primary" sx={{
                  '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: '16px', height: '16px', background: '#C9A96E' }
                }}>
                  <ShoppingBagOutlinedIcon sx={{ fontSize: '1.15rem' }} />
                </Badge>
              </IconButton>
              {user ? (
                <Button onClick={logout} sx={{
                  ml: 1, px: 2.5, py: 0.8,
                  fontSize: '0.7rem', letterSpacing: '0.1em',
                  border: '1px solid rgba(0,0,0,0.2)',
                  color: '#0D0D0D', borderRadius: 1,
                  '&:hover': { background: '#0D0D0D', color: '#FFFFFF', border: '1px solid #0D0D0D' },
                }}>
                  Logout
                </Button>
              ) : (
                <Button component={Link} to="/login" sx={{
                  ml: 1, px: 2.5, py: 0.8,
                  fontSize: '0.7rem', letterSpacing: '0.1em',
                  border: '1px solid rgba(0,0,0,0.2)',
                  color: '#0D0D0D', borderRadius: 1,
                  '&:hover': { background: '#0D0D0D', color: '#FFFFFF', border: '1px solid #0D0D0D' },
                }}>
                  Sign In
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main">
        <Outlet />
      </Box>

      <Box component="footer" sx={{
        mt: 2.5, py: 5,
        borderTop: '1px solid rgba(0,0,0,0.07)',
        background: '#FAFAF8',
      }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              © 2026 OpsNova. All rights reserved.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Crafted with precision.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;