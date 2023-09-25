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

    /**
     * initialImages
     * @param {*} item 
     * @param {*} options 
     * @param {*} sId 
     */
    static initialImages(item, options, sId) {

        if (item.type === 'world')
            item.img = '/systems/conventum/image/content/world/aquelarre.png';       
        if (item.type === 'society')
            item.img = '/systems/conventum/image/content/society/base.png';       
        if (item.type === 'kingdom')
            item.img = '/systems/conventum/image/content/kingdom/base.png';       
        if (item.type === 'culture')
            item.img = '/systems/conventum/image/content/cultures/base.png';         
        if (item.type === 'language')
            item.img = '/systems/conventum/image/content/others/lingua.png';    
        if (item.type === 'stratum')
            item.img = '/systems/conventum/image/content/stratum/base.png';    
        if (item.type === 'status')
            item.img = '/systems/conventum/image/content/status/status.png';    
        if (item.type === 'skill')
            item.img = '/systems/conventum/image/content/skills/base.png';    
        if (item.type === 'profession')
            item.img = '/systems/conventum/image/content/profession/base.png';   
        if (item.type === 'location')
            item.img = '/systems/conventum/image/content/others/location.png';   
        if (item.type === 'mode')
            item.img = '/systems/conventum/image/content/modes/base.png';   
        if (item.type === 'armor')
            item.img = '/systems/conventum/image/content/armor/base.png';   
        if (item.type === 'weapon')
            item.img = '/systems/conventum/image/content/weapons/base.png'; 
        if (item.type === 'action')
            item.img = '/systems/conventum/image/content/action/base.png';       
        if (item.type === 'spell')
            item.img = '/systems/conventum/image/content/spells/base.png';           
        if (item.type === 'ritual')
            item.img = '/systems/conventum/image/content/spells/base.png';                    
        if (item.type === 'trait')
            item.img = '/systems/conventum/image/content/traits/trait10.png';

    }

}