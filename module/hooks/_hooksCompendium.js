/**
 * COMPENDIUM
 */
export class HookCompendium {

    /**
     * Styling Compendium List element 
     * @param {object} tab
     */    
    static _stylingLiCompendium(tab) {
        
        tab._element.find('li').each(function(i,e) {
            $(e).addClass('_custoLiCompendium');
        });
    }

    /**
     * Styling Compendium Window 
     * @param {object} compendium
     */    
    static _stylingCompendium(compendium) {
        
        compendium._element.find('.header-banner').addClass('_custoHeaderCompendium');
    }

}