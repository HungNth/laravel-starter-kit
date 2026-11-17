import { Label, ToggleButton, ToggleButtonGroup } from '@heroui/react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();
    return (
        <div className={cn('w-fit', className)} {...props}>
            <ToggleButtonGroup
                aria-label="Appearance"
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={[appearance]}
                onSelectionChange={(keys) => {
                    if (keys.has('light')) {
                        updateAppearance('light');
                    } else if (keys.has('dark')) {
                        updateAppearance('dark');
                    } else if (keys.has('system')) {
                        updateAppearance('system');
                    }
                }}
            >
                <ToggleButton id="light">
                    <Sun className="size-4" />
                    <Label>Light</Label>
                </ToggleButton>
                <ToggleButton id="dark">
                    <Moon className="size-4" />
                    <Label>Dark</Label>
                </ToggleButton>
                <ToggleButton id="system">
                    <Monitor className="size-4" />
                    <Label>System</Label>
                </ToggleButton>
            </ToggleButtonGroup>
        </div>
    );
}
