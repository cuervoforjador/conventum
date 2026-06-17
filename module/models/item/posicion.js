import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendItem_Base from "./_base.js"

export default class modelPosicion extends extendItem_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {        
        const schema = super.defineSchema();

        schema.femenino = new api.StringField({ initial: '' })
        schema.roll = new api.SchemaField({
            low: new api.NumberField({ nullable: true, initial: null }),
            high: new api.NumberField({ nullable: true, initial: null })
        })
        return schema;
    }

}