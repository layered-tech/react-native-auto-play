import type { AutoImage } from '../types/Image';
import { type NitroColor } from './NitroColor';
/**
 * Register the icon font and (optionally) a glyph map for name-based lookups.
 * Must be called **once** before creating any templates. Subsequent calls are ignored.
 *
 * The font name maps directly to a native font asset:
 * - **Android** — `res/font/<name>.ttf` (must be lowercase)
 * - **iOS** — `<name>.ttf` in the app bundle (registered via CoreText automatically)
 *
 * For cross-platform compatibility use lowercase with underscores only.
 *
 * @param name  Native font asset name (without extension).
 * @param glyphMap  Optional map of glyph names to Unicode code points.
 *                  When provided, glyphs can use `{ type: 'glyph', name: 'icon_name' }`.
 *
 * @example
 * ```ts
 * import { glyphMap } from './assets/Glyphmap';
 * setIconFont('material_symbols', glyphMap);
 * ```
 */
export declare function setIconFont(name: string, glyphMap?: Record<string, number>): void;
interface AssetImage {
    uri: string;
    width: number;
    height: number;
    scale: number;
    color?: NitroColor;
    packager_asset: boolean;
}
interface GlyphImage {
    glyph: number;
    fontName: string;
    color: NitroColor;
    backgroundColor: NitroColor;
    fontScale?: number;
}
/**
 * the placeholder glyph or asset is flattened into placeholder* fields, a nested struct overflows
 * nitrogen's call stack for the specs that use NitroImage deep inside their config.
 * `placeholderColor` is the glyph color or the asset tint.
 */
interface RemoteImage {
    uri: string;
    color?: NitroColor;
    timeoutMs?: number;
    placeholderGlyph?: number;
    placeholderFontName?: string;
    placeholderColor?: NitroColor;
    placeholderBackgroundColor?: NitroColor;
    placeholderFontScale?: number;
    placeholderUri?: string;
    placeholderWidth?: number;
    placeholderHeight?: number;
    placeholderScale?: number;
    placeholderPackagerAsset?: boolean;
}
/**
 * NitroModules-compatible image types passed to native.
 */
export type NitroImage = GlyphImage | AssetImage | RemoteImage;
declare function convert(image: AutoImage): NitroImage;
declare function convert(image?: AutoImage): NitroImage | undefined;
export declare const NitroImageUtil: {
    convert: typeof convert;
};
export {};
