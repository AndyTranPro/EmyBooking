import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { TextField, Button } from '@mui/material';

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
  borderRadius: '15px',
};

const DoubleClickModal = ({
  handleConfirm,
  handleOpen,
  open,
  properties: { type, index, ...rest },
}) => {
  const [form, setForm] = React.useState({});
  React.useEffect(() => {
    setForm({ ...rest });
  }, [type, index]);

  const handleForm = ({ target: { value, name, checked, type } }) =>
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

  const handleClose = () => handleOpen(false);

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        style={{ overflow: 'scroll' }}
      >
        <Box sx={style}>
          {Object.keys(form).map((key, index) => (
            <>
              <TextField
                rows={key === 'text' ? 3 : 0}
                fullWidth
                label={key}
                key={index}
                type='text'
                name={key}
                onChange={handleForm}
                value={form[key]}
                style={{ marginBottom: '20px' }}
              />
            </>
          ))}

          <br />
          <Button
            variant='contained'
            onClick={() => {
              handleConfirm(form, type, index);
              handleClose();
            }}
          >
            {' '}
            Change properties
          </Button>
        </Box>
      </Modal>
    </div>
  );
};
export default DoubleClickModal;
