/**
 * Helpers for Armor in Human Sheet
 */

export class helperSheetArmor {

    /**
     * openArmorCloset
     * @param {*} event 
     */
    static openArmorCloset(event) {
        event.preventDefault();
        helperSheetArmor._openCloset(event, this.actor);
    }

    /**
     * closeCloset
     * @param {*} event 
     */
    static closeCloset(event) {
        event.preventDefault();
        $('.armorCloset').hide('slide');
    }

    /**
     * wearGarment
     * @param {*} actor 
     * @param {*} itemId 
     */
    static async wearGarment(actor, itemId) {
        const item = actor.items.get(itemId);

        //Droping Pieces...
        let dropPieces = [];
        for (var e in item.system.location) {
            if (item.system.location[e] &&
                item.system.location[e].apply) {
                if (actor.system.armor[e]) {
                    dropPieces.push(actor.system.armor[e].itemID);
                }
            }
        }
        dropPieces = [...new Set(dropPieces.sort())];
        for (var s in dropPieces) {
            await helperSheetArmor._dropGarment(actor, dropPieces[s]);
        }

        //Wearing Pieces...
        for (var e in item.system.location) {
            if (item.system.location[e] && item.system.location[e].apply)
                await helperSheetArmor._wearLocation(actor, e, item);
        }
    }

    /**
     * unwearGarment
     * @param {*} actor 
     * @param {*} itemId 
     */
    static async unwearGarment(actor, itemId) {
        await helperSheetArmor._dropGarment(actor, itemId);
    }

    /**
     * _openCloset
     * @param {*} event 
     * @param {*} actor 
     */
    static _openCloset(event, actor) {

        if ($(event.target).is('input')) return;

        const sLocationID = event.currentTarget?.dataset.locationid;
        const currentItem = actor.system.armor[sLocationID],
              currentItemId = currentItem ? currentItem.itemID : '',
              oApp = $(event.target).parents(".app");

        $(".armorCloset").css({"left": oApp.css("left"),
                                "top": oApp.css("top"),
                                "width": oApp.css("width"),
                                "height": oApp.css("height"),
                                "height": oApp.css("height"),
                                "background-size": oApp.css("width") + " "+
                                                   oApp.css("height")});

        $(".armorCloset").css({"transform": 'rotate(0deg)'});
        $(".armorCloset").css({"transition": '0.0s'});

        $('.armorCloset li.armorGarment').each(function(i, garment) {
            const itemId = garment.dataset.itemid;
            const item = actor.items.get(itemId);
            if (item.system.location[sLocationID] &&
                item.system.location[sLocationID].apply)
                                            $(garment).show();
                                       else $(garment).hide();

        }.bind(this));
        $('.armorCloset').show('slide', function() {
            $(".armorCloset").css({"transition": '0.9s'});
            $(".armorCloset").css({"transform": 'translate(10px, 20px) rotate(3deg)'});
        }.bind(this));
        $('.armorCloset').css({display: 'flex'});

        helperSheetArmor._showInfoGarment(currentItemId, actor, sLocationID, true);
    }

    /**
     * _showInfoGarment
     * @param {*} itemId 
     * @param {*} actor 
     * @param {*} sLocation 
     * @param {*} bBase 
     */
    static _showInfoGarment(itemId, actor, sLocation, bBase) {
        
        const oItem = actor.items.get(itemId);
        this._buildHtmlInfoGarment(sLocation, oItem, actor, bBase);
    }    

    /**
     * _buildHtmlInfoGarment
     * @param {*} sLocation 
     * @param {*} item 
     * @param {*} actor 
     * @param {*} bBase 
     */
    static async _buildHtmlInfoGarment(sLocation, item, actor, bBase) {

        const oLocation = await game.packs.get('conventum.locations').get(sLocation);

        const infoBox = $("ol.armorCloset li.infoGarment");
        $(infoBox.find("img")[0]).attr('src', (item) ? item.img 
                                                     : "/systems/conventum/image/texture/paper.png");
        infoBox.find(".armorTitle").text(oLocation.name);
        infoBox.find(".armorName").text( (item) ? item.name : game.i18n.localize("common.noArmor") );
        infoBox.find(".armorWeight").text( (item) ? item.system.weight : "");
        infoBox.find(".armorEndurance").text( (item) ? item.system.endurance : "");
        infoBox.find(".armorProtection").text( (item) ? item.system.protection : "");
        infoBox.find(".armorRequeriment").text(helperSheetArmor._infoGarment_Requirement(item, actor));
        infoBox.find(".armorPenalization").text(await helperSheetArmor._infoGarment_Penalization(item));
        infoBox.find(".armorLocation").text(await helperSheetArmor._infoGarment_Location(item));
        infoBox.find(".armorDescription").text( (item) ? item.system.description : "");

        if (bBase) {
            infoBox.find(".unwearArmor").show();
            $("ol.armorCloset").data("location", sLocation);
            $("ol.armorCloset").data("currentitem", (item) ? item._id : '');
        }
    }

    /**
     * _infoGarment_Requirement
     * @param {*} item 
     * @param {*} actor
     * @returns 
     */
    static _infoGarment_Requirement(item, actor) {

        if (!item) return "";
        let sReturn = "";

        if (item.system.requeriment.apply) {
            sReturn =  game.i18n.localize('characteristic.'+item.system.requeriment.characteristic) +
                                                    ' >= ' +item.system.requeriment.minValue;
            sReturn += '     [ ' + 
                          actor.system.characteristics.primary[item.system.requeriment.characteristic].value +
                           ' ]';
        }

        return sReturn;
    }

    /**
     * _infoGarment_Penalization
     * @param {*} item 
     * @returns 
     */
    static async _infoGarment_Penalization(item) {

        if (!item) return "";
        let sReturn = "";
        for (var e in item.system.penalty) {
            if (item.system.penalty.initiative !== '') 
                    sReturn += game.i18n.localize('common.initiative') + ': ' 
                                                            + item.system.penalty.initiative + ', ';
            if (item.system.penalty.movement !== '') 
                    sReturn += game.i18n.localize('common.movement') + ': ' 
                                                            + item.system.penalty.movement + ', ';
            for (var s in item.system.penalty.skills) {
                if (item.system.penalty.skills[s] !== '') {
                    const oSkill = await game.packs.get('conventum.skills').get(s);
                    sReturn += (oSkill) ? oSkill.name + ': ' 
                                              + item.system.penalty.skills[s] + ', ' : '';
                }
                    
            }
        }
        return sReturn.substring(0, sReturn.length - 2);        
    }

    /**
     * _infoGarment_Location
     * @param {*} item 
     * @returns 
     */
    static async _infoGarment_Location(item) {

        if (!item) return "";
        let sReturn = "";
        for (var e in item.system.location) {
            if (item.system.location[e] &&
                item.system.location[e].apply) {
                const oLocation = await game.packs.get('conventum.locations').get(e);
                sReturn += oLocation.name + ', ';
            }
        }    
        return sReturn.substring(0, sReturn.length - 2);        
    }

    /**
     * _dropGarment
     * @param {*} actor 
     * @param {*} itemId 
     * @returns 
     */
    static async _dropGarment(actor, itemId) {
        const item = actor.items.get(itemId);
        if (!item) return;
        for (var e in item.system.location) {
            if ( item.system.location[e] && 
                 item.system.location[e].apply &&
                 actor.system.armor[e])
                    await this._dropLocation(actor, e);
        }
    }

    /**
     * _dropLocation
     * @param {*} actor 
     * @param {*} sLocation 
     */
    static async _dropLocation(actor, sLocation) {
        let armorData = {};
        armorData[sLocation] = {
            initial: 0,
            itemID: "",
            protection: 0,
            endurance: 0,
            total: 0,
            name: "",
            img: "",
            hasImage: false,
            value: 0
        }
        await actor.update({
            system: { armor: armorData }
        });        
    }

    /**
     * _wearLocation
     * @param {*} actor 
     * @param {*} sLocation 
     * @param {*} item 
     */
    static async _wearLocation(actor, sLocation, item) {
        let armorData = {};
        armorData[sLocation] = {
            initial: 0,
            itemID: item._id,
            protection: item.system.protection,
            endurance: item.system.endurance,
            total: Number(item.system.endurance),
            name: item.name,
            img: item.img,
            hasImage: true,
            value: Number(item.system.enduranceCurrent)
        }
        await actor.update({
            system: { armor: armorData }
        });
  

    }    

    /**
     * _getActorLocation
     * @param {*} systemData 
     * @param {*} sLocation 
     * @returns 
     */
    static _getActorLocation(systemData, sLocation) {
        sLocation.split(".").forEach(e => {
            systemData = systemData[e];
        });
        return systemData;
     } 


}