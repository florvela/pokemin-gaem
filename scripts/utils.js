
//Habilitar el ingreso por teclado
function PorTeclado(){
	tecla = {};
	document.addEventListener("keydown", function(evt) {
		tecla[evt.keyCode] = true;
	});
	document.addEventListener("keyup", function(evt) {
		delete tecla[evt.keyCode];
	});
}

//pintar el fondo de un color
function pintaFondo(color) {
	var tw = canvas.width/grilla.width;
	var th = canvas.height/grilla.height;
	for (var x=0; x < grilla.width; x++) {
		for (var y=0; y < grilla.height; y++) {
			ctx.fillStyle = color;
			ctx.fillRect(x*tw, y*th, tw, th);
		}
	}
}

//Poner pokemones
function ponerComida() {
	var empty= [];
	var POKEMONS = [POKE,POKE2,POKE3,POKE4,POKE5];
	// recorro la grilla y hallo celdas vacias
	for (var x=0; x < grilla.width; x++) {
		for (var y=0; y < grilla.height; y++) {
			if (grilla.get(x, y) === EMPTY) {
				empty.push({x:x, y:y});
			}
		}
	}
	// eligo una celda random
	var randpos= empty[Math.round(Math.random()*(empty.length - 1))];
	var randpoke = POKEMONS[Math.floor(Math.random() * POKEMONS.length)];
	grilla.set(randpoke, randpos.x, randpos.y);
}


//Poner miembros del equipo rocket
function ponerObstaculo(){
	var ROCKET = [JESSIE,JAMES,MEOWTH];
	var empty= [];
	for (var x=0; x < grilla.width; x++) {
		for (var y=0; y < grilla.height; y++) {
			if (grilla.get(x, y) === EMPTY) {
				empty.push({x:x, y:y});
			}
		}
	}
	var randpos = empty[Math.round(Math.random()*(empty.length - 1))];
	for (var j=0; j<py ;j++){
		var randrocket = ROCKET[Math.floor(Math.random() * ROCKET.length)];
		grilla.set(randrocket, randpos.x, randpos.y+j);
	}
}


//Muetsra el get ready y pasa al start
function getReady(){
	ctx.font = "20px Courier New"; 
	ctx.fillText("   GET READY",canvas.width/2-80, canvas.height/2);
	ctx.font = "13px Courier New"; 
	setTimeout(Start,1800);
}
function Start(){
	ctx.drawImage(document.getElementById("start"), canvas.width/2-60, canvas.height/2-30);
	setTimeout(loop,950);
}


//Imprime el puntaje y el puntaje maximo en la esquina izquierda inferior
function imprimirPuntaje(){
	ctx.fillStyle = "#fff";
	ctx.fillText("Score: " + puntaje, 20, canvas.height-30);
	ctx.fillText("SUPER MEGA HIGHSCORE: " + PuntajeMaximo, 20, canvas.height-15);
}


//sube de nivel y aumenta la cantidad necesaria de pokemones necesarios para subir de nivel
function subirNivel() {
	niv++;
	atrapados = 0;
	cant = 2 + niv;
	py++;
}

// imprime un menu de pausa
function menuPausa(){	
	pintaFondo("#000");
	ctx.font = "60px Courier New";
	ctx.fillStyle = "#fff"
	ctx.fillText("PAUSE", (canvas.width/2)-300/4, (canvas.height/2)-50);
	ctx.font = "22px Courier New"; 
	ctx.fillText("Press 'P' to unpause.", (canvas.width/2)-462/4, (canvas.height/2));
	ctx.fillText("SCORE: " + puntaje,(canvas.width/2)-44, (canvas.height/2)+60);
	ctx.fillText("HIGHSCORE: " + PuntajeMaximo,(canvas.width/2)-66, (canvas.height/2)+100);
	ctx.font = "13px Courier New"; 
	audio.pause();
}

//Imprime un menu inicial
function menuInicial(){	
	ctx.drawImage(document.getElementById("init"), 0, 0);
}

//Aumento la velocidad
function subirVelocidad(){
	vel--;
}

//Intersticial
function intersticial(){
	pintaFondo("#000");
	ctx.font = "60px Courier New";
	ctx.fillStyle = "#fff"
	ctx.fillText("LEVEL " + niv, (canvas.width/2)-105, canvas.height/2);
	ctx.font = "13px Courier New"; 
	setTimeout(seguirJuego, 1500); //pequeña pausa
}

function seguirJuego() {
	pintaFondo("#000");
	nivel_anterior = niv;
	main();
}

//Cuando pierde ante un miembro del equipo rocket
function pwned(color){ 
	pintaFondo("black");
	ctx.fillStyle = color;
	ctx.font = "60px Courier New";
	ctx.drawImage(document.getElementById("DealWithIt"),0,0, canvas.width, canvas.height);
}

//inicializo el canvas
function IniciarCanvas(pxl){ 
	document.getElementById("headd").style.display = "block";
	canvas = document.createElement("canvas");
	canvas.width = columnas*pxl;
	canvas.height = filas*pxl;
	ctx = canvas.getContext("2d");
	// Agregar el canvas al cuerpo del "documento"
	document.body.appendChild(canvas); 
	grilla.init(EMPTY, columnas, filas);
}

//asignar el personaje a Ash o a Misty cuando se apretan los botones
function choose(number){
	PERSONAJE = number;
}

function auxiliar(){
	pwned("#fff");
	body_style = "background-image:url('../images/gameExtras/loser.gif');background-repeat:repeat;background-size: 11%;"
	document.getElementById("body").style= body_style;	
	inicio=2;
	aux=1;
	vel=10;
	loop();
}