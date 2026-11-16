import React, { useCallback, useEffect, useRef, useState } from "react";
import { IconButton } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";

export default function AuctionCarousel({ children, label }) {
  const trackRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const updateControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanGoBack(track.scrollLeft > 2);
    setCanGoForward(track.scrollLeft + track.clientWidth < track.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    updateControls();
    const observer = new ResizeObserver(updateControls);
    observer.observe(track);
    window.addEventListener("resize", updateControls);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateControls);
    };
  }, [children, updateControls]);

  const move = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.max(track.clientWidth * 0.82, 280), behavior: "smooth" });
  };

  return (
    <div className="auction-carousel" role="region" aria-label={label}>
      <IconButton
        className="auction-carousel-arrow auction-carousel-arrow-left"
        aria-label={`Show previous ${label.toLowerCase()}`}
        onClick={() => move(-1)}
        disabled={!canGoBack}
      >
        <ArrowBackIosNewRoundedIcon fontSize="small" />
      </IconButton>
      <div className="auction-carousel-track" ref={trackRef} onScroll={updateControls}>
        {children}
      </div>
      <IconButton
        className="auction-carousel-arrow auction-carousel-arrow-right"
        aria-label={`Show more ${label.toLowerCase()}`}
        onClick={() => move(1)}
        disabled={!canGoForward}
      >
        <ArrowForwardIosRoundedIcon fontSize="small" />
      </IconButton>
    </div>
  );
}
