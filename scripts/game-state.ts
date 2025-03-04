interface GameObject {
    id: string;
    name: string;
    description: string;
}

interface Room extends GameObject {
    exits: Record<string, string>; // direction, roomId
    items: string[]; // item ids
    enemies: string[]; // enemy ids
    requiredItems?: string[];
}

interface Item extends GameObject {
    canTake: boolean;
    useEffect?: string; // optional, the effect when used
    img?: string;
    avgDamage?: number;
    damageRange?: number;
}

interface Enemy extends GameObject {
    health: number;
    avgDamage: number; // base damage
    damageRange: number; // how much the damage can deviate from the average damage
}

export class GameState {
    inventorySize: number;
    rooms: Record<string, Room> = {};
    items: Record<string, Item> = {};
    enemies: Record<string, Enemy> = {};
    currentRoomId: string = 'start';
    inventory: string[];
    inCombat: boolean = false;

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
        this.rooms = gameData.rooms || {};
        this.items = gameData.items || {};
        this.enemies = gameData.enemies || {};
        this.currentRoomId = gameData.startRoom || 'start';

        gameData.inventory.forEach((itemId: any, i: number) => {
            if (itemId) this.inventory[i] = itemId;
        })
    }

    getCurrentRoom(): Room {
        return this.rooms[this.currentRoomId];
    }

    getItemFromInventoryIndex(index: number) {
        return this.items[this.inventory[index]];
    }

    getEnemyInRoom() {
        return this.getCurrentRoom().enemies.length > 0 ? this.enemies[this.getCurrentRoom().enemies[0]] : null;
    }
}