export class GameState {
    /**
     *
     */
    constructor(gameData, inventorySize) {
        this.rooms = {};
        this.items = {};
        this.enemies = {};
        this.currentRoomId = 'start';
        this.inventory = new Array(inventorySize).fill(''); // initialize array with no items
        this.loadGameData(gameData);
        this.inventorySize = inventorySize;
    }
    /**
     * initializes this objects variables
     * @param gameData the game data object
     */
    loadGameData(gameData) {
        this.rooms = gameData.rooms || {};
        this.items = gameData.items || {};
        this.enemies = gameData.enemies || {};
        this.currentRoomId = gameData.startRoom || 'start';
        gameData.inventory.forEach((itemId, i) => {
            if (itemId)
                this.inventory[i] = itemId;
        });
    }
    getCurrentRoom() {
        return this.rooms[this.currentRoomId];
    }
}
