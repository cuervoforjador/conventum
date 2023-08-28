/**
 * Helpers for Sprites
 */

import { mainUtils } from "../mainUtils.js";

export class helperCusto {

    /**
     * custoCSS
     */
    static async custoCSS() {
        const myActor = Array.from(game.actors).find(e => {
                            return ( (e.ownership[game.userId]) &&
                                     (e.ownership[game.userId] === 3) )
                        });
        if (!myActor) return;
        const mWorlds = await game.packs.get('conventum.worlds').getDocuments();
        const myWorld = mWorlds.find(e => e.id === myActor.system.control.world);
        if (!myWorld) return;

        document.documentElement.style.setProperty('--font-aq', myWorld.system.config.custo.fontFamily);
        document.documentElement.style.setProperty('--font2-aq', myWorld.system.config.custo.fontFamily2);
        document.documentElement.style.setProperty('--font3-aq', myWorld.system.config.custo.fontFamily3);
        document.documentElement.style.setProperty('--paper-aq', myWorld.system.config.custo.paper);
        document.documentElement.style.setProperty('--tile1-aq', myWorld.system.config.custo.tile1);
        document.documentElement.style.setProperty('--tile2-aq', myWorld.system.config.custo.tile2);
    }

}