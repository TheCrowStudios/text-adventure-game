interface GameObject {
    id: string;
    name: string;
    description: string;
}

interface Room extends GameObject {
    exits: Record<string, string>; // direction, roomId
    items: string[]; // item ids
    enemies: string[]; // enemy ids
}

interface Item extends GameObject {
    canTake: boolean;
    useEffect?: string; // optional, the id of the effect when used
    img?: string;
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
}