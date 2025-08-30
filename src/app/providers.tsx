'use client';

import { AuthProvider } from './(main)/auth-provider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    )
}
