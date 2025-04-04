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
    const addButton = document.getElementById('AddItem');
    const starterButton = document.querySelector('.start_page_buttons');
    const webinfoButton = document.querySelector('.website_info_buttons');
    const deleteButton = document.getElementById('deleteSave');
    const editButton = document.getElementById('editSave');
    const backButton = document.getElementById('backButton');
    const cancelButton = document.getElementById('cancelButton');
    const addWebsite = document.getElementById('addWebsite');
    const passwordAdd = document.getElementById('PasswordAdd');
    const settingsPage = document.getElementById('settingsPage');
    const noItemSelected = document.querySelector('.starting_page');
    const sideTab = document.querySelector('.l_buttons');
    const passwordStrength = document.getElementById('passwordStrength');


    //show the page when Add button is clicked
    if (addButton) {
        addButton.addEventListener('click', () => {
            if (addWebsite) {
                addWebsite.style.display = 'block';
            }
            if (settingsPage) {
                settingsPage.style.display = "none";
            }
            if (noItemSelected) {
                noItemSelected.style.display = 'none'; 
            }
        });
    }

    //hide the page when Cancel button is clicked
    if (cancelButton) {
        cancelButton.addEventListener('click', (event) => {
            event.preventDefault();
            if (addWebsite) {
                addWebsite.style.display = 'none';
            }
            if (noItemSelected) {
                noItemSelected.style.display = 'flex'; 
            }
        });
    }

    //page submission
    if (passwordAdd) {
        passwordAdd.addEventListener('submit', async (event) => {
            event.preventDefault();

            const website = document.getElementById('website').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            //get websites from local storage
            let websites = JSON.parse(localStorage.getItem('storedWebsites')) || [];

            //check if website is already in storage
            if (websites.some(site => site.website === website)) {
                alert("This website has already has a username and password saved. ")
                return;
            }

            const key = await getKey("your-master-password");
            const encryptedPassword = await encryptInfo(password, key);

            //store new website
            const newInfo = {website, username, password: encryptedPassword};
            websites.push(newInfo);
            localStorage.setItem('storedWebsites', JSON.stringify(websites));

            updateSidetab();
            alert("A new website has been saved.");

            //clear the form
            passwordAdd.reset();

            //hide the form after submission
            if (addWebsite) {
                addWebsite.style.display = 'none';
            }
        });
    }

    //password strength checker
    password.addEventListener('input', () => {
        const password = document.getElementById('password');
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

    //add website to sidebar
    function updateSidetab() {
        //clear other buttons
        sideTab.innerHTML = '';

        let websites = JSON.parse(localStorage.getItem('storedWebsites')) || [];

        websites.forEach((site) => {
            const button = document.createElement('button');
            button.classList.add('websiteButtons');
            button.textContent = site.website;
            button.addEventListener('click', () => {
                websiteInfo(site);



                //clear search bar 
                const searchInput = document.getElementById('searchBar');
                if (searchBar) {
                    searchBar.value = '';
                }

                //remove highlight and order correctly
                const websiteButtons = document.querySelectorAll('.websiteButtons');
                websiteButtons.forEach(btn => btn.classList.remove('highlight'));

                updateSidetab();
            })

            sideTab.appendChild(button);

        })

        //search bar functionality
        const searchInput = document.getElementById('searchBar');

        searchInput.addEventListener('input', () => {
            const standard = searchInput.value.toLowerCase();
            const websiteList = Array.from(document.querySelectorAll('.websiteButtons'));

            //separate buttons
            const matched = [];
            const unmatched = [];

            websiteList.forEach(btn => {
                btn.classList.remove('highlight');
                if (btn.textContent.toLowerCase().includes(standard) && standard !== '') {
                    matched.push(btn);
                }else {
                    unmatched.push(btn);
                }
            })

            const sideTab = document.querySelector('.l_buttons');
            sideTab.innerHTML = '';
            matched.forEach(btn => {
                btn.classList.add('highlight');
                sideTab.appendChild(btn);
            })
            unmatched.forEach(btn => sideTab.appendChild(btn));
        })

        //update password count
        document.getElementById('passwordCount').textContent = `${websites.length} Websites`;

    }

    //store the website information
    function websiteInfo(site) {
        const displaySection = document.querySelector('.website_info');
        document.querySelector('.settings_page').style.display = 'none'
        webinfoButton.style.display = "flex";
        starterButton.style.display = "none";
    
        getKey("your-master-password").then(async (key) => {
            const decryptedPassword = await decryptInfo(site.password, key);
            const allWebsites = JSON.parse(localStorage.getItem('storedWebsites')) || [];
    
            const allDecrypts = await Promise.all(
                allWebsites.map(async entry => {
                    try {
                        return await decryptInfo(entry.password, key);
                    } catch (e) {
                        return null;
                    }
                })
            );
    
            const reusedPassword = allDecrypts.filter(pw => pw === decryptedPassword).length;
            const weakPassword = getPasswordStrength(decryptedPassword).text === "Weak Password";
            const showSecurityRisk = reusedPassword >= 3 || weakPassword;
    
            //display HTML
            document.querySelector('.website_info').style.display = 'block';
            document.querySelector('.starting_page').style.display = 'none';
            document.querySelector('.add_website').style.display = 'none';
            displaySection.innerHTML = `
                <h2>${site.website}</h2>
                <p><strong>Username/Email:</strong> ${site.username}</p>
                <p><strong>Password:</strong> <span id="maskedPassword">******</span></p>
                <button id="revealPassword">𓁹</button>
                ${showSecurityRisk ? `<button id="securityRisk">!</button>` : ''}
            `;
    
        //button functionality
            //reveal button
            document.getElementById('revealPassword')?.addEventListener('click', async () => {
                const passwordMasked = document.getElementById('maskedPassword');
                const isRevealed = passwordMasked.textContent === decryptedPassword;

                if(isRevealed) {
                    passwordMasked.textContent = '******';
                    return;
                }
                
                const enteredPin = prompt("Enter your pin.");
                if (!enteredPin) {
                    return;
                }
                
                const loggedInUser = localStorage.getItem('loggedinUser');
                if (!loggedInUser) {
                    alert("User not logged in.");
                    return;
                }
    
                const usersBlob = JSON.parse(localStorage.getItem('usersBlob'));
                const currentUser = usersBlob.users.find(user => user.username === loggedInUser.toLowerCase());
                if (!currentUser) {
                    alert("User could not be found.");
                    return;
                }
    
                try {
                    const pinKey = await getKey(loggedInUser.toLowerCase());
                    const decryptedPin = await decryptInfo(currentUser.pin, pinKey);
    
                    if (decryptedPin === enteredPin) {
                        passwordMasked.textContent = decryptedPassword;
                    } else {
                        alert("Incorrect Pin! Access denied.");
                    }
                } catch (error) {
                    console.error("Pin decryption failed:", error);
                    alert("An error occurred while verifying the PIN.");
                }
            });
    
            //security alert
            document.getElementById('securityRisk')?.addEventListener('click', () => {
                if (weakPassword && reusedPassword >= 3) {
                    alert("SECURITY RISK! This password has been used too many times and is considered weak. This should be changed immediately.");
                } else if (reusedPassword >= 3) {
                    alert("SECURITY RISK! This password has been used too many times and should be changed immediately.");
                } else if (weakPassword) {
                    alert("SECURITY RISK! This password is considered weak and should be changed immediately.");
                }
            })

            //delete button
            if (deleteButton) {
                deleteButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    if(confirm('Are you sure you would like to delete this website information. The information cannot be restored.')) {
                        let websites = JSON.parse(localStorage.getItem('storedWebsites')) || [];
                        websites = websites.filter(entry => entry.website !== site.website);
                        localStorage.setItem('storedWebsites', JSON.stringify(websites));
                        alert("This website has been deleted successfully.");

                        //update display
                        updateSidetab();
                        const rightColumn = document.querySelector('.starting_page');
                        document.querySelector('.website_info').style.display = 'none';
                        document.querySelector('.starting_page').style.display = 'flex';
                        document.querySelector('.add_website').style.display = 'none';
                        rightColumn.innerHTML = `
                        <img src = "lock.png" alt = "Right page icon" class = "right_page_icon">
                        <h2>No Website Selected</h2>
                        `;
                    }
                });
            }

            //edit button
            if (editButton) {
                editButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    const editInfo = document.querySelector('.website_info');
                    document.querySelector('.website_info').style.display = 'block';
                    document.querySelector('.starting_page').style.display = 'none';
                    document.querySelector('.add_website').style.display = 'none';
                    //replace the text
                    editInfo.innerHTML = `
                        <div class = "edit_website">
                            <h2>${site.website}</h2>
                            <label for = "editUsername"><strong>Username/Email:</strong></label>
                            <input type = "text" id = "editUsername" value = "${site.username}">
                            <br>
                            <label for = "editPassword"><strong>Password:</strong></label>
                            <input type = "text" id = "editPassword">
                            <br>
                            <button id = "saveChange">Save</button>
                            <button id = "cancelChange">Cancel</button>
                        </div>
                    `;
    
                    //fill decrypted password
                    document.getElementById('editPassword').value = decryptedPassword;
    
                    //save the new changes
                    document.getElementById('saveChange').addEventListener('click', async () => {
                        const newUsername = document.getElementById('editUsername').value;
                        const newPassword = document.getElementById('editPassword').value;
                        const encryptedPassword = await encryptInfo(newPassword, await getKey("your-master-password"));
    
                        //update local storage
                        let websites = JSON.parse(localStorage.getItem('storedWebsites')) || [];
                        const number = websites.findIndex(w => w.website === site.website);
    
                        if (number !== -1) {
                            websites[number] =  {website: site.website, username: newUsername, password: encryptedPassword};
                            localStorage.setItem('storedWebsites', JSON.stringify(websites));
                            updateSidetab();
                            websiteInfo(websites[number]);
                            alert("This website's stored information has been updated successfully.");
                        }
                    })
    
                    //cancel the edit
                    document.getElementById('cancelChange').addEventListener('click', () => {
                        websiteInfo(site);
                    })
                });
            }


            //back button
            if (backButton) {
                backButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    //change buttons
                    webinfoButton.style.display = "none";
                    starterButton.style.display = "flex";
                    document.querySelector('.website_info').style.display = 'none';
                    document.querySelector('.starting_page').style.display = 'flex';
                    document.querySelector('.add_website').style.display = 'none';
                    //show start page
                    const rightColumn = document.querySelector('.starting_page');
                    rightColumn.innerHTML = `
                    <img src = "lock.png" alt = "Right page icon" class = "right_page_icon">
                    <h2>No Website Selected</h2>
                    `;
                });
            }
            
            //logout button
            document.getElementById('Logout').addEventListener('click', function () {
                localStorage.removeItem('loggedinUser');
                location.reload();
            })
        })
    }

    updateSidetab();
    
});
