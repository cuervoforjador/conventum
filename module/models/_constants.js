export const api = foundry.data.fields

export const md_stat = (options = {}) => {
      const _options = {...{value: 0, initial: 0, min:0, max: 20, rules: ['aq3', 'aq4', 'vyc'], label: "", hint: ""}, ...options}
      _options.max = _options.value > _options.max ? _options.value : _options.max
      _options.min = _options.value < _options.min ? _options.value : _options.min

      return new api.SchemaField({
                        formula: new api.StringField({ initial: '' }),
                        value: new api.NumberField({ nullable: true, initial: _options.value }),
                        total: new api.NumberField({ nullable: true, initial: _options.value }),
                        initial: new api.NumberField({ nullable: true, initial: _options.initial }),
                        min: new api.NumberField({ nullable: true, initial: _options.min }),
                        max: new api.NumberField({ nullable: true, initial: _options.max })
                  }, {
                        label: _options.label,
                        hint: _options.hint
                  })
}

export const md_healthStatus = (high, low, penalMov, penalDan, penalIni, penalHab) => {
      return new api.SchemaField({
                        low: new api.NumberField({ nullable: true, initial: low }),
                        high: new api.NumberField({ nullable: true, initial: high }),
                        checked: new api.BooleanField({ initial: false }),                        
                        value: new api.NumberField({ nullable: true, initial: 0 }),
                        penalMov: new api.NumberField({ nullable: true, initial: penalMov }),
                        penalDan: new api.NumberField({ nullable: true, initial: penalDan }),
                        penalIni: new api.NumberField({ nullable: true, initial: penalIni }),
                        penalHab: new api.NumberField({ nullable: true, initial: penalHab }),
                  })
}

export const md_lore = (options = {}) => {
      const _options = {...{label: "", hint: ""}, ...options}
      return new api.SchemaField({
                        key: new api.StringField({ initial: '' }),
                        img: new api.StringField({ initial: '' })
                  }, {
                        label: _options.label,
                        hint: _options.hint
                  })
}

export const md_text = (options = {}) => {
      const _options = {...{label: "", hint: ""}, ...options}
      return new api.SchemaField({
                        title: new api.StringField({ initial: '' }),
                        value: new api.HTMLField({ initial: '' })            
                  }, {
                        label: _options.label,
                        hint: _options.hint
                  })
}
