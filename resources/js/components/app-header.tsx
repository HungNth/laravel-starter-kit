import { Button, Drawer, buttonVariants } from '@heroui/react';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Menu } from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const mainItems = [{ title: 'Dashboard', href: dashboard(), icon: LayoutGrid }];
const footerItems = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItem[];
}) {
    const [open, setOpen] = useState(false);
    const { isCurrentUrl } = useCurrentUrl();
    return (
        <>
            <header className="border-b border-separator bg-surface">
                <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-4 px-4">
                    <Drawer isOpen={open} onOpenChange={setOpen}>
                        <Button
                            variant="ghost"
                            isIconOnly
                            className="lg:hidden"
                            aria-label="Open navigation"
                        >
                            <Menu className="size-5" />
                        </Button>
                        <Drawer.Backdrop>
                            <Drawer.Content placement="left">
                                <Drawer.Dialog
                                    aria-label="Navigation"
                                    className="w-72 max-w-[calc(100vw-2rem)]"
                                >
                                    <Drawer.CloseTrigger />
                                    <Drawer.Header>
                                        <Drawer.Heading>
                                            Navigation
                                        </Drawer.Heading>
                                    </Drawer.Header>
                                    <Drawer.Body className="grid gap-6">
                                        <NavMain
                                            items={mainItems}
                                            onNavigate={() => setOpen(false)}
                                        />
                                        <NavFooter items={footerItems} />
                                    </Drawer.Body>
                                </Drawer.Dialog>
                            </Drawer.Content>
                        </Drawer.Backdrop>
                    </Drawer>
                    <Link
                        href={dashboard()}
                        aria-label="Dashboard"
                        className="flex items-center gap-2"
                    >
                        <AppLogo />
                    </Link>
                    <nav aria-label="Main" className="hidden lg:flex">
                        {mainItems.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                aria-current={
                                    isCurrentUrl(item.href) ? 'page' : undefined
                                }
                                className={buttonVariants({
                                    variant: isCurrentUrl(item.href)
                                        ? 'secondary'
                                        : 'ghost',
                                })}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                    <div className="ml-auto hidden lg:block">
                        <NavFooter items={footerItems} className="flex" />
                    </div>
                    <div className="ml-auto lg:ml-0">
                        <NavUser collapsed />
                    </div>
                </div>
            </header>
            {breadcrumbs.length > 1 && (
                <div className="border-b border-separator px-4 py-3">
                    <div className="mx-auto max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
