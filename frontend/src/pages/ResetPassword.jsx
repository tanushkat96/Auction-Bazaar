import React, { useContext, useState } from "react";
import { Alert, Button, Card, CardContent, Container, TextField, Typography } from "@mui/material";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function ResetPassword() {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get("token");
  const isProfileChange = location.pathname.toLowerCase() === "/resetpassword";
  const isRecovery = !isProfileChange;
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("The passwords don’t match.");
      return;
    }

    setLoading(true);
    try {
      if (isRecovery) {
        await api.post("/auth/reset-password", { token, newPassword });
      } else {
        await api.post("/auth/change-password", {
          userId: user?.id,
          currentPassword,
          newPassword,
        });
      }
      setSuccess(true);
      if (!isRecovery) {
        window.setTimeout(() => navigate("/profile"), 1200);
      }
    } catch (requestError) {
      const message = requestError.response?.data;
      setError(typeof message === "string" ? message : message?.message || "Password update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const title = isRecovery ? "Choose a new password" : "Change your password";

  return (
    <>
      <Header />
      <Container component="main" maxWidth="sm" className="auth-page-shell">
        <Card className="auth-flow-card">
          <CardContent>
            <span className="auth-eyebrow">ACCOUNT SECURITY</span>
            <Typography variant="h4" component="h1" gutterBottom>{success ? "Password updated" : title}</Typography>
            {success ? (
              <>
                <Alert severity="success" className="auth-flow-alert">
                  {isRecovery ? "Your password has been reset. You can now sign in with it." : "Your password was changed successfully."}
                </Alert>
                <Button component={Link} to={isRecovery ? "/login" : "/profile"} variant="contained" fullWidth sx={{ mt: 2 }}>
                  {isRecovery ? "Go to login" : "Return to profile"}
                </Button>
              </>
            ) : isRecovery && !token ? (
              <>
                <Alert severity="warning" className="auth-flow-alert">
                  This reset link is missing its token. Request a new link to continue.
                </Alert>
                <Button component={Link} to="/forgot-password" variant="contained" fullWidth sx={{ mt: 2 }}>
                  Request a reset link
                </Button>
              </>
            ) : (
              <>
                <Typography color="text.secondary" paragraph>
                  {isRecovery ? "Create a strong password you haven’t used here before." : "Confirm your current password, then choose a new one."}
                </Typography>
                <form onSubmit={handleSubmit}>
                  {!isRecovery && (
                    <TextField
                      fullWidth required margin="normal" label="Current password" type="password"
                      autoComplete="current-password" value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                    />
                  )}
                  <TextField
                    fullWidth required margin="normal" label="New password" type="password"
                    autoComplete="new-password" inputProps={{ minLength: 8 }}
                    value={newPassword} onChange={(event) => setNewPassword(event.target.value)}
                  />
                  <Typography className="password-hint">Use at least 8 characters.</Typography>
                  <TextField
                    fullWidth required margin="normal" label="Confirm new password" type="password"
                    autoComplete="new-password" inputProps={{ minLength: 8 }}
                    value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                  {error && <Alert severity="error" className="auth-flow-alert">{error}</Alert>}
                  <Button fullWidth type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
                    {loading ? "Updating password…" : "Update password"}
                  </Button>
                </form>
                <Typography className="auth-flow-footnote">
                  {isRecovery ? <Link to="/login">Back to login</Link> : <Link to="/profile">Cancel and return to profile</Link>}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </>
  );
}
