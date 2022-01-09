import {Backend} from "./Backend";
import {McModel} from "../ModelInterface";
import Model = McModel.Model;

export class ServerBackend implements Backend {

    private static url = "http://localhost/api/"

    getModel(modelName: String): Promise<Model> {
        return fetch(ServerBackend.url + `model/${modelName}`).then(response => {
            if (response.ok)
                return response.json();
            else
                throw new Error("Invalid Model");
        }).catch(error => {
            console.log(error)
            return Promise.reject();
        }).then(this.setDefaultValue) as Promise<Model>
    }

    getTexture(textureName: String): Promise<string> {
        return fetch(ServerBackend.url + `texture/block/${textureName}`).then(response => {
            if (response.ok)
                return response.text();
            else
                throw new Error("Invalid Texture");
        }).catch(error => {
            console.log(error)
            return Promise.reject();
        }) as Promise<string>
    }

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
