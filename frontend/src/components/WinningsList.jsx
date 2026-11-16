import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import { AuthContext } from "../context/AuthContext";

export default function WinningsList() {
  const { user } = useContext(AuthContext);
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const fetchWinnings = async () => {
      if (!user?.id) {
        setWinnings([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const response = await axios.get("http://localhost:8080/api/admin/auctions");
        const allAuctions = Array.isArray(response.data) ? response.data : [];
        const userWinnings = allAuctions.filter(
          (auction) => String(auction.winnerUserId) === String(user.id)
        );
        if (active) setWinnings(userWinnings);
      } catch (requestError) {
        console.error("Could not load the user's winnings:", requestError);
        if (active) setError("Your winnings are temporarily unavailable.");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchWinnings();
    return () => { active = false; };
  }, [user?.id]);

  return (
    <Card className="dashboard-winnings-card">
      <CardHeader title="Your winnings" subheader="Auctions won by your account" />
      <CardContent>
        {loading ? (
          <Typography color="text.secondary">Loading your winnings…</Typography>
        ) : error ? (
          <Typography color="error" role="alert">{error}</Typography>
        ) : winnings.length === 0 ? (
          <div className="dashboard-empty-state">
            <span aria-hidden="true">◇</span>
            <Typography variant="subtitle1">No wins yet</Typography>
            <Typography variant="body2">When you win an auction, it will appear here.</Typography>
          </div>
        ) : (
          <div className="dashboard-winnings-list">
            {winnings.map((auction) => (
              <div className="dashboard-winning-row" key={auction.id}>
                <div>
                  <Typography variant="subtitle2">{auction.title}</Typography>
                  <Typography variant="body2" color="text.secondary">Winning bid</Typography>
                </div>
                <strong>${Number(auction.currentPrice || 0).toLocaleString()}</strong>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
