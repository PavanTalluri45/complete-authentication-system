"use client";

import { useEffect, useState } from "react";

interface ProgressBarProps {
    isLoading?: boolean;
    duration?: number;
}

export function ProgressBar({ isLoading = false, duration = 2000 }: ProgressBarProps) {
    const [progress, setProgress] = useState(0);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isLoading) {
            setShow(true);
            setProgress(0);


            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, duration / 10);

            return () => clearInterval(interval);
        } else {

            setProgress(100);
            const timer = setTimeout(() => {
                setShow(false);
                setProgress(0);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [isLoading, duration]);

    if (!show) return null;

    return (
        <div className="fixed top-0 left-0 w-full z-50">
            <div
                className="h-1 bg-blue-600 transition-all duration-300 ease-out"
                style={{
                    width: `${progress}%`,
                    boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)"
                }}
            />
        </div>
    );
}