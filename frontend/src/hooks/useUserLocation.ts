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