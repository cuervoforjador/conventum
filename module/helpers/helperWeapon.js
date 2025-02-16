import{helperUtils as e}from"./helperUtils.js";import{helperSocket as s}from"./helperSocket.js";export class helperWeapon{static dialogSelectWeapon(s,l){if(l=!!l&&l,!s)return;let a=`<formHeader>
                            ${game.i18n.localize("common.selectWeapon")}
                            <button class="_openCompendium" data-pack="weapons">${game.i18n.localize("common.openCompendium")}</button>
                       </formHeader>`,i=Array.from(s.items).filter(e=>"weapon"===e.type);i.sort(e.byName);let o=s.system.control.combat.weapon.main&&""!==s.system.control.combat.weapon.main?s.items.get(s.system.control.combat.weapon.main):null,t=s.system.control.combat.weapon.second&&""!==s.system.control.combat.weapon.second?s.items.get(s.system.control.combat.weapon.second):null,n=e.getChar(s.system,"str"),m=this.weaponInfo(o,s,!1),c=this.weaponInfo(t,s,!0);a+=`<div class="_weaponDiagram">
                        <div class="_weaponDiagramWrap">${t?`<div class="_2weapons">
                                <div class="_division"></div>
                                <div class="_1Half">
                                    <div class="_mainWeapon">
                                        <div class="_backImg" style="background-image: url(${o?.img})"></div>
                                        <div class="_title">${o?o?.name:""}</div>
                                        <div class="_damage">${o?m.damage:""}</div>
                                        <div class="_damage">${o?m.sSkill:""} ${o?m.pSkill:""}%</div>
                                    </div>
                                </div>
                                <div class="_2Half">
                                    <div class="_secondWeapon">
                                        <div class="_backImg" style="background-image: url(${t?.img})"></div>
                                        <div class="_title">${t?t?.name:""}</div>
                                        <div class="_damage">${t?c.damage:""}</div>
                                        <div class="_damage">${t?c.sSkill:""} ${t?c.pSkill:""}%</div>
                                    </div>                                
                                </div>
                             </div>`:`<div class="_mainWeapon">
                                <div class="_backImg" style="background-image: url(${o?.img})"></div>
                                <div class="_title">${o?o?.name:""}</div>
                                <div class="_damage">${o?m.damage:""}</div>
                                <div class="_damage">${o?m.sSkill:""} ${o?m.pSkill+"%":""}</div>
                            </div>`}</div>
                    </div>`,i.sort(e.byName);let d='<formItems class="_weapons">';i.map(l=>{let a=s.items.find(e=>"skill"===e.type&&e.system.control.key===l.system.skillkey),i=a?a.name:game.i18n.localize("common.noSkill")+": "+l.system.skillkey,m=game.i18n.localize(CONFIG.ExtendConfig.weapons.weaponSizes[l.system.size]?.label),c=l.id===o?.id?"_mainHand":l.id===t?.id?"_secondHand":"",r=l.id===o?.id||l.id===t?.id,b=n<=Number(l.system.strMin),p=!1,y="";for(var f in l.system.weaponLevels)l.system.weaponLevels[f].check&&(y=""===y?game.i18n.localize(CONFIG.ExtendConfig.weaponLevels[f].label):y+",  "+game.i18n.localize(CONFIG.ExtendConfig.weaponLevels[f].label),s.system.weaponLevels[f]&&s.system.weaponLevels[f].check&&(p=!0));p||(c+=" _dame");let v="";("+0"!==l.system.skillMod||"+0"!==l.system.skillModDefense)&&(v+=`<formField class="_100">
                                <label>${game.i18n.localize("common.skillModAttack")}</label>
                                <label class="_field">${l.system.skillMod}%</label>     
                                <label>${game.i18n.localize("common.skillModDefense")}</label>
                                <label class="_field">${l.system.skillModDefense}%</label>                                               
                          </formField>`),""!==l.system.initiative.first&&"+0"!==l.system.initiative.first&&(v+=`<formField class="_100">
                                <label>${game.i18n.localize("common.modInitiative")}</label>
                                <label class="_field">${e.checkMod(l.system.initiative.first)} / ${e.checkMod(l.system.initiative.after)}</label>                
                          </formField>`),d+=`<formItem data-id="${l.id}" class="${c}">
                            <div class="_itemImg" style="background-image: url(${l.img})"></div>
                            <div class="_itemContent">
                                <label class="_title _100">${l.name}</label>
                                <div class="_detail">
                                    <formField class="_100">
                                        <label>${game.i18n.localize("common.weaponLevel")}: </label>
                                        <label style="font-weight: 900">${y}</label>
                                    </formField>                                
                                    <formField class="_100">
                                        <label>${game.i18n.localize("common.skill")}</label>
                                        <label class="_field">${i}</label>
                                    </formField>
                                    <formField class="_100">
                                        <label>${game.i18n.localize("common.damage")}</label>
                                        <label class="_field">${l.system.damage.base}</label>
                                        <label>${game.i18n.localize("common.size")}</label>
                                        <label class="_field">${m}</label>
                                    </formField>
                                    <formField class="${b?"_strMin":"_100"}">
                                        <label>${game.i18n.localize("common.minStr")}</label>
                                        <label class="_field">${l.system.strMin}</label>
                                        <label> / ${game.i18n.localize("common.curStr")}</label>
                                        <label class="_field">${n}</label>
                                    </formField>
                                    ${v}
                                    ${l.system.rangearm||l.system.firearm?`<formField class="_100">
                                            <label class="_main">${game.i18n.localize("common.range")}</label>
                                            <label>${game.i18n.localize("common.short")}</label>
                                            <label class="_field">${l.system.range.short}</label>
                                            <label>${game.i18n.localize("common.middle")}</label>
                                            <label class="_field">${l.system.range.middle}</label>
                                            <label>${game.i18n.localize("common.large")}</label>
                                            <label class="_field">${l.system.range.large}</label>
                                            <label>${game.i18n.localize("common.recharge")}</label>
                                            <label class="_field">${l.system.recharge}</label>                              
                                        </formField>`:""}                                    
                                    <div class="_properties">
                                        ${this._iuProperties([{visible:l.system.twoHands,i18n:"common.twoHands"},{visible:l.system.rangearm,i18n:"common.wRangearm"},{visible:l.system.firearm,i18n:"common.wFirearm"},{visible:l.system.throwarm,i18n:"common.wThrowarm"},{visible:l.system.shield,i18n:"common.shield"},{visible:l.system.secondary,i18n:"common.wSecondary"},{visible:l.system.damage.bono,i18n:"common.useDamageBono"},{visible:l.system.damage.impale,i18n:"common.impale"},{visible:l.system.damage.noArmor,i18n:"common.noArmor"}])}
                                    </div>
                                </div>
                            </div>
                            <div class="_itemButtons">
                                ${r?this._iuButton(l.id,"disarmWeapon","","deactivate","common.disarm"):""}                            
                                ${l.system.twoHands||l.system.shield?"":this._iuButton(l.id,"selectWeapon","firstHand","firstHand","common.setFirstHand")}
                                ${l.system.twoHands?this._iuButton(l.id,"selectWeapon","bothHands","firstHand","common.setBothHands"):""}
                                ${l.system.twoHands||l.system.shield?"":this._iuButton(l.id,"selectWeapon","secondHand","secondHand","common.setSecondHand")}
                                ${l.system.shield?this._iuButton(l.id,"selectWeapon","shield","shield","common.setShield"):""}   
                                ${this._iuButton(l.id,"deleteWeapon","","delete","common.delete")}
                            </div>      
                        </formItem>`}),d+="</formItems>";let r=new Dialog({title:game.i18n.localize("common.selectWeapon"),content:"<formDialog>"+a+d+"</formDialog>",buttons:{select:{label:game.i18n.localize("common.select"),async callback(e,s){}}}});r.options.classes=["dialog","dialogWeapon","_formDialog","_formBig","_noButtons"],r.actor=s,r.refreshAllSheets=l,r.render(!0,{top:"5%",left:"5%"})}static _iuProperties(e){let s="";return e.map(e=>{s+=e.visible?'<span class="_prop">'+game.i18n.localize(e.i18n)+"</span>":""}),s}static _iuButton(e,s,l,a,i){return`<a class="_frameButton"
                   data-action="${s}"
                   data-prop="${l}"
                   data-id="${e}">
                   <button>
                        <img src="/systems/${game.system.id}/assets/icons/${a}.svg" />
                        <label>${game.i18n.localize(i)}</label>
                   </button>                                    
                </a>`}static handler(e,s,l){$(s).find("a._frameButton").click(helperWeapon.onClickButton.bind(e))}static onClickButton(e){e.preventDefault();let s=$(e.delegateTarget).data("action"),l=$(e.delegateTarget).data("prop"),a=$(e.delegateTarget).data("id");switch(s){case"selectWeapon":helperWeapon.onSelectWeapon(a,l,this);break;case"deleteWeapon":helperWeapon.onDeleteWeapon(a,this);break;case"disarmWeapon":helperWeapon.onDisarmWeapon(a,this)}}static async onSelectWeapon(e,l,a){if(!a.actor)return;let i=a.actor.system.control.combat.weapon,o=a.actor.items.get(e);if(!o)return;let t=i.main&&""!==i.main?a.actor.items.get(i.main):null;switch(i.second&&""!==i.second&&a.actor.items.get(i.second),l){case"firstHand":i.main=e,i.second=i.second===e?"":i.second;break;case"secondHand":i.main=i.main===e?"":i.main,i.second=e,t?.system.twoHands&&(i.main="");break;case"shield":if(!o.system.shield)return;i.main=i.main===e?"":i.main,i.second=e,t?.system.twoHands&&(i.main="");break;case"bothHands":if(!o.system.twoHands)return;i.main=e,i.second=""}i.second===i.main&&(i.second=""),a.actor.items.get(i.main)||(i.main=""),a.actor.items.get(i.second)||(i.second=""),await a.actor.update({"system.control.combat.weapon":i}),a.close(),a.refreshAllSheets&&s.refreshAllSheets()}static onDeleteWeapon(e,l){l.actor&&(l.actor.items.get(e).delete(),l.close(),l.refreshAllSheets&&s.refreshAllSheets())}static async onDisarmWeapon(e,l){if(!l.actor)return;let a=l.actor.system.control.combat.weapon;a.main=a.main===e?"":a.main,a.second=a.second===e?"":a.second,await l.actor.update({"system.control.combat.weapon":a}),l.close(),l.refreshAllSheets&&s.refreshAllSheets()}static weaponInfo(s,l,a){let i={weapon:s,damage:s?.system.damage.base,class:a?"_secondHand":"_mainHand",skill:l?l.items.find(e=>"skill"===e.type&&e.system.control.key===s?.system.skillkey):null,sSkill:"",pSkill:0,sSize:"",actorStr:l?e.getChar(l.system,"str"):"",penalStr:!1};return s&&l&&(i.sSkill=i?.skill?i.skill?.name:game.i18n.localize("common.noSkill")+": "+s?.system.skillkey,i.pSkill=s?.system.skillkey?e.calcValueTotal(l.system.skills[s?.system.skillkey]):0,i.sSize=game.i18n.localize(CONFIG.ExtendConfig.weapons.weaponSizes[s?.system.size]?.label),i.penalStr=i.actorStr<=Number(s?.system.strMin)),i}}