/**
 * NavBar component - controls which tabs/pages are visible to users depending on user type
 */

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useGlobalContext } from "../utils/context";
import { AxiosError } from 'axios';
import { request } from "../utils/axios";
import { useEffect, useState } from 'react';
import NotificationSettingsModal from '../components/NotificationSettingsModal';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Badge from '@mui/material/Badge';

interface ResponsiveAppBarProps {
  numCheckIns: number;
  numRequests: number;
}



const ResponsiveAppBar: React.FC<ResponsiveAppBarProps> = ({ numCheckIns, numRequests }) => {
  const navigate = useNavigate();
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const [emailState, setEmailState] = useState({
    hasConfirmationEmail: true,
    hasNotificationEmail: true,
  });


  let pages = [];
  const { token, removeToken, displaySuccess, displayError, removeAdmin } = useGlobalContext();
  const handleCloseNotificationSettingsModal = () => setNotificationSettingsOpen(false);
  const handleOpenNotificationSettingsModal = () => {
    handleCloseUserMenu()
    setNotificationSettingsOpen(true)
  }

  const handleLogout = async () => {
    try {
      await request.get("/auth/logout");
      removeToken();
      removeAdmin();
      navigate("/login");
      displaySuccess("Successfully Logged out");
      localStorage.removeItem('filterConfig');
    } catch (err) {
      if (err instanceof AxiosError) {
        const msg = err.response!.data.error;
        displayError(msg || "Failed to logout");
      }
    }
  };
  if (token !== null) {
    pages.push('MyBookings');
    pages.push('contact');
  } else {
    pages.push('login');
  }

  if (token !== null && token.type === "admin") {
    pages.push('requests');
    pages.push('reports');
  }

  useEffect(() => {
    getUserInfo();
  }, [])


  // const pages = ['login', 'MyBookings', 'contact', 'requests','reports'];
  const settings = ['Dashboard'];
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const getUserInfo = async () => {
    try {
      const userInfoData = await request.get("/users/showMe");
      const {
        hasConfirmationEmail,
        hasNotificationEmail,
      } = userInfoData.data.user;
      setEmailState({
        hasConfirmationEmail,
        hasNotificationEmail,
      })
    } catch (err) {
      if (err instanceof AxiosError) {
        const msg = err.response!.data.msg;
        displayError(msg);
      }
    }
  }
  const handleNotificationConfirm = async () => {
    try {
      const changeResponse = await request.patch('/users/updateUser', {
        ...emailState
      })
      handleCloseNotificationSettingsModal();
      if (changeResponse.status === 200) {
        displaySuccess('Success change notification preferences')
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        const msg = err.response!.data.error;
        displayError(msg);
      }
    }
  }

  function typeOfUser() {
    if (token?.type === "admin") {
      return "Admin";
    } else if (token?.type === "hdr_student") {
      return "HDR Student";
    } else if (token?.type === "non_cse_staff") {
      return "Non CSE Staff";
    } else {
      return "CSE Staff";
    }
  }

  return (
    <AppBar position="static" >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
           */}
          <AppRegistrationIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/dashboard"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            CSE-ROOMS
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              data-testid="openNav"
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/dashboard"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            CSE-ROOMS
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {
              token &&
              <Badge badgeContent={numCheckIns} color="error" sx={{
                '& .MuiBadge-badge': {
                  transform: 'translateY(5px)',
                },
              }}>
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                  component={RouterLink}
                  to={`/myBookings`}
                >
                  myBookings
                </Button>
              </Badge>
            }
            {
              token &&
              <Button
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
                component={RouterLink}
                to={`/contact`}
              >
                Contact
              </Button>
            }
            {
              token?.type === "admin" &&
              <Badge badgeContent={numRequests} color="error" sx={{
                '& .MuiBadge-badge': {
                  transform: 'translateY(5px)',
                },
              }}>
                <Button
                  data-testid="requestBtn"
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                  component={RouterLink}
                  to={`/requests`}
                >
                  requests
                </Button>
              </Badge>
            }
            {
              token?.type === "admin" &&
              <Button
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
                component={RouterLink}
                to={`/reports`}
              >
                reports
              </Button>
            }
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {token && <b>{token?.name} ({token?.zid}) | {typeOfUser()}</b>}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton data-testid="openSet"onClick={handleOpenUserMenu} size="large" color="inherit" >
                <AccountCircle />
                {/* <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" /> */}
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
              <MenuItem data-testid="settings"
                  sx={{ textTransform: "capitalize" }}
                  onClick={handleOpenNotificationSettingsModal}
                >
                  <Typography textAlign="center">Settings</Typography>
                </MenuItem>
              <MenuItem data-testid="logoutBtn"  onClick={handleLogout}>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
          <NotificationSettingsModal
            data-testid="notificationSettingsModal"
            state={emailState}
            setState={setEmailState}
            open={notificationSettingsOpen}
            handleClose={handleCloseNotificationSettingsModal}
            handleConfirm={handleNotificationConfirm}
          />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
