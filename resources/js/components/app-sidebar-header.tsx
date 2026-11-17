import { Button } from '@heroui/react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useAppSidebar } from '@/components/app-shell';
import { useIsMobile } from '@/hooks/use-mobile';
import type { BreadcrumbItem } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItem[];
}) {
    const { expanded, mobileOpen, toggle } = useAppSidebar();
    const isMobile = useIsMobile();
    const isExpanded = isMobile ? mobileOpen : expanded;
    return (
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-separator px-4">
            <Button
                variant="ghost"
                isIconOnly
                size="sm"
                onPress={toggle}
                aria-label="Toggle sidebar"
                aria-controls={isMobile ? 'app-sidebar-mobile' : 'app-sidebar'}
                aria-expanded={isExpanded}
            >
                {isExpanded ? (
                    <PanelLeftClose className="size-5" />
                ) : (
                    <PanelLeftOpen className="size-5" />
                )}
            </Button>
            <Breadcrumbs breadcrumbs={breadcrumbs} />
        </header>
    );
}
