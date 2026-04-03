import {useState} from 'react';

type Coords = {
    latitude: number;
    longitude: number;
};

type LocationState = {
    coords: Coords | null;
    error: string | null;
    loading: boolean;
}

export function useUserLocation() {
    const [state, setState] = useState<LocationState>({
        coords: null,
        error: null,
        loading: false,
    });

    const locate = () => {
        //Check if browser supports geolocation
        if (!navigator.geolocation) {
            setState((prev: LocationState) => ({
                ...prev, 
                error: "Geolocation is not supported by your browser" 
            }));
            return;
        }

        //Set loading to true while waiting for browser
        setState((prev: LocationState) => ({
            ...prev,
            loading: true,
            error: null
        }));

        navigator.geolocation.getCurrentPosition(
            //After browser has given coordinates
            (position) => {
                console.log("Got coordinates: ", position.coords.latitude, position.coords.longitude);
                setState({
                    coords: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    },
                    error: null,
                    loading: false,
                });

            },
            //Error: if user denied or something went wrong
            (err) => {
                console.error("Location error: ", err.message);
                setState({
                    coords: null,
                    error: err.message,
                    loading: false,
                    
                });
            }
        );
    };

    return {
        coords: state.coords,
        error: state.error,
        loading: state.loading,
        locate,
    };
}