import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { demoPastAuctions } from "../data/homeDemoAuctions";
import AuctionCarousel from "./AuctionCarousel";

const PastAuctions = () => {
  const [pastAuctions, setPastAuctions] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [usernames, setUsernames] = useState({}); // To store usernames by winnerUserId
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/auctions'); // Adjust with your endpoint
        const allAuctions = response.data;

        console.log("Fetched auctions:", allAuctions); // Debugging

        // Current date and time
        const currentDateTime = new Date();

        // Filter past auctions
        const past = allAuctions.filter(
          (auction) => new Date(auction.endTime) < currentDateTime
        );

        console.log("Filtered past auctions:", past); // Debugging

        setPastAuctions(past.length ? past : demoPastAuctions);
        setUsingDemo(past.length === 0);

        // Fetch usernames for all winnerUserId
        const winnerIds = [...new Set(past.map((auction) => auction.winnerUserId).filter(Boolean))];
        const userPromises = winnerIds.map((id) =>
          axios
            .get(`http://localhost:8080/api/admin/users/${id}`)
            .then((res) => ({ id, username: res.data.username }))
            .catch((error) => {
              console.error(`Error fetching user with ID ${id}:`, error);
              return { id, username: "Unknown" };
            })
        );

        const userResults = await Promise.all(userPromises);
        const usernameMap = userResults.reduce((acc, user) => {
          acc[user.id] = user.username;
          return acc;
        }, {});

        setUsernames(usernameMap);
      } catch (error) {
        console.error("Error fetching auctions or usernames:", error);
        setPastAuctions(demoPastAuctions);
        setUsingDemo(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  return (
    <>
      <section className="my-4">
        <div className="home-section-heading">
          <h2 className="h2 mb-4">Previous Auctions</h2>
          {usingDemo && <span className="sample-data-badge">Sample data</span>}
        </div>

        {loading && <p>Loading past auctions...</p>}
        {!loading && !usingDemo && pastAuctions.length === 0 && (
          <p style={{ textAlign: "center", fontWeight: "bold", margin: "20px 0" }}>
            No past auctions available
          </p>
        )}

        <AuctionCarousel label="previous auctions">
          {pastAuctions.map((auction) => (
            <div
              className="card auction-carousel-card"
              key={auction.id}
              data-demo={auction.isDemo || undefined}
              style={{ minWidth: '300px', flexShrink: 0 }}
            >
              <div className="card-header">
                <h5 className="card-title">{auction.title}</h5>
              </div>
              <div className="card-body">
                <p className="card-text">Final Price: ${auction.currentPrice || 0}</p>
                <p className="card-text">
                  Winner: {auction.winnerName || usernames[auction.winnerUserId] || "N/A"}
                </p>
              </div>
            </div>
          ))}
        </AuctionCarousel>
      </section>
    </>
  );
};

export default PastAuctions;
