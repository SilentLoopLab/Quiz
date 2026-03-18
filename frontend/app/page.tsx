"use client";

import { useEffect } from "react";
import { getStoredAuthToken } from "../lib/authStorage";

export default function Page() {
    useEffect(() => {
        const token = getStoredAuthToken();

        window.location.replace(token ? "/home" : "/login");
    }, []);

    return null;
}
