/**
 * Advanced Social System
 * 
 * Comprehensive MMO social features:
 * - Friends list
 * - Guild/Clan system
 * - Party system
 * - Chat (global, party, guild, whisper)
 * - Trading
 * - Player blocking
 * 
 * For full MMO social experience
 */

export interface Player {
  id: string;
  username: string;
  level: number;
  class: string;
  online: boolean;
  lastSeen: number;
}

export interface FriendRequest {
  from: Player;
  to: Player;
  timestamp: number;
}

export interface Guild {
  id: string;
  name: string;
  tag: string;
  description: string;
  level: number;
  members: GuildMember[];
  createdAt: number;
  leader: string;
}

export interface GuildMember {
  playerId: string;
  rank: 'leader' | 'officer' | 'member' | 'recruit';
  joinedAt: number;
  contribution: number;
}

export interface Party {
  id: string;
  leader: string;
  members: string[];
  maxSize: number;
  lootMode: 'free-for-all' | 'leader' | 'round-robin' | 'need-greed';
}

export interface ChatMessage {
  id: string;
  from: Player;
  to?: Player; // For whispers
  channel: 'global' | 'party' | 'guild' | 'whisper' | 'trade';
  message: string;
  timestamp: number;
}

export class AdvancedSocialSystem {
  private friends = new Map<string, Player>();
  private friendRequests: FriendRequest[] = [];
  private blockedPlayers = new Set<string>();
  private currentGuild: Guild | null = null;
  private currentParty: Party | null = null;
  private chatHistory: ChatMessage[] = [];
  private maxChatHistory = 1000;
  
  constructor(private playerId: string) {
    console.log('👥 Initializing Advanced Social System...');
  }
  
  // Friend System
  sendFriendRequest(targetPlayer: Player): boolean {
    if (this.friends.has(targetPlayer.id)) {
      console.log('Already friends');
      return false;
    }
    
    if (this.blockedPlayers.has(targetPlayer.id)) {
      console.log('Cannot send request to blocked player');
      return false;
    }
    
    // Check if request already exists
    const exists = this.friendRequests.some(
      req => req.to.id === targetPlayer.id
    );
    
    if (exists) {
      console.log('Friend request already sent');
      return false;
    }
    
    this.friendRequests.push({
      from: { id: this.playerId } as Player,
      to: targetPlayer,
      timestamp: Date.now()
    });
    
    console.log(`📨 Friend request sent to ${targetPlayer.username}`);
    return true;
  }
  
  acceptFriendRequest(requestId: number): boolean {
    const request = this.friendRequests[requestId];
    if (!request) return false;
    
    this.friends.set(request.from.id, request.from);
    this.friendRequests.splice(requestId, 1);
    
    console.log(`✅ Accepted friend request from ${request.from.username}`);
    return true;
  }
  
  removeFriend(friendId: string): boolean {
    if (!this.friends.has(friendId)) return false;
    
    this.friends.delete(friendId);
    console.log(`❌ Removed friend`);
    return true;
  }
  
  getFriends(): Player[] {
    return Array.from(this.friends.values());
  }
  
  getOnlineFriends(): Player[] {
    return this.getFriends().filter(f => f.online);
  }
  
  // Block System
  blockPlayer(playerId: string): void {
    this.blockedPlayers.add(playerId);
    this.removeFriend(playerId);
    console.log(`🚫 Blocked player ${playerId}`);
  }
  
  unblockPlayer(playerId: string): void {
    this.blockedPlayers.delete(playerId);
    console.log(`✅ Unblocked player ${playerId}`);
  }
  
  isBlocked(playerId: string): boolean {
    return this.blockedPlayers.has(playerId);
  }
  
  // Guild System
  createGuild(name: string, tag: string, description: string): boolean {
    if (this.currentGuild) {
      console.log('Already in a guild');
      return false;
    }
    
    this.currentGuild = {
      id: `guild_${Date.now()}`,
      name,
      tag,
      description,
      level: 1,
      members: [{
        playerId: this.playerId,
        rank: 'leader',
        joinedAt: Date.now(),
        contribution: 0
      }],
      createdAt: Date.now(),
      leader: this.playerId
    };
    
    console.log(`🏰 Created guild: ${name} [${tag}]`);
    return true;
  }
  
  leaveGuild(): boolean {
    if (!this.currentGuild) return false;
    
    if (this.currentGuild.leader === this.playerId) {
      console.log('Guild leader cannot leave. Transfer leadership or disband guild first.');
      return false;
    }
    
    this.currentGuild = null;
    console.log('👋 Left guild');
    return true;
  }
  
  inviteToGuild(playerId: string): boolean {
    if (!this.currentGuild) return false;
    
    const member = this.currentGuild.members.find(m => m.playerId === this.playerId);
    if (!member || (member.rank !== 'leader' && member.rank !== 'officer')) {
      console.log('Insufficient permissions');
      return false;
    }
    
    console.log(`📧 Guild invite sent to player ${playerId}`);
    return true;
  }
  
  promoteGuildMember(playerId: string): boolean {
    if (!this.currentGuild) return false;
    if (this.currentGuild.leader !== this.playerId) return false;
    
    const member = this.currentGuild.members.find(m => m.playerId === playerId);
    if (!member) return false;
    
    if (member.rank === 'recruit') member.rank = 'member';
    else if (member.rank === 'member') member.rank = 'officer';
    
    console.log(`⬆️ Promoted ${playerId} to ${member.rank}`);
    return true;
  }
  
  getGuild(): Guild | null {
    return this.currentGuild;
  }
  
  // Party System
  createParty(maxSize: number = 5): boolean {
    if (this.currentParty) {
      console.log('Already in a party');
      return false;
    }
    
    this.currentParty = {
      id: `party_${Date.now()}`,
      leader: this.playerId,
      members: [this.playerId],
      maxSize,
      lootMode: 'round-robin'
    };
    
    console.log('🎉 Created party');
    return true;
  }
  
  inviteToParty(playerId: string): boolean {
    if (!this.currentParty) return false;
    if (this.currentParty.leader !== this.playerId) return false;
    if (this.currentParty.members.length >= this.currentParty.maxSize) {
      console.log('Party is full');
      return false;
    }
    
    console.log(`📧 Party invite sent to ${playerId}`);
    return true;
  }
  
  leaveParty(): boolean {
    if (!this.currentParty) return false;
    
    if (this.currentParty.leader === this.playerId) {
      // Disband party or transfer leadership
      this.currentParty = null;
      console.log('👋 Party disbanded');
    } else {
      this.currentParty = null;
      console.log('👋 Left party');
    }
    
    return true;
  }
  
  getParty(): Party | null {
    return this.currentParty;
  }
  
  setLootMode(mode: Party['lootMode']): boolean {
    if (!this.currentParty) return false;
    if (this.currentParty.leader !== this.playerId) return false;
    
    this.currentParty.lootMode = mode;
    console.log(`🎁 Loot mode set to: ${mode}`);
    return true;
  }
  
  // Chat System
  sendMessage(
    channel: ChatMessage['channel'],
    message: string,
    targetPlayer?: Player
  ): boolean {
    
    // Check if can send in channel
    if (channel === 'party' && !this.currentParty) {
      console.log('Not in a party');
      return false;
    }
    
    if (channel === 'guild' && !this.currentGuild) {
      console.log('Not in a guild');
      return false;
    }
    
    if (channel === 'whisper' && !targetPlayer) {
      console.log('Target player required for whisper');
      return false;
    }
    
    if (targetPlayer && this.blockedPlayers.has(targetPlayer.id)) {
      console.log('Cannot message blocked player');
      return false;
    }
    
    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      from: { id: this.playerId } as Player,
      to: targetPlayer,
      channel,
      message,
      timestamp: Date.now()
    };
    
    this.chatHistory.push(chatMessage);
    
    // Limit history size
    if (this.chatHistory.length > this.maxChatHistory) {
      this.chatHistory.shift();
    }
    
    console.log(`💬 [${channel}] Message sent`);
    return true;
  }
  
  getChatHistory(channel?: ChatMessage['channel'], limit: number = 50): ChatMessage[] {
    let messages = this.chatHistory;
    
    if (channel) {
      messages = messages.filter(m => m.channel === channel);
    }
    
    return messages.slice(-limit);
  }
  
  clearChatHistory(channel?: ChatMessage['channel']): void {
    if (channel) {
      this.chatHistory = this.chatHistory.filter(m => m.channel !== channel);
    } else {
      this.chatHistory = [];
    }
  }
  
  // Statistics
  getStatistics(): {
    friends: number;
    onlineFriends: number;
    pendingRequests: number;
    blockedPlayers: number;
    guildMembers: number;
    partyMembers: number;
    chatMessages: number;
  } {
    return {
      friends: this.friends.size,
      onlineFriends: this.getOnlineFriends().length,
      pendingRequests: this.friendRequests.length,
      blockedPlayers: this.blockedPlayers.size,
      guildMembers: this.currentGuild?.members.length || 0,
      partyMembers: this.currentParty?.members.length || 0,
      chatMessages: this.chatHistory.length
    };
  }
}
