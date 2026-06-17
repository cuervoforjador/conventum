import { SYSTEM_ID } from "../config/uiConstants.js"
import helperContext from "../helper/helperContext.js"

export default class hooksItem {

    /**
     * createItem
     * @param {*} item 
     * @param {*} options 
     * @param {*} id 
     */
    static createItem(item, options, id) {

        const activeGM = game.users.activeGM        
        if (!game.user.isGM || (activeGM && activeGM.id !== game.user.id)) return

        //Recibiendo Secuelas
        if (item.type === 'secuela' && options.parent && options.parent.type === 'character') helperContext.activeSecuela(item)

    }

}