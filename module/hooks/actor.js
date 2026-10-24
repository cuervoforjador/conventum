import { configRULES } from "../config/rules.js"
import { SYSTEM_ID, ACTOR_IMG, ACTOR_IMGvyc } from "../config/uiConstants.js"
import helperDialog from "../helper/helperDialog.js"
import helperSettings from "../helper/helperSettings.js"

export default class hooksActor {

    /**
     * preCreateActor
     * @param {*} actor 
     * @param {*} entity 
     * @param {*} options 
     * @param {*} id 
     */
    static preCreateActor(actor, data, options, userId) {
        if (game.user.id !== userId) return
        const rules = helperSettings.rules()

        actor.updateSource({
            "system.rules": rules
        })                
    }

    /**
     * createActor
     * @param {*} actor 
     * @param {*} options 
     * @param {*} id 
     */
    static async createActor(actor, options, id) {
        
        await actor.prototypeToken.update({"actorLink": true})
        
        const rules = helperSettings.rules()
        const oConfirm = await helperDialog.dialogConfirm(rules, actor.name, game.i18n.localize("info.confirmActorWizard"))
        await actor.update({
            "system.control.wizard.show": !!oConfirm
        })    
        await actor.sheet.render(true)    
    }


}