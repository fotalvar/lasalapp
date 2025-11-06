'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { TeamMember } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface TeamUserContextType {
  selectedTeamUser: TeamMember | null;
  setSelectedTeamUser: (user: TeamMember | null) => void;
  isLoading: boolean;
}

const TeamUserContext = createContext<TeamUserContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'selectedTeamUserId';

export const TeamUserProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTeamUser, setSelectedTeamUser] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const db = useFirestore();

  useEffect(() => {
    const fetchUser = async () => {
      if (!db) return;
      try {
        const storedId = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedId) {
          const userDoc = await getDoc(doc(db, 'teamMembers', storedId));
          if (userDoc.exists()) {
            setSelectedTeamUser({ id: userDoc.id, ...userDoc.data() } as TeamMember);
          } else {
            // Clear invalid ID from storage
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error("Failed to fetch selected team user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [db]);

  const handleSetSelectedUser = (user: TeamMember | null) => {
    setSelectedTeamUser(user);
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, user.id);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  return (
    <TeamUserContext.Provider value={{ selectedTeamUser, setSelectedTeamUser: handleSetSelectedUser, isLoading }}>
      {children}
    </TeamUserContext.Provider>
  );
};

export const useTeamUser = () => {
  const context = useContext(TeamUserContext);
  if (context === undefined) {
    throw new Error('useTeamUser must be used within a TeamUserProvider');
  }
  return context;
};
