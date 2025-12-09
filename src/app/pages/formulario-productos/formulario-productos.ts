import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductosService, Producto, Receta } from '../../services/productos-service';
import { Insumo } from '../../services/insumos-service';

@Component({
  selector: 'app-formulario-productos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './formulario-productos.html',
  styleUrl: './formulario-productos.scss'
})
export class FormularioProductos implements OnInit {
  @Input() idEditar?: number;
  @Input() insumos: Insumo[] = [];
  @Output() cerrar = new EventEmitter<void>();

  esModoEdicion = false;
  producto: Producto = {
    nombre: '',
    categoria: 'bebidas',
    precio: 0,
    descripcion: '',
    imagen: ''
  };

  // Receta (ingredientes)
  receta: Receta[] = [];
  nuevoIngrediente = {
    nombre_insumo: '',
    cantidad_necesaria: 0,
    unidad: 'kg'
  };

  constructor(private productosService: ProductosService) {}

  ngOnInit() {
    if (this.idEditar) {
      this.esModoEdicion = true;
      this.cargarProducto();
    }
  }

  cargarProducto() {
    this.productosService.getProductoById(this.idEditar!).subscribe({
      next: (data) => {
        this.producto = {
          id_producto: data.id_producto,
          nombre: data.nombre,
          categoria: data.categoria,
          precio: data.precio,
          descripcion: data.descripcion || '',
          imagen: data.imagen || ''
        };
        
        // Cargar receta
        if (data.receta) {
          this.receta = data.receta?.map(r => ({
          id_receta: r.id_receta,  // ← importante que tenga el ID
          id_producto: this.idEditar!,
          nombre_insumo: r.nombre_insumo,
          cantidad_necesaria: r.cantidad_necesaria,
          unidad: r.unidad,
          stock_disponible: r.stock_disponible,
          unidades_posibles: r.unidades_posibles 
          }));
        }
      },
      error: (err) => {
        console.error('Error al cargar producto:', err);
        alert('Error al cargar el producto');
      }
    });
  }

  agregarIngrediente() {
    if (!this.nuevoIngrediente.nombre_insumo || this.nuevoIngrediente.cantidad_necesaria <= 0) {
      alert('Completa los datos del ingrediente');
      return;
    }

    // Verificar que no esté duplicado
    const existe = this.receta.some(r => r.nombre_insumo === this.nuevoIngrediente.nombre_insumo);
    if (existe) {
      alert('Este ingrediente ya está en la receta');
      return;
    }

    // Obtener unidad del insumo
    const insumo = this.insumos.find(i => i.nombre === this.nuevoIngrediente.nombre_insumo);
    const unidad = insumo ? insumo.unidad : 'kg';

    this.receta.push({
      id_producto: this.idEditar || 0,
      nombre_insumo: this.nuevoIngrediente.nombre_insumo,
      cantidad_necesaria: this.nuevoIngrediente.cantidad_necesaria,
      unidad: unidad
    });

    // Limpiar formulario
    this.nuevoIngrediente = {
      nombre_insumo: '',
      cantidad_necesaria: 0,
      unidad: 'kg'
    };
  }

  eliminarIngrediente(index: number) {
    this.receta.splice(index, 1);
  }

  esURL(texto: string | undefined): boolean {
    if (!texto) return false;
    return texto.startsWith('http://') || texto.startsWith('https://');
  }

  errorImagen() {
    alert('No se pudo cargar la imagen. Verifica que la URL sea correcta.');
  }

  guardar() {
    if (!this.producto.nombre || !this.producto.precio) {
      alert('Completa los campos obligatorios');
      return;
    }

    if (this.receta.length === 0) {
      alert('Agrega al menos un ingrediente a la receta');
      return;
    }

    if (this.esModoEdicion) {
      this.actualizarProducto();
    } else {
      this.crearProducto();
    }
  }

  crearProducto() {
  this.productosService.createProducto(this.producto).subscribe({
    next: (response) => {
      const productoId = response.id;
      this.guardarReceta(productoId);
    },
    error: (err) => {
      alert(`Error al crear: ${err.error?.mensaje || err.message}`);
    }
  });
}

actualizarProducto() {
  this.productosService.updateProducto(this.idEditar!, this.producto).subscribe({
    next: () => {
      this.guardarReceta(this.idEditar!); // Ahora sí funciona perfecto
    },
    error: (err) => {
      alert(`Error al actualizar: ${err.error?.mensaje || err.message}`);
    }
  });
}

  private guardarReceta(productoId: number) {
  // Paso 1: Obtener la receta actual de la BD (para borrar los viejos)
  this.productosService.getReceta(productoId).subscribe({
    next: (recetaActual) => {
      // Paso 2: Borrar todos los ingredientes existentes
      const deletes = recetaActual.map(r =>
        this.productosService.deleteIngrediente(r.id_receta!).toPromise()
      );

      // Esperar a que se borren todos
      Promise.all(deletes).then(() => {
        // Paso 3: Crear todos los ingredientes desde cero
        const adds = this.receta.map(ing => {
          const nuevo = {
            id_producto: productoId,
            nombre_insumo: ing.nombre_insumo,
            cantidad_necesaria: ing.cantidad_necesaria,
            unidad: ing.unidad
          };
          return this.productosService.addIngrediente(nuevo).toPromise();
        });

        Promise.all(adds).then(() => {
          alert('Producto y receta guardados correctamente');
          this.cerrar.emit();
        }).catch(err => {
          console.error('Error al recrear receta:', err);
          alert('Error al guardar la receta');
        });
      }).catch(err => {
        console.error('Error al borrar receta antigua:', err);
      });
    },
    error: (err) => {
      console.error('Error al cargar receta actual:', err);
      alert('Error al actualizar receta');
    }
  });
}

  cancelar() {
    this.cerrar.emit();
  }

  actualizarUnidad() {
    // Actualizar unidad según el insumo seleccionado
    const insumo = this.insumos.find(i => i.nombre === this.nuevoIngrediente.nombre_insumo);
    if (insumo) {
      this.nuevoIngrediente.unidad = insumo.unidad;
    }
  }
}