import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// Interfaz del proveedor
export interface Proveedor {
  id_proveedor?: number;
  nombre: string;
  categoria: string;
  item: string;
  correo: string;
  telefono?: string;
  direccion: string;
  contacto: string;
  fecha_registro?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProveedoresService {
  private apiURL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Obtener todos los proveedores
  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiURL}/proveedores`);
  }

  // Obtener proveedor por ID
  getProveedorById(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiURL}/proveedores/${id}`);
  }

  // Crear un nuevo proveedor
  createProveedor(data: Proveedor): Observable<any> {
    return this.http.post<any>(`${this.apiURL}/proveedores`, data);
  }

  // Actualizar un proveedor existente
  updateProveedor(id: number, data: Partial<Proveedor>): Observable<any> {
    return this.http.patch<any>(`${this.apiURL}/proveedores/${id}`, data);
  }

  // Eliminar un proveedor
  deleteProveedor(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiURL}/proveedores/${id}`);
  }
}