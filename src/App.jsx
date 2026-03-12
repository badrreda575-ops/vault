import React, { useState, useEffect } from 'react';
import { Lock, Shield, Plus, Search, ScanSearch, Key, LogOut, LockKeyhole, Fingerprint, Settings2, Copy, Eye, EyeOff, Save, Trash2, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { encryptData, decryptData, hashMasterPassword } from './utils/crypto';
import { saveVault, loadVault, clearVault } from './utils/storage';
import './index.css';

const App = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [masterPassword, setMasterPassword] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  const [newAccount, setNewAccount] = useState({ title: '', username: '', password: '', category: 'General' });
  const [error, setError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [passChangeData, setPassChangeData] = useState({ old: '', new: '', confirm: '' });
  const [success, setSuccess] = useState('');

  // Load from local storage on mount
  useEffect(() => {
    const { passwordHash } = loadVault();
    if (!passwordHash) {
      // First time user logic could go here
    }
  }, []);

  const handleUnlock = () => {
    if (masterPassword.length < 8) {
      setError("Master Password must be at least 8 characters");
      return;
    }

    const { encryptedData, passwordHash } = loadVault();
    const currentHash = hashMasterPassword(masterPassword);

    if (!passwordHash) {
      // Setup new vault
      setIsLocked(false);
      setError('');
    } else if (passwordHash === currentHash) {
      // Unlock existing vault
      if (encryptedData) {
        const decrypted = decryptData(encryptedData, masterPassword);
        if (decrypted) {
          setAccounts(decrypted);
          setIsLocked(false);
          setError('');
        } else {
          setError("Failed to decrypt vault. Data may be corrupted.");
        }
      } else {
        setAccounts([]);
        setIsLocked(false);
        setError('');
      }
    } else {
      setError("Incorrect Master Password");
    }
  };

  const persistAccounts = (updatedAccounts) => {
    const encrypted = encryptData(updatedAccounts, masterPassword);
    const hash = hashMasterPassword(masterPassword);
    saveVault(encrypted, hash);
  };

  const handleAddAccount = () => {
    if (newAccount.title && newAccount.password) {
      const updatedAccounts = [...accounts, { ...newAccount, id: Date.now() }];
      setAccounts(updatedAccounts);
      persistAccounts(updatedAccounts);
      setIsAdding(false);
      setNewAccount({ title: '', username: '', password: '', category: 'General' });
    }
  };

  const handleDeleteAccount = (id) => {
    const updatedAccounts = accounts.filter(a => a.id !== id);
    setAccounts(updatedAccounts);
    persistAccounts(updatedAccounts);
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewAccount({ ...newAccount, password: pass });
  };

  const getPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length > 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const getStrengthColor = (strength) => {
    if (strength === 0) return 'bg-slate-700';
    if (strength === 1) return 'bg-red-500';
    if (strength === 2) return 'bg-yellow-500';
    if (strength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const handleChangeMasterPassword = () => {
    if (passChangeData.old !== masterPassword) {
      setError("Current master password incorrect");
      return;
    }
    if (passChangeData.new.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (passChangeData.new !== passChangeData.confirm) {
      setError("Passwords do not match");
      return;
    }

    // Re-encrypt everything
    const encrypted = encryptData(accounts, passChangeData.new);
    const hash = hashMasterPassword(passChangeData.new);
    saveVault(encrypted, hash);
    
    setMasterPassword(passChangeData.new);
    setIsChangingPassword(false);
    setPassChangeData({ old: '', new: '', confirm: '' });
    setSuccess("Master password updated successfully!");
    setTimeout(() => setSuccess(''), 3000);
  };

  const getStrengthLabel = (strength) => {
    if (strength === 0) return 'Very Weak';
    if (strength === 1) return 'Weak';
    if (strength === 2) return 'Medium';
    if (strength === 3) return 'Strong';
    return 'Very Strong';
  };

  if (isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel p-8 w-full max-w-md animate-fade relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
          
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20"></div>
              <div className="p-4 bg-blue-500/10 rounded-2xl mb-4 relative z-10 border border-blue-500/20">
                <Shield className="w-12 h-12 text-blue-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Vault</h1>
            <p className="text-slate-400 text-center text-sm">Enterprise-grade local encryption.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">Master Password</label>
              <input 
                type="password" 
                className={`input-field ${error ? 'border-red-500/50' : ''}`}
                placeholder="••••••••••••"
                value={masterPassword}
                onChange={(e) => {
                  setMasterPassword(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              />
              {error && (
                <div className="mt-2 flex items-center gap-2 text-red-400 text-xs font-medium animate-fade">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </div>
              )}
            </div>
            <button onClick={handleUnlock} className="btn-primary w-full justify-center py-4 text-sm font-bold uppercase tracking-widest">
              <Lock className="w-4 h-4" />
              Unlock Vault
            </button>
          </div>
          <p className="mt-8 text-[10px] text-slate-500 text-center leading-relaxed">
            Data stays on your device. Zero-knowledge architecture.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 md:p-12 lg:p-20 relative">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Header */}
        <header className="flex flex-col items-center gap-16 mb-24">
          <div className="flex flex-col items-center gap-8">
            <div className="p-5 bg-cyan-500/10 rounded-[40px] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] animate-fade">
              <ShieldCheck className="w-16 h-16 text-cyan-400" />
            </div>
            <div className="space-y-4">
              <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-b from-white via-cyan-100 to-cyan-500 bg-clip-text text-transparent italic">VAULT</h1>
              <p className="text-base text-cyan-500/60 font-black uppercase tracking-[0.5em]">Secure Terminal • {accounts.length} Nodes Active</p>
            </div>
          </div>

          {/* Corner Search */}
          <div className={`search-wrapper-corner ${isSearchExpanded ? 'expanded' : ''}`}>
            <button 
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="utility-btn group"
              title="Search Vault"
            >
              <ScanSearch className={`w-5 h-5 ${isSearchExpanded ? 'text-cyan-400' : 'text-slate-500'} group-hover:text-cyan-400 transition-all`} />
            </button>
            {isSearchExpanded && (
              <input 
                autoFocus
                type="text" 
                placeholder="Search..." 
                className="search-input-corner animate-fade-left"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => searchQuery === '' && setIsSearchExpanded(false)}
              />
            )}
          </div>
          
          <div className="w-full flex flex-col items-center gap-12">
            <div className="flex items-center gap-6 animate-fade" style={{ animationDelay: '0.2s' }}>
              <button onClick={() => setIsAdding(true)} className="btn-primary py-4 px-10 shadow-cyan-500/20 shadow-2xl text-xs uppercase tracking-widest font-bold group">
                <Fingerprint className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                New Account
              </button>

              <button 
                onClick={() => setIsChangingPassword(true)}
                className="utility-btn group"
                title="Change Master Password"
              >
                <Settings2 className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
              </button>

              <button 
                onClick={() => {
                  setIsLocked(true);
                  setMasterPassword('');
                  setAccounts([]);
                }} 
                className="utility-btn group"
                title="Lock Vault"
              >
                <LockKeyhole className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </button>
            </div>
          </div>
        </header>

        {success && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-sm animate-fade flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Main Content */}
        {isChangingPassword ? (
          <div className="glass-panel p-8 animate-fade max-w-md mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
            <h2 className="text-2xl font-bold mb-6 text-center">Change Security Key</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Current Password</label>
                <input 
                  type="password" 
                  className="input-field"
                  value={passChangeData.old}
                  onChange={(e) => setPassChangeData({...passChangeData, old: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">New Password</label>
                <input 
                  type="password" 
                  className="input-field"
                  value={passChangeData.new}
                  onChange={(e) => setPassChangeData({...passChangeData, new: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  className="input-field"
                  value={passChangeData.confirm}
                  onChange={(e) => setPassChangeData({...passChangeData, confirm: e.target.value})}
                />
              </div>
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsChangingPassword(false)} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex-1 text-sm font-bold uppercase tracking-widest text-slate-400">Cancel</button>
                <button onClick={handleChangeMasterPassword} className="btn-primary flex-1 justify-center text-sm font-bold uppercase tracking-widest shadow-cyan-500/20 shadow-xl">Update</button>
              </div>
            </div>
          </div>
        ) : isAdding ? (
          <div className="glass-panel p-8 animate-fade max-w-2xl mx-auto border-blue-500/20 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Security Credentials</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Define your account details below</p>
                </div>
              </div>
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors bg-white/5 rounded-xl hover:bg-white/10 border border-white/5">Cancel</button>
            </div>
            
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Service Title</label>
                  <input 
                    type="text" 
                    className="input-field py-4" 
                    placeholder="e.g. Netflix, Amazon"
                    value={newAccount.title}
                    onChange={(e) => setNewAccount({...newAccount, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Username or Email</label>
                  <input 
                    type="text" 
                    className="input-field py-4" 
                    placeholder="yourname@domain.com"
                    value={newAccount.username}
                    onChange={(e) => setNewAccount({...newAccount, username: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Secret Password</label>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${newAccount.password ? 'text-blue-400' : 'text-slate-600'}`}>
                      {newAccount.password ? getStrengthLabel(getPasswordStrength(newAccount.password)) : 'Minimum 8 Characters'}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      className="input-field py-4 font-mono tracking-wider flex-1" 
                      placeholder="••••••••••••"
                      value={newAccount.password}
                      onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                    />
                    <button 
                      onClick={generatePassword} 
                      className="p-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-2 transition-all border border-white/5 whitespace-nowrap group"
                    >
                      <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                      <span className="text-xs font-bold uppercase tracking-widest">Generate</span>
                    </button>
                  </div>
                </div>
                
                {/* Strength Meter */}
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-full flex-1 transition-all duration-500 ${
                        getPasswordStrength(newAccount.password) > i 
                        ? getStrengthColor(getPasswordStrength(newAccount.password))
                        : 'bg-transparent'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={handleAddAccount} 
                className="btn-primary w-full justify-center py-5 text-sm font-bold uppercase tracking-[0.2em] shadow-blue-500/20 shadow-2xl mt-4"
                disabled={!newAccount.title || !newAccount.password}
              >
                <Save className="w-5 h-5 mr-1" />
                Encrypt & Save
              </button>
            </div>
          </div>
        ) : (
          <div className="cards-grid">
            {accounts.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.username.toLowerCase().includes(searchQuery.toLowerCase())).map(account => (
              <div key={account.id} className="glass-panel account-card hover:border-blue-500/40 transition-all group relative overflow-hidden border-white/[0.05]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl -mr-12 -mt-12 pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
                
                <div className="space-y-2 relative z-10 w-full text-center">
                  <div className="flex flex-col items-center">
                    <div className="card-icon w-12 h-12 rounded-[16px] bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 font-bold text-xl border border-blue-500/20 shadow-inner group-hover:scale-105 transition-transform">
                      {account.title[0].toUpperCase()}
                    </div>
                    <h3 className="card-title font-bold text-lg leading-tight tracking-tight group-hover:text-blue-400 transition-colors">{account.title}</h3>
                    <p className="card-username text-[8px] text-slate-500 font-bold uppercase tracking-widest">{account.username}</p>
                  </div>
                  
                  <div className="password-field bg-black/40 border border-white/5 rounded-xl p-2 flex items-center justify-between group/field mt-2">
                    <span className="password-text font-mono text-slate-300 tracking-[0.1em] overflow-hidden whitespace-nowrap text-ellipsis mr-1">
                      {showPassword[account.id] ? account.password : '••••••'}
                    </span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => togglePasswordVisibility(account.id)}
                        className="p-1 hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword[account.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-white/5 relative z-10 w-full">
                    <div className={`w-1.5 h-1.5 rounded-full ${getStrengthColor(getPasswordStrength(account.password))}`}></div>
                    <button 
                      onClick={() => handleDeleteAccount(account.id)} 
                      className="absolute right-2 bottom-2 p-2.5 text-slate-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 bg-red-400/5 hover:bg-red-400/10 rounded-xl"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
              </div>
            ))}
            
            {accounts.length === 0 && searchQuery === '' && (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-500 bg-white/[0.02] rounded-[48px] border-2 border-dashed border-white/[0.05] animate-fade">
                <div className="p-8 bg-blue-500/5 rounded-[32px] mb-8 border border-blue-500/10 relative">
                  <div className="absolute inset-0 bg-blue-500/10 blur-3xl opacity-20"></div>
                  <Shield size={64} className="text-blue-500/30 relative z-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-200 mb-2">Vault Initialized</h3>
                <p className="text-sm max-w-xs text-center leading-relaxed text-slate-500">Your local fortress is ready. Add your first encrypted record to begin.</p>
                <button onClick={() => setIsAdding(true)} className="mt-10 btn-primary py-4 px-10 rounded-2xl">
                  <Plus size={20} className="mr-1" />
                  New Record
                </button>
              </div>
            )}
            
            {accounts.length > 0 && accounts.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.username.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <div className="col-span-full py-32 text-center text-slate-500 animate-fade">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="opacity-20" />
                </div>
                <h3 className="text-lg font-bold text-slate-300">No results found</h3>
                <p className="text-sm mt-1">Try adjusting your search terms</p>
                <button onClick={() => setSearchQuery('')} className="mt-6 text-blue-400 text-sm font-bold uppercase tracking-widest hover:text-blue-300 underline underline-offset-4 decoration-2">Clear Search</button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      {!isAdding && accounts.length > 0 && (
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <Lock size={12} className="text-blue-500/50" />
            <span>AES-256 Local Encryption Active</span>
          </div>
          <p>© 2026 Vault Premium • Privacy First</p>
        </div>
      )}
    </div>
  );
};

export default App;
