"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function InitialLoader() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validate = async () => {
            try {
                await authAPI.validateSession();
                // Artificial delay if needed for smoother transition, or just instant
                router.push("/home");
            } catch (error) {
                // If validation fails, redirect to login
                router.push("/auth/login");
            } finally {
                setIsLoading(false);
            }
        };

        validate();
    }, [router]);

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <ProgressBar isLoading={isLoading} duration={3000} />
            {/* Optional: Add a subtle loading text or logo here if desired */}
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-xl font-semibold animate-pulse">Initializing...</h2>
                <p className="text-sm text-muted-foreground">Waking up server...</p>
            </div>
        </div>
    );
}
