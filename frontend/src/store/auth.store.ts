import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Create the store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      login: (data) =>
        set(() => ({
          token: data.token,
          user: data.user,
          isAuthenticated: true,
          isAdmin: data.user.role === "ADMIN",
        })),

      logout: () =>
        set(() => ({
          token: null,
          user: null,
          isAuthenticated: false,
          isAdmin: false,
        })),
    }),
    {
      name: "election-auth-app-storage", // name of the item in storage
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);
