// create zustand auth store

import {create} from "zustand";
import { User } from "firebase/auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";

type AuthStore = { 
    user: User | null; 
    loading: boolean;
};

type Action = {
    setLoading: (loading: boolean) => void;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore & Action>(
    (set) => ({
        user: null,
        loading: false,
        setLoading: (loading: boolean) => set({ loading }),
        setUser: (user: User | null) => set({ user }),
    })
);

export const useAuth = () => {
    const { user, setUser, setLoading } = useAuthStore();
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
    });
    return { user, setUser, setLoading };
}

export default useAuthStore;