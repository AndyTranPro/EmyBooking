import * as React from 'react';
import Box from '@mui/material/Box';

import Modal from '@mui/material/Modal';
import { TextField, Checkbox, FormControlLabel, Button } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  borderRadius: '15px',
  p: 4,
};

const CreateElementModal = ({
  handleConfirm,
  properties,
  type,
  handleClose,
}) => {
  const [form, setForm] = React.useState({});

  React.useEffect(() => {
    if (properties) {
      const obj = properties.reduce(
        (acc, cur) => ({ ...acc, [cur]: cur === 'autplay' ? true : '' }),
        {}
      );
      setForm(obj);
    }
  }, [type]);
  const handleForm = ({ target: { value, name, type, checked } }) =>
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

  return (
    <>
      <div>
        <Modal
          open={Boolean(type)}
          onClose={handleClose}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
          style={{ overflow: 'scroll' }}
        >
          <Box sx={style}>
            {Object.keys(form).map((key, index) => (
              <>
                {key === 'autoplay' && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(form[key])}
                        onChange={handleForm}
                        inputProps={{ 'aria-label': 'controlled' }}
                        name='autoplay'
                      />
                    }
                    label='Autoplay'
                  />
                )}
                {key !== 'autoplay' && (
                  <TextField
                    name={key}
                    onChange={handleForm}
                    value={form[key]}
                    multiline={key === 'text'}
                    label={key}
                    id={key}
                    key={index}
                    rows={key === 'text' ? 8 : 0}
                    fullWidth
                    style={{ textAlign: 'centre', marginBottom: '30px' }}
                  />
                )}
              </>
            ))}

            <br />
            <Button
              onClick={() => {
                handleConfirm(form);
                handleClose();
              }}
              variant='contained'
            >
              {' '}
              Insert {type}
            </Button>
          </Box>
        </Modal>
      </div>
    </>
  );
};
export default CreateElementModal;
