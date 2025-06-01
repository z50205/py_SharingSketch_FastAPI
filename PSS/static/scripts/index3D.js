    // 建立場景
    const scene = new THREE.Scene();
    let plane;


    // 建立相機
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    // camera.position.set(-0.5, -0.3, 0.5);  // 稍微往上移
    camera.position.set(-4,-2, 2);
    camera.lookAt(0, 0, 0);          // 看向中心    

    // 建立渲染器
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    // 載入貼圖
    const loader = new THREE.TextureLoader();
    loader.load('static/pics/room.png', function (texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.colorSpace = THREE.SRGBColorSpace;

      // 依照圖片原始比例來建立 Plane
      const aspect = texture.image.width / texture.image.height;
      const height = 3; // 你可以改這個來縮放圖片大小
      const width = aspect * height;

      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      plane = new THREE.Mesh(geometry, material);
      plane.rotation.x=-0.85;
      plane.rotation.y=-0.85;
      scene.add(plane);
      renderer.render(scene, camera);
      // 渲染場景
    //   animate()
    });


// 建立動畫函數
function animate() {
  requestAnimationFrame(animate);

  // 可加入任何動畫、旋轉等
  if (plane) {
    plane.rotation.x -= 0.01; // 小小轉動看效果
    plane.rotation.y -= 0.01; // 小小轉動看效果
  }

  renderer.render(scene, camera);
}