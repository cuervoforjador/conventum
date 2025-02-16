import{helperUtils as t}from"./helperUtils.js";import{helperSheets as o}from"./helperSheets.js";import{helperSocket as e}from"./helperSocket.js";export class helperAction{static dialogSelectCombatant(t){if(!game.combat)return;let o=`<formHeader>${game.i18n.localize("common.selectCombatant")}</formHeader>`,e='<formActors data-singular="true">';Array.from(game.combat.combatants).map(t=>{e+=`<formActor>
                                <img for="combatant_${t.id}"
                                    class="_portrait" src="${t.actor.img}" />
                                <input type="checkbox"
                                    id="combatant_${t.id}"
                                    name="combatant_${t.id}"
                                    combatantid="${t.id}"/>                                
                                <label for="combatant_${t.id}">${t.actor.name}</label>
                           </formActor>`}),e+="</formActors>";let a=new Dialog({title:game.i18n.localize("common.selectCombatant"),content:"<formDialog>"+o+e+"</formDialog>",buttons:{select:{label:game.i18n.localize("common.select"),async callback(o,e){let a=[];if($(o).find("formActors").find("input:checked").each(function(t,o){a.push({combatantId:$(o).attr("combatantid")})}),0===a.length)return;let i=game.combat.combatants.get(a[0].combatantId);i&&await t.update({"system.control.selection.combatant":i.id})}}}});a.options.classes=["dialog","_formDialog","_checkSelections"],a.render(!0,{top:"5%"})}static dialogSelectTarget(t,o,e){if(!game.combat)return;let a=`<formHeader>${game.i18n.localize("common.selectActionTarget")}</formHeader>`,i='<formActors data-singular="true">',c=game.combat.getCombatantByActor(t).id;Array.from(game.combat.combatants).map(t=>{t.id!==c&&(i+=`<formActor>
                                <img for="combatant_${t.id}"
                                    class="_portrait" src="${t.actor.img}" />
                                <input type="checkbox"
                                    id="combatant_${t.id}"
                                    name="combatant_${t.id}"
                                    combatantid="${t.id}"/>                                
                                <label for="combatant_${t.id}">${t.actor.name}</label>
                           </formActor>`)}),i+="</formActors>";let n=new Dialog({title:game.i18n.localize("common.selectCombatant"),content:"<formDialog>"+a+i+"</formDialog>",buttons:{select:{label:game.i18n.localize("common.select"),async callback(a,i){let c=[];if($(a).find("formActors").find("input:checked").each(function(t,o){c.push({combatantId:$(o).attr("combatantid")})}),0===c.length)return;let n=game.combat.combatants.get(c[0].combatantId);n&&e(t,o,n,null)}}}});n.options.classes=["dialog","_formDialog","_checkSelections"],n.render(!0,{top:"5%"})}static dialogSelectTargetAction(t,o,e){if(!game.combat)return;let a=game.combat.getCombatantByActor(t).id;if(!a)return;let i=game.items.find(t=>"encounter"===t.type&&t.system.combat===game.combat.id);if(!i)return;let c=i.system.steps.filter(t=>t.round===game.combat.round&&t.targetId===a&&t.combatantId!==a&&t.type.attack&&t.active),n=`<formHeader>${game.i18n.localize("common.selectTargetAction")}</formHeader>`,l='<formActors data-singular="true">';c.map(t=>{let o=game.combat.combatants.get(t.combatantId);if(!o)return;let e=o.actor.items.get(t.actionId);l+=`<formActor class="_rows">
                            <row>
                                <img for="action_${e.id}"
                                    class="_portrait" src="${o.actor.img}" />
                                <input type="checkbox"
                                    id="step_${t.id}"
                                    name="step_${t.id}"
                                    combatantid="${o.id}"
                                    actionid="${e.id}"
                                    stepid="${t.id}"/>                                
                                <label for="step_${t.id}">${o.actor.name}</label>
                            </row>
                            <row>
                                <label for="step_${t.id}" class="_title">${e.name}</label>
                            </row>
                         </formActor>`}),l+="</formActors>",0===c.length&&(l=`<info>${game.i18n.localize("info.noTargetActions")}</info>`);let r=new Dialog({title:game.i18n.localize("common.selectCombatant"),content:"<formDialog>"+n+l+"</formDialog>",buttons:{select:{label:game.i18n.localize("common.select"),async callback(a,c){let n=[];if($(a).find("formActors").find("input:checked").each(function(t,o){n.push({combatantId:$(o).attr("combatantid"),actionId:$(o).attr("actionid"),stepId:$(o).attr("stepid")})}),0===n.length)return;let l=game.combat.combatants.get(n[0].combatantId);if(!l)return;let r=l.actor.items.get(n[0].actionId),m=i.system.steps.find(t=>t.id===n[0].stepId);e(t,o,l,r,m)}}}});r.options.classes=["dialog","_formDialog","_checkSelections"],r.render(!0,{top:"5%"})}static dialogSelectAction(e){let a=`<formHeader>${game.i18n.localize("common.selectAction")}</formHeader>`,i=game.combat.combatants.get(e.system.control.selection.combatant);if(!i)return;let c=i.actor.items.filter(t=>"action"===t.type);c.sort(t.byName);let n=[""];c.forEach(t=>{t.system.control.tags.split(",").map(t=>{n.find(o=>o===t)||""===t||n.push(t)})}),n.sort(t.byName);let l='<formFolders data-singular="true">';n.map(t=>{t&&""!==t&&(l+=`<formFolder data-folder="${t}">
                            <input type="checkbox" 
                                   name="folder_${t}"
                                   id="folder_${t}"
                                   data-target="items" />
                            <label for="folder_${t}">${t}</label>
                         </formFolder>`)}),l+="</formFolders>";let r='<formItems data-singular="true">';c.map(t=>{let o="";t.system.control.tags.split(",").map(t=>{""===o?o='"'+t+'"':o+=',"'+t+'"'}),r+=`<formItem data-folder='[${o}]' style="display:none">
                            <img for="item_${t.id}"
                                 class="_portrait" src="${t.img}" />
                            <input type="checkbox"
                                   id="item_${t.id}"
                                   name="item_${t.id}"
                                   combatantid="${i.id}"
                                   itemid="${t.id}" />                                
                            <label for="item_${t.id}">${t.name}</label>
                        </formItem>`}),r+="</formItems>";let m={};0===c.length?(r="<info>"+game.i18n.localize("info.noActions")+"</info>",m.addBasics={label:game.i18n.localize("common.addBasics"),callback:async(t,o)=>{this._addActionsBasics(e)}},m.openCompendium={label:game.i18n.localize("common.openCompendium"),async callback(t,e){o.openCompendium("actions")}}):m.select={label:game.i18n.localize("common.select"),async callback(t,o){let a=[];if($(t).find("formItems").find("input:checked").each(function(t,o){a.push({itemId:$(o).attr("itemid")})}),0===a.length)return;let c=i.actor.items.find(t=>t.id===a[0].itemId);c&&await e.update({"system.control.selection.action":c.id})}};let s=new Dialog({title:game.i18n.localize("common.selectAction"),content:"<formDialog>"+a+l+'<div class="_prevItems">'+r+'<div class="_preview"></div></div></formDialog>',buttons:m});s.options.classes=["dialog","_formDialog","_formActions"],s.render(!0,{top:"5%"})}static async _addActionsBasics(t){await o.importActions(t)}}