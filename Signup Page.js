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

//encrypt
async function encryptInfo(data, key) {
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encoder.encode(data)
    )
    return {
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted))
    }
}

document.addEventListener('DOMContentLoaded', () => {
    //DOM elements
    const login_Page = document.querySelector('.login_page');
    const SU_Page = document.querySelector('.signup_page');
    const password = document.getElementById('signupPassword');
    const passwordStrength = document.getElementById('signupPasswordStrength');
    const revealButton = document.getElementById('signup_revealButton');
    const passInput = document.querySelector('.signup_page input[placeholder="Password."]');
    const confirmInput = document.querySelector('.signup_page input[placeholder="Confirm Password."]');
    const pinInput = document.querySelector('.signup_page input[placeholder="Pin."]');

    //show password and pin
    function revealSensitiveData() {
        passInput.type = 'text';
        confirmInput.type = 'text';
        pinInput.type = 'text';
    }

    //hide password and pin
    function hideSensitiveData() {
        passInput.type = 'password';
        confirmInput.type = 'password';
        pinInput.type = 'password';
    }
    //mouse press
    revealButton.addEventListener('mousedown', revealSensitiveData);
    revealButton.addEventListener('mouseup', hideSensitiveData);
    revealButton.addEventListener('mouseleave', hideSensitiveData);


    //hide sign-up page
    SU_Page.style.display = 'none';

    //login page button
    document.getElementById('Login').addEventListener('click', function() {
        //hide the sign up page
        SU_Page.style.display = 'none';

        //show the login page
        login_Page.style.display = 'block';
    });

     //password strength checker
     password.addEventListener('input', () => {
        const strength = getPasswordStrength(password.value);
        passwordStrength.textContent = strength.text;
        passwordStrength.style.color = strength.color;
    })

    function getPasswordStrength(password) {
        let rank = 0;

        //conditions
        if (password.length >= 8) rank++;
        if (/[A-Z]/.test(password)) rank++;
        if (/[a-z]/.test(password)) rank++;
        if (/\d/.test(password)) rank++;
        if (/[\W_]/.test(password)) rank++;

        if (password.length === 0) {
            return{text: '', color: ''};
        }else if (rank <= 2) {
            return{text: 'Weak Password', color: 'red'};
        }else if (rank === 3 || rank === 4) {
            return{text: 'Medium Password', color: 'orange'};
        }else {
            return{text: 'Strong Password', color: 'green'};
        }
    }

    //functionality
    document.querySelector('.signup_page form').addEventListener('submit',function(event) {
        //stops form submission
        event.preventDefault();

        //user inputs
        const username = document.querySelector('.signup_page input[placeholder = "Username."]').value;
        const normalisedUsername = username.trim().toLowerCase();
        const password = document.querySelector('.signup_page input[placeholder = "Password."]').value; 
        const confirmPassword = document.querySelector('.signup_page input[placeholder = "Confirm Password."]').value;
        const pin = document.querySelector('.signup_page input[placeholder = "Pin."]').value;

        //check passwords
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        //get users from the JSON blob
        let usersBlob = localStorage.getItem('usersBlob');
        let users = usersBlob ? JSON.parse(usersBlob) : { users: [] };

        //convert object into an array
        if (!Array.isArray(users)) {
            users = users.users || [];
        }

        //check if username already exists in storage
        if (users.some(user => user.username === username)) {
            alert("Username already taken! Please choose another one");
            return;
        }

        (async () => {
            const key = await getKey(normalisedUsername);
            const encryptedPassword = await encryptInfo(password, key);
            const encryptedPin = await encryptInfo(pin.toString(), key);

            //save the username
            users.push({username: normalisedUsername, password: encryptedPassword, pin: encryptedPin});
            localStorage.setItem('usersBlob',JSON.stringify({users}));
            alert("Successfully Signed-up. You may now Log in.")

            //change to login page automatically
            SU_Page.style.display = 'none';
            login_Page.style.display = 'block';
        })();
        
    });
});