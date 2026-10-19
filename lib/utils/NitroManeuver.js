import { ManeuverType, } from '../types/Maneuver';
import { NitroColorUtil } from './NitroColor';
import { NitroImageUtil } from './NitroImage';
function convertManeuverImage(image) {
    if (image == null) {
        return undefined;
    }
    if (image.type === 'glyph') {
        const color = typeof image.color === 'string' ? image.color : (image.color ?? 'default');
        return NitroImageUtil.convert({
            ...image,
            color: color,
        });
    }
    return NitroImageUtil.convert(image);
}
function convert(autoManeuver) {
    if (autoManeuver.type === 'message') {
        const { title, image, text } = autoManeuver;
        return {
            title,
            text,
            image: convertManeuverImage(image),
            cardBackgroundColor: NitroColorUtil.convert(autoManeuver.cardBackgroundColor),
        };
    }
    const { symbolImage, junctionImage, attributedInstructionVariants, id, maneuverType, trafficSide, travelEstimates, highwayExitLabel, linkedLaneGuidance, roadName, cardBackgroundColor, } = autoManeuver;
    const elementAngles = maneuverType === ManeuverType.Turn || maneuverType === ManeuverType.Roundabout
        ? autoManeuver.elementAngles
        : undefined;
    const angle = maneuverType === ManeuverType.Turn || maneuverType === ManeuverType.Roundabout
        ? autoManeuver.angle
        : undefined;
    const turnType = maneuverType === ManeuverType.Turn ? autoManeuver.turnType : undefined;
    const exitNumber = maneuverType === ManeuverType.Roundabout ? autoManeuver.exitNumber : undefined;
    const offRampType = maneuverType === ManeuverType.OffRamp ? autoManeuver.offRampType : undefined;
    const onRampType = maneuverType === ManeuverType.OnRamp ? autoManeuver.onRampType : undefined;
    const forkType = maneuverType === ManeuverType.Fork ? autoManeuver.forkType : undefined;
    const keepType = maneuverType === ManeuverType.Keep ? autoManeuver.keepType : undefined;
    return {
        id,
        maneuverType,
        trafficSide,
        travelEstimates,
        linkedLaneGuidance: linkedLaneGuidance
            ? {
                ...linkedLaneGuidance,
                lanes: linkedLaneGuidance.lanes.map((lane) => ({
                    ...lane,
                    image: convertManeuverImage(lane.image),
                })),
            }
            : undefined,
        highwayExitLabel,
        roadName,
        attributedInstructionVariants: attributedInstructionVariants.map((variant) => ({
            text: variant.text,
            images: variant.images?.map(({ image, position }) => ({
                image: convertManeuverImage(image),
                position,
            })),
        })),
        junctionImage: convertManeuverImage(junctionImage),
        symbolImage: convertManeuverImage(symbolImage),
        elementAngles,
        angle,
        turnType,
        exitNumber,
        offRampType,
        onRampType,
        forkType,
        keepType,
        cardBackgroundColor: NitroColorUtil.convert(cardBackgroundColor),
    };
}
export const NitroManeuverUtil = { convert };
