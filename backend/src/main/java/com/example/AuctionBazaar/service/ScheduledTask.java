package com.example.AuctionBazaar.service;

import com.example.AuctionBazaar.Model.Auction;
import com.example.AuctionBazaar.Model.AuctionStatus;
import com.example.AuctionBazaar.Model.Bid;
import com.example.AuctionBazaar.Model.User;
import com.example.AuctionBazaar.repository.AuctionRepository;
import com.example.AuctionBazaar.repository.BidRepository;
import com.example.AuctionBazaar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class ScheduledTask {

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private UserRepository userRepository;

    @Scheduled(cron = "0 */15 * * * *")
    public void processEndedAuctions() {
        List<Auction> endedAuctions = auctionRepository
                .findEndedAuctionsPendingWinnerNotification(new Timestamp(System.currentTimeMillis()));

        for (Auction auction : endedAuctions) {
            List<Bid> bids = bidRepository.findByAuctionId(auction.getAuctionId());
            Optional<Bid> highestBid = bids.stream().max(Comparator.comparing(Bid::getBidAmount));

            if (highestBid.isEmpty()) {
                auction.setStatus(AuctionStatus.COMPLETED);
                auction.setWinnerNotified(true);
                auctionRepository.save(auction);
                continue;
            }

            Bid winningBid = highestBid.get();
            try {
                Optional<User> winner = userRepository.findById(Math.toIntExact(winningBid.getUserId()));
                if (winner.isEmpty() || winner.get().getEmail() == null || winner.get().getEmail().isBlank()) {
                    System.err.printf("Winner email unavailable for auction %s; notification will be retried.%n",
                            auction.getAuctionId());
                    continue;
                }

                String body = String.format(
                        "Congratulations, %s!%n%nYou won the auction '%s' with a bid of $%s.%n%n"
                                + "Sign in to AuctionBazaar to view your auction and arrange next steps.%n%n"
                                + "AuctionBazaar Team",
                        winner.get().getUsername(), auction.getTitle(), winningBid.getBidAmount().toPlainString());
                emailService.sendEmail(winner.get().getEmail(),
                        "You won an auction on AuctionBazaar!", body);

                // Save the winner after sending so a failed email can be retried on the next scheduler run.
                auction.setWinnerUserId(winningBid.getUserId());
                auction.setStatus(AuctionStatus.COMPLETED);
                auction.setWinnerNotified(true);
                auctionRepository.save(auction);
            } catch (RuntimeException exception) {
                System.err.printf("Could not notify winner for auction %s; it will be retried: %s%n",
                        auction.getAuctionId(), exception.getMessage());
            }
        }
    }
}
