export const gameData = {
    startRoom: "village_outside",
    inventory: [ "torch" ],
    rooms: {
        "home": {
            id: "home",
            name: "Your home",
            description: "A house that is almost falling apart, but you can't do much about it since you're just a simple peasant, like everyone else here.", // TODO - dynamic description based on game stage, such as start of game, mid game, end game, perhaps?
            exits: { "e": "village_outside" },
            items: ["torch"],
            enemies: []
        },
        "village_outside": {
            id: "village_outside",
            name: "The village square",
            description: "The village square. It's pretty dirty, and smells of farm animals, but you're used to it. It's sunny out here.", // TODO - dynamic weather which affects certain things like combat?
            exits: { "w": "home", "n": "village_outskirts_n", "e": "village_blacksmith" },
            items: [],
            enemies: []
        },
        "village_blacksmith": {
            id: "village_blacksmith",
            name: "Blacksmith",
            description: "The local village blacksmith",
            exits: { "w": "village_outside" },
            items: [],
            enemies: []
        },
        "village_outskirts_n": {
            id: "village_outskirts_n",
            name: "Village outskirts",
            description: "A beautiful field with lush green grass",
            exits: { "n": "village_forest", "s": "village_outside" },
            items: [],
            enemies: []
        },
        "village_forest": {
            id: "village_forest",
            name: "Forest",
            description: "A dense forest n of the village outskirts",
            exits: { "s": "village_outskirts_n" },
            items: [],
            enemies: ["goblin_regular"]
        }
    },
    items: {
        "torch": {
            id: "torch",
            name: "Torch",
            description: "A wooden torch that provides light where there is a lack of it",
            canTake: true,
            useEffect: "light", // TODO - give item types, such as weapon, food, or armor, etc
            img: "torch.png" // NOTE - images for items must be placed under /images/items/nameofimage
        }
    },
    enemies: {
        "goblin_regular": {
            id: "goblin_regular",
            name: "Regular goblin",
            description: "Silly goober looking goblin.",
            health: 12,
            avgDamage: 2,
            damageRange: 1
        }
    }
};