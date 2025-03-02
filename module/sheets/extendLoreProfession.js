/**
 * @extends {ItemSheet}
 */

import { helperBackend } from "../helpers/helperBackend.js";
import { helperSheets } from "../helpers/helperSheets.js";
import { helperUtils } from "../helpers/helperUtils.js";

export class extendLoreProfession extends ItemSheet {

  /**
   * Mapping Sheets options...
   * @inheritdoc
   * @returns {object} - Sheet Options
   */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [game.system.id, "sheet", "loreProfession", "golden", "_sheetDialog"],
      template: CONFIG._root+"/templates/loreProfession.html",
      width: 1000,
      height: 950,
      tabs: [
        {navSelector: ".itemTabsBar", contentSelector: ".itemTabsContent", initial: "description"}
      ],       
    });
  }

  /**
   * Context Sheet...
   * @inheritdoc
   * @returns {object} - Context
   */
   async getData() {

    const context = super.getData();
    context.isGM = game.user.isGM;

    context.systemData = this.item.getRollData();
    context.backend = await helperBackend.getBackend(context, 'loreProfession');
    
    await helperBackend.checkKey(context);

    [context.systemData.primarySkills, context.systemData.secondarySkills].map( o => {   
      o.sort((a,b) => {
        const sA = context.backend.skills.find(e => e.id === a.key)?.name.toUpperCase();
        const sB = context.backend.skills.find(e => e.id === b.key)?.name.toUpperCase();
        return sA < sB ? -1 :
               sA > sB ? 1 : 0;
      });
      o.sort( (a, b) => { return a.group < b.group ? -1 : 
        a.group > b.group ? 1 : 0 });      
    });

    return context;
  }

  /**
   * Sheet events Listeners...
   * @inheritdoc
   * @param {html} html
   */
   activateListeners(html) {
    super.activateListeners(html);
    if ( !this.isEditable ) return;
   
    html.find("a.loreAdd").click(this._addLore.bind(this));
    html.find("a.loreDelete").click(this._deleteLore.bind(this));
    html.find("input._editValue").change(this._changeEditValue.bind(this));
    html.find("a._toSkill").click(this._linkToSkill.bind(this));
    html.find("a._toSkill").mousedown(this._setIncome.bind(this));
    html.find("._toolEdit ._header").click(this._toggleToolEdit.bind(this));
    html.find("a._trans").click(this._transSkills.bind(this));
    html.find("a._deleteCusto").click(this._deleteCusto.bind(this));

    //Draggables...
    if ($(this.form).find('#initDragg').prop('checked')) {
      $(this.form).find('#primarySkills').draggable({
        cursor: "crosshair",
        //stack: 'document',
        helper: 'clone',
        revert: true,
        snap: true,
        containment: 'document',        
        zIndex: 1000,
      });    

      $(this.form).find('#secondarySkills').draggable({
        cursor: "crosshair",
        //stack: 'document',
        helper: 'clone',
        revert: true,
        snap: true,
        containment: 'document',        
        zIndex: 1000,        
      });     
    }
    $(this.form).find('#primaryColumn').droppable({drop: this._droppingSkills});
    $(this.form).find('#secondaryColumn').droppable({drop: this._droppingSkills});    
  }
  
  /**
   * _addLore
   * @param {*} event 
   */
  _addLore(event) {
    event.preventDefault();
    const oNew = helperSheets.addLoreProperty(event);
    if (!oNew) return;

    if (event.currentTarget?.dataset.target === 'stratum') {
      if (this.item.system.stratums.find(e => e.key === oNew.key)) return;
      oNew.income = oNew.value;
      delete oNew.value;
      this.item.system.stratums.push(oNew);
      this.item.update({
        "system.stratums": this.item.system.stratums
      });
    }

    if (event.currentTarget?.dataset.target === 'characteristic') {
      if (this.item.system.minChars.find(e => e.key === oNew.key)) return;
      this.item.system.minChars.push(oNew);
      this.item.update({
        "system.minChars": this.item.system.minChars
      });
    }

    if (event.currentTarget?.dataset.target === 'primarySkill') {
      if (this.item.system.primarySkills.find(e => e.key === oNew.key
                                                && e.group === oNew.group)) return;
      this.item.system.primarySkills.push(oNew);
      this.item.update({
        "system.primarySkills": this.item.system.primarySkills
      });
    }    

    if (event.currentTarget?.dataset.target === 'secondarySkill') {
      if (this.item.system.secondarySkills.find(e => e.key === oNew.key
                                                && e.group === oNew.group)) return;
      this.item.system.secondarySkills.push(oNew);
      this.item.update({
        "system.secondarySkills": this.item.system.secondarySkills
      });
    }

  }

  /**
   * _deleteLore
   * @param {*} event 
   */
  _deleteLore(event) {
    event.preventDefault();
    const key = $(event.currentTarget).data('key');
    const group = $(event.currentTarget).data('group');
    if (!key) return;

    if (event.currentTarget?.dataset.target === 'stratum') {
      this.item.update({
        "system.stratums": this.item.system.stratums.filter(e => e.key !== key)
      });    
    }

    if (event.currentTarget?.dataset.target === 'characteristic') {
      this.item.update({
        "system.minChars": this.item.system.minChars.filter(e => e.key !== key)
      });    
    }

    if (event.currentTarget?.dataset.target === 'primarySkill') {
      this.item.update({
        "system.primarySkills": this.item.system.primarySkills.filter(e => !(e.key === key
                                                                          && e.group === group))
      });    
    }    

    if (event.currentTarget?.dataset.target === 'secondarySkill') {
      this.item.update({
        "system.secondarySkills": this.item.system.secondarySkills.filter(e => !(e.key === key
                                                                          && e.group === group))
      });    
    }  

  }

  /**
   * _changeEditValue
   */
  async _changeEditValue(event) {
    event.preventDefault();
    const source = $(event.currentTarget).data('source');
    const target = $(event.currentTarget).data('target');
    const index = $(event.currentTarget).data('index');

    let values = this.item.system[source][index];
    let sPath = "system."+source;
    if (!values) return;
    values[target] = Number($(event.currentTarget).val());
    await this.item.update({
      [sPath]: this.item.system[source]
    });

  }

  /**
   * _linkToSkill
   */
  async _linkToSkill(event) {
     let sKey = event.currentTarget?.dataset.key;

     let doc = (await helperBackend.getFromCompendium('skills', false))?.find(e => e.system.control.key === sKey);  
     if (!doc) return;

     doc.sheet.render(true);
  }

  /**
   * _setIncome
   * @param {*} event 
   */
  _setIncome(event) {
    let sKey = event.currentTarget?.dataset.key;
    this.item.update({
      "system.income.expression": 'skill_' + sKey + ' * 1'
    });
  }

  /**
   * _toggleToolEdit
   * @param {*} event 
   */
  _toggleToolEdit(event) {
    $(event.currentTarget).parent().find('._content').toggle();
  }

  /**
   * _transSkills
   * @param {*} event 
   */
  async _transSkills(event) {
    const sId = $(event.currentTarget).data('id');
    const sVal = $(event.currentTarget).parents('._toolEdit').find("#trans").val();
    const section = $(event.currentTarget).parents('section[data-tab="skills"]');
    const selector = section.find('#'+sId);
    const sTarget = sId === '_skillsPrimary' ? 'primarySkills' : 'secondarySkills';
    sVal.split(',').map(s => {
      let sSearch = s.trim().toLowerCase();
      sSearch = sSearch.replace('conocimiento', 'conocim.');
      selector.find('option').each(function(i, e) {
        if ($(e).text().toLowerCase() === sSearch.toLowerCase()) {
          const oNew = {
            key: $(e).val(),
            group: ''
          }
          if (this.item.system[sTarget].find(e => e.key === oNew.key
                                               && e.group === oNew.group)) return;
          this.item.system[sTarget].push(oNew);        
        }
      }.bind(this));
    });

    if (sTarget === 'primarySkills') {
      this.item.update({
        "system.primarySkills": this.item.system.primarySkills
      });  
    } else {
      this.item.update({
        "system.secondarySkills": this.item.system.secondarySkills
      });  
    }  
  }

  /**
   * _dragginSkills
   * @param {*} event 
   * @param {*} ui 
   */
  _dragginSkills(event, ui) {
    $(event.target).addClass('_draggSkills')
  }

  /**
   * _onDragginSkills
   * @param {*} event 
   * @param {*} ui 
   */
  _onDragginSkills(event, ui) {

  }

  /**
   * _droppingSkills
   * @param {*} event
   * @param {*} ui
   */
  async _droppingSkills(event, ui) {
    
    //Target
    let target = $(event.target).find('ol');
    let sNode = target.attr('id');
    let item = game.items.get(target.data('itemid'));
    if (!item) {
      let mDocs = await helperBackend.getFromCompendium('skills', false);      
      let item = mDocs.get(target.data('itemid'));
      if (!item) return;
    }

    let itemFrom = game.items.get($(ui.draggable).data('itemid'));
    if (!itemFrom) {
      let mDocs = await helperBackend.getFromCompendium('skills', false);      
      let itemFrom = mDocs.get($(ui.draggable).data('itemid'));
      if (!itemFrom) return;
    }

    if (item.id === itemFrom.id) return;

    //Current
    let mSkills = [];
    $(event.target).find('._loreRow').each(function(i, e) {
      if (!$(e).data('key')) return;
      mSkills.push({
        key: $(e).data('key'),
        group: Number($(e).data('group'))
      });
    }.bind(this));

    //Adding news
    $(ui.draggable).find('._loreRow').each(function(i, e) {
      if (!$(e).data('key')) return;
      if (mSkills.find(o => (Number(o.group) === Number($(e).data('group'))
                                 && o.key === $(e).data('key')))) return;
      mSkills.push({
        key: $(e).data('key'),
        group: Number($(e).data('group'))
      });                                    
    }.bind(this));

    if (sNode === 'primarySkills') {
      await item.update({
        "system.primarySkills": mSkills });
    }
    if (sNode === 'secondarySkills') {
      await item.update({
        "system.secondarySkills": mSkills });
    }    

    itemFrom.sheet.render(true);
  }

  /**
   * _deleteCusto
   * @param {*} event 
   */
  async _deleteCusto(event) {
    event.preventDefault();
    const key = $(event.currentTarget).data('edit');
    const img = $(event.currentTarget).parent().find('img._custoImg');
    if (!key) return;
    img.prop('src', '');
    await this.item.update({
      [key]: ''
    }); 
  }   

}
