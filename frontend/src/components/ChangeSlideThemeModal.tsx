import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Typography } from '@mui/material';
import { HexColorPicker } from 'react-colorful';
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflow: 'scroll',
};

const ChangeSlideThemeModal = ({ handleConfirm, open, handleOptions }) => {
  const [form, setForm] = useState({
    curSlideTheme: '',
    defaultSlideTheme: '',
  });

  const handleClose = () => handleOptions('');

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        style={{ overflow: 'scroll', flexDirection: 'column' }}
      >
        <Box sx={style}>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Current slides Theme
          </Typography>
          <br />
          <HexColorPicker
            color={form.curSlideTheme}
            onChange={(v) => setForm((prev) => ({ ...prev, curSlideTheme: v }))}
          />
          <br />
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Default Slide Theme
          </Typography>
          <br />
          <HexColorPicker
            color={form.defaultSlideTheme}
            onChange={(v) =>
              setForm((prev) => ({ ...prev, defaultSlideTheme: v }))
            }
          />
          <br />
          <Button
            variant='contained'
            onClick={() => {
              handleConfirm(form);
              handleClose();
            }}
          >
            {' '}
            Update colors
          </Button>
        </Box>
      </Modal>
    </div>
  );
};
export default ChangeSlideThemeModal;
