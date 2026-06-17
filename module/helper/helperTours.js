import { SYSTEM_ID } from "../config/uiConstants.js"

export default class helperTours {

    static welcome() {

        return {
            title: 'Bienvenido',
            description: game.i18n.localize("tooltip.initTour"),
            display: true,
            steps: [
                    {
                        id: 'step00',
                        title: "",
                        content: `<div class="_tourWrap">
                                    <div class="_tourHeader" style="background-image: url(systems/aquelarre/assets/ui/systemBackground.png)"></div>
                                    <h1>Bienvenido</h1>
                                    <h4>Sistema extendido a las ediciones 3a y 4a de Aquelarre + <span class="_vyc">Villa y Corte</span></h4>
                                    <label class="_description">
                                        Este sistema se encuentra actualmente en desarrollo y se irá actualizando de forma periódica.</br>
                                        Este no es un sistema oficial. El contenido de los repositorios ha sido tomado de los Manuales básicos de Aquelarre y Villa y Corte - <a href="https://www.nosolorol.com/">Ediciones NoSoloRol</a> del juego creado por Ricard Ibañez y Antonio Polo. </br>Esta implementación se define como un apoyo adicional y su finalidad es ayudar a aumentar el alcance del juego.
                                    </label>
                                  </div>`
                    },                
                    {
                        id: 'step01',
                        title: "",
                        content: `<div class="_tourWrap">
                                    <h4>Compendios en función de las reglas</h4>
                                    <label class="_description">
                                        Antes de empezar, debes de saber que existen 3 sistemas de reglas diferentes: 3a Edición, 4a Edición y Villa y Corte.</br>
                                        Cada sistema de reglas tiene su propio compendio con toda clase de objetos, competencias, armas, armaduras, contexto, rasgos, etc..</br>
                                        Puedes abrir en cualquier momento el compendio correspondiente a tu sistema desde el panel lateral de la derecha, en la sección de Compendios.
                                    </label>
                                  </div>`,
                        sidebarTab: 'settings',
                        selector: 'button.ui-control[data-action="tab"][data-tab="compendium"]'
                    },  
                    {
                        id: 'step02',
                        title: "",
                        content: `<div class="_tourWrap">
                                    <h4>Configurando las reglas</h4>
                                    <img class="_header" src="systems/aquelarre/assets/tour/settings.png" />
                                    <label class="_description">
                                        Cuando crees tu partida (mundo), asegurate de elegir el sistema de reglas correspondiente.</br></br>
                                        Desde la configuración del Sistema, puedes acceder a la Configuración del Juego. Allí encontrarás la sección de <strong>Aquelarre</strong>, donde podrás decidir que sistema usarás junto a otro tipo de opciones.
                                    </label>
                                  </div>`,
                        sidebarTab: 'settings',
                        selector: 'button.ui-control[data-action="tab"][data-tab="settings"]'
                    },     
                    {
                        id: 'step03',
                        title: "",
                        content: `<div class="_tourWrap">
                                    <h1>ROADMAP</h1>
                                    <div class="_tourHeader" style="background-image: url(systems/aquelarre/assets/ui/systemBackground.png)"></div>
                                    <label class="_description">
                                        Esta es una primera versión anticipada y jugable del nuevo sistema extendido y se espera que pronto se termine de desarrollar el resto de funcionalidades cuyo roadmap de desarrollo es el siguiente:</br></br>
                                        <ul class="_list">
                                            <li>✠ Acciones de Combate</li>
                                            <li>✠ Modificadores sociales</li>
                                            <li>✠ Ensalmos y Hechizos</li>
                                            <li>✠ Equipo, Posesiones, Monturas y Transfondo</li>
                                            <li>✠ PNJs, Criaturas, Ángeles y Demonios</li>
                                            <li>✠ Mapas y Sistema de enclaves</li>
                                        </ul>
                                        Te agradezco enormemente que hayas descargado este sistema.<br/>
                                        Por favor, no dudes en pasarte por el grupo de Aquelarre en el canal <a href="https://discord.com/channels/701794931299188908/988007079841234996">FoundryVTT Español de Discord</a> donde podrás comentar y participar en este proyecto.
                                    </label>
                                  </div>`
                    },                                                                      
                /*
                {
                    id: 'step01',
                    title: "Título",
                    selector: 'button.ui-control[data-action="tab"][data-tab="settings"]',
                    sidebarTab: 'settings',
                    content: "Hola" //`<img class="_tourHeader" src="systems/aquelarre/assets/ui/systemBackground.png"/><h1>Bienvenute!</h1>`
                }
                */
            ]
            }

    }

}