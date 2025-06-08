const container = document.getElementById('threejs-container');
const width = container.offsetWidth || window.innerWidth;
const height = container.offsetHeight || 400;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

const loader = new THREE.TextureLoader();
loader.load('assets/dithered2.png', function(texture) {
    
    const geometry = new THREE.PlaneGeometry(3, 3 * (texture.image.height / texture.image.width), 128, 128);

    
    const img = texture.image;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, img.width, img.height).data;

    
    for (let i = 0; i < geometry.attributes.position.count; i++) {
        const uv = geometry.attributes.uv.getX(i);
        const vv = geometry.attributes.uv.getY(i);
        const x = Math.floor(uv * (img.width - 1));
        const y = Math.floor(vv * (img.height - 1));
        const idx = (y * img.width + x) * 4;
        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];
        const a = imgData[idx + 3];
        const luminance = (0.299 * r + 0.587 * g + 0.014 * b) / 255;
        const alpha = a / 255;
       
        geometry.attributes.position.setZ(i, alpha > 0.1 ? luminance * 0.005 : -1000);
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        displacementMap: texture,
        displacementScale: 0.5,
        color: 0xffffff,
        metalness: 0.2,
        roughness: 0.7,
        side: THREE.DoubleSide,
        alphaTest: 0.95, 
        transparent: true
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 5);
    scene.add(light);


    let angleY = 0;
    let angleX = 0;
    let directionY = 1;
    let directionX = 1;
    const maxAngleY = 0.15; 
    const maxAngleX = 0.07;
    const speedY = 0.001;
    const speedX = 0.0005;

    function animate() {
        requestAnimationFrame(animate);


        angleY += speedY * directionY;
        angleX += speedX * directionX;
        if (Math.abs(angleY) > maxAngleY) directionY *= -1;
        if (Math.abs(angleX) > maxAngleX) directionX *= -1;

        plane.rotation.y = angleY;
        plane.rotation.x = angleX;

        renderer.render(scene, camera);
    }
    animate();
});
