/**
 * Helpers for Human Sheet
 */

export class helperSheetHuman {

  /**
   * checkSystemData
   * @param {*} systemData 
   */
  static async checkSystemData(systemData) {

    //Actor without World... -> First World
    if (systemData.control.world === "") {
      const mWorlds = await game.packs.get("conventum.worlds").getDocuments();
      systemData.control.world = mWorlds[0].id;
    }    

    return systemData;
  }

}