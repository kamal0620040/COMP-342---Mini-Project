let canvas0 = document.getElementById("myCanvas0");
let ctx = canvas0.getContext("2d");

let canvas1 = document.getElementById("myCanvas1");
const gl = canvas1.getContext("webgl");

const xPosition = document.querySelector(".xPosition");
const yPosition = document.querySelector(".yPosition");
const accelerationDueToGravity = document.querySelector(".acceleration");
const elasticity = document.querySelector(".elasticity");
const checkBox = document.querySelector(".checkbox");

const buttomSimulate = document.querySelector(".simulate-button");

// Ball properties
let ball = {
  x: canvas0.width / 2,
  y: 0,
  vy: 0,
  ay: 9.8,
  radius: 30.0,
  elasticity: 0.75,
};

buttomSimulate.addEventListener("click", (e) => {
  xValue = xPosition.value * 1;
  yValue = yPosition.value * 1;
  acceleration = accelerationDueToGravity.value * 1;
  elas = elasticity.value * 1;

  if (xValue < 0 || xValue > canvas0.width) {
    console.log("xValue exceed canvas width");
    return;
  }

  if (yValue < 0 || yValue > canvas0.height) {
    console.log("yValue exceed canvas height");
    return;
  }

  ball.x = xValue;
  ball.y = yValue;
  ball.vy = 0;
  ball.ay = acceleration;
  ball.elasticity = elas;

  animate();
});

checkBox.addEventListener("click", (e) => {
  if (e.target.checked) {
    drawCoordinate();
  } else {
    // clear the cpprdinate
    ctx.clearRect(0, 0, canvas0.width, canvas0.height);
  }
});

function playAudio(value) {
  var audio = document.getElementById("my-audio");
  audio.play();
  setTimeout(() => {
    audio.pause();
  }, value);
}

function setBallDefaultValueInInput() {
  xPosition.value = ball.x.toFixed(2);
  yPosition.value = ball.y;
  accelerationDueToGravity.value = ball.ay;
  elasticity.value = ball.elasticity;
}

setBallDefaultValueInInput();

// Shaders
let vertex_shader_code = `
  attribute vec2 _xy;
  uniform vec2 _size;
  void main(){
    gl_Position = vec4(((_xy / _size) * 2.0 - 1.0) * vec2(1,-1), 0, 1.0);
    gl_PointSize = ${ball.radius.toFixed(1)};
  }
`;

let fragment_shader_code = `
    precision mediump float;
    void main(){
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist < 0.5) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    } else {
        discard;
    }
    }
`;

function initShader(gl, vcode, fcode) {
  let vertex = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertex, vcode);
  gl.compileShader(vertex);

  let fragment = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragment, fcode);
  gl.compileShader(fragment);

  let program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.useProgram(program);
  return program;
}

// Add event listener for "click" event on canvas0
canvas0.addEventListener("click", function (event) {
  // Get click coordinates relative to canvas0
  let rect = canvas0.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  console.log(x, y);
  // Update ball position and velocity
  ball.x = x;
  ball.y = y;
  ball.vy = 0;
  setBallDefaultValueInInput();
  console.log(ball);
  animate();
});

function animate() {
  // if(ball.vy == Math.round(ball.vy,2))
  if (ball.vy.toFixed(2) == -1.26) {
    window.cancelAnimationFrame(requestAnimationFrame);
    return;
  }

  updateBall();
  draw();
  var requestId = window.requestAnimationFrame(animate);
  console.log(requestId);
}

function updateBall() {
  // Update ball velocity and position using numerical integration
  // Euler's method: v(t+dt) = v(t) + a(t)*dt, x(t+dt) = x(t) + v(t)*dt
  const dt = 0.3; // timestep
  ball.vy += ball.ay * dt;
  ball.y += ball.vy * dt;

  // Detect collision with the ground
  if (ball.y + ball.radius > canvas0.height) {
    ball.y = canvas0.height - ball.radius;
    ball.vy *= -ball.elasticity;
    playAudio(ball.y);
  }
}

function draw() {
  ctx.fillStyle = "#ff0000";
  ctx.strokeRect(0, 686, 700, 350);

  // Draw ball using WebGL
  let p = initShader(gl, vertex_shader_code, fragment_shader_code);
  let xy = gl.getAttribLocation(p, "_xy");
  let size = gl.getUniformLocation(p, "_size");
  gl.uniform2f(size, canvas0.width, canvas0.height);

  gl.vertexAttrib2f(xy, ball.x, ball.y);
  gl.drawArrays(gl.POINTS, 0, 1);
}

function drawCoordinate() {
  // Draw coordinate system
  ctx.strokeRect(0, 350, 700, 350);
  ctx.strokeRect(350, 0, 350, 700);
  ctx.fillText("(0,0) (-1,1)", 5, 10);
  ctx.fillText("(700,700) (1,-1)", 620, 690);
  ctx.fillText("(700,0) (1,1)", 630, 10);
  ctx.fillText("(0,700) (-1,-1)", 5, 690);
  ctx.fillText("(350,350) (0,0)", 360, 340);
}
