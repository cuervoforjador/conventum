import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendItem_Base from "./_base.js"

export default class modelTienda extends extendItem_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {
        
        const schema = super.defineSchema();
        schema.folder = new api.StringField({ initial: '' })
        schema.actors = new api.ArrayField(new api.SchemaField({
            id: new api.StringField({ initial: '' }),
            visible: new api.BooleanField({ initial: false })
        }))
        schema.productos = new api.ArrayField(new api.SchemaField({
            id: new api.StringField({ initial: '' }),
            visible: new api.BooleanField({ initial: true }),
            limitado: new api.BooleanField({ initial: false }),
            unidades: new api.NumberField({ nullable: true, initial: 1 }),
        }))
        return schema;
    }

}