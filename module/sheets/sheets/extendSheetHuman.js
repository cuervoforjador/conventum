/**
 * @extends {ActorSheet}
 */

import { mainBackend } from "../backend/mainBackend.js";
import { helperSheetHuman } from "../helpers/helperSheetHuman.js";
import { helperSheetArmor } from "../helpers/helperSheetArmor.js";
import { helperSheetCombat } from "../helpers/helperSheetCombat.js";
import { helperRolls } from "../helpers/helperRolls.js";
import { helperActions } from "../helpers/helperActions.js";
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
        {navSelector: ".tabs_Bio", contentSelector: ".tabsContent_Bio", initial: "combatWeapons"},
        {navSelector: ".tabs_Combat", contentSelector: ".tabsContent_Combat", initial: "combatWeapons"}
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
    helperSheetHuman.checkSystemData(this.actor, context.systemData, context.backend);
    
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

    //Combat
    context.combats = helperSheetCombat.getActorCombats(this.actor);
    context.combatBackend = helperSheetCombat.getActorCombatBackend(context, this.actor);

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

    //Playing actions...
    context.actions = helperActions.getActions(this.actor);

    //Targets...
    context.targets = helperActions.getTargets(this.actor);

    //Checking Items..
    helperSheetHuman.checkMyItems(this.actor);

    context.systemData.quickBar = this._setQuickBar(context.systemData.quickBar);

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

    /* Misc */
    html.find("._showQuickBar").click(this._showQuickBar.bind(this));
    if (html.find("._quickBar").length > 0) {
        html.find("._quickBar").draggable();
        html.find("._quickBar").bind('dragstop', this._moveQuickBar.bind(this));      
    }
    html.find("._quickButtonAction").click(this._openTabActions.bind(this));
    html.find("._quickButtonWeapons").click(this._openTabWeapons.bind(this));

    /* Traits */
    html.find("._traitShow").click(this._traitShow.bind(this));
    html.find("._traitDel").click(this._traitDelete.bind(this));
    
    /* Skills */
    html.find("._diceSkill").click(this._diceSkill.bind(this));  

    /* Weapons & actions*/
    html.find("a._playWeapon").click(this._playWeapon.bind(this));  
    html.find(".weaponHand").click(this._weaponHand.bind(this));  
    html.find("a._encounterInfo").click(this._showItem.bind(this));
    html.find("a._cardInfo").click(this._showMyItem.bind(this));  
    html.find("a._showMyItem").click(this._showMyItem.bind(this));  
    html.find("a._doAction").click(this._doAction.bind(this)); 

    /* Armor */
    html.find("._armorEndCurrent").change(this._updateArmorValue.bind(this));
    html.find("a.locationShield").click(helperSheetArmor.openArmorCloset.bind(this));
    html.find(".closeArmorCloset").click(helperSheetArmor.closeCloset.bind(this));
    html.find(".armorGarment").click(this._wearGarment.bind(this));
    html.find(".unwearArmor").click(this._unwearGarment.bind(this));
    html.find("._garmentLabel").mouseover(this._showArmorPieceInfo.bind(this));
    html.find("._garmentLabel").mouseout(this._hideArmorPieceInfo.bind(this));    

    /* Items */
    html.find("a.actionIcon").click(this._actionIcon.bind(this));    
    html.find("a.showInfo").click(this._showInfo.bind(this));

  }

  /** ******************************************
   *  EVENTS
   ****************************************** */
  _setQuickBar(quickBar) {
    return (quickBar === 'false') ? false : 
           (quickBar === 'true') ? true :
            quickBar;
  }
  _showQuickBar(event) {
    event.preventDefault();
    this.actor.system.quickBar = this._setQuickBar(this.actor.system.quickBar);

    let bQuickBar = !this.actor.system.quickBar;
    this.actor.update({
      system:{ quickBar: bQuickBar,
               quickBarPosition: {
                x: this.actor.sheet.position.left + 18,
                y: this.actor.sheet.position.top + 18
              }}
    });
  }

  _moveQuickBar(event) {
    event.preventDefault();
    let hSheet = $('.app.window-app.conventum.sheet.actor');
    let quickBar = $(event.target);
    let posX = hSheet.position().left + quickBar.position().left;
    let posY = hSheet.position().top + quickBar.position().top;
    
    this.actor.update({
      system: {quickBarPosition: {
        x: posX,
        y: posY,
        sheetX: hSheet.position().left,
        sheetY: hSheet.position().top
      }}
    });
  }

  _openTabActions(event) {
    event.preventDefault();
    this.actor.sheet._tabs[0].activate('combat');
    this.actor.sheet._tabs[2].activate('combatActions');
  }

  _openTabWeapons(event) {
    event.preventDefault();
    this.actor.sheet._tabs[0].activate('combat');
    this.actor.sheet._tabs[2].activate('combatWeapons');    
  }

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

  _showMyItem(event) {
    event.preventDefault();
    const itemId = event.currentTarget?.dataset.itemid;
    const item = (itemId) ? this.actor.items.get(itemId) : null;
    if (!item) return;
    item.sheet.render(true, {
      editable: game.user.isGM
    });    
  }

  _showItem(event) {
    event.preventDefault();
    const itemId = event.currentTarget?.dataset.itemid;
    const item = game.items.get(itemId);
    if (!item) return;
    item.sheet.render(true, {
      editable: game.user.isGM
    });    
  }  

  _diceSkill(event) {
    event.preventDefault();
    const skillId = event.currentTarget?.dataset.itemid;
    const actionId = event.currentTarget?.dataset.actionid;
    const sFormula = event.currentTarget?.dataset.formula;
    const skillItem = game.packs.get('conventum.skills').get(skillId);
    if (!skillItem) return;
    const skill = this.actor.system.skills[skillId];
    if (!skill) return;
    const sPath = 'skills.'+skillId;
    helperRolls.rollDices(this.actor, sPath, true, sFormula, actionId);
  }

  _playWeapon(event) {
    event.preventDefault();
    const weaponId = event.currentTarget?.dataset.itemid;
    if (!weaponId) return;

    const actorActions = helperActions.getActions(this.actor);
    const actorTargets = helperActions.getTargets(this.actor);

    if (!actorActions.showPoster) return;
      helperSheetCombat.selectTargetsAndPlayWeapon(this.actor, actorActions.action, weaponId);

  }

  _weaponHand(event) {
    event.preventDefault();
    const itemId = event.currentTarget?.dataset.itemid;
    const sHand = event.currentTarget?.dataset.hand;
    helperSheetCombat.setHandWeapon(this.actor, itemId, sHand);
  }

  _doAction(event) {
    event.preventDefault();
    const actionId = event.currentTarget?.dataset.itemid;    
    const action = this.actor.items.get(actionId);
    if (!action) return;

    helperSheetCombat.doAction(this.actor, actionId);
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

  async _actionIcon(event) {
    event.preventDefault();
    const itemId = event.currentTarget?.dataset.itemid,
          action = event.currentTarget?.dataset.action;
    const item = (itemId) ? this.actor.items.get(itemId) : null;
    if (!item) return;

    if (action === 'show')
      item.sheet.render(true, {
        editable: game.user.isGM
      });
    if (action === 'delete')
      item.delete();

  }

  // _showInfo
  _showInfo(event) {
    event.preventDefault();
    const s18n = event.currentTarget?.dataset.i18n;
    new Dialog({
      title: 'Info',
      content: game.i18n.localize(s18n),
      buttons: [] }).render(true);        
  }    

}
