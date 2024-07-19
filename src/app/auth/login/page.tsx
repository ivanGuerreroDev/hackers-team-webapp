// generate auth page witn nextUi and firebase



import { useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Button, Input, Spacer } from "@nextui-org/react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAuthStore } from "@/store/auth";

export default function AuthPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const auth = getAuth();
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);
    const setLoading = useAuthStore((state) => state.setLoading);
    const setUser = useAuthStore((state) => state.setUser);
    
    const handleAuth = () => {
        setLoading(true);
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                setUser(userCredential.user);
                router.push("/");
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Sign In</h1>
            <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <Spacer y={1} />
            <Input
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <Spacer y={1} />
            <Button 
                onClick={handleAuth}
                isLoading={loading}
            >Sign In</Button>
        </div>
    );
};