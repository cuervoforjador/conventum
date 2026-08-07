import { SYSTEM_ID } from "../config/uiConstants.js"
import helperContext from "../helper/helperContext.js"
import helperSettings from "../helper/helperSettings.js";
import helperTools from "../helper/helperTools.js"
import helperDialog from "../helper/helperDialog.js"

export default class tutTiendas {

    /**
     * display
     * @returns 
     */
    static async display() {

        const rules = helperSettings.rules()
        const sTitle = "" //"Comercios y Tiendas"
        var sContent = ""

        const left = $(document).find('body').width() - $(document).find('body').find('#sidebar-content').width()
        const options = {
            width: 450,
            left: left - 450,
            top: 100
        }

        sContent = `<img src="systems/aquelarre/assets/img/aq/tiendas/tutorial.png" class="_portrait" />
                 <h4 style="margin-top: 10px;">Comercios y tiendas</h4>
                 <p>Crear comercios y tiendas es muy sencillo y práctico.</br>
                    A través de ellas, podrás gestionar fácilmente los productos que ofrecerás a tus personajes y
                    hacer que sean ellos quienes los adquieran y ajusten su inventario sin necesidad de hacerlo tú como master.</p>
                 <p>En este tutorial, aprenderás cómo crear y gestionar comercios y tiendas en tu mundo de Aquelarre.</p>`
        await helperDialog.dialogDescription2(sContent, sTitle, rules, {top: 20, width: 450})

        ui.sidebar.expand();
        ui.sidebar.activateTab("items");
        const newFolder = await Folder.create({
            name: "El Yunque",
            type: "Item",
            folder: null
        });
        await ui.items.render(true);

        const folderElement = $(ui.items.element).find(`li.folder[data-folder-id="${newFolder.id}"]`);
        if (folderElement.length === 0) return;
        const headerFolderElement = folderElement.children(".folder-header");
        headerFolderElement[0].click(); 
        await ui.items.render(true);
        $(`li.folder[data-folder-id="${newFolder.id}"]`).addClass('_borderBlink');

        sContent = `<h4>Carpeta con Productos</h4>
                 <p>Lo primero que debes hacer es crear una carpeta en la sección de Items donde añadirás todos los productos que quieras ofrecer a tus jugadores.</p>
                 <p>En este ejemplo, te he creado una carpeta que se llama <span class="_bold">"El Yunque".</span>
                    <span class="_italic">Típica armería de callejón perfecta para equiparse.</span></p>
                 <p>Pulsa continuar para avanzar al siguiente paso.</p>`
        await helperDialog.dialogDescription2(sContent, sTitle, rules, options, '_borderBlink')

        ui.sidebar.expand();
        ui.sidebar.activateTab("compendium");        
        const pack = game.packs.get("aquelarre."+rules+"_pack");
        await pack.render(true);        

        sContent = `<h4>Busca tus productos</h4>
                 <p>Cada item será un "tipo de producto". Pueden ser únicos, limitados, tener N unidades disponibles o ser inagotables (infinitos)...</p>
                 <p>Puedes añadir items desde los compendios y modificarlos a tu gusto, o crearlos tu mismo e incluirlos en la carpeta, pero por ahora, no añadas nada... Yo lo añadiré por tí.</p>
                 <p>Pulsa continuar para que pueda copiar varios items en tu carpeta.</p>`
        await helperDialog.dialogDescription2(sContent, sTitle, rules, options, '_borderBlink')
        
        pack.apps.forEach(app => app.close());
        const mDocs = (await pack.getDocuments()).filter(e => e.type === 'item' || e.type === 'arma')
        const mItems = ['Aljaba', 'Esmeril', 'Pretina (Daga)', 'Pretina (Espada)', 'Espada de mano', 'Alfanje', 'Escudo de metal'];
        
        let mNewItems = []
        for (let s of mItems) {
            const item = mDocs.find(e => e.name === s);
            if (!item) continue;
            mNewItems.push({
                name: item.name,
                type: item.type,
                img: item.img,
                system: item.system,
                folder: newFolder.id
            })
        }
        await Item.createDocuments(mNewItems);
        
        //Navegando hacia el nuevo folder de la Tienda
        ui.sidebar.expand();
        ui.sidebar.activateTab("items");
        await ui.items.render(true);        
        $(`li.folder[data-folder-id="${newFolder.id}"]`).addClass('_borderBlink');

        sContent = `<h4>Mezcla Productos</h4>
                 <p>He añadido varios items de Equipo como la Aljaba, el Esmeril, Pretinas para dagas y espadas, etc... además he incorporado dos tipos de armas, una Espada de Mano y un Alfanje y por último, un Escudo de metal, que nunca puede faltar.</p>                
                 <p>Ahora bien, cada item añadido, es en realidad un "tipo de producto". Como te he dicho antes, pueden ser limitados o inagotables...</br>
                    Además puedes añadir muchos otros objetos de otro tipo que no sea Equipo. <span class="_bold">Armas, Armaduras, Hechizos, Ensalmos... incluso Rasgos.</span> <span class="_italic">
                    (Sí, has leido bien: Rasgos. Imagina un campo de entrenamiento en el que puedes comprar rasgos... o vergüenzas. Un lugar en el que puedes adquirir dotes como ser ambidiestro, adiestramiento para el combate, don de lenguas, etc...)</span></p>
                    <p>Ahora que he añadido los items, a la carpeta, Pulsa Continuar.</p>`
        await helperDialog.dialogDescription2(sContent, sTitle, rules, options, '_borderBlink');
        
        
        //headerFolderElement[0].click();
        const mTienda = await Item.createDocuments([{
            name: newFolder.name,
            type: "tienda",
            img: "systems/aquelarre/assets/img/aq/tiendas/armeria.png",
            system: {
                folder: newFolder.id,
            }
        }]);
        const tienda = mTienda[0];
        await ui.items.render(true);
        $(`li.folder[data-folder-id="${newFolder.id}"] header`)[0].click(); 
        $(`li.item[data-entry-id="${tienda.id}"]`).addClass('_borderBlink');

        sContent = `<h4>Crea tu comercio</h4>
                 <p>Ahora que ya tienes decidido que productos vender, lo siguiente será crear tu comercio.</br>
                    No te preocupes si mas tarde quieres añadir o quitar objetos de tu carpeta. Cualquier cambio que hagas a posterior, podrás sincronizarlo automáticamente en tu tienda.</br> 
                    Para crear tu Armería, crea un nuevo Item de tipo <span class="_bold">Comercio</span>.</br>
                    El nombre de este Item será el que les aparezca a los jugadores.
                 </p>
                 <p>Pulsa sobre Continuar para que yo pueda hacer esto por ti.</p>`        
        await helperDialog.dialogDescription2(sContent, sTitle, rules, options, '_borderBlink');

        await tienda.sheet.render(true);
        tienda.sheet.setPosition({ left: left - 430, top: 60, width: 730 });
        $(`form#sheetTienda-Item-${tienda.id} select[name="system.folder"]`).addClass('_borderBlink');

        sContent = `<h4>Configurando la Tienda</h4>
                 <p>Una tienda tiene asociada una carpeta en la que se encuentran los objetos que serán sus productos. En este caso, he seleccionado la carpeta de <span class="_bold">El Yunque</span></p>                 
                 <p>Dos o mas tiendas distintas pueden apuntar a la misma carpeta... pero cuidado, si existen objetos limitados, éstos pueden desaparecer.</p>
                 <p>Aunque los cambios aplican de forma automática, cada vez que hagas cambios en tu Tienda, es recomendable que pulses sobre el botón <span class="_bold">Actualizar Fichas (Jugadores)</span>.</br>
                    Esto hace que si alguno de tus jugadores está consultando la tienda justo en ese momento, fuerce el refresco de su ficha para que vea los cambios.</p>
                 <p>Pulsa Continuar para pasar al siguiente paso.</p>`        
        await helperDialog.dialogDescription2(sContent, sTitle, rules, {
            left: left - 900, top: 20, width: 450
        }, '_borderBlink');  

        $(`form#sheetTienda-Item-${tienda.id} select[name="system.folder"]`).removeClass('_borderBlink');
        $(`form#sheetTienda-Item-${tienda.id} a[data-tab="actors"]`).addClass('_borderBlink');
        sContent = `<h4>Acceso a la Tienda</h4>
                 <p>En la pestaña de Personajes verás todos los personajes de tu partida. </br>
                    Marca como visibles aquellos que quieres que tengan acceso a tu tienda.</p>
                 <p>A la tienda se accede a través de la ficha de Personaje de cada jugador. Si un jugador no ve la tienda en su ficha, es porque no tiene marcado el flag de Visible en esta pestaña.</p>
                 <p>Ahora marca como <span class="_bold">Visible</span> al menos un personaje y pulsa Continuar</p>`        
        await helperDialog.dialogDescription2(sContent, sTitle, rules, {
            left: left - 900, top: 20, width: 450
        }, '_borderBlink');          

        $(`form#sheetTienda-Item-${tienda.id} a[data-tab="actors"]`).removeClass('_borderBlink');           
        $(`form#sheetTienda-Item-${tienda.id} a[data-tab="productos"]`).addClass('_borderBlink');
        tienda.sheet.changeTab("productos", "primary");
        sContent = `<h4>Productos</h4>
                 <p>En la pestaña Productos verás todos los objetos de tu carpeta.</p>
                 <p>Inicialmente todos estos Items son <span class="_bold">visibles</span>. Los jugadores que tengan acceso a tu tienda, verán y podrán comprar solos aquellos productos que estén marcados como visibles.</p>
                 <p>Cada producto tiene un Precio. <span class="_bold">Este precio es propio del Item.</span> Esto significa que si cambias el precio del Item, lo verás reflejado en la Tienda y viceversa, si cambias el precio desde tu Tienda, lo cambiará automáticamente en tu Item.</br>
                 <span class="_italic">Ten cuidado si tienes varias tiendas apuntando a la misma carpeta porque los Item son los mismos, es decir... los precios cambiarán en ambas tiendas.</span></p>
                 <p>Un producto puede ser ilimitado (infinito) o por el contrario <span class="_bold">limitado.</span></br>
                    Si un producto está marcado como limitado, tiene unas cuantas unidades a la venta. <span class="_bold">Si se agotan todas sus unidades, el producto SE ELIMINA.</span></p>
                 <p>¿Te has fijado en el Alfanje?. Vamos a hacer que esa espada sea única en la Tienda. 
                   Marca la casilla de <span class="_bold">Limitado</span> y escribe 1 en el cajetín de unidades.</br>
                   Si un jugador compra ese Alfanje, desaparecerá de la Tienda y ningún otro jugador podrá comprarlo.</p>`        
        await helperDialog.dialogDescription2(sContent, sTitle, rules, {
            left: left - 1000, top: 20, width: 550
        }, '_borderBlink');       
        
        $(`form#sheetTienda-Item-${tienda.id} button[data-action="_refresh"]`)[0].click();
        setTimeout(async () => {
            tienda.system.productos[0].limitado = true;
            tienda.system.productos[0].unidades = 1;
            await tienda.update({"system.productos": tienda.system.productos});
            await tienda.sheet.close();
        }, 1500);
        
        ui.sidebar.activateTab("actors");
        await ui.items.render(true);

        const oActor = tienda.system.actors.find(e => e.visible);
        if (oActor) {
            const actor = game.actors.get(oActor.id);
            await actor.sheet.render(true);
            actor.sheet.changeTab("equipo", "primary");
            actor.sheet.changeTab("tiendas", "equipo");
            $(`form#extendCharacterSheet-Actor-${actor.id} a[data-tab="equipo"]`).addClass('_borderBlink'); 
            $(`form#extendCharacterSheet-Actor-${actor.id} a[data-tab="tiendas"]`).addClass('_borderBlink'); 
        }

        sContent = `<img src="systems/aquelarre/assets/img/aq/tiendas/armeria.png" class="_portrait" style="width: 60%; margin-left: 20%;"/>
                 <h4 style="margin-top: 10px;">Entrando en la Armería</h4>
                 <p>Está todo listo para que tus jugadores entren en la Armería. Vamos a probarlo!</p>
                 <p>Abre la ficha de un Personaje que hayas marcado como visible en tu Tienda.</p>
                 <p>Accede a la sección <span class="_bold">Equipo</span> y dentro de ésta entra en la subsección de <span class="_bold">Comercio</span>.</p>
                 <p>Aquí termina este tutorial y si todo ha ido bien, tu personaje debería de tener acceso a la Armería y poder comprar Equipo. Eso sí, no te olvides que tenga un mínimo de maravedíes para gastar...</p>`
        await helperDialog.dialogDescription2(sContent, sTitle, rules, {
            left: 25, top: 25, width: 550
        }, '_borderBlink'); 

    }

}