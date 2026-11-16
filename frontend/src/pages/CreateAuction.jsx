import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // For success/error toasts
import { AuthContext } from "../context/AuthContext"; // Import AuthContext to get user info
import axios from "axios";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
} from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";

function CreateAuction() {
  const { user } = useContext(AuthContext); // Get the logged-in user's data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Track loading state
  const navigate = useNavigate();

  const categories = [
    { id: 0, name: "Others" },
    { id: 1, name: "Electronics" },
    { id: 2, name: "Furniture" },
    { id: 3, name: "Art" },
    { id: 4, name: "Vehicles" },
  ];

  const toLocalInputValue = (date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  };
  const earliestStart = toLocalInputValue(new Date(Date.now() + 60_000));
  const selectedCategory = categories.find((category) => category.id === Number(categoryId));

  const handleCreateAuction = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state before submitting the form
    setLoading(true); // Set loading to true

    // Validate form fields
    if (!title.trim() || !description.trim() || !startingBid || !startDate || !endDate || categoryId === "") {
      setError("Complete each field before publishing your auction.");
      setLoading(false);
      return;
    }

    const numericBid = Number(startingBid);
    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);
    if (!Number.isFinite(numericBid) || numericBid <= 0) {
      setError("Starting bid must be greater than zero.");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(parsedStart.getTime()) || !Number.isFinite(parsedEnd.getTime()) || parsedEnd <= parsedStart) {
      setError("Choose a valid end date and time that comes after the start.");
      setLoading(false);
      return;
    }
    if (parsedStart.getTime() < Date.now()) {
      setError("The auction start time must be in the future.");
      setLoading(false);
      return;
    }

    // Convert start and end dates to proper format (ISO 8601)
    const startDateTime = parsedStart.toISOString();
    const endDateTime = parsedEnd.toISOString();

    try {
      // Make API call to backend to create auction
      await axios.post("http://localhost:8080/api/auctions/create", {
        title: title.trim(),
        description: description.trim(),
        startPrice: numericBid,
        startTime: startDateTime,
        endTime: endDateTime,
        ownerId: user.id,
        currentPrice: 0,
        categoryId: Number(categoryId),
        status: "CREATED",
      });

      // Show success notification
      toast.success("Auction created successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      // Reset form fields
      setTitle("");
      setDescription("");
      setStartingBid("");
      setStartDate("");
      setEndDate("");
      setCategoryId(0);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while creating the auction.");
      toast.error("Failed to create auction", { position: "top-center", autoClose: 2000 });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <>
      <Header />
      <Container component="main" maxWidth="lg" className="create-auction-shell">
        <section className="create-auction-heading">
          <div>
            <span className="profile-eyebrow">SELL WITH AUCTIONBAZAAR</span>
            <Typography variant="h3" component="h1">Create an auction</Typography>
            <Typography>Share the details buyers need to bid with confidence.</Typography>
          </div>
          <div className="create-auction-step"><span>01</span><div><strong>Build your listing</strong><small>Title · timing · starting bid</small></div></div>
        </section>
        <div className="create-auction-layout">
        <Card className="create-auction-card">
          <CardContent>
            <form onSubmit={handleCreateAuction}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Auction Title"
                    variant="outlined"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    inputProps={{ maxLength: 100 }}
                    helperText={`${title.length}/100 characters`}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    inputProps={{ maxLength: 1000 }}
                    helperText={`${description.length}/1000 characters`}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Starting Bid"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={startingBid}
                    onChange={(e) => setStartingBid(e.target.value)}
                    inputProps={{ min: "0.01", step: "0.01" }}
                    InputProps={{ startAdornment: <span className="currency-prefix">$</span> }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Category"
                    variant="outlined"
                    fullWidth
                    select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    required
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Start Date"
                    variant="outlined"
                    fullWidth
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    inputProps={{ min: earliestStart }}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="End Date"
                    variant="outlined"
                    fullWidth
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    inputProps={{ min: startDate || earliestStart }}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? "Creating…" : "Publish auction"}
                  </Button>
                </Grid>
              </Grid>
            </form>
            {error && <Alert severity="error" className="auth-flow-alert">{error}</Alert>}
          </CardContent>
        </Card>
        <aside className="create-auction-sidebar">
          <Card className="create-auction-preview">
            <CardContent>
              <span className="create-auction-preview-label">LIVE PREVIEW</span>
              {title.trim() ? (
                <>
                  <Typography variant="h6" component="h2">{title.trim()}</Typography>
                  {description.trim() && <Typography variant="body2" className="preview-description">{description.trim()}</Typography>}
                  <div className="preview-bid"><span>Starting bid</span><strong>{startingBid ? `$${Number(startingBid).toLocaleString()}` : "Set your price"}</strong></div>
                  <div className="preview-meta"><span>{selectedCategory?.name || "Category"}</span>{startDate && <span>Starts {new Date(startDate).toLocaleString()}</span>}</div>
                </>
              ) : (
                <Typography color="text.secondary">Your listing preview will appear here as you add its details.</Typography>
              )}
            </CardContent>
          </Card>
          <Card className="create-auction-tips">
            <CardContent>
              <Typography variant="h6" component="h2">A strong listing</Typography>
              <ul>
                <li>Use a clear, specific title.</li>
                <li>Describe condition and notable details.</li>
                <li>Choose a realistic starting bid.</li>
                <li>Set an end time that gives buyers room to bid.</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
        </div>
      </Container>
      <Footer />
    </>
  );
}

export default CreateAuction;
