import { Breadcrumbs as HeroBreadcrumbs, Link } from '@heroui/react';
import { router } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { toUrl } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

export function Breadcrumbs({
    breadcrumbs,
}: {
    breadcrumbs: BreadcrumbItem[];
}) {
    if (!breadcrumbs.length) {
        return null;
    }
    return (
        <HeroBreadcrumbs>
            {breadcrumbs.map((item, index) => (
                <HeroBreadcrumbs.Item key={toUrl(item.href)}>
                    {() =>
                        index === breadcrumbs.length - 1 ? (
                            <Link aria-current="page">{item.title}</Link>
                        ) : (
                            <>
                                <Link
                                    href={toUrl(item.href)}
                                    onClick={(event) => {
                                        if (
                                            event.button === 0 &&
                                            !event.ctrlKey &&
                                            !event.metaKey &&
                                            !event.shiftKey &&
                                            !event.altKey
                                        ) {
                                            event.preventDefault();
                                            router.visit(item.href);
                                        }
                                    }}
                                    className="breadcrumbs__link"
                                >
                                    {item.title}
                                </Link>
                                <ChevronRight
                                    aria-hidden="true"
                                    className="breadcrumbs__separator"
                                />
                            </>
                        )
                    }
                </HeroBreadcrumbs.Item>
            ))}
        </HeroBreadcrumbs>
    );
}
