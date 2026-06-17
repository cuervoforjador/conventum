import { SYSTEM_ID } from "../config/uiConstants.js"
import helperSettings from "./helperSettings.js"
export default class helperTools {

    /**
     * getActor
     * @param {*} actorId 
     * @param {*} tokenId 
     * @param {*} actorUuid 
     * @returns 
     */
    static getActor(actorId, tokenId) {
        if (tokenId && tokenId !== '' && tokenId !== 'undefined') {
            const scene = game.scenes.active
            if (!scene) return null
            return scene.tokens.get(tokenId).actor            
        } else {
            if (!actorId || actorId === '') return
            return game.actors.get(actorId)
        }
        return null
    }

    /**
     * numberArray
     * @param {*} max 
     */
    static numberArray(max) {
        return Array(max).fill().map((x,i)=>i)        
    }

    /**
     * getTokenId
     * @param {*} actor 
     * @returns 
     */
    static getTokenId(actor) {
        return actor.isToken ? actor.token.id : ''   
    }

    /**
     * isEditable
     */
    static isEditable() {
        return ( helperTools.isGM() || helperSettings.getUserEdit() )
    }

    /**
     * isGM
     */
    static isGM() {
        const activeGM = game.users.activeGM
        return ( game.user.isGM || (activeGM && activeGM.id === game.user.id) )
    }
}