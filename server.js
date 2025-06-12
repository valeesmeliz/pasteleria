// Importar frameworks necesarios para ejecutar la app

const express = require('express'); //SW
const mongoose = require('mongoose'); //mongoDB
const bodyParser = require('body-parser'); //json
const cors = require('cors'); //permitir solicitudes
const bcrypt = require('bcrypt'); //incriptar contraseñas

//Crear una instancia de la app express 
const app = express();
//Definir el puerto donde se ejecutará el servidor
const PORT = process.env.PORT || 3000; // Usa el puerto que asigne Railway o Local 3000

//habilitar cors para permitir peticiones
app.use(cors());
//sentencia que permite a express entienda el formato json
app.use(bodyParser.json());

//detectar archivos estaticos de la carpeta public
app.use(express.static('public'));

//conexion a mongoDB atlas usando variable de entorno 
mongoose.connect(process.env.MONGODB_URI,{ 
    useNewUrlParser: true, //usa el parser del url
    useUnifiedTopology: true //motor de monitoreo 
})

//si la conexion es exitosa , muestra mensaje 
.then(() => console.log('conectando a mongoDB atlas'))
//si hay un error en la conexion, muestra mensaje
.catch(err => console.error('error de conexión', err));

//esquemas y modelos 

//define el esquema para los usuarios 
const UsuarioSchema=new mongoose.Schema({
    nombre:String,
    email:String,
    password:String
});
//Crear el modelo usuario basado en el esquema anterior 
const Usuario=mongoose.model('Usuario', UsuarioSchema);

//Definir esquema de pasteles 
const PastelSchema =new mongoose.Schema({
    nombre:String,
    precio:Number
});
const Pastel= mongoose.model('Pastel', PastelSchema);

//Definir esquema de empleados
const EmpleadoSchema = new mongoose.Schema({
    nombre:String,
    rol:String
});
 const Empleado = mongoose.model('Empleado', EmpleadoSchema);

 //Definir esquema pedidos
const PedidoSchema = new mongoose.Schema({
    nombre:String,
    producto:String
});
const Pedido = mongoose.model('Pedido', PedidoSchema);

//Rutas de autenticación
app.post ('/registro', async(req, res)=>{
    //extrae el email y el password}
    const{nombre,email,password}=req.body;
    //Encripta la contraseña
    const hashedPassword=await bcrypt.hash(password,10);
    //Crea un nuevo usuario con datos recibidos
    const nuevoUsuario=new Usuario({nombre,email,password:hashedPassword});
    //Guarda el usuario en la base
    await nuevoUsuario.save();
    //Responde con un mensaje de exito
    res.status(201).send('Usuario registrado');
});

//ruta para iniciar sesión
app.post('/login', async(req, res)=>{
    //extrae el email y el password del cuerpo de la solicitud
    const {email, password} = req.body; 
    //Busca el usuario por el email dado
    const usuario = await Usuario.findOne({email});
    //si no existe el usuario, responde con un error
    if(!usuario)return res.status(401).send('Usuario no encontrado');
    //Compara la contraseña proporcionada 
    const valid = await bcrypt.compare(password, usuario.password);
    //si la contraseña no es valida responde con error 401 
    if(!valid)return res.status(401).send('Contraseña incorrecta');
    //si todo es correcto, responde con un mensaje de exito
    res.send('Bienvenido ' + usuario.nombre);
});

//CRUD de pasteles
//ruta para todos los pasteles
app.get('/api/pasteles', async (req, res) => {
    //busca todos los pasteles en la base de datos
    const pasteles = await Pastel.find();
    //devuelve la lista de pasteles en formato JSON
    res.json(pasteles);
});

//Crear un nuevo pastel
app.post('/api/pasteles', async (req, res) => {
    //Crea un nuevo pastel
    const nuevo = new Pastel(req.body);
    //Guarda el pastel en la base de datos
    await nuevo.save();
    //Responde con un mensaje de éxito
    res.status(201).send('Pastel creado');
});

//Eliminar el pastel por id
app.delete('/api/pasteles/:id', async (req, res) => {
    //elimina el pastel por id
    await Pastel.findByIdAndDelete(req.params.id);
    //responde con un mensaje de éxito
    res.send('Pastel eliminado');
});

//CRUD de empleados
app.get('/api/empleados', async (req, res) => {
    //busca todos los empleados en la base de datos
    const empleados = await Empleado.find();
    //devuelve la lista de empleados en formato JSON
    res.json(empleados);
});

//Crear un nuevo empleado
app.post('/api/empleados', async (req, res) => {
    //Crea un nuevo empleado
    const nuevo = new Empleado(req.body);
    //Guarda el empleado en la base de datos
    await nuevo.save();
    //Responde con un mensaje de éxito
    res.status(201).send('Empleado creado');
});

//Eliminar el empleado por id
app.delete('/api/empleados/:id', async (req, res) => {
    //elimina el empleado por id
    await Empleado.findByIdAndDelete(req.params.id);
    //responde con un mensaje de éxito
    res.send('Empleado eliminado');
});


//Ruta para obtener todos los pedidos 
app.get('/api/pedidos' , async(req, res) => { 
//Busca todos los pedidos en la base de datos
const pedidos=await Pedido.find();
//Devuelve la lista de pedidos en formato JSON
res.json(pedidos);    
});

//Ruta para crear un nuevo pedido
   app.post('/api/pedidos', async (req,res)=> {
    //Crea un nuevo pedido  con los datos recibidos en la seleccion
   const nuevo =new Pedido (req.body);
   //guarda el pedido en la base de datos
   await nuevo.save();
   //responde con un mensaje de exito y codigo 201 (creado)
   res.status(201).send('Pedido creado');
});

//Ruta eliminar un pedido por  su Id
app.delete('/api/pedidos/:id' , async (req,res) => {
    //eliminar el pedido cuyo id se recibe
    await Pedido.findByIdAndDelete(req.params.id);
    //responde con un mensaje de exito
    res.send('Pedido eliminado');
});


//Iniciar servidor 

//Inicia el servidor y lo pone a eschucar en el puerto definido
app.listen(PORT, () => {
    // Muestra en consola la URL esta corriendo el servidor
    console.log(`Servicio escuchando en http://localhost:${PORT}`);
} );
