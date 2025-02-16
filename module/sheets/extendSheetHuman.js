import { helperSheets } from "../helpers/helperSheets.js";
import { helperCombat } from "../helpers/helperCombat.js";
import { helperAction } from "../helpers/helperAction.js";
import { helperWeapon } from "../helpers/helperWeapon.js";
import { helperMagic } from "../helpers/helperMagic.js";
import { helperArmor } from "../helpers/helperArmor.js";
import { helperUtils } from "../helpers/helperUtils.js";
import { helperBackend } from "../helpers/helperBackend.js";
//import { pixiSheet } from "../objects/pixiSheet.js";
import { backSheet } from "../objects/backSheet.js";
import { backMagic } from "../objects/backMagic.js";
import { grimoire } from "../objects/grimoire.js";

/**
 * @extends {ActorSheet}
 */
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
      width: 450,
      height: 450,
      tabs: [
        {navSelector: ".tabs_ActorMenu", contentSelector: ".tabs_ActorContent", initial: "main"},
        {navSelector: ".tabs_CombatMenu", contentSelector: ".tabs_CombatContent", initial: "myCombat"},
        {navSelector: ".tabs_MyCombatMenu", contentSelector: ".tabs_MyCombatContent", initial: "weapons"},
        {navSelector: ".tabs_EquipmentMenu", contentSelector: ".tabs_EquipmentContent", initial: "equipment"},
        {navSelector: ".tabs_MagicMenu", contentSelector: ".tabs_MagicContent", initial: "vis"},
        {navSelector: ".tabs_ListMagicMenu", contentSelector: ".tabs_ListMagicContent", initial: "list"},
      ],
    });
  }

  /**
   * Context Sheet...
   * @inheritdoc
   * @returns {object} - Context
   */
  async getData() {    

    //RollData...
    const context = await super.getData();
    context.systemData = this.actor.getRollData();
    context.isGM = game.user.isGM;
    context.path = '/systems/'+game.system.id;

    //Directs 
    helperSheets.checkData(context);

    //Back 
    const oBackSheet = new backSheet(this.actor, context, this);
    await oBackSheet.init();
    const oBackMagic = new backMagic(this.actor, context, this);
    await oBackMagic.init();
    
    return context;
  }

  /**
   * Sheet events Listeners...
   * @inheritdoc
   * @param {html} html
   */
  activateListeners(html) {
    super.activateListeners(html);

    this._windowApp = $(this.actor.sheet.form).parents('.window-app');
    this._form = $(this.actor.sheet.form);

    this._afterRender();
    this._uiHandlers();

    /** General... */
    html.find("._option i").click(this._clickOption.bind(this));
    html.find("._option").change(this._changeOption.bind(this));
    html.find("a._frameButton").click(this._frameButton.bind(this));
    html.find("._ordo._frameButton").click(this._frameButton.bind(this));
    html.find("a._actionButton").click(this._frameButton.bind(this));
    html.find("a._frameButton i").before().click(this._frameButton.bind(this));
    html.find("._contextButton").contextmenu(this._frameRightButton.bind(this));

    html.parents('.window-app.sheet.actor').click(this._focusMe.bind(this));
    html.find("a._closeSheet").click(helperSheets.onCloseSheetContent.bind(this));
    html.find("a._shortSheet").click(helperSheets.onShortSheetContent.bind(this));
        
    /** Actor... */
    html.find('._mainPortrait').click(this._changePortrait.bind(this));
    html.find('input[name="system.secondaries.rr.value"]').change(this._changeRationality.bind(this));
    html.find('input[name="system.secondaries.irr.value"]').change(this._changeRationality.bind(this));
    html.find("input#pseudoHits").change(this._changePseudoHits.bind(this));
    html.find('#selectLoreRules').change(this._changeLoreRules.bind(this));
    html.find('._octagonIcon').click(this._clickOctagonSwitch.bind(this));
    html.find('._handlerOctagon input._value').change(this._changeCharOctoValue.bind(this));
    html.find('._actorCharacteristics input._value').change(this._changeCharValue.bind(this));
    html.find('._actorCharacteristics input._mod').change(this._changeCharMod.bind(this));
    html.find('input._updater').change(this._changeUpdaterInput.bind(this));
    html.find('._clickItem').click(this._clickItem.bind(this));    
    html.find('._addMode').click(this._addMode.bind(this));    

    /** Skills... */
    html.find('#skillSearch').change(this._changeSkillSearch.bind(this));
    html.find("a._learned").click(this._learned.bind(this));
    html.find("a._favorite").click(this._favorite.bind(this));
    html.find("a._primary").click(this._primary.bind(this));
    html.find("a._secondary").click(this._secondary.bind(this));
    html.find("a._patern").click(this._patern.bind(this));

    /** Combat... */
    html.find("._combat ._header input._title").change(this._changeEncounterName.bind(this));
    html.find("._combatTable ._field input._mod").change(this._changeInitiativeMod.bind(this));
    if (($('._stepsBarWrap').length > 0) && (game.user.isGM)) {
      $('._stepsBarWrap').sortable({
        item: '._stepsBarWrap ._step',
        cursor: 'pointer',
        axis: 'y',
        stop: helperCombat.dropTurn.bind(this)
      });
    } else {
      $('._stepsBarWrap ._step').css({'cursor': 'default'})      
      $('._stepsBarWrap ._step label').css({'cursor': 'default'})      
    }
    html.find("._stepsBarWrap ._step").click(this._frameButton.bind(this));
    html.find("._actionDiagram ._action").click(this._navTo.bind(this));
    html.find("a._navTo").click(this._navTo.bind(this));
    html.find("#combatCustoMod").change(this._changeCombatCustoMod.bind(this));
    html.find("#combatCustoModOppo1").change(this._changeCombatCustoModOppo.bind(this));
    html.find("#combatCustoModOppo2").change(this._changeCombatCustoModOppo.bind(this));
    html.find("#combatCustoModAnti").change(this._changeCombatCustoMod.bind(this));
    html.find("#combatCustoLocation").change(this._changeCombatLocation.bind(this));

    /** Armor... */
    html.find("._armorSection").click(this._frameButton.bind(this));

    /** ENTER Key */
    /*
    $(document).on('keypress',function(event) {
      if(event.which == 13) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
    */

    if ( !this.isEditable ) return;

  }

  /** ----------------------------------------------------------------------------------------------------------------
   *  EVENTS...
   ---------------------------------------------------------------------------------------------------------------- */
  
   /**
    * _showHide
    * @param {*} event 
    */
   _showHide(event) {
      event.preventDefault();
      event.stopPropagation();

      const noHided = $(event.currentTarget).find('._noHided');
      const hided = $(event.currentTarget).find('._hided');

      noHided.fadeOut('normal', function() {
        hided.fadeIn();
      });
   }

   /**
    * _hideShowed
    * @param {*} event 
    */
   _hideShowed(event) {
      event.preventDefault();
      event.stopPropagation();

      const noHided = $(event.currentTarget).find('._noHided');
      const hided = $(event.currentTarget).find('._hided');

      hided.fadeOut('normal', function() {
        noHided.fadeIn();
      });
   }   

  /**
   * _frameButton
   * @param {*} event 
   */
  _frameButton(event) {
    event.preventDefault();
    let target = event.currentTarget;
    if ($(event.target).hasClass('fas')) target = event.currentTarget.parentElement;
    
    const sAction = target?.dataset.action;
    const sItemId = target?.dataset.itemid;
    const sLocation = target?.dataset.location;

    switch(sAction) {
      case 'showItem':      //Open actor item
        this.actor.items.find(e => e.id === sItemId)?.sheet.render(true);
      break;
      case 'deleteItem':    //Delete actor item
        Item.deleteDocuments([sItemId], {parent: this.actor});
      break;   
      case 'deleteAll':     //Delete all items
        helperSheets.deleteAllItems(this.actor, target?.dataset.type);
      break;
      case 'addItemLore':   //Add lore items
        helperSheets.createLoreItem(this.actor, target?.dataset.target);
      break;
      case 'deleteLoreItem':    //Delete lore item
        helperSheets.deleteLoreItem(this.actor, this.actor.items.get(sItemId));
      break;      
      case 'deleteMode': //Delete Mode
        helperSheets.deleteMode(this.actor, target?.dataset.index);
      break;
      case 'createCombat':  //Create new combat
        helperCombat.createEmptyCombat();
      break;
      case 'changeCombat':  //Change next.prev combat
        helperCombat.changeCombat(target?.dataset.flow);
      break;
      case 'deleteCombat':  //Delete current combat
        helperCombat.deleteCombat();
      break; 
      case 'addCombatant':  //Add combatants  
        helperCombat.dialogAddCombatant();
      break;      
      case 'deleteCombatant':  //Delete combatant from current Combat   
        helperCombat.deleteCombatant(target?.dataset.target);
      break;
      case 'rollInitiative':  //Roll combatant initiative
        helperCombat.rollInitiative(target?.dataset.target);
      break;      
      case 'resetInitiatives':  //Restarts combatant initiative
        helperCombat.resetInitiatives();
      break;
      case 'resetAttributes': //Reset all attributes
        helperSheets.resetAttributes(this.actor);
      break;
      case 'changeRound':  //Change round
        helperCombat.changeRound(target?.dataset.flow);
      break;    
      case 'selectCombatant':  //Select action
        helperAction.dialogSelectCombatant(this.actor);
      break;    
      case 'setTurn':  //Select action
        helperCombat.setTurn(this.actor, target?.dataset.id);
      break;          
      case 'selectAction':  //Select action
        helperAction.dialogSelectAction(this.actor);
      break;     
      case 'addTurn':  //Adding new Turn to encounter
        helperCombat.addTurn(this.actor);
      break;       
      case 'deleteTurn':  //Delete Turn of encounter
        helperCombat.deleteTurn(target?.dataset.id);
      break; 
      case 'inactiveTurn':  //Inactivate Turn of encounter
        helperCombat.activeTurn(target?.dataset.id, false);
      break;   
      case 'activeTurn':  //Activate Turn of encounter
        helperCombat.activeTurn(target?.dataset.id, true);
      break;                         
      case 'orderStepsBar':  //Order steps
        helperCombat.orderStepsBar($(target).parents('section.window-content'));
      break;      
      case 'dialogSelectWeapon':  //Select weapon
        let oActor = this.actor;
        let bFromCombat = !!target?.dataset.contexttarget;
        if (target?.dataset.contexttarget) {
          oActor = game.combat.combatants.get(target?.dataset.contexttarget)?.actor;
        }
        helperWeapon.dialogSelectWeapon(oActor, bFromCombat);
      break;
      case 'addModifiers': //Add combat modifiers
        helperCombat.dialogAddModifiers(target?.dataset.stepid);
      break;
      case 'deleteCombatMod': //Delete combat modifiers
        helperCombat.deleteCombatModifier(target?.dataset.stepid, 
                                          target?.dataset.index);
      break;
      case 'showMods': //Show modifiers
        helperSheets.dialogShowModifiers(target?.dataset, false);
      break;    
      case 'showModsDamage': //Show Damage modifiers
        helperSheets.dialogShowModifiers(target?.dataset, true);
      break;       
      case 'applydamage': 
        helperSheets.applyDamage(target?.dataset.damagetarget, target?.dataset.damage,
                                 target?.dataset.stepid, target?.dataset.fluxid, 
                                 target?.dataset.subtarget === 'shield',
                                 target?.dataset.breakshield === 'true');
      break;
      case 'dialogSelectArmor':  //Select armor
        helperArmor.dialogSelectArmor(this.actor, sLocation);
      break;          
      case 'roll': //Roll
          //Avoiding propagation from the enter key...
          if (event.originalEvent.pointerType === '') return;
        helperSheets.roll(target?.dataset);
      break;     
      case 'compendium':  //Show compendiums
        helperSheets.openCompendium(sItemId);
      break;
      case 'importSkills':  //Import skills
        helperSheets.importSkills(this.actor);
      break;      
      case 'importActions': //Import actions
        helperSheets.importActions(this.actor);
      break;
      case 'summary': //See Item summary
        let combatant = game.combat?.combatants.get(target?.dataset.combatantid);
        if (!combatant) return;
        helperSheets.seeSummary(combatant.actor, sItemId);
      break;
      case 'grimoire': //Grimoire
        let grim = new grimoire({ actor: this._actor });
        grim.render();
      break;
      case 'learnSpell':      //Learn Spell
        helperMagic.dialogSelectSpell(this.actor, !(target?.dataset.ordo === 'true'), {
          learn: true,
          select: false,
          hideLearned: true
        });
      break;
      case 'learnOrdo':       //Learn Ordo
      helperMagic.dialogSelectOrdo(this.actor);        
      break;
      case 'unlearning':      //Unlearn spell
        helperMagic.unlearnSpell(this.actor);
      break;
      case 'unlearnOrdo':     //Unlearn ordo
        helperMagic.unlearnOrdo(this.actor, target?.dataset.level);
      break;
      case 'selectSpell':
        helperMagic.selectSpell(this.actor, sItemId, target?.dataset.cell);
      break; 
      case 'selectRitual':
        helperMagic.selectRitual(this.actor, target?.dataset.level);
      break;    
      case 'prepareSpell':    //Prepare spell
        helperMagic.prepareSpell(this.actor, target?.dataset.cell, target?.dataset.shape);
      break;
      case 'deactivateSpell':
        helperMagic.deactivate(this.actor, sItemId, target?.dataset.cell);
      break;
      case 'channelordo':
        helperMagic.channelOrdo(this.actor, target?.dataset.level);
      break;
    }    
  }

  /**
   * _navTo
   * @param {*} event 
   */
  _navTo(event) {

    event.preventDefault();
    let target = event.currentTarget?.dataset;
    let tab = this.actor.sheet._tabs.find(e => e._navSelector === target.selector);
    if (!tab) return;
    tab.activate(target.tab);

    if (target.subtab && target.subtab !== '') {
      let subtab = this.actor.sheet._tabs.find(e => e._navSelector === target.subselector);   
      if (!subtab) return;
      subtab.activate(target.subtab);         
    }

  }

  /**
   * _addMode
   * @param {*} event 
   */
  _addMode(event) {
    helperSheets.addMode(this.actor);
  }

  /**
   * _frameRightButton
   * @param {*} event 
   */
  _frameRightButton(event) {
    event.preventDefault();
    const sAction = event.currentTarget?.dataset.action,
          sTarget = event.currentTarget?.dataset.contexttarget,
          sItemID = event.currentTarget?.dataset.contextid;

    let combatant = null;
    let actor = null;

    switch(sAction) {
      case 'openCombatant':    //Open combatant Sheet
        combatant = game.combat?.combatants.get(sTarget);
        if (!combatant) return;
        this.actor.sheet.close(true);
        helperCombat.openCombatantSheet(combatant)
      break;
      case 'selectAction':        //Open action item
      case 'selectWeapon':        //Open weapon item
      case 'dialogSelectWeapon':  //Open weapon item
        combatant = game.combat?.combatants.get(sTarget);
        if (!combatant) return;
        combatant.actor.items?.get(sItemID).sheet.render(true);
      break;  
      case 'selectSkill':
        actor = helperUtils.getActor(event.currentTarget?.dataset.contextactor,
                                     event.currentTarget?.dataset.contexttoken);
        if (!actor) return;
        actor.items?.get(sItemID).sheet.render(true);
      break;    
    }
  }

  /**
   * _changeRationality
   * @param {*} event 
   */
  _changeRationality(event) {
    event.preventDefault();
    let sToModify = 'system.secondaries.';
    sToModify += $(event.currentTarget).attr('name').split('.')[2] === 'rr' ? 'irr.value' : 'rr.value';
    const nValue = 100 - Number($(event.currentTarget).val());
    $(this.actor.sheet.form).find('input[name="'+sToModify+'"]').val(nValue.toString());
  }

  /**
   * _changePseudoHits
   * @param {*} event 
   */
  async _changePseudoHits(event) {
      event.preventDefault();
      $(this.actor.sheet.form).find("input._hitPointsValue").val($(event.currentTarget).val());
      await this.actor.update({
              "system.secondaries.hits.value": $(event.currentTarget).val() });
      //this.actor.sheet.render(true);
  }

  /**
   * _changeLoreRules
   * @param {*} event 
   */
  _changeLoreRules(event) {
    event.preventDefault();
    helperSheets.deleteAllLoreItems(this.actor);
  }

  /**
   * _clickOctagonSwitch
   * @param {*} event 
   */
  async _clickOctagonSwitch(event) {
    event.preventDefault();
    const bValue = !$(event.currentTarget).parent().find('#switchOctagon').prop('checked') ? false : true;
    await this.actor.update({
      "system.control.main.octagon": !bValue
    });
  }

  /**
   * _changeCharOctoValue
   * @param {*} event 
   */
  async _changeCharOctoValue(event) {
    event.preventDefault();
    const sId = event.currentTarget.dataset.char;
    $(this.actor.sheet.form).find('input._charValue[name="system.characteristics.'+sId+'.value"]')
                            .val($(event.currentTarget).val());
    $(this.actor.sheet.form).find('input._charValue[name="system.characteristics.'+sId+'.mod"]')
                            .val("+0");      
    let charIndex = "system.characteristics."+sId+".value",
        modIndex = "system.characteristics."+sId+".mod";
    await this.actor.update({
        [charIndex]: $(event.currentTarget).val(),
        [modIndex]: '+0'});
  }

  /**
   * _changeCharValue
   * @param {*} event 
   */
  async _changeCharValue(event) {
    event.preventDefault();
    const sId = event.currentTarget.dataset.char;
    $(this.actor.sheet.form).find('input._charValue[name="system.characteristics.'+sId+'.value"]')
                            .val($(event.currentTarget).val());     
    let charIndex = "system.characteristics."+sId+".value";
    await this.actor.update({
        [charIndex]: $(event.currentTarget).val()});
  }

  /**
   * _changeCharMod
   * @param {*} event 
   */
  async _changeCharMod(event) {
    event.preventDefault();
    const sId = event.currentTarget.dataset.char;
    $(this.actor.sheet.form).find('input._charValue[name="system.characteristics.'+sId+'.mod"]')
                            .val($(event.currentTarget).val());     
    let charIndex = "system.characteristics."+sId+".mod";
    await this.actor.update({
        [charIndex]: $(event.currentTarget).val()});
  }

  /**
   * _changeUpdaterInput
   * @param {*} event 
   */
  async _changeUpdaterInput(event) {
    event.preventDefault();
    const sPath = event.currentTarget.dataset.path;
    const sControl = event.currentTarget.dataset.control;

    $(this.actor.sheet.form).find(sControl).val($(event.currentTarget).val());   
    let path = sPath;
    await this.actor.update({
        [sPath]: $(event.currentTarget).val()});     
  }

  /**
   * _clickItem
   * @param {*} event 
   */
  _clickItem(event) {
    event.preventDefault();
    const sItemId = event.currentTarget?.dataset.id;
    this.actor.items.find(e => e.id === sItemId)?.sheet.render(true);
  }

  /**
   * _favorite
   * @param {*} event 
   */
  _favorite(event) {
    event.preventDefault();
    event.stopPropagation();

    const oFavorite = $(this.actor.sheet.form).find('._blockSkillText ._noVisible input._favorite');
    oFavorite.prop('checked', !oFavorite.prop('checked')).trigger('change');
  }

  /**
   * _primary
   * @param {*} event 
   */
  _primary(event) {
    event.preventDefault();
    event.stopPropagation();

    //For further development...
    const oControl = $(this.actor.sheet.form).find('._blockSkillText ._noVisible input._primary');
    oControl.prop('checked', !oControl.prop('checked')).trigger('change');
  }

  /**
   * _secondary
   * @param {*} event 
   */
  _secondary(event) {
    event.preventDefault();
    event.stopPropagation();

    //For further development...
    const oControl = $(this.actor.sheet.form).find('._blockSkillText ._noVisible input._secondary');
    oControl.prop('checked', !oControl.prop('checked')).trigger('change');
  }

  /**
     * _patern
     * @param {*} event 
     */
  _patern(event) {
    event.preventDefault();
    event.stopPropagation();

    //For further development...
    const oControl = $(this.actor.sheet.form).find('._blockSkillText ._noVisible input._patern');
    oControl.prop('checked', !oControl.prop('checked')).trigger('change');
  }

  /**
   * _changeSkillSearch
   * @param {*} event 
   */
  _changeSkillSearch(event) {
    /*
    event.preventDefault();
    const sSearch = $(event.currentTarget).val().toLowerCase();
    const blocSkills = $(event.currentTarget).parents('._blockSkills');
    
      blocSkills.find('._skills ._skill').each(function(i,e) {
        if (sSearch && sSearch !== '') {
          if (!$(e).data('sortkey').toLowerCase().includes(sSearch)) $(e).addClass('_noVisible');
                                                                else $(e).removeClass('_noVisible');
        } else $(e).removeClass('_noVisible');
      });
      */
  }

  /**
   * _learned
   * @param {*} event 
   */
  _learned(event) {
    event.preventDefault();
    event.stopPropagation();

    const oLearned = $(this.actor.sheet.form).find('._blockSkillText ._noVisible input._learned');
    oLearned.prop('checked', !oLearned.prop('checked')).trigger('change');
  }  

  /**
   * _changeEncounterName
   * @param {*} event 
   */
  _changeEncounterName(event) {
    event.preventDefault();
    helperCombat.changeEncounterName($(event.currentTarget).val());
  }

  /**
   * _changeInitiativeMod
   * @param {*} event 
   */
  _changeInitiativeMod(event) {
    event.preventDefault();
    helperCombat.changeInitiativeMod(event.currentTarget?.dataset.id, $(event.currentTarget).val());
  }

  /**
   * _changeCombatCustoMod
   * @param {*} event 
   */
  _changeCombatCustoMod(event) {
    event.preventDefault();
    helperCombat.changeCombatCustoMod(event.currentTarget?.dataset.stepid, 
                                     $(event.currentTarget).val(),
                                     event.currentTarget?.dataset.damage === 'true');    
  }

  /**
   * _changeCombatCustoModOppo
   * @param {*} event 
   */
  _changeCombatCustoModOppo(event) {
    event.preventDefault();
    helperCombat.changeOppoCustoMod(event.currentTarget?.dataset.stepid, 
                                    event.currentTarget?.dataset.target,
                                    $(event.currentTarget).val());
  }

  /**
   * _changeCombatLocation
   * @param {*} event 
   */
  _changeCombatLocation(event) {

    event.preventDefault();
    const key = $(event.currentTarget).find(":selected").val();
    const stepId = event.currentTarget?.dataset.stepid;

    helperCombat.defineCombatLocation(this.actor.type, stepId, key);
  }

  /** ----------------------------------------------------------------------------------------------------------------
   *  UI CONTROLS...
   ---------------------------------------------------------------------------------------------------------------- */

  _uiHandlers() {

    //Window resize
    $(window).on( "resize", e => {
      if (this.rendered) this.render(true);
    });

    const form =  $(this.actor.sheet.form);

    delete this._extendHandlers;
    this._extendHandlers = Array();
    delete this._actorMenuHandlers;
    this._actorMenuHandlers = Array();
    delete this._skillHandlers;
    this._skillHandlers = Array();    
    delete this._weaponHandlers;
    this._weaponHandlers = Array();     

    this._resizableButton = form.parents('.window-app').find('.window-resizable-handle')[0];
    this._actorMenu = form.find('._actorMenuWrap')[0];
    this._blockSkills = form.find('._blockSkills')[0];
    this._mainWeapon = form.find('._weaponDiagramWrap ._mainWeapon')[0];
    this._secondWeapon = form.find('._weaponDiagramWrap ._secondWeapon')[0];

    //RESIZABLE BUTTON
    this._extendHandlers["resizeDown"] = ["pointerdown", e => this._onResizeMouseDown(e), false];
    this._extendHandlers["resizeMove"] = ["pointermove", e => this._onResizeMouseMove(e), false];
    this._extendHandlers["resizeUp"] = ["pointerup", e => this._onResizeMouseUp(e), false];   
    this._resizableButton.addEventListener(...this._extendHandlers.resizeDown);

    //ACTOR MENU
    this._actorMenuHandlers["mouseEnter"] = ["mouseenter", e => this._onActorMenuMouseMove(e), false];
    this._actorMenuHandlers["mouseMove"] = ["mousemove", e => this._onActorMenuMouseMove(e), false];
    this._actorMenuHandlers["mouseLeave"] = ["mouseleave", e => this._onActorMenuMouseLeave(e), false]; 
    this._actorMenu.addEventListener(...this._actorMenuHandlers.mouseEnter);
    this._actorMenu.addEventListener(...this._actorMenuHandlers.mouseMove);
    this._actorMenu.addEventListener(...this._actorMenuHandlers.mouseLeave);

    form.find('nav.tabs_ActorMenu a._linkToContent').each(function(i,o) {
      o.addEventListener("click", e => this._onActorMenuClick(e), false);
    }.bind(this));

    //SKILLS
    this._skillHandlers["click"] = ["click", e => this._onSkillClick(e), false];
    this._skillHandlers["mouseEnter"] = ["mouseenter", e => this._onSkillMouseMove(e), false];
    this._skillHandlers["mouseMove"] = ["mousemove", e => this._onSkillMouseMove(e), false];
    this._skillHandlers["mouseLeave"] = ["mouseleave", e => this._onSkillMouseLeave(e), false]; 
    $(this._blockSkills).find('._skill').each(function (i,o) {
      o.addEventListener(...this._skillHandlers.mouseEnter);
      o.addEventListener(...this._skillHandlers.mouseMove);
      o.addEventListener(...this._skillHandlers.mouseLeave);
      o.addEventListener(...this._skillHandlers.click);
    }.bind(this));

    //WEAPONS
    this._weaponHandlers["mouseEnter"] = ["mouseenter", e => this._onWeaponMouseEnter(e), false];
    this._weaponHandlers["mouseMove"] = ["mousemove", e => this._onWeaponMouseMove(e), false];
    this._weaponHandlers["mouseLeave"] = ["mouseleave", e => this._onWeaponMouseLeave(e), false]; 
    [this._mainWeapon, this._secondWeapon].map(e => {
      if (!e) return;
      e.addEventListener(...this._weaponHandlers.mouseEnter);
      e.addEventListener(...this._weaponHandlers.mouseMove);
      e.addEventListener(...this._weaponHandlers.mouseLeave);
    });

  }

  /**
   * _onResize
   */
  _onResize(event) {
    super._onResize(event);
    this._afterRender(event);
    this.actor.sheet.render(true);
  }

  _onResizeMouseDown(event) {
    event.preventDefault();
    this._resizableButton.addEventListener(...this._extendHandlers.resizeMove);
    this._resizableButton.addEventListener(...this._extendHandlers.resizeUp);
  }

  _onResizeMouseMove(event) {
    event.preventDefault();
    $(this.actor.sheet.form).find('._hitPoints').hide();
  }

  _onResizeMouseUp(event) {
    event.preventDefault();
    $(this.actor.sheet.form).find('._hitPoints').show();
    this._resizableButton.removeEventListener(...this._extendHandlers.resizeMove);
    this._resizableButton.removeEventListener(...this._extendHandlers.resizeUp);    
  }  

  _onActorMenuMouseMove(event) {
    event.preventDefault();
    this._form.find('._characteristics').css({opacity: 0});
    this._form.find('._hitPoints').css({opacity: 0});
    this._form.find('._actorName').css({opacity: 0});
  }

  _onActorMenuMouseLeave(event) {
    event.preventDefault();
    this._form.find('._characteristics').css({opacity: 1});
    this._form.find('._hitPoints').css({opacity: 1});
    this._form.find('._actorName').css({opacity: 1});
  }

  _onActorMenuClick(event) {
    const aLink = $(event.target).hasClass('_linkToContent') ?
                  $(event.target) : $(event.target).parents('a._linkToContent');
    const sTab = aLink.data('tab');
    const section = $(this.actor.sheet.form).find('section.tabs_ActorContent');
    section.find('sheetContent.active').removeClass('active');
    section.find('sheetcontent[data-tab="'+sTab+'"]').addClass('active');
    helperSheets._sheetContent(this.actor.sheet);
  }

  _onSkillClick(event) {
    const sItemId = event.currentTarget?.dataset.id;
    this.actor.update({
      "system.control.skills.lastSkill": sItemId
    });
    //helperSheets.showSkillInfo(this.actor.sheet, this.actor, sItemId);
  }

  _onSkillMouseMove(event) {
    //...
  }

  _onSkillMouseLeave(event) {
    //...
  }

  _onWeaponMouseEnter(event) {
    let page = $(event.currentTarget).find('._weaponPageInfo');
    if (page.length === 0) return;
    let mainSheet = page.parents('sheetcontent.tab.active');
    if (!mainSheet.length === 0) return;
    $(event.currentTarget).append(page.clone());
    mainSheet.find('._leftFrame').append(page.show());
  }

  _onWeaponMouseMove(event) {
    //...
  }

  _onWeaponMouseLeave(event) {
    let page = $(event.currentTarget).parents('sheetcontent.tab.active')
                                     .find('._leftFrame ._weaponPageInfo');
    if (page.length === 0) return;
    page.remove();
  }

  /**
   * _afterRender
   */
  _afterRender(event) {
    if (this.activeTab) helperSheets.activeTab(this, this.activeTab);
    helperSheets.postRender(this.actor);
  }

  /**
   * _focusMe
   * @param {*} event 
   */
  _focusMe(event) {
    helperSheets._focusMe(this.actor.sheet);
  }

  /**
   * _changePortrait
   * @param {*} event 
   */
  _changePortrait(event) {
    let FP = new FilePicker({
      callback: this._cbChangePortrait
    });
    FP.extensions = ['.bmp', '.gif', 'jpeg', '.jpg', '.png', '.svg', '.tiff', '.webp'];
    FP.request = this.actor.img;
    FP.sources.data.target = this.actor.img.split('/').slice(0, -1).join('/');
    FP.actor = this.actor;
    FP.render();
  }
  async _cbChangePortrait(sFile) {
    await this.actor.update({'img': sFile});
    return;    
  }

  /**
   * _click/change Option
   * @param {*} event 
   */
  _clickOption(event) {
    event.stopPropagation();
    const option = $(event.currentTarget).hasClass('_option') ? $(event.currentTarget)
                                                              : $(event.currentTarget).parents('._option');
    const oCheck = option.find('input[type="checkbox"]');
    oCheck.prop('checked', !oCheck.prop('checked')).trigger('change');
  }
  _changeOption(event) {
    event.preventDefault();
    //Unique value... (radiobuttons behavior)
    const target = $(event.currentTarget);
    $(event.currentTarget).parents('._menu')
                          .find('._option input[type="checkbox"]').each(function(i, e) {
      if ($(e)[0].name === target.find('input')[0].name) return;
      $(e).prop('checked', false);
    }.bind(this));
  }

}