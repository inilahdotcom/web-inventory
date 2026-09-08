import { useEffect, useRef } from "react";
import { authService } from "@/services/authServices";

const TIMEOUT_DURATION = 60 * 60 * 1000; // 60 menit dalam milidetik

export function useAutoLogout() {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resetTimer = () => {
        // Hapus timer lama
        if (timerRef.current) clearTimeout(timerRef.current);

        // Jalankan timer baru jika user sudah login
        const token = localStorage.getItem("access_token");
        if (token) {
            timerRef.current = setTimeout(() => {
                alert("Sesi Anda telah berakhir karena tidak ada aktivitas selama 60 menit.");
                authService.logout();
            }, TIMEOUT_DURATION);
        }
    };

    useEffect(() => {
        // Event aktivitas user
        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

        const handleUserActivity = () => {
            resetTimer();
        };

        // Pasang listener saat aplikasi dibuka
        events.forEach((event) => {
            window.addEventListener(event, handleUserActivity);
        });

        // Inisialisasi timer pertama kali
        resetTimer();

        // Cleanup listener saat unmount
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach((event) => {
                window.removeEventListener(event, handleUserActivity);
            });
        };
    }, []);
}