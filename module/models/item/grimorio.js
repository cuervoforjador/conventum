import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendItem_Base from "./_base.js"

export default class modelGrimorio extends extendItem_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {
        const schema = super.defineSchema();

        schema.autor = new api.StringField({ initial: '' })
        schema.idioma = new api.StringField({ initial: '' })
        schema.ensenar = new api.NumberField({ nullable: true, initial: null })
        schema.comunicacion = new api.NumberField({ nullable: true, initial: null })

        schema.hechizos = new api.ArrayField(new api.SchemaField({
            key: new api.StringField({ initial: '' })
        }))

        return schema;
    }

}