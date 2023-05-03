import { mainUtils } from "../mainUtils.js";
import { mainBackend } from "../sheets/backend/mainBackend.js";

export class HookTours {

    static async initTour() {
        if (game.tours.get('system.conventum')) return;

        let oTour = await new Tour(
            {
                title: "tour.Title",
                description: "tour.Description",
                canBeResumed: true,                
                display: true,
                localization: {
                    "tour.Title": game.i18n.localize("tour.Title"),
                    "tour.Description": game.i18n.localize("tour.Description"),
                    "tour.TitleInit": game.i18n.localize("tour.TitleInit"),                    
                    "tour.ContentInit": game.i18n.localize("tour.ContentInit"),
                    "tour.TitleWorld": game.i18n.localize("tour.TitleWorld"),                    
                    "tour.ContentWorld": game.i18n.localize("tour.ContentWorld"),                    
                },
                steps: [
                    {   
                        id: "initStep",
                        title: "tour.TitleInit",
                        content: "tour.ContentInit",
                        selector: ""
                    },
                    {   
                        id: "world",
                        title: "tour.TitleWorld",
                        content: "tour.ContentWorld",
                        selector: "#compendium",
                        sidebarTab: "compendium"
                    },                    
                ]
            },
            {
                id: "aquelarreTour",
                namespace: "system",
                stepIndex: -1
            }
        );
        await oTour.start();
    }


}