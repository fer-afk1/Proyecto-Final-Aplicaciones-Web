import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Ingrediente {
  id_receta?: number;
  nombre_insumo: string;
  cantidad_necesaria: number;
  unidad: string;
  stock_disponible?: number;
  unidades_posibles?: number;
}

export interface Producto {
  id_producto?: number;
  nombre: string;
  categoria: 'bebidas' | 'comidas' | 'postres';
  precio: number;
  descripcion?: string;
  imagen?: string;
  fecha_registro?: string;
  unidades_disponibles?: number;
  estado_stock?: 'stock-ok' | 'stock-bajo' | 'sin-stock';
  receta?: Ingrediente[];
}

export interface Receta {
  id_receta?: number;
  id_producto: number;
  nombre_insumo: string;
  cantidad_necesaria: number;
  unidad: string;
  stock_disponible?: number;
  unidades_posibles?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private apiURL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // ========== PRODUCTOS ==========
  
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiURL}/productos`);
  }

  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiURL}/productos/${id}`);
  }

  createProducto(data: Producto): Observable<any> {
    return this.http.post<any>(`${this.apiURL}/productos`, data);
  }

  updateProducto(id: number, data: Partial<Producto>): Observable<any> {
    return this.http.patch<any>(`${this.apiURL}/productos/${id}`, data);
  }

  deleteProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiURL}/productos/${id}`);
  }

  // ========== RECETAS ==========
  
  getReceta(id_producto: number): Observable<Receta[]> {
    return this.http.get<Receta[]>(`${this.apiURL}/recetas/${id_producto}`);
  }

  addIngrediente(data: Receta): Observable<any> {
    return this.http.post<any>(`${this.apiURL}/recetas`, data);
  }

  updateIngrediente(id: number, data: Partial<Receta>): Observable<any> {
    return this.http.patch<any>(`${this.apiURL}/recetas/${id}`, data);
  }

  deleteIngrediente(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiURL}/recetas/${id}`);
  }
}