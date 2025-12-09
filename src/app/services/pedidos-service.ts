import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Pedido {
  id_pedido?: number;
  proveedor: string;
  item: string;
  cantidad: number;
  unidad: string;
  tipo: boolean; // true = producto, false = insumo
  precio: number;
  fecha_pedido?: string;
  fecha_llegada?: string;
  estado?: 'pendiente' | 'entregado' | 'cancelado';
}

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  private apiURL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiURL}/pedidos`);
  }

  getPedidoById(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiURL}/pedidos/${id}`);
  }

  createPedido(data: Pedido): Observable<any> {
    return this.http.post<any>(`${this.apiURL}/pedidos`, data);
  }

  updatePedido(id: number, data: Partial<Pedido>): Observable<any> {
    return this.http.patch<any>(`${this.apiURL}/pedidos/${id}`, data);
  }

  cambiarEstado(id: number, estado: 'pendiente' | 'entregado' | 'cancelado'): Observable<any> {
    return this.http.patch<any>(`${this.apiURL}/pedidos/${id}/estado`, { estado });
  }

  deletePedido(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiURL}/pedidos/${id}`);
  }
}