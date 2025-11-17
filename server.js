const express = require("express");
const app = express();
const port = process.env.PORT || 3000; // Obligatorio para Render

// Middleware para recibir JSON
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
    res.send("Servidor funcionando correctamente!");
});

// Ruta POST
app.post("/or", (req, res) => {
    try {
        const pedidos = req.body;

        const fechaHoy = new Date();
        const dia = fechaHoy.getDate();
        const mes = fechaHoy.getMonth();
        const anio = fechaHoy.getFullYear();

        // Filtrar pedidos solo del día de hoy
        const pedidosHoy = pedidos.filter(p => {
            const fechaPedido = new Date(p.fecha);
            return fechaPedido.getDate() === dia &&
                fechaPedido.getMonth() === mes &&
                fechaPedido.getFullYear() === anio;
        });

        let costoTotalDia = 0;
        const productosEstadisticas = {};

        const pedidosProcesados = pedidosHoy.map((p, index) => {
            const productosObj = JSON.parse(p.productos);

            // Total de productos por pedido
            const totalProductos = Object.values(productosObj).reduce((a, b) => a + b, 0);

            // Acumular estadísticas de productos
            costoTotalDia += p.costo;
            for (const [nombre, cantidad] of Object.entries(productosObj)) {
                if (!productosEstadisticas[nombre]) productosEstadisticas[nombre] = 0;
                productosEstadisticas[nombre] += cantidad;
            }

            // Generar pedidosString (todos los productos y cantidades como string)
            const pedidosString = Object.entries(productosObj)
                .map(([nombre, cantidad]) => `${nombre}: ${cantidad}`)
                .join(", ");

            const fechaObj = new Date(p.fecha);

            return {
                idPedido: index + 1,
                restaurante: p.restaurante,
                costo: p.costo,
                fechaOriginal: p.fecha,
                fechaISO: fechaObj.toISOString(),
                hora: fechaObj.toLocaleTimeString(),
                diaSemana: fechaObj.toLocaleDateString("es-ES", { weekday: "long" }),
                productos: productosObj,
                pedidosString: pedidosString,
                totalProductos: totalProductos,
                ubicacionCliente: p.ubicacion
            };
        });

        // Ordenar por fecha más reciente
        pedidosProcesados.sort((a, b) => new Date(b.fechaISO) - new Date(a.fechaISO));

        res.json({
            estado: "OK",
            fecha: fechaHoy.toLocaleDateString(),
            cantidadPedidosHoy: pedidosProcesados.length,
            costoTotalDia,
            productosEstadisticas,
            pedidos: pedidosProcesados
        });

    } catch (error) {
        console.error("Error procesando pedidos:", error);
        res.status(500).json({ error: "Error procesando pedidos" });
    }
});



// Levantar servidor local
app.listen(port, () => {
    console.log("Servidor corriendo en http://0.0.0.0:3000");
});
