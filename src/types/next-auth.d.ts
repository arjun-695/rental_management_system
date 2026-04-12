import 'next-auth'
import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

export type AppRole = "TENANT" | "OWNER" | "ADMIN";

declare module 'next-auth' {
    interface Session{
        user: {
            id: string;
            role: AppRole;
            age: number | null;
        } & DefaultSession["user"];
    }

    interface User{
        role: AppRole;
        age: number | null;
    }
}

declare module "next-auth/jwt"{
    interface JWT{
        id?: string;
        role?: AppRole;
        age?: number | null;
    }
}