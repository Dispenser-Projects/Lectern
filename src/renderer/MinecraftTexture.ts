import {McMetaModule} from "../models/McMetaInterface";
import McMeta = McMetaModule.McMeta;

/**
 * Minecraft Texture Information
 */
export interface McTexture {
    /** The texture image */
    texture: HTMLImageElement,
    /** The texture animation if exists */
    mcmeta?: McMeta
}
