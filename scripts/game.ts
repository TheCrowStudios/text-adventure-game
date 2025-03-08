import { GameState } from "./game-state.js";
import { gameData } from "./game-data.js";
import { HelperFunctions } from "./helper-functions.js";

type GameEvent = {
    type: string;
    payload: any;
}

type EventListener = (event: GameEvent) => void;

class EventSystem {
    private listeners: Record<string, EventListener[]> = {};

    addEventListener(type: string, callback: EventListener) {
        if (!this.listeners[type]) {
            this.listeners[type] = []; // add an array with key of type to listeners
        }

        this.listeners[type].push(callback);
    }

    dispatchEvent(event: GameEvent) {
        const { type } = event;
        console.log(`event ${type} dispatched`);
        if (this.listeners[type]) {
            this.listeners[type].forEach(callback => {
                callback(event);
            });
        }
    }
}

const events = new EventSystem();

class GameEngine {
    invSize: number;
    state: GameState;

    output: (text: string) => Promise<void>;

    constructor(gameData: any, outputFunction: (text: string) => Promise<void>, invSize: number) {
        this.invSize = invSize;
        this.state = new GameState(gameData, invSize);
        this.output = outputFunction;
        this.setupEvents();
    }

    async displayCurrentRoom() {
        const room = this.state.getCurrentRoom();
        const keys = Object.keys(room.exits);
        events.dispatchEvent({ type: 'roomChanged', payload: { exits: keys } });
        let description = `<h2 class="location">${room.name}</h2><p>${room.description}</p>`;
        const enemy = this.state.getEnemyInRoom();
        let enemyIsAlive = false;
        if (enemy) enemyIsAlive = !enemy.dead;

        if (!enemyIsAlive) {
            if (room.items.length > 0) {
                description += `<br>`;
                description += '<p>You see ';
                description += '<span class="item">' + room.items.map(itemId => this.state.items[itemId].name).join('</span>, <span class="item">') + '</span></p>';
            }

            description += `<br>`;
            description += `<p>Exits:</p><p>`;
            Object.entries(room.exits).forEach(([exitId, roomId]) => {
                description += `<span class="direction">${exitId}</span>: <span class="location">${this.state.rooms[roomId].name}</span>, `;
            });

            description = description.substring(0, description.length - 2); // remove comma at the end
            description += `</p>`;
        } else {
            const enemy = this.state.enemies[room.enemies[0]];
            description += `<p><strong>&lt;----- There is an enemy in this room, you are in combat! -----&gt;</strong></p>`;
            description += `<p>${enemy.description}</p>`;
            description += `<p>Name: <strong>${enemy.name}</strong></p>`;
            description += `<p>Average damage: <strong>${enemy.avgDamage}</strong></p>`;
            description += `<br>`;
            description += `<p><strong>&lt;----- Your turn! -----&gt;</strong></p>`;
            description += `<p>What do you do? (attack, defend, use &lt;item&gt;, run)</p>`;
        }
        // description +=  `${Object.keys(room.exits).join(', ')}</p>`

        await this.output(description);
        events.dispatchEvent({ type: 'inventoryUpdated', payload: {} });
    }

    setupEvents() {
        events.addEventListener('playerDead', (e) => {
            this.output(`<p>${e.payload.message}</p>`);
        })
    }

    async help() {
        let helpText = `<p><strong>List of commands:</strong></p>`;
        helpText += `<p><strong>go/move/m {direction}: </strong>go to exit in specified direction</p>`;
        helpText += `<p><strong>look: </strong>look around at the room again</p>`;
        helpText += `<p><strong>help: </strong>this</p>`;
        await this.output(helpText);
    }

    async executeCommand(command: string) {
        const parts = command.trim().toLowerCase().split(' ');
        const verb = parts[0]
        const noun = parts.slice(1).join(' '); // join up rest of array together into a string

        if (this.state.gameState === 'dead') return;

        switch (verb) {
            case 'go':
            case 'move':
            case 'm':
                if (this.state.gameState !== 'combat') this.goDirection(noun);
                else this.printInCombatWarning();
                break;
            case 'take':
            case 'grab':
            case 'get':
            case 'g':
            case 'loot':
                if (this.state.gameState !== 'combat') this.takeItem(noun);
                else this.printInCombatWarning();
                break;
            case 'use':
                // this.useItem(noun);
                break;
            case 'inventory':
                this.printInventory();
                break;
            case 'look':
                if (this.state.gameState !== 'combat') this.displayCurrentRoom();
                else this.printInCombatWarning();
                break;
            case 'attack':
                await this.attack();

                // TODO - check if enemy is alive
                const enemy = this.state.getEnemyInRoom();
                if (enemy && !enemy.dead) {
                    await this.displayEnemyStats();
                    await this.output(`<p><strong>&lt;----- Enemy turn -----&gt;</strong></p>`);
                    await this.enemyTurn();
                    await this.output(`<p><strong>&lt;----- Your turn! -----&gt;</strong></p>`);
                }
                break;
            case 'run':
                this.run();
                break;
            case 'help':
                this.help();
                break;
            default:
                await this.output(`<p>I don't understand "${command}". Type <strong>help</strong> for a list of commands.</p>`);
                break;
        }
    }

    async attack() {
        if (this.state.gameState !== 'combat') {
            await this.output('<p>You must be in combat to attack!</p>');
            return;
        }

        // if (!this.checkNoun(noun)) {
        //     await this.output('<p>You must include the name of the enemy to attack!</p>');
        //     return;
        // }

        const enemy = this.state.getEnemyInRoom();

        if (enemy) {
            const melee = this.state.getMelee();
            if (melee) {
                const damage = melee.avgDamage! + HelperFunctions.randomInt(-melee.damageRange!, melee.damageRange!)
                await this.output(`<p>You slash at ${enemy.name}`);
                if (HelperFunctions.chance(enemy.meleeBlockChance)) await this.output(`<p>${HelperFunctions.randomArrayItem(enemy.blockMessages)}</p>`)
                else await this.damageEnemy(enemy, damage, 'slash at'); // TODO - attack name on weapon
            } else {
                await this.output(`<p>You don't have a melee weapon equipped! Drag your weapon into the melee slot before ${enemy.name} attacks!</p>`);
            }
        } else {
            this.state.gameState = 'default';
        }
    }

    async enemyTurn() {
        console.log('do enemy turn');
        const enemy = this.state.getEnemyInRoom();

        if (enemy) {
            let move = 'attack';


            console.log(`enemy move: ${move}`);

            switch (move) {
                case 'attack':
                    const damage = this.calculateDamageWithArmor(enemy.avgDamage + HelperFunctions.randomInt(-enemy.damageRange, enemy.damageRange));
                    await this.output(`<p>${HelperFunctions.randomArrayItem(enemy.attackMessages)}</p>`);
                    await this.output(`<p>${enemy.name} deals you <strong>${damage}</strong> damage.</p>`);
                    if (this.state.getCharacterArmor() > 0) await this.output('<p>Your armor has reduced some of the damage.</p>');
                    this.damagePlayer(damage);
                    break;
            }
        } else {
            this.state.gameState = 'normal';
        }
    }

    async damagePlayer(damage: number, deathMessage?: string) {
        this.state.character.health -= damage;
        this.state.character.health = Math.max(0, this.state.character.health);

        if (this.state.character.health <= 0) {
            this.state.gameState = 'dead';
            events.dispatchEvent({ type: 'playerDead', payload: { message: deathMessage ? deathMessage : 'You have died' } });
        }

        events.dispatchEvent({ type: 'characterStatsUpdated', payload: {} });
    }

    calculateDamageWithArmor(damage: number) {
        return Math.round(damage * (1 - this.state.getCharacterArmor() * 0.01));
    }

    /**
     * damages the enemy, checks if the enemy is dead
     * @param enemy 
     * @param damage 
     * @param attackText 
     */
    async damageEnemy(enemy: any, damage: number, attackText: string) {
        enemy.health -= damage;
        enemy.health = Math.max(0, enemy.health);

        await this.output(`<p>You ${attackText} ${enemy.name} dealing <strong>${damage}</strong> damage!</p>`);

        if (enemy.health <= 0) {
            if (enemy.deathMessages) await this.output(`<p>${HelperFunctions.randomArrayItem(enemy.deathMessages)}</p>`);
            else await this.output(`<p>${enemy.name} drops dead on the ground...</p>`);

            this.output(`<p>Type <span class="command">look</span> to look around`);

            enemy.dead = true;
            this.state.gameState = 'normal';
            events.dispatchEvent({ type: 'enemyKilled', payload: { enemyId: enemy.id } });
        }
    }

    async displayEnemyStats() {
        const enemy = this.state.getEnemyInRoom();
        if (enemy) await this.output(`<p>${enemy.name} - health: <strong>${enemy.health}/${enemy.maxHealth}<p>`);
    }

    async run() {
        if (this.state.gameState !== 'combat') {
            await this.output('<p>You must have something to run away from!</p>');
            return;
        }

        const room = this.state.getCurrentRoom();

        if (!room.canRun) {
            await this.output(`<p>Uh oh, looks like you can't run!</p>`);
            return;
        }

        const roomId = this.state.currentRoomId;
        Object.keys(room.exits).forEach(async direction => {
            if (room.exits[direction] === this.state.previousRoom) {
                await this.output(`<p><strong>You have run from the fight!</strong></p>`);
                this.goDirection(direction);
                this.displayCurrentRoom();
            }
        })

        if (roomId === this.state.currentRoomId) {
            await this.output(`<p>Could not run!</p>`);
        }
    }

    async printInCombatWarning() {
        await this.output('<p>You cannot do that while in combat!</p>');
    }

    async goDirection(direction: string) {
        const room = this.state.getCurrentRoom();
        let exitId;

        this.state.previousRoom = this.state.currentRoomId;

        if (room.exits[direction]) {
            exitId = direction;
        } else if (room.exits[direction.substring(0, 1)]) {
            exitId = direction.substring(0, 1);
        } else {
            await this.output(`You can't go <strong>${direction}</strong> from here.`);
            return;
        }

        const roomAtExit = this.state.rooms[room.exits[exitId]];
        let hasAllItems = true;
        let requiredItemsMessage = '<p>Looks like I need: ';
        if (roomAtExit.requiredItems) roomAtExit.requiredItems.forEach(requiredItemId => {
            if (this.state.inventory.findIndex(slot => { return requiredItemId === slot.itemId }) == -1) {
                requiredItemsMessage += `<strong class="item">${this.state.items[requiredItemId].name}</strong>, `;
                hasAllItems = false;
            }
        })

        requiredItemsMessage = requiredItemsMessage.substring(0, requiredItemsMessage.length - 2); // remove comma
        requiredItemsMessage += ' before going in there.</p>';

        if (!hasAllItems) {
            await this.output(requiredItemsMessage);
            return;
        }

        if (roomAtExit.enemies.length > 0) {
            console.log('in combat');
            this.state.gameState = 'combat';
            events.dispatchEvent({ type: 'enterCombat', payload: {} });
        } else {
            this.state.gameState = 'normal';
        }

        this.state.currentRoomId = room.exits[exitId]; // set current room
        const enemy = this.state.getEnemyInRoom();
        this.displayCurrentRoom();
    }

    /**
     * finds specified item in room and calls addItemToInventory if it does find the requested item
     * @param noun 
     * @returns 
     */
    async takeItem(noun: string) {
        console.log('take item');
        const room = this.state.getCurrentRoom();

        if (!this.checkNoun(noun)) {
            await this.output('<p>You must include the name of the item to take!</p>');
            return;
        }

        let itemTaken = false;

        for (let i = 0; i < room.items.length; i++) {
            if (itemTaken) return;
            const item = room.items[i];
            let selectedItem = this.state.getItemById(item);

            if (selectedItem && selectedItem.name.toLowerCase() === noun.toLowerCase()) { // check if item in room matches noun
                if (this.addItemToInventory(item)) {
                    await this.output(`<p>Picked up <strong class="item">${selectedItem.name}</strong>.</p>`);
                    this.state.rooms[this.state.currentRoomId].items.splice(i, 1); // remove picked up item from room
                    itemTaken = true;
                    return;
                }

                await this.output('<p>Not enough space in inventory!</p>');
            }
        }

        if (!itemTaken) await this.output(`<p>Could not pick up <strong>${noun}</strong></p>`);
    }

    /**
     * outputs the contents of the inventory in text format
     */
    async printInventory() {
        let items = '<p>Inventory:</p>';
        let totalItems = 0;
        this.state.inventory.forEach((slot) => {
            const item = this.state.getItemById(slot.itemId);

            if (item) {
                items += `<p>- ${item.name}</p>`;
                totalItems += 1;
            }
        });

        if (totalItems === 0) items += '<p>There are no items in your inventory.</p>';

        await this.output(items);
    }

    /**
     * returns true if the noun is not null or empty
     * @param noun 
     * @returns 
     */
    checkNoun(noun: string): boolean {
        if (noun && noun.trim() !== '') return true;
        return false;
    }

    /**
     * adds item to the first free slot in the inventory and returns true if the item gets added
     * @param itemId 
     * @returns 
     */
    addItemToInventory(itemId: string): boolean {
        console.log(`adding ${itemId} to inventory`)
        const item = this.state.getItemById(itemId);
        let index = -1;

        if (item.type === 'melee') {
            console.log(`${itemId} is a melee, looking for empty melee slot`)
            index = this.state.inventory.findIndex(value => { return value.itemId === '' && value.type === 'melee' }); // find index of first empty melee slot if item is a melee weapon
        }

        if (item.type === 'armor-chestplate') {
            console.log(`${itemId} is a chestplate, looking for an empty chestplate slot`)
            index = this.state.inventory.findIndex(value => { return value.itemId === '' && value.type === 'armor-chestplate' });
        }

        if (item.type === 'armor-helmet') {
            console.log(`${itemId} is a helmet, looking for an empty helmet slot`)
            index = this.state.inventory.findIndex(value => { return value.itemId === '' && value.type === 'armor-helmet' });
        }

        if (item.type === 'armor-leggings') {
            console.log(`${itemId} is leggings, looking for an empty leggings slot`)
            index = this.state.inventory.findIndex(value => { return value.itemId === '' && value.type === 'armor-leggings' });
        }

        if (item.type === 'armor-boots') {
            console.log(`${itemId} is boots, looking for an empty boots slot`)
            index = this.state.inventory.findIndex(value => { return value.itemId === '' && value.type === 'armor-boots' });
        }

        if (index === -1) index = this.state.inventory.findIndex(value => { return value.itemId === '' && value.type === 'storage' }); // find index of first empty slot

        if (index !== -1) {
            this.state.inventory[index].itemId = itemId;
            console.log('added item to inventory');
            events.dispatchEvent({ type: 'inventoryUpdated', payload: {} });
            return true;
        }

        console.log('could not add item to inventory');
        return false;
    }

    swapInventoryItems(sourceInvIndex: number, targetIndex: number) {
        console.log(`swap inventory items ${sourceInvIndex} -> ${targetIndex}`)
        const sourceItem = this.state.getItemFromInventoryIndex(sourceInvIndex);
        const destinationItem = this.state.getItemFromInventoryIndex(targetIndex);
        const sourceSlot = this.state.inventory[sourceInvIndex];
        const destinationSlot = this.state.inventory[targetIndex];
        let sourceItemFitsDestinationSlotType = true;
        let destinationItemFitsSourceSlotType = true;
        console.log(`drag source item type: ${sourceItem.type}\ndrag destination slot type: ${destinationSlot.type}`)

        // check if placing a non special type (non equipable item) item in a non storage type slot
        if (sourceItem.type === 'item' && destinationSlot.type !== 'storage') {
            sourceItemFitsDestinationSlotType = false;
        }

        if (sourceItem.type !== 'item' && (destinationSlot.type !== 'storage' && sourceItem.type !== destinationSlot.type)) {
            sourceItemFitsDestinationSlotType = false;
        }

        // TODO - this is so janky, but it works, y'all could do this better
        // check if swapping items would cause an item to be placed in a mismatching slot, if it will, move source item to first empty slot of storage type (eg. swapping a sword with a torch)
        if (destinationItem && ((destinationItem.type === 'item' && sourceSlot.type !== 'storage') || (destinationItem.type !== 'item' && sourceSlot.type !== 'storage' && destinationItem.type !== sourceSlot.type))) {
            destinationItemFitsSourceSlotType = false;
        }

        if (!sourceItemFitsDestinationSlotType) {
            console.log('cancel swap due to source item not fitting destination slot');
            return; // cancel swap if target is not a storage slot when the item being move there is not an equipable item
        }

        if (!destinationItemFitsSourceSlotType) {
            console.log('cancel swap due to destination item not being equipable in destination slot, moving source item to first free slot');
            this.addItemToInventory(sourceSlot.itemId);
            this.state.inventory[sourceInvIndex].itemId = '';
            events.dispatchEvent({ type: 'inventoryUpdated', payload: {} });
            return; // cancel swap if target is not a storage slot when the item being move there is not an equipable item
        }

        const tempItemId = sourceSlot.itemId;
        this.state.inventory[sourceInvIndex].itemId = this.state.inventory[targetIndex].itemId;
        this.state.inventory[targetIndex].itemId = tempItemId;
        events.dispatchEvent({ type: 'inventoryUpdated', payload: {} });
    }
}

class CommandProcessor {
    gameEngine: GameEngine;

    /**
     *
     */
    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
    }
}

let game: GameEngine;
let currentDragOperation = false; // global variable to track if we are in a valid inventory drag operation

document.addEventListener('DOMContentLoaded', () => {
    const elementOutput = document.getElementById('game-output') as HTMLTextAreaElement;
    const formInput = document.getElementById('form-input') as HTMLFormElement;
    const elementInput = document.getElementById('input-command') as HTMLInputElement;
    const invSize = 16
    const btnSaveGame = document.getElementById('btn-save-game') as HTMLButtonElement;
    const btnLastSave = document.getElementById('btn-last-save') as HTMLButtonElement;
    const btnMainMenu = document.getElementById('btn-main-menu') as HTMLButtonElement;
    const btnLogOut = document.getElementById('btn-log-out') as HTMLButtonElement;
    let appendingText = false;

    // btnSaveGame.addEventListener('click')
    btnLastSave.addEventListener('click', () => {
        confirmationPopup('Are you sure you want to load the last save? Any unsaved progress will be lost.', () => document.location = '/game');
    })

    btnMainMenu.addEventListener('click', () => {
        confirmationPopup('Are you sure you want to exit to the main menu? Any unsaved progress will be lost.', () => document.location = '/game-menu');
    })

    btnLogOut.addEventListener('click', () => {
        confirmationPopup('Are you sure you want to log out? Any unsaved progress will be lost.', () => {
            document.cookie = 'username=; secure;';
            document.location = '/login'
        });
    })

    document.getElementById('dir-n')?.addEventListener('click', () => setInputText('go north'))
    document.getElementById('dir-e')?.addEventListener('click', () => setInputText('go east'))
    document.getElementById('dir-s')?.addEventListener('click', () => setInputText('go south'))
    document.getElementById('dir-w')?.addEventListener('click', () => setInputText('go west'))

    const appendOutput = async (text: string) => {
        const interval = 2;
        appendingText = true;

        let buffer = elementOutput.innerHTML; // Accumulate characters in a buffer
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            buffer += char; // Add character to the buffer

            await new Promise(resolve => {
                setTimeout(() => {
                    // Try to render valid HTML every few characters, or after every tag

                    if (char === '>' || (i % 5 === 0 && i > 0) || i === text.length - 1) {
                        elementOutput.innerHTML = buffer; // Update innerHTML with the buffer
                        elementOutput.scrollTop = elementOutput.scrollHeight;
                    }
                    resolve();
                }, interval);
            });
        }

        appendingText = false;
    };


    const handleDrop = (e: DragEvent) => {
        currentDragOperation = false;
        e.preventDefault();

        const targetCell = e.currentTarget as HTMLElement;
        const data = e.dataTransfer?.getData('text/plain');

        if (!data) return;

        try {
            const { sourceInvIndex } = JSON.parse(data);
            const targetIndex = Number.parseInt(targetCell.getAttribute('data-index') || '-1');

            targetCell.classList.remove('bg-(--bg-secondary)/70');

            if (sourceInvIndex !== null && targetIndex !== null) {
                game.swapInventoryItems(sourceInvIndex, targetIndex);
            }
        } catch (error) {
            console.error('error handling item drop:', error);
        }
    }

    /**
     * draws items in inventory
     * @param inventory 
     */
    const drawInventory = () => {
        console.log('draw inventory');
        const cells = document.querySelectorAll('.inv-cell');

        game.state.inventory.forEach((invSlot, i: number) => {
            let cell: Element = cells[0];

            // find respective cell
            for (let k = 0; k < cells.length; k++) {
                if (cells[k].getAttribute('data-index') == i.toString()) {
                    cell = cells[k];
                    break;
                }
            }

            cell.innerHTML = '';
            const item = game.state.getItemById(invSlot.itemId);

            if (invSlot.itemId !== '' && cell && item && item.img) {
                const img = document.createElement('img') as HTMLImageElement;
                img.src = `/images/items/${item.img}`;
                img.className = 'w-full aspect-square pixel-art'
                img.draggable = true;
                img.addEventListener('click', () => { selectInvItem(cell) })
                img.addEventListener('dragstart', handleDragStart);
                img.addEventListener('mouseenter', () => { displayItemInformation(item) });
                img.addEventListener('mouseleave', () => { hideItemInformation(i) });
                img.setAttribute('data-index', i.toString()); // corresponds to the actual position of the item in the inventory
                cell.appendChild(img);
            }
        })
    }

    const handleDragStart = (e: DragEvent) => {
        console.log('drag start')
        currentDragOperation = true;

        const target = e.target as HTMLElement;
        const index = Number.parseInt(target.getAttribute('data-index') || '-1');

        if (index !== null && game.state.inventory[index] && game.state.getItemFromInventoryIndex(index) !== null) {
            e.dataTransfer?.setData('text/plain', JSON.stringify({
                sourceInvIndex: index.toString() // the original index that corresponds to the inventory array
            }))
        }
    }

    let selectedInvCell: Element = document.createElement('div');

    /**
     * toggles the selected inventory item
     * @param item 
     * @param index 
     */
    const selectInvItem = (targetCell: Element) => {
        console.log('select item');
        const cells = document.querySelectorAll('.inv-cell');
        const selectedIndex = selectedInvCell.getAttribute('data-index');
        let newIndex = targetCell.getAttribute('data-index');

        if (selectedIndex !== newIndex) selectedInvCell = targetCell; // set selected cell
        else {
            selectedInvCell = document.createElement('div');
            newIndex = '-1';
        }

        cells.forEach((cell, i) => {
            if (cell.getAttribute('data-index') !== newIndex) cell.classList.remove('bg-(--bg-secondary)/70');
            else cell.classList.add('bg-(--bg-secondary)/70');
        })
    }

    const displayCharacterStats = () => {
        const textCharacterStats = document.getElementById('character-stats-div');
        if (textCharacterStats) {
            let armor = game.state.getCharacterArmor();;
            textCharacterStats.innerHTML = `<p><strong>Player Stats</strong></p>`;
            textCharacterStats.innerHTML = `<p>Health: <strong>${game.state.character.health}/${game.state.character.maxHealth}</strong></p>`;
            textCharacterStats.innerHTML += `<p>Armor: <strong>${armor}</strong></p>`;
        }
    }

    const displayItemInformation = (item: any) => {
        const textItemInformation = document.getElementById('item-information-div');
        if (textItemInformation) {
            textItemInformation.innerHTML = `<p><strong>${item.name}</strong></p><p>${item.description}</p>`;

            if (item.avgDamage) textItemInformation.innerHTML += `<p>Avg. Damage: <strong>${item.avgDamage}</strong></p>`;
            if (item.armor) textItemInformation.innerHTML += `<p>Armor: <strong>${item.armor}</strong></p>`;
        }
    }

    const hideItemInformation = (index: number) => {
        const textItemInformation = document.getElementById('item-information-div');
        const dataIndex = Number.parseInt(selectedInvCell.getAttribute('data-index') || '-1');
        if (textItemInformation && dataIndex !== index) textItemInformation.innerHTML = '';
        if (dataIndex !== -1) displayItemInformation(game.state.getItemFromInventoryIndex(dataIndex)); // display information on currently selected item
    }

    formInput.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (appendingText) return;
        const command = elementInput.value;

        if (command.trim() === '') return;

        await appendOutput(`<p><strong>&gt; ${command}</strong></p>`);
        game.executeCommand(command);
        elementInput.value = '';
        elementInput.focus();
    })

    elementInput.focus();

    /**
     * updates the compass to only show avaliable exits
     * @param directions 
     */
    const updateCompass = (directions: string[]) => {
        const n = document.getElementById('dir-n');
        const e = document.getElementById('dir-e');
        const s = document.getElementById('dir-s');
        const w = document.getElementById('dir-w');

        n?.classList.add('hidden');
        e?.classList.add('hidden');
        s?.classList.add('hidden');
        w?.classList.add('hidden');

        directions.forEach(dir => {
            switch (dir) {
                case 'n':
                    n?.classList.remove('hidden');
                    break;
                case 'e':
                    e?.classList.remove('hidden');
                    break;
                case 's':
                    s?.classList.remove('hidden');
                    break;
                case 'w':
                    w?.classList.remove('hidden');
                    break;
            }
        })
    }

    events.addEventListener('roomChanged', (e) => updateCompass(e.payload.exits));

    game = new GameEngine(gameData, appendOutput, invSize);
    game.displayCurrentRoom();

    const generateInventory = () => {
        // generate inventory
        let inventory: HTMLDivElement;
        for (let i = 0; i < game.state.inventory.length; i++) {
            const slot = game.state.inventory[i];
            const cell = document.createElement('div') as HTMLDivElement;
            cell.className = 'aspect-square p-1 border-2 border-(--bg-tertiary) bg-(--bg-secondary)/0 backdrop-opacity-0 hover:bg-(--bg-secondary)/70 inv-cell';
            cell.setAttribute('data-index', i.toString());
            if (slot.slotImg) cell.classList.add(`empty:bg-[url(/images/inventory/${slot.slotImg})]`, 'bg-cover', 'pixel-art');

            if (slot.type !== 'storage') {
                inventory = document.getElementById('character') as HTMLDivElement;
                cell.className += ' absolute w-1/4 bg-(--bg-secondary)/0';

                switch (slot.type) {
                    case 'melee':
                        cell.className += ' left-0 top-1/2 -translate-y-1/2';
                        break;
                    case 'armor-helmet':
                        cell.className += ' left-1/2 top-1/12 -translate-x-1/2 -translate-y-1/2';
                        break;
                    case 'armor-chestplate':
                        cell.className += ' left-1/2 top-4/12 -translate-x-1/2 -translate-y-1/2';
                        break;
                    case 'armor-leggings':
                        cell.className += ' left-1/2 top-7/12 -translate-x-1/2 -translate-y-1/2';
                        break;
                    case 'armor-boots':
                        cell.className += ' left-1/2 top-10/12 -translate-x-1/2 -translate-y-1/2';
                        break;
                }
            } else {
                inventory = document.getElementById('inventory') as HTMLDivElement;
            }

            inventory.appendChild(cell);
        }

        const initializeDropEvents = () => {
            // initialize drop events
            const cells = document.querySelectorAll('.inv-cell');

            cells.forEach((cell) => {
                cell.addEventListener('dragover', (e: DragEvent) => {
                    if (!currentDragOperation) return;
                    e.preventDefault();

                    // console.log(cell.getAttribute('data-index'))

                    cell.classList.add('bg-(--bg-secondary)/70') // highlight
                });

                cell.addEventListener('dragleave', () => {
                    if (!currentDragOperation) return;
                    cell.classList.remove('bg-(--bg-secondary)/70') // remove highlight
                });

                cell.addEventListener('drop', handleDrop);
            })
        }

        initializeDropEvents();
        drawInventory();
        displayCharacterStats();

        events.addEventListener('inventoryUpdated', (e: GameEvent) => {
            drawInventory();
        })

        events.addEventListener('characterStatsUpdated', () => {
            displayCharacterStats();
        })
    }

    generateInventory();
})

/**
 * forces the input to be set to the value of text
 * @param text 
 */
function setInputText(text: string) {
    const elementInput = document.getElementById('input-command') as HTMLInputElement;
    elementInput.value = text;
    elementInput.focus();
}

function confirmationPopup(text: string, callback: () => void) {
    const txtMessage = document.getElementById('txt-confirmation-message') as HTMLSpanElement;
    const confirmation = document.getElementById('confirmation-popup');
    const confirm = document.getElementById('btn-confirmation-confirm') as HTMLButtonElement;
    const cancel = document.getElementById('btn-confirmation-cancel') as HTMLButtonElement;

    txtMessage.textContent = text;

    confirm.addEventListener('click', callback);
    cancel.addEventListener('click', () => {
        confirmation?.classList.add('-translate-y-[200%]', 'opacity-0', 'pointer-events-none');
    })

    confirmation?.classList.remove('-translate-y-[200%]', 'opacity-0', 'pointer-events-none');
}

if (!document.cookie.includes('username=user')) document.location = '/login';