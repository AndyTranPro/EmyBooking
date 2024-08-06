/**
 * Notificationsettingsmodal - notifications setting modal - preferred/non-preferred methods of contactr
 */

import Box from "@mui/material/Box";
import { 
  Button,
  IconButton, 
  Modal, 
  Checkbox, 
  FormControlLabel, 
  FormControl,
  FormLabel,
  FormGroup,
  } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "100%",
  maxWidth: "500px",
  bgcolor: "background.paper",
  borderRadius: "15px",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
interface NotificationState {
  hasConfirmationEmail: boolean,
  hasNotificationEmail: boolean,
}
interface NotificationModalProps {
  open: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  state: NotificationState,
  setState: (state: NotificationState) => void;
}

const TextModal: React.FC<NotificationModalProps> = ({ state, setState, open, handleClose, handleConfirm }) => {
  // @ts-expect-error do not know type
  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
        <IconButton
          onClick={() => {
            handleClose();
          }}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          data-testid='Modal close button'
        >
          <CloseIcon />
        </IconButton>
          <FormControl component="fieldset">
            <FormLabel component="legend">Notification Setting</FormLabel>
            <br />
            <FormGroup data-testid="hasConfirmationEmail">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.hasConfirmationEmail}
                    onChange={handleChange}
                    name="hasConfirmationEmail"
                    color="primary"
                    aria-label='hasConfirmationEmail'
                  />
                }
                label="Receive Confirmation Email"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.hasNotificationEmail}
                    onChange={handleChange}
                    name="hasNotificationEmail"
                    color="primary"
                  />
                }
                label="Receive Notification Email"
              />
            </FormGroup>
          </FormControl>
          <br />
          <br />
          <Button
            variant="contained"
            onClick={handleConfirm}
          >
            CONFIRM
          </Button>
        </Box>
      </Modal>
    </div>
  );
};
export default TextModal;
