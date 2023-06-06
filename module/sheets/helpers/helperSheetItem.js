/**
 * Helpers for Item Sheet
 */

import { mainUtils } from "../../mainUtils.js";

export class helperSheetItem {

  /**
   * checkSystemData
   * @param {*} systemData 
   */
  static async checkSystemData(systemData) {

    //Item without World... -> First World
    if (systemData.control.world === "") {
      const mWorlds = await game.packs.get("conventum.worlds").getDocuments();
      systemData.control.world = mWorlds[0].id;
    }    

    //Languages...
    if (systemData.backend && systemData.backend.languages) {
      for (const s in systemData.backend.languages) {
        
        if (!mainUtils.checkExpression(systemData.backend.languages[s]) )
          systemData.backend.languages[s] = '';
        
      }
    }

    //Skills
    if (systemData.combat) {
      if (!systemData.combat.combat) {
        systemData.combat.contact = false;
        systemData.combat.distance = false;
        systemData.combat.fire = false;
      }
    }

    //Traits
    if (systemData.mod) {
      for (var s in systemData.mod) {
        systemData.mod[s].apply = !(systemData.mod[s].bono === '');
      }
    }

    return systemData;
  }

  /**
   * molding
   * @param {*} context 
   */
  static molding(context) {
    if (context.systemData.control.mold === '')
      context.systemData.control.mold = context.data._id;
  }

}