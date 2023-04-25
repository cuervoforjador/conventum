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

    return systemData;
  }

}