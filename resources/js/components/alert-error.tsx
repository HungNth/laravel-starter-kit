import { Alert } from '@heroui/react';
import { AlertCircleIcon } from 'lucide-react';
export default function AlertError({
    errors,
    title,
}: {
    errors: string[];
    title?: string;
}) {
    return (
        <Alert status="danger">
            <Alert.Indicator>
                <AlertCircleIcon />
            </Alert.Indicator>
            <Alert.Content>
                <Alert.Title>{title || 'Something went wrong.'}</Alert.Title>
                <Alert.Description>
                    <ul className="list-inside list-disc text-sm">
                        {Array.from(new Set(errors)).map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </Alert.Description>
            </Alert.Content>
        </Alert>
    );
}
