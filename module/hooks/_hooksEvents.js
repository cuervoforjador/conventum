/**
 * EVENTS
 */

import { helperSheetCombat } from "../sheets/helpers/helperSheetCombat.js";

export class HookEvents {

    /**
     * First events...
     */    
    static initialEvents() {

        //Show Info for skills (Chat Messages)
        $(document).on('click', 'a._infoSkill', function (event) {
            HookEvents._showSkill($(this).data('itemid'));
        });   
        
        //Show Info for items (Chat Messages)
        $(document).on('click', 'a._showItem', function (event) {
            HookEvents._showItem($(this).data('itemid'), $(this).data('actorid'));
        });         

        //Roll Damage (Chat Messages)
        $(document).on('click', 'a._rollDamage', function (event) {
            HookEvents._rollDamage($(this).data('weaponid'), 
                                   $(this).data('spellid'),
                                   $(this).data('actorid'),
                                   $(this).data('actionid'),
                                   $(this).data('targets'),
                                   $(this).data('damage'),
                                   $(event.currentTarget).parents('li.chat-message').data('messageId'),
                                   $(this).data('locationid'),);
        });        
        
        //ActionCards
        $(document).on('change', '#actApplyLocation', function (event) {
            $(event.target).parents('._askingForLocation')
                           .find('[name="actTargetType"]').prop( "disabled", !event.target.checked );
            $(event.target).parents('._askingForLocation')
                           .find('[name="actTargetLocation"]').prop( "disabled", !event.target.checked );  
            
            if (event.target.checked) {
                new Dialog({
                        title: game.i18n.localize("common.actions"),
                        content: game.i18n.localize("info.applyLocation"),
                        buttons: {}
                        }).render(true);
            }
        });        

    }

    /**
     * Displaying Info in Sheets...
     */    
    static sheetInfoEvent() {
        
        //Show Info for label (Sheets)
        $(document).on('click', 'info', function (event) {
            HookEvents._showInfo($(this).data('id'));
        });

    }

    /**
     * Handling panels in Sheets...
     */    
    static sheetPanelEvent() {
        
    }

    /**
     * Compendium Events... 
     */    
    static compendiumEvent() {
        
        //Filtering rows...
        $(document).on('change', 'select._cFilter', function (event) {
            
            const sValue = $(this).val();
            const sFilter = $(this).data('filter');
            let sDiv = (sFilter === 'world') ? '._worldInfo' : '._extraInfo';
            if ($(this).find("option:selected").data('sdiv')) 
                sDiv = '.'+$(this).find("option:selected").data('sdiv');
            const sPack = $(event.target).parents('.compendium').data('pack');
            $(".compendium[data-pack='"+sPack+"'] ol.directory-list li.directory-item").each(function(i,e) {
                if ( $(e).find(sDiv).data("filter") === sValue ) $(e).show();
                else $(e).hide();
                if (sValue === '') $(e).show();
            }.bind(this));

            //Changing others select control...
            if (sFilter === 'world') {
                $("._cFilter").each(function(i0, e0) {
                    if ( $(e0).data('filter') !== 'world' ) {
                        $(e0).find("option:selected").prop("selected", false);
                        $(e0).find('option').each(function(i, e) {
                            if ( $(e).data('world') === sValue ) $(e).show();
                            else $(e).hide();
                            if (sValue === '') $(e).show();
                            if ( $(e).data('world') === '' ) $(e).show();
                        }.bind(this));
                    }
                }.bind(this));
            }
        });
    }    
    

    /**
     * Display Info message
     * @param {*} langId 
     */
    static _showInfo(langId) {
    
        let content = '<div class="_infoDialog">'+game.i18n.localize(langId);+'</div>';    
        let _dialog = new Dialog({
          title: game.i18n.localize('common.dialogInfo'),
          content: content,
          buttons: {}
          });
          _dialog.render(true, {
              width: 300,
              height: 300,
          });    
    }

    /**
     * Display Skill sheet
     * @param {*} langId 
     */
    static async _showSkill(skillId) {
        const oDoc = (await game.packs.get('conventum.skills').getDocuments())
                                      .filter(e => e.id === skillId);
        if (!oDoc || (oDoc.length === 0)) return;
        oDoc[0].sheet.render(true, {
          editable: false
        });        
    }    

    /**
     * Display Item
     * @param {*} langId 
     */
    static async _showItem(itemId, actorId) {
        let item = null;
        if (actorId) item = game.actors.get(actorId).items.get(itemId);
                else item = game.items.get(itemId);
        if (!item) return;

        item.sheet.render(true, {
          editable: game.user.isGM
        });        
    }     

    /**
     * _rollDamage
     * @param {*} weaponId 
     * @param {*} actorId 
     * @param {*} sTargets 
     * @param {*} sDamage 
     */
    static _rollDamage(weaponId, spellId, actorId, actionId, sTargets, sDamage, messageId, locationId) {
        helperSheetCombat.rollDamage(weaponId, spellId, actorId, actionId, sTargets, sDamage, messageId, locationId);
    }

}
