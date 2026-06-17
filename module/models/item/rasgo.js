import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendItem_Base from "./_base.js"

export default class modelRasgo extends extendItem_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {
        const schema = super.defineSchema();

        schema.coste = new api.NumberField({ nullable: true, initial: null })
        schema.orgullo = new api.BooleanField({ initial: false })
        schema.verguenza = new api.BooleanField({ initial: false })
        schema.applied = new api.BooleanField({ initial: false })

        return schema;
    }

}