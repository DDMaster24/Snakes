const { GameRoom } = require('./GameRoom.js');
const { makeRoomCode } = require('../src/shared/random.js');

class LobbyManager {
  constructor() { this.rooms = new Map(); } // code -> GameRoom

  createRoom({ numBots = 6 } = {}) {
    let code = makeRoomCode();
    while (this.rooms.has(code)) code = makeRoomCode();
    const room = new GameRoom(code, { numBots });
    this.rooms.set(code, room);
    return { code, room };
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(String(code).toUpperCase()) || null;
  }

  removeRoom(code) { this.rooms.delete(String(code).toUpperCase()); }

  gcEmptyRooms() {
    for (const [code, room] of this.rooms) {
      if (room.humanCount() === 0) this.rooms.delete(code);
    }
  }
}

module.exports = { LobbyManager };
