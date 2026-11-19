import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo({ compact = false }: { compact?: boolean }) {
    const { name } = usePage().props;

    return (
        <>
            {compact ? (
                <AppLogoIcon className="size-8 shrink-0 fill-current" />
            ) : (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <AppLogoIcon className="size-5 fill-current" />
                </div>
            )}
            <div className="sidebar-label ml-1 grid min-w-0 flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </>
    );
}
