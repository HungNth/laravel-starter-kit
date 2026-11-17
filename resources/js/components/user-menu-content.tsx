import { Dropdown, Label } from '@heroui/react';
import { router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import { UserInfo } from '@/components/user-info';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

export function UserMenuContent({
    user,
    onNavigate,
}: {
    user: User;
    onNavigate?: () => void;
}) {
    return (
        <>
            <div className="flex items-center gap-2 border-b border-separator p-3">
                <UserInfo user={user} showEmail />
            </div>
            <Dropdown.Menu aria-label="Account">
                <Dropdown.Item
                    id="settings"
                    textValue="Settings"
                    onAction={() => {
                        onNavigate?.();
                        router.visit(edit());
                    }}
                >
                    <Settings className="size-4" />
                    <Label>Settings</Label>
                </Dropdown.Item>
                <Dropdown.Item
                    id="logout"
                    textValue="Log out"
                    data-test="logout-button"
                    onAction={() => {
                        onNavigate?.();
                        router.flushAll();
                        router.post(logout.url());
                    }}
                >
                    <LogOut className="size-4" />
                    <Label>Log out</Label>
                </Dropdown.Item>
            </Dropdown.Menu>
        </>
    );
}
