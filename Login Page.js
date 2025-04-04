//key function
async function getKey(passphrase) {
    const encoder = new TextEncoder();
    const keyImport = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(passphrase),
        "PBKDF2", //password-based key derivation function
        false,
        ["deriveKey"]
    )

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode("some-constant-salt"),
            iterations: 100000,
            hash: "SHA-256",
        },
        keyImport,
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    )
}

//decrypt
async function decryptInfo(encryptedObj, key) {
    const iv = new Uint8Array(encryptedObj.iv);
    const data = new Uint8Array(encryptedObj.data);

    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        data
    );
    return new TextDecoder().decode(decrypted);
}

document.addEventListener('DOMContentLoaded', () => {
    //DOM elements
    const login_Page = document.querySelector('.login_page');
    const mainContent = document.querySelector('.mainContent');
    const SU_Page = document.querySelector('.signup_page');
   
    //sign-up page button
    document.getElementById('Signup').addEventListener('click', function() {
       //hide the login page
        login_Page.style.display = 'none';
        //show the sign up page
        SU_Page.style.display = 'block';
    });
    
    document.querySelector('.login_page form').addEventListener('submit', function (event) {
        event.preventDefault();

        //user inputs
        const username = document.querySelector('input[placeholder = "Username."]').value;
        const normalisedUsername = username.trim().toLowerCase();
        const password = document.querySelector('input[placeholder = "Password."]').value; 

        //get users for JSON blob
        let usersBlob = localStorage.getItem('usersBlob');
        let parsed = usersBlob ? JSON.parse(usersBlob) : {users: []};
        let users = parsed.users || [];

        (async () => {
            const user = users.find(user => user.username === normalisedUsername);
            
            if (!user) {
                alert("Incorrect Credentials");
                return;
            }

            try {
                const key = await getKey(normalisedUsername);
                const decryptedPassword = await decryptInfo(user.password, key);

                if (decryptedPassword === password) {
                    localStorage.setItem('loggedinUser', username);
                    login_Page.style.display = 'none';
                    mainContent.style.display = 'block';
                    document.querySelector('.start_background').style.display = 'none';
                }else {
                    alert("Invalid Login");
                }
            }catch (err) {
                console.error(err);
                alert("There was an error decrypting the password.");
            }
        })();
    });
    //logout
    document.getElementById('Logout').addEventListener('click', function () {
        localStorage.removeItem('loggedinUser');
        location.reload();
    })

});