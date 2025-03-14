import { getUserByUsernameAndPassword } from "./db-connector.js";

document.addEventListener('DOMContentLoaded', () => {
    const inpUsername = document.getElementById('input-username') as HTMLInputElement;
    const inpPassword = document.getElementById('input-password') as HTMLInputElement;
    const formLogin = document.getElementById('form-login') as HTMLFormElement;
    const error = document.getElementById('error') as HTMLSpanElement;

    formLogin?.addEventListener('submit', async (e) => {
        e.preventDefault();
        // so according to the specification we can only access the data client side, which is kinda silly, it sounds very not secure.

        const user = await getUserByUsernameAndPassword(inpUsername.value, inpPassword.value);

        if (user !== null && user.data && user.data.length > 0 && user.data[0]) {
            console.log(user.data[0])
            document.cookie = `username=${user.data[0].username}; Secure;`;
            console.log(`cookie: ${document.cookie}`);
            document.location = '/game-menu';
        } else {
            error.textContent = 'Username or password incorrect';
            error.classList.remove('hidden');
        };
    });
})

if (document.cookie.includes('username=')) document.location = '/game-menu';