import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService, Producto } from '../../services/productos-service';
import { InsumosService, Insumo } from '../../services/insumos-service';
import { FormularioProductos } from '../formulario-productos/formulario-productos';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, FormularioProductos],
  templateUrl: './productos.html',
  styleUrl: './productos.scss',
})
export class Productos implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categoriaSeleccionada: string = 'Todas';
  terminoBusqueda: string = '';
  cargando: boolean = false;

  // Selección múltiple
  productosSeleccionados: Producto[] = [];

  // Edición en cola
  colaEdicion: Producto[] = [];
  editandoCola: boolean = false;

  // Modales
  mostrarDetalles = false;
  mostrarFormulario = false;
  productoDetalle: Producto | null = null;
  idParaEditar: number | undefined = undefined;

  // Insumos para el formulario
  insumosDisponibles: Insumo[] = [];

  snackbar = {
    mostrar: false,
    mensaje: '',
    tipo: 'success' as 'success' | 'error'
  };

  imagenError = false;
  
  constructor(
    private productosService: ProductosService,
    private insumosService: InsumosService
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarInsumos();
  }

  cargarProductos() {
    this.cargando = true;
    this.productosService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.mostrarSnackbar('Error al cargar productos', 'error');
        this.cargando = false;
      }
    });
  }

  cargarInsumos() {
    this.insumosService.getInsumos().subscribe({
      next: (data) => {
        this.insumosDisponibles = data;
      },
      error: (err) => {
        console.error('Error al cargar insumos:', err);
      }
    });
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.aplicarFiltro();
  }

  buscarProductos(event: any) {
    this.terminoBusqueda = event.target.value.toLowerCase();
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    let resultado = this.productos;

    if (this.categoriaSeleccionada !== 'Todas') {
      resultado = resultado.filter(p =>
        p.categoria.toLowerCase() === this.categoriaSeleccionada.toLowerCase()
      );
    }

    if (this.terminoBusqueda) {
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(this.terminoBusqueda) ||
        p.categoria.toLowerCase().includes(this.terminoBusqueda)
      );
    }

    this.productosFiltrados = resultado;
  }

  seleccionarProducto(producto: Producto) {
    const index = this.productosSeleccionados.findIndex(
      p => p.id_producto === producto.id_producto
    );

    if (index > -1) {
      this.productosSeleccionados.splice(index, 1);
    } else {
      this.productosSeleccionados.push(producto);
    }
  }

  estaSeleccionado(producto: Producto): boolean {
    return this.productosSeleccionados.some(
      p => p.id_producto === producto.id_producto
    );
  }

  limpiarSeleccion() {
    this.productosSeleccionados = [];
    this.colaEdicion = [];
    this.editandoCola = false;
  }

  abrirRegistrar() {
    if (this.productosSeleccionados.length > 0) {
      this.mostrarSnackbar('Limpia la selección antes de registrar', 'error');
      return;
    }
    this.idParaEditar = undefined;
    this.mostrarFormulario = true;
  }

  editarSeleccionados() {
    if (this.productosSeleccionados.length === 0) {
      this.mostrarSnackbar('Selecciona al menos un producto', 'error');
      return;
    }

    this.colaEdicion = [...this.productosSeleccionados];
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

    const siguienteProducto = this.colaEdicion[0];
    this.idParaEditar = siguienteProducto.id_producto!;
    this.mostrarFormulario = true;
  }

  eliminarSeleccionados() {
    if (this.productosSeleccionados.length === 0) {
      this.mostrarSnackbar('Selecciona al menos un producto', 'error');
      return;
    }

    const cantidad = this.productosSeleccionados.length;
    const nombres = this.productosSeleccionados.map(p => p.nombre).join(', ');
    
    const confirmar = confirm(
      `¿Estás seguro de eliminar ${cantidad} producto(s)?\n\n${nombres}\n\nEsta acción no se puede deshacer.`
    );

    if (confirmar) {
      this.eliminarMultiples();
    }
  }

  eliminarMultiples() {
    let eliminados = 0;
    const total = this.productosSeleccionados.length;

    this.productosSeleccionados.forEach((producto) => {
      this.productosService.deleteProducto(producto.id_producto!).subscribe({
        next: () => {
          eliminados++;
          if (eliminados === total) {
            this.mostrarSnackbar(`${total} producto(s) eliminado(s) correctamente`, 'success');
            this.limpiarSeleccion();
            this.cargarProductos();
          }
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          this.mostrarSnackbar(`Error al eliminar ${producto.nombre}`, 'error');
        }
      });
    });
  }

  verDetalles(producto: Producto, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    this.productosService.getProductoById(producto.id_producto!).subscribe({
      next: (data) => {
        this.productoDetalle = data;
        this.mostrarDetalles = true;
      },
      error: (err) => {
        console.error('Error al cargar detalles:', err);
        this.mostrarSnackbar('Error al cargar detalles del producto', 'error');
      }
    });
  }

  cerrarDetalles() {
    this.mostrarDetalles = false;
    this.productoDetalle = null;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.idParaEditar = undefined;
    this.cargarProductos();

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

  getEstadoStockClass(estado?: string): string {
    switch (estado) {
      case 'stock-ok': return 'stock-ok';
      case 'stock-bajo': return 'stock-bajo';
      case 'sin-stock': return 'sin-stock';
      default: return 'stock-ok';
    }
  }

  getEstadoStockTexto(estado?: string): string {
    switch (estado) {
      case 'stock-ok': return 'Disponible';
      case 'stock-bajo': return 'Stock Bajo';
      case 'sin-stock': return 'Sin Stock';
      default: return 'Disponible';
    }
  }

  getCategoriaTexto(categoria: string): string {
    const categorias: { [key: string]: string } = {
      'bebidas': 'Bebidas',
      'comidas': 'Comidas',
      'postres': 'Postres'
    };
    return categorias[categoria] || categoria;
  }

  esURL(texto: string | undefined): boolean {
    if (!texto) return false;
    return texto.startsWith('http://') || texto.startsWith('https://');
  }

  mostrarSnackbar(mensaje: string, tipo: 'success' | 'error') {
    this.snackbar = { mostrar: true, mensaje, tipo };
    setTimeout(() => {
      this.snackbar.mostrar = false;
    }, 3000);
  }
}