/**
 * EVENTS
 */

import { helperSheetCombat } from "../sheets/helpers/helperSheetCombat.js";
import { HookCombat } from "./_hooksCombat.js";
import { HookActor } from "./_hooksActor.js";
import { helperControls } from "../helpers/helperControls.js";
import { aqCombat } from "../actions/aqCombat.js";
import { aqContext } from "../actions/aqContext.js";

export class HookEvents {

    _dragActor = null

    /**
     * First events...
     */    
    static initialEvents() {     

        //Combat Track
        $(document).on('change', 'input.cbInitiativeMod', function (event) {
            event.preventDefault();
            HookCombat.changeInitiativeMod($(this).data('actorid'), $(this).val());
        });
        $(document).on('click', 'a.combat-button[data-control="resetAll"]', function (event) {
            event.preventDefault();
            HookCombat.resetAllInitiativeMod();
        });             

        //WizardCombat click
        $(document).on('click', 'hbox._showMore', function (event) {
            event.preventDefault();
            $(event.target).parent().parent().find('._wInfo').slideToggle();
        });
        $(document).on('click', '.combatWizardActionsButton', function (event) {
            event.preventDefault();
            helperControls.playActions();
        });        
        $(document).on('click', '.combatWizardEncounterButton', function (event) {
            event.preventDefault();
            helperControls.playEncounter();
        });        

        //Show Info for skills (Chat Messages)
        $(document).on('click', 'a._infoSkill', function (event) {
            event.preventDefault();
            HookEvents._showSkill($(this).data('itemid'));
        });   
        
        //Show Info for items (Chat Messages)
        $(document).on('click', 'a._showItem', function (event) {
            event.preventDefault();
            HookEvents._showItem($(this).data('itemid'), $(this).data('actorid'));
        });         

        //Link to action task
        $(document).on('click', 'a._linkToAction', function (event) {
            event.preventDefault();
            const actorId = $(this).data('actorid');
            const tokenId = $(this).data('tokenid');
            const messageId = $(event.target).parents('li.chat-message').data('messageId');

            const actor = ((tokenId === '') || (!tokenId)) ?
                game.actors.get(actorId) :
                game.scenes.active.tokens.get(tokenId).getActor();
                
                
            actor.sheet._tabs[0].active = 'combat';
            actor.sheet._tabs[2].active = 'combatWeapons';
            actor.sheet.render(true);                
        });
        $(document).on('click', 'a._showTargetLinks', function (event) {
            event.preventDefault();
            
            const messageId = $(event.target).parents('li.chat-message').data('messageId');
            let message = game.messages.get(messageId);

            let button = $(event.target);
            let linkBox = button.parent().parent().find('._targetLinks');
            
            let context = Object.assign(new aqContext(), message.flags);
            context.init();
            const content = context.getLinks();
            linkBox.html(content);

            linkBox.toggle();
            if (button.parent().hasClass('_hideTargetLinks')) {
                button.parent().removeClass('_hideTargetLinks');
                linkBox.removeClass('_displayed');
            } else {
                button.parent().addClass('_hideTargetLinks');
                linkBox.addClass('_displayed');
            }
            
        });

        //Roll Damage (Chat Messages)
        $(document).on('click', 'a._rollDamage', function (event) {
            event.preventDefault();
            const messageId = $(event.target).parents('li.chat-message').data('messageId');
            let message = game.messages.get(messageId);

            let context = Object.assign(new aqContext(), message.flags);
            context.init();
            aqCombat.rollDamage(context);

            /*
            HookEvents._rollDamage($(this).data('weaponid'), 
                                   $(this).data('spellid'),
                                   $(this).data('actorid'),
                                   $(this).data('actionid'),
                                   $(this).data('targets'),
                                   $(this).data('damage'),
                                   $(event.currentTarget).parents('li.chat-message').data('messageId'),
                                   $(this).data('locationid'),
                                   $(this).data('critsuccess'),
                                   $(this).data('critfailure'));
            */
        });      
        
        //Roll Opposites (Chat Messages)
        $(document).on('click', 'a._rollOppo', function (event) {
            event.preventDefault();

            const actorId = $(this).data('actorid');
            const tokenId = ($(this).data('tokenid') === 'undefined') ? null :
                             $(this).data('tokenid');
            const actor = (tokenId) ?
                game.scenes.active.tokens.get(tokenId).actor :
                game.actors.get(actorId);

            if (actor.ownership[game.userId] !== 3) {
                new Dialog({
                    title: '',
                    content: game.i18n.localize("info.noPermissions"),
                    buttons: {}
                    }).render(true);                
                return;
            }

            const messageId = $(event.target).parents('li.chat-message').data('messageId');
            let message = game.messages.get(messageId);

            let context = Object.assign(new aqContext(), message.flags);
            context.init();
            aqCombat.rollOppo(context, message, actorId);

        });
        
        //ActionCards
        $(document).on('change', '#actApplyLocation', function (event) {
            event.preventDefault();

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
        $(document).on('change', '._actTargetType', function (event) {
            event.preventDefault();

            $('._actTargetLocation option').each(function(i,e) {
                $(e).remove();
            }.bind(this));
            const sType = $( "._actTargetType option:selected" ).val();
            Array.from(game.packs.get("conventum.locations")).filter(e => e.system.actorType === sType)
            .forEach(oLocation => {
                $('._actTargetLocation').append('<option value="'+oLocation.id+'">'+oLocation.name+'</option>');
            });            
        });      

       //Drag & Drop over actor     
        $(document).on('drag', 'li.directory-item.document.actor', function (event) {
            event.preventDefault();

            event.preventDefault();
            this._dragActor = event.target;
            event.originalEvent.dataTransfer.setData("text", $(event.currentTarget).data('documentId'));            
        }.bind(this));
        
        $(document).on('drop', 'li.directory-item.document.actor', function (event) {
            event.preventDefault();
            
            const suuId = JSON.parse(event.originalEvent.dataTransfer.getData("text")).uuid;
            const sDragId = suuId.split('.')[suuId.split('.').length - 1];
            if (!sDragId) return;
            const oDragActor = game.actors.get(sDragId);
            const oDragItem = game.items.get(sDragId);

            const sDropId = $(event.currentTarget).data('documentId');
            if (!sDropId) return;
            const oDropActor = game.actors.get(sDropId);
            if (!oDropActor) return;

            if (oDragActor) HookActor.mount(oDragActor, oDropActor);
            if (oDragItem) {
                //...
            }

        }); 


            //Riding creatures...
            $(document).on('dragover', 'li.directory-item.document.actor', function (event) {
                event.preventDefault();
                const sOverId = event.currentTarget.dataset.documentId;
                const sDragId = $(this._dragActor).data('documentId');
                if (sOverId !== sDragId) {
                    if (HookActor.dragOverMount(sOverId, sDragId)) {
                        event.originalEvent.dataTransfer.dropEffect = 'HOLA';
                        const img = new Image(100, 100);
                        img.src = "/systems/conventum/image/content/modes/enmontura.png";                    
                        event.originalEvent.dataTransfer.setDragImage(img, 10, 10);
                    }
                }
            }.bind(this));

            $(document).on('dragenter', 'li.directory-item.document.actor', function (event) {
                event.preventDefault();
                const sOverId = event.currentTarget.dataset.documentId;
                const sDragId = $(this._dragActor).data('documentId');
                if (sOverId !== sDragId) {
                    if (HookActor.dragOverMount(sOverId, sDragId)) {
                        if ($(event.target).find('._mountDrag').length === 0 ) {
                            $('section.tab.actors-sidebar .directory-list').find('._mountDrag').each(
                                                                                        function(i,e) { 
                                                                                            e.remove();});
                            
                            let oLi = $(event.target).parents('li.actor');
                            if (oLi.length !== 0) $(oLi).append('<div class="_mountDrag"></div>');
                                            else $(event.target).append('<div class="_mountDrag"></div>');
                        }
                            
                    }
                }   
            }.bind(this));

            $(document).on('dragend', 'li.directory-item.document.actor', function (event) {
                $('section.tab.actors-sidebar .directory-list').find('._mountDrag').each(
                    function(i,e) { e.remove();});
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
          editable: game.user.isGM
        });        
        oDoc[0].sheet._tabs[0].active = 'description';        
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
        item.sheet._tabs[0].active = 'description';      
    }     

    /**
     * _rollDamage
     * @param {*} weaponId 
     * @param {*} actorId 
     * @param {*} sTargets 
     * @param {*} sDamage 
     */
    static _rollDamage(weaponId, spellId, actorId, actionId, sTargets, sDamage, messageId, locationId, critSuccess, critFailure) {
        helperSheetCombat.rollDamage(weaponId, spellId, actorId, actionId, sTargets, sDamage, messageId, locationId, critSuccess, critFailure);
    }

}
