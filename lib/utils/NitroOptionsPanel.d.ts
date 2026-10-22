import type { ImageButton, TextButton } from '../types/Button';
import type { AutoImage } from '../types/Image';
import type { AutoText, Distance } from '../types/Text';
import type { DurationWithTimeZone } from '../types/Trip';
import { type NitroAction } from './NitroAction';
import { type GridButton, type NitroGridButton } from './NitroGrid';
import { type NitroImage } from './NitroImage';
import { type DefaultRow, type NitroSection, type RadioRow, type TextRow, type ToggleRow, type WaypointCoordinate, type WaypointRow } from './NitroSection';
export type OptionsPanelGridSection<T> = {
    type: 'grid';
    title?: string;
    buttons: Array<GridButton<T>>;
};
export type ChargingConnector = 'ccs1' | 'ccs2' | 'j1772' | 'chaDeMo' | 'mennekes' | 'gbtDC' | 'gbtAC' | 'nacsDC' | 'nacsAC';
/**
 * one outlet (`CPChargingStationConnection`) on a charging station.
 */
export type ChargerOutlet<T> = {
    connector: ChargingConnector;
    voltage: number;
    /** converted to megawatts on the native side above 1000 kW */
    powerKw: number;
    onPress?: (template: T) => void;
};
/**
 * the charging station's own location, shown as an additional `CPMapTemplateWaypoint` item in
 * the charger section, alongside its outlets.
 */
export type ChargerLocation<T> = {
    /**
     * the item's own label — distinct from the section's `title`, which is already shown as the
     * section header, so this defaults to blank rather than repeating it.
     */
    name?: string;
    /** newline-separated address lines, most-preferred first */
    address?: string;
    coordinate: WaypointCoordinate;
    travelEstimates: {
        distance: Distance;
        duration: DurationWithTimeZone;
        /**
         * by default travel estimates are not shown
         * setting this to true add another row showing CPTravelEstimates
         */
        visible?: boolean;
    };
    image?: AutoImage;
    onPress?: (template: T) => void;
};
/**
 * charger section having n-ChargerOutlet
 */
export type OptionsPanelChargerSection<T> = {
    type: 'charger';
    title?: string;
    outlets: Array<ChargerOutlet<T>>;
    location?: ChargerLocation<T>;
};
export type OptionsPanelListSection<T> = {
    type: 'list';
    title?: string;
    items: Array<DefaultRow<T> | ToggleRow<T> | TextRow | WaypointRow<T>> | Array<RadioRow<T>>;
};
export type OptionsPanelSection<T> = OptionsPanelListSection<T> | OptionsPanelGridSection<T> | OptionsPanelChargerSection<T>;
export type OptionsPanelConfig<T> = {
    title?: AutoText;
    sections: Array<OptionsPanelSection<T>>;
    actions?: [TextButton<T>] | [TextButton<T>, ImageButton<T>];
};
export type NitroOptionsPanelGridSection = {
    title?: string;
    buttons: Array<NitroGridButton>;
};
export type NitroChargerOutlet = {
    connector: ChargingConnector;
    voltage: number;
    powerKw: number;
    onPress?: () => void;
};
export type NitroChargerLocation = {
    name?: string;
    address?: string;
    coordinate: WaypointCoordinate;
    distance: Distance;
    duration: DurationWithTimeZone;
    visible?: boolean;
    image?: NitroImage;
    onPress?: () => void;
};
export type NitroOptionsPanelChargerSection = {
    title?: string;
    outlets: Array<NitroChargerOutlet>;
    location?: NitroChargerLocation;
};
export type NitroOptionsPanelSection = NitroSection | NitroOptionsPanelGridSection | NitroOptionsPanelChargerSection;
export type NitroOptionsPanelConfig = {
    title?: AutoText;
    sections: Array<NitroOptionsPanelSection>;
    actions?: Array<NitroAction>;
};
export declare const NitroOptionsPanelUtil: {
    convert: <T>(template: T, config?: OptionsPanelConfig<T>) => NitroOptionsPanelConfig | undefined;
};
