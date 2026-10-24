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
        const userOwner = game.users.find(user => user.active && !user.isGM 
                                               && options.parent.testUserPermission(user, "OWNER"))
        
        if (userOwner && userOwner.id !== game.user.id) return
        if (!userOwner && (!game.user.isGM || (activeGM && activeGM.id !== game.user.id))) return       

        if (item.type === 'secuela' && options.parent && options.parent.type === 'character') helperContext.activeSecuela(item)
        if (item.type === 'profesion' && options.parent && options.parent.type === 'character') helperContext.activeProfesion(item)

    }

}