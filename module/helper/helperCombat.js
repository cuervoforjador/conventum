import { SYSTEM_ID } from "../config/uiConstants.js"
import { configRULES } from "../config/rules.js"
import { aqConfig } from "../config/config.js"
import helperContext from "./helperContext.js"
import helperDialog from "./helperDialog.js"
import helperTools from "./helperTools.js"
import helperMessages from "./helperMessages.js"
import helperSheets from "./helperSheets.js"
import helperSocket from "./helperSocket.js"
import helperTables from "./helperTables.js"
import newRoll from "../documents/roll.js"
import helperSettings from "./helperSettings.js"

export default class helperCombat {
    
    /**
     * damageMod
     * @param {*} rules 
     * @param {*} actor 
     * @param {*} char 
     */
    static damageMod(rules, actor, char) {
        if (rules === 'aq4' || rules === 'vyc') char = 'fue'
        const base = actor.system.caracteristicas[char].value
        let oReturn = {
            string: '',
            terms: []
        };
        [[1, 4, '-1D6'], [5, 9, '-1D4'], [10, 14, ''], [15, 19, '+1D4'], [20, 24, '+1D6'], [25, 29, '+2D6'], 
         [30, 34, '+3D6'], [35, 39, '+4D6'], [40, 44, '+5D6'], [45, 50, '+6D6']].map(e => {
            if (base >= e[0] && base <= e[1]) oReturn.string = e[2]
         })

         if (oReturn.string === '') return oReturn;
         oReturn.terms.push(new foundry.dice.terms.OperatorTerm({operator: oReturn.string[0]}))
         oReturn.terms.push(new foundry.dice.terms.Die(oReturn.string.substr(1,4)))

         return oReturn
    }

    /**
     * selectTokenTarget
     * @param {*} actor 
     * @returns 
     */
    static async selectTokenTarget(actor) {
        const rules = actor.system.rules;
        const scene = game.scenes.active;
          if (!scene) { await helperDialog.error('error.noScene'); return }
        
        let mTokens = scene.tokens.filter(e => !e.hidden);
          if (mTokens.length === 0) { await helperDialog.error('error.noTokens'); return }

        //Actor Token
        let actorToken = null
        if (!actor.isToken && actor.prototypeToken.actorLink) {
            actorToken = scene.tokens.find(e => e.actor?.id === actor.id)
        } else if (actor.isToken) { actorToken = actor.token }

        if (!actorToken) { await helperDialog.error('error.noMyToken'); return }

        mTokens = mTokens.filter(e => e.id !== actorToken.id)
          if (mTokens.length === 0) { await helperDialog.error('error.aloneToken'); return }

        let mOptions = [];
        mTokens.map(token => {
            mOptions.push({
                key: token.id,
                label: token.name,
                img: token.texture.src
            })
        })

        const targetID = await helperDialog.dialogSelectOptions(rules, game.i18n.localize('common.target'), mOptions)
        return mTokens.find(e => e.id === targetID)
    }

    /**
     * applyDamage
     * @param {*} options 
     */
    static async applyDamage({ actorId, tokenId, stats, chatMessageId = null }) {
        const actor = helperTools.getActor(actorId, tokenId)
        const message = chatMessageId ? game.messages.get(chatMessageId) : null
        
        if (!actor || !game.user.isGM) return

        let ptv = actor.system.atributos.ptv
        ptv.value = ptv.value - Number(stats.damage)
        ptv.min = ptv.max * (-1)
        if (ptv.value < ptv.min) ptv.value = ptv.min        
        actor.update({
            "system.atributos.ptv": ptv
        })
        
        if (message) {
            await helperMessages.disableMessageControls(message, 'apply-damage')
        }

        let estado = actor.system.salud.estado
        helperSheets.checkStatusVida(actor.system.rules, ptv, estado)
        let sEstado = ''
        for (var s in estado) { if (estado[s].checked) sEstado = game.i18n.localize('common.'+s) }

        await helperMessages.postMessage({
            actor: actor,
            title: actor.name,
            subTitle: game.i18n.localize('common.dano')+' '+stats.damage+' pt',
            content: `<div class="_wrap">
                        <div class="_row">
                            <label class="_label">${game.i18n.localize('ATTR.ptv')}:</label>
                            <label class="_field">${ptv.value} / ${ptv.total}</label>
                        </div>
                        <div class="_row">
                            <label class="_label">${game.i18n.localize('common.estado')}:</label>
                            <label class="_field">${sEstado}</label>                        
                        </div>
                      </div>`
        })

        //Secuela        
        if (stats.secuela) {
            const mSecuelas = (await helperContext.getFromCompendium(actor.system.rules, 'secuela'))
                                                .filter(e => e.system.localizacionTipo === actor.system.info.localizacion
                                                            && e.system.localizacion === stats.location)
            mSecuelas.sort((a,b) => a.system.roll.low - b.system.roll.low)
            helperTables.tableSecuelas(actor.system.rules, mSecuelas, actor)
        }

        //Actualizando Step de Combate
        //El combate se actualiza a través del objeto roll
        if (stats.playing) {
            const dummyRoll = new newRoll("", {
                                rollType: 'damage', 
                                playing: true,
                                step: helperCombat.getStepInfo()})
            dummyRoll.updateCombat()
        }

    }

    /**
     * calcIniciativa
     * @param {*} combatant 
     * @param {*} actor 
     */
    static calcIniciativa(combatant, actor) {
        const _initiative = {
            value: 0,
            agi: 0,
            roll: 0,
            tooltip: ''
        }
        const _actor = combatant ? combatant.actor : actor
        if (!_actor) return _initiative

        _initiative.value = _actor.system.caracteristicas.agi.value
        _initiative.agi = _actor.system.caracteristicas.agi.value        
        _initiative.tooltip = game.i18n.localize("CHAR.agiShort") + ': ' +  _initiative.value + '</br>'

        if (combatant && combatant.initiative) { 
            _initiative.value += combatant.initiative
            _initiative.roll = combatant.initiative
            _initiative.tooltip += game.i18n.localize("common.tiradaIniciativa") + ': ' +  combatant.initiative + '</br>'
        }

        return _initiative
    }

    /**
     * calcMeasure
     * @param {*} token1 
     * @param {*} token2 
     */
    static calcMeasure(token1, token2) {

        const _unit = game.scenes.active?.grid.units || 'm.'
        const measure = {
            measure: null,
            contact: false,
            spaces: 0,
            spacesText: '0 '+_unit,
            distance: 0,
            distanceText: '0 '+_unit
        }

        const object1 = token1?.object
        const object2 = token2?.object
        if (!object1 || !object2) return measure

        measure.measure = object1 && object2 ? canvas.grid.measurePath([object1.center, object2.center]) : null
        return {...measure, ...{
            contact: measure.measure?.spaces === 1,
            spaces:  measure.measure?.spaces,
            spacesText:  measure.measure?.spaces + ' ' + game.i18n.localize('common.casillas'),
            distance: measure.measure?.distance,
            distanceText: measure.measure?.distance + ' ' + _unit            
        }}
    }

    /**
     * getSkillActionValue
     * @param {*} actor 
     * @param {*} weapon 
     * @param {*} action 
     * @param {*} target 
     * @param {*} measure 
     * @returns 
     */
    static getSkillActionValue({actor, weapon, action}, step=null, antiStep=null) {
        if (!actor || !action) return 0

        const combatant = step?.combatantId && step.combatantId !== '' ? game.combat.combatants.get(step.combatantId) :
                          antiStep?.targetId && antiStep.targetId !== '' ? game.combat.combatants.get(antiStep.targetId) : null
        const combatantTarget = step?.targetId && step.targetId !== '' ? game.combat.combatants.get(step.targetId) :
                                antiStep?.combatantId && antiStep.combatantId !== '' ? game.combat.combatants.get(antiStep.combatantId) : null
        
        const measure = helperCombat.calcMeasure(combatant?.token, combatantTarget?.token)
        const infoDistance = helperCombat.getInfoDistancia(weapon, measure)

        let formula = action.system.formulaTirada        
        const _skillWeapon = weapon && weapon.type === 'arma' ? 
                                actor.system.competencias.find(e => e.key === weapon.system.competencia.key) : 
                             weapon && weapon.type === 'competencia' ? 
                                actor.system.competencias.find(e => e.key === weapon.key) : null
        const _skillWeaponValue = _skillWeapon ? _skillWeapon.stats.value : 0

        //Modificador de Distancia
        if (infoDistance.modValue !== '') {
            //... Se añade como Modificar en la ventana de Dificultad
        }

        //La acción de ataque afecta a la defensa
        if (antiStep && antiStep.type === 'attack') {

            const _combatant0 = antiStep.combatantId !== '' ? game.combat.combatants.get(antiStep.combatantId) : null
            const _actor0 = _combatant0 ? _combatant0.actor : null
            const _action0 = antiStep.actionId !== '' && _actor0 ? _actor0.items.get(antiStep.actionId) : null
            if (_action0.system.afectaDefensa) {
                formula = _action0.system.formulaDefensa.replaceAll('{action}', formula)
            }
        }

        formula = formula.replaceAll('{skillWeapon}', _skillWeaponValue)
        formula = formula.replace(/\{skill (\w+)\}/g, (match, key) => {
            const skill = actor.system.competencias.find(e => e.key === key)
            return skill ? skill.stats.value : match
        })
        try { 
            return Math.round(eval(formula)) 
        }
        catch (error) {
            ui.notifications.error('Error al evaluar la fórmula: '+formula)
            return 0
        }
    }

    /**
     * getSkillActionTitle
     * @param {*} actor 
     * @param {*} weapon 
     * @param {*} action 
     */
    static getSkillActionTitle({actor, weapon, action}, step=null, antiStep=null) {
        if (!actor || !action) return 0

        let formula = action.system.tituloTirada
        const mSkills = actor.items.filter(e => e.type === 'competencia' && e.system.rules === actor.system.rules)
        const _skillWeapon = weapon && weapon.type === 'arma' ? 
                                    mSkills.find(e => e.system.key === weapon.system.competencia.key) :
                                weapon && weapon.type === 'competencia' ? 
                                    mSkills.find(e => e.system.key === weapon.key) : null

        //La acción de ataque afecta a la defensa
        if (antiStep && antiStep.type === 'attack') {

            const _combatant0 = antiStep.combatantId !== '' ? game.combat.combatants.get(antiStep.combatantId) : null
            const _actor0 = _combatant0 ? _combatant0.actor : null
            const _action0 = antiStep.actionId !== '' && _actor0 ? _actor0.items.get(antiStep.actionId) : null
            if (_action0.system.afectaDefensa) {
                formula = _action0.system.tituloDefensa.replaceAll('{action}', formula)
            }
        }

        formula = formula.replaceAll('{skillWeapon}', _skillWeapon?.name)
        formula = formula.replace(/\{skill (\w+)\}/g, (match, key) => {
            const skill = mSkills.find(e => e.system.key === key)
            return skill ? skill.name : match
        }) 
        return formula
    }

    /**
     * getDamageFormula
     * @param {*} actor 
     * @param {*} weapon 
     * @param {*} action 
     * @param {*} target 
     * @param {*} measure 
     * @returns 
     */
    static getDamageFormula(actor, weapon, action, target, measure) {
        if (!actor || !action) return 0

        let formula = action.system.formulaDano
        const _damageWeaponFormula =  weapon && weapon.type === 'arma' ? weapon.system.dano : ''
        formula = formula.replaceAll('{damageWeapon}', _damageWeaponFormula)
        return formula
    }

    /**
     * getDamageTitle
     * @param {*} actor 
     * @param {*} weapon 
     * @param {*} action 
     */
    static getDamageTitle(actor, weapon, action) {
        if (!actor || !action) return 0

        let formula = action.system.tituloDano
        const _damageWeaponFormula =  weapon && weapon.type === 'arma' ? weapon.system.dano : ''
        formula = formula.replaceAll('{damageWeapon}', _damageWeaponFormula)
        return formula
    }

    /**
     * addStepCombat
     * @param {*} combatant 
     * @param {*} target 
     * @param {*} weapon 
     * @param {*} action 
     * @param {*} stepTargetId
     */
    static addStepCombat(combatant, target, weapon, action, stepTargetId) {
        helperSocket.requestAddStepCombat(combatant.id, target?.id, weapon?.id, action?.id, stepTargetId)
    }
    static async _addStepCombat({combatantId, targetId, weaponId, actionId, stepTargetId}) {

        const combatant = game.combat.combatants.get(combatantId)
        const target = targetId ? game.combat.combatants.get(targetId) : null
        const weapon = weaponId ? combatant.actor.items.get(weaponId) : null
        const action = actionId ? combatant.actor.items.get(actionId) : null

        const iniciativa = helperCombat.calcIniciativa(combatant)
        await this.regularizeCombat()

        const data = game.combat.extendData
        let asalto =  data.asaltos.find(e => e.index === game.combat.round)
        if (!asalto) {
            asalto = {
                index: game.combat.round,
                steps: []
            }
            data.asaltos.push(asalto)
        }

        const newStep = {
                id: foundry.utils.randomID(),    
                type: action.system.ataque ? 'attack' :
                      action.system.defensa ? 'defense' :
                      action.system.movimiento ? 'movement' : '',
                combatantId,
                targetId,
                weaponId,
                actionId,
                stepTargetId,
                initiative: iniciativa.value
            }

        if (action.system.defensa) {
            const nIndex = asalto.steps.findIndex(e => e.id === stepTargetId)
            if (nIndex !== -1) asalto.steps.splice(nIndex + 1, 0, newStep);
        } else asalto.steps.push(newStep)

        await game.combat.saveExtendData(data)
    }

    /**
     * deleteStepCombat
     * @param {*} stepId 
     */
    static async deleteStepCombat(stepId) {
        helperSocket.requestDeleteStepCombat(stepId)
    }    
    static async _deleteStepCombat({stepId}) {
        const data = game.combat.extendData
        let asalto =  data.asaltos.find(e => e.index === game.combat.round)
        if (!asalto) return
        asalto.steps = asalto.steps.filter(e => e.id !== stepId && e.stepTargetId !== stepId)
        await game.combat.saveExtendData(data)
    }
    
    /**
     * cancelStepCombat
     * @param {*} stepId 
     */
    static async cancelStepCombat(stepId) {
        helperSocket.requestCancelStepCombat(stepId)
    }
    static async _cancelStepCombat({stepId}) {
        const data = game.combat.extendData
        let asalto =  data.asaltos.find(e => e.index === game.combat.round)
        if (!asalto) return

        let step = asalto.steps.find(e => e.id === stepId)
        if (step) step.active = false
        let antiStep = asalto.steps.find(e => e.stepTargetId === stepId)
        if (antiStep) antiStep.active = false
        await game.combat.saveExtendData(data)
    }    

    /**
     * regularizeCombat
     */
    static async regularizeCombat() {
        if (game.combat.round === 0) await game.combat.nextRound()
    }

    /**
     * playStep
     * @param {*} stepId 
     */
    static async playStep(stepId) {
        const step = this._getStep(stepId)
        const combatant = game.combat.combatants.get(step.combatantId)
        const actor = combatant.actor
        const action = step.actionId !== '' ? actor.items.get(step.actionId) : null

        const sheet = combatant.actor.sheet
        await sheet.render(true)

        //Esquivar
        if (action && action.system.armas.find(e => e.key === 'esquivar').checked) {
            await sheet.changeTab('stats', 'primary')
        //Resto
        } else {
            await sheet.changeTab('combate', 'primary')
        }
        
    }

    /**
     * _getStep
     * @param {*} stepId 
     */
    static _getStep(stepId) {
        const data = game.combat.extendData
        let asalto =  data.asaltos.find(e => e.index === game.combat.round)
        if (!asalto) return
        return asalto.steps.find(e => e.id === stepId)
    }

    /**
     * _getAsalto
     * @returns 
     */
    static _getAsalto() {
        const data = game.combat?.extendData
        if (!data) return
        return data.asaltos.find(e => e.index === game.combat.round)        
    }

    /**
     * _getCurrentStep
     * @returns 
     */
    static _getCurrentStep() {
        let asalto = this._getAsalto()
        if (!asalto) return
        return asalto.steps.find(e => e.active)
    }

    /**
     * _getCurrentAntiStep
     */
    static _getCurrentAntiStep() {
        let asalto = this._getAsalto()
        if (!asalto) return

        const _step = asalto.steps.find(e => e.active)
        if (!_step) return
        if (_step.type === 'attack')
            return asalto.steps.find(e => e.stepTargetId === _step.id)
        if (_step.type === 'defense')
            return asalto.steps.find(e => e.id === _step.stepTargetId)
        if (_step.type === 'movement')
            return null
    }

    /**
     * updateCombat
     * @param {*} asalto 
     */
    static async updateCombat(asalto) {
        await helperSocket.requestUpdateCombat(asalto)
    }
    static async _updateCombat({asalto}) {
        const data = game.combat?.extendData
        if (!data) return     
        let asalto0 = data.asaltos.find(e => e.index === game.combat.round)  
        for (var s in asalto0) { asalto0[s] = asalto[s] }
        await game.combat.saveExtendData(data)
    }

    /**
     * updateStep
     * @param {*} step 
     * @returns 
     */
    static async updateStep(step) {
        const data = game.combat?.extendData
        if (!data) return
        let asalto = data.asaltos.find(e => e.index === game.combat.round)   
        let step0 = asalto.steps.find(e => e.id === step.id)
        for (var s in step0) { step0[s] = step[s] }
        await game.combat.saveExtendData(data)
    }

    /**
     * getStepInfo
     * @param {*} actor [optional]
     * @returns 
     */
    static getStepInfo(actor) {
        const asalto = this._getAsalto()

        let oReturn = {
            step: null,
            stepTarget: null,
            type: '',
            myTurn: false,
            main: {
                combatant: null,
                token: null,
                actor: null,
                weapon: null,
                action: null,
                skill: { value: 0, label: '' },
                damage: { formula: '', label: '', value: 0},
            },
            target: {
                combatant: null,
                token: null,
                actor: null,
                weapon: null,
                action: null,
                skill: { value: 0, label: '' }
            },
            measure: null
        }

        oReturn.step = helperCombat._getCurrentStep()
        if (!oReturn.step) return oReturn

        oReturn.type = oReturn.step.type
        oReturn.stepTarget = oReturn.step.stepTargetId !== '' ? this._getStep(oReturn.step.stepTargetId) : 
                                                                asalto.steps.find(e => e.stepTargetId === oReturn.step.id)
        oReturn.stepTarget = oReturn.stepTarget === undefined ? null : oReturn.stepTarget

        oReturn.main.combatant = game.combat.combatants.get(oReturn.step.combatantId)
        oReturn.main.token = oReturn.main.combatant.token
        oReturn.main.actor = oReturn.main.combatant.actor
        oReturn.main.action = oReturn.step.actionId !== '' ? oReturn.main.actor.items.get(oReturn.step.actionId) : null
        oReturn.main.weapon = oReturn.step.weaponId !== '' ? oReturn.main.actor.items.get(oReturn.step.weaponId) : null
        oReturn.main.skill.value = helperCombat.getSkillActionValue(oReturn.main, oReturn.step, oReturn.stepTarget)
        oReturn.main.skill.label = helperCombat.getSkillActionTitle(oReturn.main, oReturn.step, oReturn.stepTarget)
        oReturn.main.damage.formula = helperCombat.getDamageFormula(oReturn.main.actor, oReturn.main.weapon, oReturn.main.action, 
                                                                    oReturn.target.actor, oReturn.measure)
        oReturn.main.damage.label = helperCombat.getDamageTitle(oReturn.main.actor, oReturn.main.weapon, oReturn.main.action) 

        oReturn.target.combatant = oReturn.step.targetId !== '' ? game.combat.combatants.get(oReturn.step.targetId) : null        
        oReturn.target.token = oReturn.target.combatant ? oReturn.target.combatant?.token : null
        oReturn.target.actor = oReturn.target.combatant?.actor
        oReturn.target.action = oReturn.stepTarget && oReturn.stepTarget?.actionId !== '' && oReturn.target.actor ? 
                                                             oReturn.target.actor.items.get(oReturn.stepTarget.actionId) : null
        oReturn.target.weapon = oReturn.stepTarget && oReturn.stepTarget?.weaponId !== '' && oReturn.target.actor ? 
                                                             oReturn.target.actor.items.get(oReturn.stepTarget.weaponId) : null
        oReturn.target.skill.value = helperCombat.getSkillActionValue(oReturn.target, oReturn.stepTarget,  oReturn.step)
        oReturn.target.skill.label = helperCombat.getSkillActionTitle(oReturn.target, oReturn.stepTarget,  oReturn.step)

        oReturn.measure = this.calcMeasure(oReturn.main.token, oReturn.target.token)

        oReturn.myTurn = !actor || !oReturn.main.actor ? false :
                         (actor.id === oReturn.main.actor.id && actor.token?.id === oReturn.main.actor.token?.id)

        return oReturn
    }

    /**
     * getInfoDistancia
     * @param {*} weapon 
     * @param {*} measure 
     */
    static getInfoDistancia(weapon, measure) {
        const rules = helperSettings.rules()
        const oReturn = {
            aDistancia: weapon && weapon.system.adistancia === true,
            alcance: {
                contacto: false,
                corto: weapon && weapon.system.adistancia &&
                       measure.distance >= 0 && measure.distance <= weapon.system.alcance.corto,
                medio: weapon && weapon.system.adistancia &&
                       measure.distance > weapon.system.alcance.corto && measure.distance <= weapon.system.alcance.medio,
                largo: weapon && weapon.system.adistancia &&
                       measure.distance > weapon.system.alcance.medio && measure.distance <= weapon.system.alcance.largo,
                fuera: weapon && weapon.system.adistancia &&
                       measure.distance > weapon.system.alcance.largo,                       
            },
            mod: '',
            modTexto: '',
            modValue: '',
            texto: ''
        }

        if (rules !== 'aq3' && measure.contact) {
            alcance.contacto = true;
            alcance.corto = false;
        }
        oReturn.mod = oReturn.alcance.contacto ? '034' :
                      oReturn.alcance.corto ? '033' :
                      oReturn.alcance.medio ? '032' :
                      oReturn.alcance.largo ? '031' : ''

        oReturn.modTexto = oReturn.mod !== '' ? game.i18n.localize('mods.m'+oReturn.mod) : ''
        oReturn.modValue = oReturn.mod !== '' ? aqConfig.modificadores.distancia.find(e => e.id === oReturn.mod).mod : ''
        oReturn.modValue = oReturn.modValue === '+0' ? '' : oReturn.modValue

        oReturn.texto = oReturn.alcance.corto ? game.i18n.localize('common.distanciaCorta') :
                        oReturn.alcance.medio ? game.i18n.localize('common.distanciaMedia') :
                        oReturn.alcance.largo ? game.i18n.localize('common.distanciaLarga') :
                        oReturn.alcance.fuera ? game.i18n.localize('common.distanciaFuera') : ''
        
              
        return oReturn;
    }

    /**
     * actorInCombat
     */
    static actorInCombat() {
        const step = this._getCurrentStep()
        if (!step) return
        return game.combat.combatants.get(step.combatantId)?.actor
    }
}