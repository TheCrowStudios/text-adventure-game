interface Character {
    health: number;
    maxHealth: number;
}

interface GameObject {
    id: string;
    name: string;
    description: string;
}

interface Room extends GameObject {
    exits: Record<string, string>; // direction, roomId
    items: string[]; // item ids
    enemies: string[]; // enemy ids
    canRun?: boolean; // whether the player can run from a fight to the previous room
    requiredItems?: string[];
}

interface Item extends GameObject {
    canTake: boolean;
    useEffect?: string; // optional, the effect when used
    img?: string;
    type: string;
    avgDamage?: number;
    damageRange?: number;
    armor?: number;
}

interface Enemy extends GameObject {
    health: number;
    maxHealth: number;
    avgDamage: number; // base damage
    damageRange: number; // how much the damage can deviate from the average damage
    items: string[]; // lootable item ids
    dead: boolean;
    meleeBlockChance: number;
    blockMessages: string[];
    attackMessages: string[];
    deathMessages?: string[]; // the message that is output when you kill the enemy
}

interface InvSlot {
    type: string;
    itemId: string;
    slotImg?: string;
}

export class GameState {
    character: Character = {health: 20, maxHealth: 20};
    inventorySize: number;
    rooms: Record<string, Room> = {};
    items: Record<string, Item> = {};
    enemies: Record<string, Enemy> = {};
    currentRoomId: string = 'start';
    inventory: InvSlot[];
    previousRoom: string = '';
    gameState: string = 'default';

    /**
     *
     */
    constructor(gameData: any, inventorySize: number) {
        this.inventory = new Array(inventorySize).fill(''); // initialize array with no items
        this.loadGameData(gameData);
        this.inventorySize = inventorySize;
    }

    /**
     * initializes this objects variables
     * @param gameData the game data object
     */
    loadGameData(gameData: any) {
        this.character = gameData.character || {health: 20, maxHealth: 20, armor: 0};
        this.rooms = gameData.rooms || {};
        this.items = gameData.items || {};
        this.enemies = gameData.enemies || {};
        this.currentRoomId = gameData.startRoom || 'start';
        this.inventory = gameData.inventory;
    }

    getCurrentRoom(): Room {
        return this.rooms[this.currentRoomId];
    }

    getItemFromInventoryIndex(index: number) {
        return this.items[this.inventory[index].itemId];
    }

    getEnemyInRoom() {
        return this.getCurrentRoom().enemies.length > 0 ? this.enemies[this.getCurrentRoom().enemies[0]] : null;
    }

    getItemById(itemId: string): Item {
        return this.items[itemId];
    }

    /**
     * returns the total character armor
     */
    getCharacterArmor(): number {
        let armor = 0;

        this.inventory.forEach(slot => {
            if (slot.type.startsWith('armor')) {
                const itemInSlot = this.getItemById(slot.itemId);
                if (itemInSlot && itemInSlot.armor) armor += itemInSlot.armor;
            }
        })

        return armor;
    }

    takeItem() {}

    getMelee() {
        return this.inventory[0].itemId !== '' ? this.items[this.inventory[0].itemId] : null; // first item in inventory is the equipped melee item
    }
}