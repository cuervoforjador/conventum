import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendItem_Base from "./_base.js"

export default class modelEstrato extends extendItem_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {
        const schema = super.defineSchema();

        schema.sociedad = new api.SchemaField({
            key: new api.StringField({ initial: '' })
        })        
        schema.roll = new api.SchemaField({
            low: new api.NumberField({ nullable: true, initial: null }),
            high: new api.NumberField({ nullable: true, initial: null })
        })
        schema.posiciones = new api.ArrayField(new api.SchemaField({
            key: new api.StringField({ initial: '' }),
            low: new api.NumberField({ nullable: true, initial: null }),
            high: new api.NumberField({ nullable: true, initial: null })
        }))

        return schema;
    }

}