import { Component, OnInit } from '@angular/core';
import { UpperCasePipe, NgClass, CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsumosService, Insumo } from '../../services/insumos-service';
import { ProveedoresService } from '../../services/proveedores-service';
import { FormularioPedido } from '../formulario-pedidos/formulario-pedidos';
import { FormularioInsumos } from '../formulario-insumos/formulario-insumos';

@Component({
  selector: 'app-insumos',
  imports: [UpperCasePipe, NgClass, CommonModule, FormsModule, DatePipe, FormularioPedido, FormularioInsumos],
  standalone: true,
  templateUrl: './insumos.html',
  styleUrl: './insumos.scss',
})
export class Insumos implements OnInit {
  insumos: Insumo[] = [];
  insumosFiltrados: Insumo[] = [];
  categoriaSeleccionada: string = 'Todas';
  terminoBusqueda: string = '';
  cargando: boolean = false;
  
  // Selección múltiple
  insumosSeleccionados: Insumo[] = [];
  
  // Edición en cola
  colaEdicion: Insumo[] = [];
  editandoCola: boolean = false;
  
  // Modales
  mostrarFormulario = false;
  mostrarFormularioPedido = false;
  idParaEditar: number | null = null;
  
  // Proveedores para el formulario
  proveedores: any[] = [];

  snackbar = {
    mostrar: false,
    mensaje: '',
    tipo: 'success' as 'success' | 'error'
  };

  constructor(
    private insumosService: InsumosService,
    private proveedoresService: ProveedoresService
  ) {}

  ngOnInit() {
    this.cargarInsumos();
    this.cargarProveedores();
  }

  cargarInsumos() {
    this.cargando = true;
    this.insumosService.getInsumos().subscribe({
      next: (data) => {
        this.insumos = data;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar insumos:', err);
        this.mostrarSnackbar('Error al cargar insumos', 'error');
        this.cargando = false;
      }
    });
  }

  cargarProveedores() {
    this.proveedoresService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
      }
    });
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.aplicarFiltro();
  }

  buscarInsumos(event: any) {
    this.terminoBusqueda = event.target.value.toLowerCase();
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    let resultado = this.insumos;

    if (this.categoriaSeleccionada !== 'Todas') {
      resultado = resultado.filter(i => 
        i.categoria.toLowerCase() === this.categoriaSeleccionada.toLowerCase()
      );
    }

    if (this.terminoBusqueda) {
      resultado = resultado.filter(i => 
        i.nombre.toLowerCase().includes(this.terminoBusqueda) ||
        i.proveedor.toLowerCase().includes(this.terminoBusqueda) ||
        i.categoria.toLowerCase().includes(this.terminoBusqueda)
      );
    }

    this.insumosFiltrados = resultado;
  }

  seleccionarInsumo(insumo: Insumo) {
    const index = this.insumosSeleccionados.findIndex(
      i => i.id_insumo === insumo.id_insumo
    );

    if (index > -1) {
      this.insumosSeleccionados.splice(index, 1);
    } else {
      this.insumosSeleccionados.push(insumo);
    }
  }

  estaSeleccionado(insumo: Insumo): boolean {
    return this.insumosSeleccionados.some(
      i => i.id_insumo === insumo.id_insumo
    );
  }

  limpiarSeleccion() {
    this.insumosSeleccionados = [];
    this.colaEdicion = [];
    this.editandoCola = false;
  }

  abrirRegistrar() {
    if (this.insumosSeleccionados.length > 0) {
      this.mostrarSnackbar('Limpia la selección antes de registrar', 'error');
      return;
    }
    this.idParaEditar = null;
    this.mostrarFormulario = true;
  }

  editarSeleccionados() {
    if (this.insumosSeleccionados.length === 0) {
      this.mostrarSnackbar('Selecciona al menos un insumo', 'error');
      return;
    }

    this.colaEdicion = [...this.insumosSeleccionados];
    this.editandoCola = true;
    this.editarSiguienteEnCola();
  }

  editarSiguienteEnCola() {
    if (this.colaEdicion.length === 0) {
      this.editandoCola = false;
      this.limpiarSeleccion();
      this.mostrarSnackbar('Edición completada', 'success');
      return;
    }

    const siguienteInsumo = this.colaEdicion[0];
    this.idParaEditar = siguienteInsumo.id_insumo!;
    this.mostrarFormulario = true;
  }

  eliminarSeleccionados() {
    if (this.insumosSeleccionados.length === 0) {
      this.mostrarSnackbar('Selecciona al menos un insumo', 'error');
      return;
    }

    const cantidad = this.insumosSeleccionados.length;
    const nombres = this.insumosSeleccionados.map(i => i.nombre).join(', ');
    
    const confirmar = confirm(
      `¿Estás seguro de eliminar ${cantidad} insumo(s)?\n\n${nombres}\n\nEsta acción no se puede deshacer.`
    );

    if (confirmar) {
      this.eliminarMultiples();
    }
  }

  eliminarMultiples() {
    let eliminados = 0;
    const total = this.insumosSeleccionados.length;

    this.insumosSeleccionados.forEach((insumo) => {
      this.insumosService.deleteInsumo(insumo.id_insumo!).subscribe({
        next: () => {
          eliminados++;
          if (eliminados === total) {
            this.mostrarSnackbar(`${total} insumo(s) eliminado(s) correctamente`, 'success');
            this.limpiarSeleccion();
            this.cargarInsumos();
          }
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          this.mostrarSnackbar(`Error al eliminar ${insumo.nombre}`, 'error');
        }
      });
    });
  }

  // Abrir formulario de pedido
  abrirPedido() {
    if (this.insumosSeleccionados.length === 0) {
      this.mostrarSnackbar('Selecciona al menos un insumo para pedir', 'error');
      return;
    }
    this.mostrarFormularioPedido = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.idParaEditar = null;
    this.cargarInsumos();

    if (this.editandoCola && this.colaEdicion.length > 0) {
      this.colaEdicion.shift();
      if (this.colaEdicion.length > 0) {
        setTimeout(() => {
          this.editarSiguienteEnCola();
        }, 500);
      } else {
        this.editandoCola = false;
        this.limpiarSeleccion();
        this.mostrarSnackbar('Edición completada', 'success');
      }
    }
  }

  cerrarFormularioPedido() {
    this.mostrarFormularioPedido = false;
    this.limpiarSeleccion();
    this.cargarInsumos();
  }

  mostrarSnackbar(mensaje: string, tipo: 'success' | 'error') {
    this.snackbar = { mostrar: true, mensaje, tipo };
    setTimeout(() => {
      this.snackbar.mostrar = false;
    }, 3000);
  }

  // Obtener estado del stock (para el punto de color)
  getEstadoStock(insumo: Insumo): string {
    if (insumo.stock === 0) return 'sin-stock';
    if (insumo.stock <= insumo.stock_minimo) return 'stock-bajo';
    return 'stock-ok';
  }

  // Clase del punto de stock
  getDotClass(insumo: Insumo): string {
    const estado = this.getEstadoStock(insumo);
    return `status-dot status-${estado}`;
  }

  // Color para inicial
  getColorFromName(nombre: string): string {
    const colors = [
      '#8D7A63', '#6B5D4F', '#A67C52', '#8B6F47', '#7D6E5D',
      '#9B8B7E', '#8A7968', '#6F5E52', '#9A8676', '#7B6B5A'
    ];
    
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }
}