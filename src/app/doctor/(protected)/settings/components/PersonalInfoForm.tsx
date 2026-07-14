// // src/app/doctor/(protected)/settings/components/PersonalInfoForm.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useAppDispatch, useAppSelector } from '@/redux/hooks';
// import { updateDoctorProfile } from '@/redux/features/doctor/doctorThunk';
// import { setCredentials } from '@/redux/auth/authSlice';
// import Input from '@/components/ui/Input';
// import Button from '@/components/ui/Button';

// export default function PersonalInfoForm() {
//   const dispatch = useAppDispatch();
//   const { user, isLoading } = useAppSelector((state) => state.auth);




// src/app/doctor/(protected)/settings/components/PersonalInfoForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateDoctorProfile } from '@/redux/features/doctor/doctorThunk';
import { setCredentials } from '@/redux/auth/authSlice';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function PersonalInfoForm() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  // Structural Core States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Security Update States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Dynamic Array CRUD States (e.g., Languages or custom text arrays)
  const [dynamicItems, setDynamicItems] = useState<string[]>([]);
  const [newItemInput, setNewItemInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setAvatarPreview(user.avatarUrl || null);
      setDynamicItems(user.languages || ['English']); // Populating iterable target items
    }
  }, [user]);

  // ─── Avatar Processing Vector ───
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = (event) => setAvatarPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ─── Dynamic Array CRUD Sub-Methods ───
  const handleAddItem = (e: React.MouseEvent) => {
    e.preventDefault();
    if (newItemInput.trim() && !dynamicItems.includes(newItemInput.trim())) {
      setDynamicItems([...dynamicItems, newItemInput.trim()]);
      setNewItemInput('');
    }
  };

  const startEditInline = (index: number, currentVal: string) => {
    setEditingIndex(index);
    setEditingValue(currentVal);
  };

  const saveEditInline = (index: number) => {
    if (!editingValue.trim()) return;
    const updated = [...dynamicItems];
    updated[index] = editingValue.trim();
    setDynamicItems(updated);
    setEditingIndex(null);
  };

  const handleDeleteItem = (index: number) => {
    setDynamicItems(dynamicItems.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  // ─── Submit Processing ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      alert('New password variants do not match verification bounds.');
      return;
    }

    const formData = new FormData();
    if (avatar) formData.append('avatar', avatar);

    // Packages identity modifications alongside security hashes
    const profileData: Record<string, any> = {
      firstName,
      lastName,
      phone, // Updates core mobile configuration details
      bio,
      languages: dynamicItems, // Saves complete modified array state
    };

    if (currentPassword && newPassword) {
      profileData.securityUpdate = {
        currentPassword,
        newPassword,
      };
    }

    formData.append('data', JSON.stringify(profileData));

    const resultAction = await dispatch(updateDoctorProfile(formData));
    if (updateDoctorProfile.fulfilled.match(resultAction)) {
      dispatch(setCredentials(resultAction.payload.user));
      
      // Clear security inputs upon clean state mutations
      setCurrentPassword('');
      newPassword && setNewPassword('');
      confirmPassword && setConfirmPassword('');
      
      alert('Profile records and structural items updated successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      
      {/* SECTION 1: Core Personal Metrics */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Identity Details &amp; Contacts</h3>
          <p className="text-xs text-slate-400">Configure public tracking information and active mobile numbers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-1 p-4 bg-slate-50 dark:bg-[#1a1c3d]/20 rounded-xl border border-slate-200 dark:border-[#24274d] flex flex-col items-center justify-center text-center">
            <div
              onClick={() => document.getElementById('settingsAvatarInput')?.click()}
              className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group bg-white dark:bg-[#151732] shadow-sm mb-2"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-2">
                  <i className="fas fa-camera text-slate-400 text-sm"></i>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex">
                <i className="fas fa-pencil text-white text-xs"></i>
              </div>
              <input type="file" id="settingsAvatarInput" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase">Change Avatar</h4>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="First Name *" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              <Input label="Last Name *" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              <Input label="Mobile Phone Vector *" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Biography</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-[#24274d] bg-white dark:bg-[#151732] px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-100 dark:border-[#24274d]/50" />

      {/* SECTION 2: Dynamic List Block Supporting Full CRUD Handling */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Manage Spoken Languages</h3>
          <p className="text-xs text-slate-400">Perform quick add, dynamic modifications, or clean removals on array tracking configurations.</p>
        </div>

        {/* Create Input Field */}
        <div className="flex gap-2 items-end max-w-md">
          <div className="flex-1">
            <Input label="Add New Variant" value={newItemInput} onChange={(e) => setNewItemInput(e.target.value)} placeholder="e.g. German" />
          </div>
          <button type="button" onClick={handleAddItem} className="h-[38px] px-4 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition">
            Add Variant
          </button>
        </div>

        {/* Dynamic Display Grid representing item entries list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {dynamicItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#151732] rounded-xl text-xs shadow-sm">
              {editingIndex === index ? (
                /* Modify Vector Component Interface Element Inline */
                <div className="flex gap-2 items-center flex-1 mr-2">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="flex-1 p-1 px-2 border rounded border-slate-300 text-slate-800 dark:text-white dark:bg-[#1a1c3d]"
                  />
                  <button type="button" onClick={() => saveEditInline(index)} className="text-green-600 font-bold hover:underline">Apply</button>
                  <button type="button" onClick={() => setEditingIndex(null)} className="text-slate-400 hover:underline">Cancel</button>
                </div>
              ) : (
                /* View Entry Line Item */
                <>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{item}</span>
                  <div className="flex gap-3 items-center">
                    <button type="button" onClick={() => startEditInline(index, item)} className="text-blue-500 hover:text-blue-700 font-medium">
                      <i className="fas fa-edit"></i> Modify
                    </button>
                    <button type="button" onClick={() => handleDeleteItem(index)} className="text-red-500 hover:text-red-700 font-medium">
                      <i className="fas fa-trash-can"></i> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-100 dark:border-[#24274d]/50" />

      {/* SECTION 3: Password Update Controls */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Security &amp; Passwords</h3>
          <p className="text-xs text-slate-400">Leave security components blank unless an explicit password modifications lifecycle is required.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
          <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" />
          <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm entries match" />
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex justify-end border-t border-slate-100 dark:border-[#24274d]/50 pt-4">
        <Button type="submit" isLoading={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl px-6 py-2.5 shadow-md">
          Save Settings Package
        </Button>
      </div>
    </form>
  );
}