import { Toast } from '@heroui/react';
import { useFlashToast } from '@/hooks/use-flash-toast';

export function Notifications() {
    useFlashToast();
    return <Toast.Provider placement="bottom end" />;
}
