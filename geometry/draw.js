var cw = 632/4;
var ch = 480/4;

function drawOnIt() {
  var r = 12;
  for (var i=0; i<100; i++) {
    ctx.fillStyle = 'rgba(255,0,255,'+Math.random()/3+')';
    ctx.arc(Math.random()*cw, Math.random()*ch, Math.random()*r, 0, 2*Math.PI, true);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,255,255,'+Math.random()/8+')';
    ctx.arc(Math.random()*cw, Math.random()*ch, Math.random()*r, 0, 2*Math.PI, true);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,0,'+Math.random()/2+')';
    ctx.arc(Math.random()*cw, Math.random()*ch, Math.random()*r, 0, 2*Math.PI, true);
    ctx.fill();


  }
}

function getImageData() {
  var imageData = ctx.getImageData(0, 0, cw, ch);
  return imageData.data.buffer;
}

function drawImageData(arrayBuffer) {
  var depth = new Uint8Array(arrayBuffer);
  for (var i=0, vs=particles.vertices, l=vs.length; i<l; i++) {
    vs[i].z = depth[i] < 220 ? -10 - 8*(depth[i]-20) : 4000;
  }
  particleSystem.geometry.verticesNeedUpdate = true;
}

var params = {
    stats:   0,
    fog:     1,
    credits: 1,
    ws:      "ws://#{window.location.host}"
}


var bgColour = 0x000000;
var fgColour = 0xffffff;

var inputW = 632;
var inputH = 480;
var useEvery = 4;
var w = inputW / useEvery;
var h = inputH / useEvery;

function v(x, y, z) { return new THREE.Vector3(x, y, z); }

var renderer = new THREE.WebGLRenderer({antialias: true});
var camera = new THREE.PerspectiveCamera(60, 1, 1, 10000);  // aspect (2nd param) shortly to be overridden...

var dvp = window.devicePixelRatio || 1;
function setSize() {
  renderer.setSize(window.innerWidth * dvp, window.innerHeight * dvp)
  renderer.domElement.style.width  = window.innerWidth + 'px'
  renderer.domElement.style.height = window.innerHeight + 'px'
  camera.aspect = window.innerWidth / window.innerHeight
  return camera.updateProjectionMatrix()
}

setSize()
window.onresize = setSize;

document.body.appendChild(renderer.domElement)
// renderer.setClearColorHex(bgColour, 1.0)
renderer.clear()

var scene = new THREE.Scene()
scene.add(camera)
if (params.fog)
  scene.fog = new THREE.FogExp2(bgColour, 0.00033);

var pMaterial = new THREE.ParticleBasicMaterial({color: fgColour, size: useEvery * 3.5});
var particles = new THREE.Geometry();
for (var y=0; y<h; y++) {
  for (var x=0; x<w; x++) {
    var xc = (x - (w / 2)) * useEvery * 2
    var yc = ((h / 2) - y) * useEvery * 2
    var particle = v(xc, yc, -1000)
    particle.usualY = yc;
    particles.vertices.push(particle)
  }
}

var particleSystem = new THREE.PointCloud(particles, pMaterial)
scene.add(particleSystem)

var dynaPan = 0
var sx = sy = 0
var camZRange = [2000, 200]
var camZ = 880
var camYRange = [-600, 600]

function animate() {
  renderer.clear()
  camera.lookAt(scene.position)
  renderer.render(scene, camera)
  window.requestAnimationFrame(animate, renderer.domElement)
  if (params.stats)
    stats.update();
}

animate()
