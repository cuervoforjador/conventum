import { SYSTEM_ID } from "../config/uiConstants.js"
import { configRULES } from "../config/rules.js"
import { aqConfig } from "../config/config.js"
import helperContext from "./helperContext.js"
import helperDialog from "./helperDialog.js"
import newBook from "../documents/book.js"
import helperMagia from "./helperMagia.js"

export default class helperBooks {
    
    /**
     * openBook
     * @param {*} rules 
     * @param {*} actor 
     * @param {*} mPages 
     */
    static async openBook(rules, actor, mPages) {

        const dialog = await newBook.prompt({
            classes: ['_extend', '_book', '_'+rules],
            position: actor.sheet.position,
            content: this.content(actor, mPages),
            actor: actor,
            ok: {},
            render: this.render.bind(this, actor)
        })

    }

    /**
     * content
     * @param {*} actor 
     */
    static content(actor, mPages) {        
        const isEven = mPages.length % 2 == 0
        let sContent = ""

        let nIndex = 1
        mPages.map(page => {
            sContent += `<div class="hard">
                            <div class="_page" data-id="${page.id}" data-key="${page.key}">
                                ${page.content}
                            </div>
                        </div>`
            nIndex++
        })        
        if (!isEven) sContent += `<div class="hard"></div>`

        return `<div class="_contentWrap">
                    <div id="contentBook" class="_mainBook">
                        <div class="hard"></div>
                        <div class="hard"></div>
                        ${sContent}
                        <div class="hard"></div>
                    </div>
                </div>`
    }

    /**
     * render
     * @param {*} actor 
     * @param {*} _event 
     * @param {*} dialog 
     */
    static render(actor, _event, dialog) {
        const _dialog = $(dialog.element)
        this.transformIntoBook(_dialog, dialog, actor)
        this.addListeners(_dialog, dialog, actor)
    }

    /**
     * transformIntoBook
     * @param {*} _dialog 
     * @param {*} actor 
     */
    static transformIntoBook(_dialog, dialog, actor) {
        
        $("body.game #"+_dialog.attr('id')).before(`<div class="_backdrop" id="backdrop_${_dialog.attr('id')}"></div>`)

        _dialog.find('.window-header').remove()
        _dialog.find('.form-footer').remove()
        _dialog.find('form.dialog-form').addClass('_contentBook')

        const nWidth = Math.trunc(actor.sheet.position.width * 0.9),
              nHeight = Math.trunc(actor.sheet.position.height * 0.925)

        _dialog.find("#contentBook").turn({
            width: nWidth,
            height: nHeight,
            page: 2,
            autoCenter: true,
        });  
        
        this.addMarkers(_dialog, actor)

        //Bloqueando la página inicial
        _dialog.find('#contentBook').bind('start', (event, pageObject, corner) => {
            if (pageObject.page === 1 || (pageObject.page === 2 && corner === 'tl')) event.preventDefault();
        });   
        _dialog.find('#contentBook').bind('turning', (event, page, view) => {
            if (page === 1) event.preventDefault()
            helperBooks.addListeners(_dialog, dialog, actor)
        });
    }

    /**
     * addMarkers
     * @param {*} _dialog 
     * @param {*} actor 
     */
    static addMarkers(_dialog, actor) {
        _dialog.find('#contentBook').before(`<div class="_markers">
                <div class="_marker _close" 
                     data-action="close"
                     data-tooltip="${game.i18n.localize('common.cerrar')}">X</div>
            </div>`)
    }

    /**
     * addListeners
     * @param {*} _dialog 
     * @param {*} actor 
     */
    static addListeners(_dialog, dialog, actor) {
        _dialog.find('button._action').on('click', this.#onClickButton.bind(dialog))
        _dialog.find('._marker._close').on('click', this.#onClose.bind(dialog))
    }

    /**
     * #onClose
     * @param {*} _event 
     */
    static #onClose(_event) {
        _event.stopPropagation()
        this.close()
    }

    static async #onClickButton(_event) {
        _event.stopPropagation()
        const sId = $(_event.target).data('id')
        const sAction = $(_event.target).data('action')
        const item = this.actor.items.get(sId)
        if (!item || !this.actor) return

        switch (item.type) {
            case 'ensalmo':
                await helperBooks._handlerEnsalmos(sAction, this, this.actor, item)
                break;
            case 'hechizo':
                await helperBooks._handlerHechizos(sAction, this, this.actor, item)
                break;                
        }
    }

    /**
     * _handlerEnsalmos
     * @param {*} action 
     * @param {*} book 
     * @param {*} actor 
     * @param {*} item 
     */
    static async _handlerEnsalmos(action, book, actor, item) {
        switch (action) {
            case 'preparar':
                await actor.update({
                    "system.ritual.preparacion.id": item.id,
                    "system.ritual.preparacion.preparando": true,
                    "system.ritual.preparacion.ceremonia": false,
                    "system.ritual.preparacion.completado": false
                }) 
                book.close()
            break;
        }
    }

    /**
     * _handlerHechizos
     * @param {*} action 
     * @param {*} book 
     * @param {*} actor 
     * @param {*} item 
     */
    static async _handlerHechizos(action, book, actor, item) {
        switch (action) {
            case 'preparar':
                helperMagia.prepararHechizo(actor, item)
                book.close()
                break;
            case 'estudiar':
                helperMagia.estudiarHechizo(actor, item)
                book.close()
                break;                
        }
    }

}