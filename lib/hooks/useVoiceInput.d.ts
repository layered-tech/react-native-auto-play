import type { Location } from '..';
export declare const useVoiceInput: () => {
    voiceInputResult: {
        coordinates: Location | undefined;
        query: string | undefined;
        requestType: string;
    } | undefined;
    resetVoiceInputResult: () => void;
};
