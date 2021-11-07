import {Backend} from "./Backend";
import {McModel} from "../ModelInterface";
import Model = McModel.Model;

export class ServerBackend implements Backend {

    private static url = "http://localhost:8080/"

    getModel(modelName: String): Promise<Model> {
        return fetch(ServerBackend.url + `model/${modelName}`).then(response => {
            if (response.ok)
                return response.json();
            else
                throw new Error("Invalid Model");
        }).catch(error => {
            console.log(error)
            return Promise.reject();
        }) as Promise<Model>
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
}
