import { GameState } from "./game-state.js";
import { gameData } from "./game-data.js";
class EventSystem {
    constructor() {
        this.listeners = {};
    }
    addEventListener(type, callback) {
        if (!this.listeners[type]) {
            this.listeners[type] = []; // add an array with key of type to listeners
        }
        this.listeners[type].push(callback);
    }
    dispatchEvent(event) {
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
    constructor(gameData, outputFunction, updateCompass, invSize) {
        this.invSize = invSize;
        this.state = new GameState(gameData, invSize);
        this.output = outputFunction;
        this.updateCompass = updateCompass;
    }
    displayCurrentRoom() {
        const room = this.state.getCurrentRoom();
        let description = `<h2 class="text-amber-200">${room.name}</h2><p>${room.description}</p>`;
        if (room.items.length > 0) {
            description += `<br>`;
            description += '<p>You see ';
            description += '<span class="text-amber-200">' + room.items.map(itemId => this.state.items[itemId].name).join('</span>, <span class="text-amber-200">') + '</span></p>';
        }
        description += `<br>`;
        description += `<p>Exits:</p><p>`;
        Object.entries(room.exits).forEach(([exitId, roomId]) => {
            description += `${exitId}: <span class="text-amber-200">${this.state.rooms[roomId].name}</span>, `;
        });
        description = description.substring(0, description.length - 2); // remove comma at the end
        description += `</p>`;
        // description +=  `${Object.keys(room.exits).join(', ')}</p>`
        this.output(description);
        this.updateCompass(Object.keys(room.exits));
        events.dispatchEvent({ type: 'inventoryUpdated', payload: {} });
    }
    help() {
        let helpText = `<p><strong>List of commands:</strong></p>`;
        helpText += `<p><strong>go/move/m {direction}: </strong>go to exit in specified direction</p>`;
        helpText += `<p><strong>look: </strong>look around at the room again</p>`;
        helpText += `<p><strong>help: </strong>this</p>`;
        this.output(helpText);
    }
    executeCommand(command) {
        const parts = command.trim().toLowerCase().split(' ');
        const verb = parts[0];
        const noun = parts.slice(1).join(' '); // join up rest of array together into a string
        // TODO - different switches based on game state such as default, fighting, and any other states
        switch (verb) {
            case 'go':
            case 'move':
            case 'm':
                this.goDirection(noun);
                break;
            case 'take':
            case 'grab':
            case 'get':
            case 'g':
            case 'loot':
                this.takeItem(noun);
                break;
            case 'use':
                // this.useItem(noun);
                break;
            case 'look':
                this.displayCurrentRoom();
                break;
            case 'help':
                this.help();
                break;
            default:
                this.output(`<p>I don't understand "${command}". Type <strong>help</strong> for a list of commands.</p>`);
                break;
        }
    }
    goDirection(direction) {
        const room = this.state.getCurrentRoom();
        let exitId;
        if (room.exits[direction]) {
            exitId = direction;
        }
        else if (room.exits[direction.substring(0, 1)]) {
            exitId = direction.substring(0, 1);
        }
        else {
            this.output(`You can't go <strong>${direction}</strong> from here.`);
            return;
        }
        const roomAtExit = this.state.rooms[room.exits[exitId]];
        let hasAllItems = true;
        let requiredItemsMessage = '<p>Looks like I need: ';
        if (roomAtExit.requiredItems)
            roomAtExit.requiredItems.forEach(requiredItemId => {
                if (this.state.inventory.findIndex(itemId => { return requiredItemId === itemId; }) == -1) {
                    requiredItemsMessage += `<strong class="text-amber-200">${this.state.items[requiredItemId].name}</strong>, `;
                    hasAllItems = false;
                }
            });
        requiredItemsMessage = requiredItemsMessage.substring(0, requiredItemsMessage.length - 2); // remove comma
        requiredItemsMessage += ' before going in there.</p>';
        if (!hasAllItems) {
            this.output(requiredItemsMessage);
            return;
        }
        this.state.currentRoomId = room.exits[exitId]; // set current room
        this.displayCurrentRoom();
    }
    takeItem(noun) {
        console.log('take item');
        const room = this.state.getCurrentRoom();
        let itemTaken = false;
        room.items.forEach((item, i) => {
            if (itemTaken)
                return;
            let selectedItem = this.state.items[item];
            if (selectedItem && selectedItem.name.toLowerCase() === noun.toLowerCase()) {
                if (this.addItemToInventory(item)) {
                    this.output(`<p>Picked up <strong class="text-amber-200">${selectedItem.name}</strong>.</p>`);
                    events.dispatchEvent({ type: 'inventoryUpdated', payload: {} });
                    this.state.rooms[this.state.currentRoomId].items.splice(i, 1); // remove picked up item from room
                    itemTaken = true;
                    return;
                }
                this.output('<p>Not enough space in inventory!</p>');
            }
        });
        if (!itemTaken)
            this.output(`<p>Could not pick up <strong>${noun}</strong></p>`);
    }
    /**
     * adds item to the first free slot in the inventory and returns true if the item gets added
     * @param itemId
     * @returns
     */
    addItemToInventory(itemId) {
        const index = this.state.inventory.findIndex(value => { return value == ''; }); // find index of first empty slot
        if (index !== -1) {
            this.state.inventory[index] = itemId;
            return true;
        }
        return false;
    }
    swapInventoryItems(sourceInvIndex, targetIndex) {
        const temp = this.state.inventory[sourceInvIndex];
        this.state.inventory[sourceInvIndex] = this.state.inventory[targetIndex];
        this.state.inventory[targetIndex] = temp;
        events.dispatchEvent({ type: 'inventoryUpdated', payload: {} });
    }
}
class CommandProcessor {
    /**
     *
     */
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
    }
}
let game;
let currentDragOperation = false; // global variable to track if we are in a valid inventory drag operation
document.addEventListener('DOMContentLoaded', () => {
    var _a, _b, _c, _d;
    const elementOutput = document.getElementById('game-output');
    const formInput = document.getElementById('form-input');
    const elementInput = document.getElementById('input-command');
    const inventory = document.getElementById('inventory');
    const invSize = 16;
    (_a = document.getElementById('dir-n')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => setInputText('go north'));
    (_b = document.getElementById('dir-e')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => setInputText('go east'));
    (_c = document.getElementById('dir-s')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => setInputText('go south'));
    (_d = document.getElementById('dir-w')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => setInputText('go west'));
    const appendOutput = (text) => {
        elementOutput.innerHTML += `${text}`;
        elementOutput.scrollTop = elementOutput.scrollHeight;
    };
    const handleDrop = (e) => {
        var _a;
        currentDragOperation = false;
        e.preventDefault();
        const targetCell = e.currentTarget;
        const data = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData('text/plain');
        if (!data)
            return;
        try {
            const { sourceInvIndex } = JSON.parse(data);
            const targetIndex = Number.parseInt(targetCell.getAttribute('data-index') || '-1');
            targetCell.classList.remove('bg-(--bg-secondary)');
            if (sourceInvIndex !== null && targetIndex !== null) {
                game.swapInventoryItems(sourceInvIndex, targetIndex);
            }
        }
        catch (error) {
            console.error('error handling item drop:', error);
        }
    };
    /**
     * draws items in inventory
     * @param inventory
     */
    const drawInventory = () => {
        console.log('draw inventory');
        const cells = document.querySelectorAll('.inv-cell');
        game.state.inventory.forEach((itemId, i) => {
            cells[i].innerHTML = '';
            const item = game.state.items[itemId];
            if (itemId !== '' && cells[i] && item.img) {
                const img = document.createElement('img');
                img.src = `/images/items/${item.img}`;
                img.className = 'w-full aspect-square pixel-art';
                img.draggable = true;
                img.addEventListener('click', () => { selectInvItem(i); });
                img.addEventListener('dragstart', handleDragStart);
                img.addEventListener('mouseenter', () => { displayItemInformation(item); });
                img.addEventListener('mouseleave', () => { hideItemInformation(i); });
                img.setAttribute('data-index', i.toString()); // corresponds to the actual position of the item in the inventory
                cells[i].appendChild(img);
            }
        });
    };
    events.addEventListener('inventoryUpdated', (e) => drawInventory());
    const handleDragStart = (e) => {
        var _a;
        currentDragOperation = true;
        const target = e.target;
        const index = Number.parseInt(target.getAttribute('data-index') || '-1');
        if (index !== null && game.state.inventory[index] && game.state.inventory[index] != '') {
            (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData('text/plain', JSON.stringify({
                sourceInvIndex: index.toString() // the original index that corresponds to the inventory array
            }));
        }
    };
    let selectedInvSlot = -1;
    /**
     * toggles the selected inventory item
     * @param item
     * @param index
     */
    const selectInvItem = (index) => {
        console.log('select item');
        const cells = document.querySelectorAll('.inv-cell');
        if (selectedInvSlot !== index)
            selectedInvSlot = index;
        else
            selectedInvSlot = -1;
        cells.forEach((cell, i) => {
            if (i !== index || selectedInvSlot === -1)
                cell.classList.remove('bg-(--bg-secondary)');
            else
                cell.classList.add('bg-(--bg-secondary)');
        });
    };
    const displayItemInformation = (item) => {
        const textItemInformation = document.getElementById('item-information-div');
        if (textItemInformation) {
            textItemInformation.innerHTML = `<p><strong>${item.name}</strong></p><p>${item.description}</p>`;
            textItemInformation.innerHTML += `<p>Avg. Damage: ${item.avgDamage}</p>`;
        }
    };
    const hideItemInformation = (index) => {
        const textItemInformation = document.getElementById('item-information-div');
        if (textItemInformation && selectedInvSlot !== index)
            textItemInformation.innerHTML = '';
        if (selectedInvSlot !== -1)
            displayItemInformation(game.state.getItemFromInventoryIndex(selectedInvSlot)); // display information on currently selected item
    };
    formInput.addEventListener('submit', (e) => {
        e.preventDefault();
        const command = elementInput.value;
        if (command.trim() === '')
            return;
        appendOutput(`<p><strong>&gt; ${command}</strong></p>`);
        game.executeCommand(command);
        elementInput.value = '';
        elementInput.focus();
    });
    elementInput.focus();
    // generate inventory
    for (let i = 0; i < invSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'aspect-square p-1 border-2 border-(--bg-tertiary) bg-(--bg-primary) hover:bg-(--bg-secondary) inv-cell';
        cell.id = `inv-cell-${i}`;
        cell.setAttribute('data-index', i.toString());
        inventory.appendChild(cell);
    }
    // initialize drop events
    const cells = document.querySelectorAll('.inv-cell');
    cells.forEach((cell) => {
        cell.addEventListener('dragover', (e) => {
            if (!currentDragOperation)
                return;
            e.preventDefault();
            cell.classList.add('bg-(--bg-secondary)'); // highlight
        });
        cell.addEventListener('dragleave', () => {
            if (!currentDragOperation)
                return;
            cell.classList.remove('bg-(--bg-secondary)'); // remove highlight
        });
        cell.addEventListener('drop', handleDrop);
    });
    /**
     * updates the compass to only show avaliable exits
     * @param directions
     */
    const updateCompass = (directions) => {
        const n = document.getElementById('dir-n');
        const e = document.getElementById('dir-e');
        const s = document.getElementById('dir-s');
        const w = document.getElementById('dir-w');
        n === null || n === void 0 ? void 0 : n.classList.add('hidden');
        e === null || e === void 0 ? void 0 : e.classList.add('hidden');
        s === null || s === void 0 ? void 0 : s.classList.add('hidden');
        w === null || w === void 0 ? void 0 : w.classList.add('hidden');
        directions.forEach(dir => {
            switch (dir) {
                case 'n':
                    n === null || n === void 0 ? void 0 : n.classList.remove('hidden');
                    break;
                case 'e':
                    e === null || e === void 0 ? void 0 : e.classList.remove('hidden');
                    break;
                case 's':
                    s === null || s === void 0 ? void 0 : s.classList.remove('hidden');
                    break;
                case 'w':
                    w === null || w === void 0 ? void 0 : w.classList.remove('hidden');
                    break;
            }
        });
    };
    game = new GameEngine(gameData, appendOutput, updateCompass, invSize);
    game.displayCurrentRoom();
});
/**
 * forces the input to be set to the value of text
 * @param text
 */
function setInputText(text) {
    const elementInput = document.getElementById('input-command');
    elementInput.value = text;
    elementInput.focus();
}
