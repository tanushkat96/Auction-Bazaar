package com.example.AuctionBazaar.repository;

import com.example.AuctionBazaar.Model.Auction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Timestamp;
import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {
    @Query("select a from Auction a where a.endTime < :currentTime " +
            "and (a.winnerNotified = false or a.winnerNotified is null)")
    List<Auction> findEndedAuctionsPendingWinnerNotification(@Param("currentTime") Timestamp currentTime);
}
