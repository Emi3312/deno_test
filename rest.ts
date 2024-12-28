import { Application, Router, Context } from "https://deno.land/x/oak@v12.5.0/mod.ts";

// Datos simulados (como si fuera una base de datos en memoria)
interface User {
    id: number;
    name: string;
    email: string;
}

let users: User[] = [
    { id: 1, name: "Juan Pérez", email: "juan@example.com" },
    { id: 2, name: "María López", email: "maria@example.com" },
];

// Crear el enrutador
const router = new Router();

// Rutas
router
    .get("/", (context) => {
        context.response.body = "¡Bienvenido a la API con Oak!";
    })
    .get("/users", (context) => {
        context.response.body = users;
    })
    .get("/users/:id", (context) => {
        const id = Number(context.params.id);
        const user = users.find((u) => u.id === id);
        if (user) {
            context.response.body = user;
        } else {
            context.response.status = 404;
            context.response.body = { error: "Usuario no encontrado" };
        }
    })
    .post("/users", async (context) => {
        const body = await context.request.body();
        if (body.type === "json") {
            const newUser: User = await body.value;
            newUser.id = users.length + 1;
            users.push(newUser);
            context.response.status = 201;
            context.response.body = newUser;
        } else {
            context.response.status = 400;
            context.response.body = { error: "Datos inválidos" };
        }
    })
    .put("/users/:id", async (context) => {
        const id = Number(context.params.id);
        const body = await context.request.body();
        if (body.type === "json") {
            const updatedUser: Partial<User> = await body.value;
            const index = users.findIndex((u) => u.id === id);
            if (index !== -1) {
                users[index] = { ...users[index], ...updatedUser };
                context.response.body = users[index];
            } else {
                context.response.status = 404;
                context.response.body = { error: "Usuario no encontrado" };
            }
        } else {
            context.response.status = 400;
            context.response.body = { error: "Datos inválidos" };
        }
    })
    .delete("/users/:id", (context) => {
        const id = Number(context.params.id);
        const index = users.findIndex((u) => u.id === id);
        if (index !== -1) {
            const deletedUser = users.splice(index, 1);
            context.response.body = deletedUser[0];
        } else {
            context.response.status = 404;
            context.response.body = { error: "Usuario no encontrado" };
        }
    });

// Middleware para manejar errores
const errorHandler = async (context: Context, next: () => Promise<unknown>) => {
    try {
        await next();
    } catch (err) {
        context.response.status = 500;
        context.response.body = { error: "Error interno del servidor" };
        console.error("Error:", err);
    }
};

// Crear la aplicación
const app = new Application();

// Middleware
app.use(errorHandler); // Manejo de errores
app.use(router.routes()); // Rutas
app.use(router.allowedMethods()); // Métodos permitidos

// Configurar el puerto
const PORT = Deno.env.get("PORT") ? Number(Deno.env.get("PORT")) : 8000;
console.log(`Servidor escuchando en http://localhost:${PORT}`);
await app.listen({ port: PORT });
