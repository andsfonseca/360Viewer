
/**
 * Representação dos Metadados das Imagens 360º
 */
export interface IEquiretangularMetada {
    /**
     * Pastas das Imagens
     */
    folders: IEquiretangularFolder[];
}

/**
 * Pasta da Imagem 360
 */
export interface IEquiretangularFolder {
    /**
     * Pasta da Imagem
     */
    label: string;

    /**
     * Lista de arquivos contigdos na pasta
     */
    files: string[];
}

/**
 * Representação dos Metadados das Imagens 360º
 */
export class EquiretangularMetadata implements IEquiretangularMetada {
    /**
     * Pastas das Imagens
     */
    folders: IEquiretangularFolder[] = []
}