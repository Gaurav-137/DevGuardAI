// Date formatting utilities for consistent display across the application

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
    };
    return date.toLocaleDateString('en-IN', options);
};

export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
    };
    return date.toLocaleString('en-IN', options);
};

export const formatChartDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
    };
    return date.toLocaleDateString('en-IN', options);
};

export const formatFullDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
    };
    return date.toLocaleDateString('en-IN', options);
};
