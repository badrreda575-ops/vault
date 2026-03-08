import CryptoJS from 'crypto-js';

const SALT = 'vault-premium-salt'; // In a real app, this should be unique per user

export const encryptData = (data, masterPassword) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), masterPassword).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
};

export const decryptData = (encryptedData, masterPassword) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, masterPassword);
    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

export const hashMasterPassword = (password) => {
  return CryptoJS.SHA256(password + SALT).toString();
};
