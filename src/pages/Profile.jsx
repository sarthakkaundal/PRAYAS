import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { auth } from './Auth/firebase';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const database = getDatabase();
          const userRef = ref(database, 'users/' + auth.currentUser.uid);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setUserData(snapshot.val());
          } else {
            console.log("No data available");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-12 font-mono text-volt">
        SYNCING_USER_DATA...
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-full p-12 font-mono text-secondary">
        NO_USER_DATA_FOUND
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div className="p-8 border-b border-grid bg-base">
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Operative Profile</h1>
        <p className="font-mono text-sm text-secondary uppercase tracking-widest">ID: {auth.currentUser?.uid}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-grid">
        <div className="bg-base p-8">
          <div className="font-mono text-[10px] text-secondary uppercase tracking-widest mb-4">PERSONAL_IDENTIFICATION</div>
          <div className="mb-6">
            <div className="font-mono text-[10px] text-secondary uppercase tracking-widest">FIRST_NAME</div>
            <div className="text-xl font-bold font-mono">{userData.firstName}</div>
          </div>
          <div className="mb-6">
            <div className="font-mono text-[10px] text-secondary uppercase tracking-widest">LAST_NAME</div>
            <div className="text-xl font-bold font-mono">{userData.lastName}</div>
          </div>
        </div>

        <div className="bg-base p-8">
          <div className="font-mono text-[10px] text-secondary uppercase tracking-widest mb-4">COMMS_ADDRESS</div>
          <div className="mb-6">
            <div className="font-mono text-[10px] text-secondary uppercase tracking-widest">EMAIL</div>
            <div className="text-lg font-bold font-mono text-primary">{userData.email}</div>
          </div>
          <div className="mb-6">
            <div className="font-mono text-[10px] text-secondary uppercase tracking-widest">SECURE_LINE (PHONE)</div>
            <div className="text-lg font-bold font-mono text-volt">{userData.phone}</div>
          </div>
          <div className="mb-6">
            <div className="font-mono text-[10px] text-secondary uppercase tracking-widest">REGISTRATION_DATE</div>
            <div className="text-sm font-mono text-secondary">{new Date(userData.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
