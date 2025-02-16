import{helperUtils as i}from"../helpers/helperUtils.js";import{helperSocket as t}from"../helpers/helperSocket.js";export class grimoire{_actor=null;_content=null;_view=null;_dialog=null;_dialogOptions={};constructor(i){if(!i)return;try{this._actor=i._actor,this._view=$(game.canvas.app.view),this._initOptions(),this._initContent(),this._initDialog()}catch(t){ui.notifications.error(t)}}render(){this._dialog.render(!0,this._dialogOptions)}_initOptions(){this._dialogOptions={width:.96*this._view.width(),height:.96*this._view.height(),left:.02*this._view.width(),top:.02*this._view.height()}}_initContent(){this._content=`<div id="grimBook">
                            <div class="hard odd"> PORTADA </div>
                            <div class="hard"></div>
                            <div class=”hard”> Page 1 </div>
                            <div class=”hard”> Page 2 </div>
                            <div class=”hard”> Page 3 </div>
                            <div class=”hard”> Page 4 </div>
                            <div class="hard"></div>
                            <div class="hard"></div>
                        </div>`}_initDialog(){this._dialog=new Dialog({title:"",content:this._content,buttons:{},render:this._renderDialog.bind(this)}),this._dialog.options.classes=["_grimoire"]}_renderDialog(i){i&&this._initTurn(i)}_initTurn(i){i.find("#grimBook").turn({width:.9*this._dialogOptions.width,height:.98*this._dialogOptions.height,autoCenter:!0})}}