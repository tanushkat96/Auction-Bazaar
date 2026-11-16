import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import UpcomingAuctions from "../components/UpcomingAuctions";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PastAuctions from "../components/PastAuctions";
import LiveAuctions from "../components/LiveAuctions";
import { demoLiveAuctions } from "../data/homeDemoAuctions";

const Home = () => {
  const [topBids, setTopBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDemoBids, setUsingDemoBids] = useState(false);

  useEffect(() => {
    // Fetch auctions from the API
    const fetchAuctions = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/admin/auctions");
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          // Sort auctions by current price and take the top 3
          const topBidsData = data
            .filter((auction) => auction.currentPrice) // Ensure currentPrice exists
            .sort((a, b) => b.currentPrice - a.currentPrice) // Descending order
            .slice(0, 3) // Take top 3
            .map((auction) => ({
              id: auction.id,
              title: auction.title,
              currentBid: auction.currentPrice,
            }));
          if (topBidsData.length) {
            setTopBids(topBidsData);
          } else {
            setTopBids(demoLiveAuctions.slice(0, 3).map((auction) => ({
              id: auction.id,
              title: auction.title,
              currentBid: auction.currentPrice,
              isDemo: true,
            })));
            setUsingDemoBids(true);
          }
        } else {
          setTopBids(demoLiveAuctions.slice(0, 3).map((auction) => ({
            id: auction.id,
            title: auction.title,
            currentBid: auction.currentPrice,
            isDemo: true,
          })));
          setUsingDemoBids(true);
        }
      } catch (error) {
        console.error("Error fetching auctions:", error);
        setTopBids(demoLiveAuctions.slice(0, 3).map((auction) => ({
          id: auction.id,
          title: auction.title,
          currentBid: auction.currentPrice,
          isDemo: true,
        })));
        setUsingDemoBids(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  return (
    <>
      <Header />
      <div className="container home-shell">
        <section className="row home-hero">
          <div className="col-md-6">
            <div className="flex-1">
              <span className="hero-kicker">The thrill is in the bid</span>
              <Typography variant="h4" component="h1" gutterBottom>
                Discover your next great find.
              </Typography>
              <Typography variant="h6" paragraph>
              Bid on pieces worth owning, meet trusted sellers, and make every winning moment count.
              </Typography>
              <Button
                variant="contained"
                size="large"
              >
                <Link
                  to="/auctions"
                  style={{ textDecoration: "none", color: "#183323" }}
                >
                  Explore Auctions
                </Link>
              </Button>
              {usingDemoBids && <span className="demo-preview-note">Top bids shown are sample preview data</span>}
            </div>
          </div>
          <div className="col-md-6">
            <Card className="flex-1 top-bids-card">
              <CardHeader
                title={
                  <Typography variant="h6" component="div">
                    Top Bids
                  </Typography>
                }
              />
              <CardContent>
                {loading ? (
                  <Typography variant="body1" align="center">
                    Loading...
                  </Typography>
                ) : topBids.length > 0 ? (
                  <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                    {topBids.map((bid) => (
                      <li
                        key={bid.id}
                        className="top-bid-row"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body1" className="top-bid-title" style={{ flex: 1 }}>
                          {bid.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          className="top-bid-price"
                          style={{ fontWeight: "bold", textAlign: "right" }}
                        >
                          ${bid.currentBid}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography variant="body1" align="center">
                    Nothing to show
                  </Typography>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
        <section className="my-4 home-section">
          <LiveAuctions />
        </section>
        <section className="my-4 home-section">
          <PastAuctions />
        </section>
        <section className="my-4 home-section">
          <UpcomingAuctions />
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Home;
