/**
 * @extends {ItemSheet}
 */

import { helperBackend } from "../helpers/helperBackend.js";
import { helperSheets } from "../helpers/helperSheets.js";
import { helperUtils } from "../helpers/helperUtils.js";

export class extendSheetArmor extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "armor", "golden", "_sheetDialog"],
      template: CONFIG._root+"/templates/armor.html",
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
    context.systemData = this.item.getRollData();

    context.isGM = game.user.isGM;
    context.backend = await helperBackend.getBackend(context, 'armor');

    context.systemData.requirements.str = Number(context.systemData.requirements.str);

    ['protection', 'proInitial', 'endurance', 'endInitial'].map(s => {
      context.systemData[s] = Number(context.systemData[s]);
      context.systemData[s] = context.systemData[s] < 0 ? 0 : context.systemData[s];
    });

    if (context.systemData.protection > context.systemData.proInitial)
        context.systemData.protection = context.systemData.proInitial;

    if (context.systemData.endurance > context.systemData.endInitial)
        context.systemData.endurance = context.systemData.endInitial;

    context.systemData.penalization.initiative = 
                                        helperUtils.checkMod(context.systemData.penalization.initiative);    
    context.systemData.penalization.skills.swim = 
                                        helperUtils.checkMod(context.systemData.penalization.skills.swim);
    for (var s in context.systemData.penalization.skillsChar) {
      context.systemData.penalization.skillsChar[s].mod = 
                                        helperUtils.checkMod(context.systemData.penalization.skillsChar[s].mod);
      context.systemData.penalization.skillsChar[s].checked = 
                                        (context.systemData.penalization.skillsChar[s].mod !== '+0');
    }
    

    //context.systemData.skillMod = helperUtils.checkMod(context.systemData.skillMod);
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

    html.find("._smallNumber[name='system.proInitial']").change(this._changeProtection.bind(this));
    html.find("._smallNumber[name='system.endInitial']").change(this._changeEndurance.bind(this));
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

  _changeProtection(event) {
    $('input[name="system.protection"]').val($(event.currentTarget).val());
  }

  _changeEndurance(event) {
    $('input[name="system.endurance"]').val($(event.currentTarget).val());
  }  

}
