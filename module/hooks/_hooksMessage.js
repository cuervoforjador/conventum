import { mainUtils } from "../mainUtils.js";
import { mainBackend } from "../sheets/backend/mainBackend.js";
import { helperMessages } from "../helpers/helperMessages.js"

export class HookMessage {

    /**
     * changeColorButton
     * @param {*} htmlElement 
     * @param {*} sWorld 
     */
    static async changeColorButton(htmlElement, sWorld) {

        const oWorld = await game.packs.get('conventum.worlds').getDocument(sWorld);
        if (!oWorld) return;
        
        for (const s in oWorld.system.config.rolllevel) {
            let oConfig = oWorld.system.config.rolllevel[s];
            $(htmlElement).find('button.'+s).css({
                background: oConfig.color
            });
        }
    }

    /**
     * translateTypes
     * @param {*} htmlElement 
     */
    static translateTypes(htmlElement) {
        $(htmlElement).find('form#document-create select[name="type"] option')
                      .each(function(i,e) {
                            $(e).text(game.i18n.localize('template.'+$(e).val()))
                      }.bind(this));
    }

    /**
     * createChatMessage
     * @param {*} message 
     * @param {*} options 
     * @param {*} sId 
     */
    static createChatMessage(message, options, sId) {
        if ( $(message.content).find("._chatPaper").length > 0 ) {
            //... Own message
        } else {
            const actor = game.actors.get(message.speaker.actor);
            const sContent = '<div class="_bigContent">'+message.content+'</div>';

            if (!actor) return;
            if ((actor.ownership.default === 3) ||
                (actor.ownership[game.user.id] === 3)) {
                //(game.user.isGM)) {

                message.update({
                    content: helperMessages.extendContent(actor, sContent, '154px', '')
                });

            } else {
                return;
            }            
        }
    }

}