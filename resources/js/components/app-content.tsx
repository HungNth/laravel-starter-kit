import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import type { AppVariant } from '@/types';

export function AppContent({
    variant = 'sidebar',
    className,
    ...props
}: ComponentProps<'main'> & { variant?: AppVariant }) {
    return (
        <main
            className={cn(
                'flex min-w-0 flex-1 flex-col',
                variant === 'header'
                    ? 'mx-auto w-full max-w-7xl gap-4'
                    : 'bg-background md:m-2 md:ml-0 md:rounded-xl',
                className,
            )}
            {...props}
        />
    );
}
