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
    }
}