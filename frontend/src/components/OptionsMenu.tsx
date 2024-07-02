import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SettingsIcon from '@mui/icons-material/Settings';
import { Tooltip } from '@mui/material';
const OptionsMenu = ({ items, handleModal }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  return (
    <>
      <div>
        <Menu
          id='basic-menu'
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          {items.map((item, index) => {
            return (
              <MenuItem
                key={index}
                onClick={() => {
                  handleClose();
                  handleModal(item);
                }}
              >
                {item}
              </MenuItem>
            );
          })}
        </Menu>
      </div>
      <Button
        variant='outlined'
        id='basic-button'
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        size='small'
      >
        <Tooltip title='Presentation Settings'>
          <SettingsIcon />
        </Tooltip>
      </Button>
    </>
  );
};
export default OptionsMenu;
