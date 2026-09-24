import { AntigravityRequestType, AntigravityUserAgent, GeminiRole } from "../types/enums.js";
export declare const DEFAULT_IMAGE_MODEL = "gemini-3-pro-image";
export declare const IMAGE_ASPECT_RATIOS: readonly ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"];
export type ImageAspectRatio = (typeof IMAGE_ASPECT_RATIOS)[number];
export type GeneratedImage = {
    data: string;
    mimeType: string;
};
export type ImageGenerateRequest = {
    project: string;
    model: string;
    request: {
        contents: Array<{
            role: GeminiRole.User;
            parts: Array<{
                text: string;
            }>;
        }>;
        systemInstruction: {
            role: GeminiRole.User;
            parts: Array<{
                text: string;
            }>;
        };
        generationConfig: {
            imageConfig: {
                aspectRatio: string;
            };
            candidateCount: number;
        };
    };
    requestType: AntigravityRequestType.Agent;
    userAgent: AntigravityUserAgent.Antigravity;
    requestId: string;
};
export type ImageCommandArgs = {
    prompt: string;
    aspectRatio?: string;
    model?: string;
    path?: string;
};
export type GenerateImageOptions = ImageCommandArgs & {
    apiKey: string;
    cwd: string;
    signal?: AbortSignal;
};
export type GenerateImageResult = {
    images: GeneratedImage[];
    savedPaths: string[];
    text: string[];
    model: string;
};
export declare function assertSafeImageModel(modelId: string): string;
export declare function assertSafeAspectRatio(ratio: string): ImageAspectRatio;
export declare function parseImageCommandArgs(args: string): ImageCommandArgs;
export declare function resolveImageSavePath(cwd: string, requested?: string, mimeType?: string, index?: number): string;
export declare function buildImageGenerateRequest(prompt: string, model: string, projectId: string, aspectRatio: string): ImageGenerateRequest;
export declare function collectImagesFromSse(response: Response, signal?: AbortSignal): Promise<{
    images: GeneratedImage[];
    text: string[];
}>;
export declare function generateAntigravityImage(options: GenerateImageOptions): Promise<GenerateImageResult>;
