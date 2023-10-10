/**
 * @extends {ActorSheet}
 */

import { mainBackend } from "../backend/mainBackend.js";
import { helperSheetHuman } from "../helpers/helperSheetHuman.js";
import { helperSheetArmor } from "../helpers/helperSheetArmor.js";
import { helperSheetCombat } from "../helpers/helperSheetCombat.js";
import { helperSheetMagic } from "../helpers/helperSheetMagic.js";
import { helperRolls } from "../helpers/helperRolls.js";
import { helperActions } from "../helpers/helperActions.js";
import { HookActor } from "../../hooks/_hooksActor.js";
import { HookCompendium } from "../../hooks/_hooksCompendium.js";
import { mainUtils } from "../../mainUtils.js";
import { aqCombat } from "../../actions/aqCombat.js";
import { aqContext } from "../../actions/aqContext.js";
import { aqActions } from "../../actions/aqActions.js";

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
      height: 620,
      tabs: [
        {navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main"},
        {navSelector: ".tabs_Bio", contentSelector: ".tabsContent_Bio", initial: "languages"},
        //{navSelector: ".tabs_Combat", contentSelector: ".tabsContent_Combat", initial: "combatWeapons"},
        {navSelector: ".tabs_Items", contentSelector: ".tabsContent_Items", initial: "items"}
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
    context.systemData = this.actor.getRollData();
    
    //World...
    await helperSheetHuman.checkWorld(context.systemData);
    
    //Backend && Background...
    context.backend = await mainBackend.getBackendForActor(this.actor, context.systemData);
    
    //Wizard
    helperSheetHuman.askForWizard(this.actor, context.systemData);

    //Criatures... 
    helperSheetHuman.criatures(this.actor, context.systemData, context.backend);

    //Checking data...
    await helperSheetHuman.checkSystemData(this.actor, context.systemData, context.backend);
    
    //Custo...
    context.custo = await helperSheetHuman.getCusto(context.systemData, context.backend);

    //Traits...
    context.traits = this.actor.items.filter(e=>e.type === 'trait');

    //Bio extend info...
    context.bioInfo = await helperSheetHuman.getBioInfo(context.systemData, context.backend);

    //Modes...
    if (!context.systemData.modes.length) {
      context.systemData.modes = [];
      this.actor.update({
        system: { modes: []}
      });
    }
    context.modes = await helperSheetHuman.getModes(this.actor, context);

    //Skills...
    await helperSheetHuman.getSkills(this.actor, context);
    context.systemData.modes = this.actor.system.modes;

    //Languages...
    helperSheetHuman.getLanguages(this.actor, context);
    context.systemData.modes = this.actor.system.modes;

    //Armor...
    helperSheetArmor.setLocations(this.actor, context.systemData);

    //Combat
    context.combats = helperSheetCombat.getActorCombats(this.actor);
    context.combatBackend = helperSheetCombat.getActorCombatBackend(this.actor);

    //Im Master..
    context.imMaster = game.user.isGM;

    //Playing actions...
    context.actions = helperActions.getActions(this.actor, 
                                               this.actor.isToken ? this.actor.token.id : null );
    context.actionsItems = this.actor.items.filter(e => e.type === 'action').sort((a, b) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      return 0;
    });

    //Targets...
    context.targets = helperActions.getTargets(this.actor);

    //Magic...
    context.magic = await helperSheetMagic.getMagic(this.actor, context.systemData);
    helperSheetMagic.getMagicPenals(this.actor, context.systemData);
    context.codex = helperSheetMagic.codex(this.actor);
    
    //Checking Items..
    helperSheetHuman.checkMyItems(this.actor, context.systemData);
    helperSheetHuman.itemsInUse(this.actor, context.systemData);

    //Quick Bars...
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
    
    $("li.boxSkill:first-child").hover(
      function() {
        $(".crest").hide();
        $(".modeStickers").hide();
      }, function() {
        $(".crest").show();
        $(".modeStickers").show();
      }
    );

    /* Wizard */
    html.find(".wizardOption").click(this._wizardOption.bind(this));
    html.find(".wizardDices").click(this._wizardDices.bind(this));
    html.find("a._wizardButton").click(this._wizardSelect.bind(this));
    html.find("a._goingBack").click(this._goingBack.bind(this));
    html.find("a.wizardNextStep").click(this._wizardNextStep.bind(this));
    html.find("a.wzGender").click(this._wzGender.bind(this));
    html.find("input._changeWzLanguage").change(this._changeWzLanguage.bind(this));

    /* Misc */
    html.find("._showQuickBar").click(this._showQuickBar.bind(this));
    if (html.find("._quickBar").length > 0) {
        html.find("._quickBar").draggable();
        html.find("._quickBar").bind('dragstop', this._moveQuickBar.bind(this));      
    }
    html.find("._quickButtonAction").click(this._openTabActions.bind(this));
    html.find("._quickButtonWeapons").click(this._openTabWeapons.bind(this));
    html.find("a._bookmark").click(this._changeBookmark.bind(this));

    /* Characteristics */
    html.find("._diceCharacteristic").click(this._diceCharacteristic.bind(this));
    html.find("._diceSecondary").click(this._diceSecondary.bind(this));
    html.find("._activeLuck").click(this._activeLuck.bind(this));
    html.find("a._showMode").click(this._showMode.bind(this));
    
    /* Traits */
    html.find("._traitShow").click(this._traitShow.bind(this));
    html.find("._traitDel").click(this._traitDelete.bind(this));
    
    /* Languages */
    html.find(".playLang").click(this._playLang.bind(this)); 

    /* Skills */
    html.find("._tileIcon").click(this._gridSkills.bind(this));
    html.find(".playSkill").click(this._playSkill.bind(this));
    html.find("a.diceSkill").click(this._playSkill.bind(this)); 
    html.find("a._skillInfo").click(this._skillInfo.bind(this)); 
    html.find("a.experienceSkill").click(this._experienceSkill.bind(this)); 
    $(".searchSkill").on('input', this._searchSkill.bind(this));

    /* Weapons & actions*/
    html.find("a.playCombatSkill").click(this._playCombatSkill.bind(this));  
    html.find("a.playWeapon").click(this._playWeapon.bind(this));  
    html.find("a._whyThisPercent").click(this._whyThisPercent.bind(this));  
    html.find("a.playWeaponExpress").click(this._playWeaponExpress.bind(this)); 
    html.find("a.playMovement").click(this._playMovement.bind(this));
    html.find("a.showRejectInfo").click(this._showRejectInfo.bind(this));
    html.find(".weaponHand").click(this._weaponHand.bind(this));  
    html.find("a._encounterInfo").click(this._showItem.bind(this));
    html.find("a._cardInfo").click(this._showMyItem.bind(this));  
    html.find("a._showMyItem").click(this._showMyItem.bind(this));  
    html.find("a._doAction").click(this._doAction.bind(this)); 
    html.find("a._sheetExpand").click(this._sheetExpand.bind(this)); 
    $(".searchAction").on('input', this._searchAction.bind(this));

    /* Magic */
    document.addEventListener('DOMContentLoaded', helperSheetMagic.initCodex(this));
    html.find("a.playSpell").click(this._playSpell.bind(this));  
    html.find(".flipped ._clickable").click(helperSheetMagic.changePage.bind(this));      
    html.find("input._coInput").change(this._changePenalInput.bind(this));  

    /* Armor */
    html.find("a.locationShield").click(helperSheetArmor.openArmorCloset.bind(this));
    html.find(".closeArmorCloset").click(helperSheetArmor.closeCloset.bind(this));
    html.find(".armorGarment").click(this._wearGarment.bind(this));
    html.find(".unwearArmor").click(this._unwearGarment.bind(this));
    html.find("._garmentLabel").mouseover(this._showArmorPieceInfo.bind(this));
    html.find("._garmentLabel").mouseout(this._hideArmorPieceInfo.bind(this));   
    html.find("._armorUpdateValue").change(this._updateArmorValue.bind(this));
    html.find("._armorShrinkValue").change(this._armorShrinkValue.bind(this));

    /* Items */
    html.find("a.actionIcon").click(this._actionIcon.bind(this));    
    html.find("a.showInfo").click(this._showInfo.bind(this));
    html.find("a.showmyHorse").click(this._showMyHorse.bind(this));
    html.find("a.synchActions").click(this._synchActions.bind(this));

    /* Modes */
    html.find("a._showBarModes").click(this._showBarModes.bind(this)); 
    html.find("a._closeModesBar").click(this._hideBarModes.bind(this)); 
    html.find("a._mode").click(this._playMode.bind(this));    

    if ( !this.isEditable ) return;

  }

  /** ******************************************
   *  EVENTS
   ****************************************** */

  async _wizardOption(event) {
    event.preventDefault();
    const sField = event.currentTarget?.dataset.field;
    const sValue = event.currentTarget?.dataset.value;
    const sCompendium = event.currentTarget?.dataset.compendium;

    if (sField === 'world') helperSheetHuman.wz_UpdateWorld(this.actor, sValue);
    else {
      const item = await (game.packs.get('conventum.'+sCompendium)).getDocument(sValue);
      item.sheet.render(true, {
        editable: false //game.user.isGM
      }); 
      item.sheet._tabs[0].active = 'description';         
    }

  }

  _wizardDices(event) {
    event.preventDefault();
    const sField = event.currentTarget?.dataset.field;   
    const sCompendium = event.currentTarget?.dataset.compendium;
    helperSheetHuman.wz_Dices(this.actor, sField, sCompendium);
  }

  _wizardSelect(event) {
    event.preventDefault();
    const target = $(event.currentTarget).parent()[0];
    const sField = target?.dataset.field;
    const sValue = target?.dataset.value;    
    const sCompendium = target?.dataset.compendium;
    helperSheetHuman.wz_Select(this.actor, sField, sValue, sCompendium);
  }

  _goingBack(event) {
    event.preventDefault();
    helperSheetHuman.wz_goingBack(this.actor);
  }

  _wizardNextStep(event) {
    event.preventDefault();
    const target = $(event.target).parent()[0];
    helperSheetHuman.wz_nextStep(this.actor, target?.dataset.step, target?.dataset.field);    
  }

  _wzGender(event) {
    event.preventDefault();
    const sGender = event.currentTarget?.dataset.gender;    
    helperSheetHuman.wz_setGender(this.actor, (sGender === "female"));        
  }

  _changeWzLanguage(event) {
    event.preventDefault();
    const sId = event.currentTarget?.dataset.id;
    const sType = event.currentTarget?.dataset.type;
    helperSheetHuman._changeWzLanguage(this.actor, sId, sType);
  }

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

  _changeBookmark(event) {
    event.preventDefault();
    const sBook = event.currentTarget?.dataset.tab;   
    if (sBook === 'magic') HookActor.onFirePage(this.actor.sheet);
                      else HookActor.outFirePage(this.actor.sheet);
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
      editable: game.user.isGM
    });
  }

  _traitDelete(event) {
    event.preventDefault();
    const itemId = event.currentTarget?.dataset.itemid;
    const item = (itemId) ? this.actor.items.get(itemId) : null;
    if (!item) return;  
    item.delete();
  }

  _sheetExpand(event) {
    event.preventDefault();
    const sProperty = event.currentTarget?.dataset.expand;
    const bValue = (event.currentTarget?.dataset.visible === 'true');
    let data = {sheet: {}};
        data.sheet[sProperty] = bValue;
    this.actor.update({system: data});
  }

  _showMyItem(event) {
    event.preventDefault();
    const itemId = event.currentTarget?.dataset.itemid;
    const item = (itemId) ? this.actor.items.get(itemId) : null;
    if (!item) return;
    item.sheet.render(true, {
      editable: game.user.isGM
    }); 
    item.sheet._tabs[0].active = 'description';   
  }

  _showItem(event) {
    event.preventDefault();
    const itemId = event.currentTarget?.dataset.itemid;
    const item = game.items.get(itemId);
    if (!item) return;
    item.sheet.render(true, {
      editable: game.user.isGM
    });    
    item.sheet._tabs[0].active = 'description';
  }  

  _diceCharacteristic(event) {
    event.preventDefault();
    const charId = event.currentTarget?.dataset.char;
    helperRolls.rollChararacteristic(this.actor, charId);
  }

  _diceSecondary(event) {
    event.preventDefault();
    const charId = event.currentTarget?.dataset.char;
    helperRolls.rollSecondary(this.actor, charId);
  }  

  _activeLuck(event) {
    event.preventDefault();
    helperActions.setLuck(this.actor);
  }

  async _playLang(event) {
    event.preventDefault();
    const langId = event.currentTarget?.dataset.itemid;

    await HookCompendium.frequent();
    const langItem = await game.packs.get('conventum.languages').get(langId);
    
    if (!langItem) return;
    const language = this.actor.system.languages[langId];
    if (!langItem) return;
    const sPath = 'languages.'+langId;
    helperRolls.rollDices(this.actor, sPath, true, '', null);

  }

  async _showMode(event) {
    event.preventDefault();
    await HookCompendium.frequent();
    const modeId = event.currentTarget?.dataset.itemid;
    const item = await game.packs.get('conventum.modes').get(modeId);
    item.sheet.render(true, {
      editable: false
    });
    item.sheet._tabs[0].active = 'description';
  }

  async _playSkill(event) {
    event.preventDefault();
    const skillId = event.currentTarget?.dataset.itemid;
    const actionId = event.currentTarget?.dataset.actionid;
    const sFormula = event.currentTarget?.dataset.formula;

    await HookCompendium.frequent();
    const skillItem = await game.packs.get('conventum.skills').get(skillId);
    
    if (!skillItem) return;
    const skill = this.actor.system.skills[skillId];
    if (!skill) return;
    const sPath = 'skills.'+skillId;
    helperRolls.rollDices(this.actor, sPath, true, sFormula, actionId, skill);
  }

  async _skillInfo(event) {
    event.preventDefault();
    const skillId = event.currentTarget?.dataset.itemid;
    await HookCompendium.frequent();

    const item = await game.packs.get('conventum.skills').get(skillId);
    item.sheet.render(true, {
      editable: game.user.isGM
    });
    item.sheet._tabs[0].active = 'description';            
  }

  async _experienceSkill(event) {
    event.preventDefault();
    const skillId = event.currentTarget?.dataset.itemid;
    let oData = {system: {skills: {}}};
    oData.system.skills[skillId] = {experienced: 
          !this.actor.system.skills[skillId].experienced };
    await this.actor.update(oData);   
  }

  _gridSkills(event) {
    event.preventDefault();
    const sMode = event.currentTarget?.dataset.mode;
    this.actor.update({
      system: {control: { listSkills: (sMode === 'list')}}
    });

  }

  _searchSkill(event) {
    event.preventDefault();
    const search = $(event.target).val();
    const sSelect = (this.actor.system.control.listSkills) ?
                        ".listSkill li.rowSkill" :
                        ".wrapSkill li.boxSkill";

    $(sSelect).each(function(i,e) {
      if ($(e).data("filter").toUpperCase().includes(search.toUpperCase()))
        $(e).show();
      else
        $(e).hide();
      if (search === '') $(e).show();
    }.bind(this));    

  }

  _playMovement(event) {
    event.preventDefault();
    const skillId = event.currentTarget?.dataset.itemid;
    const actionId = event.currentTarget?.dataset.actionid;
    const sFormula = event.currentTarget?.dataset.formula;

    if (skillId !== '') {
      
    }
  }

  _showRejectInfo(event) {
    event.preventDefault();

    const weaponId = event.currentTarget?.dataset.weaponid;
    const weapon = this.actor.items.get(weaponId);
    const actorId = this.actor.id;
    const tokenId = (this.actor.isToken) ? this.actor.token.id : null;
    const action = aqActions.getCurrentAction(actorId, tokenId);

    const info = aqCombat.checkActionWeapon(action, weapon, this.actor);
    new Dialog({
      title: 'Info',
      content: info.descr,
      buttons: [] }).render(true);
  }

  async _playCombatSkill(event) {
      event.preventDefault();
      const actorActions = helperActions.getActions(this.actor);
      if (!actorActions.showPoster) return;
      const uniqeId = (this.actor.isToken) ? this.actor.token.id : this.actor.id;

      if (actorActions.action.system.target.forceSelection) {
          aqCombat.dialogTargets(uniqeId, null);
      } else {
          aqCombat.prePlayWeapon(uniqeId, null);
          //aqCombat.playCombatSkill(uniqeId);
      }
  }

  _whyThisPercent(event) {
    event.preventDefault();

    const uniqeId = (this.actor.isToken) ? this.actor.token.id : this.actor.id;

    const weaponId = event.currentTarget?.dataset.weaponid;
    if (!weaponId) return;
    const weapon = this.actor.items.get(weaponId);
    
    const actorActions = helperActions.getActions(this.actor);
    if (!actorActions.showPoster) {
        new Dialog({
          title: game.i18n.localize("common.details"),
          content: aqCombat.checkActionWeapon(null, weapon, this.actor).descr,
          buttons: {} }).render(true);       
        return;
    }
    const action = actorActions.action;

    let auxContext = new aqContext({actorId: this.actor.id, 
                                    tokenId: (this.actor.isToken) ? this.actor.token.id : '',
                                    weaponId: weaponId,
                                    simulate: true});
    auxContext.prepareContext(true);    
    let mHistory = auxContext._history;
    let sHistory = '';
    mHistory.map(s => {sHistory += '<li>'+s+'</li>';})

    let weaponEval = aqCombat.checkActionWeapon(action, weapon, this.actor);

    let oButtons = {};
    if (weaponEval.check) {
      oButtons[weaponId] = {
        label: game.i18n.localize("common.playWeapon"),
        callback: async () => {
          aqCombat.dialogTargets(uniqeId, weaponId);
        }
      }      
    } else {
      sHistory += '<li class="_noPossible">'+weaponEval.descr+'</li>';
    }

    sHistory = '<ul class="_dialogHistory">'+sHistory+'</ul>';

    new Dialog({
      title: game.i18n.localize("common.details"),
      content: sHistory,
      buttons: oButtons }).render(true);      
  }

  _playWeapon(event) {
    event.preventDefault();
    const weaponId = event.currentTarget?.dataset.itemid;
    if (!weaponId) return;

    const actorActions = helperActions.getActions(this.actor);

    if (!actorActions.showPoster) return;
    const uniqeId = (this.actor.isToken) ? this.actor.token.id : this.actor.id;
    aqCombat.prePlayWeapon(uniqeId, weaponId);
    //aqCombat.dialogTargets(uniqeId, weaponId);
  }

  _playWeaponExpress(event) {
    event.preventDefault();
    const weaponId = event.currentTarget?.dataset.itemid;
    if (!weaponId) return;

    const uniqeId = (this.actor.isToken) ? this.actor.token.id : this.actor.id;
    aqCombat.dialogTargetsExpress(uniqeId, weaponId);
  }  

  _weaponHand(event) {
    event.preventDefault();
    const itemId = event.currentTarget?.dataset.itemid;
    const sHand = event.currentTarget?.dataset.hand;
    helperSheetCombat.setHandWeapon(this.actor, itemId, sHand);
  }

  _doAction(event) {
    event.preventDefault();
    HookCompendium.frequent();
    const actionId = event.currentTarget?.dataset.itemid;    
    const action = this.actor.items.get(actionId);
    if (!action) return;
    aqCombat.addAction(this.actor.id, 
                       actionId, 
                       this.actor.isToken, 
                       this.actor.isToken ? this.actor.token.id : null);
  }

  _searchAction(event) {
    event.preventDefault();
    const search = $(event.target).val();
    $("ul.boxActions li").each(function(i,e) {
      if ($(e).data("filter").toUpperCase().includes(search.toUpperCase()))
        $(e).show();
      else
        $(e).hide();
      if (search === '') $(e).show();
    }.bind(this));    
  }

  _playSpell(event) {
    event.preventDefault();
    const spellId = event.currentTarget?.dataset.itemid;
    if (!spellId) return;
    const bFromCodice = (event.currentTarget?.dataset.from === 'codice');

    const uniqeId = (this.actor.isToken) ? this.actor.token.id : this.actor.id;
    helperSheetMagic.playSpell(this.actor, spellId);
    //if (bFromCodice)  
    //  this.actor.sheet.close();
  }

  _changePenalInput(event) {
    event.preventDefault();
    this.updateMagic = true;
  }

  async _wearGarment(event) {
    event.preventDefault();
    const itemId = event.currentTarget?.dataset.itemid;
    await helperSheetArmor.wearGarment(this.actor, itemId).then(() => {
          mainUtils.delay(500).then(() => this.actor.sheet.render(true));
    });
    
  }

  async _unwearGarment(event) {
    event.preventDefault();
    const itemId = $($(event.currentTarget).parents("ol.armorCloset")).data("currentitem");
    await helperSheetArmor.unwearGarment(this.actor, itemId).then(() => {
          mainUtils.delay(500).then(() => this.actor.sheet.render(true));
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

  async _armorShrinkValue(event) {
    event.preventDefault();
    const value = Number($(event.target).val());
    const sId = event.currentTarget?.dataset.itemid;
    const sProperty = event.currentTarget?.dataset.property;
    
    let item = this.actor.items.get(sId);
    if (!item) return;
    
    //Updating value
    let modUpdated = {};
    modUpdated[sProperty] = value;
    const updated = await Item.updateDocuments([{ 
      _id: item.id,
      system: modUpdated}], {parent: this.actor});

    //Updating locations
    let modLocations = {};
    for (var s in this.actor.system.armor) {
      if (this.actor.system.armor[s].itemID === sId) {
        modLocations[s] = {};
        modLocations[s][sProperty] = value;
      }
    }
    await this.actor.update({system: { armor: modLocations }});

  }

  async _updateArmorValue(event) {
    event.preventDefault();
    const value = Number($(event.target).val());
    const locationId = event.currentTarget?.dataset.locationid;
    const sProperty = event.currentTarget?.dataset.property;

    const itemId = this.actor.system.armor[locationId].itemID;
    if (!itemId) return;

    let item = this.actor.items.get(itemId);

    let modUpdated = {};
        modUpdated[sProperty] = value;    
    await Item.updateDocuments([{ 
      _id: item.id,
      system: modUpdated}], {parent: this.actor});

    //Updating locations
    let modLocations = {};
    for (var s in this.actor.system.armor) {
      if (this.actor.system.armor[s].itemID === itemId) {
        modLocations[s] = {};
        modLocations[s][sProperty] = value;
      }
    }
    await this.actor.update({system: { armor: modLocations }});  
    this.actor.sheet.render(true);    
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
      item.sheet._tabs[0].active = 'description';
    if (action === 'delete') {
      if (item.type === 'armor') {
        helperSheetArmor.destroyArmor(this.actor, item.id, true);
        return;
      }
      Item.deleteDocuments([item.id], {parent: this.actor});
    }

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

  //_showMyHorse
  _showMyHorse(event) {
     event.preventDefault();
     const sHorseId = event.currentTarget?.dataset.horse;
     game.actors.get(sHorseId).sheet.render(true);
  }

  //_synchActions
  async _synchActions(event) {
    event.preventDefault();
    for (let item of Array.from(this.actor.items).filter(e => (e.type === 'action'))) {
       await item.delete();
    }
  }

  // _showBarModes
  _showBarModes(event) {
    event.preventDefault();
    $('._modesBar').toggle();
  }

  // _hideBarModes
  _hideBarModes(event) {
    event.preventDefault();
    $('._modesBar').toggle();
  }  

  // _playMode
  async _playMode(event) {
    event.preventDefault();
    const modeId = event.currentTarget?.dataset.modeid;

    await HookCompendium.frequent();
    const mode = await game.packs.get('conventum.modes').get(modeId);
    helperActions.playMode(this.actor, mode);
  }

}
