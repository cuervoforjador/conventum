import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendCharacter_Base from "./_base.js"

export default class extendCharacter_Character extends extendCharacter_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {
        
        const schema = super.defineSchema();
        return schema;
    }

    /**
     * prepareDerivedData
     */
    prepareDerivedData() {
        super.prepareDerivedData()
    }

}