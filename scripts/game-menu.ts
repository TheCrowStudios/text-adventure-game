document.addEventListener('DOMContentLoaded', () => {
    const divSaveSlots = document.getElementById('save-slots') as HTMLDivElement;
    const saveSlotButtons = document.querySelectorAll('#save-slots > div > button') as NodeListOf<HTMLButtonElement>;
    const divSaveSlotActions = document.getElementById('save-slot-actions') as HTMLDivElement;
    const saveSlotActionButtons = document.getElementById('#save-slot-actions > button') as HTMLDivElement;
    const btnContinue = document.getElementById('btn-continue') as HTMLButtonElement;
    const btnNewGame = document.getElementById('btn-new-game') as HTMLButtonElement;
    const btnBack = document.getElementById('btn-back') as HTMLButtonElement;
    const txtSaveSlotName = document.getElementById('txt-save-slot-name') as HTMLSpanElement;

    saveSlotButtons.forEach((button, i) => {
        button.addEventListener('click', () => {
            showSlotActions(i);
        })
    })

    const showSlotActions = (index: number) => {
        divSaveSlots.classList.add('-translate-y-full', 'opacity-0');
        divSaveSlotActions.classList.remove('translate-y-full', 'opacity-0');
        txtSaveSlotName.textContent = `Save Slot ${index + 1}`;
        btnContinue.disabled = true; // TODO - enable button if there is a save in that save slot available
    }

    const hideSlotActions = () => {
        divSaveSlots.classList.remove('-translate-y-full', 'opacity-0');
        divSaveSlotActions.classList.add('translate-y-full', 'opacity-0');
    }

    const newGame = () => {
        document.location = '/game';
    }

    btnNewGame.addEventListener('click', newGame);
    btnBack.addEventListener('click', hideSlotActions);
})

if (!document.cookie.includes('username=user')) document.location = '/login';