import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import {point} from "@turf/helpers";

export type SiteProperties = {
    site: string;
    latitude: number;
    longitude: number;
    block: number;
};

export type SiteFeature = {
    type: "Feature";
    properties: SiteProperties;
    geometry: GeoJSON.MultiPolygon;
};

export type ZonesGeoJSON = {
    type: "FeatureCollection";
    features: SiteFeature[];
};

//Take user coordinates and the loaded GeoJson
//Return the sire that the user's in or null if user's outside the boundary
export function findSiteForLocation(
    userLatitude: number,
    userLongitude: number,
    zones: ZonesGeoJSON
): SiteProperties | null {
    const userPoint = point([userLongitude, userLatitude]);

    for (const feature of zones.features) {
        if (booleanPointInPolygon(userPoint, feature)) {
            return feature.properties;
        }
    }
    return null;
}