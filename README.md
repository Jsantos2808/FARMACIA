# API REST — Inventario y Despacho de Farmacia

Práctica universitaria (Análisis de Sistemas II).
Stack: **Node.js + Express.js + MongoDB Atlas (Mongoose)**.

## Estructura de carpetas

```
Farmacia/
├── config/
│   └── db.js                 # Conexión a MongoDB Atlas
├── models/
│   ├── Medicamento.js        # Esquema del inventario
│   └── Despacho.js           # Esquema del historial
├── controllers/
│   ├── medicamentoController.js
│   └── despachoController.js # Aquí están las reglas de negocio
├── routes/
│   ├── medicamentos.js
│   └── despachos.js
├── .env                      # Credenciales (NO subir a Git)
├── .env.example              # Plantilla de variables
├── .gitignore
├── package.json
└── server.js                 # Punto de entrada
```

## Instalación

```bash
npm install
```

Dependencias: `express`, `mongoose`, `dotenv`, `cors`.

## Configurar MongoDB Atlas

1. Copia `.env.example` a `.env`.
2. En Atlas → **Database** → **Connect** → **Drivers**, copia la URI.
3. En `.env` deja algo así (usuario ya creado: `jsantosa5_db_user`):

```env
PORT=3000
MONGODB_URI=<URI_MONGODB_ELIMINADA>
```

4. En Atlas → **Network Access**, agrega tu IP (o `0.0.0.0/0` para pruebas).

## Ejecutar

```bash
npm start
```

Abre: http://localhost:3000

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/medicamentos` | Registrar medicamento |
| GET | `/api/medicamentos` | Ver inventario |
| POST | `/api/despachos` | Despachar (reglas de negocio) |
| GET | `/api/despachos` | Historial de despachos |

## Ejemplos Postman

### 1. Registrar medicamento (sin receta)

```json
POST http://localhost:3000/api/medicamentos
{
  "codigo": "MED001",
  "nombre": "Paracetamol 500mg",
  "cantidadStock": 20,
  "fechaCaducidad": "2027-12-31",
  "requiereReceta": false,
  "stockMinimo": 5
}
```

### 2. Registrar medicamento controlado

```json
POST http://localhost:3000/api/medicamentos
{
  "codigo": "MED002",
  "nombre": "Tramadol 50mg",
  "cantidadStock": 10,
  "fechaCaducidad": "2027-06-30",
  "requiereReceta": true,
  "stockMinimo": 3
}
```

### 3. Despacho normal

```json
POST http://localhost:3000/api/despachos
{
  "codigo": "MED001",
  "cantidad": 2
}
```

### 4. Despacho con receta

```json
POST http://localhost:3000/api/despachos
{
  "codigo": "MED002",
  "cantidad": 1,
  "recetaEntregada": true
}
```

## Reglas de negocio (dónde se cumplen)

Todas están documentadas en `controllers/despachoController.js`:

1. **Caducidad** — rechaza si `hoy > fechaCaducidad`
2. **Stock insuficiente** — rechaza si `cantidad > cantidadStock`
3. **Medicamentos controlados** — exige `recetaEntregada: true` si `requiereReceta`
4. **Alerta stock mínimo** — incluye `"Alerta: Reabastecimiento necesario"`
5. **Trazabilidad** — crea documento en colección `Despachos`
