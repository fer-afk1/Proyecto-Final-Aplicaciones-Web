import { Component, OnInit } from '@angular/core';
import { UpperCasePipe, NgClass, CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormularioProveedores } from '../formulario-proveedores/formulario-proveedores';
import { ProveedoresService } from '../../services/proveedores-service';

@Component({
  selector: 'app-proveedores',
  imports: [UpperCasePipe, NgClass, FormularioProveedores, CommonModule, FormsModule, DatePipe],
  standalone: true,
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.scss',
})
export class Proveedores implements OnInit {
  proveedores: any[] = [];
  proveedoresFiltrados: any[] = [];
  categoriaSeleccionada: string = 'Todas';
  terminoBusqueda: string = '';
  cargando: boolean = false;
  
  // Para manejar selección múltiple
  proveedoresSeleccionados: any[] = [];
  
  // Para edición en cola
  colaEdicion: any[] = [];
  editandoCola: boolean = false;
  
  mostrarFormulario = false;
  mostrarModalEliminar = false;
  idParaEditar: number | null = null;

  snackbar = {
    mostrar: false,
    mensaje: '',
    tipo: 'success' as 'success' | 'error'
  };

  constructor(private proveedoresService: ProveedoresService) {}

  ngOnInit() {
    this.cargarProveedores();
  }

  // Cargar proveedores desde el backend
  cargarProveedores() {
    this.cargando = true;
    this.proveedoresService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
        this.mostrarSnackbar('Error al cargar proveedores', 'error');
        this.cargando = false;
      }
    });
  }

  // Filtrar por categoría
  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.aplicarFiltro();
  }

  // Buscar proveedores
  buscarProveedores(event: any) {
    this.terminoBusqueda = event.target.value.toLowerCase();
    this.aplicarFiltro();
  }

  // Aplicar filtro (categoría + búsqueda)
  aplicarFiltro() {
    let resultado = this.proveedores;

    // Filtrar por categoría
    if (this.categoriaSeleccionada === 'Insumos') {
      resultado = resultado.filter(p => 
        p.categoria.toLowerCase() === 'insumos' || 
        p.categoria.toLowerCase() === 'insumos/productos'
      );
    } else if (this.categoriaSeleccionada === 'Productos') {
      resultado = resultado.filter(p => 
        p.categoria.toLowerCase() === 'productos' || 
        p.categoria.toLowerCase() === 'insumos/productos'
      );
    }

    // Filtrar por búsqueda
    if (this.terminoBusqueda) {
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(this.terminoBusqueda) ||
        p.item.toLowerCase().includes(this.terminoBusqueda) ||
        p.correo.toLowerCase().includes(this.terminoBusqueda) ||
        p.contacto.toLowerCase().includes(this.terminoBusqueda) ||
        (p.telefono && p.telefono.toLowerCase().includes(this.terminoBusqueda))
      );
    }

    this.proveedoresFiltrados = resultado;
  }

  // Seleccionar/deseleccionar proveedor
  seleccionarProveedor(proveedor: any) {
    const index = this.proveedoresSeleccionados.findIndex(
      p => p.id_proveedor === proveedor.id_proveedor
    );

    if (index > -1) {
      // Ya está seleccionado, lo quitamos
      this.proveedoresSeleccionados.splice(index, 1);
    } else {
      // No está seleccionado, lo agregamos
      this.proveedoresSeleccionados.push(proveedor);
    }
  }

  // Verificar si un proveedor está seleccionado
  estaSeleccionado(proveedor: any): boolean {
    return this.proveedoresSeleccionados.some(
      p => p.id_proveedor === proveedor.id_proveedor
    );
  }

  // Limpiar todas las selecciones
  limpiarSeleccion() {
    this.proveedoresSeleccionados = [];
    this.colaEdicion = [];
    this.editandoCola = false;
  }

  // Abrir formulario para registrar
  abrirRegistrar() {
    if (this.proveedoresSeleccionados.length > 0) {
      this.mostrarSnackbar('Limpia la selección antes de registrar', 'error');
      return;
    }
    this.idParaEditar = null;
    this.mostrarFormulario = true;
  }

  // Iniciar edición múltiple
  editarSeleccionados() {
    if (this.proveedoresSeleccionados.length === 0) {
      this.mostrarSnackbar('Selecciona al menos un proveedor', 'error');
      return;
    }

    // Crear cola de edición con copia de los seleccionados
    this.colaEdicion = [...this.proveedoresSeleccionados];
    this.editandoCola = true;
    
    // Abrir el primer proveedor de la cola
    this.editarSiguienteEnCola();
  }

  // Editar el siguiente proveedor en la cola
  editarSiguienteEnCola() {
    if (this.colaEdicion.length === 0) {
      // Terminamos de editar todos
      this.editandoCola = false;
      this.limpiarSeleccion();
      this.mostrarSnackbar('Edición completada', 'success');
      return;
    }

    // Tomar el primero de la cola
    const siguienteProveedor = this.colaEdicion[0];
    this.idParaEditar = siguienteProveedor.id_proveedor;
    this.mostrarFormulario = true;
  }

  // Eliminar seleccionados
  eliminarSeleccionados() {
    if (this.proveedoresSeleccionados.length === 0) {
      this.mostrarSnackbar('Selecciona al menos un proveedor', 'error');
      return;
    }

    const cantidad = this.proveedoresSeleccionados.length;
    const nombres = this.proveedoresSeleccionados.map(p => p.nombre).join(', ');
    
    const confirmar = confirm(
      `¿Estás seguro de eliminar ${cantidad} proveedor(es)?\n\n${nombres}\n\nEsta acción no se puede deshacer.`
    );

    if (confirmar) {
      this.eliminarMultiples();
    }
  }

  // Eliminar múltiples proveedores
  eliminarMultiples() {
    let eliminados = 0;
    const total = this.proveedoresSeleccionados.length;

    this.proveedoresSeleccionados.forEach((proveedor, index) => {
      this.proveedoresService.deleteProveedor(proveedor.id_proveedor).subscribe({
        next: () => {
          eliminados++;
          
          // Si ya eliminamos todos
          if (eliminados === total) {
            this.mostrarSnackbar(`${total} proveedor(es) eliminado(s) correctamente`, 'success');
            this.limpiarSeleccion();
            this.cargarProveedores();
          }
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          this.mostrarSnackbar(`Error al eliminar ${proveedor.nombre}`, 'error');
        }
      });
    });
  }

  // Cerrar formulario y continuar con la cola
  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.idParaEditar = null;
    this.cargarProveedores();

    // Si estamos editando en cola, pasar al siguiente
    if (this.editandoCola && this.colaEdicion.length > 0) {
      // Quitar el que acabamos de editar
      this.colaEdicion.shift();
      
      // Si todavía hay más, editar el siguiente
      if (this.colaEdicion.length > 0) {
        setTimeout(() => {
          this.editarSiguienteEnCola();
        }, 500); // Pequeño delay para mejor UX
      } else {
        // Ya no hay más
        this.editandoCola = false;
        this.limpiarSeleccion();
        this.mostrarSnackbar('Edición completada', 'success');
      }
    }
  }

  // Mostrar notificación snackbar
  mostrarSnackbar(mensaje: string, tipo: 'success' | 'error') {
    this.snackbar = { mostrar: true, mensaje, tipo };
    setTimeout(() => {
      this.snackbar.mostrar = false;
    }, 3000);
  }

  // Clase de punto de categoría
  getDotClass(categoria: string): string {
    const cat = categoria.toLowerCase();
    if (cat === "insumos") return "status-dot status-insumos";
    if (cat === "productos") return "status-dot status-productos";
    if (cat === "insumos/productos") return "status-dot status-mixto";
    return "status-dot status-mixto";
  }

  // Generar color único basado en el nombre
  getColorFromName(nombre: string): string {
    const colors = [
      '#473621ff', '#759cd2ff', '#648063ff', '#bc69bcff', '#d28888ff'
    ];
    
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }
}