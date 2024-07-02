import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  borderRadius: '15px',
  width: '100%',
  maxWidth: '500px',
  boxShadow: 24,
  p: 4,
};

const ConfirmModal = ({ message, handleConfirm, open, handleOptions }) => {
  const handleClose = () => handleOptions('');

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={style}>
        <Typography id='modal-modal-title' variant='h5' component='h2'>
          {message}
        </Typography>
        <br />
        <Button
          onClick={() => {
            handleConfirm();
            handleClose();
          }}
          variant='contained'
          color='error'
          size='large'
        >
          {' '}
          Yes
        </Button>
        &nbsp; &nbsp;&nbsp;
        <Button variant='contained' onClick={() => handleClose()} size='large'>
          {' '}
          No
        </Button>
      </Box>
    </Modal>
  );
};
export default ConfirmModal;
