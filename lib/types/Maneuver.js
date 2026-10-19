export var ManeuverType;
(function (ManeuverType) {
    ManeuverType[ManeuverType["Depart"] = 0] = "Depart";
    ManeuverType[ManeuverType["Arrive"] = 10] = "Arrive";
    ManeuverType[ManeuverType["ArriveLeft"] = 11] = "ArriveLeft";
    ManeuverType[ManeuverType["ArriveRight"] = 12] = "ArriveRight";
    ManeuverType[ManeuverType["Straight"] = 20] = "Straight";
    ManeuverType[ManeuverType["Turn"] = 30] = "Turn";
    ManeuverType[ManeuverType["Roundabout"] = 40] = "Roundabout";
    ManeuverType[ManeuverType["OffRamp"] = 50] = "OffRamp";
    ManeuverType[ManeuverType["OnRamp"] = 60] = "OnRamp";
    ManeuverType[ManeuverType["Fork"] = 70] = "Fork";
    ManeuverType[ManeuverType["EnterFerry"] = 80] = "EnterFerry";
    ManeuverType[ManeuverType["Keep"] = 90] = "Keep";
})(ManeuverType || (ManeuverType = {}));
export var TrafficSide;
(function (TrafficSide) {
    TrafficSide[TrafficSide["Right"] = 0] = "Right";
    TrafficSide[TrafficSide["Left"] = 1] = "Left";
})(TrafficSide || (TrafficSide = {}));
export var TurnType;
(function (TurnType) {
    TurnType[TurnType["NoTurn"] = 0] = "NoTurn";
    TurnType[TurnType["SlightLeft"] = 1] = "SlightLeft";
    TurnType[TurnType["SlightRight"] = 2] = "SlightRight";
    TurnType[TurnType["NormalLeft"] = 3] = "NormalLeft";
    TurnType[TurnType["NormalRight"] = 4] = "NormalRight";
    TurnType[TurnType["SharpLeft"] = 5] = "SharpLeft";
    TurnType[TurnType["SharpRight"] = 6] = "SharpRight";
    TurnType[TurnType["UTurnLeft"] = 7] = "UTurnLeft";
    TurnType[TurnType["UTurnRight"] = 8] = "UTurnRight";
})(TurnType || (TurnType = {}));
export var OffRampType;
(function (OffRampType) {
    OffRampType[OffRampType["SlightLeft"] = 0] = "SlightLeft";
    OffRampType[OffRampType["SlightRight"] = 1] = "SlightRight";
    OffRampType[OffRampType["NormalLeft"] = 2] = "NormalLeft";
    OffRampType[OffRampType["NormalRight"] = 3] = "NormalRight";
})(OffRampType || (OffRampType = {}));
export var OnRampType;
(function (OnRampType) {
    OnRampType[OnRampType["SlightLeft"] = 0] = "SlightLeft";
    OnRampType[OnRampType["SlightRight"] = 1] = "SlightRight";
    OnRampType[OnRampType["NormalLeft"] = 2] = "NormalLeft";
    OnRampType[OnRampType["NormalRight"] = 3] = "NormalRight";
    OnRampType[OnRampType["SharpLeft"] = 4] = "SharpLeft";
    OnRampType[OnRampType["SharpRight"] = 5] = "SharpRight";
    OnRampType[OnRampType["UTurnLeft"] = 6] = "UTurnLeft";
    OnRampType[OnRampType["UTurnRight"] = 7] = "UTurnRight";
})(OnRampType || (OnRampType = {}));
export var ForkType;
(function (ForkType) {
    ForkType[ForkType["Left"] = 0] = "Left";
    ForkType[ForkType["Right"] = 1] = "Right";
})(ForkType || (ForkType = {}));
export var KeepType;
(function (KeepType) {
    KeepType[KeepType["Left"] = 0] = "Left";
    KeepType[KeepType["Right"] = 1] = "Right";
    KeepType[KeepType["FollowRoad"] = 2] = "FollowRoad";
})(KeepType || (KeepType = {}));
/**
 * Describes the progress within a maneuver.
 * Transition through: Continue → Initial → Prepare → Execute → Continue
 * @namespace iOS sets CPManeuverState on the CPNavigationSession
 * @namespace Android no-op, Android Auto does not have an equivalent API
 */
export var ManeuverState;
(function (ManeuverState) {
    ManeuverState[ManeuverState["Continue"] = 0] = "Continue";
    ManeuverState[ManeuverState["Initial"] = 1] = "Initial";
    ManeuverState[ManeuverState["Prepare"] = 2] = "Prepare";
    ManeuverState[ManeuverState["Execute"] = 3] = "Execute";
})(ManeuverState || (ManeuverState = {}));
