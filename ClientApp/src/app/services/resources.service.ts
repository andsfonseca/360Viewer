import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EquiretangularMetadata } from '../models/equirectangular';
import { ModelsMetadata } from '../models/Objects';
import { GlobalConstants } from '../utils/GlobalConstants';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {

  /**
   * 
   * @param httpClient (Injeção de Dependencia) Serviço http fornecido pelo Angular
   */
  constructor(private httpClient: HttpClient) { }

  /**
 * Retorna a URI da Imagem para Download
 * @param folder Pasta da Imagem 360º
 * @param filename Nome da Imagem
 * @returns Retorna a URI da Imagem
 */
  getEquirectangularImageURI(folder: string, filename: string): string {
    return `${GlobalConstants.API_URL}/getEquirectangularImage/${folder}/${filename}`
  }

  /**
   * Retorna a URI do Wavefront para Download
   * @param folder Pasta do Modelo
   * @param filename Nome do Modelo
   * @returns Retorna a URI do Modelo
   */
  getModelURI(folder: string, filename: string): string {
    return `${GlobalConstants.API_URL}/getModel/${folder}/${filename}`
  }

  /**
   * Retorna os Metadados dos Modelos no Servidor
   * @returns 
   */
  getModels(): Observable<ModelsMetadata>{
      return this.httpClient.get<ModelsMetadata>(`${GlobalConstants.API_URL}/getModels`);
  }

  /**
   * Retorna os Metadados das Imagens 360° no Servidor
   * @returns 
   */
  getEquirectangularImages(): Observable<EquiretangularMetadata>{
    return this.httpClient.get<EquiretangularMetadata>(`${GlobalConstants.API_URL}/getEquirectangular`);
  }

}


