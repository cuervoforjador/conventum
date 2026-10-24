import {api, md_stat, md_lore, md_text} from "../_constants.js"
import extendItem_Base from "./_base.js"

export default class modelFormula extends extendItem_Base {

    /**
     * defineSchema
     * @returns 
     */
    static defineSchema() {
        const schema = super.defineSchema();

        schema.showPrecio = new api.BooleanField({ initial: true })

        schema.aprendido = new api.BooleanField({ initial: false })
        schema.pta = new api.NumberField({ nullable: true, initial: 0 })        
        schema.preparacion = new api.SchemaField({
            formula: new api.StringField({ initial: '' }),
            unidad: new api.StringField({ initial: 'horas' })
        })
        schema.dosis = new api.SchemaField({
            formula: new api.StringField({ initial: '' }),
            value: new api.NumberField({ nullable: true, initial: 0 }),
            max: new api.NumberField({ nullable: true, initial: 0 }),
            caducidad: new api.SchemaField({
                formula: new api.StringField({ initial: '' }),
                unidad: new api.StringField({ initial: 'meses' }),
                value: new api.NumberField({ nullable: true, initial: 0 }),
            })
        })
        schema.requisitos = new api.SchemaField({
            alquimia: new api.NumberField({ nullable: true, initial: null }),
            skill: new api.BooleanField({ initial: false }),
            skillID: new api.StringField({ initial: '' }),
            skillValue: new api.NumberField({ nullable: true, initial: 0 }),
            formula: new api.BooleanField({ initial: false }),
            formulaID: new api.StringField({ initial: '' }),
            formulaExtraID: new api.StringField({ initial: '' }),
        })        

        schema.massEdit = new api.HTMLField({ initial: '' })
        schema.massEditFolder = new api.StringField({ initial: '' })

        return schema;
    }

}