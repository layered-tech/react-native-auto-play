"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NitroAlertUtil = void 0;
const NitroImage_1 = require("./NitroImage");
var AlertPriorityEnum;
(function (AlertPriorityEnum) {
    AlertPriorityEnum[AlertPriorityEnum["low"] = 0] = "low";
    AlertPriorityEnum[AlertPriorityEnum["medium"] = 1] = "medium";
    AlertPriorityEnum[AlertPriorityEnum["high"] = 2] = "high";
})(AlertPriorityEnum || (AlertPriorityEnum = {}));
const convert = (alert) => {
    const { image, priority, ...rest } = alert;
    return {
        ...rest,
        image: NitroImage_1.NitroImageUtil.convert(image),
        priority: AlertPriorityEnum[priority],
    };
};
exports.NitroAlertUtil = { convert };
