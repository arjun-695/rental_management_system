import 'next-auth'

declare module 'next-auth' {
    interface Session{
        user: {
            id: string;
            role: "TENANT" | "OWNER" | "ADMIN";
            age: number | null;
        } & Session["user"]
    }

    interface User{
        role: "TENANT" | "OWNER" | "ADMIN";
        age: number | null;
    }
}