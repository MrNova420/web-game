import { describe, it, expect, beforeEach } from 'vitest';
import { NetworkSystem } from '../systems/NetworkSystem';

describe('NetworkSystem', () => {
  let networkSystem: NetworkSystem;

  beforeEach(() => {
    networkSystem = new NetworkSystem();
  });

  it('should create a network system', () => {
    expect(networkSystem).toBeDefined();
  });

  it('should handle connection state', () => {
    const isConnected = networkSystem.isConnected();
    expect(typeof isConnected).toBe('boolean');
  });

  it('should queue messages when offline', () => {
    if (!networkSystem.isConnected()) {
      networkSystem.send('test', { data: 'test' });
      const queue = networkSystem.getMessageQueue();
      expect(queue.length).toBeGreaterThan(0);
    }
  });

  it('should track latency', () => {
    const latency = networkSystem.getLatency();
    expect(typeof latency).toBe('number');
    expect(latency).toBeGreaterThanOrEqual(0);
  });

  it('should handle reconnection attempts', () => {
    const reconnectCount = networkSystem.getReconnectAttempts();
    expect(typeof reconnectCount).toBe('number');
  });
});
