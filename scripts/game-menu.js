import { getSlotModifiedAtFromPosition } from "./db-connector.js";
import { saveGameState } from "./db-connector.js";
import { GameState } from "./game-state.js";
import { HelperFunctions } from "./helper-functions.js";
import { gameData } from "./game-data.js";
document.addEventListener('DOMContentLoaded', async () => {
    const divSaveSlots = document.getElementById('save-slots');
    const saveSlotButtons = document.querySelectorAll('#save-slots > div > button');
    const divSaveSlotActions = document.getElementById('save-slot-actions');
    const saveSlotActionButtons = document.getElementById('#save-slot-actions > button');
    const btnContinue = document.getElementById('btn-continue');
    const btnNewGame = document.getElementById('btn-new-game');
    const btnBack = document.getElementById('btn-back');
    const txtSaveSlotName = document.getElementById('txt-save-slot-name');
    const username = HelperFunctions.getCookieValue('username');
    let saveSlotIndex = 0;
    saveSlotButtons.forEach(async (button, i) => {
        const txtSaveSlotContents = button.querySelector(".txt-save-slot-contents");
        const modified = await getSlotModifiedAtFromPosition(username, i);
        if (modified !== null) {
            txtSaveSlotContents.textContent = modified;
        }
        else {
            txtSaveSlotContents.textContent = 'Empty';
        }
        button.addEventListener('click', () => {
            showSlotActions(i, modified !== null);
        });
    });
    /**
     * hides save slots, shows save slot actions
     * @param index
     */
    const showSlotActions = (index, saveSlotIsNotEmpty) => {
        divSaveSlots.classList.add('-translate-y-full', 'opacity-0');
        divSaveSlotActions.classList.remove('translate-y-full', 'opacity-0');
        txtSaveSlotName.textContent = `Save Slot ${index + 1}`;
        btnContinue.disabled = !saveSlotIsNotEmpty;
        saveSlotIndex = index;
    };
    /**
     * hides save slot actions, shows save slots
     */
    const hideSlotActions = () => {
        divSaveSlots.classList.remove('-translate-y-full', 'opacity-0');
        divSaveSlotActions.classList.add('translate-y-full', 'opacity-0');
    };
    const continueGame = async () => {
        document.cookie = `saveSlot=${saveSlotIndex}; Secure;`;
        document.location = '/game';
    };
    const newGame = async () => {
        await saveGameState(username, saveSlotIndex, JSON.stringify(new GameState(gameData, 16)));
        continueGame();
    };
    btnContinue.addEventListener('click', continueGame);
    btnNewGame.addEventListener('click', newGame);
    btnBack.addEventListener('click', hideSlotActions);
});
if (!document.cookie.includes('username='))
    document.location = '/login';
