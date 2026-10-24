import { configRULES } from "../config/rules.js"
import { SYSTEM_ID } from "../config/uiConstants.js"
import helperSettings from "../helper/helperSettings.js"
import hooksFolders from "./folders.js"

export default class hooksScenes {

    static preCreateScene(scene, data, options, userId) {
        const rules = helperSettings.rules()        
        scene.updateSource({
            "grid.distance": 5,
            "grid.units": configRULES[rules].unitDistancia
        })
    }

}