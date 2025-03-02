import{helperBackend}from"./helperBackend.js";export class helperUtils{static getChar(t,e){try{if(void 0!==t.characteristics[e])return Number(t.characteristics[e].value)+Number(this.checkMod(t.characteristics[e].mod));if(void 0!==t.secondaries[e])return Number(t.secondaries[e].value)+Number(this.checkMod(t.secondaries[e].mod));if(void 0!==t.attributes[e])return Number(t.attributes[e].value)+Number(this.checkMod(t.attributes[e].mod))}catch(s){return 0}}static getCharComplete(t,e){try{if(void 0!==t.characteristics[e])return t.characteristics[e];if(void 0!==t.secondaries[e])return t.secondaries[e];if(void 0!==t.attributes[e])return t.attributes[e]}catch(s){return null}}static getActorFromSheetId(t){return t.split("-Token-").length>1?Array.from(game.scenes.active.tokens).find(e=>e.getActor()?.sheet.id===t).getActor():Array.from(game.actors).find(e=>e.sheet.id===t)}static allActors(){let t=[];return Array.from(game.scenes.active.tokens).filter(t=>t.actor?.isToken).forEach(e=>{t.push(e.getActor())}),[...Array.from(game.actors),...t].sort(helperUtils.byName)}static getActor(t,e){return e&&""!==e&&"undefined"!==e?game.scenes.active.tokens.get(e).actor:game.actors.get(t)}static getRules(){return game.settings.get(game.system.id,"rules")}static getCoin(){return game.settings.get(game.system.id,"loreCoin")}static checkMod(t){try{if(isNaN(Number(t)))return"+0";return Number(t)>=0?"+"+Number(t).toString():"-"+Math.abs(t).toString()}catch(e){return"+0"}}static checkDiceMod(sValue){let sValue0=sValue.toUpperCase().replaceAll("D","*");try{if(isNaN(Number(eval(sValue0))))return"+0";return helperUtils.checkMod(sValue)}catch(e){return"+0"}}static sumMods(t){let e=0;try{t.map(t=>{e+=Number(t)})}catch(s){return"+0"}return this.checkMod(e)}static checkMult(t){try{if(isNaN(Number(t))||0===Number(t))return 1;return Number(t)}catch(e){return 1}}static calcValueTotal(t){if(!t)return 0;try{let e=Number(t.value);return t.modBase&&(e+=Number(helperUtils.checkMod(t.modBase))),t.mod&&(e+=Number(helperUtils.checkMod(t.mod))),t.mult&&(e*=Number(helperUtils.checkMult(t.mult))),Math.ceil(e)}catch(s){return 0}}static calcAlphaValueTotal(t){if(!t)return"";try{let e=t.value?t.value:t.base;if(!e)return"";return 0!==Number(helperUtils.checkMod(t.mod))&&(e=e+" "+t.mod),1!==Number(helperUtils.checkMult(t.mult))&&(e="("+e+")*"+t.mult.toString()),e}catch(s){return""}}static calcValueFinal(t){let e=0;try{for(var s in e=Number(t.base),t.mods)e+=Number(t.mods[s]);e+=Number(t.custoMod)}catch(l){return 0}return isNaN(e)?0:e}static lookForSkill(t){let e="";return t=t.toLowerCase(),["#wpskill","#wpskill2","#skill_"].map(s=>{let l=this.exprCutting(t.substr(this.exprLocations(s,t)[0]));"#wpskill"===l.split("_")[0]&&(e="wpskill"),"#wpskill2"===l.split("_")[0]&&(e="wpskill2"),"#skill"===l.split("_")[0]&&(e=l.split("_")[1])}),e}static evalExpression(t,e=!1,s,l){e=!!e&&e;let r=["#wpskill","#wpskill2","#wpsize","#wpsize2","#skill_","#char_"];t=t.toLowerCase();let i="";for(var a of r){let c=this.exprLocations(a,t);if(0===c.length)continue;let n=this.exprCutting(t.substr(this.exprLocations(a,t)[0]));t=e?helperUtils.replaceTagTitle(t,n,s,l):helperUtils.replaceTagExpression(t,n,s,l)}try{i=e?t:Math.ceil(helperUtils.eval(t))}catch(o){i=""}return i}static exprLocations(t,e){for(var s=[],l=-1;(l=e.indexOf(t,l+1))>=0;)s.push(l);return s}static exprCutting(t){return t.split(" ")[0].split("+")[0].split("-")[0].split("*")[0].split("/")[0].split("(")[0].split(")")[0].split("[")[0].split("]")[0].split("{")[0].split("}")[0]}static eval(sExpression){let rExpression=sExpression.replaceAll("%","");rExpression=(rExpression=rExpression.replaceAll("[","(")).replaceAll("]",")");try{return eval(rExpression)}catch(e){return""}}static replaceTagExpression(t,e,s,l){let r="0",i=null;try{switch(e.split("_")[0]){case"#wpskill":r=helperUtils.calcValueTotal(s.system.skills[l?.system.skillkey]);break;case"#wpsize":r=CONFIG.ExtendConfig.weapons.weaponSizes[(l=""!==s.system.control.combat.weapon.main?s.items.get(s.system.control.combat.weapon.main):null)?.system.size]?.mult;break;case"#wpskill2":i=""!==s.system.control.combat.weapon.second?s.items.get(s.system.control.combat.weapon.second):null,r=helperUtils.calcValueTotal(s.system.skills[i?.system.skillkey]);break;case"#wpsize2":r=CONFIG.ExtendConfig.weapons.weaponSizes[(i=""!==s.system.control.combat.weapon.second?s.items.get(s.system.control.combat.weapon.second):null)?.system.size]?.mult;break;case"#skill":let a=e.split("_")[1];r=helperUtils.calcValueTotal(s.system.skills[a]);break;case"#char":let c=e.split("_")[1];r=helperUtils.getChar(s.system,c)}}catch(n){r=""}return r=r||"",t.replaceAll(e,r.toString())}static replaceTagTitle(t,e,s,l){let r="",i=null;try{switch(e.split("_")[0]){case"#wpskill":r=s.items.find(t=>"skill"===t.type&&t.system.control.key===l?.system.skillkey)?.name;break;case"#wpsize":l=""!==s.system.control.combat.weapon.main?s.items.get(s.system.control.combat.weapon.main):null,r="x"+CONFIG.ExtendConfig.weapons.weaponSizes[l?.system.size]?.mult;break;case"#wpskill2":i=""!==s.system.control.combat.weapon.second?s.items.get(s.system.control.combat.weapon.second):null;r=s.items.find(t=>"skill"===t.type&&t.system.control.key===i?.system.skillkey)?.name;break;case"#wpsize2":i=""!==s.system.control.combat.weapon.second?s.items.get(s.system.control.combat.weapon.second):null,r="x"+CONFIG.ExtendConfig.weapons.weaponSizes[i?.system.size]?.mult;break;case"#skill":let a=e.split("_")[1],c=s.items.find(t=>"skill"===t.type&&t.system.control.key===a);r=c?.name;break;case"#char":let n=e.split("_")[1];r=game.i18n.localize("characteristics."+n)}}catch(o){r=""}return r=r||"",t.replaceAll(e,r.toString())}static evalMaxExpression(sExpression){let s2=sExpression.toUpperCase().replaceAll("D","*1*");try{let nR;return Number(eval(s2)).toString()}catch(e){return sExpression}}static assetsPath(){return"/systems/"+game.system.id+"/assets"}static dialog(t,e,s="_info"){let l=new Dialog({title:t,content:e,buttons:{}});l.options.classes=["dialog",s],l.render(!0)}static byName(t,e){let s=t.hasOwnProperty("name")?"name":t.hasOwnProperty("label")?"label":null;if(s)return t&&e&&t[s]&&e[s]?l(t[s].toUpperCase())<l(e[s].toUpperCase())?-1:l(t[s].toUpperCase())>l(e[s].toUpperCase())?1:0:0;return t&&e?l(t.toUpperCase())<l(e.toUpperCase())?-1:l(t.toUpperCase())>l(e.toUpperCase())?1:0:0;function l(t){return t.replaceAll("\xc1","A").replaceAll("\xc9","E").replaceAll("\xcd","I").replaceAll("\xd3","O").replaceAll("\xda","U")}}static byLevel(t,e){return t.level<e.level?-1:t.level>e.level?1:0}static byIndex(t,e){return t.index<e.index?-1:t.index>e.index?1:0}static byInitiative(t,e){return e.initiative-t.initiative}static generateID(){return Math.random().toString(20).substring(2,18)}static capitalize(t){return t[0].toUpperCase()+t.slice(1)}static clearTags(t){let e="";return t.split(">").map(t=>{e+=t.split("<")[0]}),e}static isActorPathProperty(t){let e=t.replaceAll("system.",""),s=game.template.Actor.templates.base;try{if(e.split(".").map(t=>{s=s[t]}),!s||void 0===s)return!1;return!0}catch(l){return!1}}static getActorProperty(t,e){let s=t.split("system").length>1?e:e.system;try{if(t.split(".").map(t=>{s=s[t]}),!s||void 0===s)return;return s}catch(l){return}}static getTitleFromPath(t,e){let s=t.replaceAll(".value","").replaceAll(".mod","").replaceAll(".min","").replaceAll(".max","").replaceAll("system.","");try{if("characteristics"===s.split(".")[0]||"secondaries"===s.split(".")[0])return game.i18n.localize("characteristics."+s.split(".")[1]);if("attributes"===s.split(".")[0])return game.i18n.localize("attributes."+s.split(".")[1]);if("skills"===s.split(".")[0])return e.items.find(t=>"skill"===t.type&&t.system.control.key===s.split(".")[1])?.name;if("money"===s.split(".")[0])return game.i18n.localize("common.money")}catch(l){return""}}static _number(t){try{if(!t||""===t)return 0;return Number(t)}catch(e){return 0}}}