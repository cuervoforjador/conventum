/**
 * @extends {ItemSheet}
 */

import { helperBackend } from "../helpers/helperBackend.js";
import { helperSheets } from "../helpers/helperSheets.js";
import { helperUtils } from "../helpers/helperUtils.js";

export class extendSheetAction extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "action", "golden", "_sheetDialog" ],
      template: CONFIG._root+"/templates/action.html",
      width: 900,
      height: 700,
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
    context.backend = await helperBackend.getBackend(context, 'action');
    context.fromActor = this.item.parent?.type === 'human';
    
    await helperBackend.checkKey(context);

    //Owns...
    if (!context.systemData.roll.useSkill) {
      context.systemData.skill.skillKey = '';
      context.systemData.roll.restrictWeapons = false;
    }
    if (!context.systemData.roll.usePercentFormula) {
      context.systemData.percent.formula = '';
    }
    if (!context.systemData.flow.useOppoRoll) {
      context.systemData.opposedRoll.attacker = '';
      context.systemData.opposedRoll.defender = '';
    }  
    context.systemData.roll.restrictWeapons = 
                          !context.systemData.roll.useSkill ? false : context.systemData.roll.restrictWeapons;

    context.systemData.initiative = helperUtils.checkMod(context.systemData.initiative);
    context.systemData.weapon.damage.mod = helperUtils.checkMod(context.systemData.weapon.damage.mod);
    context.systemData.weapon.damage.mult = helperUtils.checkMult(context.systemData.weapon.damage.mult);
    context.systemData.defense.criticalAttack.mod = helperUtils.checkMod(context.systemData.defense.criticalAttack.mod);
    context.systemData.defense.criticalAttack.mult = helperUtils.checkMult(context.systemData.defense.criticalAttack.mult);
    context.systemData.weapon.damage.dbLevel = helperUtils.checkMod(context.systemData.weapon.damage.dbLevel);

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
    html.find("._rollOption2").change(this._changeRollOption2.bind(this));
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

  _changeRollOption2(event) {
    event.preventDefault();

    const target = $(event.currentTarget).is('label') ?
                      $(event.currentTarget).parent().find('#'+$(event.currentTarget).attr('for')) :
                      $(event.currentTarget);
    $(event.currentTarget).parents('formSection')
                          .find('input[type="checkbox"]._rollOption2').each(function(i, e) {
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
