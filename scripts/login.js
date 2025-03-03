"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const inpUsername = document.getElementById('input-username');
    const inpPassword = document.getElementById('input-password');
    const formLogin = document.getElementById('form-login');
    const error = document.getElementById('error');
    formLogin === null || formLogin === void 0 ? void 0 : formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        // TODO - access database here
        // so according to the specification we can only access the data client side, which is kinda silly, it sounds very not secure.
        if (inpUsername.value === 'user' && inpPassword.value === 'password') {
            document.cookie = `username=${inpUsername.value}; Secure;`;
            console.log(`cookie: ${document.cookie}`);
            document.location = '/game.html';
        }
        else {
            error.textContent = 'Username or password incorrect';
            error.classList.remove('hidden');
        }
        ;
    });
});
if (document.cookie.includes('username=user'))
    document.location = '/game-menu';
