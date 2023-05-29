import { mainUtils } from "../mainUtils.js";
import { mainBackend } from "../sheets/backend/mainBackend.js";

export class HookMessage {

    /**
     * changeColorButton
     * @param {*} htmlElement 
     * @param {*} sWorld 
     */
    static async changeColorButton(htmlElement, sWorld) {

        const oWorld = await game.packs.get('conventum.worlds').get(sWorld);
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

}