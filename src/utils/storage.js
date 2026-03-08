export const saveVault = (encryptedData, passwordHash) => {
  localStorage.setItem('vault_data', encryptedData);
  localStorage.setItem('vault_hash', passwordHash);
};

export const loadVault = () => {
  return {
    encryptedData: localStorage.getItem('vault_data'),
    passwordHash: localStorage.getItem('vault_hash')
  };
};

export const clearVault = () => {
  localStorage.removeItem('vault_data');
  localStorage.removeItem('vault_hash');
};
