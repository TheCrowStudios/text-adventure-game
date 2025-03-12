import { HelperFunctions } from "./helper-functions.js";

// let selectQuery = 'SELECT * FROM testUsers;';
// let insertQuery = 'INSERT INTO testUsers(email, pw) VALUES ("a.nothea@mail.com", "pass")';

export async function executeDatabaseQuery(query: string): Promise<any> {
    const creds = new URLSearchParams();
    creds.append('hostname', 'localhost');
    creds.append('username', 'vbohans01');
    creds.append('password', '4dtXr3pk5psPg02h');
    creds.append('database', 'CSC1034_CW_55');
    creds.append('query', query);
    console.log(creds.toString());
    let url = 'https://vbohans01.webhosting1.eeecs.qub.ac.uk/dbConnector.php';
    try {
        let response = await fetch(url, {
            method: 'POST',
            body: creds
        }); // Waits for a response from the fetch


        const result = await response.json(); // Waits for the JSON to be parsed

        // let resultsDiv = document.getElementById('results');

        // If an error has been returned, e.g. incorrect SQL syntax, display the error
        if (result.error) {
            console.log(result.error.toString());
            // resultsDiv.innerHTML = `<p style="color:red;">${result.error}</p>`;
        }
        // If a dataset has been returned, e.g. from a SELECT statement, do something.
        else if (result.data) {
            //In this case, print the JSON to <pre> tags. 
            // resultsDiv.innerHTML = `<pre>${JSON.stringify(result.data, null, 4)}</pre>`;
        }
        else {
            // For anything else, assume something like INSERT, DROP etc. corresponding message
            // resultsDiv.innerHTML = `<p>${result.success ? 'Query executed successfully' : 'No data returned'}</p>`;
            if (result.affected_rows !== undefined) {
                // resultsDiv.innerHTML += `<p>Affected Rows: ${result.affected_rows}</p>`;
            }
        }

        return result;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        // document.getElementById('results').innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }

    return null;
}

export async function getUserByUsername(username: string) {
    return (await executeDatabaseQuery(`SELECT * FROM users WHERE username='${username}'`));
}

export async function getUserByUsernameAndPassword(username: string, password: string) {
    return (await executeDatabaseQuery(`SELECT * FROM users WHERE username='${username}' AND password='${password}'`));
}

export async function createNewUser(username: string, password: string) {
    return (await executeDatabaseQuery(`INSERT INTO users (username, password) VALUES ('${username}', '${password}')`));
}

export async function saveGameState(username: string, slot: number, state: string) {
    const user = await getUserByUsername(username);
    const stateEscaped = HelperFunctions.escape_sql_string(state);

    if (user !== null && user.data && user.data.length > 0) {
        return (await executeDatabaseQuery(`INSERT INTO saves (user_id, save_slot_position, game_state) VALUES (${user.data[0].user_id}, ${slot}, "${stateEscaped}") ON DUPLICATE KEY UPDATE game_state = "${stateEscaped}"`)).affected_rows > 0;
    }

    return false;
}

export async function getSlotModifiedAtFromPosition(username: string, slot: number) {
    const user = await getUserByUsername(username);

    if (user !== null && user.data && user.data.length > 0) {
        const modifiedAt = (await executeDatabaseQuery(`SELECT modified_at FROM saves WHERE user_id = '${user.data[0].user_id}' AND save_slot_position = '${slot}'`));
        if (modifiedAt.data.length > 0 && modifiedAt.data[0].modified_at) {
            return modifiedAt.data[0].modified_at;
        }
    }

    return null;
}

export async function getGameStateFromSlot(username: string, slot: number) {
    const user = await getUserByUsername(username);

    if (user !== null && user.data && user.data.length > 0) {
        const gameState = (await executeDatabaseQuery(`SELECT game_state FROM saves WHERE user_id = '${user.data[0].user_id}' AND save_slot_position = '${slot}'`));
        if (gameState.data.length > 0 && gameState.data[0].game_state) {
            return gameState.data[0].game_state;
        }
    }

    return null;
}