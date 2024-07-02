import { FormEvent } from "react";
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
import { useNavigate, Link } from "react-router-dom";
import { AxiosError } from "axios";

const Recovery = () => {
  const { displayError, displaySuccess, handleOTP, handleEmail } = useGlobalContext();

  const navigate = useNavigate();
  
  const handleRecovery = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = new FormData(e.currentTarget);
      const code = Math.floor(Math.random() * 9000  + 100000);
      const {
        data: { user },
      } = await request.post("/auth/requestOTP", {
        email: data.get("email"),
        otp: code,
      });
      handleOTP(code);
      // @ts-ignore
      handleEmail(data.get("email"));
      displaySuccess("Verification link sent!");
      navigate("/OTP");
    } catch (err) {
      if (err instanceof AxiosError) {
        const msg = err.response!.data.msg;
        displayError(msg);
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
        <Typography component="h1" variant="h4">
          Reset your password
        </Typography>
        <Box component="form" noValidate onSubmit={handleRecovery} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Please enter your email address"
                name="email"
                autoComplete="email"
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Send Link
          </Button>
          <Typography component="text" variant="subtitle1" justifyContent="space-evenly">
            Enter your email address, and if there is a matching account we'll send you a link to reset your password.
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}

export default Recovery;