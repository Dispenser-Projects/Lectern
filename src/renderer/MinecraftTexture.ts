import {McMetaModule} from "../models/McMetaInterface";
import McMeta = McMetaModule.McMeta;

export interface McTexture {
    texture: HTMLImageElement,
    mcmeta?: McMeta
}