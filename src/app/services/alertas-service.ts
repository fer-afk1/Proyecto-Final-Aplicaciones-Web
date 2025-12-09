import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface AlertaInsumo {
  id_insumo: number;
  nombre: string;
  stock: number;
  unidad: string;
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
export class AlertasService {
  private apiURL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Insumos con stock bajo (stock <= stock_minimo)
  getStockBajo(): Observable<AlertaInsumo[]> {
    return this.http.get<AlertaInsumo[]>(`${this.apiURL}/alertas/stock-bajo`);
  }

  // Insumos sin stock (stock = 0)
  getSinStock(): Observable<AlertaInsumo[]> {
    return this.http.get<AlertaInsumo[]>(`${this.apiURL}/alertas/sin-stock`);
  }

  // Insumos por caducar (caducan en 7 días o menos)
  getPorCaducar(): Observable<AlertaInsumo[]> {
    return this.http.get<AlertaInsumo[]>(`${this.apiURL}/alertas/por-caducar`);
  }

  // Insumos ya caducados
  getCaducados(): Observable<AlertaInsumo[]> {
    return this.http.get<AlertaInsumo[]>(`${this.apiURL}/alertas/caducados`);
  }

  // Obtener todas las alertas con contadores
  getResumenAlertas(): Observable<{
    stock_bajo: number;
    sin_stock: number;
    por_caducar: number;
    caducados: number;
  }> {
    return this.http.get<any>(`${this.apiURL}/alertas/resumen`);
  }
}