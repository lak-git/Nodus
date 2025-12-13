import { useState, useEffect, useCallback } from 'react';

export interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    loading: boolean;
    error: string | null;
    retry: () => void;
    isStale: boolean;
    timestamp: number | null;
}

const GEOLOCATION_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
};

const CACHE_KEY = 'last_known_location';

export const useGeolocation = (): GeolocationState => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [coordinates, setCoordinates] = useState<{ latitude: number | null; longitude: number | null }>({
        latitude: null,
        longitude: null,
    });
    const [extra, setExtra] = useState<{ isStale: boolean; timestamp: number | null }>({
        isStale: false,
        timestamp: null,
    });

    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const timestamp = Date.now();

                // Update state
                setCoordinates({ latitude, longitude });
                setExtra({ isStale: false, timestamp });
                setLoading(false);

                // Cache location
                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        latitude,
                        longitude,
                        timestamp
                    }));
                } catch (e) {
                    console.warn('Failed to cache location', e);
                }
            },
            (err) => {
                // Try to load from cache
                try {
                    const cached = localStorage.getItem(CACHE_KEY);
                    if (cached) {
                        const { latitude, longitude, timestamp } = JSON.parse(cached);
                        setCoordinates({ latitude, longitude });
                        setExtra({ isStale: true, timestamp });
                        setLoading(false);
                        // We can still show a warning if we want, or just rely on isStale
                        // For now let's set a mild error or just null error but isStale=true
                        // If the user wants error + stale data, we can set error too.
                        // Let's set error so valuable info isn't lost, but data is present.
                    } else {
                        // No cache, normal error handling
                        handleError(err);
                    }
                } catch (e) {
                    handleError(err);
                }
            },
            GEOLOCATION_OPTIONS
        );
    }, []);

    const handleError = (err: any) => {
        let errorMessage = 'An unknown error occurred';
        if (typeof err === 'object' && err !== null && 'code' in err) {
            switch (err.code) {
                case err.PERMISSION_DENIED:
                    errorMessage = 'Location access denied. Please enable permissions.';
                    break;
                case err.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable. You might be in a dead zone.';
                    break;
                case err.TIMEOUT:
                    errorMessage = 'Location request timed out. Please try again.';
                    break;
                default:
                    errorMessage = err.message || errorMessage;
            }
        } else if (err instanceof Error) {
            errorMessage = err.message;
        }

        setError(errorMessage);
        setLoading(false);
    };

    useEffect(() => {
        getLocation();

        const handleOnline = () => {
            // Retry when back online
            getLocation();
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [getLocation]);

    return { ...coordinates, loading, error, retry: getLocation, ...extra };
};
