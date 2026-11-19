import { Link, Tooltip } from '@heroui/react';
import { cn, toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

export function NavFooter({
    items,
    collapsed = false,
    className,
}: {
    items: NavItem[];
    collapsed?: boolean;
    className?: string;
}) {
    return (
        <nav aria-label="Resources" className={cn('grid gap-2', className)}>
            {items.map((item) => (
                <Tooltip key={item.title} isDisabled={!collapsed} delay={0}>
                    <Link
                        href={toUrl(item.href)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.title}
                        className="flex gap-2 px-3 py-2 text-sm text-muted"
                    >
                        {item.icon && <item.icon className="size-5 shrink-0" />}
                        <span className="sidebar-label">{item.title}</span>
                    </Link>
                    <Tooltip.Content placement="right">
                        {item.title}
                    </Tooltip.Content>
                </Tooltip>
            ))}
        </nav>
    );
}
