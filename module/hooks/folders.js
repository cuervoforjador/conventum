import { SYSTEM_ID } from "../config/uiConstants.js"

export default class hooksFolders {

    /**
     * activateCompendiumDirectory
     * @param {*} CompendiumDirectory 
     */
    static activateCompendiumDirectory(CompendiumDirectory) {
        const directory = $(CompendiumDirectory.parts.directory)
        directory.find('.directory-item.entry').each((i,e) => {
            const sPack = $(e).data('pack')
            const sRules = sPack.replaceAll(SYSTEM_ID+'.', '').replace('_pack', '')
            const pack = game.packs.get(sPack)            
            if (!pack) return
            const sBackground = pack.metadata?.flags?.background
            if (!sBackground) return
            $(e).find('img.compendium-banner').attr("src", sBackground)
            $(e).addClass('_systemPack')
            $(e).addClass('_'+sRules)
        })
    }

    /**
     * renderCompendium
     * @param {*} compendium 
     * @param {*} html 
     * @param {*} properties 
     * @param {*} options 
     */
    static renderCompendium(compendium, html, properties, options) {
        const sPack = compendium.id.split('-')[1].replaceAll(SYSTEM_ID+'_', '')
        const sRules = sPack.replaceAll(SYSTEM_ID+'.', '').replace('_pack', '')
        const pack = game.packs.get(SYSTEM_ID+'.'+sPack)
        if (!pack) return  
        const sBackground = pack.metadata?.flags?.background  
        $(html).find('.header-banner img').attr("src", sBackground)   
        $(html).find('.header-banner').addClass('_systemPack')
        $(html).find('.header-banner').addClass('_'+sRules)
        $(html).addClass('_extend')
        $(html).addClass('_'+sRules)
    }
}