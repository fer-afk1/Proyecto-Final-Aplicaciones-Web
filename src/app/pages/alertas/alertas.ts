import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { AlertasService, AlertaInsumo } from '../../services/alertas-service';

@Component({
  selector: 'app-alertas',
  imports: [CommonModule, DatePipe, NgClass],
  standalone: true,
  templateUrl: './alertas.html',
  styleUrl: './alertas.scss',
})
export class Alertas implements OnInit {
  alertas: AlertaInsumo[] = [];
  alertasFiltradas: AlertaInsumo[] = [];
  categoriaSeleccionada: string = 'Todas';
  cargando: boolean = false;

  resumen = {
    stock_bajo: 0,
    sin_stock: 0,
    por_caducar: 0,
    caducados: 0
  };

  constructor(private alertasService: AlertasService) {}

  ngOnInit() {
    this.cargarResumen();
    this.cargarTodasLasAlertas();
  }

  cargarResumen() {
    this.alertasService.getResumenAlertas().subscribe({
      next: (data) => {
        this.resumen = data;
      },
      error: (err) => {
        console.error('Error al cargar resumen:', err);
      }
    });
  }

  cargarTodasLasAlertas() {
    this.cargando = true;
    const requests = [
      this.alertasService.getStockBajo(),
      this.alertasService.getSinStock(),
      this.alertasService.getPorCaducar(),
      this.alertasService.getCaducados()
    ];

    // Combinar todas las alertas
    Promise.all(requests.map(req => req.toPromise()))
      .then(([stockBajo, sinStock, porCaducar, caducados]) => {
        // Usar un Map para evitar duplicados
        const alertasMap = new Map<number, AlertaInsumo>();
        
        [...(stockBajo || []), ...(sinStock || []), ...(porCaducar || []), ...(caducados || [])].forEach(alerta => {
          if (alerta.id_insumo) {
            alertasMap.set(alerta.id_insumo, alerta);
          }
        });

        this.alertas = Array.from(alertasMap.values());
        this.aplicarFiltro();
        this.cargando = false;
      })
      .catch(err => {
        console.error('Error al cargar alertas:', err);
        this.cargando = false;
      });
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    if (this.categoriaSeleccionada === 'Todas') {
      this.alertasFiltradas = this.alertas;
    } else if (this.categoriaSeleccionada === 'Stock Bajo') {
      this.alertasFiltradas = this.alertas.filter(a => 
        a.stock > 0 && a.stock <= a.stock_minimo
      );
    } else if (this.categoriaSeleccionada === 'Sin Stock') {
      this.alertasFiltradas = this.alertas.filter(a => a.stock === 0);
    } else if (this.categoriaSeleccionada === 'Por Caducar') {
      this.alertasFiltradas = this.alertas.filter(a => this.esPorCaducar(a) && !this.esCaducado(a));
    } else if (this.categoriaSeleccionada === 'Caducados') {
      this.alertasFiltradas = this.alertas.filter(a => this.esCaducado(a));
    }

    // Ordenar por severidad
    this.alertasFiltradas.sort((a, b) => {
      const severidadA = this.getSeveridad(a);
      const severidadB = this.getSeveridad(b);
      return severidadB - severidadA;
    });
  }

  getSeveridad(alerta: AlertaInsumo): number {
    let severidad = 0;
    if (alerta.stock === 0) severidad += 4;
    if (this.esCaducado(alerta)) severidad += 3;
    if (alerta.stock <= alerta.stock_minimo && alerta.stock > 0) severidad += 2;
    if (this.esPorCaducar(alerta)) severidad += 1;
    return severidad;
  }

  esCaducado(alerta: AlertaInsumo): boolean {
    if (!alerta.fecha_caducidad) return false;
    const hoy = new Date();
    const caducidad = new Date(alerta.fecha_caducidad);
    return caducidad < hoy;
  }

  esPorCaducar(alerta: AlertaInsumo): boolean {
    if (!alerta.fecha_caducidad) return false;
    const hoy = new Date();
    const caducidad = new Date(alerta.fecha_caducidad);
    const diasRestantes = Math.ceil((caducidad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 7 && diasRestantes > 0;
  }

  getAlertaClass(alerta: AlertaInsumo): string {
    if (alerta.stock === 0) return 'alerta-critica';
    if (this.esCaducado(alerta)) return 'alerta-caducado';
    if (alerta.stock <= alerta.stock_minimo) return 'alerta-warning';
    if (this.esPorCaducar(alerta)) return 'alerta-info';
    return '';
  }

  getAlertaIcono(alerta: AlertaInsumo): string {
    if (alerta.stock === 0) return ' ';
    if (this.esCaducado(alerta)) return ' ';
    if (this.esPorCaducar(alerta)) return ' ';
    if (alerta.stock <= alerta.stock_minimo) return ' ';
    return ' ';
  }

  // Nuevos métodos para el diseño de tarjetas tipo pedidos
  getBadgeClass(alerta: AlertaInsumo): string {
    if (alerta.stock === 0) {
      return 'badge-sin-stock';
    }
    if (alerta.stock <= alerta.stock_minimo && alerta.stock > 0) {
      return 'badge-stock-bajo';
    }
    if (this.esCaducado(alerta)) {
      return 'badge-caducado';
    }
    if (this.esPorCaducar(alerta)) {
      return 'badge-por-caducar';
    }
    return '';
  }

  getTipoAlerta(alerta: AlertaInsumo): string {
    if (alerta.stock === 0) {
      return 'Sin Stock';
    }
    if (alerta.stock <= alerta.stock_minimo && alerta.stock > 0) {
      return 'Stock Bajo';
    }
    if (this.esCaducado(alerta)) {
      return 'Caducado';
    }
    if (this.esPorCaducar(alerta)) {
      return 'Por Caducar';
    }
    return 'Normal';
  }
}