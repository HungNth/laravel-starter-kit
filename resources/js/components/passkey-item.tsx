import { Button, Modal } from '@heroui/react';
import { KeyRound, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Passkey } from '@/types/auth';

type Props = {
    passkey: Passkey;
    onDelete: (id: number, onError: () => void) => void;
};

export default function PasskeyItem({ passkey, onDelete }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        onDelete(passkey.id, () => setIsDeleting(false));
    };

    return (
        <div className="flex items-center justify-between gap-3 border-b border-border p-4 last:border-b-0">
            <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
                    <KeyRound className="h-5 w-5 text-muted" />
                </div>
                <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <p className="font-medium tracking-tight wrap-anywhere">
                            {passkey.name}
                        </p>
                        {passkey.authenticator && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-surface-secondary px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted uppercase ring-1 ring-border ring-inset">
                                {passkey.authenticator}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted">
                        Added {passkey.created_at_diff}
                        {passkey.last_used_at_diff && (
                            <>
                                <span className="mx-1 text-muted/50">/</span>
                                Last used {passkey.last_used_at_diff}
                            </>
                        )}
                    </p>
                </div>
            </div>

            <Modal>
                <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    className="shrink-0 text-danger hover:bg-danger/10 hover:text-danger"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                </Button>

                <Modal.Backdrop>
                    <Modal.Container>
                        <Modal.Dialog>
                            <Modal.CloseTrigger />
                            <Modal.Heading>Remove passkey</Modal.Heading>
                            <p slot="description">
                                Are you sure you want to remove the "
                                {passkey.name}" passkey? You will no longer be
                                able to use it to sign in.
                            </p>
                            <Modal.Footer className="gap-2">
                                <Button slot="close" variant="secondary">
                                    Cancel
                                </Button>

                                <Button
                                    variant="danger"
                                    onClick={handleDelete}
                                    isDisabled={isDeleting}
                                >
                                    {isDeleting
                                        ? 'Removing...'
                                        : 'Remove passkey'}
                                </Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </div>
    );
}
