import { NitroActionUtil } from './NitroAction';
import { NitroGridUtil } from './NitroGrid';
import { NitroImageUtil } from './NitroImage';
import { NitroSectionUtil, } from './NitroSection';
const isRadioSection = (items) => {
    return items.length > 0 && items.every((item) => item.type === 'radio');
};
const convertSection = (template, section) => {
    if (section.type === 'grid') {
        return {
            title: section.title,
            buttons: NitroGridUtil.convert(template, section.buttons),
        };
    }
    if (section.type === 'charger') {
        const { location } = section;
        return {
            title: section.title,
            outlets: section.outlets.map((outlet) => ({
                connector: outlet.connector,
                voltage: outlet.voltage,
                powerKw: outlet.powerKw,
                onPress: outlet.onPress ? () => outlet.onPress?.(template) : undefined,
            })),
            location: location
                ? {
                    name: location.name,
                    address: location.address,
                    coordinate: location.coordinate,
                    distance: location.travelEstimates.distance,
                    duration: location.travelEstimates.duration,
                    visible: location.travelEstimates.visible,
                    image: NitroImageUtil.convert(location.image),
                    onPress: location.onPress ? () => location.onPress?.(template) : undefined,
                }
                : undefined,
        };
    }
    const { items, title = '' } = section;
    const multiSection = isRadioSection(items)
        ? { type: 'radio', title, items }
        : {
            type: 'default',
            title,
            items,
        };
    const [nitroSection] = NitroSectionUtil.convert(template, [multiSection]) ?? [];
    if (nitroSection == null) {
        throw new Error('converting sections failed');
    }
    return nitroSection;
};
const convert = (template, config) => {
    if (config == null) {
        return undefined;
    }
    return {
        title: config.title,
        sections: config.sections.map((section) => convertSection(template, section)),
        actions: NitroActionUtil.convert(template, config.actions),
    };
};
export const NitroOptionsPanelUtil = { convert };
