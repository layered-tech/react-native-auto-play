import { TextPlaceholders } from '../types/Text';
import { NitroImageUtil } from './NitroImage';
const validateRadioItems = (type, items) => {
    if (__DEV__ &&
        type === 'radio' &&
        (items.filter((item) => item.selected).length > 1 || items.every((item) => !item.selected))) {
        throw new Error('radio lists must have one selected item');
    }
};
const convert = (template, sections) => {
    if (sections == null) {
        return undefined;
    }
    if (Array.isArray(sections)) {
        return sections.map((section) => {
            const { title, type } = section;
            const items = section.items.map((item) => convertRow(template, item));
            validateRadioItems(type, items);
            return {
                items,
                type,
                title,
            };
        });
    }
    const items = sections.items.map((item) => convertRow(template, item));
    validateRadioItems(sections.type, items);
    return [
        {
            items,
            type: sections.type,
        },
    ];
};
/**
 * `AutoText.distance`/`.duration` only take effect if `text` actually uses the matching
 * `TextPlaceholders` marker — populate whichever of those the text references, leaving the rest
 * of `text` untouched, so a title/address that doesn't opt in via a placeholder is unaffected.
 */
const withTravelEstimates = (text, distance, durationSeconds) => {
    const hasDistance = text.text.includes(TextPlaceholders.Distance);
    const hasDuration = text.text.includes(TextPlaceholders.Duration);
    if (!hasDistance && !hasDuration) {
        return text;
    }
    return {
        ...text,
        distance: hasDistance ? distance : text.distance,
        duration: hasDuration ? durationSeconds : text.duration,
    };
};
const convertRow = (template, item) => {
    const { type, enabled = true, image, imageType } = item;
    // `WaypointRow` has no `detailedText` of its own — `address` doubles as the detail line
    // whenever this falls back to a plain row (non-panel context, Android).
    let title = item.title;
    let detailedText = item.type === 'waypoint'
        ? item.address != null
            ? { text: item.address }
            : undefined
        : 'detailedText' in item
            ? item.detailedText
            : undefined;
    // Opt-in only: a title/address using `{distance}`/`{duration}` gets those values filled in,
    // via the same substitution `AutoText` already does everywhere else — no separate "estimate"
    // UI element needed for a row embedded in a list alongside other rows. Deliberately NOT gated
    // on `travelEstimates.visible` — that flag only controls the panel-only sibling
    // `CPTravelEstimates` item (see `Parser.swift`'s `travelEstimatesVisible` check), which has no
    // bearing on the non-panel/Android fallback text this feeds; a placeholder in the text is
    // already its own explicit opt-in regardless of `visible`.
    if (item.type === 'waypoint') {
        const { distance, duration } = item.travelEstimates;
        title = withTravelEstimates(title, distance, duration.seconds);
        if (detailedText != null) {
            detailedText = withTravelEstimates(detailedText, distance, duration.seconds);
        }
    }
    const selected = type === 'radio' ? (item.selected ?? false) : undefined;
    const onTogglePress = item.type === 'toggle' ? item.onPress : undefined;
    const onRowPress = item.type !== 'text' && item.type !== 'toggle' ? item.onPress : undefined;
    const onPress = item.type === 'text'
        ? undefined
        : (checked) => {
            if (onTogglePress != null && checked != null) {
                onTogglePress(template, checked);
                return;
            }
            if (onRowPress != null) {
                onRowPress(template);
            }
        };
    return {
        browsable: type === 'default' ? item.browsable : undefined,
        detailedText,
        enabled,
        image: NitroImageUtil.convert(image),
        imageType,
        title,
        checked: type === 'toggle' ? item.checked : undefined,
        onPress,
        selected,
        coordinate: item.type === 'waypoint' ? item.coordinate : undefined,
        distance: item.type === 'waypoint' ? item.travelEstimates.distance : undefined,
        duration: item.type === 'waypoint' ? item.travelEstimates.duration : undefined,
        travelEstimatesVisible: item.type === 'waypoint' ? item.travelEstimates.visible : undefined,
        address: item.type === 'waypoint' ? item.address : undefined,
    };
};
export const NitroSectionUtil = { convert };
