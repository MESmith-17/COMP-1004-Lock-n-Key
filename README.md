========================================  
             LOCK N KEY  
========================================  

**Developed By:** Maddison Smith (Student number: 10927408) 

---
## Table of Contents  
1. Introduction  
2. How to Use  
   2.1 Logging In  
   2.2 Signing Up  
   2.3 Dashboard Overview  
3. Password Management  
   3.1 Adding Credentials  
   3.2 Editing & Deleting  
4. Settings  
   4.1 Change PIN  
   4.2 Change Password  
   4.3 Delete Account  
5. Security  
---

1. Introduction  

Welcome to Lock n Key, a browser-based password manager built using HTML, CSS, and JavaScript. It allows you to securely store, view, and manage your login credentials for different websites, using encryption provided by the Web Crypto API. No servers, no backend — your data stays on your device.

---

2. How to Use  

2.1 Logging In  

- Enter your username and password to access your vault.  
- Credentials are verified using secure encryption.  
- If valid, you’re directed to the dashboard where your data is stored.

2.2 Signing Up  

- Click Sign Up on the login page.  
- Enter a username, password, confirm password, and a pin.  
- Your data is encrypted and stored in your browser’s local storage.

2.3 Dashboard Overview  

Once logged in, you can:  

- Add new website credentials  
- View and edit existing ones  
- Access settings to manage your security  
- Log out at any time

---

3. Password Management  

3.1 Adding Credentials  

- Click Add 
- Fill in Website, Username/Email, and Password  
- A password strength indicator helps guide you  
- Click Save to store securely

3.2 Editing & Deleting  

- Select a website from the list  
- Click Edit to update  
- Click Delete to permanently remove  
- Use Back to return to the dashboard

---

4. Settings  

4.1 Change PIN  

- Go to Settings  
- Enter your current pin  
- Set a new pin  
- Submit to update your credentials securely

4.2 Change Password  

- Enter your current password  
- Set a new password  
- Changes are encrypted and saved

4.3 Delete Account  

- Click Delete  
- Confirm with your password  
- Your credentials and stored data will be removed

---

5. Security  

- Encryption: Uses AES-GCM (256-bit) for encrypting all sensitive data  
- Key Derivation: Uses PBKDF2 with SHA-256 and 100,000 iterations  
- Storage: Encrypted data is stored in your browser’s localStorage  
- No data leaves the machine — your privacy is fully protected  




