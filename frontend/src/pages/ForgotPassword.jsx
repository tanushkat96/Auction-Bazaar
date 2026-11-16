import React, { useState } from "react";
import { Alert, Button, Card, CardContent, Container, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "We couldn't send the reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container component="main" maxWidth="sm" className="auth-page-shell">
        <Card className="auth-flow-card">
          <CardContent>
            <span className="auth-eyebrow">ACCOUNT HELP</span>
            <Typography variant="h4" component="h1" gutterBottom>Forgot your password?</Typography>
            <Typography color="text.secondary" paragraph>
              Enter the email address on your account and we’ll send you a secure reset link.
            </Typography>
            {submitted ? (
              <Alert severity="success" className="auth-flow-alert">
                If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox and spam folder.
              </Alert>
            ) : (
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email address"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  margin="normal"
                  autoFocus
                />
                {error && <Alert severity="error" className="auth-flow-alert">{error}</Alert>}
                <Button fullWidth type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
                  {loading ? "Sending link…" : "Send reset link"}
                </Button>
              </form>
            )}
            <Typography className="auth-flow-footnote">
              Remembered it? <Link to="/login">Back to login</Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </>
  );
}
