/**
 * Contact Component
 * 
 * This component provides a feedback form for users to send messages or feedback to the admins.
 * It handles user authentication, displays a form for feedback, and manages form submission.
 */

import { FormEvent, useEffect } from "react";
import { useGlobalContext } from "../utils/context";
import { request } from "../utils/axios";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
const Contact = () => {
  const { displayError, displaySuccess } =
    useGlobalContext();
  const navigate = useNavigate();
  // Need to properly implement this
  const checkLoggedIn = async () => {
    try {
      await request.get("/users/showMe");
    } catch (e) {
      navigate("/login");
    }
  };
  useEffect(() => {
    checkLoggedIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = new FormData(e.currentTarget);
      const feedback = data.get("feedback");
      await request.post("/bookings/sendFeedback", {
        feedback
      });
      displaySuccess("Sent!");
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof AxiosError) {
        const msg = err.response!.data.msg;
        displayError(msg);
        navigate("/dashboard");
      }
    }
  };
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Contact us
        </Typography>
        <Typography component="h1" variant="body1">
          Leave a message for the admins on any thoughts or feedback, or any help you might need!
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                placeholder="Please provide any feedback..."
                multiline
                rows={5}
                maxRows={Infinity}
                id="feedback"
                name="feedback"
                autoComplete="feedback"
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Submit
          </Button>
          <Grid container justifyContent="space-between">
            {/* Forgot password section if ever we need it
            <Grid item>
              <Link to="/recovery">Forgot password?</Link>
            </Grid> */}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Contact;
