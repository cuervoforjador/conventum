/**
 * COMPENDIUM
 */
export class HookCompendium {

    /**
     * Styling Compendium List element 
     * @param {object} tab
     */    
    static _stylingLiCompendium(tab) {
        
        //Custom class
        if ( Math.floor(Number(game.version)) === 11 ) {
            // Version 11...
            tab._element.find('li').each(function(i,e) {
                $(e).addClass('_custoLiCompendium');    
            });
        } else {
            // Version 10...
            tab._element.find('li.compendium-type').each(function(i0,e0) {
                $(e0).find('li.compendium-pack').each(function(i,e) {
                    $(e).addClass('_custoLiCompendium');
                    $(e).addClass('_v10');
                    $(e).css({'background-image': 'url(/systems/conventum/image/content/compendium/banner'+
                                                                                $(e).find('h4 a').text().trim()+'.png)'});
                    
                });
            });
        }
    }

    /**
     * Styling Compendium Window 
     * @param {object} compendium
     */    
    static _stylingCompendium(compendium) {        
        
        // Version 11...
        if ( Math.floor(Number(game.version)) === 11 ) {
            compendium._element.find('.header-banner').addClass('_custoHeaderCompendium');
        } else {
            compendium._element.find('section.window-content').addClass('_v10');
            compendium._element.find('.directory-header').addClass('_custoHeaderCompendium');
            compendium._element.find('.directory-header').addClass('_v10');
            compendium._element.find('.directory-header').prepend(
                '<div class="header-banner" style="background-image: '+
                    'url(/systems/conventum/image/content/compendium/banner'+
                        compendium._element.find('h4.window-title').text().trim()+'.png)">'+
                    '<h4 class="pack-title">'+
                        compendium._element.find('h4.window-title').text().trim()+
                    '</h4>'+
                '</div>'
            );

            compendium._element.find('.header-banner').addClass('_v10');
        }
    }

}