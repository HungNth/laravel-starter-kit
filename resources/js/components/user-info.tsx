import { Avatar } from '@heroui/react';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
    compact = false,
}: {
    user: User;
    showEmail?: boolean;
    compact?: boolean;
}) {
    const getInitials = useInitials();
    return (
        <>
            <Avatar size="sm" className="shrink-0">
                <Avatar.Image src={user.avatar} alt={user.name} />
                <Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
            </Avatar>
            {!compact && (
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    {showEmail && (
                        <span className="truncate text-xs text-muted">
                            {user.email}
                        </span>
                    )}
                </div>
            )}
        </>
    );
}
