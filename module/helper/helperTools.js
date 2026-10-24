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
     * centerBox
     * @param {*} left 
     * @param {*} top 
     * @param {*} width 
     * @param {*} height 
     * @returns 
     */
    static centerBox(left, top, element) {
        const _center = {left: left - element.width()/2, 
                         top: top - element.height()/2}
        
        const nWidth = jQuery('body').width()
        const nHeight = jQuery('body').height()
    
        _center.left = _center.left < 5 ? 5 :
                       _center.left + element.width() > nWidth ? nWidth - element.width() : 
                       _center.left

        _center.top = _center.top < 5 ? 5 :
                      _center.top + element.height() > nHeight ? nHeight - element.height() : 
                      _center.top
        
        element.css({
            "top": _center.top,
            "left": _center.left
        })
    }

    /**
     * removeAccents
     * @param {*} sText 
     */
    static removeAccents(sText) {
        return sText.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
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

    static addMod(mod1, mod2) {
        try {
            let nMod = eval(mod1 + mod2)
            if (nMod >= 0 ) return ('+' + nMod).toString()
                       else return nMod.toString()
        } catch(error) {
            return '+0'
        }
    }
}