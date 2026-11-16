import React, { useContext, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { Alert, Button, Card, CardContent, CardHeader, Typography } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuctionProfile from "../components/AuctionProfile";
import YourAuctions from "../components/YourAuctions";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const formattedDate = (value, pattern) => {
  if (!value) return "";
  const date = typeof value === "string" ? parseISO(value) : new Date(value);
  return isValid(date) ? format(date, pattern) : "";
};

export default function Profile() {
  const { user, loggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [deleteError, setDeleteError] = useState("");

  if (!loggedIn || !user) {
    return (
      <>
        <Header />
        <div className="container profile-page-shell">
          <Alert severity="info">Please log in to view your profile.</Alert>
        </div>
        <Footer />
      </>
    );
  }

  const initials = (user.username || user.email || "U")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Delete your account? This action cannot be undone.");
    if (!confirmed) return;

    setDeleteError("");
    try {
      await axios.delete(`http://localhost:8080/api/admin/users/${user.id}`);
      toast.success("Account deleted successfully", { position: "top-center", autoClose: 2000 });
      logout();
      navigate("/");
    } catch (error) {
      console.error("Error deleting user:", error);
      setDeleteError("We couldn’t delete your account. Please try again later.");
    }
  };

  const createdAt = formattedDate(user.createdAt, "MMMM d, yyyy");
  const lastLogin = formattedDate(user.lastLogin, "MMMM d, yyyy · h:mm a");

  return (
    <>
      <Header />
      <main className="container profile-page-shell">
        <section className="profile-welcome-card">
          <div className="profile-avatar" aria-hidden="true">{initials}</div>
          <div className="profile-welcome-copy">
            <span className="profile-eyebrow">YOUR ACCOUNT</span>
            <Typography component="h1" variant="h4">{user.username || "Your profile"}</Typography>
            <Typography>{user.email}</Typography>
          </div>
          <Button variant="contained" onClick={() => navigate("/editprofile")}>Edit profile</Button>
        </section>

        <section className="profile-grid">
          <Card className="profile-details-card">
            <CardHeader title="Account details" subheader="Your registered account information" />
            <CardContent>
              <div className="profile-detail-row">
                <span>Username</span><strong>{user.username || "—"}</strong>
              </div>
              <div className="profile-detail-row">
                <span>Email</span><strong>{user.email || "—"}</strong>
              </div>
              {createdAt && <div className="profile-detail-row"><span>Member since</span><strong>{createdAt}</strong></div>}
              {lastLogin && <div className="profile-detail-row"><span>Last login</span><strong>{lastLogin}</strong></div>}
              <Button variant="outlined" onClick={() => navigate("/resetpassword")} sx={{ mt: 2 }}>
                Change password
              </Button>
            </CardContent>
          </Card>

          <AuctionProfile />
        </section>

        <Card className="profile-created-auctions">
          <CardHeader title="Auctions you created" subheader="This list contains only your own auctions." />
          <YourAuctions showHeader={false} />
        </Card>

        <section className="profile-danger-zone">
          <div>
            <Typography variant="h6">Delete account</Typography>
            <Typography variant="body2">Permanently remove your account and profile.</Typography>
          </div>
          <Button variant="outlined" color="error" onClick={handleDeleteAccount}>Delete account</Button>
        </section>
        {deleteError && <Alert severity="error" className="auth-flow-alert">{deleteError}</Alert>}
      </main>
      <Footer />
    </>
  );
}
