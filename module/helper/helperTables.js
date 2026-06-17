import { SYSTEM_ID } from "../config/uiConstants.js"
import newRollTable from "../documents/rollTable.js"
import helperContext from "./helperContext.js"
import helperTools from "./helperTools.js"
import helperSocket from "./helperSocket.js"

export default class helperTables {

    /**
     * tableLore
     * @param {*} rules 
     * @param {*} lore 
     * @param {*} actor 
     * @param {*} auto
     */
    static async tableLore(rules, lore, actor, auto=false) {
        const mOptions = await helperContext.getLoreOptions(rules, lore, actor)

        if (mOptions.length === 1) {
            await helperContext.assignLoreToActor(rules, lore, actor, mOptions[0].item.system.key)
            return
        }

        const mResults = [];
        mOptions.map(option => {
            mResults.push({
                name: option.item.name+'   ['+this._getResultRange(rules, lore, option)[0]+' - '+
                                         this._getResultRange(rules, lore, option)[1]+']',
                img: option.item.img,
                description: option.item.system.descripcion,
                range: this._getResultRange(rules, lore, option),
                flags: { 'key': {'value': option.item.system.key}},
                type: 'text'
            })
        })
        helperSocket.requestCreateRollTable({
            actorId: actor.id,
            tokenId: helperTools.getTokenId(actor),
            stats: {
                name: actor.name+' - '+game.i18n.localize('common.'+lore),
                img: actor.img,
                description: game.i18n.localize('explain.rollTable_'+lore),
                displayRoll: true,
                ownership: actor.ownership,
                formula: this._getResultFormula(rules, lore, mOptions),
                results: mResults,
                flags: {
                    isLore: {value: true},
                    rules: {value: rules},
                    lore: {value: lore},
                    actorId: {value: actor.id},
                    tokenId: {value: actor.isToken ? actor.token.id : ''}
                }
            }
        })
    }

    /**
     * tableSecuelas
     * @param {*} rules 
     * @param {*} secuelas 
     * @param {*} actor 
     */
    static async tableSecuelas(rules, secuelas, actor) {
        if (secuelas.length === 1) {
            await helperContext.assignSecuelaToActor(actor, secuelas[0])
            return
        }

        const mResults = [];
        secuelas.map(secuela => {
            mResults.push({
                name: secuela.name+'   ['+secuela.system.roll.low+' - '+secuela.system.roll.high+']',
                img: secuela.img,
                description: secuela.system.descripcion,
                range: this._getResultRange('', '', secuela.system.roll),
                flags: { 'key': {'value': secuela.system.key}},
                type: 'text'
            })
        })
        this.createRollTable({ actorId: actor.id, tokenId: helperTools.getTokenId(actor), 
            stats: {
                name: actor.name+' - '+game.i18n.localize('common.secuelas'),
                img: actor.img,
                description: game.i18n.localize('common.secuelas') + ' (' +
                            game.i18n.localize('common.'+secuelas[0].system.localizacion) + ')',
                displayRoll: true,
                ownership: actor.ownership,
                formula: '1D10',
                results: mResults,
                flags: {
                    isSecuela: {value: true},
                    rules: {value: rules},
                    actorId: {value: actor.id},
                    tokenId: {value: helperTools.getTokenId(actor)}
                }
            }
         })       
    }

    /**
     * createRollTable
     * @param {*} options 
     */
    static async createRollTable({ actorId, tokenId, stats }) {
        const actor = helperTools.getActor(actorId, tokenId)
        const table = await newRollTable.create(stats)
        helperSocket.requestRollTable({ actorId, tokenId, stats: { tableId: table.id} })
    }

    /**
     * rollTable
     * @param {*} options 
     */
    static async rollTable({ actorId, tokenId, stats }) {
        const actor = helperTools.getActor(actorId, tokenId)
        const table = game.tables.get(stats.tableId)
        if (Array.from(table.results).length === 1) await table.draw()
        const sheet = table.sheet
        await sheet.render(true)
    }

    /**
     * deleteRollTable
     * @param {*} options 
     */
    static async deleteRollTable({ actorId, tokenId, stats }) {
        const actor = helperTools.getActor(actorId, tokenId)
        const table = game.tables.get(stats.tableId)
        table.delete()
    }    

    static _getResultRange(rules, lore, option) {
        return [!option.low ? 0 : option.low, 
                !option.high ? 0 : option.high]
    }

    static _getResultFormula(rules, lore, mOptions) {
        let nMax = 0
        mOptions.map(option => {
            if (this._getResultRange(rules, lore, option)[1] > nMax)
                nMax = this._getResultRange(rules, lore, option)[1]
        })
        if (nMax > 0) return '1D'+nMax
                 else return '0'
    }

}