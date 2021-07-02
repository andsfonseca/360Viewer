/**
 * 360 Map Visualization
 * @author Anderson Silva Fonseca <andsf@live.com>
 * @
 */


//Angular Imports
import { Component, ElementRef, OnInit, Renderer2, ViewChild, HostListener } from '@angular/core';

//ThreeJs Imports
import { Camera, PerspectiveCamera, Sphere } from "three"
import { WebGLRenderer } from "three"
import { Scene } from "three"
import { DirectionalLight, AmbientLight } from "three"
import { Object3D, SphereGeometry, Mesh, BoxGeometry } from "three"
import { TextureLoader, Texture, MeshBasicMaterial } from "three"
import { Vector3 } from "three"
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// @ts-ignore
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
// @ts-ignore
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

//Others Imports
import { EquiretangularMetadata } from '../models/equirectangular';
import { ModelsMetadata } from '../models/Objects';

import { ScenarioTreeView } from '../utils/jsTreeContainer';
import { CameraSettings, Scenario } from '../models/Scenario';
import { ResourcesService } from '../services/resources.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})

/**
 * Componente Canvas. Controlador da Tela resposável pela exibição do Canvas
 */
export class CanvasComponent implements OnInit {

  /**
   * Elemento do Canvas dentro do DOM
   */
  @ViewChild('CanvasComponent', { static: true }) canvasComponent!: ElementRef;

  /**
   * Renderizador do WebGL usado no Three.js
   */
  private webGLRenderer: WebGLRenderer;

  /**
   * Cenário do Three.js */
  private scene: Scene;

  /**
   * Câmera padrão do cenário do Three.js
   */
  private camera!: Camera;

  /**
   * Controle de Câmera fornecido no Sistema
   */
  private controls!: PointerLockControls;

  /**
   * Field of View Padrão da Aplicação
   */
  public readonly FOV: number = 60;

  /**
   * Near padrão da aplicação
   */
  public readonly NEAR: number = 0.1;

  /**
   * Far padrão da aplicação
   */
  public readonly FAR: number = 1000;

  /**
   * Largura do Canvas
   */
  public canvasWidth!: number;

  /**
   * Altura do Canvas
   */
  public canvasHeight!: number;

  /**
   * Flag que informa se é necessário realizar uma atualização na visualização do cenário
   */
  private hasToCallRender: boolean = false;

  /**
   * Tempo anterior desde o ultimo frame
   */
  private fpsTimer: number = 0;

  /**
   *  Texto exibido na View, indica o FPS 
   */
  public fpsCounter: string = "0.00";

  /**
   * Contador de Triângulos Carregados
   */
  public trianglesCounter: number = 0;

  /**
   * Malha Esférica que contêm a imagem 360º
   */
  private equirectangularMesh!: Mesh<SphereGeometry, MeshBasicMaterial>;

  /**
   * Informações das Imagens Equirentagulares hospedadas 
   */
  public equirectangularMetadatas: EquiretangularMetadata = new EquiretangularMetadata();

  /**
   * Pasta de Imagens Selecionada
   */
  public equirectangularFolderCurrentSelected: number = -1;

  /**
   * Imagem 360º selecionada
   */
  public equirectangularImageCurrentSelected: number = -1;

  /**
   * Nome do modelo carregado no cenário
   */
  public modelFileName: string = "Escolher Modelo";

  /**
   * Nome da pasta do modelo carregado no cenário
   */
  public modelBadgeName: string = "";

  /**
   * Malha do Modelo
   */
  private modelMesh!: Object3D;

  /**
   * Informações dos modelos hospedados
   */
  public modelsMetadatas: ModelsMetadata = new ModelsMetadata();

  /**
   * Pasta de modelos selecionada
   */
  public modelsFolderCurrentSelected: number = -1;

    /**
   * Modelos selecionado
   */
  public modelCurrentSelected: number = -1;

  /**
   * Informações do Cenário
   */
  public scenario: Scenario;

  /**
   * Visualização em árvore do cenário
   */
  public scenarioTreeView!: ScenarioTreeView;

  /**
   * Construtor do Componente Canvas
   * @param DOMRenderer (Injenção de Dependência) Renderer do DOM 
   * @param resources (Injenção de Dependência) Serviço responsável por se comunicar com o servidor 
   */
  constructor(private DOMRenderer: Renderer2, private resources: ResourcesService) {
    //Inicializa o WebGLRenderer
    this.webGLRenderer = new WebGLRenderer();
    //Inicializa a Cena
    this.scene = new Scene();
    //Inicializa as Configurações do Cenário
    this.scenario = new Scenario();
  }

  /**
   * Executado ao Inicializar os atributos do Componente.
   */
  ngOnInit(): void {

    //Requisita a Lista de Imagens Equiretangulares
    this.resources.getEquirectangularImages().subscribe((result) => {
      this.equirectangularMetadatas = result
      this.OnClickFolderImage(0);
    });

    //Requisita os Modelos
    this.resources.getModels().subscribe((result) => {
      this.modelsMetadatas = result
      this.OnClickFolderModel(0);
    });

    setTimeout(() => {
      //Inicializa o Canvas
      this.initCanvas()

      //Inicia o Loop de Renderização
      this.renderLoop(0);

      //Inicia a Arvore de Visualização
      this.scenarioTreeView = new ScenarioTreeView("#treeVisualization", this.scenario, () => { this.reloadCamera(this.scenario.getCurrentCameraSettings()!) })
    }, 200)

  }

  /**
   * Inicializa o Canvas
   */
  initCanvas(): void {

    //Cria a Câmera, Define o Tamanho do Canvas
    this.resetWindows()

    //Anexa ao DOM
    this.DOMRenderer.appendChild(this.canvasComponent.nativeElement, this.webGLRenderer.domElement)

    //Anexa o Evento de clique ao Canvas
    this.webGLRenderer.domElement.addEventListener('click', () => {
      this.OnClickCanvas()
    });

    this.createLights();
  }

  /**
   * Reinicializa a Tela, Reajustando o ViewPort e os controles
   */
  resetWindows(): void {

    this.canvasWidth = this.canvasComponent.nativeElement.offsetWidth;
    this.canvasHeight = this.canvasComponent.nativeElement.offsetHeight;

    const aspect = this.canvasWidth / this.canvasHeight;

    //Cria a nova câmera
    this.camera = new PerspectiveCamera(this.FOV, aspect, this.NEAR, this.FAR)

    this.controls = new PointerLockControls(this.camera, this.webGLRenderer.domElement);

    // this.controls = new OrbitControls(this.camera, this.webGLRenderer.domElement);

    //Eventos do Controle
    this.controls.addEventListener('change', (event: any) => {
      this.OnControlsChangeCameraPosition()
    });


    this.OnChangeCameraPosition(false)


    //Altera o Renderer
    this.webGLRenderer.setSize(this.canvasWidth, this.canvasHeight);
  }

  /**
   * Informa ao RenderLoop que é necessário atualizar a tela
   */
  render(): void {
    this.hasToCallRender = true;
  }

  renderLoop(now): void {

    now *= 0.001;                          // convert to seconds
    const deltaTime = now - this.fpsTimer;          // compute time since last frame
    this.fpsTimer = now;                            // remember time for next frame
    this.fpsCounter = (1 / deltaTime).toFixed(2);

    if (this.hasToCallRender) {
      this.hasToCallRender = false;
      this.webGLRenderer.render(this.scene, this.camera);
      this.trianglesCounter = this.webGLRenderer.info.render.triangles;
    }

    requestAnimationFrame((now) => {
      this.renderLoop(now);
    });
  }

  /**
   * Cria as Luzes
   */
  createLights(): void {
    const light = new DirectionalLight(0xFFFFFF, 1);
    light.position.set(0, 40, 0);
    this.scene.add(light)

    const ambient = new AmbientLight(0xFFFFFF);
    this.scene.add(ambient);

    this.render();
  }
  /**
   * Carrega uma nova Configuração de Camera
   * @param filename Nome do arquivo da Imagem 360 que está no Fundo da Câmera
   * @param folder Pasta do arquivo da Imagem 360 que está no Fundo da Câmera
   */
  addCamera(folder, filename): void {

    //Cria uma nova Configuração
    this.scenario.addCameraSettings(new CameraSettings(folder, filename, 50, 50, 50))
    this.scenarioTreeView.addCamera(filename)

    this.reloadCamera(this.scenario.getCurrentCameraSettings()!)
  }

  /**
   * Recarrega a câmera usando uma condfiguração enviada
   * @param cameraSettings Configurações da Camera
   */
  reloadCamera(cameraSettings: CameraSettings): void {
    new TextureLoader()
      .load(this.resources.getEquirectangularImageURI(cameraSettings.textureFolder, cameraSettings.textureFilename),
        (texture) => {
          //Cria o Material com a Textura
          const material = new MeshBasicMaterial({ map: texture });

          //Recupera a Malha da Esfera
          let sphere = this.equirectangularMesh;

          //Caso não tenha sido criado
          if (!sphere) {
            //Cria-se a geometria da Esfera
            const geometry = new SphereGeometry(500, 60, 40);
            geometry.scale(-1, 1, 1);
            sphere = new Mesh(geometry, material);

            //Define-se a posição Inicial
            sphere.position.set(cameraSettings.positionX, cameraSettings.positionY, cameraSettings.positionZ);
            //Adiciona a Cena
            this.scene.add(sphere)
          }
          else {
            sphere.material = material
          }

          this.equirectangularMesh = sphere;

          this.OnChangeCameraPosition(false)
          this.OnChangeEquirectangularImageRotation(false)
          this.render()
        });

  }

  /**
   * Carrega um modelo na cena
   * @param folder Pasta do Modelo
   * @param filename Nome do Arquivo do Modelo
   */
  setModel(folder: string, filename: string) {
    let cameraSettings = this.scenario.getCurrentCameraSettings()!;

    if (cameraSettings) {
      //Incializa o Carregador o KTX2Loader (Textura)
      const ktx2Loader = new KTX2Loader()
        .setTranscoderPath('../custom/basis/')
        .detectSupport(this.webGLRenderer);

      //Inicaliza o Carregador do GLTF (Modelo)
      const gltfLoader = new GLTFLoader();
      gltfLoader.setKTX2Loader(ktx2Loader);
      gltfLoader.setMeshoptDecoder(MeshoptDecoder);

      //Carrega o Modelo Selecionado
      gltfLoader.load(this.resources.getModelURI(folder, filename), (gltf) => {

        console.log("Objeto Carregado!");
        //Recupera a geometria
        const root = gltf.scene;

        //Se já possui um modelo carregado então substitui
        if (this.modelMesh) {
          this.scene.remove(this.modelMesh);
        }

        this.modelMesh = root;

        //Adiciona na cena
        this.scene.add(this.modelMesh);

        //Altera o objeto na cena
        this.modelMesh.position.set(0, 0, 0);
        this.modelMesh.lookAt(new Vector3(0, 9999999999999, 0))

        //Atualiza as variaveis no DOM
        this.modelFileName = filename
        this.modelBadgeName = folder

        //Atualiza os Controles
        // const sceneBB = new Box3().setFromObject(this.modelMesh);
        // sceneBB.getCenter(this.controls.target);

        // //Pega uma das pontas da BoundingBox
        // const corner = new Vector3().copy(sceneBB.max);
        // const dir = corner;
        // dir.sub(this.controls.target);
        // dir.normalize();
        // var boundingSphere = new Sphere();
        // sceneBB.getBoundingSphere(boundingSphere);
        // const distance = Math.abs(boundingSphere.radius / Math.sin(this.FOV / 2)) * 1.1;
        // corner.add(dir.multiplyScalar(distance));

        // cameraSettings.positionX = corner.x;
        // cameraSettings.positionY = corner.y;
        // cameraSettings.positionZ = corner.z;

        // this.OnChangeCameraPosition()

        //Renderiza
        this.render()

      });
    }


  }

  /**
   * Executado quando clica-se no botão de uma pasta
   * @param index Index da Pasta
   */
  public OnClickFolderImage(index: number): void {
    //Caso tenha alguem na Imagem
    if (this.equirectangularMetadatas.folders.length > 0) {
      //Caso sejam iguais
      if (this.equirectangularFolderCurrentSelected == index)
        return;

      this.equirectangularFolderCurrentSelected = index;
    }
    //Caso contrário
    else
      this.equirectangularFolderCurrentSelected = -1

    this.equirectangularImageCurrentSelected = -1;

  }

  /**
   * Executado quando clica-se no botão de uma pasta de Modelos
   * @param index Index da Pasta
   */
  public OnClickFolderModel(index: number): void {
    //Caso tenha alguem na Imagem
    if (this.modelsMetadatas.folders.length > 0) {
      //Caso sejam iguais
      if (this.modelsFolderCurrentSelected == index)
        return;

      this.modelsFolderCurrentSelected = index;
    }
    //Caso contrário
    else
      this.modelsFolderCurrentSelected = -1

    this.modelCurrentSelected = -1;

  }

  /**
   * Executado quando clica-se no botão de um caminho de Pasta
   * @param index Index do Caminho
   */
  public OnClickPathImage(index: number): void {
    this.equirectangularImageCurrentSelected = index;
  }

  /**
 * Executado quando clica-se no botão de um caminho de Pasta do Modelo
 * @param index Index do Caminho
 */
  public OnClickPathModel(index: number): void {
    this.modelCurrentSelected = index;
  }

  /**
   * Executado quando clica-se no botão de selecionar Imagem
   */
  public OnClickSelectImage(): void {

    if (this.equirectangularFolderCurrentSelected == -1 || this.equirectangularImageCurrentSelected == -1)
      return;

    let folder = this.equirectangularMetadatas.folders[this.equirectangularFolderCurrentSelected].label
    let filename = this.equirectangularMetadatas.folders[this.equirectangularFolderCurrentSelected].files[this.equirectangularImageCurrentSelected]

    this.addCamera(folder, filename)
  }

  /**
   * Executado quando clica-se no botão de selecionar Modelo
   */
  public OnClickSelectModel(): void {

    if (this.modelsFolderCurrentSelected == -1 || this.modelCurrentSelected == -1)
      return;

    let folder = this.modelsMetadatas.folders[this.modelsFolderCurrentSelected].label
    let filename = this.modelsMetadatas.folders[this.modelsFolderCurrentSelected].files[this.modelCurrentSelected].file

    this.setModel(folder, filename)
  }

  /**
   * Executado quando ocorre alguma alteração na câmera
   * @param render Informa se deve renderizar ou não
   */
  public OnChangeCameraPosition(render: boolean = true): void {

    let cameraSettings = this.scenario.getCurrentCameraSettings()

    if (cameraSettings) {

      this.camera.position.x = cameraSettings.positionX
      this.camera.position.y = cameraSettings.positionY
      this.camera.position.z = cameraSettings.positionZ

      // this.camera.lookAt(0, 0, 0);

      //Atualiza o Background se estiver instanciado
      if (this.equirectangularMesh) {
        this.equirectangularMesh.position.x = cameraSettings.positionX
        this.equirectangularMesh.position.y = cameraSettings.positionY
        this.equirectangularMesh.position.z = cameraSettings.positionZ
      }

      // this.controls.update();

      //Se câmera já está instanciada
      if (render)
        this.render();

    }

  }
  /**
   * Executado quando ocorre alguma alteração na câmera
   * @param render Informa se deve renderizar ou não
   */
  public OnControlsChangeCameraPosition(render: boolean = true): void {

    let cameraSettings = this.scenario.getCurrentCameraSettings();

    if (cameraSettings) {

      cameraSettings.positionX = this.camera.position.x;
      cameraSettings.positionY = this.camera.position.y;
      cameraSettings.positionZ = this.camera.position.z;

      //Atualiza o Background se estiver instanciado
      if (this.equirectangularMesh) {
        this.equirectangularMesh.position.x = cameraSettings.positionX
        this.equirectangularMesh.position.y = cameraSettings.positionY
        this.equirectangularMesh.position.z = cameraSettings.positionZ
      }

      //Se câmera já está instanciada
      if (render)
        this.render();

    }


  }

  /**
   * Executado ao mudar o slider da rotação da Imagem Equiretangular.
   * @param render Informa se deve renderizar ou não
   */
  public OnChangeEquirectangularImageRotation(render: boolean = true): void {

    let cameraSettings = this.scenario.getCurrentCameraSettings();

    if (cameraSettings) {

      if (!this.equirectangularMesh) {
        console.warn("Imagem Equiretangular não está instaciada");
        return;
      }

      this.equirectangularMesh.rotation.y = cameraSettings.rotationY * Math.PI / 180

      if (render)
        this.render();

    }

  }

  /**
   * Executado com um botão clicado e o sistema está em modo de navegação. O controle de navegação é tratado nesta função
   * @param event Evento do Teclado
   */
  OnControlsLockAndKeyDown(event: KeyboardEvent) {

    if (!(this.controls && this.controls instanceof PointerLockControls && this.controls.isLocked === true)) return;
    let velocity = new Vector3();

    let moveForward = false;
    let moveLeft = false;
    let moveBackward = false;
    let moveRight = false;
    let moveUp = false
    let moveDown = false

    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        moveRight = true;
        break;
      case 'Space':
      case 'KeyE':
        moveUp = true;
        break;
      case 'ShiftLeft':
      case 'KeyQ':
        moveDown = true;
        break;
    }

    let z = Number(moveForward) - Number(moveBackward);
    let x = Number(moveRight) - Number(moveLeft);
    let y = Number(moveUp) - Number(moveDown);

    if (moveForward || moveBackward) velocity.z -= z * 0.5
    if (moveLeft || moveRight) velocity.x -= x * 0.5
    if (moveUp || moveDown) velocity.y -= y * 0.5

    this.controls.moveRight(-velocity.x);
    this.controls.moveForward(-velocity.z);
    this.controls.getObject().position.y += (-velocity.y);

    this.OnControlsChangeCameraPosition()
  }

  /**
   * Executado ao Clicar no Canvas
   */
  OnClickCanvas() {
    //Se o controle existe e é do Tipo PointerLockControls
    if (this.controls && this.controls instanceof PointerLockControls) {
      this.controls.lock();
    }
  }

  /**
   * Executado quando uma tecla é usada
   * @param event Evento do Teclado
   */
  @HostListener('window:keydown', ['$event'])
  OnKeyDown(event: KeyboardEvent) {
    this.OnControlsLockAndKeyDown(event)
  }

}
