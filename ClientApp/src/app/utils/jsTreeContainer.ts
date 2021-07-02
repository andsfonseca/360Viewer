import { Scenario } from "../models/Scenario";

//Javascript Imports
declare var $: any; //Jquery

/**
 * Classe que contém informações da Árvore de Visualização
 */
export class ScenarioTreeView {

    /**
     * Instancia do JStree
     */
    private jstree: any;

    /**
     * Localização da Árvore no DOM
     */
    private domElement: any;

    /**
     * Elemento principal da Árvore
     */
    private rootNodeId: any;

    /**
     * Elemento que contém o nó pai das Câmeras
     */
    private cameraRootNodeId: any;

    /**
     * Informações das câmeras criadas na árvore
     */
    public cameraNodes: any[];

    /**
     * Informações do Cenário
     */
    private scenario: Scenario;

    /**
     * Constroi uma árvore de visualização
     * @param selector Elemento do DOM
     * @param scenario Cenário Atual
     * @param OnChangeCamera Método executado quando uma câmera é selecionada na árvore
     * @param rootNodeName Nome do nó principal
     */
    constructor(selector: string, scenario: Scenario, OnChangeCamera: any,  rootNodeName: String = "Visualização") {
        this.domElement = $(selector);

        this.domElement.jstree({
            'core': {
                'multiple': false,
                'check_callback': true,

            }
        });

        this.jstree = this.domElement.jstree(true)

        this.rootNodeId = this.jstree.create_node('#', {
            "id": "rootNode",
            "text": rootNodeName,
            state: {
                opened: true
            },
        });

        this.cameraRootNodeId = this.jstree.create_node('rootNode', {
            "id": "cameraRoot",
            "text": "Câmeras",
            state: {
                opened: true
            },
        });

        this.cameraNodes = []

        this.domElement.on(
            "select_node.jstree", (evt, data) => {
                if(data.node.id.includes("camera_")){
                   
                    this.scenario.currentCameraIndex = data.node.original.cameraIndex
                    OnChangeCamera()
                }
            }
        );

        this.scenario = scenario
    }

    /**
     * Adiciona uma câmera a árvore
     * @param text Nome da Câmera
     */
    addCamera(text) {

        var node = this.jstree.create_node('cameraRoot', {
            "id": "camera_" + this.cameraNodes.length,
            "text": text,
            state: {
                selected: true
            },
            cameraIndex:this.cameraNodes.length
        })


        this.cameraNodes.push(node);
    }
}