/**
 * @extends {ItemSheet}
 */

import { helperBackend } from "../helpers/helperBackend.js";
import { helperSheets } from "../helpers/helperSheets.js";

export class extendSheetSpell extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "spell", "golden", "_sheetDialog"],
      template: CONFIG._root+"/templates/spell.html",
      width: 800,
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

    const context = super.getData();
    context.isGM = game.user.isGM;

    context.systemData = this.item.getRollData();
    context.backend = await helperBackend.getBackend(context, 'spell');
    context.fromActor = this.item.parent?.type === 'human';

    //Automatic...
    const spellProp = helperSheets.spell_prop(context.systemData);

    context.systemData.stats.exper = spellProp.exper;
    context.systemData.stats.conc = spellProp.conc;
    context.systemData.stats.faith = spellProp.faith;
    context.systemData.stats.mod = spellProp.mod;
    context.systemData.study.skillMin = spellProp.skillMin;
    context.systemData.study.months = spellProp.study;
    context.systemData.study.assiMod = spellProp.mod;
    


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

    html.find("#chVIS").change(this._changeType.bind(this));
    html.find("#chORDO").change(this._changeType.bind(this));
  }

  /**
   * _changeType
   * @param {*} event 
   */
  _changeType(event) {
    const target = $(event.currentTarget);
    target.parent().find('input[type="checkbox"]').each(function(i,e) {
      if ($(e).attr('id') !== $(target).attr('id')) $(e).prop('checked', false);
    });
  }

}
