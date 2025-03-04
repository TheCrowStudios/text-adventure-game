export class GameState {
    /**
     *
     */
    constructor(gameData, inventorySize) {
        this.character = { health: 20, maxHealth: 20, armor: 0 };
        this.rooms = {};
        this.items = {};
        this.enemies = {};
        this.currentRoomId = 'start';
        this.inCombat = false;
        this.canRun = false;
        this.previousRoom = '';
        this.inventory = new Array(inventorySize).fill(''); // initialize array with no items
        this.loadGameData(gameData);
        this.inventorySize = inventorySize;
    }
    /**
     * initializes this objects variables
     * @param gameData the game data object
     */
    loadGameData(gameData) {
        this.character = gameData.character || { health: 20, maxHealth: 20, armor: 0 };
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
    getItemFromInventoryIndex(index) {
        return this.items[this.inventory[index]];
    }
    getEnemyInRoom() {
        return this.getCurrentRoom().enemies.length > 0 ? this.enemies[this.getCurrentRoom().enemies[0]] : null;
    }
}
