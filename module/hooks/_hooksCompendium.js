/**
 * COMPENDIUM
 */

import { mainUtils } from "../mainUtils.js";

export class HookCompendium {

    /**
     * initCompendiums
     */
    static async initCompendiums() {
        if (!CONFIG.compendiumInitialized) {
            let oWorlds = await game.packs.get('conventum.worlds');
            oWorlds.getDocuments();

            await game.packs.get('conventum.kingdoms').getDocuments();
            await game.packs.get('conventum.societies').getDocuments();
            await game.packs.get('conventum.languages').getDocuments();
            await game.packs.get('conventum.cultures').getDocuments();
            await game.packs.get('conventum.stratums').getDocuments();
            await game.packs.get('conventum.status').getDocuments();
            await game.packs.get('conventum.skills').getDocuments();
            await game.packs.get('conventum.locations').getDocuments();
            await game.packs.get('conventum.armor').getDocuments();
            CONFIG.compendiumInitialized = true;
        }
    }

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
                    const sUrl = '/systems/conventum/image/content/compendium/banner'+
                                                        $(e).find('h4 a').text().trim()+'.png';
                    $(e).css({'background-image': 'url('+sUrl+')'});
                    mainUtils.ifNotExists(sUrl, function() {
                        $(e).css({'background-image': 'url(/systems/conventum/image/content/compendium/bannerStandard.png'});
                    }.bind(this));
                });
            });
        }
    }

    /**
     * Styling Compendium Window 
     * @param {object} compendium
     */    
    static async  _stylingCompendium(compendium) {        
        
        // Version 11...
        const sHeaderDiv = '.directory-header';
        if ( Math.floor(Number(game.version)) === 11 ) {
            compendium._element.find('.header-banner').addClass('_custoHeaderCompendium');
        } else {
            compendium._element.find('section.window-content').addClass('_v10');
            compendium._element.find(sHeaderDiv).addClass('_custoHeaderCompendium');
            compendium._element.find(sHeaderDiv).addClass('_v10');
            
            const sUrl = '/systems/conventum/image/content/compendium/banner'+
                            compendium._element.find('h4.window-title').text().split('[')[0].trim()+'.png';

            compendium._element.find(sHeaderDiv).prepend(
                '<div class="header-banner" style="background-image: '+
                    'url('+sUrl+')">'+
                    '<h4 class="pack-title">'+
                        compendium._element.find('h4.window-title').text().trim()+
                    '</h4>'+
                '</div>'
            );

         
            mainUtils.ifNotExists(sUrl, function() {
                compendium._element.find(sHeaderDiv+' .header-banner').css({'background-image': 
                                'url(/systems/conventum/image/content/compendium/bannerStandard.png'});
            }.bind(this));

            compendium._element.find('.header-banner').addClass('_v10');
        }

        const mWorlds = await game.packs.get("conventum.worlds").getDocuments();
        const sPack =  compendium._element.find('.compendium').data('pack');
        const mDocs = await game.packs.get(sPack).getDocuments();

        //Headers filters...
        await this._addFilters(sPack, compendium, sHeaderDiv);

        //Adding World info, dependencies && dice ranges...
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
            } else {
                $(e).append('<div class="_diceInfo"></div>');                
            }

            //Extra-info depends on compendium kind...
            this._addExtraInfo(sPack, e, oItemDoc);           

            //Adding World Info
            $(e).append('<div class="_worldInfo" data-filter="'+oWorldDoc.id+'">'+
                    oWorldDoc.name+'</div>');


        }.bind(this));        

        $(".compendium[data-pack='"+sPack+"'] ol.directory-list li.directory-item")
            .sort((a,b) => $(a).data("order") - $(b).data("order"))
            .appendTo(".compendium[data-pack='"+sPack+"'] ol.directory-list");

    }

    /**
     * _addFilters
     * @param {*} sPack 
     * @param {*} compendium 
     * @param {*} sHeaderDiv 
     */
    static async _addFilters(sPack, compendium, sHeaderDiv) {

        if ( (sPack === 'conventum.kingdoms') ||
             (sPack === 'conventum.societies') ||
             (sPack === 'conventum.languages') ||
             (sPack === 'conventum.cultures') ||
             (sPack === 'conventum.stratums') ||
             (sPack === 'conventum.skills') ||
             (sPack === 'conventum.status') ) {
            const mDocs = await this._getDocuments('worlds', '');
            compendium._element.find(sHeaderDiv).append(this._createSelect("world", "common.world", mDocs));
        }   
        if ( (sPack === 'conventum.cultures')  ||
             (sPack === 'conventum.stratums') ) {
            const mDocs = await this._getDocuments('societies', '');
            compendium._element.find(sHeaderDiv).append(this._createSelect("society", "common.society", mDocs));
        }             
        if (sPack === 'conventum.status') {
            const mDocs = await this._getDocuments('stratums', '');
            compendium._element.find(sHeaderDiv).append(this._createSelect("stratum", "common.stratum", mDocs));
        }
    }

    /**
     * _addExtraInfo
     * @param {string} sPack 
    * @param {object} oElement 
    * @param {object} oItemDoc
     */
    static _addExtraInfo(sPack, oElement, oItemDoc) {
        if ( (sPack === 'conventum.cultures')  ||
             (sPack === 'conventum.stratums') ) {
            this._addDivExtraInfo("conventum.societies", oElement,
                                  oItemDoc.system.backend.society);          
        }        
        if (sPack === 'conventum.status') {          
            this._addDivExtraInfo("conventum.stratums", oElement,
                                    oItemDoc.system.backend.stratum);                                                                
        }   
        if (sPack === 'conventum.skills') {
            this._addDivExtraInfoString(oElement,
                game.i18n.localize('characteristic.'+oItemDoc.system.characteristic.primary));                                                                
        }
    }

    /**
     * _addDivExtraInfo
     * @param {string} sCompendium 
     * @param {object} oElement 
     * @param {object} oValue 
     */
    static _addDivExtraInfo(sCompendium, oElement, oValue) {
        const oExtraDoc = game.packs.get(sCompendium).index.get(oValue);
        $(oElement).append('<div class="_extraInfo" data-filter="'+oExtraDoc._id+'">'+
                                                            oExtraDoc.name+'</div>');          
    }
    static _addDivExtraInfoString(oElement, sValue) {
        $(oElement).append('<div class="_extraInfo" data-filter="null">'+sValue+'</div>');          
    }    

    /**
     * _createSelect
     * @param {string} sFilter 
     * @param {string} sLabel
     * @param {array} mDocs 
     * @returns 
     */
    static _createSelect(sFilter, sLabel, mDocs) {
        let sSelectDiv = '<div class="_compendiumFilter">'+
                            '<label>'+game.i18n.localize(sLabel)+'</label>'+
                            '<select class="_cFilter" data-filter="'+sFilter+'">';
        sSelectDiv += '<option value="" selected></option>';
        mDocs.forEach(e => {
            sSelectDiv += '<option value="'+e.id+'" data-world="'+e.system.control.world+'">'
                                                                 +e.name+'</option>';
        });
        sSelectDiv += '</select></div>';  
        return sSelectDiv;      
    }

    /**
     * _getDocuments
     * @param {string} sPack 
     * @param {string} sWorld 
     * @returns 
     */
    static async _getDocuments(sPack, sWorld) {
        if (!game.packs.get("conventum."+sPack)) return [];
        const mDocs = await game.packs.get("conventum."+sPack).getDocuments();
        if (!mDocs) return [];

        let mReturn = [];
        if (sWorld != '') {
            mReturn = mDocs.filter(e => e.system.control.world === sWorld);
        } else mReturn = mDocs;

        mReturn.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });
        return mReturn;

    }     

}