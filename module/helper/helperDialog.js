import { SYSTEM_ID } from "../config/uiConstants.js"
import helperContext from "./helperContext.js"

export default class helperDialog {

    /**
     * error
     * @param {*} sI18nPath 
     */
    static async error(sI18nPath) {
        await foundry.applications.api.DialogV2.prompt({
            classes: ['_extend', '_error'],
            window: { title: game.i18n.localize('common.error') },
            content: game.i18n.localize(sI18nPath),
            ok: { label: game.i18n.localize('common.aceptar') }
        });
    }

    /**
     * dialogConfirm
     * @param {*} rules 
     * @param {*} sContent 
     * @returns 
     */
    static async dialogConfirm(rules, title, sContent) {
        const proceed = await foundry.applications.api.DialogV2.confirm({
            classes: ['_extend', '_'+rules],
            window: { title: title },
            content: sContent,
            rejectClose: false,
            modal: true
        });
        return (!!proceed)        
    }

    /**
     * dialogSelectOptions
     * @param {*} rules 
     * @param {*} title 
     * @param {*} options 
     * @param {*} position 
     */
    static async dialogSelectOptions(rules, title, options, position={height: 'auto'}) {
        let _options = ''
        let _buttonClassSelected = ''
        options.map(option => {
            const sImg = option.img ? `<img src="${option.img}" class="_iconImage"/>` : ''
            const sInput = option.input ?
                           `<div class="_input">
                                <label>${option.inputField.label}</label>
                                <input type="text" value="${option.inputField.value}"/>
                            </div>` : ''

            _options += `<li data-key="${option.key}" ${option.input ? ` class="${option.inputField.class}"` : ''}>
                            <div class="_wrap">
                                <input type="checkbox" class="_selector" ${!!option.checked ? 'checked' : ''}>
                                ${sImg}
                                <label class="_title">${option.label}</label>
                            </div>
                            ${sInput}
                        </li>`
            if (!!option.checked) _buttonClassSelected = '_selected'
        })
        const content = `<ul class="_main">${_options}</ul>`

        const option = await foundry.applications.api.DialogV2.wait({
            classes: ['_extend', '_'+rules],
            window: { title: title },
            position: position,            
            content,
            buttons: [{
                label: game.i18n.localize("common.confirmar"),
                class: _buttonClassSelected, 
                callback: (event, button) => {
                    const checked = $(event.currentTarget).find('ul._main')
                                                          .find('input[type="checkbox"]._selector:checked')
                    if (!checked.length === 0) return null
                    const oInput = checked.parents('li').find('._input input')
                    if (oInput.length > 0) return {
                                               inputResponse: true,
                                               inputValue: oInput.val(),
                                               key: checked.parents('li').data('key')
                                           }
                    return checked.parents('li').data('key')
                }
            }],
            render: (_event, dialog) => {               
                this._setShadowToDialog(dialog)
                this._setInitialDialogEvents(dialog)  
            }
        })      
        return option
    }

    /**
     * dialogSelectRules
     * @param {*} actor
     */
    static async dialogSelectRules(actor) {
        const rules = actor.system.rules
        const Options = await helperContext.getRules()
        let options = ''
        for (var s in Options) {
            const option = Options[s]
            options += `<li data-key=${option.key}>
                            <input type="checkbox" class="_selector" ${rules === option.key ? 'checked' : ''}>
                            <label class="_title">${option.label}</label>                      
                        </li>`
        }
        const content = `<ul class="_main">${options}</ul>`

        const option = await foundry.applications.api.DialogV2.wait({
            classes: ['_extend', '_'+rules],
            window: { title: game.i18n.localize("common.rules") },
            position: { height: 'auto' },            
            content,
            buttons: [{
                label: game.i18n.localize("common.confirmar"),
                callback: (event, button) => {
                    const checked = $(event.currentTarget).find('ul._main')
                                                          .find('input[type="checkbox"]._selector:checked')
                    if (!checked.length === 0) return null
                    return checked.parents('li').data('key')
                }
            }],
            render: (_event, dialog) => {               
                this._setShadowToDialog(dialog)
                this._setInitialDialogEvents(dialog)  
            }
        })      
        return option
    }

    /**
     * dialogSelectLore
     * @param {*} rules 
     * @param {*} lore 
     * @param {*} actor
     */
    static async dialogSelectLore(rules, lore, actor) {
        const mOptions = await helperContext.getLoreOptions(rules, lore, actor)
        let options = ''
        mOptions.map(option => {
            options += `<li data-key=${option.item.system.key}>
                            <input type="checkbox" class="_selector">
                            <label class="_title">${option.item.name}</label>
                            <button type="button" class="icon fas fa-solid fa-magnifying-glass _showDescription" 
                                    data-action="showCompendiumItem" 
                                    data-rules="${rules}" data-lore="${lore}" data-item="${option.item.id}"
                                    data-tooltip="${game.i18n.localize('tooltip.showItem')}">
                            </button>                        
                        </li>`
        })
        const content = `<ul class="_main">${options}</ul>`

        const option = await foundry.applications.api.DialogV2.wait({
            classes: ['_extend', '_'+rules],
            window: { title: game.i18n.localize("common."+lore) },
            position: { height: 'auto' },            
            content,
            buttons: [{
                label: game.i18n.localize("common.confirmar"),
                callback: (event, button) => {
                    const checked = $(event.currentTarget).find('ul._main')
                                                          .find('input[type="checkbox"]._selector:checked')
                    if (!checked.length === 0) return null
                    return checked.parents('li').data('key')
                }
            }],
            render: (_event, dialog) => {   
                this._addAleaButton(dialog)             
                this._setShadowToDialog(dialog)
                this._setInitialDialogEvents(dialog)  
                this._setShowCompendiumEvent(dialog)
            }
        })      
        return option
    }

    /**
     * dialogDescription
     * @param {*} document 
     */
    static async dialogDescription(document=null, content='', title='', rules=null, width=550, img='') {
        const sRules = rules ? rules : document?.system.rules
        const sContent = document ? document.system.descripcion : content
        const sTitle = document ? document.name : title
        const sImg = img !== '' ? img : 
                     document ? document.img : ''

        const dialog = await foundry.applications.api.DialogV2.prompt({
            classes: ['_extend', '_description', '_'+sRules],
            window: { title: sTitle },
            position: {width: width},
            content: sContent,
            ok: {},
            render: (_event, dialog) => {
                this._setShadowToDialog(dialog)   
                this._setWaterMarkToDialog(dialog, document, sImg)             
                this._setNoFooter(dialog)
            }
        })
    }

    static _addAleaButton(dialog) {
        $(dialog.element).find('footer.form-footer')
                         .prepend(`<button type="button" data-action="alea" class="_alea" autofocus="">
                                        <span>${game.i18n.localize('common.aleatorio')}</span>
                                   </button>`)
        $(dialog.element).find('footer.form-footer').find('button[data-action="alea"]').on("click", (event) => {
            dialog.options.submit('#alea')
            dialog.close()
        })
    }
    static _setShadowToDialog(dialog) {
        $(dialog.element).find('.window-content').prepend(`<div class="_shadow"></div>`)  
    }

    static _setWaterMarkToDialog(dialog, document, sImg='') {
        if (!document && sImg==='') return
        const img = document ? document.img : sImg
        $(dialog.element).find('.window-content').prepend(`<div class="_watermark" style="background-image: url(${img})"></div>`)        
    }

    static _setNoFooter(dialog) {
        $(dialog.element).find('.form-footer').remove()
    }

    static _setInitialDialogEvents(dialog) {        
        $(dialog.element).find('ul._main li').on("click", event => {
            event.stopPropagation()
            this._checkOnlyMe($(event.currentTarget))
            $(event.currentTarget).parents('dialog._extend').find('footer.form-footer button[type="submit"]').addClass('_selected')
        })
        $(dialog.element).find('input._selector').on("change", event => {
            event.stopPropagation()
            this._checkOnlyMe($(event.currentTarget).parents('li'))
            $(event.currentTarget).parents('dialog._extend').find('footer.form-footer button[type="submit"]').addClass('_selected')
        }) 
    }

    static _setShowCompendiumEvent(dialog) {
        $(dialog.element).find('button[data-action="showCompendiumItem"]').on("click", async (event) => {
            event.stopPropagation()
            const rules = $(event.currentTarget).data('rules')
            const lore = $(event.currentTarget).data('lore')
            const itemID = $(event.currentTarget).data('item')
            const mDocs = await helperContext.getFromCompendium(rules, lore)
            const document = mDocs.find(e => e.id === itemID)
            this.dialogDescription(document)
        })
    }

    static _checkOnlyMe(li) {
        li.parent().find('li').each((i,e) => {            
            if ($(e).data('key') === li.data('key')) return
            $(e).find('input._selector').prop('checked', false)
        })
        li.find('input._selector').prop('checked', true)      
    }

}