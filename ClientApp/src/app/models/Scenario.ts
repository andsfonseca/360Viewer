/**
 * Contêm as informações da câmera
 */
export interface ICameraSettings {

    /**
     * Pasta da Textura
     */
    textureFolder: string;

    /**
     * Nome do arquivo de textura
     */
    textureFilename: string;

    /**
     * Coordenada X da Câmera
     */
    positionX: number;

    /**
     * Coordenada Y da Câmera
     */
    positionY: number;

    /**
     * Coordenada Z da Câmera
     */
    positionZ: number;

    /**
     * Rotação Y da Câmera
     */
    rotationY: number;
}

/**
 * Configurações da Câmera
 */
export class CameraSettings implements ICameraSettings{
    textureFolder: string;
    textureFilename: string = "";
    positionX: number = 0;
    positionY: number = 0;
    positionZ: number = 0;
    rotationY: number = 0;

    /**
     * Cria uma configuração da Câmera
     * @param textureFolder Pasta da Textura
     * @param textureFilename Nome do arquivo de textura
     * @param positionX Posição X inicial
     * @param positionY Posição Y inicial
     * @param positionZ Posição Z inicial
     * @param rotationY Rotação Y inicial
     */
    constructor(textureFolder: string, textureFilename: string, positionX: number = 0, positionY: number = 0, positionZ: number = 0, rotationY: number = 0 ){
        this.textureFolder = textureFolder;
        this.textureFilename = textureFilename;
        this.positionX = positionX;
        this.positionY = positionY;
        this.positionZ = positionZ;
        this.rotationY = rotationY;
    }
}

/**
 * Informações do Cenário
 */
export class Scenario {

    /**
     * Câmera Selecionada no Cenário
     */
    currentCameraIndex: number = -1;

    /**
     * Lista de Configurações Atuais da Câmera
     */
    cameraSettingsList: ICameraSettings[] = []

    /**
     * Retorna as configurações da Câmera Atual
     * @returns Configurações da Câmera Atual
     */
    getCurrentCameraSettings(): ICameraSettings | null{
        if(this.cameraSettingsList.length > 0)
            return this.cameraSettingsList[this.currentCameraIndex]
        return null;
    }

    /**
     * Adiciona uma câmera ao Cenário
     * @param cameraSettings Configurações da Câmera
     */
    addCameraSettings(cameraSettings : CameraSettings){
        this.cameraSettingsList.push(cameraSettings)
        this.currentCameraIndex = this.cameraSettingsList.length - 1;
    }

}