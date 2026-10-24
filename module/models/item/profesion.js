import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendItem_Base from "./_base.js"

export default class modelProfesion extends extendItem_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {
        
        const schema = super.defineSchema();

        schema.femenino = new api.BooleanField({ initial: false })
        schema.masculino = new api.BooleanField({ initial: true })
        schema.paterna = new api.BooleanField({ initial: false })
        schema.femNombre = new api.StringField({ initial: '' })

        schema.caracteristicas = new api.SchemaField({
            fue: new api.NumberField({ nullable: true, initial: 0 }),
            agi: new api.NumberField({ nullable: true, initial: 0 }),
            hab: new api.NumberField({ nullable: true, initial: 0 }),
            res: new api.NumberField({ nullable: true, initial: 0 }),
            per: new api.NumberField({ nullable: true, initial: 0 }),
            tem: new api.NumberField({ nullable: true, initial: 0 }),
            com: new api.NumberField({ nullable: true, initial: 0 }),
            cul: new api.NumberField({ nullable: true, initial: 0 }),
            asp: new api.NumberField({ nullable: true, initial: 0 }),
        })
        schema.suerte = new api.NumberField({ nullable: true, initial: 0 })
        schema.competencias = new api.ArrayField(new api.SchemaField({
            key: new api.StringField({ initial: '' }),
            primaria: new api.BooleanField({ initial: false }),
            secundaria: new api.BooleanField({ initial: false }),
            grupo: new api.NumberField({ nullable: true, initial: 0 })
        }))
        schema.estratos = new api.ArrayField(new api.SchemaField({
            key: new api.StringField({ initial: '' }),
            checked: new api.BooleanField({ initial: false }),
            ingresos:  new api.StringField({ initial: '' }),
            low: new api.NumberField({ nullable: true, initial: null }),
            high: new api.NumberField({ nullable: true, initial: null })
        }))
        
        schema.sociedad = new api.SchemaField({
            apariencia: new api.NumberField({ nullable: true, initial: null })
        })

        return schema;
    }

}