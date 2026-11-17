import { linkVariants } from '@heroui/react';
import { Link } from '@inertiajs/react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type Props = ComponentProps<typeof Link>;

export default function TextLink({
    className = '',
    children,
    ...props
}: Props) {
    return (
        <Link className={cn(linkVariants().base(), className)} {...props}>
            {children}
        </Link>
    );
}
