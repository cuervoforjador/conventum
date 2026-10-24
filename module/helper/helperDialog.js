import { SYSTEM_ID } from "../config/uiConstants.js"
import helperContext from "./helperContext.js"
import { configRULES } from "../config/rules.js";

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
     * dialogListOptions
     * @param {*} rules 
     * @param {*} title 
     * @param {*} options 
     * @param {*} position 
     */
    static async dialogListOptions({rules, title, options, bMultiple=false, 
                                    position={height: 'auto'}, sExplain='', bFromWizard=false, bPriority=false}) {
        let _options = ''
        let _buttonClassSelected = ''
        options.map(option => {
            const sImg = option.img ? `<img src="${option.img}" class="_iconImage"/>` : ''
            _options += `<li data-key="${option.key}">
                            <div class="_wrap">
                                <input type="checkbox" 
                                       ${bMultiple ? 'id="option_'+option.key+'"' : ''}
                                       class="_selector" ${!!option.checked ? 'checked' : ''}>
                                ${sImg}
                                <label ${bMultiple ? 'for="option_'+option.key+'"' : ''}
                                       class="_title">${option.label}</label>
                            </div>
                        </li>`
            if (!!option.checked) _buttonClassSelected = '_selected'
        })
        const content = sExplain === '' ? `<ul class="_main">${_options}</ul>` :
                                          `<div class="_explain">${sExplain}</div><ul class="_main">${_options}</ul>`

        const option = await foundry.applications.api.DialogV2.wait({
            classes: ['_extend', `_${rules}`, ...(bPriority ? ['_priority'] : []), ...(bFromWizard ? ['_wizard'] : [])],
            window: { title: title },
            position: position,            
            content,
            buttons: [{
                label: game.i18n.localize("common.confirmar"),
                class: _buttonClassSelected, 
                callback: (event, button) => {
                    if (bMultiple) {
                        let mResponse = []
                        $(event.currentTarget).find('ul._main').find('input[type="checkbox"]._selector').each((i,e) => {
                            mResponse.push({
                                key: $(e).parents('li').data('key'),
                                checked: $(e).prop('checked')
                            })
                        })
                        return mResponse
                    } else {
                        const checked = $(event.currentTarget).find('ul._main')
                                                            .find('input[type="checkbox"]._selector:checked')                        
                        if (!checked.length === 0) return null
                        return checked.parents('li').data('key')
                    }
                }
            }],
            render: (_event, dialog) => {                             
                this._setShadowToDialog(dialog)
                if (bFromWizard) this._setFrameToDialog(dialog)
                if (!bMultiple) this._setInitialDialogEvents(dialog)  
                this._setScrollTo0(dialog)
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
    static async dialogSelectLore(rules, lore, actor, bFromWizard=false) {
        const lore2 = lore === 'profesionPaterna' ? 'profesion' : lore
        const mOptions = await helperContext.getLoreOptions(rules, lore2, actor)
        let options = ''
        mOptions.map((option, index) => {
            options += `<li data-key=${option.item.system.key}>
                            <input type="checkbox" class="_selector" ${index === 0 ? 'checked' : ''}>
                            <label class="_title">${option.item.name}</label>
                            <button type="button" class="icon fas fa-solid fa-magnifying-glass _showDescription" 
                                    data-action="showCompendiumItem" 
                                    data-rules="${rules}" data-lore="${lore2}" data-item="${option.item.id}"
                                    data-tooltip="${game.i18n.localize('tooltip.showItem')}">
                            </button>                        
                        </li>`
        })
        let title = game.i18n.localize("common."+lore2)
        let content = `<ul class="_main">${options}</ul>`
        let position = { height: 'auto' }
        if (bFromWizard) {
            const nStep = actor.system.control.wizard.step
            title = game.i18n.localize(`wizard.step${nStep}.title_${rules}`)
            content = `<div class="_description">${game.i18n.localize("wizard.step"+nStep+".description_"+rules)}</div>
                       ${content}`
            position = { height: 'auto', width: $(document).width()/2 }
        }

        const option = await foundry.applications.api.DialogV2.wait({
            classes: ['_extend', '_selectLore', `_${rules}`, ...(bFromWizard ? ['_wizard'] : [])],
            window: { title: title },
            position,            
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
                if (bFromWizard) this._setFrameToDialog(dialog)
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
    static async dialogDescription({document=null, content='', title='', rules=null, width, img='', position, bFromWizard=false}) {
        const sRules = rules ? rules : document?.system.rules
        let sContent = document ? await this.descriptionByType(document) : content
        const sTitle = document ? document.name : title
        const sImg = img !== '' ? img : 
                     document ? document.img : ''

        const sWidth = width ? width :
                               document ? document.sheet.position.width : 500

        const dialog = await foundry.applications.api.DialogV2.prompt({
            classes: ['_extend', '_description', `_${sRules}`, ...(bFromWizard ? ['_wizard'] : [])],
            window: { title: sTitle },
            position: position || {width: sWidth},
            content: sContent,
            ok: {},
            render: (_event, dialog) => {
                this._setShadowToDialog(dialog)   
                this._setWaterMarkToDialog(dialog, document, sImg)             
                this._setNoFooter(dialog)
                this._setScrollTo0(dialog)            
            }
        })
    }

    /**
     * descriptionByType
     */
    static async descriptionByType(document) {

        const rules = document.system.rules
        const moneda = configRULES[rules].moneda

        if (document.type === 'profesion') {

            let sEstratos = ''
            const oEstratos = await helperContext.getEstratos(document.system.rules)
            const mCompetencias = await helperContext.getCompetencias(document.system.rules)

            document.system.estratos.filter(e => e.checked).map(e => {
                if (oEstratos[e.key]) {
                    sEstratos += sEstratos === '' ? oEstratos[e.key].label : 
                                                    ', '+oEstratos[e.key].label
                }
            })

            let sCaracteristicas = ''
            for (var s in document.system.caracteristicas) {
                const nChar = document.system.caracteristicas[s]
                if (nChar > 0) {
                    sCaracteristicas += sCaracteristicas === '' ? nChar + ' en ' + game.i18n.localize('CHAR.'+s) :
                                                                  ', ' + nChar + ' en ' + game.i18n.localize('CHAR.'+s)
                }
            }

            let sPrimarias = ''
            let sSecundarias = ''
            
            for (var s0 of ['primaria', 'secundaria']) {
                let sText = ''
                const mCompEval = document.system.competencias.filter(e => e[s0])            
                const mCompEvalGrupos = [...new Set(
                    mCompEval.map(obj => obj.grupo).filter(grupo => grupo !== undefined && grupo !== null && grupo !== '') 
                )]   
                mCompEvalGrupos.unshift('')             
                mCompEvalGrupos.map(nGrupo => {

                    let sText0 = ''
                    mCompEval.filter(e => Number(e.grupo) === Number(nGrupo)).map(comp => {
                        const oComp = mCompetencias.find(e => e.system.key === comp.key)
                        const _s = nGrupo === '' ? ', ' : ' o '
                        sText0 += sText0 === '' ? oComp.name : _s + oComp.name
                    })
                    if (nGrupo !== '') sText0 = '( '+ sText0 +' )'
                    sText += sText === '' ? sText0 : ', '+sText0
                })
                if (s0 === 'primaria') sPrimarias = sText
                if (s0 === 'secundaria') sSecundarias = sText
            }

            let sIngresos = ''
            document.system.estratos.filter(e => e.checked).map(e => {
                const _estrato = oEstratos[e.key].label              
                if (e.ingresos !== '') {
                    let sFormula = e.ingresos
                    const matchSkill = e.ingresos.match(/\{skill ([^}]+)\}/);
                    if (matchSkill) {
                        const skill = mCompetencias.find(e => e.system.key ===  matchSkill[1])
                        sFormula = sFormula.replaceAll("{skill "+matchSkill[1]+"}", skill?.name)
                    }
                    sFormula = sFormula.replaceAll("*", ' x ')
                    
                    const addText = `<span class="_bold _italic">${_estrato}</span>: ${sFormula} <span class="_italic">${moneda}</span>`
                    sIngresos += sIngresos === '' ? addText : ', '  + addText
                }   
            })

            return `<div class="_properties">
                        <div class="_row _gapped">
                            <img src="systems/aquelarre/assets/ui/vyc_comp_normal.png" class="_textIcon"/>
                            <label>
                                <span class="_bold _noWrap">${game.i18n.localize('common.estratos')}:</span>
                                <span>${sEstratos}</span>
                            </label>
                        </div>
                        <div class="_row _gapped">
                            <img src="systems/aquelarre/assets/ui/vyc_comp_normal.png" class="_textIcon"/><label>
                                <span class="_bold _noWrap">${game.i18n.localize('common.minCaracteristicas')}:</span>
                                <span>${sCaracteristicas}</span>
                            </label>
                        </div>        
                        <div class="_row _gapped">
                            <img src="systems/aquelarre/assets/ui/vyc_comp_normal.png" class="_textIcon"/>
                            <label>
                                <span class="_bold _noWrap">${game.i18n.localize('common.compPrimarias')}:</span>
                                <span>${sPrimarias}</span>
                            </label>
                        </div> 
                        <div class="_row _gapped">
                            <img src="systems/aquelarre/assets/ui/vyc_comp_normal.png" class="_textIcon"/>
                            <label>
                                <span class="_bold _noWrap">${game.i18n.localize('common.compSecundarias')}:</span>
                                <span>${sSecundarias}</span>
                            </label>
                        </div>        
                        <div class="_row _gapped">
                            <img src="systems/aquelarre/assets/ui/vyc_comp_normal.png" class="_textIcon"/>
                            <label>
                                <span class="_bold _noWrap">${game.i18n.localize('common.ingresosSemanales')}:</span>
                                <span>${sIngresos}</span>
                            </label>
                        </div>                                                                                 
                    </div>
                    <div class="_description">${document.system.descripcion}</div>`

        }
        return document.system.descripcion
    }

    static async dialogDescription2(content='', title='', rules=null, position, sClass='') {
        const dialog = await foundry.applications.api.DialogV2.prompt({
            classes: ['_extend', '_description', '_'+rules, sClass],
            window: { title: title },
            position: position || {width: sWidth},
            content: content,
            ok: {
                label: game.i18n.localize("common.continuar"),
            },
            render: (_event, dialog) => {             
                this._setShadowToDialog(dialog)   
                this._setWaterMarkToDialog(dialog, document, '')             
                this._setScrollTo0(dialog)
                //this._setNoFooter(dialog)
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

    static _setFrameToDialog(dialog) {
        $(dialog.element).find('.window-content').prepend(`<div class="_frame _top" style="background-image: url(../systems/${SYSTEM_ID}/assets/ui/vyc_frameTop.png)"></div>
                                                           <div class="_frame _right" style="background-image: url(../systems/${SYSTEM_ID}/assets/ui/vyc_frameRight.png)"></div>
                                                           <div class="_frame _bottom" style="background-image: url(../systems/${SYSTEM_ID}/assets/ui/vyc_frameBottom.png)"></div>
                                                           <div class="_frame _left" style="background-image: url(../systems/${SYSTEM_ID}/assets/ui/vyc_frameLeft.png)"></div>`)  
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
        const formDialog = $(dialog.element).find('form.dialog-form') 
        if (formDialog) {
            formDialog.css('--formDialogHeight', Math.round(formDialog.height()) + 'px')
            formDialog.find('.dialog-content').scrollTop(0)
        }
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
            const bFromWizard = $(event.currentTarget).parents('dialog').hasClass('_wizard')
            this.dialogDescription({document, bFromWizard})
        })
    }

    static _setScrollTo0(dialog) {
        const formDialog = $(dialog.element).find('form.dialog-form') 
        if (formDialog.length > 0) {
            formDialog.scrollTop(0)
            formDialog.find('.dialog-content').scrollTop(0)    
        }
    }

    static _checkOnlyMe(li) {
        li.parent().find('li').each((i,e) => {            
            if ($(e).data('key') === li.data('key')) return
            $(e).find('input._selector').prop('checked', false)
        })
        li.find('input._selector').prop('checked', true)      
    }

}