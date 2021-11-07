import {McModel} from "../ModelInterface";
import Model = McModel.Model;

export interface Backend {

    getModel(modelName: String): Promise<Model>

    getTexture(textureName: String): Promise<string>

}
