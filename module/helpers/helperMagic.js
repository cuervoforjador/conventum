import{helperUtils as e}from"./helperUtils.js";import{helperSocket as l}from"./helperSocket.js";import{helperMessages as t}from"./helperMessages.js";import{oRoll as a}from"../objects/oRoll.js";export class helperMagic{static dialogSelectSpell(l,t,a){if(!l)return;a={select:!0,learn:!1,hideLearned:!1,onlyLearned:!1,destroy:!0,cell:"",shape:"",level:0,...a};let s=`<formHeader>
                            ${t?""!==a.shape?game.i18n.localize("common.spell")+" - "+game.i18n.localize("common."+a.shape):game.i18n.localize("common.spell"):game.i18n.localize("common.ritualsOf")+a.level}
                            <button class="_openCompendium" data-pack="spells">${game.i18n.localize("common.openCompendium")}</button>
                        </formHeader>`,i=t?Array.from(l.items).filter(e=>"spell"===e.type&&e.system.type.vis):Array.from(l.items).filter(e=>"spell"===e.type&&e.system.type.ordo);a.hideLearned&&(i=i.filter(e=>!e.system.learned)),a.onlyLearned&&(i=i.filter(e=>e.system.learned)),""!==a.shape&&(i=i.filter(e=>CONFIG.ExtendConfig.magic.shape[e.system.properties.shape].parent===a.shape)),Number(a.level)>0&&(i=i.filter(e=>Number(e.system.level)===Number(a.level))),i.sort(e.byName);let o='<formItems class="_weapons">';i.map(e=>{let s=t?game.i18n.localize("spell.vis"+e.system.level):game.i18n.localize("spell.ordo"+e.system.level),i=t?e.system.level<=l.system.magic.vis:e.system.level<=l.system.magic.ordo,n=e.system.learned,r=e.system.study.fromBook,m=l.items.get(e.system.study.book),c=r?`<formField class="_100">
                                        <label>${game.i18n.localize("common.grimoire")}</label>
                                        <label style="font-weight: 900">${m.name}</label>
                                      </formField>`:"",d=t?`<formField class="_100">
                                        <label>${game.i18n.localize("common.shape")}</label>
                                        <label style="font-weight: 900">
                                            ${game.i18n.localize("common."+e.system.properties.shape)}</label>
                                      </formField>`:"";o+=`<formItem data-id="${e.id}" class="">
                            <div class="_itemImg" style="background-image: url(${e.img})"></div>
                            <div class="_itemContent">
                                <label class="_title _100">${e.name}</label>
                                <div class="_detail">
                                    <formField class="_100">
                                        <label>${game.i18n.localize("common.level")}: </label>
                                        <label style="font-weight: 900">${e.system.level} (${s})</label>
                                    </formField>
                                    ${d}
                                    ${c}
                                    <div class="_properties">
                                        ${this._iuProperties([{visible:!n,i18n:"common.learnedS"},{visible:n,i18n:"common.learned"},{visible:!i,i18n:"common.levelHigh"}])}
                                    </div>                                    
                                </div>                            
                            </div>
                            <div class="_itemButtons">
                            ${a.select?this._iuButton(e.id,"select",a,"scroll","common.select"):""}
                            ${a.learn?this._iuButton(e.id,"learn",a,"learnSpell","common.learn"):""}
                            ${a.destroy?this._iuButton(e.id,"delete",a,"delete","common.destroy"):""}
                            </div>      
                        </formItem>`}),o+="</formItems>",0===i.length&&(o=`<formItems><info> ${a.hideLearned?t?game.i18n.localize("info.noSpells1"):game.i18n.localize("info.noRituals1"):""!==a.cell?t?game.i18n.localize("info.noSpells2"):game.i18n.localize("info.noRituals2"):a.onlyLearned?t?game.i18n.localize("info.noSpells3"):game.i18n.localize("info.noRituals3"):t?game.i18n.localize("info.noSpells"):game.i18n.localize("info.noRituals")}</info></formItems>`);let n=new Dialog({title:game.i18n.localize("common.spells"),content:"<formDialog>"+s+o+"</formDialog>",buttons:{select:{label:game.i18n.localize("common.select"),async callback(e,l){}}}});n.options.classes=["dialog","dialogSpells","_formDialog","_formBig","_noButtons"],n.actor=l,n.render(!0,{top:"5%",left:"5%"})}static dialogSelectOrdo(l){let t=`<formHeader>${game.i18n.localize("common.ordo")}</formHeader>`,a=[];for(var s in CONFIG.ExtendConfig.magic.spellsORDO){let i=CONFIG.ExtendConfig.magic.spellsORDO[s];a.push({label:i.label,level:i.level,...i["s"+l.system.magic.system]})}let o=e.calcValueTotal(l.system.skills.theology),n='<formItems class="_weapons">';a.map(t=>{let a=game.i18n.localize("spell.ordo"+t.level),s=e.assetsPath()+t.img,i=Number(o)>=Number(t.skillMin),r=l.system.magic.ordos["o"+t.level];n+=`<formItem data-ordo="${t.level}" class="">
                            <div class="_itemImg" style="background-image: url(${s})"></div>
                            <div class="_itemContent">
                                <label class="_title _100">${a}</label>
                                <div class="_detail">
                                    <formField class="_100">
                                        <label>${game.i18n.localize("common.level")}: </label>
                                        <label style="font-weight: 900">${t.level} (${a})</label>
                                    </formField>
                                    <formField class="_100">
                                        <label>${game.i18n.localize("common.theology")}: </label>
                                        <label style="font-weight: 900">${o}%</label>
                                        <label style="margin-left: 10px"> / ${game.i18n.localize("common.theoMin")}: </label>
                                        <label style="font-weight: 900">${t.skillMin}%</label>
                                    </formField>                                    
                                    <div class="_properties">
                                        ${this._iuProperties([{visible:!r,i18n:"common.learnedS"},{visible:r,i18n:"common.learned"},{visible:!i,i18n:"common.levelHigh"}])}
                                    </div>                                    
                                </div>                            
                            </div>
                            <div class="_itemButtons">
                            ${!r&i?this._iuButton(t.level,"learnOrdo",{ordo:"true"},"scroll","common.learn"):""}
                            </div>      
                        </formItem>`}),n+="</formItems>";let r=new Dialog({title:game.i18n.localize("common.spells"),content:"<formDialog>"+t+n+"</formDialog>",buttons:{select:{label:game.i18n.localize("common.select"),async callback(e,l){}}}});r.options.classes=["dialog","dialogSpells","_formDialog","_formBig","_noButtons"],r.actor=l,r.render(!0,{top:"5%",left:"5%"})}static _iuProperties(e){let l="";return e.map(e=>{l+=e.visible?'<span class="_prop">'+game.i18n.localize(e.i18n)+"</span>":""}),l}static _iuButton(e,l,t,a,s){return`<a class="_frameButton"
                   data-action="${l}"
                   data-cell="${t.cell}"
                   data-shape="${t.shape}"
                   data-ordo="${t.ordo}"
                   data-id="${e}">
                   <button>
                        <img src="/systems/${game.system.id}/assets/icons/${a}.svg" />
                        <label>${game.i18n.localize(s)}</label>
                   </button>                                    
                </a>`}static handler(e,l,t){$(l).find("a._frameButton").click(helperMagic.onClickButton.bind(e))}static async onClickButton(l){l.preventDefault();let t=$(l.delegateTarget).data("action"),a=$(l.delegateTarget).data("shape"),s=$(l.delegateTarget).data("cell"),i=$(l.delegateTarget).data("id"),o=this.actor;if(!o)return;let n=this.actor.items.get(i);if(n||$(l.delegateTarget).data("ordo"))switch(t){case"select":n.system.type.vis?(await helperMagic.createTemplateCell(o,n.id,s,a),e.dialog(n.name,n.system.info.preparation,"_info _spellInfo")):await o.update({"system.magic.template.spellId":n.id,"system.magic.template.selected":s}),this.close();break;case"delete":n.delete(),this.close();break;case"learn":await helperMagic.learningSpell(o,n),this.close();break;case"learnOrdo":await helperMagic.learningOrdo(o,i),this.close()}}static async createTemplateCell(e,l,t,a){let s=e.items.get(l),i=await helperMagic.spellRollPreparation(e,s),o;await e.update({["system.magic.template."+t]:{itemId:s.id,days:0,roll:"spell"!==a,rolled:"spell"===a,success:"spell"===a,prepTime:i,prepValue:0,prepUnit:helperMagic.spellAlchemyPreparation(s,e)?.unit,dose:helperMagic.spellPreparation(s)?.dose},"system.magic.template.spellId":s.id,"system.magic.template.selected":t})}static async learningSpell(e,l){e&&l&&(await e.update({"system.magic.study":{...e.system.magic.study,learning:!0,spellId:l.id,months:0,unit:"common.months",read:!1,channeled:!1,learned:!1,learnedPercent:0,learnedDays:0,learnedMonths:0,teached:!1,teachPercent:0,memorized:!1}}),await l.update({"system.study":{...e.system.study,months:0,read:!1,learned:!1,learnedPercent:0,learnedDays:0,learnedMonths:0,teached:!1,teachPercent:0,memorized:!1}}),e.sheet.render(!0))}static async learningOrdo(e,l){e&&await e.update({"system.magic.study":{...e.system.magic.study,learning:!0,spellId:"",ordoId:l,months:0,unit:"common.months",read:!1,channeled:!1,learned:!1,learnedPercent:0,learnedDays:0,learnedMonths:0,teached:!1,teachPercent:0,memorized:!1}})}static async unlearnSpell(e){e&&(await e.update({"system.magic.study":{...e.system.magic.study,learning:!1,spellId:"",ordoId:"",months:0,unit:"common.months",read:!1,channeled:!1,learned:!1,learnedPercent:0,learnedDays:0,learnedMonths:0,teached:!1,teachPercent:0,memorized:!1}}),e.sheet.render(!0))}static async unlearnOrdo(e,l){e&&e.update({["system.magic.ordos.o"+l]:!1})}static async selectSpell(e,l,t){await e.update({"system.magic.template.selected":t,"system.magic.template.spellId":l})}static async deactivate(e,l,t){e&&e.system.magic.template[t]&&await e.update({["system.magic.template."+t]:{itemId:"",rolled:!1},"system.magic.template.spellId":"","system.magic.template.selected":""})}static prepareSpell(e,l,t){this.dialogSelectSpell(e,!0,{cell:l,shape:t,onlyLearned:!0,destroy:!1,select:!0})}static selectRitual(e,l){this.dialogSelectSpell(e,!1,{level:l})}static spellProperty(e){return e.system.type.vis?CONFIG.ExtendConfig.magic.spellsVIS["vis"+e.system.level]["s"+e.system.type.system]:CONFIG.ExtendConfig.magic.spellsORDO["ordo"+e.system.level]["s"+e.system.type.system]}static spellPreparation(e){return e.system.type.vis?CONFIG.ExtendConfig.magic[e.system.properties.shape]?.["s"+e.system.type.system]:null}static spellAlchemyPreparation(l,t){if(!t||!t.system.skills.alchemy)return;let a=e.calcValueTotal(t.system.skills.alchemy),s=helperMagic.spellPreparation(l);if(s)return s.preparation.find(e=>e.alchemyMin<=a&&e.alchemyMax>=a)}static async spellRollPreparation(e,l){let t=helperMagic.spellAlchemyPreparation(l,e);if(t){let s=new a({target:"spell",subtarget:"preparation",actor:e,item:l,noHelps:!0,roll:{formula:t.roll,rollformula:!0,simple:!0,title:game.i18n.localize("common.prepare"+l.system.properties.shape)},simpleMessage:{title:game.i18n.localize("common.prepare"+l.system.properties.shape),info:""}});return await s.simpleRollIt(),s._result.roll.total}return 0}static calcArmorMod(e){let l={itemID:"",penal:"+0"};return e.items.filter(e=>"armor"===e.type&&e.system.control.inUse).map(e=>{let t=CONFIG.ExtendConfig.armors.armorTypes[e.system.type].magicPenal;Number(t)<=Number(l.penal)&&(l.penal=t,l.itemID=e.id)}),l}static ordoLevel(e,l){return CONFIG.ExtendConfig.magic.spellsORDO["ordo"+l]?.["s"+e.system.magic.system]}static async channelOrdo(l,a){if(!l)return;let s=this.ordoLevel(l,a),i=e.calcValueTotal(l.system.skills.theology),o=e.calcValueTotal(l.system.secondaries.exper);if(i<Number(s.skillMin)){e.dialog("",game.i18n.localize("info.lowTheology"));return}if(o<Number(s.exper)){e.dialog("",game.i18n.localize("info.lowExperience"));return}await l.update({"system.secondaries.exper.value":l.system.secondaries.exper.value-Number(s.exper),"system.magic.study":{...l.system.magic.study,read:!0,channeled:!0,learned:!1,learnedPercent:0,learnedDays:0,learnedMonths:0,teached:!1,teachPercent:0,memorized:!1}}),await t.rollMessage(l,"-"+s.exper+" "+game.i18n.localize("common.experAdded"),"")}}