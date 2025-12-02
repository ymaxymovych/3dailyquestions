import { toast as sonnerToast } from 'sonner';

type ToastProps = {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
};

export function useToast() {
    const toast = ({ title, description, variant }: ToastProps) => {
        const message = title || description || '';

        if (variant === 'destructive') {
            sonnerToast.error(title, {
                description,
            });
        } else {
            sonnerToast.success(title, {
                description,
            });
        }
    };

    return { toast };
}

// Export for compatibility
export { sonnerToast as toast };
