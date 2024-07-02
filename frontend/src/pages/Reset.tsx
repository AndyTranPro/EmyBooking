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
import { useNavigate, Link } from "react-router-dom";
import { AxiosError } from "axios";

const Reset = () => {
  const { displayError, displaySuccess, email } = useGlobalContext();

  const navigate = useNavigate();
  
  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (data.get("password") != data.get("confirm-password")) {
      displayError("Password confirmation is incorrect");
    } else { 
      try {
        const {
          data: { user },
        } = await request.post("/auth/reset", {
          email: email,
          password: data.get("password"),
        });
        displaySuccess("Password successfully reset");
        navigate("/login");
      } catch (err) {
        if (err instanceof AxiosError) {
          const msg = err.response!.data.msg;
          displayError(msg);
        }
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
        <Box component="form" noValidate onSubmit={handleReset} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="password"
                label="Please enter your new password"
                type="password"
                name="password"
                autoComplete="password"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="confirm-password"
                name="confirm-password"
                label="confirm-password"
                type="password"
                autoComplete="confirm-password"
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
        </Box>
      </Box>
    </Container>
  )
}

export default Reset;