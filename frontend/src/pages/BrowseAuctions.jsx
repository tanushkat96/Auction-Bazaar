import React, { useContext, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardActions, CardContent, CardHeader, Chip, Grid, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";

const filters = ["All", "Live", "Upcoming", "Ended"];

function getStatus(auction, now) {
  const startsAt = new Date(auction.startTime).getTime();
  const endsAt = new Date(auction.endTime).getTime();
  if (Number.isFinite(startsAt) && startsAt > now) return "Upcoming";
  if (Number.isFinite(endsAt) && endsAt >= now) return "Live";
  return "Ended";
}

export default function BrowseAuctions() {
  const { loggedIn, user } = useContext(AuthContext);
  const [auctions, setAuctions] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [bidValues, setBidValues] = useState({});
  const [bidErrors, setBidErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    axios.get("http://localhost:8080/api/admin/auctions")
      .then((response) => {
        if (active) setAuctions(Array.isArray(response.data) ? response.data : []);
      })
      .catch((requestError) => {
        console.error("Could not load auctions:", requestError);
        if (active) setError("Auctions couldn’t be loaded. Check that the API is running, then try again.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleAuctions = useMemo(() => {
    const now = Date.now();
    const query = search.trim().toLowerCase();
    return auctions
      .map((auction) => ({ ...auction, displayStatus: getStatus(auction, now) }))
      .filter((auction) => filter === "All" || auction.displayStatus === filter)
      .filter((auction) => !query || `${auction.title || ""} ${auction.description || ""}`.toLowerCase().includes(query))
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [auctions, filter, search]);

  const placeBid = async (event, auction) => {
    event.preventDefault();
    const auctionId = auction.auctionId ?? auction.id;
    const bidAmount = Number(bidValues[auctionId]);
    const minimum = Math.max(Number(auction.startPrice || 0), Number(auction.currentPrice || 0));
    if (!Number.isFinite(bidAmount) || bidAmount <= minimum) {
      setBidErrors((current) => ({ ...current, [auctionId]: `Enter an amount greater than $${minimum.toLocaleString()}.` }));
      return;
    }

    setBidErrors((current) => ({ ...current, [auctionId]: "" }));
    try {
      await axios.post("http://localhost:8080/api/bids/placeBid", {
        auctionId,
        userId: user.id,
        bidAmount,
      });
      setAuctions((current) => current.map((item) => (item.auctionId ?? item.id) === auctionId ? { ...item, currentPrice: bidAmount } : item));
      setBidValues((current) => ({ ...current, [auctionId]: "" }));
      toast.success("Bid placed successfully!");
    } catch (requestError) {
      const message = requestError.response?.data;
      setBidErrors((current) => ({
        ...current,
        [auctionId]: typeof message === "string" ? message : "Your bid could not be placed. Please try again.",
      }));
    }
  };

  return (
    <>
      <Header />
      <main className="container browse-auctions-shell">
        <section className="browse-auctions-heading">
          <div>
            <span className="profile-eyebrow">THE MARKETPLACE</span>
            <Typography variant="h3" component="h1">Explore auctions</Typography>
            <Typography>Browse listings from every seller and find your next great bid.</Typography>
          </div>
        </section>

        <section className="browse-auctions-tools" aria-label="Auction filters">
          <TextField
            label="Search listings"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            className="browse-auctions-search"
          />
          <div className="browse-auctions-filters" role="group" aria-label="Filter auction status">
            {filters.map((item) => (
              <Button key={item} variant={filter === item ? "contained" : "outlined"} onClick={() => setFilter(item)}>
                {item}
              </Button>
            ))}
          </div>
        </section>

        {loading && <Typography className="browse-auctions-message">Loading auctions…</Typography>}
        {!loading && error && <Alert severity="error" className="browse-auctions-message">{error}</Alert>}
        {!loading && !error && visibleAuctions.length === 0 && (
          <div className="browse-auctions-empty">
            <Typography variant="h6">No auctions match this view</Typography>
            <Typography>Try another status filter or search term. New listings from all accounts will appear here.</Typography>
          </div>
        )}

        {!loading && !error && visibleAuctions.length > 0 && (
          <Grid container spacing={2.5}>
            {visibleAuctions.map((auction, index) => {
              const auctionId = auction.auctionId ?? auction.id;
              const isOwner = String(auction.ownerId) === String(user?.id);
              const currentPrice = Number(auction.currentPrice || 0);
              const hasBid = currentPrice > 0;
              const displayedPrice = hasBid ? currentPrice : Number(auction.startPrice || 0);
              const canBid = loggedIn && !isOwner && auction.displayStatus === "Live";
              return (
                <Grid item xs={12} sm={6} lg={4} key={auctionId}>
                  <Card className="browse-auction-card" style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}>
                    <CardHeader
                      title={auction.title}
                      subheader={auction.description}
                      action={<Chip size="small" label={isOwner ? "Your auction" : auction.displayStatus} color={auction.displayStatus === "Live" ? "success" : auction.displayStatus === "Ended" ? "default" : "primary"} />}
                    />
                    <CardContent>
                      <div className="browse-auction-price">
                        <span>{hasBid ? "Current bid" : "Starting bid"}</span>
                        <strong>${displayedPrice.toLocaleString()}</strong>
                      </div>
                      <Typography variant="body2" color="text.secondary">
                        {auction.displayStatus === "Upcoming" ? "Starts" : auction.displayStatus === "Ended" ? "Ended" : "Ends"}: {new Date(auction.displayStatus === "Upcoming" ? auction.startTime : auction.endTime).toLocaleString()}
                      </Typography>
                    </CardContent>
                    {canBid && (
                      <CardActions>
                        <form className="browse-bid-form" onSubmit={(event) => placeBid(event, auction)}>
                          <TextField
                            size="small" type="number" label="Your bid" value={bidValues[auctionId] || ""}
                            onChange={(event) => setBidValues((current) => ({ ...current, [auctionId]: event.target.value }))}
                            inputProps={{ min: displayedPrice + 0.01, step: "0.01" }} required
                          />
                          <Button variant="contained" type="submit">Place bid</Button>
                          {bidErrors[auctionId] && <Typography color="error" variant="caption" role="alert">{bidErrors[auctionId]}</Typography>}
                        </form>
                      </CardActions>
                    )}
                    {!loggedIn && auction.displayStatus === "Live" && (
                      <CardActions><Button component={Link} to="/login" variant="outlined">Log in to bid</Button></CardActions>
                    )}
                    {isOwner && auction.displayStatus === "Live" && (
                      <CardActions><Typography variant="body2" color="text.secondary">You can’t bid on your own auction.</Typography></CardActions>
                    )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </main>
      <Footer />
    </>
  );
}
