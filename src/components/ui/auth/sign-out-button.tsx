"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
    return (
        <button
        type = "button"
        className = " rounded border px-3 py-1 text-sm"
        onClick = {() => signOut({callbackUrl: "/sign-in"})}
        >
            Sign out
        </button>
    )
}