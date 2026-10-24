import {api, md_stat, md_lore, md_text} from "./_constants.js"

export default class extend_Combat extends foundry.abstract.DataModel { //foundry.abstract.TypeDataModel {

  static defineSchema() {

    const schema = {}

    schema.asaltos = new api.ArrayField(new api.SchemaField({
        index: new api.NumberField({ nullable: true, initial: null }),
        steps: new api.ArrayField(new api.SchemaField({
            id: new api.StringField({ initial: '' }),
            type: new api.StringField({ initial: '' }),
            combatantId: new api.StringField({ initial: '' }),
            targetId: new api.StringField({ initial: '' }),
            weaponId: new api.StringField({ initial: '' }),
            actionId: new api.StringField({ initial: '' }),
            stepTargetId: new api.StringField({ initial: '' }),
            initiative: new api.NumberField({ nullable: true, initial: 0 }),
            active: new api.BooleanField({ initial: true }),
            rolls: new api.SchemaField({
              skill: new api.SchemaField({
                  rolled: new api.BooleanField({ initial: false }),
                  label: new api.StringField({ initial: '' }),
                  class: new api.StringField({ initial: '' }),
                  succes: new api.BooleanField({ initial: false }),
                  criticalSuccess: new api.BooleanField({ initial: false }),
                  failure: new api.BooleanField({ initial: false }),
                  criticalFailure: new api.BooleanField({ initial: false }),
                  percentBase: new api.NumberField({ nullable: true, initial: 0 }),
                  percentFinal: new api.NumberField({ nullable: true, initial: 0 })
              }),
              damage: new api.SchemaField({
                  rolled: new api.BooleanField({ initial: false }),
                  formula: new api.StringField({ initial: '' })
              })              
            })
        }))
    }))

    return schema
  }
}