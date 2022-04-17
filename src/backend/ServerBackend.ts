import {Backend} from "./Backend";
import {McModel} from "../models/ModelInterface";
import {Page} from "../models/ModelListInterface"
import Model = McModel.Model;
import {properties} from "../resources/Properties";
import {McMetaModule} from "../models/McMetaInterface";
import McMeta = McMetaModule.McMeta;

/**
 * Class for get resources from API REST Server
 */
export class ServerBackend implements Backend {

    private modelArray: Array<string>

    /**
     * Request <i>modelName</i> model to the backend
     * @param modelName the name of the model to request
     * @return a promise for the model
     * @throws an error if the model is invalid
     */
    getModel(modelName: string): Promise<Model> {
        return fetch(properties.backend.url_model + modelName, {mode: 'cors'}).then(response => {
            if (response.ok)
                return response.json();
            else {
                console.error("Invalid Model");
                return Promise.reject("Invalid Model")
            }
        }).catch(error => {
            console.log(error)
            return Promise.reject(error);
        }).then(this.setDefaultValue) as Promise<Model>
    }

    /**
     * Request <i>textureName</i> texture to the backend
     * @param textureName the name of the texture to request
     * @return a promise for the texture
     * @throws an error if the texture is invalid
     */
    getTexture(textureName: string): string {
        return properties.backend.url_texture + textureName
    }

    /**
     * Set optional keys (i.e. <code>.elements.faces.uv</code> and <code>.elements.faces.rotation</code>)
     * of the model to their default value
     * @param model the model to process
     * @return the model processed
     */
    private setDefaultValue(model: Model): Model {
        if (model.elements !== undefined)
            for (const value of model.elements.flatMap(element => Object.values(element.faces))) {
                if (value.rotation === undefined)
                    value.rotation = 0
            }
        return model
    }

    /**
     * Request the list of all models
     * @return the list of all models
     * @throws an error if the query is invalid
     */
    getAllModel(): Promise<Array<string>> {
        if (this.modelArray != null)
            return new Promise(() => this.modelArray)

        return (fetch(properties.backend.url_model_list + "?size=9999").then(response => {
            if (response.ok)
                return response.json();
            else {
                console.error("Invalid URL")
                return Promise.reject("Invalid URL");
            }
        }).catch(_ => Promise.reject()) as Promise<Page>)
            .then(page => page.elements.map(element => element.id))
            .then(array => this.modelArray = array.sort())
    }

    /**
     * Request the <i>textureName</i> mcmeta file to the backend
     * @param textureName the name of the texture to request the mcmeta file
     * @return a promise for the mcmeta file or undefined if the texture hasn't ab associated mcmeta file
     */
    getMcMetaFromTexture(textureName: string): Promise<McMeta | undefined> {
        return fetch(properties.backend.url_mcmeta + textureName, {mode: 'cors'})
            .then(async response => {
                if (response.ok)
                    return response.json()
            }).catch(_ => new Promise(undefined)) as Promise<McMeta>
    }
}
