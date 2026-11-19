import { usePage } from '@inertiajs/react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { AppVariant } from '@/types';

type SidebarState = {
    expanded: boolean;
    sidebarToggled: boolean;
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
    toggle: () => void;
};

const SidebarContext = createContext<SidebarState | null>(null);

export function useAppSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('Sidebar controls require AppShell.');
    }
    return context;
}

export function AppShell({
    children,
    variant = 'sidebar',
}: {
    children: ReactNode;
    variant?: AppVariant;
}) {
    const { sidebarOpen } = usePage().props;
    const [expanded, setExpanded] = useState(sidebarOpen);
    const [sidebarToggled, setSidebarToggled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const isMobile = useIsMobile();

    const toggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            const next = !expanded;
            setExpanded(next);
            setSidebarToggled(true);
            document.cookie = `sidebar_state=${next};path=/;max-age=604800;SameSite=Lax`;
        }
    };

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (
                variant === 'sidebar' &&
                event.key.toLowerCase() === 'b' &&
                (event.ctrlKey || event.metaKey)
            ) {
                event.preventDefault();
                toggle();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    });

    return (
        <SidebarContext
            value={{
                expanded,
                sidebarToggled,
                mobileOpen,
                setMobileOpen,
                toggle,
            }}
        >
            <div
                className={
                    variant === 'header'
                        ? 'flex min-h-svh w-full flex-col'
                        : 'flex min-h-svh w-full'
                }
            >
                {children}
            </div>
        </SidebarContext>
    );
}
