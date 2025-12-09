import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Insumo {
  id_insumo?: number;
  nombre: string;
  stock: number;
  unidad: string; // kg, g, l, ml, pz, unidades
  proveedor: string;
  fecha_caducidad?: string;
  stock_minimo: number;
  precio: number;
  categoria: string;
  fecha_registro?: string;
}

@Injectable({
  providedIn: 'root',
})
export class InsumosService {
  private apiURL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getInsumos(): Observable<Insumo[]> {
    return this.http.get<Insumo[]>(`${this.apiURL}/insumos`);
  }

  getInsumoById(id: number): Observable<Insumo> {
    return this.http.get<Insumo>(`${this.apiURL}/insumos/${id}`);
  }

  createInsumo(data: Insumo): Observable<any> {
    return this.http.post<any>(`${this.apiURL}/insumos`, data);
  }

  updateInsumo(id: number, data: Partial<Insumo>): Observable<any> {
    return this.http.patch<any>(`${this.apiURL}/insumos/${id}`, data);
  }

  deleteInsumo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiURL}/insumos/${id}`);
  }
}