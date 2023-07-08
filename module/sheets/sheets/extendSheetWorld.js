import { helperSheetItem } from "../helpers/helperSheetItem.js";

/**
 * @extends {ItemSheet}
 */
export class extendSheetWorld extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "item"],
      template: CONFIG._root+"/templates/world.html",
      width: 500,
      height: 600,
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
   getData() {
    const context = super.getData();
    context.systemData = this.item.getRollData();
    context.mRollDice = ['level1', 'level2', 'level3', 'level4', 'level5',
                         'level6', 'level7', 'level8', 'level9'];

    //Mechanics...
    let systemData = context.systemData;

    if (!systemData.config.actions.fixedNumber)
            systemData.config.actions.actionNumber = 0;
    if (systemData.config.actions.fixedNumber) {
            systemData.config.actions.initiativePercent = 0;
            systemData.config.actions.penalFrom = 0;
            systemData.config.actions.penaltyPorc = '';
    }
    
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
  }
  
}
