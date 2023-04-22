/**
 * Compendium Backend...
 */

export class mainBackend {

    /**
     * Compendium Backend For Kingdom Items...
     */
    static async getBackendForKingdom() {
        return {
            worlds: await game.packs.get("conventum.worlds").getDocuments()
        };
    }

}