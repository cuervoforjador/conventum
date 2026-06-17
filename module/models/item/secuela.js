import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendItem_Base from "./_base.js"

export default class modelSecuela extends extendItem_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {
        const schema = super.defineSchema();

        schema.localizacionTipo = new api.StringField({ initial: 'humanoide' })
        schema.localizacion = new api.StringField({ initial: '' })
        schema.roll = new api.SchemaField({
            low: new api.NumberField({ nullable: true, initial: null }),
            high: new api.NumberField({ nullable: true, initial: null })
        })
        schema.efectos = new api.ArrayField(new api.SchemaField({
            key: new api.NumberField({ initial: '' }),
            path: new api.StringField({ initial: '' }),
            formula: new api.StringField({ initial: '' }),
            value: new api.StringField({ initial: '' }),
            rasgo: new api.StringField({ initial: '' }),
            text: new api.StringField({ initial: '' })
        }))
        schema.applied = new api.BooleanField({ initial: false })

        return schema;
    }

}