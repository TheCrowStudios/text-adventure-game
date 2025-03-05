export const gameData = {
    startRoom: "home", // starting room
    health: 20,
    maxHealth: 20,
    inCombat: false, // do not change
    inventory: [{ type: 'melee', itemId: '', slotImg: '' }, { type: 'armor-chestplate', itemId: '', slotImg: '' }, { type: 'armor-helmet', itemId: '' }, { type: 'armor-leggings', itemId: '' },
        { type: 'armor-boots', itemId: '' }, { type: 'storage', itemId: '' }, { type: 'storage', itemId: '' }, { type: 'storage', itemId: '' },
        { type: 'storage', itemId: '' }, { type: 'storage', itemId: '' }, { type: 'storage', itemId: '' }, { type: 'storage', itemId: '' },
        { type: 'storage', itemId: '' }, { type: 'storage', itemId: '' }, { type: 'storage', itemId: '' }, { type: 'storage', itemId: '' },
    ], // put whatever starting items here
    rooms: {
        "home": {
            id: "home",
            name: "Your home",
            description: "You wake up in your house that is almost falling apart, but you can't do much about it since you're just a simple peasant, like everyone else here.", // TODO - dynamic description based on game stage, such as start of game, mid game, end game, perhaps?
            exits: { "e": "village_outside" },
            items: ["torch"],
            enemies: []
        },
        "village_outside": {
            id: "village_outside",
            name: "The village square",
            description: "The village square. It's pretty dirty, but hey, at least it's sunny out here. Today's a beautiful day.", // TODO - dynamic weather which affects certain things like combat?
            exits: { "w": "home", "n": "village_outskirts_n", "e": "village_blacksmith" },
            items: [],
            enemies: []
        },
        "village_blacksmith": {
            id: "village_blacksmith",
            name: "Blacksmith",
            description: "The local village blacksmith",
            exits: { "w": "village_outside" },
            items: ["dagger", "steel_chestplate"],
            enemies: []
        },
        "village_outskirts_n": {
            id: "village_outskirts_n",
            name: "Village outskirts",
            description: "A beautiful field with lush green grass",
            exits: { "n": "village_forest", "s": "village_outside" },
            items: [],
            enemies: ["goblin_regular"], // so far only works with one enemy at most per room.
            requiredItems: ["dagger"] // require the dagger item to enter this room.
        },
        "village_forest": {
            id: "village_forest",
            name: "Forest",
            description: "A dense forest n of the village outskirts",
            exits: { "s": "village_outskirts_n" },
            items: [],
            enemies: []
        }
    },
    items: {
        "torch": {
            id: "torch",
            name: "Torch",
            description: "A wooden torch that provides light where there is a lack of it",
            canTake: true,
            useEffect: "light", // TODO - give item types, such as weapon, food, or armor, etc
            img: "torch.png", // NOTE - images for items must be placed under /images/items/nameofimage
            type: "item"
        },
        "dagger": {
            id: "dagger",
            name: "Dagger",
            description: "A small knife used for cutting whatever you like.",
            canTake: true,
            useEffect: "attack",
            img: "dagger.png",
            type: "melee",
            avgDamage: 4,
            damageRange: 1
        },
        "steel_sword": {
            id: "steel_sword",
            name: "Sword",
            description: "A steel sword",
            canTake: true,
            useEffect: "attack",
            img: "sword.png",
            type: "melee",
            avgDamage: 8,
            damageRange: 3
        },
        "steel_chestplate": {
            id: "steel_chestplate",
            name: "Chestplate",
            description: "Steel Chestplate. A solid peace of armor to protect you against things, it's kinda heavy",
            canTake: true,
            useEffect: "attack",
            img: "steel_chestplate.png",
            type: "armor-chestplate",
            armor: 10
        }
    },
    enemies: {
        "goblin_regular": {
            id: "goblin_regular",
            name: "Regular goblin",
            description: "*little goblin runs past* woah what the hell did you see that",
            health: 12,
            avgDamage: 2,
            damageRange: 1,
            canRun: true // whether the player can run from the fight to the previous room
        }
    }
};
