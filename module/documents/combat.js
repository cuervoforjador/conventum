import { SYSTEM_ID } from "../config/uiConstants.js";
import extend_Combat from "../models/combat.js"

export default class newCombat extends Combat {

    /**
     * extendData
     */
    get extendData() {
        const rawData = this.getFlag(SYSTEM_ID, "extendData") || {};
        return new extend_Combat(rawData, { parent: this });
    }

    /**
     * saveExtendData
     * @param {*} data 
     */
    async saveExtendData(data) {
        const mergedData = foundry.utils.mergeObject(this.extendData.toObject(), data);
        const serialData = new extend_Combat(mergedData, { parent: this });  
        return this.setFlag(SYSTEM_ID, "extendData", serialData.toObject());      
    }

}