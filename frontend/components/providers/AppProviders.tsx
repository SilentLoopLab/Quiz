"use client";

import type { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthSessionBootstrap } from "../../hooks/useAuthSessionBootstrap";

interface AppProvidersProps {
    children: ReactNode;
}

const fallbackGoogleClientId =
    "1302899154-gi7uunv3qq9h4as33nqj6dqksj6plebvs.apps.googleusercontent.com";

export default function AppProviders({ children }: AppProvidersProps) {
    useAuthSessionBootstrap();

    const googleClientId =
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || fallbackGoogleClientId;

    return (
        <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
    );
}
