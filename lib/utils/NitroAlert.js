import { NitroImageUtil } from './NitroImage';
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
        image: NitroImageUtil.convert(image),
        priority: AlertPriorityEnum[priority],
    };
};
export const NitroAlertUtil = { convert };
