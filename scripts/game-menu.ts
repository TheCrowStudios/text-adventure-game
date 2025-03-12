import { getSlotModifiedAtFromPosition } from "./db-connector.js";
import { saveGameState } from "./db-connector.js";
import { GameState } from "./game-state.js";
import { HelperFunctions } from "./helper-functions.js";
import { gameData } from "./game-data.js";

document.addEventListener('DOMContentLoaded', async () => {
    const divSaveSlots = document.getElementById('save-slots') as HTMLDivElement;
    const saveSlotButtons = document.querySelectorAll('#save-slots > div > button') as NodeListOf<HTMLButtonElement>;
    const divSaveSlotActions = document.getElementById('save-slot-actions') as HTMLDivElement;
    const saveSlotActionButtons = document.getElementById('#save-slot-actions > button') as HTMLDivElement;
    const btnContinue = document.getElementById('btn-continue') as HTMLButtonElement;
    const btnNewGame = document.getElementById('btn-new-game') as HTMLButtonElement;
    const divNewGameConfirmation = document.getElementById('new-game-confirmation') as HTMLDivElement;
    const btnNewGameConfirm = document.getElementById('btn-new-game-confirm') as HTMLButtonElement;
    const btnNewGameCancel = document.getElementById('btn-new-game-cancel') as HTMLButtonElement;
    const btnBack = document.getElementById('btn-back') as HTMLButtonElement;
    const txtSaveSlotName = document.getElementById('txt-save-slot-name') as HTMLSpanElement;
    const username = HelperFunctions.getCookieValue('username');
    let saveSlotIndex = 0;

    saveSlotButtons.forEach(async (button, i) => {
        const txtSaveSlotContents = button.querySelector(".txt-save-slot-contents") as HTMLSpanElement;
        const modified = await getSlotModifiedAtFromPosition(username!, i);

        if (modified !== null) {
            txtSaveSlotContents.textContent = modified;
        } else {
            txtSaveSlotContents.textContent = 'Empty';
        }

        button.addEventListener('click', () => {
            showSlotActions(i, modified !== null);
        })
    })

    /**
     * hides save slots, shows save slot actions
     * @param index 
     */
    const showSlotActions = (index: number, saveSlotIsNotEmpty: boolean) => {
        divSaveSlots.classList.add('-translate-y-full', 'opacity-0');
        divSaveSlotActions.classList.remove('translate-y-full', 'opacity-0');
        txtSaveSlotName.textContent = `Save Slot ${index + 1}`;
        btnContinue.disabled = !saveSlotIsNotEmpty;
        saveSlotIndex = index;
    }

    /**
     * hides save slot actions, shows save slots
     */
    const hideSlotActions = () => {
        divSaveSlots.classList.remove('-translate-y-full', 'opacity-0');
        divSaveSlotActions.classList.add('translate-y-full', 'opacity-0');
    }

    const continueGame = async () => {
        document.cookie = `saveSlot=${saveSlotIndex}; Secure;`;
        document.location = '/game';
    }

    const showConfirmNewGame = () => {
        divNewGameConfirmation.classList.remove('translate-y-full', 'opacity-0');
        divSaveSlotActions.classList.add('-translate-y-full', 'opacity-0');
    }

    const hideConfirmNewGame = () => {
        divNewGameConfirmation.classList.add('translate-y-full', 'opacity-0');
        divSaveSlotActions.classList.remove('-translate-y-full', 'opacity-0');
    }

    const newGame = async () => {
        await saveGameState(username!, saveSlotIndex, JSON.stringify(new GameState(gameData, 16)));
        continueGame();
    }

    btnContinue.addEventListener('click', continueGame);
    btnNewGame.addEventListener('click', showConfirmNewGame);
    btnNewGameConfirm.addEventListener('click', newGame);
    btnNewGameCancel.addEventListener('click', hideConfirmNewGame);
    btnBack.addEventListener('click', hideSlotActions);
})

if (!document.cookie.includes('username=')) document.location = '/login';