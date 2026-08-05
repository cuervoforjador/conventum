import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extend_Base from "../base.js";

export default class extendItem_Base extends extend_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {
        const schema = super.defineSchema()

        schema.descripcion = new api.HTMLField({ initial: '' })
        schema.fuente =  new api.StringField({ initial: '' })

        schema.precio = new api.NumberField({ nullable: true, initial: null })
        schema.peso = new api.NumberField({ nullable: true, initial: null })

        schema.ubicacion = new api.SchemaField({
            encima: new api.BooleanField({ initial: true }),
            lugar: new api.StringField({ initial: '' })
        })
        schema.unidades = new api.SchemaField({
            use: new api.BooleanField({ initial: false }),
            actual: new api.NumberField({ nullable: true, initial: null }),
            total: new api.NumberField({ nullable: true, initial: null })
        })

        schema.etiquetas = new api.StringField({ initial: '' })

        return schema        
    }

}