import{pixiRoll as l}from"./pixiRoll.js";import{helperUtils as t}from"../helpers/helperUtils.js";import{helperMessages as s}from"../helpers/helperMessages.js";import{helperSocket as e}from"../helpers/helperSocket.js";import{helperCombat as o}from"../helpers/helperCombat.js";import{helperArmor as a}from"../helpers/helperArmor.js";import{helperMagic as i}from"../helpers/helperMagic.js";import{helperSheets as r}from"../helpers/helperSheets.js";export class oRoll{_target="";_actor=null;_action=null;_weapon=null;_skill=null;_spell=null;_item=null;_step=null;_antiStep=null;_tab=null;_fluxId=null;_combat=null;_encounter=null;_noHelps=!1;_smokeColor="#555555";_roll={auto:!1,formula:"1D100",rollformula:!1,simple:!1,title:"",anti:!1,base:0,mod:"+0",customod:"+0",totalmod:"+0",bonus:"+0",penal:"+0",value:0,luck:0,rollLevels:!0};_oppo={formula:"1D100",rollformula:!1,simple:!1,title:"",anti:!1,base:0,mod:"+0",customod:"+0",totalmod:"+0",bonus:"+0",penal:"+0",value:0,luck:0,rollLevels:!0};_oppoRoll={rolling:!1,attacker:null,defender:null,attackerTurn:!1,defenderTurn:!1,attackerRoll:{base:0,mod:"+0",title:"",total:0,rolled:!1,result:0,success:!1,win:!1,lost:!1},defenderRoll:{base:0,mod:"+0",title:"",total:0,rolled:!1,result:0,success:!1,win:!1,lost:!1}};_spellProperties={conc:0,faith:0,exper:0,mod:"+0",skillMin:0,study:0};_result={roll:null,isFormula:!1,max:0,nResult:0,result:{success:!1,autoSuccess:!1,failure:!1,autoFailure:!1,criticalSuccess:!1,criticalFailure:!1},resultClass:"noEval",luckApply:!1,luckModif:{original:0,current:0,lost:0}};_rollLevel=null;_message=null;_simpleMessage={actorImg:"",actorName:"",title:"",info:{},img:"",header:"",subHeader:"",extra:""};constructor(l){if(!l||!l.actor)return;try{this._target=l.target,this._subtarget=l.subtarget,this._actor=l.actor,this._action=l.action,this._weapon=l.weapon,this._skill=l.skill,this._item=l.item,this._spell=l.spell,this._step=l.step,this._tab=l.tab,this._fluxId=l.fluxid,this._noHelps=l.noHelps?l.noHelps:this._noHelps,this._noHelps=!!this._action&&!this._action.system.roll.useHelps||this._noHelps,this._smokeColor=l.smokeColor?l.smokeColor:this._smokeColor,this._roll={...this._roll,...l.roll},this._oppo={...this._roll,...l.oppo},this._ordoLevel=l.ordoLevel,["base","value"].map(l=>{this._roll[l]=void 0===this._roll[l]?0:this._roll[l],this._oppo[l]=void 0===this._roll[l]?0:this._roll[l]}),this._simpleMessage.title=""!==l.simpleMessage.title?l.simpleMessage.title:"",this._simpleMessage.info=""!==l.simpleMessage.info?l.simpleMessage.info:"",this._prevRoll()}catch(t){ui.notifications.error(t)}}_prevRoll(){this._roll.totalmod=t.sumMods([this._roll.mod,this._roll.customod]),this._getCombat(),this._getEncounter(),this._getAntiStep(),this._getOppoRoll(),this._getSpell()}_getCombat(){this._combat=game.combat}_getEncounter(){this._combat&&(this._encounter=game.items.find(l=>"encounter"===l.type&&l.system.combat===game.combat.id))}_getAntiStep(){this._encounter&&(this._antiStep=o.getAntiStep(this._step))}_getOppoRoll(){if("oppo"!==this._fluxId)return;this._oppoRoll.rolling=!0,this._oppoRoll.attacker=game.combat.combatants.get(this._step.combatantId),this._oppoRoll.defender=game.combat.combatants.get(this._step.targetId),this._oppoRoll.attackerTurn=!this._roll.anti,this._oppoRoll.defenderTurn=this._roll.anti;let l=this._roll.anti?"defenderRoll":"attackerRoll",s=this._roll.anti?"attackerRoll":"defenderRoll";this._oppoRoll[l].base=Number(this._roll.base),this._oppoRoll[l].mod=t.checkMod(this._roll.totalmod),this._oppoRoll[l].title=this._roll.title,this._oppoRoll[l].total=Number(this._roll.value),this._oppoRoll[s].base=Number(this._oppo.base),this._oppoRoll[s].mod=t.checkMod(this._oppo.totalmod),this._oppoRoll[s].title=this._oppo.title,this._oppoRoll[s].total=Number(this._oppo.value)}_getSpell(){this._spell&&(this._spellProperties={...this._spellProperties,...this._spell.system.type.vis?CONFIG.ExtendConfig.magic.spellsVIS["vis"+this._spell.system.level]?.["s"+this._spell.system.type.system]:CONFIG.ExtendConfig.magic.spellsVIS["ordo"+this._spell.system.level]?.["s"+this._spell.system.type.system]})}async roll(){if(this._roll.auto){this.autoRollIt();return}if(this._roll.simple){this.simpleRollIt();return}let t=new l({layerOptions:{opacity:.7}});t.init({context:{actor:this._actor,title:this._roll.title,item:this._action?this._action:this._skill?this._skill:this._weapon?this._weapon:this._item?this._item:null,roll:this},config:{smokeColor:this._skill?this._skill.system.custo.fogColor:this._smokeColor,smokeSpeed:this._skill?Number(this._skill.system.custo.fogSpeed):.5},rollRing:{formula:this._roll.formula,rollformula:this._roll.rollformula,value:this._roll.value,valueText:game.i18n.localize("common.total"),base:this._roll.base,baseText:game.i18n.localize("common.base"),bonus:this._roll.bonus,bonusText:game.i18n.localize("common.bonus"),penal:this._roll.penal,penalText:game.i18n.localize("common.penalizations"),extra:this._roll.luck,extraText:game.i18n.localize("common.avalLuck")},noHelps:this._noHelps}),t.draw()}async autoRollIt(){this._roll.auto=!0,this.postRoll(null,0,"",!1)}async simpleRollIt(){let l=new Roll(this._roll.formula);await l.evaluate(),game.dice3d&&await game.dice3d.showForRoll(l),this.postRoll(l,0,"",!1)}evalResult(l,t,s=0){let e={success:l<=t||l<=5,autoSuccess:l<=5,failure:l>t||l>=96,autoFailure:l>=96,criticalSuccess:l<=Math.ceil(.1*t),criticalFailure:100===l||l>=101-Math.ceil((101-t)*.1)};return s>0&&e.failure&&!e.criticalFailure&&(e.success=l<=t+s,e.failure=l>t+s),e}closeTab(){this._tab&&this._actor.sheet.rendered&&("main"===this._tab?(this._actor.sheet.activateTab(this._tab),r.onCloseSheet(null,this._actor)):this._actor.sheet.activateTab(this._tab))}postRoll(l,t,s,e){if(this._roll.auto){this._result.resultClass="success",this._result.result.autoSuccess=!0,this._result.result.success=!0,this.simpleMessageRoll(),this.updateRoll();return}if(!l)return;if(l._total=Math.ceil(l._total),this._roll.rollformula){this._result.roll=l,this._result.nResult=l.total,this.simpleMessageRoll(),this.updateRoll();return}let o=l.total-t;if(o=e?o<=0?1:o>this._actor.system.secondaries.luck.value?this._actor.system.secondaries.luck.value:o:0,""!==s)for(var a in CONFIG.ExtendConfig.rollLevels)CONFIG.ExtendConfig.rollLevels[a].mod===s&&(this._rollLevel={...CONFIG.ExtendConfig.rollLevels[a],id:a,label:game.i18n.localize(CONFIG.ExtendConfig.rollLevels[a].label)});else this._rollLevel={...CONFIG.ExtendConfig.rollLevels.rollNormal,id:"rollNormal",label:game.i18n.localize(CONFIG.ExtendConfig.rollLevels.rollNormal.label)};this._result={...this._result,roll:l,isFormula:this._roll.rollformula,max:t,nResult:l.total,result:this.evalResult(l.total,t,o),resultClass:"",rollLevel:this._rollLevel,luckApply:e,luckModif:{original:this._actor.system.secondaries.luck.value,current:this._actor.system.secondaries.luck.value-o,lost:o}},this._result.resultClass=this._result.result.criticalSuccess?"criticalSuccess":this._result.result.criticalFailure?"criticalFailure":this._result.result.autoSuccess?"autoSuccess":this._result.result.autoFailure?"autoFailure":this._result.result.success?"success":this._result.result.failure?"failure":"noEval",this.postOppoRoll(),this.messageRoll(),this.updateRoll()}postOppoRoll(){this._oppoRoll.attackerTurn&&(this._oppoRoll.attackerRoll.rolled=!0,this._oppoRoll.attackerRoll.result=this._result.nResult,this._oppoRoll.attackerRoll.success=this._result.result.success),this._oppoRoll.defenderTurn&&(this._oppoRoll.defenderRoll.rolled=!0,this._oppoRoll.defenderRoll.result=this._result.nResult,this._oppoRoll.defenderRoll.success=this._result.result.success)}simpleMessageContent(){if(this._roll.auto&&(this._simpleMessage.img=this._action?this._action.img:"systems/"+game.system.id+"/assets/icons/next.svg",this._simpleMessage.subHeader=`<label class="_info">${this._action?this._action.name:game.i18n.localize("roll.autoSuccess")}</label>`),"damage"===this._target&&(this._simpleMessage.img="systems/"+game.system.id+"/assets/icons/damage.svg",this._simpleMessage.title=game.i18n.localize("common.damageRoll"),this._simpleMessage.subHeader=`<label class="_result">${this._result.nResult} <span class="_litle">${game.i18n.localize("common.damagePoints")}</span></label>`,this._simpleMessage.extra=`<div class="_rollStats _extraInfo">
                    <div class="_statRow">
                        <label>${game.i18n.localize("common.damageBase")}</label>
                        <label class="_stat">${this._simpleMessage.info.base}</label>
                    </div>
                    <div class="_statRow">
                        <label>${game.i18n.localize("attributes.damage")}</label>
                        <label class="_stat">${this._simpleMessage.info.bon}</label>
                    </div>
                    <div class="_statRow">
                        <label>${game.i18n.localize("common.roll")}</label>
                        <label class="_stat">${this._simpleMessage.info.final}</label>
                    </div>
                </div>`),"location"===this._target){let l=game.combat.combatants.get(this._step.targetId),s=l?a.getLocationByRoll(l.actor,this._result.nResult):null,e=l?a.getArmorByRoll(l.actor,this._result.nResult):null;e&&(this._result.nResult>e.system.protection?e.system.protection:this._result.nResult),this._simpleMessage.actorImg=l?l.actor.img:this._simpleMessage.actorImg,this._simpleMessage.actorName=l?l.actor.name:this._simpleMessage.actorName,this._simpleMessage.img="systems/"+game.system.id+"/assets/icons/damage.svg",this._simpleMessage.title=game.i18n.localize("common.location"),this._simpleMessage.subHeader=`<label class="_result"><span class="_litle">[${this._result.nResult}] ${s?.label}</span></label>`,this._simpleMessage.extra=`<div class="_rollStats _extraInfo">
                    <div class="_statRow">
                        <label>${game.i18n.localize("common.protection")}</label>
                        <label class="_stat">${e?e.name:""} (${e?e.system.protection:"0"} Pt.)</label>
                    </div>
                </div>`}if(this._item&&"spell"===this._item.type&&"spell"===this._target&&"preparation"===this._subtarget){let o=i.spellAlchemyPreparation(this._item,this._actor);this._simpleMessage.subHeader=`<label class="_result"><span class="_litle">[${this._roll.formula}] ${this._result.nResult} ${game.i18n.localize(o.unit)}</label>`,this._simpleMessage.extra=`<div class="_rollStats _extraInfo">
                                                <div class="_statRow">
                                                    <label>${game.i18n.localize("common.preparation")}:</label>
                                                    <label class="_stat">${this._item.name}</label>
                                                </div>
                                            </div>
                                            <div class="_rollStats _extraInfo">
                                                <div class="_statRow">
                                                    <label>${game.i18n.localize("common.alchemy")}:</label>
                                                    <label class="_stat">${t.calcValueTotal(this._actor.system.skills?.alchemy)}%</label>
                                                </div>                                          
                                            </div>`}}simpleMessageRoll(){this._simpleMessage.actorImg=this._actor.img,this._simpleMessage.actorName=this._actor.name,this.simpleMessageContent();let l=`<div class="_hexCombatant">
                            <div class="_img" style="background-image: url(${this._simpleMessage.actorImg})">
                            </div>
                         </div>`,t=`<div class="_hexAction">
                        <div class="_img" style="background-image: url(${this._simpleMessage.img})">
                            <label class="_title _showItemInfo _whiteBorderHard">${this._simpleMessage.title}</label>
                            <label>${this._simpleMessage.actorName}</label>
                        </div>
                      </div>`,e,o=`<div class="_roll">
                            ${l}
                            <div class="_hexCombatantFrame"></div>
                            ${t}                            
                            <div class="_hexRoll">
                            <div class="_contentRoll">
                                ${this._simpleMessage.subHeader}
                            </div>
                          </div>
                            <div class="_hexExtra">
                        ${this._simpleMessage.extra}                  
                    </div>
                        </div>`;s.chatMessage(o)}oppoMessageRoll(){let l=s.findMessageByStepId(this._step.id),t=this._oppoRoll.attackerRoll.total>100?100:this._oppoRoll.attackerRoll.total<0?0:this._oppoRoll.attackerRoll.total,o=this._oppoRoll.attackerRoll.result>100?100:this._oppoRoll.attackerRoll.result<0?0:this._oppoRoll.attackerRoll.result,a=this._oppoRoll.attackerRoll.success?"#ffbd0294":"#8f1717",i=this._oppoRoll.defenderRoll.total>100?100:this._oppoRoll.defenderRoll.total<0?0:this._oppoRoll.defenderRoll.total,r=this._oppoRoll.defenderRoll.result>100?100:this._oppoRoll.defenderRoll.result<0?0:this._oppoRoll.defenderRoll.result,c=this._oppoRoll.defenderRoll.success?"#ffbd0294":"#8f1717";if(l)this._roll.anti?(l.content=s.replaceHtmlStyle(l.content,"._hexOppoResult._oppo ._base","width",i),l.content=s.replaceHtmlStyle(l.content,"._hexOppoResult._oppo ._front","width",r),l.content=s.replaceHtmlStyle(l.content,"._hexOppoResult._oppo ._front","background",c),l.content=s.replaceHtmlContent(l.content,"._hexOppoResult._oppo ._value",`${this._oppoRoll.defenderRoll.result}<span class="_small">/ ${this._oppoRoll.defenderRoll.total}</span>`)):(l.content=s.replaceHtmlStyle(l.content,"._hexOppoResult._main ._base","width",t),l.content=s.replaceHtmlStyle(l.content,"._hexOppoResult._main ._front","width",o),l.content=s.replaceHtmlStyle(l.content,"._hexOppoResult._main ._front","background",a),l.content=s.replaceHtmlContent(l.content,"._hexOppoResult._main ._value",`${this._oppoRoll.attackerRoll.result}<span class="_small">/ ${this._oppoRoll.attackerRoll.total}</span>`)),e.updateMessage(l,{content:l.content});else{let n=`<div class="_roll _oppo" data-stepid="${this._step.id}">
                                <div class="_hexCombatant _main">
                                    <div class="_img" style="background-image: url(${this._oppoRoll.attacker?.actor.img})">
                                    </div>
                                </div>
                                <div class="_hexCombatantFrame _main"></div>
                                <div class="_hexOppoInfo _main">
                                    <label class="_name">${this._oppoRoll.attacker.name}</label>
                                    <label class="_title">${this._oppoRoll.attackerRoll.title} <span class="_bold">(
                                    ${this._oppoRoll.attackerRoll.total}%)</span></label>
                                </div>
                                <div class="_hexOppoResult _main">
                                    <div class="_back"></div>
                                    <div class="_base" style="width: ${t}%;"></div>
                                    <div class="_front" style="width: ${o}%; background: ${a}"></div>
                                    <div class="_value _whiteBorderHard">${this._oppoRoll.attackerRoll.result}<span class="_small">/ ${this._oppoRoll.attackerRoll.total}</span></div>
                                </div>

                                <div class="_hexCombatant _oppo">
                                    <div class="_img" style="background-image: url(${this._oppoRoll.defender?.actor.img})">
                                    </div>                            
                                </div>
                                <div class="_hexCombatantFrame _oppo"></div>
                                <div class="_hexOppoInfo _oppo">
                                    <label class="_name">${this._oppoRoll.defender.name}</label>
                                    <label class="_title">${this._oppoRoll.defenderRoll.title} <span class="_bold">(
                                    ${this._oppoRoll.defenderRoll.total}%)</span></label>
                                </div>
                                <div class="_hexOppoResult _oppo">
                                    <div class="_back"></div>
                                    <div class="_base" style="width: ${i}%;"></div>
                                    <div class="_front" style="width: ${r}%; background: ${c}"></div>
                                    <div class="_value _whiteBorderHard">${this._oppoRoll.defenderRoll.result}<span class="_small">/ ${this._oppoRoll.defenderRoll.total}</span></div>
                                </div>

                            </div>`;s.chatMessage(n)}}messageRoll(){if(this._oppoRoll.rolling){this.oppoMessageRoll();return}let l=this._roll.rollformula?"":`<div class="_statRow" style="border-top: 1px solid var(--custo-border);">
                        <label>${game.i18n.localize("common.appliedLuck")}: </label>
                        <label class="_stat">
                            ${this._result.luckApply?game.i18n.localize("common.yes")+" ("+this._result.luckModif.lost+" pt)":game.i18n.localize("common.no")}
                        </label>
                    </div>
                    <div class="_statRow">
                        <label>${game.i18n.localize("common.avalLuck")}: </label>
                        <label class="_stat">
                            ${this._result.luckApply?this._result.luckModif.original+" -> "+this._result.luckModif.current:this._result.luckModif.current}                                    
                        </label>
                    </div>`,t=this._action?`<div class="_hexAction">
                            <div class="_img" style="background-image: url(${this._action?.img})">
                                <label class="_showItemInfo" 
                                       data-actorId="${this._actor.id}"
                                       data-tokenId="${this._actor.token?.id}"
                                       data-itemId="${this._action?.id}">
                                    ${this._action?.name}
                                </label>
                                <label>${this._actor.name}</label>
                            </div>
                        </div>`:this._skill?`<div class="_hexAction">
                            <div class="_img" style="background-image: url(${this._skill?.img})">
                                <label class="_showItemInfo" 
                                    data-actorId="${this._actor.id}"
                                    data-tokenId="${this._actor.token?.id}"
                                    data-itemId="${this._skill?.id}">
                                    ${this._skill?.name}
                                </label>
                                <label>${this._actor.name}</label>
                            </div>
                        </div>`:this._spell?`<div class="_hexAction">
                            <div class="_img" style="background-image: url(${this._spell?.img})">
                                <label class="_showItemInfo" 
                                    data-actorId="${this._actor.id}"
                                    data-tokenId="${this._actor.token?.id}"
                                    data-itemId="${this._spell?.id}">
                                    ${this._spell?.name}
                                </label>
                            </div>
                        </div>`:"",e=this._spell?this._spell.system.type.vis?`<div class="_statRow _mod2">
                                <label>${game.i18n.localize("characteristics.conc")}</label>
                                <label class="_stat">- ${this._spellProperties.conc}</label>
                            </div>`:`<div class="_statRow _mod2">
                                <label>${game.i18n.localize("characteristics.faith")}</label>
                                <label class="_stat">- ${this._spellProperties.faith}</label>
                            </div>`:"";"study"===this._target&&(t="teach"===this._subtarget?`<div class="_hexAction">
                                <div class="_img" style="background: none!important">
                                    <label class="_showItemInfo">${game.i18n.localize("common.teachingSpell")}</label>
                                </div>
                            </div>`:"memory"===this._subtarget?`<div class="_hexAction">
                                <div class="_img" style="background: none!important">
                                    <label class="_showItemInfo">${game.i18n.localize("common.memorySpell")}</label>
                                </div>
                            </div>`:"");let o=`<div class="_roll"> 
                        <div class="_hexCombatant">
                            <div class="_img" style="background-image: url(${this._actor.img})">
                            </div>
                        </div>
                        <div class="_hexCombatantFrame"></div>
                        ${t}
                        <div class="_hexRoll">
                            <div class="_contentRoll">
                                <div class="_rollStats">
                                    <div class="_statRow" style="padding-left: 20%;">
                                        <label>${this._roll.title}</label>
                                        <label class="_stat">${this._roll.base} %</label>
                                    </div>
                                    <div class="_statRow" style="padding-left: 13%;">
                                        <label>${game.i18n.localize("common.modifier")}</label>
                                        <label class="_stat">${this._roll.totalmod} %</label>                                        
                                    </div>                                                                      
                                </div>
                            </div>
                        </div>
                        <div class="_hexExtra">
                            ${e}
                            <div class="_statRow _rollLevel"
                                 style="color: ${this._result.rollLevel?.color}">
                                <label>${game.i18n.localize("common.modLevel")}</label>
                                <label class="_stat">${this._result.rollLevel?.label}</label>                                        
                            </div>                         
                            <div class="_statRow _rolls">
                                <label class="_rollResult"><span class="_big _whiteBorderHard">
                                    ${this._result.nResult}</span> / ${this._result.max}
                                </label>
                                <label class="_rollResultText ${this._result.resultClass}">
                                    ${game.i18n.localize("roll."+this._result.resultClass)}
                                </label>
                            </div>
                            ${this._result.luckApply?l:""}
                        </div>
                        </div>`;this._message=s.chatMessage(o)}updateRoll(){let l=this._step?.targetId&&""!==this._step.targetId?game.combat.combatants.get(this._step.targetId)?.actor:null,t={},s={};if(this._result.luckApply&&(t["system.secondaries.luck.value"]=this._result.luckModif.current),"oppo"!==this._fluxId&&(this._action&&this._result.result.success&&(""!==this._action.system.modes.attacker||""!==this._action.system.modes.exitAttacker)&&(t["system.modes"]=this._actor.system.modes,""===this._action.system.modes.attacker||t["system.modes"].find(l=>l===this._action.system.modes.attacker)||t["system.modes"].push(this._action.system.modes.attacker),""!==this._action.system.modes.exitAttacker&&(t["system.modes"]=t["system.modes"].filter(l=>l!==this._action.system.modes.exitAttacker))),this._action&&this._result.result.success&&l&&(""!==this._action.system.modes.target||""!==this._action.system.modes.exitTarget)&&(s["system.modes"]=l.system.modes,""===this._action.system.modes.target||s["system.modes"].find(l=>l===this._action.system.modes.target)||s["system.modes"].push(this._action.system.modes.target),""!==this._action.system.modes.exitTarget&&(s["system.modes"]=s["system.modes"].filter(l=>l!==this._action.system.modes.exitTarget)))),"study"===this._target){this.updateStudy();return}if("spell"===this._target){this.updateSpells();return}let a=Object.keys(t).length,i=Object.keys(s).length;a&&e.updateActor(this._actor,t),i&&e.updateActor(l,s),o.updateRollEncounter(this)}async updateStudy(){if("study"===this._target){if(this._result.result.success){if(this._ordoLevel&&Number(this._ordoLevel)>0){i.ordoLevel(this._actor,this._ordoLevel);await e.updateActor(this._actor,{"system.magic.study":{...this._actor.system.magic.study,learning:!1,spellId:"",read:!1,channeled:!1,learned:!1,teached:!1,memorized:!1,learnedDays:0,learnedMonths:0,teachPercent:0},["system.magic.ordos.o"+this._ordoLevel]:!0})}else{let l=this._actor.items.get(this._actor.system.magic.study.spellId);if(!l||(await e.updateActor(this._actor,{"system.magic.study":{...this._actor.system.magic.study,learning:"memory"!==this._subtarget,spellId:"memory"!==this._subtarget?this._actor.system.magic.study.spellId:"",read:!0,learned:"read"!==this._subtarget,teached:"read"!==this._subtarget&&("teach"===this._subtarget||!0),memorized:"read"!==this._subtarget&&"teach"!==this._subtarget&&("memory"===this._subtarget||!0),learnedDays:0,teachPercent:0}}),"memory"!==this._subtarget))return;await e.updateItem(l,{"system.learned":!0});return}}else{await e.updateActor(this._actor,{"system.magic.study":{...this._actor.system.magic.study,learning:!1,spellId:"",ordoId:"",read:!1,channeled:!1,learned:!1,teached:!1,memorized:!1,learnedDays:0,teachPercent:0}});return}}}async updateSpells(){"spell"===this._target&&this._spell&&(this._spell.system.type.vis&&await e.updateActor(this._actor,{"system.secondaries.conc.value":Number(this._actor.system.secondaries.conc.value)-Number(this._spellProperties.conc)}),this._spell.system.type.ordo&&await e.updateActor(this._actor,{"system.secondaries.faith.value":Number(this._actor.system.secondaries.faith.value)-Number(this._spellProperties.faith)}))}}