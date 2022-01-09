import {Backend} from "./Backend";
import {McModel} from "../ModelInterface";
import Model = McModel.Model;
import {properties} from "../resources/Properties";

/**
 * Class for get resources from API REST Server
 */
export class ServerBackend implements Backend {

    /**
     * Request <i>modelName</i> model to the backend
     * @param modelName the name of the model to request
     * @return a promise for the model
     * @throws an error if the model is invalid
     */
    getModel(modelName: string): Promise<Model> {
        return fetch(properties.backend_url + `model/${modelName}`).then(response => {
            if (response.ok)
                return response.json();
            else
                throw new Error("Invalid Model");
        }).catch(error => {
            console.log(error)
            return Promise.reject();
        }).then(this.setDefaultValue) as Promise<Model>
    }

    /**
     * Request <i>textureName</i> texture to the backend
     * @param textureName the name of the texture to request
     * @return a promise for the texture
     * @throws an error if the texture is invalid
     */
    getTexture(textureName: string): Promise<string> {
        return fetch(properties.backend_url + `texture/block/${textureName}`).then(response => {
            if (response.ok)
                return response.text();
            else
                throw new Error("Invalid Texture");
        }).catch(error => {
            console.log(error)
            return Promise.reject();
        }) as Promise<string>
    }

    /**
     * Set optional keys (i.e. <code>.elements.faces.uv</code> and <code>.elements.faces.rotation</code>)
     * of the model to their default value
     * @param model the model to process
     * @return the model processed
     */
    private setDefaultValue(model: Model): Model {
        if(model.elements !== undefined)
            for(const value of model.elements.flatMap(element => Object.values(element.faces))) {
                if(value.uv === undefined)
                    value.uv = [0, 0, 16, 16]
                if(value.rotation === undefined)
                    value.rotation = 0
            }
        return model
    }
}
