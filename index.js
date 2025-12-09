const express = require('express');
const cors = require('cors');
const conection = require("./db");

const app = express();
const PORT = 3000; 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// ========== PROVEEDORES ==========
app.get('/proveedores', (req, res) => {
  const sql = `SELECT * FROM proveedores`;
  conection.query(sql, (err, result) => {
    if (err) {
      console.error('Error al obtener proveedores:', err);
      return res.status(500).json({ mensaje: 'Error al obtener proveedores de la base de datos' });
    }
    res.status(200).json(result);
  });
});

app.get('/proveedores/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM proveedores WHERE id_proveedor = ?`;
  conection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al obtener proveedor por ID:', err);
      return res.status(500).json({ mensaje: 'Error al obtener proveedor' });
    }
    if (result.length === 0) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }
    res.status(200).json(result[0]);
  });
});

app.post('/proveedores', (req, res) => {
  const { nombre, categoria, item, correo, telefono, direccion, contacto } = req.body;
  if (!nombre || !categoria || !correo || !direccion || !contacto) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios para el proveedor' });
  }
  const sql = `INSERT INTO proveedores(nombre, categoria, item, correo, telefono, direccion, contacto, fecha_registro)
               VALUES(?, ?, ?, ?, ?, ?, ?, CURDATE())`;
  conection.query(sql, [nombre, categoria, item, correo, telefono, direccion, contacto], (err, result) => {
    if (err) {
      console.error('Error al crear proveedor:', err);
      return res.status(500).json({ mensaje: 'Error al crear proveedor en la base de datos', error: err.message });
    }
    res.status(201).json({ mensaje: 'Proveedor creado correctamente', id: result.insertId });
  });
});

app.patch('/proveedores/:id', (req, res) => {
  const { id } = req.params;
  const campos = req.body;
  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ mensaje: 'No hay campos para actualizar' });
  }
  const sql = `UPDATE proveedores SET ? WHERE id_proveedor = ?`;
  conection.query(sql, [campos, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar proveedor:', err);
      return res.status(500).json({ mensaje: 'Error al actualizar el proveedor en la base de datos' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado para actualizar' });
    }
    res.status(200).json({ mensaje: `Proveedor con ID ${id} actualizado correctamente` });
  });
});

app.delete('/proveedores/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM proveedores WHERE id_proveedor = ?`;
  conection.query(sql, [id], (err, result) => { 
    if (err) {
      console.error('Error al eliminar proveedor:', err);
      return res.status(500).json({ mensaje: 'Error al eliminar proveedor de la base de datos' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado para eliminar' });
    }
    res.status(200).json({ mensaje: 'Proveedor eliminado correctamente' });
  });
});

// ========== INSUMOS ==========
app.get('/insumos', (req, res) => {
  const sql = `SELECT * FROM insumos`;
  conection.query(sql, (err, result) => {
    if (err) {
      console.error('Error al obtener insumos:', err);
      return res.status(500).json({ mensaje: 'Error al obtener insumos de la base de datos' });
    }
    res.status(200).json(result);
  });
});

app.get('/insumos/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM insumos WHERE id_insumo = ?`;
  conection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al obtener insumo por ID:', err);
      return res.status(500).json({ mensaje: 'Error al obtener insumo' });
    }
    if (result.length === 0) {
      return res.status(404).json({ mensaje: 'Insumo no encontrado' });
    }
    res.status(200).json(result[0]);
  });
});

app.post('/insumos', (req, res) => {
  const { nombre, stock, unidad, proveedor, fecha_caducidad, stock_minimo, precio, categoria } = req.body;
  if (!nombre || !proveedor || !unidad || stock_minimo === undefined || !precio || !categoria) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios para el insumo' });
  }
  const sql = `INSERT INTO insumos(nombre, stock, unidad, proveedor, fecha_caducidad, stock_minimo, precio, categoria, fecha_registro)
               VALUES(?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`;
  conection.query(sql, [nombre, stock || 0, unidad, proveedor, fecha_caducidad, stock_minimo, precio, categoria], (err, result) => {
    if (err) {
      console.error('Error al crear insumo:', err);
      return res.status(500).json({ mensaje: 'Error al crear insumo en la base de datos', error: err.message });
    }
    res.status(201).json({ mensaje: 'Insumo creado correctamente', id: result.insertId });
  });
});

app.patch('/insumos/:id', (req, res) => {
  const { id } = req.params;
  const campos = req.body;
  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ mensaje: 'No hay campos para actualizar' });
  }
  const sql = `UPDATE insumos SET ? WHERE id_insumo = ?`;
  conection.query(sql, [campos, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar insumo:', err);
      return res.status(500).json({ mensaje: 'Error al actualizar el insumo en la base de datos' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Insumo no encontrado para actualizar' });
    }
    res.status(200).json({ mensaje: `Insumo con ID ${id} actualizado correctamente` });
  });
});

app.delete('/insumos/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM insumos WHERE id_insumo = ?`;
  conection.query(sql, [id], (err, result) => { 
    if (err) {
      console.error('Error al eliminar insumo:', err);
      return res.status(500).json({ mensaje: 'Error al eliminar insumo de la base de datos' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Insumo no encontrado para eliminar' });
    }
    res.status(200).json({ mensaje: 'Insumo eliminado correctamente' });
  });
});

// ========== PEDIDOS ==========
app.get('/pedidos', (req, res) => {
  const sql = `SELECT * FROM pedidos ORDER BY fecha_pedido DESC`;
  conection.query(sql, (err, result) => {
    if (err) {
      console.error('Error al obtener pedidos:', err);
      return res.status(500).json({ mensaje: 'Error al obtener pedidos de la base de datos' });
    }
    res.status(200).json(result);
  });
});

app.get('/pedidos/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM pedidos WHERE id_pedido = ?`;
  conection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al obtener pedido por ID:', err);
      return res.status(500).json({ mensaje: 'Error al obtener pedido' });
    }
    if (result.length === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    res.status(200).json(result[0]);
  });
});

app.post('/pedidos', (req, res) => {
  const { proveedor, item, cantidad, unidad, tipo, precio, fecha_llegada } = req.body;
  if (!proveedor || !item || !cantidad || !unidad || tipo === undefined || !precio) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios para el pedido' });
  }
  const sql = `INSERT INTO pedidos(proveedor, item, cantidad, unidad, tipo, precio, fecha_pedido, fecha_llegada, estado)
               VALUES(?, ?, ?, ?, ?, ?, CURDATE(), ?, 'pendiente')`;
  conection.query(sql, [proveedor, item, cantidad, unidad, tipo, precio, fecha_llegada], (err, result) => {
    if (err) {
      console.error('Error al crear pedido:', err);
      return res.status(500).json({ mensaje: 'Error al crear pedido en la base de datos', error: err.message });
    }
    res.status(201).json({ mensaje: 'Pedido creado correctamente', id: result.insertId });
  });
});

app.patch('/pedidos/:id/estado', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  if (!estado || !['pendiente', 'entregado', 'cancelado'].includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado inválido' });
  }
  
  const getPedido = `SELECT * FROM pedidos WHERE id_pedido = ?`;
  conection.query(getPedido, [id], (err, pedido) => {
    if (err || pedido.length === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    
    const { item, cantidad, estado: estadoActual } = pedido[0];
    
    const updatePedido = `UPDATE pedidos SET estado = ? WHERE id_pedido = ?`;
    conection.query(updatePedido, [estado, id], (err) => {
      if (err) {
        return res.status(500).json({ mensaje: 'Error al actualizar pedido' });
      }
      
      if (estado === 'entregado' && estadoActual !== 'entregado') {
        const updateStock = `UPDATE insumos SET stock = stock + ? WHERE nombre = ?`;
        conection.query(updateStock, [cantidad, item], (err) => {
          if (err) {
            return res.status(500).json({ mensaje: 'Error al actualizar stock del insumo' });
          }
          res.status(200).json({ mensaje: 'Pedido entregado y stock actualizado correctamente' });
        });
      } else {
        res.status(200).json({ mensaje: 'Estado del pedido actualizado correctamente' });
      }
    });
  });
});

app.patch('/pedidos/:id', (req, res) => {
  const { id } = req.params;
  const campos = req.body;
  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ mensaje: 'No hay campos para actualizar' });
  }
  const sql = `UPDATE pedidos SET ? WHERE id_pedido = ?`;
  conection.query(sql, [campos, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar pedido:', err);
      return res.status(500).json({ mensaje: 'Error al actualizar el pedido en la base de datos' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado para actualizar' });
    }
    res.status(200).json({ mensaje: `Pedido con ID ${id} actualizado correctamente` });
  });
});

app.delete('/pedidos/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM pedidos WHERE id_pedido = ?`;
  conection.query(sql, [id], (err, result) => { 
    if (err) {
      console.error('Error al eliminar pedido:', err);
      return res.status(500).json({ mensaje: 'Error al eliminar pedido de la base de datos' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado para eliminar' });
    }
    res.status(200).json({ mensaje: 'Pedido eliminado correctamente' });
  });
});

// ========== ALERTAS ==========
app.get('/alertas/resumen', (req, res) => {
  conection.query('SELECT COUNT(*) as total FROM alerta_stock_bajo', (err1, stockBajo) => {
    conection.query('SELECT COUNT(*) as total FROM alerta_sin_stock', (err2, sinStock) => {
      conection.query('SELECT COUNT(*) as total FROM alerta_por_caducar', (err3, porCaducar) => {
        conection.query('SELECT COUNT(*) as total FROM alerta_caducados', (err4, caducados) => {
          if (err1 || err2 || err3 || err4) {
            return res.status(500).json({ error: 'Error al obtener resumen de alertas' });
          }
          res.json({
            stock_bajo: stockBajo[0].total,
            sin_stock: sinStock[0].total,
            por_caducar: porCaducar[0].total,
            caducados: caducados[0].total
          });
        });
      });
    });
  });
});

app.get('/alertas/stock-bajo', (req, res) => {
  const sql = 'SELECT * FROM alerta_stock_bajo ORDER BY stock ASC';
  conection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.get('/alertas/sin-stock', (req, res) => {
  const sql = 'SELECT * FROM alerta_sin_stock';
  conection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.get('/alertas/por-caducar', (req, res) => {
  const sql = 'SELECT * FROM alerta_por_caducar ORDER BY fecha_caducidad ASC';
  conection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.get('/alertas/caducados', (req, res) => {
  const sql = 'SELECT * FROM alerta_caducados ORDER BY fecha_caducidad DESC';
  conection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});




// Obtener todos los productos con disponibilidad
app.get('/productos', (req, res) => {
  const sql = `SELECT * FROM productos_disponibilidad ORDER BY nombre`;
  conection.query(sql, (err, result) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).json({ mensaje: 'Error al obtener productos de la base de datos' });
    }
    res.status(200).json(result);
  });
});

// Obtener un producto por ID con su receta completa
app.get('/productos/:id', (req, res) => {
  const { id } = req.params;
  
  // Obtener info del producto
  const sqlProducto = `SELECT * FROM productos WHERE id_producto = ?`;
  conection.query(sqlProducto, [id], (err, producto) => {
    if (err) {
      console.error('Error al obtener producto:', err);
      return res.status(500).json({ mensaje: 'Error al obtener producto' });
    }
    if (producto.length === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // Obtener receta con disponibilidad
    const sqlReceta = `
      SELECT 
        r.nombre_insumo,
        r.cantidad_necesaria,
        r.unidad,
        i.stock as stock_disponible,
        FLOOR(i.stock / r.cantidad_necesaria) as unidades_posibles
      FROM recetas r
      JOIN insumos i ON r.nombre_insumo = i.nombre
      WHERE r.id_producto = ?
    `;
    
    conection.query(sqlReceta, [id], (err, receta) => {
      if (err) {
        console.error('Error al obtener receta:', err);
        return res.status(500).json({ mensaje: 'Error al obtener receta' });
      }
      
      // Calcular unidades totales disponibles (limitado por el ingrediente con menos stock)
      const unidadesDisponibles = receta.length > 0 
        ? Math.min(...receta.map(r => r.unidades_posibles))
        : 0;
      
      res.status(200).json({
        ...producto[0],
        receta: receta,
        unidades_disponibles: unidadesDisponibles,
        estado_stock: unidadesDisponibles === 0 ? 'sin-stock' : 
                      unidadesDisponibles <= 5 ? 'stock-bajo' : 'stock-ok'
      });
    });
  });
});

// Crear producto
app.post('/productos', (req, res) => {
  const { nombre, categoria, precio, descripcion, imagen } = req.body;
  
  if (!nombre || !categoria || !precio) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
  }
  
  const sql = `INSERT INTO productos(nombre, categoria, precio, descripcion, imagen, fecha_registro)
               VALUES(?, ?, ?, ?, ?, CURDATE())`;
  
  conection.query(sql, [nombre, categoria, precio, descripcion, imagen], (err, result) => {
    if (err) {
      console.error('Error al crear producto:', err);
      return res.status(500).json({ mensaje: 'Error al crear producto', error: err.message });
    }
    res.status(201).json({ mensaje: 'Producto creado correctamente', id: result.insertId });
  });
});

// Actualizar producto
app.patch('/productos/:id', (req, res) => {
  const { id } = req.params;
  const campos = req.body;
  
  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ mensaje: 'No hay campos para actualizar' });
  }
  
  const sql = `UPDATE productos SET ? WHERE id_producto = ?`;
  conection.query(sql, [campos, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar producto:', err);
      return res.status(500).json({ mensaje: 'Error al actualizar producto' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.status(200).json({ mensaje: 'Producto actualizado correctamente' });
  });
});

// Eliminar producto
app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM productos WHERE id_producto = ?`;
  
  conection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar producto:', err);
      return res.status(500).json({ mensaje: 'Error al eliminar producto' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
  });
});

// ========== RECETAS ==========

// Agregar ingrediente a receta
app.post('/recetas', (req, res) => {
  const { id_producto, nombre_insumo, cantidad_necesaria, unidad } = req.body;
  
  if (!id_producto || !nombre_insumo || !cantidad_necesaria || !unidad) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
  }
  
  const sql = `INSERT INTO recetas(id_producto, nombre_insumo, cantidad_necesaria, unidad)
               VALUES(?, ?, ?, ?)`;
  
  conection.query(sql, [id_producto, nombre_insumo, cantidad_necesaria, unidad], (err, result) => {
    if (err) {
      console.error('Error al agregar ingrediente:', err);
      return res.status(500).json({ mensaje: 'Error al agregar ingrediente', error: err.message });
    }
    res.status(201).json({ mensaje: 'Ingrediente agregado a la receta', id: result.insertId });
  });
});

// Obtener receta de un producto
app.get('/recetas/:id_producto', (req, res) => {
  const { id_producto } = req.params;
  
  const sql = `
    SELECT 
      r.*,
      i.stock as stock_disponible,
      FLOOR(i.stock / r.cantidad_necesaria) as unidades_posibles
    FROM recetas r
    JOIN insumos i ON r.nombre_insumo = i.nombre
    WHERE r.id_producto = ?
  `;
  
  conection.query(sql, [id_producto], (err, result) => {
    if (err) {
      console.error('Error al obtener receta:', err);
      return res.status(500).json({ mensaje: 'Error al obtener receta' });
    }
    res.status(200).json(result);
  });
});

// Actualizar ingrediente de receta
app.patch('/recetas/:id', (req, res) => {
  const { id } = req.params;
  const { cantidad_necesaria, unidad } = req.body;
  
  const campos = {};
  if (cantidad_necesaria) campos.cantidad_necesaria = cantidad_necesaria;
  if (unidad) campos.unidad = unidad;
  
  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ mensaje: 'No hay campos para actualizar' });
  }
  
  const sql = `UPDATE recetas SET ? WHERE id_receta = ?`;
  conection.query(sql, [campos, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar receta:', err);
      return res.status(500).json({ mensaje: 'Error al actualizar receta' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Ingrediente no encontrado' });
    }
    res.status(200).json({ mensaje: 'Ingrediente actualizado correctamente' });
  });
});

// Eliminar ingrediente de receta
app.delete('/recetas/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM recetas WHERE id_receta = ?`;
  
  conection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar ingrediente:', err);
      return res.status(500).json({ mensaje: 'Error al eliminar ingrediente' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Ingrediente no encontrado' });
    }
    res.status(200).json({ mensaje: 'Ingrediente eliminado correctamente' });
  });
});


// ========== AUTENTICACIÓN SIMPLE ==========

// POST /api/auth/login - Iniciar sesión
app.post('/api/auth/login', (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ mensaje: 'Usuario y contraseña son obligatorios' });
  }

  // Buscar usuario en la base de datos
  const sql = 'SELECT * FROM usuarios WHERE usuario = ?';
  conection.query(sql, [usuario], (err, result) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    if (result.length === 0) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
    }

    const user = result[0];

    // Verificar contraseña (SHA2 desde MySQL)
    const crypto = require('crypto');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    if (passwordHash !== user.password) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
    }

    // Login exitoso - devolver datos del usuario
    res.status(200).json({
      mensaje: 'Login exitoso',
      usuario: {
        id: user.id_usuario,
        usuario: user.usuario,
        rol: user.rol
      }
    });
  });
});


// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de Inventario activa y funcionando.");
});

app.listen(PORT, () => {
  console.log('Servidor en http://localhost:3000');
});