document.addEventListener('DOMContentLoaded', () => {
    const inpUsername = document.getElementById('input-username') as HTMLInputElement;
    const inpPassword = document.getElementById('input-password') as HTMLInputElement;
    const formLogin = document.getElementById('form-login') as HTMLFormElement;
    const error = document.getElementById('error') as HTMLSpanElement;

    formLogin?.addEventListener('submit', (e) => {
        e.preventDefault();
        // TODO - access database here
        // so according to the specification we can only access the data client side, which is kinda silly, it sounds very not secure.

        if (inpUsername.value === 'user' && inpPassword.value === 'password') {
            document.cookie = `username=${inpUsername.value}; Secure;`;
            console.log(`cookie: ${document.cookie}`);
            document.location = '/game';
        } else {
            error.textContent = 'Username or password incorrect';
            error.classList.remove('hidden');
        };
    });
})

if (document.cookie.includes('username=user')) document.location = '/game-menu';