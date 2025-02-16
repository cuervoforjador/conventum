export class helperMessages{static async chatMessage(e){let t=await ChatMessage.create({content:e});return t.id}static async rollMessage(e,t,s){let a=`<div class="_roll"> 
                        <div class="_hexCombatant">
                            <div class="_img" style="background-image: url(${e.img})">
                            </div>
                        </div>
                        <div class="_hexCombatantFrame"></div>
                        <div class="_hexAction">
                            <div class="_img" style="background: none!important">
                                <label class="_showItemInfo">${t}</label>
                            </div>
                        </div>
                        <div class="_hexRoll">
                            <div class="_contentRoll">
                                <div class="_rollStats">
                                    ${s}                                                                      
                                </div>
                            </div>
                        </div>
                    </div>`;return helperMessages.chatMessage(a)}static addFrame(e){return e=`<div class="_frame">
                                <div class="_leftFrame"></div>
                                <div class="_rightFrame"></div>        
                                <div class="_topFrame"></div>
                                <div class="_bottomFrame"></div>
                                ${e}
                               </div>`}static findMessageByStepId(e){return Array.from(game.messages).find(t=>$(t.content).find(`[data-stepid='${e}']`).length>0)}static replaceHtmlStyle(e,t,s,a){return $(e)[0].outerHTML.replace($(e).find(t)[0].outerHTML,$(e).find(t).css(s,a)[0].outerHTML)}static replaceHtmlContent(e,t,s){return $(e)[0].outerHTML.replace($(e).find(t)[0].outerHTML,$(e).find(t).html(s)[0].outerHTML)}static addHtmlClass(e,t,s){return $(e)[0].outerHTML.replace($(e).find(t)[0].outerHTML,$(e).find(t).addClass(s)[0].outerHTML)}}