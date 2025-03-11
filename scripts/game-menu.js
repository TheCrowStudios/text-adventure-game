"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const divSaveSlots = document.getElementById('save-slots');
    const saveSlotButtons = document.querySelectorAll('#save-slots > div > button');
    const divSaveSlotActions = document.getElementById('save-slot-actions');
    const saveSlotActionButtons = document.getElementById('#save-slot-actions > button');
    const btnContinue = document.getElementById('btn-continue');
    const btnNewGame = document.getElementById('btn-new-game');
    const btnBack = document.getElementById('btn-back');
    const txtSaveSlotName = document.getElementById('txt-save-slot-name');
    let saveSlotIndex = 0;
    saveSlotButtons.forEach((button, i) => {
        button.addEventListener('click', () => {
            showSlotActions(i);
        });
    });
    /**
     * hides save slots, shows save slot actions
     * @param index
     */
    const showSlotActions = (index) => {
        divSaveSlots.classList.add('-translate-y-full', 'opacity-0');
        divSaveSlotActions.classList.remove('translate-y-full', 'opacity-0');
        txtSaveSlotName.textContent = `Save Slot ${index + 1}`;
        btnContinue.disabled = true; // TODO - enable button if there is a save in that save slot available
        saveSlotIndex = index;
    };
    /**
     * hides save slot actions, shows save slots
     */
    const hideSlotActions = () => {
        divSaveSlots.classList.remove('-translate-y-full', 'opacity-0');
        divSaveSlotActions.classList.add('translate-y-full', 'opacity-0');
    };
    const newGame = () => {
        document.cookie = `saveSlot=${saveSlotIndex}; Secure;`;
        document.location = '/game';
    };
    btnNewGame.addEventListener('click', newGame);
    btnBack.addEventListener('click', hideSlotActions);
});
if (!document.cookie.includes('username='))
    document.location = '/login';
