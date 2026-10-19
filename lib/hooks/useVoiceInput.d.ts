import type { Location } from '..';
export declare const useVoiceInput: () => {
    voiceInputResult: {
        coordinates: Location | undefined;
        query: string | undefined;
    } | undefined;
    resetVoiceInputResult: () => void;
};
