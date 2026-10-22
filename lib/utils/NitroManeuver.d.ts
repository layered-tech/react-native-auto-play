import { type BaseManeuver, type ForkType, type KeepType, type Lane, type MessageManeuver, type OffRampType, type OnRampType, type PreferredLane, type RoutingManeuver, type TurnType } from '../types/Maneuver';
import type { NitroAttributedString } from './NitroAttributedString';
import { type NitroColor } from './NitroColor';
import { type NitroImage } from './NitroImage';
interface PreferredImageLane extends PreferredLane {
    image: NitroImage;
}
interface ImageLane extends Lane {
    image: NitroImage;
}
export interface LaneGuidance {
    instructionVariants: Array<string>;
    lanes: Array<PreferredImageLane | ImageLane>;
}
export interface NitroRoutingManeuver extends BaseManeuver {
    attributedInstructionVariants: Array<NitroAttributedString>;
    symbolImage: NitroImage;
    junctionImage?: NitroImage;
    turnType?: TurnType;
    angle?: number;
    elementAngles?: Array<number>;
    exitNumber?: number;
    offRampType?: OffRampType;
    onRampType?: OnRampType;
    forkType?: ForkType;
    keepType?: KeepType;
    linkedLaneGuidance?: LaneGuidance;
    cardBackgroundColor: NitroColor;
}
export interface NitroMessageManeuver {
    title: string;
    text?: string;
    image?: NitroImage;
    cardBackgroundColor: NitroColor;
}
interface NitroLoadingManeuver {
    isLoading: true;
    cardBackgroundColor: NitroColor;
    text?: string;
}
export type NitroManeuver = Array<NitroRoutingManeuver> | NitroMessageManeuver | NitroLoadingManeuver;
declare function convert(autoManeuver: MessageManeuver): NitroMessageManeuver;
declare function convert(autoManeuver: RoutingManeuver): NitroRoutingManeuver;
export declare const NitroManeuverUtil: {
    convert: typeof convert;
};
export {};
