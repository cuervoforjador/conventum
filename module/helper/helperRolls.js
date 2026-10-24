import { SYSTEM_ID } from "../config/uiConstants.js"
import newRoll from "../documents/roll.js";
import helperContext from "./helperContext.js"
import helperCombat from "./helperCombat.js"

export default class helperRolls {

    /**
     * roll
     * @param {*} actor 
     * @param {*} target 
     * @param {*} path
     * @param {*} value
     * @param {*} useLuck 
     */
    static async roll(options={actor, target:'', item:null, path:'', formula:'', useLuck:true, mod:null, mods:null, playing: false, title: "", subtitle: ""}) {
       
        const oStep = options.playing && game.combat ? helperCombat.getStepInfo(options.actor) : null
        let tokenTarget = null

        switch(options.target) {
            case 'simple':
                return (await this.simpleRoll({...options}))
                break;
            case 'char':
                await this.statRoll({...options, ...{
                    formula: '1D100',
                    percent: Number(options.actor.system.caracteristicas[options.path].value)*5,
                    title: game.i18n.localize('CHAR.'+options.path) + ' x5',
                    subtitle: game.i18n.localize('common.rollChar'),
                    playing: options.playing,
                    step: oStep }})
                break;

            case 'attr':                
                await this.statRoll({...options, ...{
                    formula: '1D100',
                    percent: Number(this._access(options.actor.system.atributos, options.path)),
                    title: game.i18n.localize('ATTR.'+options.path.split('.')[0]),
                    subtitle: game.i18n.localize('common.rollAttr'),
                    playing: options.playing,
                    step: oStep }})
                break;

            case 'skill':  
                const skill = options.actor.items.find(e => e.type === 'competencia' && e.system.key === options.path)
                var stats = options.actor.system.competencias.find(e => e.key === options.path)

                if (!skill || !stats) return

                await this.statRoll({...options, ...{
                    formula: '1D100',
                    item: skill,
                    stats: stats.stats,
                    percent: stats.stats.total,
                    title: skill.name,
                    subtitle: skill.name+': '+stats.stats.total+'%',
                    img: skill.img,
                    playing: options.playing,
                    step: oStep }})
                break;  
            
            case 'damage':
                if (options.playing) tokenTarget = oStep.target.combatant.token
                                else tokenTarget = await helperCombat.selectTokenTarget(options.actor)
                if (!tokenTarget) return

                await this.damageRoll({...options, ...{
                    title: options.item.name,
                    subtitle: tokenTarget.actor.name,
                    targetToken: tokenTarget,
                    targetActor: tokenTarget.actor,
                    img: options.item.img,
                    playing: options.playing,
                    step: oStep}})
                break;

            case 'tecnica':          
                await this.tecnicaRoll({...options, ...{
                    title: options.item.name,
                    subtitle: tokenTarget?.actor.name,
                    targetToken: tokenTarget,
                    targetActor: tokenTarget?.actor,
                    img: options.item.img,
                    step: oStep}})                
                break;
        }

    }

    /**
     * unitRoll
     * @param {*} options 
     */
    static async unitRoll(options={actor:null, formula: '', title: '', subtitle: '', img: ''}) {
        const diceRoll = new newRoll(options.formula, {...options, ...{
            rollType: 'unit'
        }});
        await diceRoll.rollFormula()
        return diceRoll.total
    }

    /**
     * simpleRoll
     * @param {*} options 
     */
    static async simpleRoll(options={actor: null, formula: '1D100', title: "", subtitle: ""}) {
        const diceRoll = new newRoll(options.formula, {...options, ...{
            rollType: 'simple0',
            useDiffLevel: false
        }})
        await diceRoll.rollFormula()
        return diceRoll
    }

    /**
     * statRoll
     * @param {*} options 
     */
    static async statRoll(options={actor: null, formula: '', percent: 0, mod: null, mods: null, useluck: true, title: '', subtitle: '', img: '', playing: false, step: null}) {
        const diceRoll = new newRoll('1D100', {...options, ...{
            rollType: 'simple',
            useDiffLevel: true
        }})
        await diceRoll.rollStat()
    }

    /**
     * damageRoll
     * @param {*} options 
     */
    static async damageRoll(options={actor: null, formula: '', title: '', subtitle: '', img: '', playing: false, step: null}) {
        
        if (options.playing && options.step) {
            options.formula = options.step.main.damage.formula
        }
        const diceRoll = new newRoll(options.formula, {...options, ...{
            rollType: 'damage',
            targeted: true,
            useLocation: true
        }});
        await diceRoll.rollDamage()
    }

    /**
     * tecnicaRoll
     * @param {*} options 
     */
    static async tecnicaRoll(options={actor: null, formula: '', title: '', subtitle: '', img: '', playing: false, step: null}) {
        
        const diceRoll = new newRoll(options.formula, {...options, ...{
            rollType: 'tecnica',
            targeted: false
        }});
        await diceRoll.rollTecnica()
    }

    /**
     * _access
     * @param {*} object 
     * @param {*} path 
     * @returns 
     */
    static _access(object, path) {
        let oReturn = object
        path.split('.').map(s => { oReturn = oReturn[s] })
        return oReturn
    }    

}