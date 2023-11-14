/**
 * Helpers for Actions
 */

import { mainUtils } from "../../mainUtils.js";
import { helperMessages } from "./helperMessages.js";
import { helperSheetCombat } from "./helperSheetCombat.js";
import { helperActions } from "./helperActions.js";
import { helperRolls } from "./helperRolls.js";
import { aqCombat } from "../../actions/aqCombat.js";
import { aqContext } from "../../actions/aqContext.js";
import { mainBackend } from "../backend/mainBackend.js";

export class helperSheetMagic {

    /**
     * getMagic
     * @param {*} actor 
     * @param {*} systemData 
     */
    static async getMagic(actor, systemData) {

        let oMagic = {};

        await game.packs.get('aquelarre.skills').getDocuments();
        oMagic.skills = Array.from(game.packs.get('aquelarre.skills'))
                                     .filter(e => ( (e.system.control.world === actor.system.control.world) 
                                                 && (e.system.magic.magic)));
        return oMagic;

    }

    /**
     * completeSpellsItems
     * @param {*} mItems 
     */
    static completeSpellsItems(mItems) {
        mItems.filter(e => ((e.type === 'spell') || (e.type === 'ritual'))).map( spell => {
            //spell.system.sPenal = spell.system.penal;
            
        });
    }

    /**
     * getMagicPenals
     * @param {*} actor 
     * @param {*} systemData 
     */
    static getMagicPenals(actor, systemData) {


        //By armor...
        let modByArmor = '-0';
        let mArmor = [];
        for (var s in systemData.armor) {
            let piece = systemData.armor[s];
            if ( !(mArmor.find(e => e === piece.itemID))) {
                mArmor.push(piece.itemID);
            }
        }
        mArmor.map(armorID => {
            const armor = actor.items.get(armorID);
            if (armor) {
                const sMod = CONFIG.ExtendConfig.armorTypes.find(e => e.id === armor.system.armorType).spellMod;
                if (Number(sMod) < Number(modByArmor))
                    modByArmor = sMod;
            }
        });

        systemData.magic.penal.armor = modByArmor;

        systemData.magic.penal.method = this.penalValue(systemData.magic.penal.method);
        systemData.magic.penal.armor = this.penalValue(systemData.magic.penal.armor);
        systemData.magic.penal.concentration = this.penalValue(systemData.magic.penal.concentration);
        systemData.magic.penal.ceremony = this.penalValue(systemData.magic.penal.ceremony);
        systemData.magic.penal.others = this.penalValue(systemData.magic.penal.others);

    }

    /**
     * magicSkillValue
     * @param {*} systemData 
     * @param {*} item 
     */
    static magicSkillValue(systemData, item) {

        let nFinal = 0;
        const nValue = 
           ((item.system.percent.secondary) && (item.system.percent.secondary !== '')) ?
              systemData.characteristics.secondary[item.system.percent.secondary].value :
              systemData.skills[item.system.percent.skill].value;
        if (item.type === 'ritual')
           nFinal = eval( nValue.toString()+' '+helperSheetMagic.penalValue(systemData.magic.penal.ceremony)
                                           +' '+helperSheetMagic.penalValue(systemData.magic.penal.concentration)
                                           +' '+helperSheetMagic.penalValue(systemData.magic.penal.others));
        else
           nFinal = eval( nValue.toString()+' '+helperSheetMagic.penalValue(systemData.magic.penal.method)
                                           +' '+helperSheetMagic.penalValue(systemData.magic.penal.armor)
                                           +' '+helperSheetMagic.penalValue(systemData.magic.penal.concentration)
                                           +' '+helperSheetMagic.penalValue(systemData.magic.penal.others));
        return nFinal;
    }

    /**
     * playSpell
     * @param {*} actor 
     * @param {*} spellId 
     */
    static async playSpell(actor, spellId) {
        const spellItem = actor.items.get(spellId);
        if (!spellItem) return;
        
        //Creating context...
        let context = new aqContext({actorId: actor.id, 
                                     tokenId: (actor.isToken) ? actor.token.id : null, 
                                     spellId: spellId});
        await aqCombat.playSpell(context);

    }

    /**
     * _penalValue
     * @param {*} sPenal 
     */
    static penalValue(sPenal) {
        if (Number(sPenal) === NaN) return '-0';
        if (Number(sPenal) >= 0) return '+'+Number(sPenal).toString();
                           else return Number(sPenal).toString();
    }

    /**
     * codex
     */
    static codex(actor) {

        let mSpells = Array.from(actor.items).filter(e => (e.type === 'spell'));
        helperSheetMagic._sortByLevel(mSpells, 'spell');
        let mRituals = Array.from(actor.items).filter(e => (e.type === 'ritual'));
        helperSheetMagic._sortByLevel(mRituals, 'ritual');
        let mItems = [...mSpells, ...mRituals];

        const config = {
            maxPages:   mItems.length + 8,
            pageIndex: 3,
            pageStart: 5,
            spellPage: 100,
            spellMark: false,
            ritualPage: 100,
            ritualMark: false,
            salmosPage: 100,
            salmosMark: false
        };

        let mPages = [];
        for (var i=config.maxPages; i>0; i--) {

            const pageNumber = config.maxPages - i + 1;
            const oItem = (pageNumber >= config.pageStart) ? 
                                mItems[pageNumber - config.pageStart] : null;
            let bIsIndex = false;
            let mEntries = [];

            //FrontPage

            //Index
            if (pageNumber === config.pageIndex) {
                bIsIndex = true;
                let mapIndex = 0;
                mItems.map(entry => {
                    mEntries.push({
                        name: entry.name,
                        pageNum: config.pageStart + mapIndex
                    });
                    mapIndex++;
                });
                
            }

            mPages.push({
                hasItem: (oItem) ? true : false,
                isFrontPage: (pageNumber === 1),
                isSecondPage: (pageNumber === 2),
                isThirdPage: (pageNumber === 4),
                isIndex: bIsIndex,
                entries: mEntries,
                item: oItem,
                pageNumber: pageNumber,
                zIndex: config.maxPages - pageNumber + 1,
                spellMark: pageNumber === (config.spellPage),
                spellMarkPost: pageNumber === (config.spellPage + 1),
                ritualMark: pageNumber === (config.ritualPage),
                ritualMarkPost: pageNumber === (config.ritualPage + 1),
                salmosMark: pageNumber === (config.salmosPage),
                salmosMarkPost: pageNumber === (config.salmosPage + 1)
            });
        }
        return {
            pages: mPages
        };
    }

    /**
     * initCodex
     * @param {*} event 
     */
    static initCodex(event) {
        var pages = document.getElementsByClassName('codicePage');
        if (pages.length === 0) return;

        for (var i = 0; i < pages.length; i++) {
            var page = pages[i];
            if (i % 2 === 0)
                page.style.zIndex = (pages.length - i);
            $(page).find('._clickable')[0].onclick = this.changePage.bind();
            //let detail = $(page).find('._detail');
            //if (detail.length > 0) detail[0].onclick = this.changePage.bind();
        }
    }

    /**
     * changePage
     */
    static changePage(event) {
        let page = $(event.target).parent()[0];
        const pageNumber = Number(page?.dataset.pagenumber);

        if (pageNumber % 2 === 0) {
            page.classList.remove('flipped');
            page.previousElementSibling.classList.remove('flipped');
        } else {
            page.classList.add('flipped');
            page.nextElementSibling.classList.add('flipped');
        }
        if (pageNumber != 2) 
            $('._codicePenals').slideUp();
        else
            $('._codicePenals').slideDown();
    }

    /**
     * goToPage
     */
    static goToPage(nPage) {
        $( ".codicePage" ).each(function(index, oPage) {
            $(oPage)[0].classList.remove('flipped');
        });
        for (var i=1; i<nPage; i++) {
            let page = $('.codicePage[data-pagenumber="'+nPage+'"]')[0];
            page.classList.add('flipped');
        }
    }

    static codexScrollPage(event) {
        let detail = $(event.currentTarget).find('._detail');
        let title = $(event.currentTarget).find('._title');
  
        let newPosition = detail.scrollTop();
        const step = 10;
        if (event.originalEvent.deltaY < 0) { //To up...
          newPosition -= step;
          if (newPosition < 0) newPosition = 0;
        } else { //To down...
          newPosition += step;
        }
  
        detail.scrollTop(newPosition);
  
        if (newPosition === 0) title.show();
                          else title.hide();
  
    }

    /**
     * _sortByLevel
     * @param {*} mArray 
     */
    static _sortByLevel(mArray, type) {
        mArray.sort((a, b) => {
            let propA = 0; 
            let propB = 0; 
            if (type === 'spell') {
                propA = Number(a.system.vis);
                propB = Number(b.system.vis);
            }
            if (type === 'ritual') {
                propA = Number(a.system.ordo);
                propB = Number(b.system.ordo);
            }            
            if (propA < propB) return -1;
            if (propA > propB) return 1;
            return 0;
        }); 
    }

}







