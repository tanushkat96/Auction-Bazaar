import React, { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const emptyStats = { total: 0, live: 0, upcoming: 0, ended: 0 };

export default function AuctionProfile() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get("http://localhost:8080/api/admin/auctions");
        const allAuctions = Array.isArray(response.data) ? response.data : [];
        const mine = allAuctions.filter((auction) => String(auction.ownerId) === String(user?.id));
        const now = Date.now();
        const nextStats = mine.reduce((result, auction) => {
          const startsAt = new Date(auction.startTime).getTime();
          const endsAt = new Date(auction.endTime).getTime();
          if (Number.isFinite(startsAt) && now < startsAt) result.upcoming += 1;
          else if (Number.isFinite(endsAt) && now <= endsAt) result.live += 1;
          else result.ended += 1;
          return result;
        }, { ...emptyStats, total: mine.length });
        if (active) setStats(nextStats);
      } catch (requestError) {
        console.error("Could not load the user's auctions:", requestError);
        if (active) setError("Your auction summary is temporarily unavailable.");
      } finally {
        if (active) setLoading(false);
      }
    };

    if (user?.id) loadStats();
    else setLoading(false);
    return () => { active = false; };
  }, [user?.id]);

  const items = [
    { label: "Auctions created", value: stats.total },
    { label: "Live", value: stats.live },
    { label: "Upcoming", value: stats.upcoming },
    { label: "Ended", value: stats.ended },
  ];

  return (
    <Card className="profile-auction-summary">
      <CardHeader title="Your auction activity" subheader="Only auctions created by you" />
      <CardContent>
        {error ? (
          <Typography color="error" role="alert">{error}</Typography>
        ) : loading ? (
          <Typography color="text.secondary">Loading your auction activity…</Typography>
        ) : (
          <Grid container spacing={1.5}>
            {items.map((item) => (
              <Grid item xs={6} key={item.label}>
                <div className="profile-stat-tile">
                  <Typography variant="h4">{item.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                </div>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
