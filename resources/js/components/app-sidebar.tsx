import { Drawer } from '@heroui/react';
import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { useAppSidebar } from '@/components/app-shell';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

const mainItems = [{ title: 'Dashboard', href: dashboard(), icon: LayoutGrid }];
const footerItems = [
    {
        title: 'Repository',
        href: 'https://github.com/HungNth/laravel-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://github.com/HungNth/laravel-starter-kit#readme',
        icon: BookOpen,
    },
];

function SidebarContent({
    collapsed = false,
    onNavigate,
}: {
    collapsed?: boolean;
    onNavigate?: () => void;
}) {
    return (
        <>
            <Link
                href={dashboard()}
                prefetch
                onClick={onNavigate}
                aria-label="Dashboard"
                className="flex h-12 items-center gap-2 rounded-lg px-2 focus-visible:outline-2 focus-visible:outline-focus"
            >
                <AppLogo compact={collapsed} />
            </Link>
            <NavMain
                items={mainItems}
                collapsed={collapsed}
                onNavigate={onNavigate}
            />
            <div className="mt-auto grid gap-3">
                <NavFooter items={footerItems} collapsed={collapsed} />
                <NavUser onNavigate={onNavigate} />
            </div>
        </>
    );
}

export function AppSidebar() {
    const { expanded, sidebarToggled, mobileOpen, setMobileOpen } =
        useAppSidebar();
    return (
        <>
            <aside
                id="app-sidebar"
                aria-label="Main navigation"
                data-collapsed={expanded ? undefined : ''}
                data-sidebar-toggled={sidebarToggled ? '' : undefined}
                className={cn(
                    'app-sidebar sticky top-0 hidden h-svh shrink-0 flex-col gap-4 overflow-x-clip bg-surface p-2 md:flex',
                    expanded ? 'w-64' : 'w-16',
                )}
            >
                <SidebarContent collapsed={!expanded} />
            </aside>
            <Drawer.Backdrop isOpen={mobileOpen} onOpenChange={setMobileOpen}>
                <Drawer.Content placement="left">
                    <Drawer.Dialog
                        id="app-sidebar-mobile"
                        aria-label="Main navigation"
                        className="w-72 max-w-[calc(100vw-2rem)]"
                    >
                        <Drawer.CloseTrigger />
                        <Drawer.Header>
                            <Drawer.Heading>Navigation</Drawer.Heading>
                        </Drawer.Header>
                        <Drawer.Body className="flex flex-col gap-4">
                            <SidebarContent
                                onNavigate={() => setMobileOpen(false)}
                            />
                        </Drawer.Body>
                    </Drawer.Dialog>
                </Drawer.Content>
            </Drawer.Backdrop>
        </>
    );
}
