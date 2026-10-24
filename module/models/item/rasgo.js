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
        schema.roll = new api.SchemaField({
            low: new api.NumberField({ nullable: true, initial: null }),
            high: new api.NumberField({ nullable: true, initial: null })
        })
        schema.sociedad = new api.SchemaField({
            apariencia: new api.NumberField({ nullable: true, initial: null }),
            renombre: new api.NumberField({ nullable: true, initial: null }),
            naturaleza: new api.NumberField({ nullable: true, initial: null }),
        })
        
        return schema;
    }

}