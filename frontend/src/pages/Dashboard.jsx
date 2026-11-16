import React, { useContext } from "react";
import { Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import AuctionProfile from "../components/AuctionProfile";
import WinningsList from "../components/WinningsList";
import YourAuctions from "../components/YourAuctions";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <>
      <Header />
      <main className="container dashboard-page-shell">
        <section className="dashboard-welcome">
          <div>
            <span className="profile-eyebrow">YOUR AUCTION SPACE</span>
            <Typography variant="h3" component="h1">Welcome back{user?.username ? `, ${user.username}` : ""}</Typography>
            <Typography>Keep track of the auctions you’ve created and the ones you’ve won.</Typography>
          </div>
        </section>

        <section className="dashboard-overview-grid" aria-label="Auction overview">
          <AuctionProfile />
          <WinningsList />
        </section>

        <section className="dashboard-owned-auctions">
          <div className="dashboard-section-heading">
            <div>
              <Typography variant="h5" component="h2">Auctions you created</Typography>
              <Typography variant="body2">Manage your listings and see their current status.</Typography>
            </div>
            <Button component={Link} to="/createauction" variant="outlined">Create another</Button>
          </div>
          <YourAuctions showHeader={false} />
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Dashboard;
