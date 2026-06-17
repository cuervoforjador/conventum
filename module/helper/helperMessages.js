import { SYSTEM_ID } from "../config/uiConstants.js"
import newChatMessage from "../documents/chatMessage.js"
import helperTools from "./helperTools.js"
import helperSocket from "./helperSocket.js"

export default class helperMessages {

    /**
     * getMessage
     * @param {*} chatMessageId 
     */
    static getMessage(chatMessageId) {
        return chatMessageId ? game.messages.get(chatMessageId) : null
    }

    /**
     * activateListeners
     * @param {*} message 
     * @param {*} html 
     * @returns 
     */
    static activateListeners(message, html) {

        const root = helperMessages._getChatHtmlRoot(html)
        if (!root) return

        root.querySelectorAll('[data-action="apply-damage"]').forEach(button => {
            if (button.dataset.bound === "true") return
            button.dataset.bound = "true"
            button.addEventListener("click", event => helperMessages.#onApplyDamageClick(event, message))
        })        
    }

    /**
     * _getChatHtmlRoot
     * @param {*} html 
     * @returns 
     */
    static _getChatHtmlRoot(html) {
        if (html instanceof HTMLElement) return html
        if (html?.[0] instanceof HTMLElement) return html[0]
        if (html?.element instanceof HTMLElement) return html.element
        if (html?.element?.[0] instanceof HTMLElement) return html.element[0]
        return null
    }

    /**
     * onApplyDamageClick
     * @param {*} event 
     * @param {*} message 
     */
    static async #onApplyDamageClick(event, message) {
        const actorId = $(event.currentTarget).data('actorid')
        const tokenId = $(event.currentTarget).data('tokenid')
        const damage = $(event.currentTarget).data('damage')
        const location = $(event.currentTarget).data('location')
        const secuela = $(event.currentTarget).data('secuela')
        helperSocket.requestDamage({actorId, 
                                    tokenId, 
                                    stats: {damage, location, secuela}, 
                                    chatMessageId: message.id})    
    }

    /**
     * disableMessageControls
     * @param {*} message 
     * @param {*} action 
     */
    static async disableMessageControls(message, action) {
        if (!game.user.isGM) return;
        let content = $(message.content)
        let control = content.find('[data-action="'+action+'"]')
            control.attr({'disabled': 'disabled'})    
        let sContent = ''
        content.each((i,e) => {sContent += e.outerHTML !== undefined ? e.outerHTML : ''})   
        await message.update({"content": sContent })
        return     
    }

    /**
     * postMessage
     * @param {*} options 
     */
    static async postMessage(options={actor, title:'', subTitle:'', textAuxiliar:'', content:'', backImg:'', class:''}) {
        const sHeader = this._messageParts_Header(options)    
        const message = await newChatMessage.create({
            content: sHeader + options.content,
            title: options.title,
            flags: {
                "actorId": {"value": options.actor ? options.actor.id : ''},
                "tokenId": {"value": options.actor && options.actor.token ? options.actor.token.id : ''}
            }
        })            
    }

    static _messageParts_Header(options) {
        const sActorImg = options.actor ? `<img src="${options.actor.img}" data-tooltip="${options.actor.name}">` : ''
        const sImg = options.backImg && options.backImg !== '' ? 
                        `<div class="_backImg" style="background-image: url(${options.backImg})"></div>` : ''
        const sAuxiliar = options.textAuxiliar && options.textAuxiliar !== '' ? 
                        `<div class="_auxiliar">${options.textAuxiliar && options.textAuxiliar !== '' ? options.textAuxiliar : ''}</div>` : ''

        return  `<div class="_header">
                    ${sActorImg}
                    <div class="_subHeader">
                        <h2>${options.title}</h2>
                        ${options.subTitle && options.subTitle !== '' ? '<h4 class="_big">'+options.subTitle+'</h4>' : ''}
                    </div>
                    ${sImg}
                </div>
                ${sAuxiliar}`
    }    

}