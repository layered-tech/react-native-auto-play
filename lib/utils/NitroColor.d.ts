export type NitroColor = {
    lightColor: number;
    darkColor: number;
    isDefault?: boolean;
};
export type ThemedColor = {
    lightColor: string;
    darkColor: string;
};
declare function convert(color: ThemedColor | string): NitroColor;
declare function convert(color?: ThemedColor | string): NitroColor | undefined;
export declare const NitroColorUtil: {
    convert: typeof convert;
};
export {};
