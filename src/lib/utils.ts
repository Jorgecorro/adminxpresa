// Simple className concatenation utility
export function cn(...inputs: (string | undefined | null | false)[]): string {
    return inputs
        .filter(Boolean)
        .join(' ');
}

// Format currency in MXN
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
    }).format(amount);
}

// Format date
export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
}

// Format short date
export function formatShortDate(date: string | Date): string {
    return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date));
}

// Calculate days since creation
export function daysSince(date: string | Date): number {
    const created = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get status color class
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pendiente: 'bg-status-pendiente',
        cotizado: 'bg-status-cotizado',
        pagado: 'bg-status-pagado',
        enviado: 'bg-status-enviado',
    };
    return colors[status] || 'bg-gray-500';
}

// Get status label
export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        pendiente: 'Pendiente',
        cotizado: 'Cotizado',
        pagado: 'Con Imagen',
        enviado: 'Enviado',
    };
    return labels[status] || status;
}
