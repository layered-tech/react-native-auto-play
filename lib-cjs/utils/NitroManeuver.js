"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NitroManeuverUtil = void 0;
const Maneuver_1 = require("../types/Maneuver");
const NitroColor_1 = require("./NitroColor");
const NitroImage_1 = require("./NitroImage");
function convertManeuverImage(image) {
    if (image == null) {
        return undefined;
    }
    if (image.type === 'glyph') {
        const color = typeof image.color === 'string' ? image.color : (image.color ?? 'default');
        return NitroImage_1.NitroImageUtil.convert({
            ...image,
            color: color,
        });
    }
    return NitroImage_1.NitroImageUtil.convert(image);
}
function convert(autoManeuver) {
    if (autoManeuver.type === 'message') {
        const { title, image, text } = autoManeuver;
        return {
            title,
            text,
            image: convertManeuverImage(image),
            cardBackgroundColor: NitroColor_1.NitroColorUtil.convert(autoManeuver.cardBackgroundColor),
        };
    }
    const { symbolImage, junctionImage, attributedInstructionVariants, id, maneuverType, trafficSide, travelEstimates, highwayExitLabel, linkedLaneGuidance, roadName, cardBackgroundColor, } = autoManeuver;
    const elementAngles = maneuverType === Maneuver_1.ManeuverType.Turn || maneuverType === Maneuver_1.ManeuverType.Roundabout
        ? autoManeuver.elementAngles
        : undefined;
    const angle = maneuverType === Maneuver_1.ManeuverType.Turn || maneuverType === Maneuver_1.ManeuverType.Roundabout
        ? autoManeuver.angle
        : undefined;
    const turnType = maneuverType === Maneuver_1.ManeuverType.Turn ? autoManeuver.turnType : undefined;
    const exitNumber = maneuverType === Maneuver_1.ManeuverType.Roundabout ? autoManeuver.exitNumber : undefined;
    const offRampType = maneuverType === Maneuver_1.ManeuverType.OffRamp ? autoManeuver.offRampType : undefined;
    const onRampType = maneuverType === Maneuver_1.ManeuverType.OnRamp ? autoManeuver.onRampType : undefined;
    const forkType = maneuverType === Maneuver_1.ManeuverType.Fork ? autoManeuver.forkType : undefined;
    const keepType = maneuverType === Maneuver_1.ManeuverType.Keep ? autoManeuver.keepType : undefined;
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
        cardBackgroundColor: NitroColor_1.NitroColorUtil.convert(cardBackgroundColor),
    };
}
exports.NitroManeuverUtil = { convert };
