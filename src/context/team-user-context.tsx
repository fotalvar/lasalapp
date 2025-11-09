"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { TeamMember } from "@/lib/types";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { logger } from "@/lib/logger";

interface TeamUserContextType {
  selectedTeamUser: TeamMember | null;
  setSelectedTeamUser: (user: TeamMember | null) => void;
  isLoading: boolean;
}

const TeamUserContext = createContext<TeamUserContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY = "selectedTeamUserId";

export const TeamUserProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTeamUser, setSelectedTeamUser] = useState<TeamMember | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    const fetchUser = async () => {
      // Wait for auth to finish loading
      if (isUserLoading) {
        logger.debug("[TeamUserProvider] Waiting for auth to load");
        setIsLoading(true);
        return;
      }

      // Don't make requests if not authenticated
      if (!user) {
        logger.debug("[TeamUserProvider] No authenticated user");
        setIsLoading(false);
        return;
      }

      if (!db) {
        logger.debug("[TeamUserProvider] No Firestore instance");
        return;
      }

      logger.debug("[TeamUserProvider] Fetching team user", { uid: user.uid });

      try {
        const storedId = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedId) {
          logger.debug("[TeamUserProvider] Found stored team user ID", {
            teamUserId: storedId,
          });
          const userDoc = await getDoc(doc(db, "teamMembers", storedId));
          if (userDoc.exists()) {
            logger.debug("[TeamUserProvider] Team user document found");
            setSelectedTeamUser({
              id: userDoc.id,
              ...userDoc.data(),
            } as TeamMember);
          } else {
            logger.debug(
              "[TeamUserProvider] Team user document not found, clearing storage"
            );
            // Clear invalid ID from storage
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        } else {
          logger.debug("[TeamUserProvider] No stored team user ID");
        }
      } catch (error) {
        logger.error(
          "[TeamUserProvider] Failed to fetch selected team user",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [db, user, isUserLoading]);

  const handleSetSelectedUser = (user: TeamMember | null) => {
    setSelectedTeamUser(user);
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, user.id);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  return (
    <TeamUserContext.Provider
      value={{
        selectedTeamUser,
        setSelectedTeamUser: handleSetSelectedUser,
        isLoading,
      }}
    >
      {children}
    </TeamUserContext.Provider>
  );
};

export const useTeamUser = () => {
  const context = useContext(TeamUserContext);
  if (context === undefined) {
    throw new Error("useTeamUser must be used within a TeamUserProvider");
  }
  return context;
};
