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
const Login = () => {
  const { displayError, displaySuccess, handleToken, token } =
    useGlobalContext();

  const navigate = useNavigate();
  const checkLoggedIn = async () => {
    try {
      await request.get("/users/showMe");
      displaySuccess("Logged In");
      navigate("/dashboard");
    } catch (e) {
      console.log(e);
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
      const {
        data: { user },
      } = await request.post("/auth/login", {
        email: data.get("email"),
        password: data.get("password"),
      });
      handleToken(user);
      displaySuccess("Logged In");
      navigate("/dashboard");
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
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
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
            Login
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

export default Login;
