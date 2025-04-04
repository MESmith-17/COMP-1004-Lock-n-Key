document.addEventListener('DOMContentLoaded', () => {
    //DOM elements
    const settingsButton = document.getElementById('Settings');
    const settingsPage = document.getElementById('settingsPage');
    const pinForm = document.getElementById('pinForm');
    const masterPasswordForm = document.getElementById('masterPasswordForm');
    const deleteAllDataButton = document.getElementById('deleteAllData');
    const addWebsite = document.getElementById('addWebsite');
    const noItemSelected = document.querySelector('.starting_page');
    const cancelButton = document.getElementById('cancelButton2');
    const loginPage = document.querySelector('.login_page');
    const mainContent = document.querySelector('.mainContent');


    //show settings page
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            if (settingsPage) {
                settingsPage.style.display = 'block';
                document.querySelector('.website_info').style.display = 'none';
                document.querySelector('.starting_page').style.display = 'none';
                document.querySelector('.add_website').style.display = 'none';
            }
            if (addWebsite) {
                addWebsite.style.display = 'none';
            }
            if (noItemSelected) {
                noItemSelected.style.display = 'none';
            }
        });
    }

    //hide the page when cancel button is clicked
    if (cancelButton) {
        cancelButton.addEventListener('click', (event) => {
            event.preventDefault();
            if (settingsPage) {
                settingsPage.style.display = 'none';
            }
            if (noItemSelected) {
                noItemSelected.style.display = 'flex'; 
            }
        });
    }

    //pin change
    if (pinForm) {
        pinForm.addEventListener('submit', async (event) => {
            event.preventDefault();
    
            const currentPin = document.getElementById('currentPin').value;
            const newPin = document.getElementById('newPin').value;
            const loggedinUser = localStorage.getItem('loggedinUser');
    
            const usersBlobRaw = localStorage.getItem('usersBlob');
            const usersBlob = JSON.parse(usersBlobRaw);
            const user = usersBlob?.users?.find(u => u.username === loggedinUser.toLowerCase());
    
            if (!user) {
                alert("User not found.");
                return;
            }
    
            const pinKey = await getKey(loggedinUser.toLowerCase());
            const decryptedPin = await decryptInfo(user.pin, pinKey);
    
            //compare pins
            if (decryptedPin !== currentPin) {
                alert("Incorrect Pin");
                return;
            }
    
            //encrypt and update pin
            const encryptedNewPin = await encryptInfo(newPin, pinKey);
            user.pin = encryptedNewPin;
    
            localStorage.setItem('usersBlob', JSON.stringify(usersBlob));
            alert("Pin was changed successfully.");
            pinForm.reset();
        });
    }
    


    //master password change
    if (masterPasswordForm) {
        masterPasswordForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const loggedInUser = localStorage.getItem('loggedinUser');
            const usersBlob = JSON.parse(localStorage.getItem('usersBlob'));

            const user = usersBlob?.users?.find(u => u.username === loggedInUser?.toLowerCase());
            if (!user) {
                alert("User not found.");
                return;
            }

            const passwordKey = await getKey(loggedInUser.toLowerCase());
            const decryptedPassword = await decryptInfo(user.password, passwordKey);

            //compare passwords
            if (decryptedPassword !== currentPassword) {
                alert("Incorrect current password.");
                return;
            }

            //encrypt and update passwords
            const encryptedNewPassword = await encryptInfo(newPassword, passwordKey);
            user.password = encryptedNewPassword;

            localStorage.setItem('usersBlob', JSON.stringify(usersBlob));
            alert("Password changed successfully.");
            masterPasswordForm.reset();
        });
    }

    //delete account
    if (deleteAllDataButton) {
        deleteAllDataButton.addEventListener('click', async () => {
            const loggedInUser = localStorage.getItem('loggedinUser');
            if (!loggedInUser) {
                alert("No user is currently logged in.");
                return;
            }
    
            const enteredPassword = prompt("Enter your account password to confirm deletion:");
            if (!enteredPassword) {
                alert("Deletion cancelled. No password entered.");
                return;
            }
    
            const usersBlob = JSON.parse(localStorage.getItem('usersBlob'));
            const currentUser = usersBlob.users.find(user => user.username === loggedInUser.toLowerCase());
    
            if (!currentUser) {
                alert("User not found.");
                return;
            }
    
            try {
                // Decrypt the stored password using the user's username as the passphrase
                const key = await getKey(loggedInUser.toLowerCase());
                const decryptedPassword = await decryptInfo(currentUser.password, key);
    
                if (decryptedPassword !== enteredPassword) {
                    alert("Incorrect password. Account deletion denied.");
                    return;
                }
    
                // Confirm one more time before final deletion
                if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    return;
                }
    
                // Remove the user from the user list
                let users = usersBlob;
                users.users = users.users.filter(user => user.username !== loggedInUser.toLowerCase());
                localStorage.setItem('usersBlob', JSON.stringify(users));
    
                // Remove websites belonging to the user
                const storedWebsites = JSON.parse(localStorage.getItem('storedWebsites')) || [];
                const filteredWebsites = storedWebsites.filter(entry => entry.username !== loggedInUser.toLowerCase());
                localStorage.setItem('storedWebsites', JSON.stringify(filteredWebsites));
    
                // Log the user out
                localStorage.removeItem('loggedinUser');
                alert("Your account has been deleted.");
                location.reload();
    
            } catch (error) {
                console.error("Password decryption failed:", error);
                alert("An error occurred while verifying your password.");
            }
        });
    }
    
});
