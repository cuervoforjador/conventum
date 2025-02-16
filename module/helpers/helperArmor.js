import{helperUtils as e}from"./helperUtils.js";import{helperSocket as t}from"./helperSocket.js";import{helperBackend as i}from"./helperBackend.js";export class helperArmor{static async dialogSelectArmor(t,o){if(!t)return;let a=i.configLocations(!1,t.type),s=a.find(e=>e.key===o);if(!s)return;let l=i.configArmors(),r=await i.getCompendiumSkills(!1),n=[];for(var m in t.system.skills){let c=t.system.skills[m],d=r.find(e=>e.system.control.key===m);if(!d)return;n.push({key:m,value:e.calcValueTotal(c),value2:0,name:d.name,img:d.img,char:d.system.extend.characteristic})}let p=`<formHeader>
                            <div class="_title">
                                ${game.i18n.localize("common.selectArmor")}: (${s.label})
                            </div>
                            <div class="_buttons">
                                <button class="_openCompendium" data-pack="armors">${game.i18n.localize("common.openCompendium")}</button>
                            </div>
                        </formHeader>`,y=Array.from(t.items).find(e=>"armor"===e.type&&e.system.location[s.key]?.checked&&e.system.control.inUse),u=Array.from(t.items).filter(e=>"armor"===e.type&&e.system.location[s.key]?.checked&&!e.system.control.inUse);u.sort(e.byName),y&&u.unshift(y);let f='<formItems class="_armor">';u.map(e=>{let t=y?.id===e.id?"_armored":"",i=l.armorTypes.find(t=>t.key===e.system.type),o=[];for(var a in e.system.penalization.skillsChar)e.system.penalization.skillsChar[a].checked&&n.filter(e=>e.char===a).map(t=>{t.value2=t.value+Number(e.system.penalization.skillsChar[a].mod),t.mod=e.system.penalization.skillsChar[a].mod,o.push(t)});for(var a in e.system.penalization.skills)if("+0"!==e.system.penalization.skills[a]){let s=o.find(e=>e.key===a);s||(s=n.find(e=>e.key===a)),s.value2=s.value+Number(e.system.penalization.skills[a]),s.mod=e.system.penalization.skills[a],o.find(e=>e.key===a)||o.push(s)}let r="";o.map(e=>{r=""===r?e.name+" "+e.mod+"%":r+", "+e.name+" "+e.mod+"%"}),""!==r&&(r='<div class="_penals">'+r+"</div>"),f+=`<formItem data-id="${e.id}" class="${t}">
                            <div class="_itemImg" style="background-image: url(${e.img})"></div>
                            <div class="_itemContent">
                                <label class="_title _100">${e.name}</label>
                                <div class="_detail">
                                    <formField class="_100">
                                        <label>${game.i18n.localize("common.type")}</label>
                                        <label class="_field">${i.label}</label>
                                    </formField>
                                    <formField class="_100">
                                        <label>${game.i18n.localize("common.protection")}</label>
                                        <label class="_field">${e.system.protection}</label>
                                        <label>${game.i18n.localize("common.endurance")}</label>
                                        <label class="_field">${e.system.endurance} / ${e.system.endInitial}</label>
                                    </formField> 
                                    <div class="_properties">
                                        ${r}
                                    </div>
                                </div>
                            </div>
                            <div class="_itemButtons">
                                ${y?.id!==e.id?this._iuButton(e.id,"wearArmor","","activate","common.wearArmor"):""}
                                ${y?.id===e.id?this._iuButton(e.id,"unwearArmor","","deactivate","common.unwearArmor"):""}  
                                ${this._iuButton(e.id,"editArmor","","equipment","common.edit")}                                                                                                                     
                                ${this._iuButton(e.id,"deleteArmor","","delete","common.delete")}                            
                            </div>      
                        </formItem>`}),f+="</formItems>";let h=new Dialog({title:game.i18n.localize("common.selectArmor"),content:"<formDialog>"+p+f+"</formDialog>",buttons:{select:{label:game.i18n.localize("common.select"),async callback(e,t){}}}});h.options.classes=["dialog","dialogArmor","_formDialog","_formBig","_noButtons"],h.actor=t,h.render(!0,{top:"5%",left:"5%"})}static _iuProperties(e){let t="";return e.map(e=>{t+=e.visible?'<span class="_prop">'+game.i18n.localize(e.i18n)+"</span>":""}),t}static _iuButton(e,t,i,o,a){return`<a class="_frameButton"
                   data-action="${t}"
                   data-prop="${i}"
                   data-id="${e}">
                   <button>
                        <img src="/systems/${game.system.id}/assets/icons/${o}.svg" />
                        <label>${game.i18n.localize(a)}</label>
                   </button>                                    
                </a>`}static handler(e,t,i){$(t).find("a._frameButton").click(helperArmor.onClickButton.bind(e))}static onClickButton(e){e.preventDefault();let t=$(e.delegateTarget).data("action"),i=($(e.delegateTarget).data("prop"),$(e.delegateTarget).data("id"));switch(t){case"wearArmor":helperArmor.onWearArmor(i,this);break;case"unwearArmor":helperArmor.onUnwearArmor(i,this);break;case"editArmor":helperArmor.onEditArmor(i,this);break;case"deleteArmor":helperArmor.onDeleteArmor(i,this)}}static async onWearArmor(e,t){let i=t.actor;if(!i)return;let o=i.items.get(e);if(!o)return;let a=i.items.filter(e=>"armor"===e.type),s=[];for(var l in o.system.location)isNaN(l)&&o.system.location[l].checked&&a.filter(e=>e.system.location[l].checked).map(e=>{e.id===o.id||s.find(t=>t.id===e.id)||s.push(e)});let r=[];s.map(e=>{r.push({_id:e.id,"system.control.inUse":!1})}),r.push({_id:o.id,"system.control.inUse":!0}),await i.updateEmbeddedDocuments("Item",r),t.close()}static async onUnwearArmor(e,t){let i=t.actor;if(!i)return;let o=i.items.get(e);o&&(await o.update({"system.control.inUse":!1}),t.close())}static async onEditArmor(e,t){t.actor&&(t.actor.items.get(e).sheet.render(!0),t.close())}static onDeleteArmor(e,t){t.actor&&(t.actor.items.get(e).delete(),t.close())}static getLocationByKey(e,t){if(!e)return;let o=i.configLocations(!1,e.type);return o.find(e=>e.key===t)}static getLocationByRoll(e,t){if(!e)return;let o=i.configLocations(!1,e.type);return o.find(e=>e.range.low<=t&&e.range.high>=t)}static getArmorByRoll(e,t){if(!e)return;let i=this.getLocationByRoll(e,t);if(i)return e.items.filter(e=>"armor"===e.type).find(e=>e.system.control.inUse&&e.system.location[i.key].checked)}static getArmorByKey(e,t){if(e)return e.items.filter(e=>"armor"===e.type).find(e=>e.system.control.inUse&&e.system.location[t].checked)}}