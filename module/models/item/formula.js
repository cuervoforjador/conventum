import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendItem_Base from "./_base.js"

export default class modelFormula extends extendItem_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {
        const schema = super.defineSchema();

        schema.aprendido = new api.BooleanField({ initial: false })
        schema.pta = new api.NumberField({ nullable: true, initial: null })
        schema.coste = new api.NumberField({ nullable: true, initial: null })
        schema.preparacion = new api.StringField({ initial: '' })
        schema.dosis = new api.SchemaField({
            formula: new api.StringField({ initial: '' }),
            value: new api.NumberField({ nullable: true, initial: null }),
            max: new api.NumberField({ nullable: true, initial: null })
        })

        return schema;
    }

}