/**
 * COMPENDIUM
 */

import { mainUtils } from "../mainUtils.js";

export class HookCompendium {

    static _compendiums = [
        'conventum.worlds',
        'conventum.kingdoms',
        'conventum.societies',
        'conventum.languages',
        'conventum.cultures',
        'conventum.stratums',
        'conventum.status',
        'conventum.skills',
        'conventum.locations',
        'conventum.modes',
        'conventum.armor',
        'conventum.weapons',
        'conventum.magic',
        'conventum.actions'
    ];

    static _frequentCompendiums = [
        'conventum.worlds',
        'conventum.languages',
        'conventum.skills',
        'conventum.locations',
        'conventum.modes',
        'conventum.actions'
    ];

    /**
     * initCompendiums
     */
    static async initCompendiums() {
        if (!CONFIG.compendiumInitialized) {
            for (let i=0; i < HookCompendium._compendiums.length; i++) {
                await game.packs.get(HookCompendium._compendiums[i])?.getDocuments();
            }
            CONFIG.compendiumInitialized = true;
        }
    }

    /**
     * frequent
     */
    static async frequent() {
        for (let i=0; i < HookCompendium._frequentCompendiums.length; i++) {
            await game.packs.get(HookCompendium._frequentCompendiums[i])?.getDocuments();
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
            /**
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
             */
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
            /**
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
             */
        }

        const mWorlds = await game.packs.get("conventum.worlds").getDocuments();
        const sPack =  compendium._element.find('.compendium').data('pack');
        const mDocs = await game.packs.get(sPack).getDocuments();

        //Headers filters...
        await this._addFilters(sPack, compendium, sHeaderDiv);

        //Adding World info, dependencies && dice ranges...
        compendium._element.find('.compendium ol.directory-list li.directory-item').each(function(i,e) {
            
            if ($(e).data('folderId')) return;
            
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

        /**
        $(".compendium[data-pack='"+sPack+"'] ol.directory-list li.directory-item")
            .sort((a,b) => $(a).data("order") - $(b).data("order"))
            .appendTo(".compendium[data-pack='"+sPack+"'] ol.directory-list");
         */

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
             (sPack === 'conventum.locations') ||
             (sPack === 'conventum.skills') ||
             (sPack === 'conventum.status') ||
             (sPack === 'conventum.weapons') ||
             (sPack === 'conventum.magic') ) {
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
        if (sPack === 'conventum.locations') {
            let mDocs = [];
            game.template.Actor.types.map(e => {
                mDocs.push({
                    id: e,
                    name: game.i18n.localize('template.'+e),
                    system: {control: {world: ''}}
                });
            });            
            compendium._element.find(sHeaderDiv).append(this._createSelect("type", "common.type", mDocs, '_infoType'));
        }           
        if (sPack === 'conventum.weapons') {
            let mDocs = await this._getDocuments('skills', '');
            mDocs = mDocs.filter(e => e.system.combat.combat);
            compendium._element.find(sHeaderDiv).append(this._createSelect("combatSkill", "common.combatSkill", mDocs));
        }  
        if (sPack === 'conventum.skills') {
            let mDocs = [{
                id: 'human',
                name: game.i18n.localize("common.human"),
                system: {control: {world: ''}}
            },{
                id: 'criature',
                name: game.i18n.localize("common.criature"),
                system: {control: {world: ''}}
            }];
            compendium._element.find(sHeaderDiv).append(this._createSelect("type", "common.type", mDocs, '_infoCriature'));
        }

        if (sPack === 'conventum.magic') {
            let mDocs1 = [];
            CONFIG.ExtendConfig.spellShapes.map(e => {
                mDocs1.push({
                    id: e.id,
                    name: e.name,
                    system: {control: {world: ''}}
                });
            });
            compendium._element.find(sHeaderDiv).append(this._createSelect("type", "common.shape", mDocs1, '_infoShape'));
            
            let mDocs2 = [{
                id: 'spell',
                name: game.i18n.localize("common.spell"),
                system: {control: {world: ''}}
            },{
                id: 'ritual',
                name: game.i18n.localize("common.ritual"),
                system: {control: {world: ''}}
            }];
            compendium._element.find(sHeaderDiv).append(this._createSelect("type", "common.type", mDocs2, '_infoType'));
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
            
            const sType = (oItemDoc.system.criature) ? 
                                game.i18n.localize("common.criature") :
                                game.i18n.localize("common.human");
            const sValue = (oItemDoc.system.criature) ? 'criature' : 'human';
            this._addDivExtraInfoString(oElement,
                game.i18n.localize('common.type')+': '+sType, '_infoCriature', sValue);                
        }
        if (sPack === 'conventum.locations') {  
            const sType = game.i18n.localize("template."+oItemDoc.system.actorType);
            this._addDivExtraInfoString(oElement,
                game.i18n.localize('common.type')+': '+sType, '_infoType', oItemDoc.system.actorType);                                                                                               
        }         
        if (sPack === 'conventum.weapons') {
            this._addDivExtraInfo("conventum.skills", oElement,
                                    oItemDoc.system.combatSkill);    
            this._addDivExtraInfoString(oElement,
                game.i18n.localize('common.damage')+': '+oItemDoc.system.damage, '_infoDamage');                                                                                                  
        }  
        if (sPack === 'conventum.magic') {  
            const sType = game.i18n.localize("common."+oItemDoc.type);
            this._addDivExtraInfoString(oElement,
                game.i18n.localize('common.type')+': '+sType, '_infoType', oItemDoc.type);                                         
            const sShape = (oItemDoc.system.shape) ?
                            game.i18n.localize("shape."+oItemDoc.system.shape) : '';            
            this._addDivExtraInfoString(oElement,
                game.i18n.localize('common.shape')+': '+sShape, '_infoShape', oItemDoc.system.shape);                                                                                                 
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
        if (!oExtraDoc) return;
        $(oElement).append('<div class="_extraInfo" data-filter="'+oExtraDoc._id+'">'+
                                                            oExtraDoc.name+'</div>');          
    }
    static _addDivExtraInfoString(oElement, sValue, sClass, sFilter) {
        if (!sFilter) sFilter='null';
        sClass = (sClass) ? sClass : '_extraInfo';
        $(oElement).append('<div class="'+sClass+'" data-filter="'+sFilter+'">'+sValue+'</div>');          
    }    

    /**
     * _createSelect
     * @param {string} sFilter 
     * @param {string} sLabel
     * @param {array} mDocs 
     * @returns 
     */
    static _createSelect(sFilter, sLabel, mDocs, sDiv) {
        if (!sDiv) sDiv = '';
        let sSelectDiv = '<div class="_compendiumFilter">'+
                            '<label>'+game.i18n.localize(sLabel)+'</label>'+
                            '<select class="_cFilter" data-filter="'+sFilter+'">';
        sSelectDiv += '<option value="" selected></option>';
        const sDivData = (sDiv !== '') ? ' data-sdiv="'+sDiv+'" ' : '';
        mDocs.forEach(e => {
            sSelectDiv += '<option value="'+e.id+'" '+sDivData+' data-world="'+e.system.control.world+'">'
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