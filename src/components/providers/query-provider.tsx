"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {  
    const [Client] = useState(() => new QueryClient())
    return (
        <QueryClientProvider client={Client}>
            {children}
        </QueryClientProvider>
    );
}