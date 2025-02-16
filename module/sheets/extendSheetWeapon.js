/**
 * @extends {ItemSheet}
 */

import { helperBackend } from "../helpers/helperBackend.js";
import { helperSheets } from "../helpers/helperSheets.js";
import { helperUtils } from "../helpers/helperUtils.js";

export class extendSheetWeapon extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "weapon", "golden", "_sheetDialog"],
      template: CONFIG._root+"/templates/weapon.html",
      width: 700,
      height: 650,
      tabs: [
        {navSelector: ".itemTabsBar", contentSelector: ".itemTabsContent", initial: "description"}
      ],       
    });
  }

  /**
   * Context Sheet...
   * @inheritdoc
   * @returns {object} - Context
   */
   async getData() {

    const context = await super.getData();
    context.isGM = game.user.isGM;

    context.systemData = this.item.getRollData();
    context.backend = await helperBackend.getBackend(context, 'weapon');

    context.systemData.skillMod = helperUtils.checkMod(context.systemData.skillMod);

    context.systemData.skillModDefense = helperUtils.checkMod(context.systemData.skillModDefense);
    for (var s in context.systemData.armorMult) {
      if (!context.systemData.armorMult[s]) {
        context.systemData.armorMult[s] = {
          check: false,
          mult: '1'
        }
      }
      context.systemData.armorMult[s].mult = helperUtils.checkMult(context.systemData.armorMult[s].mult);
    }
    

    context.fromActor = this.item.parent?.type === 'human';

    return context;
  }

  /**
   * Sheet events Listeners...
   * @inheritdoc
   * @param {html} html
   */
   activateListeners(html) {
    super.activateListeners(html);
    if ( !this.isEditable ) return;

    html.find("._rollOption").change(this._changeRollOption.bind(this));
    html.find("._checkOption").change(this._changeCheckOption.bind(this));
  }
  
  _changeRollOption(event) {
    event.preventDefault();

    const target = $(event.currentTarget).is('label') ?
                      $(event.currentTarget).parent().find('#'+$(event.currentTarget).attr('for')) :
                      $(event.currentTarget);
    $(event.currentTarget).parents('formSection')
                          .find('input[type="checkbox"]._rollOption').each(function(i, e) {
      if ($(e)[0].name === target[0].name) return;
      $(e).prop('checked', false);
    }.bind(this));
  }

  _changeCheckOption(event) {
    event.preventDefault();

    const target = $(event.currentTarget).is('label') ?
                      $(event.currentTarget).parent().find('#'+$(event.currentTarget).attr('for')) :
                      $(event.currentTarget);
    $(event.currentTarget).parents('formGroup')
                          .find('input[type="checkbox"]._checkOption').each(function(i, e) {
      if ($(e)[0].name === target[0].name) return;
      $(e).prop('checked', false);
    }.bind(this));    
  }

}
