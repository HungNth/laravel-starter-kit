import { Tooltip, buttonVariants } from '@heroui/react';
import { Link } from '@inertiajs/react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

export function NavMain({
    items,
    collapsed = false,
    onNavigate,
}: {
    items: NavItem[];
    collapsed?: boolean;
    onNavigate?: () => void;
}) {
    const { isCurrentUrl } = useCurrentUrl();
    return (
        <nav aria-label="Platform" className="grid gap-1">
            {!collapsed && (
                <p className="px-3 py-2 text-xs text-muted">Platform</p>
            )}
            {items.map((item) => (
                <Tooltip key={item.title} isDisabled={!collapsed} delay={0}>
                    <Tooltip.Trigger<'a'>
                        render={({
                            onProgress: _onProgress,
                            onError: _onError,
                            ...props
                        }) => (
                            <Link
                                {...props}
                                role={undefined}
                                href={item.href}
                                prefetch
                                onClick={onNavigate}
                                aria-current={
                                    isCurrentUrl(item.href) ? 'page' : undefined
                                }
                                aria-label={collapsed ? item.title : undefined}
                                className={cn(
                                    buttonVariants({
                                        variant: isCurrentUrl(item.href)
                                            ? 'secondary'
                                            : 'ghost',
                                    }),
                                    'w-full justify-start',
                                    collapsed && 'justify-center px-0',
                                )}
                            >
                                {item.icon && (
                                    <item.icon className="size-5 shrink-0" />
                                )}
                                {!collapsed && <span>{item.title}</span>}
                            </Link>
                        )}
                    />
                    <Tooltip.Content placement="right">
                        {item.title}
                    </Tooltip.Content>
                </Tooltip>
            ))}
        </nav>
    );
}
