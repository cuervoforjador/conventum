import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendItem_Base from "./_base.js"

export default class modelArmadura extends extendItem_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {        
        const schema = super.defineSchema();

        schema.tipo =  new api.StringField({ initial: '' })
        schema.proteccion = new api.NumberField({ nullable: true, initial: null })
        schema.resistencia = new api.NumberField({ nullable: true, initial: null })
        schema.resistenciaTotal = new api.NumberField({ nullable: true, initial: null })
        schema.fuerza = new api.NumberField({ nullable: true, initial: null })
        schema.localizacion = new api.StringField({ initial: 'humanoide' })
        schema.localizaciones = new api.ArrayField(new api.SchemaField({
            key: new api.StringField({ initial: '' })
        }))
        schema.penalizaciones = new api.ArrayField(new api.SchemaField({
            key: new api.StringField({ initial: '' }),
            penal: new api.StringField({ initial: '' })
        }))          
        schema.penalIniciativa = new api.NumberField({ nullable: true, initial: null })
        schema.penalMovimiento = new api.NumberField({ nullable: true, initial: null })

        schema.enUso = new api.BooleanField({ initial: true })

        return schema;
    }

}