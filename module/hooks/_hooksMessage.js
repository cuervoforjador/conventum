import { mainUtils } from "../mainUtils.js";
import { mainBackend } from "../sheets/backend/mainBackend.js";

export class HookMessage {

    static async changeColorButton(htmlElement, sWorld) {

        const oWorld = await game.packs.get('conventum.worlds').get(sWorld);
        for (const s in oWorld.system.config.rolllevel) {
            let oConfig = oWorld.system.config.rolllevel[s];
            $(htmlElement).find('button.'+s).css({
                background: oConfig.color
            });
        }
    }


}