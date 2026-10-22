import type { ListImageType } from '../templates/ListTemplate';
import type { AutoImage } from '../types/Image';
import { type AutoText, type Distance } from '../types/Text';
import type { DurationWithTimeZone } from '../types/Trip';
import { type NitroImage } from './NitroImage';
type BaseRow = {
    title: AutoText;
    enabled?: boolean;
    image?: AutoImage;
    /** @namespace Android */
    imageType?: ListImageType;
};
export type DefaultRow<T> = BaseRow & {
    type: 'default';
    /**
     * adds a chevron at the end of the row
     */
    browsable?: boolean;
    onPress: (template: T) => void;
    detailedText?: AutoText;
};
export type ToggleRow<T> = BaseRow & {
    type: 'toggle';
    checked: boolean;
    onPress: (template: T, checked: boolean) => void;
};
export type RadioRow<T> = BaseRow & {
    type: 'radio';
    onPress: (template: T) => void;
    selected?: boolean;
};
export type TextRow = BaseRow & {
    type: 'text';
    detailedText?: AutoText;
};
export type WaypointCoordinate = {
    latitude: number;
    longitude: number;
    altitude?: number;
};
/**
 * a point of interest, e.g. a charger's location. Renders as a `CPMapTemplateWaypoint` item
 * (showing `title` as the name, `address` as the address, and the travel estimate for reaching
 * it) when part of a `CPMapPanel` (iOS 27+); falls back to a plain row using `title`/`address`
 * as the detail line everywhere else (including Android, which has no equivalent concept).
 */
export type WaypointRow<T> = BaseRow & {
    type: 'waypoint';
    /**
     * add one of {@link TextPlaceholders} to add travelEstimates
     * prefer travelEstimates.visible over that on iOS 27+
     */
    address?: string;
    coordinate: WaypointCoordinate;
    travelEstimates: {
        distance: Distance;
        duration: DurationWithTimeZone;
        /**
         * by default travel estimates are not shown
         * setting this to true adds another row showing CPTravelEstimates
         * @namespace iOS 27+
         */
        visible?: boolean;
    };
    onPress?: (template: T) => void;
};
export type MultiSection<T> = {
    type: 'default';
    title: string;
    items: Array<DefaultRow<T> | ToggleRow<T> | TextRow | WaypointRow<T>>;
} | {
    type: 'radio';
    title: string;
    items: Array<RadioRow<T>>;
};
export type SingleSection<T> = {
    [K in MultiSection<T> as K['type']]: Omit<K, 'title' | 'detailedText'>;
}[MultiSection<T>['type']];
export type Section<T> = Array<MultiSection<T>> | SingleSection<T>;
type NitroSectionType = 'default' | 'radio';
export type NitroRow = {
    title: AutoText;
    detailedText?: AutoText;
    browsable?: boolean;
    enabled: boolean;
    image?: NitroImage;
    imageType?: ListImageType;
    checked?: boolean;
    onPress?: (checked?: boolean) => void;
    selected?: boolean;
    coordinate?: WaypointCoordinate;
    distance?: Distance;
    duration?: DurationWithTimeZone;
    /**
     * only meaningful in panel context (iOS 27+, `mapConfig` set) — adds a sibling `CPMapPanelItem`
     * showing `distance`/`duration` as a native `CPTravelEstimates` row. Non-panel/Android rendering
     * relies purely on `title`/`detailedText` opting in via `TextPlaceholders` instead.
     */
    travelEstimatesVisible?: boolean;
    address?: string;
};
export type NitroSection = {
    title?: string;
    items: Array<NitroRow>;
    type: NitroSectionType;
};
export declare const NitroSectionUtil: {
    convert: <T>(template: T, sections?: Section<T>) => Array<NitroSection> | undefined;
};
export {};
