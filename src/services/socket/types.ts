import type { Socket } from 'socket.io-client';

/**
 * Base interface for all socket controllers
 */
export interface ISocketController {
  /**
   * Register socket event listeners
   */
  registerListeners(socket: Socket): void;

  /**
   * Cleanup socket event listeners
   */
  cleanup(socket: Socket): void;
}
