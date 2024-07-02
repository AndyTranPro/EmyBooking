import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { TextField } from "@mui/material";
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

const TextModal = ({ handleConfirm, open, label, btnName, handleOptions }) => {
  const [text, setText] = useState("");
  const handleClose = () => handleOptions("");
  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <TextField
            label={label}
            multiline
            fullWidth
            maxRows={4}
            value={text}
            onChange={({ target: { value } }) => setText(value)}
          />
          <br />
          <br />
          <Button
            disabled={text === ""}
            variant="contained"
            onClick={() => {
              handleConfirm(text);
              handleClose();
            }}
          >
            {" "}
            {btnName}
          </Button>
        </Box>
      </Modal>
    </div>
  );
};
export default TextModal;
