import {McModel} from "../models/ModelInterface";
import Model = McModel.Model;
import {McMetaModule} from "../models/McMetaInterface";
import McMeta = McMetaModule.McMeta;

/**
 * An interface to define the backend of this front, where do request to get resources
 */
export interface Backend {

    /**
     * Request <i>modelName</i> model to the backend
     * @param modelName the name of the model to request
     * @return a promise for the model
     * @throws an error if the model is invalid
     */
    getModel(modelName: string): Promise<Model>

    /**
     * Request <i>textureName</i> texture to the backend
     * @param textureName the name of the texture to request
     * @return a promise for the texture
     * @throws an error if the texture is invalid
     */
    getTexture(textureName: string): string

    /**
     * Request the list of all models
     * @return the list of all models
     * @throws an error if the query is invalid
     */
    getAllModel(): Promise<Array<string>>

    /**
     * Request the <i>textureName</i> mcmeta file to the backend
     * @param textureName the name of the texture to request the mcmeta file
     * @return a promise for the mcmeta file or undefined if the texture hasn't ab associated mcmeta file
     */
    getMcMetaFromTexture(textureName: string): Promise<McMeta>

}
