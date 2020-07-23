
var audio = new Audio('../music/nyanmusic.mp3'); //musica de fondo
audio.addEventListener('ended', function() {
	this.currentTime = 0;
	this.play();
}, false);

var pxl=40; //pixeles
var columnas= Math.round(window.innerWidth/56), //columnas 
filas= Math.round(window.innerHeight/60); //filas

//El personaje puede variar entre ash o misty. Por default es Ash.
var ASH= 0, 
MISTY=1, 
PERSONAJE=ASH; 

var EMPTY= 2, POKEBOLA= 3;
 //El equipo Rocket
var JESSIE= 4, JAMES=5, MEOWTH=6;
 //Variables de los pokemones
var POKE=7, POKE2=8, POKE3=9, POKE4=10, POKE5=11;
 // direccion
var IZQ=0, ARRIBA=1, DER=2, ABAJO=3, 

//teclas
tecla_izquierda=37, tecla_arriba=38, 
tecla_derecha=39, tecla_abajo=40, 
P = 80, Z= 90, S=83, ENTER=13, disabled=13;

var pausa= false, //Si esta o no en pausa
atrapados= 0, //POKEMONES ATRAPADOS
cant= 4, //cantidad necesaria de pokemones para subir de nivel
aux=1,
vel, //velocidad
py= 1, //equipo rocket en el eje y
niv= 1, //nivel actual
inicio=0, //Si el usuario apreto enter para iniciar = 1
nivel_anterior= 1, //llevo cuenta del nivel anterior
puntaje= 0, // puntaje
canvas, // Canvas de HTML 
ctx, // CanvasRenderingContext2d 
tecla, // El objeto usado para inputs por teclado 
cuadros, // Numero de cuadros para animacion 
puntaje, //Numero para el puntaje 
PuntajeMaximo = 0; //puntaje mas alto

grilla= {
	width: null,  // numero de columnas
	height: null, // numero de filas
	grilla: null,  // Array para representar data 
	init: function(n, c, f) { //N numero para llenar, C numero de columnas, F numero de filas
		this.width = c;
		this.height = f;
		this.grilla = [];
		for (var x=0; x < c; x++) {
			this.grilla.push([]); //canvas 
			for (var y=0; y < f; y++) {
				this.grilla[x].push(n);
			}
		}
	},
	//setear un valor val en la posicion(x,y)
	set: function(val, x, y) {
		this.grilla[x][y] = val;
	},
	//Obtener el numero en la posicion(x,y)
	get: function(x, y) {
		return this.grilla[x][y];
	}
}

snake= {
	direction: null, // direccion
	last: null,		 // Objeto que apunta al ultimo elemento del queue de las pokebolas
	queue: null,	 // Array
	// Borrar la cola y establece la posición de inicio y la dirección
	init: function(d, x, y) {
		this.direction = d;
		this.queue = [];
		this.insert(x, y);
	},
	// Agregar elementos a la cola
	insert: function(x, y) {
		this.queue.unshift({x:x, y:y}); // unshift agrega elementos al inicio de un array
		this.last = this.queue[0];
	},

	// borra y devuelve el primer elemento de la cola
	remove: function() {
		return this.queue.pop(); // pop elimina el ultimo elemento de un array y lo devuelve
	}
};

//------------------- COMIENZO DEL JUEGO ---------------------------

function init() {
	atrapados = 0;
	vel= 10;
	grilla.init(EMPTY, columnas, filas);
	var sp = {x:Math.floor(columnas/2), y:filas-1};
	snake.init(ARRIBA, sp.x, sp.y);
	grilla.set(PERSONAJE, sp.x, sp.y);
	for(var i=0;i<(niv-1)*2;i++){
		ponerObstaculo();
	}
	ponerComida();
}

function main() {
	body_style = "background-image:url('../images/gameExtras/route01.png');background-repeat:repeat;background-size: 100%;"
	document.getElementById("body").style= body_style;
	inicio = 1;
	cuadros = 0;
	PorTeclado();
	init();
	draw();
	getReady();	
}


function loop() {
	if(inicio === 0){
		return main();		
	}else if(inicio === 2){
		if(aux==1){ //cuando vuelve a empezar
			if(tecla[ENTER]){
				disabled=13;
				aux = 2;
				audio.pause();
				audio = new Audio('../music/nyanmusic.mp3');
				audio.addEventListener('ended', function() {
					this.currentTime = 0;
					this.play();
				}, false);
				audio.play();
				body_style = "background-image:url('../images/gameExtras/init.gif');background-repeat:no-repeat;background-size: 75%;background-attachment: fixed;background-position: center;"
				document.getElementById("body").style= body_style;
				document.body.removeChild(canvas);
				document.deleteElement("canvas");
				delete tecla[ENTER];
			}
		}else if (aux ==2){ 
				puntaje= 0;
				niv= 1;
				nivel_anterior = 1;
				py=1;
				cant= 4;
				return main();
		}
	}else{
		draw();
	}
	//cuando se pierde
	if(vel===0){ 
		audio.pause();
		audio = new Audio('../music/TurnDown.mp3');
		audio.addEventListener('ended', function() {
			this.currentTime = 0;
			this.play();
		}, false);
		audio.play();
		return auxiliar();
	}
	update();
	if (niv == nivel_anterior) {
		window.requestAnimationFrame(loop, canvas); //Para la animacion
	} else {
		intersticial();
	}
	if(pausa){
		menuPausa();
	}
}

function update() {
	if (tecla[P]){ //si apreto la letra P se pone en pausa
		pausa = !pausa;
		delete tecla[P];
	}

	if(!pausa){
		audio.play();
		cuadros++; //aumento un frame
		// Cambio la direccion con las flechas
		if (tecla[tecla_izquierda] && snake.direction !== DER) {
			snake.direction = IZQ;
		}
		if (tecla[tecla_arriba] && snake.direction !== ABAJO) {
			snake.direction = ARRIBA;
		}
		if (tecla[tecla_derecha] && snake.direction !== IZQ) {
			snake.direction = DER;
		}
		if (tecla[tecla_abajo] && snake.direction !== ARRIBA) {
			snake.direction = ABAJO;
		}
		if (tecla[Z]){
			subirNivel();
		}

		if (cuadros%vel === 0) { //pinto cada x cuadros, x toma el valor de la velocidad
			//El ultimo elemento de la cola de la serpiente (la cabeza)
			var nx= snake.last.x;
			var ny= snake.last.y;
			if(snake.direction == IZQ || snake.direction == DER||snake.direction == ABAJO || snake.direction == ARRIBA){
				grilla.set(POKEBOLA, nx, ny);
			}

			//cambio la posicion por la direccion de la serpiente
			switch (snake.direction) {
				case IZQ:
					nx--;
					break;
				case ARRIBA:
					ny--;
					break;
				case DER:
					nx++;
					break;
				case ABAJO:
					ny++;
					break;
			}
			//Para atravesar las paredes
			if (0>nx){
				nx=grilla.width-1;
			}
			if (nx > grilla.width-1){
				nx = 0;
			}
			if(0 > ny){
				ny=grilla.height-1;
			}
			if(ny>grilla.height-1){
				ny=0;
			}

			//Se pierde el juego cuando
			if (grilla.get(nx, ny) === POKEBOLA){
				puntaje= 0;
				niv= 1;
				nivel_anterior= 1
				py=1;
				cant= 4;
				return init();
			}
			if (grilla.get(nx, ny) === JESSIE||grilla.get(nx, ny) === JAMES||grilla.get(nx, ny) === MEOWTH){
				vel= 0;
			}
			//revisar si la nueva posicion esta en la posicion de un pokemon
			//Cuando atrapo un pokemon
			if (grilla.get(nx, ny) === POKE ||grilla.get(nx, ny) === POKE2 || grilla.get(nx, ny) === POKE3 || grilla.get(nx, ny) === POKE4 || grilla.get(nx, ny) === POKE5) {
				// Aumenta el puntaje, subo la velocidad, aumento en uno la cantidad de pokemones atrapados
				puntaje++;
				atrapados++;
				subirVelocidad();
				if(atrapados%cant===0){ //cada x cantidad de pokemones subo de nivel
					subirNivel();
				}
				ponerComida(); //pinto un nuevo pokemon
			} else {
				//Elimino el primer elemento de la cola de la serpiente (la cola)
				var cola = snake.remove();
				grilla.set(EMPTY, cola.x, cola.y);
			}
			//cuando el puntaje es mayor al high score, es el nuevo high score
			if(puntaje>PuntajeMaximo){
				PuntajeMaximo= puntaje;
			}
			grilla.set(PERSONAJE, nx, ny);
			snake.insert(nx, ny);
		}
	}
}

function draw() {
	var tw = canvas.width/grilla.width;
	var th = canvas.height/grilla.height;
	//itero por la grilla y dibujo cada celda

	for (var x=0; x < grilla.width; x++) {
		for (var y=0; y < grilla.height; y++) {
			switch (grilla.get(x, y)) {
				case EMPTY:
					ctx.fillStyle = "#000";
					break;
				
				case POKEBOLA:
					var img = document.getElementById("Pokebola");
    				ctx.drawImage(img, x*tw, y*th);
    				continue;
 				case POKE:
					var img = document.getElementById("poke1");
    				ctx.drawImage(img, x*tw, y*th);
    				continue;
    			case MISTY:
					var img = document.getElementById("Misty");
    				ctx.drawImage(img, x*tw, y*th);
    				continue;
    			case ASH:
					var img = document.getElementById("Ash");
    				ctx.drawImage(img, x*tw, y*th);
    				continue;
    			case JESSIE:
					var img = document.getElementById("Jessie");
    				ctx.drawImage(img, x*tw, y*th);
    				continue;
				case MEOWTH:
					var img = document.getElementById("Meowth");
    				ctx.drawImage(img, x*tw, y*th);
    				continue;
    			case JAMES:
					var img = document.getElementById("James");
    				ctx.drawImage(img, x*tw, y*th);
    				continue;
    			case POKE2:
    				var img = document.getElementById("poke2");
    				ctx.drawImage(img, x*tw, y*th);
    				continue;
    			case POKE3:
    				var img = document.getElementById("poke3");
    				ctx.drawImage(img, x*tw, y*th);
    				continue;
    			case POKE4:
    				var img = document.getElementById("poke4");
    				ctx.drawImage(img, x*tw, y*th);
    				continue;
    			case POKE5:
    				var img = document.getElementById("poke5");
    				ctx.drawImage(img, x*tw, y*th);
    				continue;
			}
			ctx.fillRect(x*tw, y*th, tw, th);
		}
	}
	ctx.font = "13px Courier New";
	imprimirPuntaje();	
}

PorTeclado();
document.onkeypress = keyPress;

function keyPress(e){
	var key = (e.keyCode);
    if(key == disabled){
        document.getElementById("startbutton").click();
        disabled=999;
    }

}
audio.play();
