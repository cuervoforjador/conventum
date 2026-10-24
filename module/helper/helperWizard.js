import { SYSTEM_ID } from "../config/uiConstants.js"
import helperContext from "./helperContext.js"
import { configRULES } from "../config/rules.js";
import helperDialog from "./helperDialog.js";
import helperTables from "./helperTables.js";
import helperSheets from "./helperSheets.js";
import { aqConfig } from "../config/config.js";
import helperRolls from "./helperRolls.js";

export default class helperWizard {

    /**
     * systemWizard
     * @param {*} actor 
     */
    static systemWizard(actor) {
        const rules = actor.system.rules
        if (!actor.system.control.wizard.show) return

        const oWizard = {
            fase0: {                    //Propiedades (Nombre & Sexo)
                step: 0,
                title: game.i18n.localize('wizard.step0.title_'+rules),
                display: true,
                active:false,
                completed: false,
                width: 100/13,
                icon: "fa-play",
                fog: true
            },     
            fase1: {                    //Reino
                step: 1,  
                title: game.i18n.localize('wizard.step1.title_'+rules),              
                display: true,
                active: false,
                completed: false,
                width: 100/13,
                icon: "fa-crown",
                fog: true
            },
            fase2: {                    //Pueblo - Origen
                step: 2,
                title: game.i18n.localize('wizard.step2.title_'+rules),
                display: true,
                active: false,
                completed: false,
                width: 100/13,
                icon: "fa-people",
                fog: true
            },
            fase3: {                    //Posición social
                step: 3,
                title: game.i18n.localize('wizard.step3.title_'+rules),
                display: true,
                active: false,
                completed: false,
                width: 100/13,
                icon: "fa-chart-pyramid",
                fog: true
            },
            fase4: {                    //Profesión
                step: 4,
                title: game.i18n.localize('wizard.step4.title_'+rules),
                display: true,
                active: false,
                completed: false,
                width: 100/13,
                icon: "fa-hammer-war",
                fog: true
            },
            fase5: {                    //Profesión Paterna y Familia
                step: 5,
                title: game.i18n.localize('wizard.step5.title_'+rules),
                display: true,
                active: false,
                completed: false,
                width: 100/13,
                icon: "fa-family",
                fog: true
            },
            fase6: {                    //Características Primarias
                step: 6,
                title: game.i18n.localize('wizard.step6.title_'+rules),
                display: true,
                active: false,
                completed: false,
                width: 100/13,
                icon: "fa-circle-1",
                fog: true
            },
            fase7: {                    //Características Secundarias
                step: 7,
                title: game.i18n.localize('wizard.step7.title_'+rules),
                display: true,
                active: false,
                completed: false,
                width: 100/13,
                icon: "fa-circle-2",
                fog: true
            },
            fase8: {                    //Competencias
                step: 8,
                title: game.i18n.localize('wizard.step8.title_'+rules),
                display: true,
                active: false,
                completed: false,
                width: 100/13,
                icon: "fa-dice",
                fog: true
            },     
            fase9: {                    //Ingresos y Gastos
                step: 9,
                title: game.i18n.localize('wizard.step9.title_'+rules),
                display: true,
                active: false,
                completed: false,
                width: 100/13,
                icon: "fa-coin-vertical",
                fog: true
            },
            fase10: {                   //Talentos - Hechizos y Rituales de Fe
                step: 10,
                title: game.i18n.localize('wizard.step10.title_'+rules),
                display: true,
                active: false,
                completed: false,
                width: 100/13,
                icon: "fa-hat-witch",
                fog: true
            },
            fase11: {                   //Rasgos de Caracter
                step: 11,
                title: game.i18n.localize('wizard.step11.title_'+rules),
                display: true,
                active: false,
                completed: false,
                width: 100/13,
                icon: "fa-eye",
                fog: true
            },
            fase12: {                   //Últimos pasos
                step: 12,
                title: game.i18n.localize('wizard.step12.title_'+rules),
                display: true,
                active: false,
                completed: false,
                width: 100/13,
                icon: "fa-omega",
                fog: true
            },            
        }

        const nStep = actor.system.control.wizard.step
        for (var s in oWizard) {
            let step = oWizard[s]
            step.active = step.step === nStep
            step.completed = step.step < nStep
        }

        return oWizard
    }

    /**
     * wizardStep
     * @param {*} actor 
     * @param {*} wizard 
     */
    static wizardStep(actor, wizard) {
        const nStep = actor.system.control.wizard.step
        let step = {}
        for (var s in wizard) {
            if (wizard[s].step !== nStep) continue
            step = wizard[s]
        }
        return step
    }

    /**
     * checkWizard
     * @param {*} actor 
     */
    static async checkWizard(actor) {
        if (!actor.system.control.wizard.show) return
        if (!actor.system.control.wizard.active) return

        await actor.update({ "system.control.wizard.active": false }, { render: false })
        const nStep = actor.system.control.wizard.step
        const sAction = '_action_step' + nStep
        this[sAction](actor)
    }

    /**
     * dialog
     * @param {*} actor 
     * @returns 
     */
    static async dialog({actor, content, fEvent, fCallBack, position={width: 600}}) {
       
       const rules = actor.system.rules
       const nStep = actor.system.control.wizard.step

       return await foundry.applications.api.DialogV2.prompt({
            classes: ['_extend', '_wizard', '_'+rules],
            window: { title: game.i18n.localize(`wizard.step${nStep}.title_${rules}`) },
            position,
            content: `<div class="_content">${content}</div>`,
            ok: {},
            render: (_event, dialog) => {
                if (fEvent) fEvent( _event, dialog)
                helperDialog._setShadowToDialog(dialog)          
                helperDialog._setFrameToDialog(dialog)
                helperDialog._setNoFooter(dialog)
                $(dialog.element).find('button[data-action="continue"]').on('click', fCallBack.bind(this, dialog))
            }
        })
    }

    /**
     * Propiedades (Nombre & Sexo)
     * @param {*} actor 
     */
    static async _action_step0(actor) {
        
        const sContent = `<div class="_description">${game.i18n.localize("wizard.step0.description_"+actor.system.rules)}
                          </div>
                          <form id="_content">
                            <div class="_row _gapped">
                                <label>${game.i18n.localize('common.nombre')}</label>
                                <input type="text" id="name" 
                                    value="${actor.name}"
                                    class="_100 _big"></input>
                            </div>
                            <div class="_row _gapped">
                                <label>${game.i18n.localize('common.genero')}</label>
                                <fieldset class="_choice">
                                    <div class="_row">
                                        <input type="radio" id="femenino" name="sexo" value="femenino">
                                        <label for="femenino">${game.i18n.localize('common.femenino')}</label>  
                                    </div>
                                    <div class="_row">
                                        <input type="radio" id="masculino" name="sexo" value="masculino" checked>
                                        <label for="masculino">${game.i18n.localize('common.masculino')}</label>
                                    </div>
                                </fieldset>
                            </div>
                            <div class="_row _right">
                                <button class="_action" 
                                        type="button" 
                                        data-action="continue">${game.i18n.localize('common.continuar')}</button>
                            </div>
                          </form>`

        await this.dialog({actor, content: sContent, fCallBack: async (_dialog, _event) => {                          
            const form = $(_event.currentTarget).parents('form')           
            await actor.update({
                "name": form.find('#name').val(), 
                "system.info.masculino": form.find('._choice').find('input:checked').val() === 'masculino',
                "system.info.femenino": form.find('._choice').find('input:checked').val() === 'femenino',
                "system.control.wizard.step": 1,
                "system.control.wizard.active": true
            })
            _dialog.close()
        }})
    }

    /**
     * Reino
     * @param {*} actor 
     */
    static async _action_step1(actor) {
    
      const lore = 'reino'
      const rules = actor.system.rules
      const option = await helperDialog.dialogSelectLore(rules, lore, actor, true)
      if (!option) return 
      if (option === '#alea') {
        await helperTables.tableLore({rules, lore, actor, bFromWizard: true})
      } else {
        await helperContext.assignLoreToActor({rules, lore, actor, key: option})
        await actor.update({ "system.control.wizard.step": 2,
                            "system.control.wizard.active": true })              
      }
    }

    /**
     * Pueblo / Origen
     * @param {*} actor 
     */
    static async _action_step2(actor) {
    
      const lore = 'pueblo'
      const rules = actor.system.rules
      const option = await helperDialog.dialogSelectLore(rules, lore, actor, true)
      if (!option) return 
      if (option === '#alea') {
        await helperTables.tableLore({rules, lore, actor, bFromWizard: true})
      } else {
        await helperContext.assignLoreToActor({rules, lore, actor, key: option})
        await actor.update({ "system.control.wizard.step": 3,
                            "system.control.wizard.active": true })              
      }      
    }

    /**
     * Posición social
     * @param {*} actor 
     */
    static async _action_step3(actor) {
    
      const rules = actor.system.rules

      const optionEstrato = await helperDialog.dialogSelectLore(rules, 'estrato', actor, true)
      if (!optionEstrato) return
      if (optionEstrato === '#alea') {
        await helperTables.tableLore({rules, lore: 'estrato', actor, bFromWizard: true})
      } else {
        await helperContext.assignLoreToActor({rules, lore: 'estrato', actor, key: optionEstrato})
        const optionPosicion = await helperDialog.dialogSelectLore(rules, 'posicion', actor, true)
        if (!optionPosicion) return
        if (optionPosicion === '#alea') {
            await helperTables.tableLore({rules, lore: 'posicion', actor, bFromWizard: true})
        } else {
            await helperContext.assignLoreToActor({rules, lore: 'posicion', actor, key: optionPosicion})
            await actor.update({ "system.control.wizard.step": 4,
                                "system.control.wizard.active": true })            
        }
      } 

    }

    /**
     * Profesión
     * @param {*} actor 
     */
    static async _action_step4(actor) {
    
      const lore = 'profesion'
      const rules = actor.system.rules
      const option = await helperDialog.dialogSelectLore(rules, lore, actor, true)
      if (!option) return 
      if (option === '#alea') {
        await helperTables.tableLore({rules, lore, actor, bFromWizard: true})
      } else {
        await helperContext.assignLoreToActor({rules, lore, actor, key: option})
        await actor.update({ "system.control.wizard.step": 5,
                            "system.control.wizard.active": true })              
      }
    }

    /**
     * Profesión Paterna
     * @param {*} actor 
     */
    static async _action_step5(actor) {
    
      const lore = 'profesionPaterna'
      const rules = actor.system.rules
      const option = await helperDialog.dialogSelectLore(rules, lore, actor, true)
      if (!option) return 
      if (option === '#alea') {
        await helperTables.tableLore({rules, lore, actor, bFromWizard: true})
      } else {
        await helperContext.assignLoreToActor({rules, lore, actor, key: option})
        await actor.update({ "system.control.wizard.step": 6,
                            "system.control.wizard.active": true })              
      }
    }

    /**
     * Características Primarias
     * @param {*} actor 
     */
    static async _action_step6(actor, bFromSkills=false, dialog2=null) {

        let sChars = ''
        let nTotal = 0
        const maxTotal = configRULES[actor.system.rules].maxChars
        const chars = helperContext.getCaracteristicas()
        const job = actor.items.find(e => e.type === 'profesion' && !e.system.paterna)

        for (var s in chars) {
            if (!configRULES[actor.system.rules].chars.find(e => e === s)) continue
            const char = chars[s]
            const jobChar = job ? job.system.caracteristicas[s] > 0 ? 
                        'MIN: ' + job.system.caracteristicas[s] + ' ('+game.i18n.localize('common.profesion')+')' : '' : ''
            const nValue = actor.system.caracteristicas[s].value < 5 ? 5 :
                           actor.system.caracteristicas[s].value > 20 ? 20 : actor.system.caracteristicas[s].value
            const nMinValue = actor.system.caracteristicas[s].min < 5 ? 5 : actor.system.caracteristicas[s].min
            sChars += `<div class="_row _gapped">
                          <label>${char.label}:</label>
                          <input type="number"
                                 id="char_${s}"
                                 class="_char"
                                 data-char="${s}"
                                 data-maxtotal="${maxTotal}"
                                 value="${nValue}"
                                 min="${nMinValue}"
                                 max="20" />
                          <label class="_extra">${jobChar}</label>
                       </div>`
            nTotal += nValue
        }
        sChars += `<div class="_row _gapped _total">
                          <label>${game.i18n.localize('common.total')}:</label>
                          <input type="number"
                                 id="_totalValue"
                                 value="${nTotal}"
                                 disabled />
                          <label class="_totalMax"> / ${maxTotal}</label>
                       </div>`

        const sContent = `<div class="_description">${game.i18n.localize("wizard.step6.description_"+actor.system.rules)}</div>
                          <div id="_content" class="_wizardChars">
                            ${sChars}
                            <div class="_row _right">
                                <button class="_action" 
                                        type="button" 
                                        style="display: ${nTotal <= maxTotal ? 'block' : 'none' }"
                                        data-action="continue">${game.i18n.localize('common.continuar')}</button>
                            </div>
                          </div>`

        await this.dialog({actor, content: sContent, 
            fEvent: (_event, dialog) => {
                const form = $(dialog.element).find('form')
                form.find('input').each((i, e) => {
                    $(e).on("change", helperWizard._onChangeChar.bind(this, e, form))
                })
            },
            fCallBack: async (_dialog, _event) => {
                const form = $(_event.currentTarget).parents('form')
                let system = actor.system
                let chars = system.caracteristicas
                for (var s in chars) {
                    const nValue = Number(form.find(`input._char[data-char="${s}"]`).val())
                    if (isNaN(nValue)) continue
                    chars[s].value = nValue
                    chars[s].total = nValue
                    chars[s].initial = nValue
                }

                if (bFromSkills) {

                    system = helperSheets.checkStats(system)
                    await actor.update({ 
                        "system.caracteristicas": chars,
                        "system.atributos.ptv.value": system.atributos.ptv.max,
                        "system.atributos.ptf.value": system.atributos.ptf.max,
                        "system.atributos.ptc.value": system.atributos.ptc.max,
                        "system.atributos.sue.value": system.atributos.sue.max,
                        "system.atributos.pta.value": 100,
                        "system.atributos.pta.total": 100,
                        "system.modificadores.danno": helperSheets.modDanno(system)
                    }, { render: false })
                    helperWizard._renderSkillsDialog(dialog2, actor, true)

                } else {
                    await actor.update({
                        "system.caracteristicas": chars,
                        "system.control.wizard.step": 7,
                        "system.control.wizard.active": true
                    })
                }

                _dialog.close()
            }
        })        
    }
    static _onChangeChar(_input, _form) {
        let nTotal = 0
        const maxTotal = Number($(_input).data('maxtotal'))
        const button = _form.find('button._action')

        const nValue = Number($(_input).val()) > Number($(_input).prop('max')) ? Number($(_input).prop('max')) :
                       Number($(_input).val()) < Number($(_input).prop('min')) ? Number($(_input).prop('min')) :
                       Number($(_input).val())
        $(_input).val(nValue)

        _form.find('input._char').each((i, e) => {
            nTotal += Number($(e).val())
        })
        _form.find('#_totalValue').val(nTotal)
        if (nTotal <= maxTotal) { button.show() } else { button.hide() }
    }

    /**
     * Características Secundarias
     * @param {*} actor 
     */
    static async _action_step7(actor) {

        let system = actor.system
        system = helperSheets.checkStats(system)

        await actor.update({ 
            "system.atributos.ptv.value": system.atributos.ptv.max,
            "system.atributos.ptf.value": system.atributos.ptf.max,
            "system.atributos.ptc.value": system.atributos.ptc.max,
            "system.atributos.sue.value": system.atributos.sue.max,
            "system.atributos.pta.value": 100,
            "system.atributos.pta.total": 100,
            "system.modificadores.danno": helperSheets.modDanno(system)
        }, { render: false })

        const sContent = `<div class="_description">${game.i18n.localize("wizard.step7.description_"+actor.system.rules)}</div>
                          <div id="_content" class="_wizardChars2">
                            <div class="_row">
                                <label>${game.i18n.localize("ATTR.rr")}:</label>
                                <input type="number"
                                        id="rr"
                                        class="_rr _attribute"
                                        data-attribute="rr"
                                        value="${system.atributos.rr.value}"
                                        min="0"
                                        max="100" />
                            </div>
                            <div class="_row">
                                <label>${game.i18n.localize("ATTR.irr")}:</label>
                                <input type="number"
                                        id="irr"
                                        class="_irr _attribute"
                                        data-attribute="irr"
                                        value="${system.atributos.irr.value}"
                                        min="0"
                                        max="100" />
                            </div>                                                      
                            <div class="_row">
                                <label>${game.i18n.localize("ATTR.sue")}:</label>
                                <input type="number"
                                       class="_disabled"
                                       disabled
                                       value="${system.atributos.sue.max}" />
                                <label class="_extra">(PER + COM + CUL)</label>                                
                            </div>
                            <div class="_row">
                                <label>${game.i18n.localize("ATTR.ptv")}:</label>
                                <input type="number"
                                       class="_disabled"
                                       disabled
                                       value="${system.atributos.ptv.max}" />
                                <label class="_extra">(RES)</label>                                
                            </div>
                            <div class="_row">
                                <label>${game.i18n.localize("ATTR.ptc")}:</label>
                                <input type="number"
                                       class="_disabled _ptc"
                                       disabled
                                       value="${system.atributos.ptc.max}" />
                                <label class="_extra">(IRR /5)</label>                                
                            </div>
                            <div class="_row">
                                <label>${game.i18n.localize("ATTR.ptf")}:</label>
                                <input type="number"
                                       class="_disabled _ptf"
                                       disabled
                                       value="${system.atributos.ptf.max}" />
                                <label class="_extra">(RR /5)</label>                                
                            </div>   
                            <div class="_row">
                                <label>${game.i18n.localize("common.bonDanno")}:</label>
                                <input type="text"
                                       class="_disabled"
                                       style="width: calc(var(--fSize) * 5); 
                                              margin-left: calc(var(--fSize) * -2);"
                                       disabled
                                       value="${helperSheets.modDanno(system)}" />
                                <label class="_extra">(${game.i18n.localize('explain.bonDanno')})</label>                                
                            </div> 
                            

                            <div class="_row _right">
                                <button class="_action" 
                                        type="button"
                                        data-action="continue">${game.i18n.localize('common.continuar')}</button>
                            </div>                            
                          </div>`        

        await this.dialog({actor, content: sContent, 
            fEvent: (_event, dialog) => {
                const form = $(dialog.element).find('form')
                form.find('input._attribute').each((i, e) => {
                    $(e).on("change", helperWizard._onChangeAttribute.bind(this, e, form))
                })
            },
            fCallBack: async (_dialog, _event) => {
                const form = $(_event.currentTarget).parents('form')
                let atributos = actor.system.atributos
                atributos.rr.value = Number(form.find(`input._rr`).val())
                atributos.irr.value = Number(form.find(`input._irr`).val())
                atributos.ptc.value = Number(form.find(`input._ptc`).val())
                atributos.ptc.max = Number(form.find(`input._ptc`).val())
                atributos.ptf.value = Number(form.find(`input._ptf`).val())
                atributos.ptf.max = Number(form.find(`input._ptf`).val())

                await actor.update({
                    "system.atributos": atributos,
                    "system.control.wizard.step": 8,
                    "system.control.wizard.active": true
                })
                _dialog.close()
            }
        })                          
    }
    static _onChangeAttribute(_input, _form) {
        let nTotal = 0
        const isRR = $(_input).hasClass('_rr')
        const nValue = Number($(_input).val()) > 100 ? 100 :
                       Number($(_input).val()) < 0 ? 0 :
                       Number($(_input).val())

        const antiInput = isRR ? _form.find('._irr') : _form.find('._rr')
        antiInput.val(100 - nValue)
        $(_input).val(nValue)

        const nRR = isRR ? nValue : 100 - nValue
        const nIRR = isRR ? 100 - nValue : nValue
        _form.find('._ptf').val(Math.ceil(nRR /5))
        _form.find('._ptc').val(Math.ceil(nIRR /5))
    }

    /**
     * Competencias
     * @param {*} actor 
     */
    static async _action_step8(actor) {

        const skills = helperSheets.systemSkills(actor)
        const maxWzSkills = configRULES[actor.system.rules].maxWzSkills
        const ptProfesion = configRULES[actor.system.rules].ptProfesion
        const ptLibres = configRULES[actor.system.rules].ptLibres

        let systemSkills = actor.system.competencias
        skills.map(skill => {
            let oSkill = systemSkills.find(e => e.key === skill.key)
            if (!oSkill) return
            
            const nBase = actor.system.caracteristicas[skill.item.system.caracteristica].value

            oSkill.aprendida = false
            oSkill.checked = false
            oSkill.normal = !oSkill.primaria && !oSkill.secundaria && !oSkill.paterna
            oSkill.stats.value = oSkill.primaria ? nBase * 3 : nBase
            oSkill.stats.value = oSkill.stats.value > maxWzSkills ? maxWzSkills :
                                 oSkill.stats.value < 0 ? 0 : oSkill.stats.value
            oSkill.stats.min = oSkill.stats.value
            oSkill.stats.total = oSkill.stats.value             
        })
        await actor.update({ "system.competencias": systemSkills }, { render: false })

        let nIndex = 0
        let nColumnIndex = 0
        let nColumnPast = 0

        let sSkill = ''
        skills.map(skill => {
            if (skill.blank || !skill.stats) return

            const oSkill = systemSkills.find(e => e.key === skill.key)
            const nValue = oSkill.stats.value > maxWzSkills ? maxWzSkills : oSkill.stats.value
            const nColumn = nIndex > skills.length * 0.66 ? 3 :
                            nIndex > skills.length * 0.33 ? 2 : 1

            if (nColumn !== nColumnPast) { 
                nColumnPast = (nColumn + 0) 
                nColumnIndex = 0
            }

            const _background = nColumn === 1 ? nColumnIndex % 2 !== 0 : 
                                nColumn === 2 ? nColumnIndex % 2 === 0 : 
                                nColumn === 3 ? nColumnIndex % 2 !== 0 : false

            if (skill.folder) {

                sSkill += `<div class="_skill _folder ${_background ? '_background' : ''}" style="grid-column: ${nColumn}">
                                <div class="_spaced"></div>
                                <label class="_title" data-id="${skill.item.id}">${skill.item.name}</label>
                           </div>`

            } else {

                sSkill += `<div class="_skill  ${_background ? '_background' : ''} 
                                               ${skill.subSkill ? '_subSkill' : ''}
                                               ${oSkill.primaria ? '_primaria' : 
                                                 oSkill.secundaria ? '_secundaria' :
                                                 oSkill.paterna ? '_paterna' : '' }" style="grid-column: ${nColumn}"
                                               data-key="${skill.key}">
                                <input type="checkbox"
                                       disabled
                                       data-key="${skill.key}"
                                       class="_aprendida" />            
                                <img class="_img" data-id="${skill.item.id}" src="${skill.item.img}"</img>                                
                                <label class="_title" data-id="${skill.item.id}">${skill.item.name} (${skill.char})</label>                              
                                <div class="_combo">
                                    <input type="number"
                                            class="_skillValue"
                                            data-key="${skill.key}"
                                            data-char="${skill.item.system.caracteristica}"
                                            data-base="${nValue}"
                                            data-ptprofesion="${ptProfesion}"
                                            data-ptlibres="${ptLibres}"
                                            data-primaria="${oSkill.primaria ? 'true' : 'false'}"
                                            data-secundaria="${oSkill.secundaria ? 'true' : 'false'}"
                                            data-paterna="${oSkill.paterna ? 'true' : 'false'}"
                                            value="${nValue}"
                                            min="${oSkill.stats.min}"
                                            max="${maxWzSkills}" />
                                    <label>%</label>
                                </div>
                            </div>`
            }
            nIndex++
            nColumnIndex++
        })

        const sContent = `<div class="_description">${game.i18n.localize("wizard.step8.description_"+actor.system.rules)}</div>                          
                          <div id="_content" class="_wizardChars2">
                            <div class="_legend">
                                <div class="_combo _gapped">
                                    <div class="_round _primaria"></div>
                                    <label>${game.i18n.localize('common.primaria')}</label>
                                </div>
                                <div class="_combo _gapped">
                                    <div class="_round _secundaria"></div>
                                    <label>${game.i18n.localize('common.secundaria')}</label>
                                </div>
                                <div class="_combo _gapped">
                                    <div class="_round _paterna"></div>
                                    <label>${game.i18n.localize('common.paterna')}</label>
                                </div>  
                                <div class="_points _profesion">
                                    <label class="_title">${game.i18n.localize('common.ptProfesion')}:</label>
                                    <label class="_total">0</label>
                                    <label class="_totalMax">/ ${ptProfesion}</label>
                                </div>
                                <div class="_points _libres">
                                    <label class="_title">${game.i18n.localize('common.ptLibres')}:</label>
                                    <label class="_total">0</label>
                                    <label class="_totalMax">/ ${ptLibres}</label>
                                </div>                                
                                <button type="button" class="_action" data-action="showChars">${game.i18n.localize('common.verChars')}</button>                                                             
                            </div>
                            <div class="_skills">
                                ${sSkill}               
                            </div>           

                            <div class="_row _right">
                                <button class="_action" 
                                        type="button"
                                        data-action="continue">${game.i18n.localize('common.continuar')}</button>
                            </div>                            
                          </div>` 

        await this.dialog({actor, content: sContent, position: {width: 1300},
            fEvent: (_event, dialog) => {
                const form = $(dialog.element).find('form')
                form.scrollTop(0)
                form.find('._skill ._title, ._img').on('click', (_event) => {                    
                    const item = actor.items.get($(_event.currentTarget).data('id'))
                    helperDialog.dialogDescription({document: item, bFromWizard: true})                    
                })
                form.find('button[data-action="showChars"]').on('click', (_event) => {
                    helperWizard._action_step6(actor, true, dialog)
                })
                form.find('input._skillValue').each((i, e) => {
                    $(e).on("change", (_event) => {
                        helperWizard._renderSkillsDialog(dialog, actor, false)
                    })
                })
            },
            fCallBack: async (_dialog, _event) => {
                const form = $(_event.currentTarget).parents('form')
                let competencias = actor.system.competencias
                const pointsTotalProfesion = Number(form.find('._points._profesion ._total').text())
                const pointsTotalLibres = Number(form.find('._points._libres ._total').text())

                if (pointsTotalProfesion > ptProfesion) return
                if (pointsTotalLibres > ptLibres) return

                form.find('._skills ._skill').each((i,e) => {
                    if ($(e).hasClass('_folder')) return
                    const sKey = $(e).data('key')
                    let oSkill = competencias.find(o => o.key === sKey)
                    oSkill.aprendida = $(e).find('._aprendida').prop('checked')
                    oSkill.stats.value = Number($(e).find('._skillValue').val())
                })

                await actor.update({
                    "system.control.wizard.step": 9,
                    "system.control.wizard.active": true,                                        
                    "system.competencias": competencias,
                    "system.atributos.pta.total": pointsTotalProfesion + pointsTotalLibres,
                    "system.atributos.pta.value": pointsTotalProfesion + pointsTotalLibres - ptProfesion - ptLibres
                })
                _dialog.close()
                await actor.sheet.render(true)             
            }
        })         
    }
    static _renderSkillsDialog(_dialog, actor, render=false) {
        const form = $(_dialog.element).find('form')
        let _totalProfesion = 0
        let _totalLibres = 0
        let _ptProfesion = 0
        let _ptLibres = 0
        form.find('input._skillValue').each((i, e) => {
            const primaria = !!$(e).data('primaria')
            const secundaria = !!$(e).data('secundaria')
            const paterna = !!$(e).data('paterna')
            const nChar = actor.system.caracteristicas[$(e).data('char')].value
            const nBase = primaria ? nChar * 3 : nChar
            const bAprendida = form.find(`._aprendida[data-key="${$(e).data('key')}"]`)

            if (!bAprendida.prop("checked") && render) $(e).val(nBase)

            if (Number($(e).val()) < nBase) { $(e).val(nBase) }
            if (Number($(e).val()) > Number($(e).val())) { $(e).val(nBase) }
            const nDiff = Number($(e).val()) - nBase

            _ptProfesion = Number($(e).data('ptprofesion'))
            _ptLibres = Number($(e).data('ptlibres'))            
            if (primaria || secundaria || paterna) _totalProfesion += nDiff
                                              else _totalLibres += nDiff * 2

            if (nDiff !== 0) bAprendida.prop("checked", true)
                        else bAprendida.prop("checked", false)
        })
        if (_totalProfesion > _ptProfesion) {
            _totalLibres = _totalLibres + ( _totalProfesion - _ptProfesion )
            _totalProfesion = _ptProfesion
        }

        form.find('._points._profesion ._total').text(_totalProfesion)
        form.find('._points._libres ._total').text(_totalLibres)        

        const button = form.find('button[data-action="continue"]')
        button.show()
        if (_totalProfesion > _ptProfesion) {
            form.find('._points._profesion ._total').addClass('_bad')
            button.hide()
        } else form.find('._points._profesion ._total').removeClass('_bad')
        if (_totalLibres > _ptLibres) {
            form.find('._points._libres ._total').addClass('_bad')
            button.hide()
        } else form.find('._points._libres ._total').removeClass('_bad')
    }

    /**
     * Dineros
     * @param {*} actor 
     */
    static async _action_step9(actor) {
        const economia = actor.system.economia
        const moneda = configRULES[actor.system.rules].moneda
        const monedaShort = configRULES[actor.system.rules].monedaShort
        const estrato = actor.items.find(e => e.type === 'estrato' && e.system.rules === actor.system.rules)

       economia.ingresos = helperContext.calcIngresos(actor.system.economia.ingresosFormula, actor)
       economia.dineros = economia.ingresos
       economia.gastos = estrato ? estrato.system.gastos : 0
       await actor.update({ "system.economia": economia }, { render: false })

        const sContent = `<div class="_description">${game.i18n.localize("wizard.step9.description_"+actor.system.rules)}</div>
                          <div id="_content" class="_wizardChars2">
                            <div class="_row">
                                <label>${game.i18n.localize("common.formula")}:</label>
                                <label>${economia.ingresosFormula}</label>
                            </div>
                            <div class="_row">
                                <label>${game.i18n.localize("common.ingresosSemanales")}:</label>
                                <input type="number"
                                       class="_disabled"
                                       disabled
                                       style="width: calc(var(--fSize) * 5)"
                                       value="${economia.ingresos}" />
                                <label class="_extra">${moneda}</label>                                       
                            </div>
                            <div class="_row">
                                <label>${game.i18n.localize("common.gastosSemanales")}:</label>
                                <input type="number"
                                       class="_disabled"
                                       disabled
                                       style="width: calc(var(--fSize) * 5)"
                                       value="${economia.gastos}" />
                                <label class="_extra">(${estrato?.name})</label>                                       
                            </div>                            
                            <div class="_row">
                                <label>${game.i18n.localize("common.dineros")}:</label>
                                <input type="number"
                                       class="_disabled"
                                       disabled
                                       style="width: calc(var(--fSize) * 5)"
                                       value="${economia.dineros}" />
                                <label class="_extra">${moneda}</label>                                       
                            </div>
                            <div class="_row _right">
                                <button class="_action" 
                                        type="button"
                                        data-action="continue">${game.i18n.localize('common.continuar')}</button>
                            </div>                            
                          </div>` 

        await this.dialog({actor, content: sContent, position: {width: 800}, fCallBack: async (_dialog, _event) => {                          
            const form = $(_event.currentTarget).parents('form')           
            await actor.update({
                "system.control.wizard.step": 10,
                "system.control.wizard.active": true
            })
            _dialog.close()
        }})
        
    }
    
    /**
     * Talentos
     * @param {*} actor 
     */
    static async _action_step10(actor) {

        const rules = actor.system.rules
        const rulesTalentos = configRULES[rules].talentos

        const _talentos = {
            ensalmos: {
                visible: configRULES[actor.system.rules].talentos.ensalmos,
                name: rules === 'aq3' ? game.i18n.localize('common.rituales') : game.i18n.localize('common.talento_ensalmos'),
                ok: false,
                config: aqConfig.ensalmos[actor.system.rules],
                skill: { item: null, stats: {} },
                content: ""
            },
            hechizos: {
                visible: configRULES[actor.system.rules].talentos.hechizos,
                name: game.i18n.localize('common.talento_hechizos'),
                ok: false,
                config: aqConfig.hechizos[actor.system.rules],
                skill: { item: null, stats: {} },
                content: ""
            },
            alquimia: {
                visible: configRULES[actor.system.rules].talentos.alquimia,
                name: game.i18n.localize('common.talento_alquimia'),
                ok: false,
                config: aqConfig.alquimia[actor.system.rules],
                skill: { item: null, stats: {} },
                content: ""
            },
            esgrima: {
                visible: configRULES[actor.system.rules].talentos.esgrima,
                name: game.i18n.localize('common.talento_esgrima'),
                ok: false,
                config: aqConfig.esgrima[actor.system.rules],
                skill: { item: null, stats: {} },
                content: ""
            },
        }
        for (var s in _talentos) {
            if (!_talentos[s].visible) continue
            _talentos[s].skill.item = actor.items.find(e => e.type === 'competencia' && e.system.rules === actor.system.rules &&
                                                            e.system.key === _talentos[s].config.requisitos.skillID)
            _talentos[s].skill.stats = actor.system.competencias.find(e => e.key === _talentos[s].config.requisitos.skillID)?.stats
            _talentos[s].ok = rulesTalentos[s] && _talentos[s].skill.stats.value >= _talentos[s].config.requisitos.minSkill
            if (s === 'ensalmos')  _talentos[s].ok =  _talentos[s].ok && actor.system.atributos.rr.value >= _talentos[s].config.requisitos.minRR
            if (s === 'hechizos')  _talentos[s].ok =  _talentos[s].ok && actor.system.atributos.irr.value >= _talentos[s].config.requisitos.minIRR

            if (rulesTalentos[s]) {
                _talentos[s].content = `<div class="_row">
                    <label class="_20 _bold">${_talentos[s].name}:</label>
                    <div class="_combo _gapped _40">
                        <div class="_combo _gapped">
                            <label>${_talentos[s].skill.item?.name}:</label>
                            <label>${_talentos[s].config.requisitos.minSkill}%</label>
                        </div>
                        ${s === 'ensalmos' ? 
                            `<div class="_combo _gapped">
                                <label>${game.i18n.localize('ATTR.rr')}:</label>
                                <label>${_talentos[s].config.requisitos.minRR}%</label>
                             </div>` : ''
                        }
                        ${s === 'hechizos' ? 
                            `<div class="_combo _gapped">
                                <label>${game.i18n.localize('ATTR.irr')}:</label>
                                <label>${_talentos[s].config.requisitos.minIRR}%</label>
                            </div>` : ''
                        }                        
             
                    </div> 
                    <div class="_combo _gapped _40">
                        <div class="_combo _gapped">
                            <label>${_talentos[s].skill.item?.name}:</label>
                            <label class="${_talentos[s].skill.stats?.value >= _talentos[s].config.requisitos.minSkill ? '_green' : '_red'}">
                                    ${_talentos[s].skill.stats?.value}%</label>
                        </div>
                        ${s === 'ensalmos' ?
                            `<div class="_combo _gapped">
                                <label>${game.i18n.localize('ATTR.rr')}:</label>
                                <label class="${actor.system.atributos.rr.value >= _talentos[s].config.requisitos.minRR ? '_green' : '_red'}">
                                        ${actor.system.atributos.rr.value}%</label>
                            </div>`  : ''
                        }  
                        ${s === 'hechizos' ?
                            `<div class="_combo _gapped">
                                <label>${game.i18n.localize('ATTR.irr')}:</label>
                                <label class="${actor.system.atributos.irr.value >= _talentos[s].config.requisitos.minIRR ? '_green' : '_red'}">
                                        ${actor.system.atributos.irr.value}%</label>
                            </div>`  : ''
                        }                                    
                    </div>                                         
                </div>`
            }
        }


        // --- ENSALMOS ---
        let sEnsalmos = ""
        const mEnsalmos0 = actor.items.filter(e => e.type === 'ensalmo').map(item => item.id)
        await actor.deleteEmbeddedDocuments("Item", mEnsalmos0, { render: false })

        if (_talentos.ensalmos.ok) {
            const eInicial = _talentos.ensalmos.config.iniciales.find(e => e.min <= _talentos.ensalmos.skill.stats.value
                                                                        && e.max >= _talentos.ensalmos.skill.stats.value)
            if (eInicial) {
                const mEnsalmos = await helperContext.getFromCompendium(rules, 'ensalmo')
                const mNewEnsalmos = mEnsalmos.filter(e => Number(e.system.ordo.substr(4,1)) <= eInicial.ordo).map(item => {
                    const data = item.toObject()
                    delete data._id
                    return data
                })                
                await actor.createEmbeddedDocuments("Item", mNewEnsalmos, { render: false })

                sEnsalmos = `<h4 class="_100">${rules === 'aq3' ? game.i18n.localize("common.ritualesAprendidos") :
                                                                  game.i18n.localize("common.ensalmosAprendidos") }</h4>
                             <div class="_table" id="_ensalmos">`  
                actor.items.filter(e => e.type === 'ensalmo').map(item => {
                    sEnsalmos += `<div class="_row">
                                    <label class="_bold _action" data-id="${item.id}" data-action="_show">${item.name}</label>
                                    <label>${game.i18n.localize('common.'+item.system.ordo)}</label>
                                  </div>`
                })              
                sEnsalmos += `</div>`
            }
        }

        // --- HECHIZOS ---
         let sHechizos = ""
         let mHechizos = []
         let hInicial = null
        const mHechizos0 = actor.items.filter(e => e.type === 'hechizo').map(item => item.id)
        await actor.deleteEmbeddedDocuments("Item", mHechizos0, { render: false })

        if (_talentos.hechizos.ok) {
            hInicial = _talentos.hechizos.config.iniciales.find(e => e.min <= _talentos.hechizos.skill.stats.value
                                                                  && e.max >= _talentos.hechizos.skill.stats.value)
            if (hInicial) {
                const mHechizos0 = await helperContext.getFromCompendium(rules, 'hechizo')
                mHechizos = mHechizos0

                let _select = `<select class="_selector" id="hechizos">`
                const niveles = helperContext.getHechizosNiveles(rules)
                for (var s in niveles) {
                    _select += `<optgroup label="${niveles[s].label}">`
                        mHechizos.filter(e => e.system.vis === s).map(e => {
                            _select += `<option value="${e.id}" data-id="${e.id}">VIS: ${niveles[s].label} - ${e.name} ${ niveles[s].pta !== 0 ? `(${niveles[s].pta} pt.Ap)` : ''}</option>`
                        })
                    _select += `</optgroup>`
                }
                _select += `</select>`

                const sHHeader = hInicial.ptAp === 0 ?
                            `<label>${game.i18n.localize("common.numHechizosIniciales")}:</label><label class="_big"><span class="_value">0</span>/${hInicial.fijos}</label>` :
                            `<label>${game.i18n.localize("common.ptAHechizosIniciales")}:</label><label class="_big"><span class="_value">0</span>/${hInicial.ptAp}</label>`

                sHechizos = `<h4 class="_100">${game.i18n.localize("common.hechizosAprendidos")}</h4>                             
                             <div class="_row _gapped">
                                ${_select}
                                <button class="_action" type="button" data-action="_showHechizo"><i class="fa-solid fa-magnifying-glass"></i>${game.i18n.localize('common.ver')}</button>
                                <button class="_action" type="button" data-action="_addHechizo"><i class="fa-solid fa-plus"></i>${game.i18n.localize('common.anadir')}</button>
                             </div>
                             <div class="_row _boxed _gapped" id="_hechizosHeader">
                                ${sHHeader}
                             </div>
                             <div class="_table" id="_hechizos">
                             </div>`
            }
        }

        // --- TRETAS DE ESGRIMA ---
         let sEsgrima = ""
         let mEsgrima = []
         let eInicial = null
        const mEsgrima0 = actor.items.filter(e => e.type === 'accion' && e.system.treta.treta).map(item => item.id)
        await actor.deleteEmbeddedDocuments("Item", mEsgrima0, { render: false })

        if (_talentos.esgrima.ok) {
            eInicial = _talentos.esgrima.config.iniciales.find(e => e.min <= _talentos.esgrima.skill.stats.value
                                                                 && e.max >= _talentos.esgrima.skill.stats.value)
            if (eInicial) {
                const mEsgrima0 = (await helperContext.getFromCompendium(rules, 'accion')).filter(e => e.system.treta.treta)
                mEsgrima = mEsgrima0

                let _select = `<select class="_selector" id="esgrima">`
                mEsgrima.map(e => {
                    const sTag1 = e.system.ataque ? game.i18n.localize('common.ataque') :
                                    e.system.defensa ? game.i18n.localize('common.defensa') : '' 
                    const sTag2 = e.system.treta.verdadera ? ` - [${game.i18n.localize('common.tretaVerdadera')}]` :
                                    e.system.treta.vulgar ? `- [${game.i18n.localize('common.tretaVulgar')}]` : ''
                    _select += `<option value="${e.id}" data-id="${e.id}">${e.name} - ${sTag1} (${e.system.treta.ptAp} pt.Ap) ${sTag2}</option>`
                })
                
                _select += `</select>`

                const sEHeader = `<label>${game.i18n.localize("common.ptATretasIniciales")}:</label><label class="_big"><span class="_value">0</span>/${eInicial.ptAp}</label>`

                sEsgrima = `<h4 class="_100">${game.i18n.localize("common.tretasAprendidas")}</h4>                             
                             <div class="_row _gapped">
                                ${_select}
                                <button class="_action" type="button" data-action="_showTreta"><i class="fa-solid fa-magnifying-glass"></i>${game.i18n.localize('common.ver')}</button>
                                <button class="_action" type="button" data-action="_addTreta"><i class="fa-solid fa-plus"></i>${game.i18n.localize('common.anadir')}</button>
                             </div>
                             <div class="_row _boxed _gapped" id="_tretasHeader">
                                ${sEHeader}
                             </div>
                             <div class="_table" id="_esgrima">
                             </div>`
            }
        }

        // --- FORMULAS ALQUÍMICAS ---
         let sAlquimia = ""
         let mAlquimia = []
         let aInicial = null
        const mAlquimia0 = actor.items.filter(e => e.type === 'formula').map(item => item.id)
        await actor.deleteEmbeddedDocuments("Item", mAlquimia0, { render: false })

        if (_talentos.alquimia.ok) {
            aInicial = _talentos.alquimia.config.iniciales.find(e => e.min <= _talentos.alquimia.skill.stats.value
                                                                  && e.max >= _talentos.alquimia.skill.stats.value)
            if (aInicial) {
                const mAlquimia0 = (await helperContext.getFromCompendium(rules, 'formula'))
                mAlquimia = mAlquimia0
                let _select = `<select class="_selector" id="alquimia">`
                mAlquimia.map(e => {
                    _select += `<option value="${e.id}" data-id="${e.id}">${e.name} (${game.i18n.localize('common.alquimia')}: ${e.system.requisitos.alquimia}%, ${e.system.pta} pt.Ap)</option>`
                })
                _select += `</select>`

                const sAHeader = `<label>${game.i18n.localize("common.ptAFormulasIniciales")}:</label><label class="_big"><span class="_value">0</span>/${aInicial.ptAp}</label>`

                sAlquimia = `<h4 class="_100">${game.i18n.localize("common.formulasAprendidas")}</h4>                             
                             <div class="_row _gapped">
                                ${_select}
                                <button class="_action" type="button" data-action="_showFormula"><i class="fa-solid fa-magnifying-glass"></i>${game.i18n.localize('common.ver')}</button>
                                <button class="_action" type="button" data-action="_addFormula"><i class="fa-solid fa-plus"></i>${game.i18n.localize('common.anadir')}</button>
                             </div>
                             <div class="_row _boxed _gapped" id="_formulasHeader">
                                ${sAHeader}
                             </div>
                             <div class="_table" id="_alquimia">
                             </div>`
            }
        }

        // --- CONTENIDO ---
        let sRequisitos = `<div class="_table">
                            <div class="_row _header">
                                <label class="_20">${game.i18n.localize('common.talento')}</label>
                                <label class="_40">${game.i18n.localize('common.requisitos')}</label>
                                <label class="_40">${game.i18n.localize('common.personaje')}</label>
                            </div>
                            ${_talentos.ensalmos.content}
                            ${_talentos.hechizos.content}
                            ${_talentos.alquimia.content}
                            ${_talentos.esgrima.content}
                        </div>`

        const sContent = `<div class="_description">${game.i18n.localize("wizard.step10.description_"+actor.system.rules)}</div>                          
                          <div id="_content" class="_wizardChars2">
                            ${sRequisitos}   
                            ${sEnsalmos}  
                            ${sHechizos}
                            ${sEsgrima}
                            ${sAlquimia}
                            <div class="_row _right">
                                <button class="_action" 
                                        type="button"
                                        data-action="continue">${game.i18n.localize('common.continuar')}</button>
                            </div>                            
                          </div>` 

        await this.dialog({actor, content: sContent, position: {width: 1300},
            fEvent: (_event, dialog) => {
                const form = $(dialog.element).find('form')
                form.scrollTop(0)

                form.find('[data-action="_show"]').on('click', (_event) => {
                    const item = actor.items.get($(_event.currentTarget).data('id'))
                    helperDialog.dialogDescription({document: item, bFromWizard: true})                    
                })                

                /* --- HECHIZOS --- */
                form.find('[data-action="_showHechizo"]').on('click', (_event) => {
                    const _id = form.find('select#hechizos').val()
                    const item = mHechizos.find(e => e.id === _id)
                    helperDialog.dialogDescription({document: item, bFromWizard: true})
                })                  
                form.find('[data-action="_addHechizo"]').on('click', (_event) => {
                    const _id = form.find('select#hechizos').val()
                    const _table = form.find('._table#_hechizos')
                    const item = mHechizos.find(e => e.id === _id)
                    const nivel = _talentos.hechizos.config.niveles[item.system.vis]
                    let pta = 0; _table.find('._row').each((i, e) => { pta += Number(e.dataset.pta) || 0 })
                    let nHe = _table.find('._row').length
                    
                    if (_table.find(`._row[data-id="${item.id}"]`).length > 0) return
                    if (hInicial.ptAp > 0 && (pta + nivel.pta) > hInicial.ptAp) return
                    if (hInicial.ptAp === 0 && (nHe + 1) > hInicial.fijos) return

                    const _row = $(`<div class="_row _100" data-id="${item.id}" data-pta="${nivel.pta}">
                                      <label class="_80 _bold _action" data-id="${item.id}" data-action="_show">${item.name}</label>
                                      <label class="_20">${game.i18n.localize('common.'+item.system.vis)}
                                                         ${nivel.pta > 0 ? `(${nivel.pta} pt. Ap.)` : ''}</label>
                                      <button class="_action" data-action="_remove" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
                                   </div>`)
                    _table.append(_row)
                    _row.find('button[data-action="_remove"]').on('click', (_event) => {
                        const sId = $(_event.currentTarget).data('id')
                        const _table = form.find('._table#_hechizos')
                        _table.find(`._row[data-id="${sId}"]`).remove()
                        _valueHechizosAprendidos()
                    })
                    _row.find('label[data-action="_show"]').on('click', (_event) => {
                        helperDialog.dialogDescription({document: item, bFromWizard: true})
                    })

                    //Hechizos aprendidos
                    _valueHechizosAprendidos()
                    function _valueHechizosAprendidos() {
                        let pta0 = 0; _table.find('._row').each((i, e) => { pta0 += Number(e.dataset.pta) || 0 })
                        const nHe0 = _table.find('._row').length
                        let nValue = 0
                        if (hInicial.ptAp === 0) nValue = nHe0
                                            else nValue = pta0
                        form.find('#_hechizosHeader label span._value').text(nValue)
                    }
                })

                /* --- TRETAS DE ESGRIMA --- */
                form.find('[data-action="_showTreta"]').on('click', (_event) => {
                    const _id = form.find('select#esgrima').val()
                    const item = mEsgrima.find(e => e.id === _id)
                    helperDialog.dialogDescription({document: item, bFromWizard: true})
                })                 
                form.find('[data-action="_addTreta"]').on('click', (_event) => {
                    const _id = form.find('select#esgrima').val()
                    const _table = form.find('._table#_esgrima')
                    const item = mEsgrima.find(e => e.id === _id)
                    let pta = 0; _table.find('._row').each((i, e) => { pta += Number(e.dataset.pta) || 0 })                   
                    if (_table.find(`._row[data-id="${item.id}"]`).length > 0) return
                    if (eInicial.ptAp > 0 && (pta + item.system.treta.ptAp) > eInicial.ptAp) return

                    const sTag1 = item.system.ataque ? game.i18n.localize('common.ataque') :
                                    item.system.defensa ? game.i18n.localize('common.defensa') : '' 
                    const sTag2 = item.system.treta.verdadera ? ` - [${game.i18n.localize('common.tretaVerdadera')}]` :
                                    item.system.treta.vulgar ? `- [${game.i18n.localize('common.tretaVulgar')}]` : ''

                    const _row = $(`<div class="_row _100" data-id="${item.id}" data-pta="${item.system.treta.ptAp}">
                                      <label class="_80 _bold _action" data-id="${item.id}" data-action="_show">${sTag1} - ${item.name} ${sTag2}</label>
                                      <label class="_20">(${item.system.treta.ptAp} pt. Ap.)</label>
                                      <button class="_action" data-action="_remove" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
                                   </div>`)
                    _table.append(_row)
                    _row.find('button[data-action="_remove"]').on('click', (_event) => {
                        const sId = $(_event.currentTarget).data('id')
                        const _table = form.find('._table#_esgrima')
                        _table.find(`._row[data-id="${sId}"]`).remove()
                        _valueTretasAprendidos()
                    })
                    _row.find('label[data-action="_show"]').on('click', (_event) => {
                        helperDialog.dialogDescription({document: item, bFromWizard: true})
                    })

                    //Treta de Esgrima aprendidas
                    _valueTretasAprendidos()
                    function _valueTretasAprendidos() {
                        let pta0 = 0; _table.find('._row').each((i, e) => { pta0 += Number(e.dataset.pta) || 0 })
                        form.find('#_tretasHeader label span._value').text(pta0)
                    }
                })

                /* --- FÓRMULAS ALQUÍMICAS --- */
                form.find('[data-action="_showFormula"]').on('click', (_event) => {
                    const _id = form.find('select#alquimia').val()
                    const item = mAlquimia.find(e => e.id === _id)
                    helperDialog.dialogDescription({document: item, bFromWizard: true})
                })                 
                form.find('[data-action="_addFormula"]').on('click', (_event) => {
                    const _id = form.find('select#alquimia').val()
                    const _table = form.find('._table#_alquimia')
                    const item = mAlquimia.find(e => e.id === _id)
                    let pta = 0; _table.find('._row').each((i, e) => { pta += Number(e.dataset.pta) || 0 })                   
                    if (_table.find(`._row[data-id="${item.id}"]`).length > 0) return
                    if (aInicial.ptAp > 0 && (pta + item.system.pta) > aInicial.ptAp) return

                    const _row = $(`<div class="_row _100" data-id="${item.id}" data-pta="${item.system.pta}">
                                      <label class="_80 _bold _action" data-id="${item.id}" data-action="_show">${item.name} (${game.i18n.localize('common.alquimia')}: ${item.system.requisitos.alquimia}%)</label>
                                      <label class="_20">(${item.system.pta} pt. Ap.)</label>
                                      <button class="_action" data-action="_remove" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
                                   </div>`)
                    _table.append(_row)
                    _row.find('button[data-action="_remove"]').on('click', (_event) => {
                        const sId = $(_event.currentTarget).data('id')
                        const _table = form.find('._table#_alquimia')
                        _table.find(`._row[data-id="${sId}"]`).remove()
                        _valueFormulasAprendidas()
                    })
                    _row.find('label[data-action="_show"]').on('click', (_event) => {
                        helperDialog.dialogDescription({document: item, bFromWizard: true})
                    })

                    //Fórmulas alquímicas aprendidas
                    _valueFormulasAprendidas()
                    function _valueFormulasAprendidas() {
                        let pta0 = 0; _table.find('._row').each((i, e) => { pta0 += Number(e.dataset.pta) || 0 })
                        form.find('#_formulasHeader label span._value').text(pta0)
                    }
                })                

            },
            fCallBack: async (_dialog, _event) => {
                const form = $(_event.currentTarget).parents('form')

                let mNewItems = []
                if (_talentos.hechizos.ok) {                    
                    form.find('._table#_hechizos').find('._row').each((i, row) => {
                        const data = mHechizos.find(e => e.id === row.dataset.id).toObject()
                        delete data._id
                        mNewItems.push(data)
                    })
                }
                if (_talentos.esgrima.ok) {                    
                    form.find('._table#_esgrima').find('._row').each((i, row) => {
                        const data = mEsgrima.find(e => e.id === row.dataset.id).toObject()
                        delete data._id
                        mNewItems.push(data)
                    })
                }
                if (_talentos.alquimia.ok) {                    
                    form.find('._table#_alquimia').find('._row').each((i, row) => {
                        const data = mAlquimia.find(e => e.id === row.dataset.id).toObject()
                        delete data._id
                        mNewItems.push(data)
                    })
                }
                if (mNewItems.length > 0)                                
                    await actor.createEmbeddedDocuments("Item", mNewItems, { render: false })

                _dialog.close()
                await actor.update({
                    "system.control.wizard.step": 11,
                    "system.control.wizard.active": true,                                        
                })
            }
        })      
        
    }
    
    /**
     * Rasgos de Caracter
     * @param {*} actor 
     */
    static async _action_step11(actor) {
        const rules = actor.system.rules

        const mRasgos0 = actor.items.filter(e => e.type === 'rasgo').map(item => item.id)
        await actor.deleteEmbeddedDocuments("Item", mRasgos0, { render: false })

        const estrato = actor.items.find(e => e.type === 'estrato' & e.system.rules === actor.system.rules)
        if (!estrato) return

        const _tiradas = aqConfig.rasgosWizard[rules].tiradas

        const mRasgos = await helperContext.getFromCompendium(rules, 'rasgo')
        let _select = `<select class="_selector" id="rasgos">`
            _select += `<optgroup label="${game.i18n.localize('common.orgullos')}">`
            mRasgos.filter(e => e.system.orgullo).map(e => {
                _select += `<option value="${e.id}" data-id="${e.id}">${e.name}  [ ${e.system.coste} pt.]</option>`
            })
            _select += `</optgroup>`
            _select += `<optgroup label="${game.i18n.localize('common.verguenzas')}">`
            mRasgos.filter(e => e.system.verguenza).map(e => {
                _select += `<option value="${e.id}" data-id="${e.id}">${e.name}   [ ${e.system.coste} pt.]</option>`
            })
            _select += `</optgroup>`        
        _select += `</select>`

        const sBarPorEdad = `<div class="_row _boxed _gapped _spaced" id="_edadHeader">
                        <div class="_combo _gapped">
                            <label class="_bold">${game.i18n.localize('common.edad')}</label>
                            <div class="_combo _gapped _bothPadded">
                                <input type="number" id="_edad" min="17" max="99" class="_input" value="25"/>
                                <label class="_italic">${game.i18n.localize('common.anos')}</label>
                            </div>
                        </div>
                        <div class="_combo _gapped">
                            <div class="_combo _gapped _boxed _bothPadded">
                                <label>${game.i18n.localize("common.tiradasObligatorias")}:</label>
                                <label class="_big"><span class="_tiradasObligatorias">0</span></label>
                            </div>    
                            <div class="_combo _gapped _boxed _bothPadded">
                                <label>${game.i18n.localize("common.tiradas")}:</label>
                                <label class="_big"><span class="_tiradas">0</span>/4</label>
                            </div>
                            <button type="button" class="_action" data-action="roll"><i class="fa-regular fa-dice-d10"></i>${game.i18n.localize('common.tirada')}</button>
                        </div>                                             
                     </div>`

        const sBar = `<div class="_row _boxed _gapped _spaced" id="_rasgosHeader">
                        <label class="_bold">${estrato.name}</label>
                        <div class="_combo _gapped">
                            <div class="_combo _gapped _boxed _bothPadded">
                                <label>${game.i18n.localize("common.orgullosMax")}:</label>
                                <label class="_big">${estrato.system.rasgos.orgullosMax}</label>
                                <label class="_italic">pt.</label>
                            </div>
                            <div class="_combo _gapped _boxed _bothPadded">
                                <label>${game.i18n.localize("common.total")}:</label>
                                <label class="_big"><span class="_value">0</span>/${estrato.system.rasgos.total}</label>
                                <label class="_italic">pt.</label>
                            </div>                                    
                        </div>
                     </div>`
        const sBar2 =    `<div class="_row _gapped">
                            ${_select}
                            <button class="_action" type="button" data-action="_showRasgo"><i class="fa-solid fa-magnifying-glass"></i>${game.i18n.localize('common.ver')}</button>
                            <button class="_action" type="button" data-action="_addRasgo"><i class="fa-solid fa-plus"></i>${game.i18n.localize('common.anadir')}</button>
                          </div>`

        const sContent = `<div class="_description">${game.i18n.localize("wizard.step11.description_"+actor.system.rules)}</div>                          
                          <div id="_content" class="_wizardChars2">
                             ${sBar}
                             ${sBar2}
                             <div class="_table" id="_rasgos">
                             </div>                                                          
                             <div class="_row _right">
                                <button class="_action" 
                                        type="button"
                                        data-action="continue">${game.i18n.localize('common.continuar')}</button>
                             </div>                            
                          </div>` 
        await this.dialog({actor, content: sContent, position: {width: 1300},
            fEvent: (_event, dialog) => {
                const form = $(dialog.element).find('form')
                form.scrollTop(0)
                form.find('button[data-action="continue"]').hide()

                _checkEdad()
                form.find('input#_edad').on('change', (_event) => {
                    _checkEdad()
                })
                form.find('button[data-action="roll"]').on('click', async (_event) => {
                    const roll = await helperRolls.roll({actor, target:"simple", formula:'1D100', title: "", subtitle: ""})
                })

                form.find('[data-action="_showRasgo"]').on('click', (_event) => {
                    const _id = form.find('select#rasgos').val()
                    const item = mRasgos.find(e => e.id === _id)
                    helperDialog.dialogDescription({document: item, bFromWizard: true})                
                }) 
                form.find('[data-action="_addRasgo"]').on('click', (_event) => {
                    const _id = form.find('select#rasgos').val()
                    const _table = form.find('._table#_rasgos')
                    const item = mRasgos.find(e => e.id === _id)
                    if (_table.find(`._row[data-id="${item.id}"]`).length > 0) return

                    let total = 0; _table.find('._row').each((i, e) => { total += Number(e.dataset.coste) || 0 }) 
                    let nOrgullos = 0; _table.find('._row').each((i, e) => { if ( Number(e.dataset.coste) > 0 ) nOrgullos += Number(e.dataset.coste) }) 
                    if ( (nOrgullos + item.system.coste) > estrato.system.rasgos.orgullosMax) return

                    const sTag = item.system.orgullo ? game.i18n.localize('common.orgullo') :
                                 item.system.verguenza ? game.i18n.localize('common.verguenza') : ''
                    const _row = $(`<div class="_row _100" data-id="${item.id}" data-coste="${item.system.coste}">
                                      <label class="_80 _bold _action" data-id="${item.id}" data-action="_show">(${sTag}) - ${item.name}</label>
                                      <label class="_20">${item.system.coste} pt.</label>
                                      <button class="_action" data-action="_remove" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
                                   </div>`)
                    _table.append(_row)
                    _row.find('button[data-action="_remove"]').on('click', (_event) => {
                        const sId = $(_event.currentTarget).data('id')
                        const _table = form.find('._table#_rasgos')
                        _table.find(`._row[data-id="${sId}"]`).remove()
                        _valueRasgosTotal()
                    })
                    _row.find('label[data-action="_show"]').on('click', (_event) => {
                        helperDialog.dialogDescription({document: item, bFromWizard: true})
                    })

                    //Rasgos Total
                    _valueRasgosTotal()
                    function _valueRasgosTotal() {
                        form.find('button[data-action="continue"]').hide()
                        let total = 0; _table.find('._row').each((i, e) => { total += Number(e.dataset.coste) || 0 })
                        form.find('#_rasgosHeader label span._value').text(total)
                        if (total === estrato.system.rasgos.total) form.find('button[data-action="continue"]').show()
                    }                    
                })

                function _checkEdad() {
                    return
                    const cEdad = form.find('input#_edad')
                    if (Number(cEdad.val()) < Number(cEdad.attr('min'))) cEdad.val(Number(cEdad.attr('min')))
                    if (Number(cEdad.val()) > Number(cEdad.attr('max'))) cEdad.val(Number(cEdad.attr('max')))

                    const nEdad = Number(cEdad.val())
                    const _tirada = _tiradas.find(e => e.min <= nEdad && e.max >= nEdad )
                    form.find('._tiradas').text()
                    form.find('._tiradasObligatorias').text(_tirada.obligatorias)
                }
            },
            fCallBack: async (_dialog, _event) => {
                const form = $(_event.currentTarget).parents('form')
                const _table = form.find('._table#_rasgos')
                let mNewRasgos = []
                _table.find('._row').each((i, e) => { 
                    const data = mRasgos.find(e2 => e2.id === e.dataset.id).toObject()
                    delete data._id
                    mNewRasgos.push(data)
                })
                await actor.createEmbeddedDocuments("Item", mNewRasgos, { render: false })

                _dialog.close()
                await actor.update({
                    "system.control.wizard.step": 12,
                    "system.control.wizard.active": true,                                        
                })
            }  
        })                        
    }    

    /**
     * Últimos Pasos
     * @param {*} actor 
     */
    static async _action_step12(actor) {

        const rules = actor.system.rules
        const _chars = actor.system.caracteristicas
        const charEval = _chars.fue.value > _chars.res.value ? _chars.fue.value : _chars.res.value;

        const info = {
            _altura: Math.round(charEval*2.49 + 139.36)/100,
            _peso:  Math.round(charEval*3.72 + 88.49)
        };
        [[5,106], [6,110], [7,118], [8,120], [9,122], [10,125], [11,128], [12,132], [13,134], [14,140], [15,146]].map(e => {
            if (charEval === e[0]) info._peso = e[1]
        })

        const enrichedText = await TextEditor.enrichHTML(actor.system.info.trasfondo.value, {
            async: true
        });

        const sContent = `<div class="_description">${game.i18n.localize("wizard.step12.description_"+actor.system.rules)}
                          </div>
                          <form id="_content">
                            <div class="_row _gapped">
                                <label class="_rowed">${game.i18n.localize('common.nombre')}</label>
                                <div class="_combo _gapped _bothPadded">
                                    <input type="text" id="name" 
                                        value="${actor.name}"
                                        class="_100 _big"></input>
                                </div>
                            </div>
                            <div class="_row _gapped">
                                <label class="_rowed">${game.i18n.localize('common.edad')}</label>
                                <div class="_combo _gapped _bothPadded">
                                    <input type="number" id="_edad" 
                                           min="17" 
                                           max="99" 
                                           class="_input _big _minMax" 
                                           value="25"/>
                                    <label class="_italic">${game.i18n.localize('common.anos')}</label>
                                </div>
                            </div>
                            <div class="_row _gapped">
                                <label class="_rowed">${game.i18n.localize('common.altura')}</label>
                                <div class="_combo _gapped _bothPadded">
                                    <input type="number" id="_altura" 
                                           min="0.5" 
                                           max="2.5" 
                                           class="_input _big _minMax" 
                                           value="${info._altura}"/>
                                    <button type="button" data-action="_calc" 
                                            data-tooltip="${game.i18n.localize('common.calcular')}"
                                            data-path="_altura"><i class="fa-solid fa-calculator"></i></button>
                                    <label class="_italic">${configRULES[rules].unitAltura}</label>
                                </div>
                            </div>                            
                            <div class="_row _gapped">
                                <label class="_rowed">${game.i18n.localize('common.peso')}</label>
                                <div class="_combo _gapped _bothPadded">
                                    <input type="number" id="_peso" 
                                           min="30" 
                                           max="250" 
                                           class="_input _big _minMax" 
                                           value="${info._peso}"/>                                    
                                    <button type="button" data-action="_calc" 
                                            data-tooltip="${game.i18n.localize('common.calcular')}"
                                            data-path="_peso"><i class="fa-solid fa-calculator"></i></button>
                                    <label class="_italic">${configRULES[rules].unitPeso}</label>
                                </div>
                            </div>
                            <div class="_row _gapped">
                                <label class="_rowed">${game.i18n.localize('common.familia')}</label>
                                <div class="_combo _gapped _bothPadded">
                                    <input type="text" id="_familia" 
                                        value="${actor.system.info.familia.value}"
                                        class="_100 _big"></input>
                                </div>
                            </div>    
                            <div class="_row _gapped">
                                <label class="_rowed">${game.i18n.localize('common.descripcion')}</label>
                                <div class="_combo _gapped _bothPadded">
                                    <input type="text" id="_descripcion" 
                                        value="${actor.system.info.descripcion.value}"
                                        class="_100 _big"></input>
                                </div>
                            </div>                                                    
                            <h4>${game.i18n.localize('common.trasfondo')}</h4>
                            <div class="_row _gapped">
                                <prose-mirror name="trasfondoText" value="${Handlebars.escapeExpression(actor.system.info.trasfondo.value)}">
                                    ${enrichedText}
                                </prose-mirror>                             
                            </div>                            

                            <div class="_row _right">
                                <button class="_action" 
                                        type="button" 
                                        data-action="continue">${game.i18n.localize('common.finalizar')}</button>
                            </div>
                          </form>`

        await this.dialog({actor, content: sContent, position: {width: 1100},
            fEvent: (_event, dialog) => {
                const form = $(dialog.element).find('form')
                form.find('input._minMax').on('change', (_event) => {
                    const control =  $(_event.currentTarget)
                    if (Number(control.val()) < Number(control.attr('min'))) control.val(Number(control.attr('min')))
                    if (Number(control.val()) > Number(control.attr('max'))) control.val(Number(control.attr('max')))
                })
                form.find('button[data-action="_calc"]').on('click', (_event) => {
                    const path =  $(_event.currentTarget).data('path')
                    form.find('input#'+path).val(info[path])

                })
            },
            fCallBack: async (_dialog, _event) => {                          
                const form = $(_event.currentTarget).parents('form')
                const system = actor.system
                system.name = form.find('input#name').val()
                system.info.edad = form.find('input#_edad').val()
                system.info.altura = form.find('input#_altura').val()
                system.info.peso = form.find('input#_peso').val()
                system.info.familia.value = form.find('input#_familia').val()
                system.info.descripcion.value = form.find('input#_descripcion').val()
                system.info.trasfondo.value = form.find('[name="trasfondoText"]').val()

                await actor.update({
                    "name": system.name,
                    "system.info": system.info,
                    "system.control.wizard.step": 12,
                    "system.control.wizard.active": false,
                    "system.control.wizard.show": false
                })
                _dialog.close()
            }})
        
    } 

}