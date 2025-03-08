export class GameState {
    /**
     *
     */
    constructor(gameData, inventorySize) {
        this.character = { health: 20, maxHealth: 20 };
        this.rooms = {};
        this.items = {};
        this.enemies = {};
        this.currentRoomId = 'start';
        this.previousRoom = '';
        this.gameState = 'default';
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
        this.inventory = gameData.inventory;
    }
    getCurrentRoom() {
        return this.rooms[this.currentRoomId];
    }
    getItemFromInventoryIndex(index) {
        return this.items[this.inventory[index].itemId];
    }
    getEnemyInRoom() {
        return this.getCurrentRoom().enemies.length > 0 ? this.enemies[this.getCurrentRoom().enemies[0]] : null;
    }
    getItemById(itemId) {
        return this.items[itemId];
    }
    /**
     * returns the total character armor
     */
    getCharacterArmor() {
        let armor = 0;
        this.inventory.forEach(slot => {
            if (slot.type.startsWith('armor')) {
                const itemInSlot = this.getItemById(slot.itemId);
                if (itemInSlot && itemInSlot.armor)
                    armor += itemInSlot.armor;
            }
        });
        return armor;
    }
    takeItem() { }
    getMelee() {
        return this.inventory[0].itemId !== '' ? this.items[this.inventory[0].itemId] : null; // first item in inventory is the equipped melee item
    }
}
