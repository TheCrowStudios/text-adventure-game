import { GameState } from "./game-state.js";
import { gameData } from "./game-data.js";

class GameEngine {
    invSize: number;
    state: GameState;
    output: (text: String) => void;
    drawInventory: (inventory: string[]) => void;
    updateCompass: (compass: string[]) => void;

    constructor(gameData: any, outputFunction: (text: String) => void, drawInventory: (inventory: string[]) => void, updateCompass: (directions: string[]) => void, invSize: number) {
        this.invSize = invSize;
        this.state = new GameState(gameData, invSize);
        this.output = outputFunction;
        this.drawInventory = drawInventory;
        this.updateCompass = updateCompass;
    }

    displayCurrentRoom() {
        const room = this.state.getCurrentRoom();
        let description = `<h2 class="text-amber-200">${room.name}</h2><p>${room.description}</p>`;

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
        this.drawInventory(this.state.inventory);
    }

    help() {
        let helpText = `<p><strong>List of commands:</strong></p>`;
        helpText += `<p><strong>go/move/m {direction}: </strong>go to exit in specified direction</p>`;
        helpText += `<p><strong>look: </strong>look around at the room again</p>`;
        helpText += `<p><strong>help: </strong>this</p>`;
        this.output(helpText);
    }

    executeCommand(command: string) {
        const parts = command.trim().toLowerCase().split(' ');
        const verb = parts[0]
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
                // this.takeItem(noun);
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

    goDirection(direction: string) {
        const room = this.state.getCurrentRoom();

        if (room.exits[direction]) {
            this.state.currentRoomId = room.exits[direction];
            this.displayCurrentRoom();
        } else if (room.exits[direction.substring(0, 1)]) {
            this.state.currentRoomId = room.exits[direction.substring(0, 1)];
            this.displayCurrentRoom();
        } else {
            this.output(`You can't go <strong>${direction}</strong> from here.`);
        }
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
    const inventory = document.getElementById('inventory') as HTMLDivElement;
    const invSize = 16

    document.getElementById('dir-n')?.addEventListener('click', () => setInputText('go north'))
    document.getElementById('dir-e')?.addEventListener('click', () => setInputText('go east'))
    document.getElementById('dir-s')?.addEventListener('click', () => setInputText('go south'))
    document.getElementById('dir-w')?.addEventListener('click', () => setInputText('go west'))

    const appendOutput = (text: String) => {
        elementOutput.innerHTML += `${text}`;
        elementOutput.scrollTop = elementOutput.scrollHeight;
    };

    formInput.addEventListener('submit', (e) => {
        e.preventDefault();
        const command = elementInput.value;

        if (command.trim() === '') return;

        appendOutput(`<p><strong>&gt; ${command}</strong></p>`);
        game.executeCommand(command);
        elementInput.value = '';
        elementInput.focus();
    })

    elementInput.focus();

    // generate inventory
    for (let i = 0; i < invSize; i++) {
        const cell = document.createElement('div') as HTMLDivElement;
        cell.className = 'aspect-square p-1 border-2 border-(--bg-tertiary) bg-(--bg-primary) hover:bg-(--bg-secondary) inv-cell';
        cell.id = `inv-cell-${i}`;
        cell.setAttribute('data-index', i.toString());
        inventory.appendChild(cell);
    }

    // initialize drop events
    const cells = document.querySelectorAll('.inv-cell');

    cells.forEach((cell) => {
        cell.addEventListener('dragover', (e: DragEvent) => {
            if (!currentDragOperation) return;
            e.preventDefault();

            cell.classList.add('bg-(--bg-secondary)') // highlight
        });

        cell.addEventListener('dragleave', () => {
            if (!currentDragOperation) return;
            cell.classList.remove('bg-(--bg-secondary)') // remove highlight
        });

        cell.addEventListener('drop', handleDrop);
    })

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

    game = new GameEngine(gameData, appendOutput, drawInventory, updateCompass, invSize);
    game.displayCurrentRoom();
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

const handleDrop = (e: DragEvent) => {
    currentDragOperation = false;
    e.preventDefault();

    const targetCell = e.currentTarget as HTMLElement;
    const data = e.dataTransfer?.getData('text/plain');

    if (!data) return;

    try {
        const { sourceInvIndex } = JSON.parse(data);
        const targetIndex = Number.parseInt(targetCell.getAttribute('data-index') || '-1');

        if (sourceInvIndex !== null && targetIndex !== null) {
            game.state.swapInventoryItems(sourceInvIndex, targetIndex);
            drawInventory(game.state.inventory); // TODO - fire inventory updated event
        }
    } catch (error) {
        console.error('error handling item drop:', error);
    }
}

/**
 * draws items in inventory
 * @param inventory 
 */
const drawInventory = (inventory: string[]) => {
    const cells = document.querySelectorAll('.inv-cell');

    inventory.forEach((itemId: string, i: number) => {
        cells[i].innerHTML = '';
        const item = game.state.items[itemId];

        if (itemId !== '' && cells[i] && item.img) {
            const img = document.createElement('img') as HTMLImageElement;
            img.src = `/images/items/${item.img}`;
            img.className = 'w-full aspect-square pixel-art'
            img.draggable = true;
            img.addEventListener('dragstart', handleDragStart);
            img.addEventListener('mouseenter', () => {displayItemInformation(item)});
            img.addEventListener('mouseleave', hideItemInformation);
            img.setAttribute('data-index', i.toString()); // corresponds to the actual position of the item in the inventory
            cells[i].appendChild(img);
        }
    })
}

document.addEventListener('inventoryUpdated', (e) => drawInventory())

const handleDragStart = (e: DragEvent) => {
    currentDragOperation = true;

    const target = e.target as HTMLElement;
    const index = Number.parseInt(target.getAttribute('data-index') || '-1');

    if (index !== null && game.state.inventory[index] && game.state.inventory[index] != '') {
        e.dataTransfer?.setData('text/plain', JSON.stringify({
            sourceInvIndex: index.toString() // the original index that corresponds to the inventory array
        }))
    }
}

const displayItemInformation = (item) => {
    const textItemInformation = document.getElementById('item-information-div');
    textItemInformation.innerHTML = `<p><strong>${item.name}</strong></p><p>${item.description}</p>`;
}

const hideItemInformation = () => {
    const textItemInformation = document.getElementById('item-information-div');
    textItemInformation?.innerHTML = '';
}