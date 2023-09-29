/**
 * @extends {ItemSheet}
 */

import { mainBackend } from "../backend/mainBackend.js";
import { helperSheetItem } from "../helpers/helperSheetItem.js";
import { helperSheetCombat } from "../helpers/helperSheetCombat.js";
import { helperActions } from "../helpers/helperActions.js";
import { helperSocket } from "../../helpers/helperSocket.js";
import { aqActions } from "../../actions/aqActions.js";
import { aqCombat } from "../../actions/aqCombat.js";
import { aqContext } from "../../actions/aqContext.js";

export class extendSheetActionPool extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "item"],
      template: CONFIG._root+"/templates/actionPool.html",
      width: 400,
      height: 650,
      tabs: [
        {navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main"}
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
    context.systemData = this.item.getRollData();
    //context.systemData = await helperSheetItem.checkSystemData(context.systemData);
    //context.backend = await mainBackend.getBackendForActionPool(context.systemData);

    context.combat = helperSheetCombat.getCombat(context);
    context.encounterId = this.item._id;

    //Mechanics...
    let systemData = context.systemData;

    //Im Master..
    context.imMaster = game.user.isGM;

    //Targets
    context.systemData.steps.map(step => {
      if (typeof step.targets == "string")
        step.targets = step.targets.split(',');
    });

    //Molding...
    helperSheetItem.molding(context);

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

    html.find("li._combatant").click(this._showActor.bind(this));
    html.find("a._verb").click(this._verb.bind(this));  
    html.find("a._verb").click(this._verb.bind(this));  
    html.find("a._menuButton").click(this._menuVerb.bind(this));  

    $('ul._steps').sortable({
      item: 'li.step',
      cursor: 'pointer',
      axis: 'y',
      stop: this._dropStep
    });

        

  }

  // _showActor
  _showActor(event) {
    event.preventDefault();
    const actorId = event.currentTarget?.dataset.actorid;
    const tokenId = event.currentTarget?.dataset.tokenid;
    const oActor = (tokenId) ? game.scenes.active.tokens.get(tokenId).getActor() :
                               (actorId) ? game.actors.get(actorId) : null;     
    if (!oActor) return;
    oActor.sheet.render(true, {
      editable: game.user.isGM
    });    
  }

  // _menuVerb
  async _menuVerb(event) {
    event.preventDefault();
    const sVerb = event.currentTarget?.dataset.verb;
    let mSteps = this.item.system.steps;
    let mHistory = this.item.system.history;
    let nAssaultId = this.item.system.assaultId;
    let combat = aqActions.getCurrentCombat();

    if (sVerb === 'reset') {
        await this.item.update({
          system: { steps: [] }
        });  
        helperSocket.refreshSheets();      
    }   

    if (sVerb === 'next') {
        if (mSteps.length === 0) return;
        mSteps.map(step => {
          mHistory.push({...step,
             ...{
              assaultId: nAssaultId
             }
          });
        });
        await this.item.update({
          system: { steps: [],
                    history: mHistory,
                    assaultId: nAssaultId+1 }
        });       
        helperSocket.refreshSheets();   
        await combat.resetAll();
    }

    if (sVerb === 'reRoll') {
      await combat.rollAll();
    }

  }

  // _verb
  async _verb(event) {
    event.preventDefault();
    const actionId = event.currentTarget?.dataset.actionid,
          stepId = Number(event.currentTarget?.dataset.stepid),
          actorId = event.currentTarget?.dataset.actorid,
          tokenId = event.currentTarget?.dataset.tokenid,
          uniqeId = event.currentTarget?.dataset.uniqeid,
          sVerb = event.currentTarget?.dataset.verb;

    //Indexing...
    this.item.system.steps.forEach((e, i) => {e.index = i;});

    // SHOW
    if (sVerb === 'show') {
      let actor = (tokenId) ? game.scenes.active.tokens.get(tokenId).getActor() :
                              game.actors.get(actorId);       
      if (!actor) return;
      let item = actor.items.get(actionId);
      if (!item) return;
      item.sheet.render(true, {
        editable: game.user.isGM
      });   
    }      
    
    // DELETE
    if (sVerb === 'delete') {
      let mSteps = this.item.system.steps.filter(e => !( (e.action === actionId) && 
                                                         (e.index === stepId) &&
                                                         (e.uniqeId === uniqeId) ) );
      if (!mSteps) return;
      await this.item.update({
        system: { steps: mSteps }
      });  
      helperSocket.refreshSheets();      
    }

    // CONSUME
    if (sVerb === 'consume') {

      let mSteps = this.item.system.steps;
      mSteps.forEach(function(step) {
        if ( (step.action === actionId) && 
             (step.index === stepId) && 
             (step.uniqeId === uniqeId) )
          step.consumed = true;
      }.bind(this));

      await this.item.update({
        system: { steps: mSteps }
      }); 
      helperSocket.refreshSheets();
    }

    // REACT
    if (sVerb === 'react') {

      let mSteps = this.item.system.steps;
      mSteps.forEach(function(step) {
        if ( (step.action === actionId) && 
             (step.index === stepId) && 
             (step.uniqeId === uniqeId) )
          step.consumed = false;
      }.bind(this));

      await this.item.update({
        system: { steps: mSteps }
      }); 
      helperSocket.refreshSheets();
    }        

    // PLAY
    if (sVerb === 'play') {

      let oStep = this.item.system.steps.find(e => ( (e.action === actionId) && 
                                                     (e.index === stepId) && 
                                                     (e.uniqeId === uniqeId) ) );
      if (!oStep) return;
      helperSheetCombat.playAction(actorId, tokenId, actionId);
      helperSocket.refreshSheets();
    }

  }

  // _dropStep
  async _dropStep(e, ui, element, options) {

      let mSteps = [];
      $('ul._steps').find('li._step').each(function(i, e) {

        mSteps.push({
          actor: $(e).data('actorid'),
          isToken: ($(e).data('istoken') === true),
          tokenId: $(e).data('tokenid'),
          uniqeId: $(e).data('uniqeid'),
          action: $(e).data('actionid'),
          consumed: ($(e).data('consumed') === true),
          applyLocation: $(e).data('applyLocation'),
          targets: $(e).data('targets').split(',')
        });
      });

      const encounterId = $('ul._steps').data('encounterid');
      let encounter = game.items.get(encounterId);
      if (!encounter) return;

      await encounter.update({
        system: { steps: mSteps }
      });
      helperSocket.refreshSheets();
  }

}
