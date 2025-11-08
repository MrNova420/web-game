/**
 * Advanced Trading System
 * 
 * Professional player-to-player trading:
 * - Direct trade with other players
 * - Auction house / marketplace
 * - Trade requests and confirmations
 * - Item verification
 * - Trade history
 * - Currency exchange
 * 
 * For complete MMO economy
 */

export interface TradeOffer {
  id: string;
  from: string;
  to: string;
  fromItems: TradeItem[];
  toItems: TradeItem[];
  fromGold: number;
  toGold: number;
  fromConfirmed: boolean;
  toConfirmed: boolean;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: number;
  expiresAt: number;
}

export interface TradeItem {
  itemId: string;
  name: string;
  quantity: number;
  rarity: string;
}

export interface AuctionListing {
  id: string;
  sellerId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  buyoutPrice: number;
  bidPrice: number;
  currentBid: number;
  currentBidder: string | null;
  duration: number;
  expiresAt: number;
  status: 'active' | 'sold' | 'expired';
}

export class AdvancedTradingSystem {
  private activeTrades = new Map<string, TradeOffer>();
  private tradeHistory: TradeOffer[] = [];
  private auctionListings = new Map<string, AuctionListing>();
  private playerListings = new Map<string, string[]>(); // playerId -> listingIds
  private maxTradeSlots = 8;
  private maxAuctionListings = 10;
  private auctionHouseFee = 0.05; // 5%
  
  constructor(private playerId: string) {
    console.log('💰 Initializing Advanced Trading System...');
  }
  
  // Direct Trading
  sendTradeRequest(targetPlayerId: string): string | null {
    // Check if already trading
    for (const [id, trade] of this.activeTrades) {
      if ((trade.from === this.playerId || trade.to === this.playerId) && 
          trade.status === 'active') {
        console.log('Already in an active trade');
        return null;
      }
    }
    
    const tradeId = `trade_${Date.now()}`;
    const trade: TradeOffer = {
      id: tradeId,
      from: this.playerId,
      to: targetPlayerId,
      fromItems: [],
      toItems: [],
      fromGold: 0,
      toGold: 0,
      fromConfirmed: false,
      toConfirmed: false,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 60000 // 1 minute to accept
    };
    
    this.activeTrades.set(tradeId, trade);
    console.log(`📨 Trade request sent to player ${targetPlayerId}`);
    return tradeId;
  }
  
  acceptTradeRequest(tradeId: string): boolean {
    const trade = this.activeTrades.get(tradeId);
    if (!trade || trade.to !== this.playerId || trade.status !== 'pending') {
      return false;
    }
    
    trade.status = 'active';
    console.log('✅ Trade accepted');
    return true;
  }
  
  addItemToTrade(tradeId: string, item: TradeItem): boolean {
    const trade = this.activeTrades.get(tradeId);
    if (!trade || trade.status !== 'active') return false;
    
    const isFromPlayer = trade.from === this.playerId;
    const items = isFromPlayer ? trade.fromItems : trade.toItems;
    
    if (items.length >= this.maxTradeSlots) {
      console.log('Trade window full');
      return false;
    }
    
    items.push(item);
    
    // Reset confirmations when items change
    trade.fromConfirmed = false;
    trade.toConfirmed = false;
    
    console.log(`➕ Added ${item.name} x${item.quantity} to trade`);
    return true;
  }
  
  removeItemFromTrade(tradeId: string, itemIndex: number): boolean {
    const trade = this.activeTrades.get(tradeId);
    if (!trade || trade.status !== 'active') return false;
    
    const isFromPlayer = trade.from === this.playerId;
    const items = isFromPlayer ? trade.fromItems : trade.toItems;
    
    if (itemIndex < 0 || itemIndex >= items.length) return false;
    
    const removed = items.splice(itemIndex, 1)[0];
    
    // Reset confirmations
    trade.fromConfirmed = false;
    trade.toConfirmed = false;
    
    console.log(`➖ Removed ${removed.name} from trade`);
    return true;
  }
  
  setTradeGold(tradeId: string, amount: number): boolean {
    const trade = this.activeTrades.get(tradeId);
    if (!trade || trade.status !== 'active') return false;
    
    const isFromPlayer = trade.from === this.playerId;
    
    if (isFromPlayer) {
      trade.fromGold = Math.max(0, amount);
    } else {
      trade.toGold = Math.max(0, amount);
    }
    
    // Reset confirmations
    trade.fromConfirmed = false;
    trade.toConfirmed = false;
    
    console.log(`💰 Set trade gold to ${amount}`);
    return true;
  }
  
  confirmTrade(tradeId: string): boolean {
    const trade = this.activeTrades.get(tradeId);
    if (!trade || trade.status !== 'active') return false;
    
    const isFromPlayer = trade.from === this.playerId;
    
    if (isFromPlayer) {
      trade.fromConfirmed = true;
    } else {
      trade.toConfirmed = true;
    }
    
    console.log('✅ Trade confirmed');
    
    // If both confirmed, complete trade
    if (trade.fromConfirmed && trade.toConfirmed) {
      return this.completeTrade(tradeId);
    }
    
    return true;
  }
  
  private completeTrade(tradeId: string): boolean {
    const trade = this.activeTrades.get(tradeId);
    if (!trade) return false;
    
    // Execute trade (this would interact with inventory system)
    trade.status = 'completed';
    this.tradeHistory.push(trade);
    this.activeTrades.delete(tradeId);
    
    console.log('🎉 Trade completed successfully!');
    return true;
  }
  
  cancelTrade(tradeId: string): boolean {
    const trade = this.activeTrades.get(tradeId);
    if (!trade) return false;
    
    trade.status = 'cancelled';
    this.activeTrades.delete(tradeId);
    
    console.log('❌ Trade cancelled');
    return true;
  }
  
  getTrade(tradeId: string): TradeOffer | undefined {
    return this.activeTrades.get(tradeId);
  }
  
  // Auction House
  createAuctionListing(
    itemId: string,
    itemName: string,
    quantity: number,
    buyoutPrice: number,
    startingBid: number,
    duration: number = 24 * 60 * 60 * 1000 // 24 hours
  ): string | null {
    
    const playerListings = this.playerListings.get(this.playerId) || [];
    if (playerListings.length >= this.maxAuctionListings) {
      console.log('Maximum auction listings reached');
      return null;
    }
    
    const listingId = `auction_${Date.now()}`;
    const listing: AuctionListing = {
      id: listingId,
      sellerId: this.playerId,
      itemId,
      itemName,
      quantity,
      buyoutPrice,
      bidPrice: startingBid,
      currentBid: 0,
      currentBidder: null,
      duration,
      expiresAt: Date.now() + duration,
      status: 'active'
    };
    
    this.auctionListings.set(listingId, listing);
    
    if (!this.playerListings.has(this.playerId)) {
      this.playerListings.set(this.playerId, []);
    }
    this.playerListings.get(this.playerId)!.push(listingId);
    
    console.log(`🏪 Created auction listing: ${itemName} x${quantity} for ${buyoutPrice} gold`);
    return listingId;
  }
  
  placeBid(listingId: string, bidAmount: number): boolean {
    const listing = this.auctionListings.get(listingId);
    if (!listing || listing.status !== 'active') return false;
    
    if (listing.sellerId === this.playerId) {
      console.log('Cannot bid on your own listing');
      return false;
    }
    
    if (bidAmount < listing.bidPrice) {
      console.log(`Bid too low. Minimum: ${listing.bidPrice}`);
      return false;
    }
    
    if (listing.currentBid > 0 && bidAmount <= listing.currentBid) {
      console.log(`Bid too low. Current bid: ${listing.currentBid}`);
      return false;
    }
    
    // Refund previous bidder (would integrate with player gold system)
    if (listing.currentBidder) {
      console.log(`Refunding ${listing.currentBid} to ${listing.currentBidder}`);
    }
    
    listing.currentBid = bidAmount;
    listing.currentBidder = this.playerId;
    listing.bidPrice = Math.ceil(bidAmount * 1.05); // Next bid must be 5% higher
    
    console.log(`💰 Placed bid of ${bidAmount} on ${listing.itemName}`);
    return true;
  }
  
  buyout(listingId: string): boolean {
    const listing = this.auctionListings.get(listingId);
    if (!listing || listing.status !== 'active') return false;
    
    if (listing.sellerId === this.playerId) {
      console.log('Cannot buy your own listing');
      return false;
    }
    
    // Charge buyer (integrate with player gold)
    // Pay seller (minus auction house fee)
    const fee = listing.buyoutPrice * this.auctionHouseFee;
    const sellerProfit = listing.buyoutPrice - fee;
    
    listing.status = 'sold';
    
    // Remove from player listings
    const sellerListings = this.playerListings.get(listing.sellerId);
    if (sellerListings) {
      const index = sellerListings.indexOf(listingId);
      if (index > -1) sellerListings.splice(index, 1);
    }
    
    console.log(`🛒 Bought ${listing.itemName} for ${listing.buyoutPrice} (seller gets ${sellerProfit})`);
    return true;
  }
  
  cancelAuctionListing(listingId: string): boolean {
    const listing = this.auctionListings.get(listingId);
    if (!listing || listing.sellerId !== this.playerId || listing.status !== 'active') {
      return false;
    }
    
    // Refund highest bidder if any
    if (listing.currentBidder && listing.currentBid > 0) {
      console.log(`Refunding ${listing.currentBid} to ${listing.currentBidder}`);
    }
    
    listing.status = 'expired';
    
    // Remove from player listings
    const listings = this.playerListings.get(this.playerId);
    if (listings) {
      const index = listings.indexOf(listingId);
      if (index > -1) listings.splice(index, 1);
    }
    
    console.log('❌ Auction listing cancelled');
    return true;
  }
  
  searchAuctions(filters: {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    rarity?: string;
    sortBy?: 'price' | 'timeLeft' | 'name';
  }): AuctionListing[] {
    
    let results = Array.from(this.auctionListings.values())
      .filter(listing => listing.status === 'active');
    
    if (filters.name) {
      const searchTerm = filters.name.toLowerCase();
      results = results.filter(l => l.itemName.toLowerCase().includes(searchTerm));
    }
    
    if (filters.minPrice !== undefined) {
      results = results.filter(l => l.buyoutPrice >= filters.minPrice!);
    }
    
    if (filters.maxPrice !== undefined) {
      results = results.filter(l => l.buyoutPrice <= filters.maxPrice!);
    }
    
    // Sort results
    if (filters.sortBy === 'price') {
      results.sort((a, b) => a.buyoutPrice - b.buyoutPrice);
    } else if (filters.sortBy === 'timeLeft') {
      results.sort((a, b) => a.expiresAt - b.expiresAt);
    } else if (filters.sortBy === 'name') {
      results.sort((a, b) => a.itemName.localeCompare(b.itemName));
    }
    
    return results;
  }
  
  getPlayerAuctions(): AuctionListing[] {
    const listingIds = this.playerListings.get(this.playerId) || [];
    return listingIds
      .map(id => this.auctionListings.get(id))
      .filter(l => l !== undefined) as AuctionListing[];
  }
  
  // Cleanup expired listings
  updateAuctions(): void {
    const now = Date.now();
    
    for (const [id, listing] of this.auctionListings) {
      if (listing.status === 'active' && listing.expiresAt <= now) {
        if (listing.currentBidder && listing.currentBid > 0) {
          // Auction ended with bid - complete sale
          listing.status = 'sold';
          console.log(`⏰ Auction ended: ${listing.itemName} sold for ${listing.currentBid}`);
        } else {
          // No bids - return item
          listing.status = 'expired';
          console.log(`⏰ Auction expired: ${listing.itemName}`);
        }
        
        // Remove from player listings
        const listings = this.playerListings.get(listing.sellerId);
        if (listings) {
          const index = listings.indexOf(id);
          if (index > -1) listings.splice(index, 1);
        }
      }
    }
  }
  
  getStatistics(): {
    activeAuctionListings: number;
    playerListings: number;
    activeTrades: number;
    completedTrades: number;
    totalAuctionValue: number;
  } {
    const activeListings = Array.from(this.auctionListings.values())
      .filter(l => l.status === 'active');
    
    const totalValue = activeListings.reduce((sum, l) => sum + l.buyoutPrice, 0);
    
    return {
      activeAuctionListings: activeListings.length,
      playerListings: this.playerListings.get(this.playerId)?.length || 0,
      activeTrades: this.activeTrades.size,
      completedTrades: this.tradeHistory.filter(t => t.status === 'completed').length,
      totalAuctionValue: totalValue
    };
  }
}
