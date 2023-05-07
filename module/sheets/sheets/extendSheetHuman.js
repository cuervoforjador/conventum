/**
 * @extends {ActorSheet}
 */

import { mainBackend } from "../backend/mainBackend.js";
import { helperSheetHuman } from "../helpers/helperSheetHuman.js";
import { helperSheetArmor } from "../helpers/helperSheetArmor.js";
import { helperRolls } from "../../helpers/helperRolls.js";
import { mainUtils } from "../../mainUtils.js";

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
    context.backend = await mainBackend.getBackendForActor(this.actor, context.systemData);
    
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

    //Armor items values...
    let mArmor = this.actor.items.filter(e=>e.type === 'armor');
    for (const s in context.systemData.armor) {
        let oItem = mArmor.find( e => 
                            e._id === context.systemData.armor[s].itemID );
        if (!oItem) continue;
        await oItem.update({
          system: { enduranceCurrent: context.systemData.armor[s].value }
        });        

        if ( context.systemData.armor[s].lastValue &&
            (Number(context.systemData.armor[s].value) != Number(context.systemData.armor[s].lastValue)) ) {
          for (const s2 in context.systemData.armor) {
            if ( (s != s2) && 
                (context.systemData.armor[s2].itemID === 
                  context.systemData.armor[s].itemID ) ) {
                    context.systemData.armor[s2].value = context.systemData.armor[s].value;
                    context.systemData.armor[s2].lastValue = context.systemData.armor[s].value;
            }
          }
        }

        context.systemData.armor[s].lastValue = Number(context.systemData.armor[s].value);
    }

    //Im Master..
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

    /* Traits */
    html.find("._traitShow").click(this._traitShow.bind(this));
    html.find("._traitDel").click(this._traitDelete.bind(this));
    
    /* Skills */
    html.find("._diceSkill").click(this._diceSkill.bind(this));  

    /* Armor */
    html.find("._armorEndCurrent").change(this._updateArmorValue.bind(this));
    html.find("a.locationShield").click(helperSheetArmor.openArmorCloset.bind(this));
    html.find(".closeArmorCloset").click(helperSheetArmor.closeCloset.bind(this));
    html.find(".armorGarment").click(this._wearGarment.bind(this));
    html.find(".unwearArmor").click(this._unwearGarment.bind(this));
    html.find("._garmentLabel").mouseover(this._showArmorPieceInfo.bind(this));
    html.find("._garmentLabel").mouseout(this._hideArmorPieceInfo.bind(this));    
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

  async _updateArmorValue(event) {
/*
      event.preventDefault();
      const sLocationId = event.currentTarget?.dataset.locationid;
      const sItemId = (this.actor.system.armor[sLocationId]) ?
                          this.actor.system.armor[sLocationId].itemID : '';
      const sValue = $(event.target).val();
      if (sItemId === '') return;
      const oItem = this.actor.items.find(e => e._id === sItemId);
      await oItem.update({
        system: { enduranceCurrent: Number(sValue) }
      });
      for (const s in this.actor.system.armor) {
        if (this.actor.system.armor[s].itemID === sItemId)
              this.actor.system.armor[s].value = Number(sValue);
              $("._armorEndCurrent[data-locationId='"+s+"']").val(sValue);
      }
*/
  }

  async _wearGarment(event) {
    event.preventDefault();
    const itemId = event.currentTarget?.dataset.itemid;
    await helperSheetArmor.wearGarment(this.actor, itemId).then(() => {
          mainUtils.delay(500).then(() => this.actor.sheet.render());
    });
    
  }

  async _unwearGarment(event) {
    event.preventDefault();
    const itemId = $($(event.currentTarget).parents("ol.armorCloset")).data("currentitem");
    await helperSheetArmor.unwearGarment(this.actor, itemId).then(() => {
          mainUtils.delay(500).then(() => this.actor.sheet.render());
    });
  }

  _showArmorPieceInfo(event) {
    event.preventDefault();
    const itemId = event.currentTarget?.dataset.itemid,
          sLocation = $($(event.currentTarget).parents("ol.armorCloset")).data("location");
          helperSheetArmor._showInfoGarment(itemId, this.actor, sLocation, false);    
  }

  _hideArmorPieceInfo(event) {
    event.preventDefault();
    const itemId = $($(event.currentTarget).parents("ol.armorCloset")).data("currentitem"),
          sLocation = $($(event.currentTarget).parents("ol.armorCloset")).data("location");
          helperSheetArmor._showInfoGarment(itemId, this.actor, sLocation, false);    
  }

}
