/**
 * @extends {ActorSheet}
 */

import { mainBackend } from "../backend/mainBackend.js";
import { helperSheetHuman } from "../helpers/helperSheetHuman.js";
import { helperRolls } from "../../helpers/helperRolls.js";

export class extendSheetHuman extends ActorSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "actor"],
      template: CONFIG._root+"/templates/human.html",
      width: 400,
      height: 600,
      tabs: [
        {navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main"},
        {navSelector: ".tabs_Bio", contentSelector: ".tabsContent_Bio", initial: "description"}
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
    context.systemData = this.actor.getRollData();
    
    //World...
    await helperSheetHuman.checkWorld(context.systemData);
    
    //Backend && Background...
    context.backend = await mainBackend.getBackendForActor(context.systemData);
    
    //Checking data...
    helperSheetHuman.checkSystemData(context.systemData, context.backend);
    
    //Custo...
    context.custo = await helperSheetHuman.getCusto(context.systemData, context.backend);

    //Traits...
    context.traits = this.actor.items.filter(e=>e.type === 'trait');

    //Skills...
    context.backend.skills.forEach( skill => {
      if (!context.systemData.skills[skill.id]) {
        context.systemData.skills[skill.id] = {
          value: 0,
          initial: 0,
          acquired: false
        };
      }      
    });

    //Im Master..
    //context.imMaster = (game.users.get(game.userId).role === 4);
    context.imMaster = game.user.isGM;

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

    html.find("._traitShow").click(this._traitShow.bind(this));
    html.find("._traitDel").click(this._traitDelete.bind(this));
    html.find("._diceSkill").click(this._diceSkill.bind(this));  
  }

  /** ******************************************
   *  EVENTS
   ****************************************** */
  
  async _traitShow(event) {
    event.preventDefault();
    const itemId = event.currentTarget?.dataset.itemid;
    const item = (itemId) ? this.actor.items.get(itemId) : null;
    if (!item) return;
    item.sheet.render(true, {
      editable: false
    });
  }

  _traitDelete(event) {
    event.preventDefault();
    const itemId = event.currentTarget?.dataset.itemid;
    const item = (itemId) ? this.actor.items.get(itemId) : null;
    if (!item) return;
    item.delete();
  }

  _diceSkill(event) {
    event.preventDefault();
    const skillId = event.currentTarget?.dataset.itemid;
    const skillItem = game.packs.get('conventum.skills').get(skillId);
    const skill = this.actor.system.skills[skillId];
    const sPath = 'skills.'+skillId;
    helperRolls.rollDices(this.actor, sPath, true);
  }

}
