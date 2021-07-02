/**
 * Representação dos Metadados dos Modelos
 */
export interface ModelsMetadata {
    /**
     * Pastas de Modelos
     */
    folders: IModelFolder[];
}

/**
 * Pasta com um conjunto de Modelos
 */
export interface IModelFolder {
    /**
     * Nome da Pasta
     */
    label: string;

    /**
     * Lista de Arquivos
     */
    files: IModelFile[];
}

/**
 * Informações do Modelo
 */
export interface IModelFile {
    /**
     * Nome do arquivo
     */
    file: string;

    /**
     * Tamanho do arquivo em MB
     */
    size: number;
}

/**
 * Representação dos Metadados dos Modelos
 */
export class ModelsMetadata implements ModelsMetadata {

    /**
     * Pastas de Modelos
     */
    folders: IModelFolder[] = []
}