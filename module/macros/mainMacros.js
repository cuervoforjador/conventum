
export class mainMacros {

  /**
   * registerMacros
   */
  static async registerMacros() {

    const upWeapons = (Array.from(game.macros).find(e => e.name === 'upWeapons')) ?
      Array.from(game.macros).find(e => e.name === 'upWeapons') :
      await Macro.create({
        command: "game.conventum.upWeapons();",
        name: "upWeapons",
        type: "script",
        img: "/systems/conventum/image/texture/weapons.png"
      });

    const upActions = (Array.from(game.macros).find(e => e.name === 'upActions')) ?
      Array.from(game.macros).find(e => e.name === 'upActions') :
      await Macro.create({
        command: "game.conventum.upActions();",
        name: "upActions",
        type: "script",
        img: "/systems/conventum/image/texture/actions.png"
      });

    game.user.assignHotbarMacro(upActions, 1);
    game.user.assignHotbarMacro(upWeapons, 2);
  }

  /**
   * upWeapons
   */
  static upWeapons() {
    const actor = Array.from(game.actors).find(e => 
                                              ( (e.ownership[game.userId]) 
                                              && (e.ownership[game.userId] === 3) ));
    actor.sheet._tabs[0].active = 'combat';
    actor.sheet._tabs[2].active = 'combatWeapons';
    actor.sheet.render(true);

  }

  /**
   * upActions
   */
  static upActions() {
    const actor = Array.from(game.actors).find(e => 
                                              ( (e.ownership[game.userId]) 
                                              && (e.ownership[game.userId] === 3) ));
    actor.sheet._tabs[0].active = 'combat';
    actor.sheet._tabs[2].active = 'combatActions';
    actor.sheet.render(true);

  }  

}
