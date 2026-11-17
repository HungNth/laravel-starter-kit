import { Button, Dropdown } from '@heroui/react';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';

export function NavUser({
    collapsed = false,
    onNavigate,
}: {
    collapsed?: boolean;
    onNavigate?: () => void;
}) {
    const { auth } = usePage().props;
    if (!auth.user) {
        return null;
    }
    return (
        <Dropdown>
            <Button
                variant="ghost"
                className="h-auto w-full justify-start p-1"
                aria-label="Account menu"
                data-test="sidebar-menu-button"
            >
                <UserInfo user={auth.user} compact={collapsed} />
                {!collapsed && (
                    <ChevronsUpDown className="ml-auto size-4 shrink-0" />
                )}
            </Button>
            <Dropdown.Popover placement="bottom end" className="w-64">
                <UserMenuContent user={auth.user} onNavigate={onNavigate} />
            </Dropdown.Popover>
        </Dropdown>
    );
}
