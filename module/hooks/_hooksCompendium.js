/**
 * COMPENDIUM
 */
<<<<<<< HEAD
=======

import { mainUtils } from "../mainUtils.js";

>>>>>>> 48ae91f0c39a0c8e5746703da684780f1db7deaf
export class HookCompendium {

    /**
     * Styling Compendium List element 
     * @param {object} tab
     */    
    static _stylingLiCompendium(tab) {
        
<<<<<<< HEAD
        tab._element.find('li').each(function(i,e) {
            $(e).addClass('_custoLiCompendium');
        });
=======
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
                    const sUrl = '/systems/conventum/image/content/compendium/banner'+
                                                        $(e).find('h4 a').text().trim()+'.png';
                    $(e).css({'background-image': 'url('+sUrl+')'});
                    mainUtils.ifNotExists(sUrl, function() {
                        $(e).css({'background-image': 'url(/systems/conventum/image/content/compendium/bannerStandard.png'});
                    }.bind(this));

                });
            });
        }
>>>>>>> 48ae91f0c39a0c8e5746703da684780f1db7deaf
    }

    /**
     * Styling Compendium Window 
     * @param {object} compendium
     */    
<<<<<<< HEAD
    static _stylingCompendium(compendium) {
        
        compendium._element.find('.header-banner').addClass('_custoHeaderCompendium');
=======
    static async  _stylingCompendium(compendium) {        
        
        // Version 11...
        if ( Math.floor(Number(game.version)) === 11 ) {
            compendium._element.find('.header-banner').addClass('_custoHeaderCompendium');
        } else {
            compendium._element.find('section.window-content').addClass('_v10');
            compendium._element.find('.directory-header').addClass('_custoHeaderCompendium');
            compendium._element.find('.directory-header').addClass('_v10');
            
            const sUrl = '/systems/conventum/image/content/compendium/banner'+
                            compendium._element.find('h4.window-title').text().trim()+'.png';

            compendium._element.find('.directory-header').prepend(
                '<div class="header-banner" style="background-image: '+
                    'url('+sUrl+')">'+
                    '<h4 class="pack-title">'+
                        compendium._element.find('h4.window-title').text().trim()+
                    '</h4>'+
                '</div>'
            );
            
            mainUtils.ifNotExists(sUrl, function() {
                compendium._element.find('.directory-header .header-banner').css({'background-image': 
                                'url(/systems/conventum/image/content/compendium/bannerStandard.png'});
            }.bind(this));

            compendium._element.find('.header-banner').addClass('_v10');
        }

        //Adding World info && dice ranges...
        const mWorlds = await game.packs.get("conventum.worlds").getDocuments();
        const sPack =  compendium._element.find('.compendium').data('pack');
        const mDocs = await game.packs.get(sPack).getDocuments();
        compendium._element.find('.compendium ol.directory-list li.directory-item').each(function(i,e) {
            const sId = $(e).data('documentId');
            const oItemDoc = mDocs.find(e => e.id === sId);
            const oWorldDoc = mWorlds.find(e => e.id === oItemDoc.system.control.world);
            if (oWorldDoc === undefined) return;
            if ( ( Number(oItemDoc.system.range.low) > 0 ) &&
                 ( Number(oItemDoc.system.range.high) > 0 ) ) {
                $(e).append('<div class="_diceInfo">'+
                    oItemDoc.system.range.low+' - '+
                    oItemDoc.system.range.high+'</div>');
                $(e).data('order', oItemDoc.system.range.low);
            }
            $(e).append('<div class="_worldInfo" data-id="'+oWorldDoc.id+'">'+
                    oWorldDoc.name+'</div>');
        }.bind(this));        

        $(".compendium ol.directory-list li.directory-item")
            .sort((a,b) => $(a).data("order") - $(b).data("order"))
            .appendTo(".compendium ol.directory-list");

>>>>>>> 48ae91f0c39a0c8e5746703da684780f1db7deaf
    }

}