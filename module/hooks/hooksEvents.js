import { mainSettings } from "../gameSettings/mainSettings.js";
import { helperLore } from "../helpers/helperLore.js";
import { helperSheets } from "../helpers/helperSheets.js";

/**
 * EVENTS
 */
export class HookEvents {

    /**
     * First events...
     */    
    static initialEvents() {        

        //MainSettings
        $(document).on('change', '#client-settings select[name="'+game.system.id+'.rules"]', mainSettings.onChangeRules);

        //Dialogs
        $(document).on('change', 'formFolder input[type="checkbox"]', HookEvents.onChangeFormFolder);
        $(document).on('change', 'formActor input[type="checkbox"]', HookEvents.onChangeFormActor);
        $(document).on('change', 'formItem input[type="checkbox"]', HookEvents.onChangeFormItem);
        $(document).on('click', 'formItem._loreFormItem', HookEvents.onClickLoreFormItem);
        $(document).on('click', 'button._openCompendium', HookEvents.onClickOpenCompendium);

        //Check dialog...
        $(document).on('click', 'a.showContextItem', helperLore.onShowContextItem);
        $(document).on('click', 'a.deleteContextItem', helperLore.onDeleteContextItem);
        $(document).on('click', '._mainH2', helperLore.onClickCombo);
    }

    /**
     * onChangeFormFolder
     * @param {*} event 
     */
    static async onChangeFormFolder(event) {
        event.preventDefault();
        const formFolders = $(event.target).parents('formFolders');
        const bSingular = !!$(event.target).parents('formFolders').data('singular');
        
        //Singular Folder
        if (bSingular) {
            $(event.currentTarget).parents('formFolders').find('formFolder').each(function(i,e) {
                if ($(e).data('folder') === $(event.currentTarget).parents('formFolder').data('folder')) return;
                $(e).find('input[type="checkbox"]').prop('checked', false);
            }.bind(this));     
        }

        //Actors...
        if ($(event.target).data('target') === 'actors') {

            $(event.target).parents('formDialog').find('formActors').find('formActor').each(function(i, e) {
                const oFolder = formFolders.find('input[name="folder_'+$(e).data('folder')+'"]');
                if (oFolder.prop('checked')) $(e).show();
                                        else $(e).hide();
            }.bind(this));
            return;
        }

        //Items...
        if ($(event.target).data('target') === 'items') {

            $(event.target).parents('formDialog').find('formItems').find('formItem').each(function(i, e) {
                let bVisible = false;
                $(e).data('folder').map(sFolder => {
                    const oFolder = formFolders.find('input[name="folder_'+sFolder+'"]');    
                    if (oFolder.prop('checked')) bVisible = true;
                });
                if (bVisible) $(e).show();
                         else $(e).hide();
            }.bind(this));
            return;
        }        
    }    

    /**
     * onChangeFormActor
     * @param {*} event 
     */
    static async onChangeFormActor(event) {
        event.preventDefault();
        if (!$(event.target).parents('formActors').data('singular')) return;
        $(event.target).parents('formActors').find('formActor input[type="checkbox"]').each(function (i,e) {
            if ( $(e).attr('id') !== $(event.target).attr('id') ) $(e).prop('checked', false);
        });

        if ($(event.target).parents('.window-app').hasClass('_checkSelections')) {
            let selectedItem = null;
            $(event.target).parents('formActors').find('formActor input[type="checkbox"]').each(function (i,e) {
                selectedItem = selectedItem ? selectedItem : $(e).prop('checked') ? e : null;
            });
            if (selectedItem) {
                $(event.target).parents('.window-content').find('.dialog-buttons button.select').show();
            } else {
                $(event.target).parents('.window-content').find('.dialog-buttons button.select').hide();
            }
        }
    }    

    /**
     * onChangeFormItem
     * @param {*} event 
     */
    static async onChangeFormItem(event) {
        event.preventDefault();
        if (!$(event.target).parents('formItems').data('singular')) return;
        $(event.target).parents('formItems').find('formItem input[type="checkbox"]').each(function (i,e) {
            if ( $(e).attr('id') !== $(event.target).attr('id') ) $(e).prop('checked', false);
        });

        //Preview
        if ($(event.target).parents('._prevItems').hasClass('_prevItems')) {
            const itemId = $(event.target).attr('itemid');
            const previewDiv = $(event.target).parents('._prevItems').find('._preview');
            if (!$(event.target).parents('formItems').find('formItem input[itemid="'+itemId+'"]').prop('checked')) {
                previewDiv.html('');
                return;
            }
            const combatantId = $(event.target).attr('combatantid');
            const combat = game.combats.active;
            if (!combat) return;
            const actor = combat.combatants.get(combatantId)?.actor;
            if (!actor) return;
            const item = actor.items.get(itemId);
            
            let sText = '';
            if (item.system.requirements && item.system.requirements !== '') {
                sText += `<h2>${game.i18n.localize('common.requirements')}</h2>${item.system.requirements}`;
            }
            if (item.system.abstract && item.system.abstract !== '') {
                sText += `<h2>${game.i18n.localize('common.abstract')}</h2>${item.system.abstract}`;
            }            
            sText += (sText === '') ? item.system.description :
                    `<h2>${game.i18n.localize('common.description')}</h2>${item.system.description}`;
            previewDiv.html('<h1 class="_title">'+item.name+'</h1>'+sText);
        }
    }

    /**
     * onClickLoreFormItem
     * @param {*} event 
     */
    static onClickLoreFormItem(event) {
        event.preventDefault();
        $(event.currentTarget).parents('formItems').find('formItem input[type="checkbox"]').each(function (i,e) {
            if ( $(e).attr('id') !== $(event.target).attr('id') ) $(e).prop('checked', false);
        });   
        $(event.currentTarget).parents('formItems').find('formItem').each(function (i,e) {
            $(e).removeClass('_selected');            
        });
        $(event.currentTarget).find('input[type="checkbox"]').prop('checked', true);
        $(event.currentTarget).addClass('_selected');

        const sText = $(event.currentTarget).find('._row label').text();
        $(event.currentTarget).parents('._formDialog').find('.dialog-buttons button.select').text(
            game.i18n.localize('common.choose') + sText.split(']')[1]);
        $(event.currentTarget).parents('._formDialog').find('.dialog-buttons button.select').addClass('_kimeta');
    }

    /**
     * onClickOpenCompendium
     * @param {*} event 
     */
    static onClickOpenCompendium(event) {
        helperSheets.openCompendium($(event.currentTarget).data('pack'));
        $(event.currentTarget).parents('.dialog').remove();
    }

}
