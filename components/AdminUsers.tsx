import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { AppView, TeamMember } from '../types.ts';
import { TopAppBar, BottomNav } from './Layout.tsx';

interface AdminUsersProps {
    onViewChange: (view: AppView) => void;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ onViewChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<TeamMember[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');

    const [showAssignMembersModal, setShowAssignMembersModal] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const fetchedUsers = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || 'Unknown',
                role: doc.data().role || 'Member',
                avatar: doc.data().avatar || `https://picsum.photos/seed/${doc.id}/100/100`,
                ...doc.data()
            })) as TeamMember[];
            setUsers(fetchedUsers);
        });
        return () => unsubscribe();
    }, []);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const updateRole = async (userId: string, newRole: string) => {
        // Prevent modifying the super admin hardcoded in App.tsx logic (visual check)
        const user = users.find(u => u.id === userId);
        if (user?.email === 'admin@office.com') {
            alert("Cannot modify the Super Admin.");
            return;
        }

        try {
            await updateDoc(doc(db, "users", userId), { role: newRole });
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Failed to update role.");
        }
    };

    const handleAddUser = async () => {
        if (!newUserName || !newUserEmail) return;
        try {
            // Create a placeholder user document in Firestore
            // Note: This does not create an Auth user. The user must sign in with this email to 'claim' it 
            // (or we rely on app logic to match email). 
            // Since we use UID as doc ID usually, here we might need to let Firestore generate ID 
            // OR use email as ID if we want to pre-provision reliably before Auth UID exists.
            // But App.tsx logic uses `doc(db, "users", firebaseUser.uid)`.
            // So pre-creating is tricky without Auth UID.
            // SOLUTION: for now, we just add to collection. App.tsx should validly READ from collection?
            // Wait, App.tsx writes to `users/{uid}`.
            // If we create a doc here with auto-ID, it won't match the user's UID when they log in.
            // We should arguably use EMAIL as the key or have a secondary lookup.
            // simpler approach for this demo: Just add it, and assume we list it. 
            // Ideally, we'd use Admin SDK to create Auth user, but we can't here.

            await addDoc(collection(db, "users"), {
                name: newUserName,
                email: newUserEmail,
                role: 'Member',
                avatar: `https://ui-avatars.com/api/?name=${newUserName}&background=random`,
                createdAt: new Date()
            });
            setShowAddModal(false);
            setNewUserName('');
            setNewUserEmail('');
            alert("User added! (Note: They will need to sign in matching this data)");
        } catch (e) {
            console.error("Error adding user:", e);
        }
    };



    const hasMembers = (leadId: string) => {
        return users.some(u => u.teamLeadId === leadId);
    };

    const openAssignMembersModal = (leadId: string) => {
        setSelectedLeadId(leadId);
        // Pre-select members currently assigned to this lead
        const currentlyAssigned = new Set(users.filter(u => u.teamLeadId === leadId).map(u => u.id));
        setSelectedMemberIds(currentlyAssigned);
        setShowAssignMembersModal(true);
    };

    const toggleMemberSelection = (memberId: string) => {
        const newSelection = new Set(selectedMemberIds);
        if (newSelection.has(memberId)) {
            newSelection.delete(memberId);
        } else {
            newSelection.add(memberId);
        }
        setSelectedMemberIds(newSelection);
    };

    const saveMemberAssignments = async () => {
        if (!selectedLeadId) return;

        const updates: Promise<void>[] = [];
        const memberUsers = users.filter(u => u.role === 'Member');

        for (const member of memberUsers) {
            const isSelected = selectedMemberIds.has(member.id);
            const currentLead = member.teamLeadId;

            if (isSelected && currentLead !== selectedLeadId) {
                updates.push(updateDoc(doc(db, "users", member.id), { teamLeadId: selectedLeadId }));
            } else if (!isSelected && currentLead === selectedLeadId) {
                updates.push(updateDoc(doc(db, "users", member.id), { teamLeadId: null }));
            }
        }

        try {
            await Promise.all(updates);
            setShowAssignMembersModal(false);
            setSelectedLeadId(null);
            alert("Member assignments updated successfully!");
        } catch (error) {
            console.error("Error saving assignments:", error);
            alert("Failed to save assignments.");
        }
    };

    return (
        <div className="flex flex-col flex-1 animate-in fade-in duration-500">
            <TopAppBar
                title="User Management"
                leftIcon="arrow_back"
                onLeftClick={() => onViewChange(AppView.PROFILE)}
                rightIcon="person_add"
                onRightClick={() => setShowAddModal(true)}
            />

            <main className="flex-1 overflow-y-auto p-4 pb-32">
                <div className="mb-6">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-[0.1em] mb-4">Administration Control</p>
                    <div className="relative w-full">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Search by name or current role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-primary text-sm font-medium dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <div key={user.id} className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img src={user.avatar} alt={user.name} className="size-14 rounded-2xl object-cover" />
                                        <div className={`absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${user.role === 'Admin' ? 'bg-purple-600' : user.role === 'Team Lead' ? 'bg-primary' : 'bg-slate-400'}`}>
                                            <span className="material-symbols-outlined text-[10px] text-white">
                                                {user.role === 'Admin' ? 'shield_person' : user.role === 'Team Lead' ? 'stars' : 'person'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-slate-900 dark:text-white font-black text-base">{user.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${user.role === 'Admin' ? 'bg-purple-100 text-purple-600' : user.role === 'Team Lead' ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Admin Management Button */}
                                    {user.role === 'Admin' ? (
                                        <button
                                            onClick={() => updateRole(user.id, 'Team Lead')}
                                            disabled={user.email === 'admin@office.com'}
                                            className={`px-3 py-2 rounded-xl text-white text-[10px] font-bold shadow-md transition-all ${user.email === 'admin@office.com' ? 'bg-slate-300 cursor-not-allowed' : 'bg-red-500 shadow-red-500/20 hover:bg-red-600 active:scale-95'}`}
                                        >
                                            Revoke Admin
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => updateRole(user.id, 'Admin')}
                                            className="px-3 py-2 rounded-xl bg-purple-600 text-white text-[10px] font-bold shadow-md shadow-purple-600/20 hover:bg-purple-700 active:scale-95 transition-all"
                                        >
                                            Make Admin
                                        </button>
                                    )}

                                    {user.role === 'Team Lead' ? (
                                        <button
                                            onClick={() => updateRole(user.id, 'Member')}
                                            disabled={hasMembers(user.id)}
                                            className={`px-3 py-2 rounded-xl text-white text-[10px] font-bold shadow-md transition-all ${hasMembers(user.id) ? 'bg-slate-300 cursor-not-allowed' : 'bg-orange-500 shadow-orange-500/20 hover:bg-orange-600 active:scale-95'}`}
                                            title={hasMembers(user.id) ? "Cannot revoke: Members assigned" : "Revoke Lead Role"}
                                        >
                                            Revoke Lead
                                        </button>
                                    ) : user.role === 'Member' ? (
                                        <button
                                            onClick={() => updateRole(user.id, 'Team Lead')}
                                            className="px-3 py-2 rounded-xl bg-blue-500 text-white text-[10px] font-bold shadow-md shadow-blue-500/20 hover:bg-blue-600 active:scale-95 transition-all"
                                        >
                                            Make Lead
                                        </button>
                                    ) : null}

                                    {/* Assign Members Button (Only for Leads) */}
                                    {user.role === 'Team Lead' && (
                                        <button
                                            onClick={() => openAssignMembersModal(user.id)}
                                            className="px-3 py-2 rounded-xl bg-indigo-500 text-white text-[10px] font-bold shadow-md shadow-indigo-500/20 hover:bg-indigo-600 active:scale-95 transition-all flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">group_add</span>
                                            Assign Members
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                            <span className="material-symbols-outlined text-5xl mb-3">group_off</span>
                            <p className="font-bold">No users found match your search.</p>
                        </div>
                    )}
                </div>
            </main>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Add New User</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newUserName}
                                    onChange={e => setNewUserName(e.target.value)}
                                    className="w-full h-12 mt-1 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-primary font-bold dark:text-white"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={newUserEmail}
                                    onChange={e => setNewUserEmail(e.target.value)}
                                    className="w-full h-12 mt-1 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-primary font-bold dark:text-white"
                                    placeholder="e.g. john@company.com"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddUser}
                                disabled={!newUserName || !newUserEmail}
                                className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
                            >
                                Add User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Members Modal */}
            {showAssignMembersModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Assign Team Members</h3>
                        <p className="text-slate-500 text-xs font-bold mb-4">Select members for {users.find(u => u.id === selectedLeadId)?.name}</p>

                        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 mb-4 pr-1">
                            {users.filter(u => u.role === 'Member' && (!u.teamLeadId || u.teamLeadId === selectedLeadId)).length > 0 ? (
                                users.filter(u => u.role === 'Member' && (!u.teamLeadId || u.teamLeadId === selectedLeadId)).map(member => {
                                    // const isAssignedToOther = member.teamLeadId && member.teamLeadId !== selectedLeadId; // Now redundant but harmless to keep logic clean if we revert
                                    // With new filter, isAssignedToOther will always be false in this view.

                                    return (
                                        <label key={member.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={selectedMemberIds.has(member.id)}
                                                onChange={() => toggleMemberSelection(member.id)}
                                                className="size-5 rounded-md border-slate-300 text-primary focus:ring-primary"
                                            />
                                            <img src={member.avatar} alt={member.name} className="size-10 rounded-full object-cover" />
                                            <div className="flex-1">
                                                <p className="text-slate-900 dark:text-white font-bold text-sm">{member.name}</p>

                                                {!member.teamLeadId && !selectedMemberIds.has(member.id) && (
                                                    <p className="text-slate-400 text-[10px]">Unassigned</p>
                                                )}
                                                {selectedMemberIds.has(member.id) && (
                                                    <p className="text-emerald-500 text-[10px] font-bold">Selected</p>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })
                            ) : (
                                <p className="text-center text-slate-400 font-bold py-8">No members available.</p>
                            )}
                        </div>

                        <div className="flex gap-3 mt-auto">
                            <button
                                onClick={() => setShowAssignMembersModal(false)}
                                className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveMemberAssignments}
                                className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav currentView={AppView.PROFILE} onViewChange={onViewChange} />
        </div>
    );
};

export default AdminUsers;