import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext for global state
import { toast } from "react-toastify"; // Import Toastify for notifications
import "./style.css";

export default function Header() {
  const { loggedIn, logout } = useContext(AuthContext); // Access login state and logout function from AuthContext
  const { pathname } = useLocation();
  const activeClass = (paths) => paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    toast.success("Logged out successfully!", { position: "top-center", autoClose: 2000 }); // Show success toast
  };

  return (
    <header className="shadow-sm headm">
      <div className="container d-flex justify-content-between auction-nav-inner">
        <Link to="/" className="auction-brand">
          <span className="auction-brand-mark" aria-hidden="true">⌁</span>
          AuctionBazaar
        </Link>
        <nav className="auction-nav-links d-flex gap-2">
          {loggedIn ? (
            <div className="d-flex gap-3">
              
              <Button
                variant="outlined"
                component={Link}
                to="/dashboard"
                className={`btn btn-outline-primary auction-nav-button${activeClass(["/dashboard"]) ? " is-active" : ""}`}
                aria-current={activeClass(["/dashboard"]) ? "page" : undefined}
              >
                Dashboard
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to="/createauction"
                className={`btn btn-outline-primary auction-nav-button${activeClass(["/createauction", "/editauction"]) ? " is-active" : ""}`}
                aria-current={activeClass(["/createauction", "/editauction"]) ? "page" : undefined}
              >
                Create Auction
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to="/auctions"
                className={`btn btn-outline-primary auction-nav-button${activeClass(["/auctions"]) ? " is-active" : ""}`}
                aria-current={activeClass(["/auctions"]) ? "page" : undefined}
              >
                Browse Auctions
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to="/profile"
                className={`btn btn-outline-primary auction-nav-button${activeClass(["/profile", "/editprofile", "/resetpassword"]) ? " is-active" : ""}`}
                aria-current={activeClass(["/profile", "/editprofile", "/resetpassword"]) ? "page" : undefined}
              >
                Profile
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
                className="btn btn-outline-danger"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="d-flex gap-3">
              <Button
                variant="outlined"
                component={Link}
                to="/login"
                className="btn btn-outline-primary"
              >
                Login
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to="/signup"
                className="btn btn-outline-primary"
              >
                Sign Up
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
