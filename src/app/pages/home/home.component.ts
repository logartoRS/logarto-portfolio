import { Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  @ViewChild('rendererContainer', { static: false }) rendererContainer!: ElementRef;

  ngAfterViewInit(): void {
    this.initThreeJS();
  }

  changeLanguage(lang: string): void {
    this.translate.use(lang);
  }

  private initThreeJS(): void {
    // ====== //
    // Escena //
    // ====== //
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0d26);
    scene.fog = new THREE.FogExp2(0x0d0d26, 0.01);

    // ================ //
    // Clickable Object //
    // ================ //
    const clickableObjects: THREE.Object3D[] = [];
    const objectActions = new Map<THREE.Object3D, () => void>();

    // ==== //
    // Ejes //
    // ==== //
    //const helper = new THREE.AxesHelper(1);
    //scene.add(helper);
    
    // ======================= //
    // Configuración de cámara //
    // ======================= //
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 5;
    camera.position.y = 5;
    camera.position.z = 10;

    // ========================== //
    // Configuración del renderer //
    // ========================== //
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMappingExposure = 1.2;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.rendererContainer.nativeElement.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.8, // strength
      0.4, // radius
      0.85 // threshold
    );
    composer.addPass(bloomPass);

    // ======================= //
    // Movimiento de la cámara //
    // ======================= //
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Suaviza el movimiento
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false; // Evita que se mueva en eje Y
    controls.minDistance = 2; // Distancia mínima al objeto
    controls.maxDistance = 20; // Distancia máxima al objeto
    controls.maxPolarAngle = Math.PI / 2.5; // Limita el ángulo de elevación para no pasar por debajo del piso
    controls.enablePan = false; // Desactiva el paneo

    // =========================== //
    // Área del renderer adaptable //
    // =========================== //
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
    
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    
      renderer.setSize(width, height);
      composer.setSize(width, height);
    });

    // ============= //
    // Luz ambiental //
    // ============= //
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // ============= //
    // Crear el piso //
    // ============= //
    const mtlLoaderFloor = new MTLLoader();
    mtlLoaderFloor.setPath('assets/models/floor/');
    mtlLoaderFloor.load('floor.mtl', (materials) => {
      materials.preload();

      // ================ //
      // Carga del modelo //
      // ================ //
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('assets/models/floor/');
      objLoader.load('floor.obj', (object) => {
        // Escala
        object.scale.set(1, 1, 1);

        // Centrar el objeto en el origen
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);

        // Recalcular la bounding box luego de centrar
        const centeredBox = new THREE.Box3().setFromObject(object);
        const offsetY = -centeredBox.min.y;
        object.position.y = -0.2;

        scene.add(object);
      });
    });

    // ========= //
    // Cafetería //
    // ========= //
    const mtlLoaderCafe = new MTLLoader();
    mtlLoaderCafe.setPath('assets/models/cafe/');
    mtlLoaderCafe.load('cafe.mtl', (materials) => {
      materials.preload();

      // ================ //
      // Carga del modelo //
      // ================ //
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('assets/models/cafe/');
      objLoader.load('cafe.obj', (object) => {
        // Escala
        object.scale.set(1, 1, 1);

        // Centrar el objeto en el origen
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);

        // Recalcular la bounding box luego de centrar
        const centeredBox = new THREE.Box3().setFromObject(object);
        const offsetY = -centeredBox.min.y;
        object.position.y += offsetY;

        scene.add(object);

        // ======== //
        // Ventanas //
        // ======== //
        const glassMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xffdd99,
          transparent: true,
          opacity: 0.7,
          emissive: new THREE.Color(0xffcc66),
          emissiveIntensity: 2,
          roughness: 0,
          metalness: 0,
          transmission: 0.6,
          thickness: 0.1
        });

        const windowPositions = [
          { 
            l: 1.5, w: 1.25, e: 0.05,
            x: -1.25, y: 1.75, z: 1.6,
            rx: 0, ry: 0, rz: 0
          },
          { 
            l: 1.5, w: 1.25, e: 0.05,
            x: 0.2, y: 1.75, z: 1.6,
            rx: 0, ry: 0, rz: 0
          },
          { 
            l: 1, w: 1.25, e: 0.05,
            x: 1.1, y: 1.75, z: 0.58,
            rx: 0, ry: Math.PI/2, rz: 0
          },
          { 
            l: 1.5, w: 1.25, e: 0.05,
            x: -1.25, y: 4.75, z: 1.6,
            rx: 0, ry: 0, rz: 0
          },
          { 
            l: 1.5, w: 1.25, e: 0.05,
            x: 0.2, y: 4.75, z: 1.6,
            rx: 0, ry: 0, rz: 0
          },
        ];

        windowPositions.forEach(pos => {
          const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(pos.l, pos.w, pos.e), glassMaterial);
          const glass = glassMesh.clone();
          glass.position.set(pos.x, pos.y, pos.z);
          glass.rotation.set(pos.rx, pos.ry, pos.rz);
          scene.add(glass);
        });
      });
    });

    // ====== //
    // Cartel //
    // ====== //
    const mtlLoaderSing = new MTLLoader();
    mtlLoaderSing.setPath('assets/models/sign/');
    mtlLoaderSing.load('sign.mtl', (materials) => {
      materials.preload();

      // ================ //
      // Carga del modelo //
      // ================ //
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('assets/models/sign/');
      objLoader.load('sign.obj', (object) => {
        // Escala
        object.scale.set(1, 1, 1);

        // Centrar el objeto en el origen
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);

        // Recalcular la bounding box luego de centrar
        const centeredBox = new THREE.Box3().setFromObject(object);
        const offsetX = -centeredBox.min.x;
        const offsetY = -centeredBox.min.y;
        const offsetZ = -centeredBox.min.z;
        object.position.x += offsetX - 2;
        object.position.y += offsetY + 5.5;
        object.position.z += offsetZ + 1.75;

        scene.add(object);

        // === //
        // Luz //
        // === //
        const glassMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xf5deb3,
          transparent: true,
          opacity: 0.5,
          emissive: new THREE.Color(0xf5deb3),
          emissiveIntensity: 1.75,
          roughness: 0,
          metalness: 0,
          transmission: 0.6,
          thickness: 0.1
        });

        const windowPositions = [
          { 
            l: 2.75, w: 1.2, e: 0.05,
            x: -0.5, y: 6.15, z: 1.85,
            rx: 0, ry: 0, rz: 0
          },
        ];

        windowPositions.forEach(pos => {
          const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(pos.l, pos.w, pos.e), glassMaterial);
          const glass = glassMesh.clone();
          glass.position.set(pos.x, pos.y, pos.z);
          glass.rotation.set(pos.rx, pos.ry, pos.rz);
          scene.add(glass);
        });

        // ========================= //
        // Caja invisible clickeable //
        // ========================= //
        const boundingBox = new THREE.Box3().setFromObject(object);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        const centerBox = new THREE.Vector3();
        boundingBox.getCenter(centerBox);

        const invisibleBox = new THREE.Mesh(
          new THREE.BoxGeometry(size.x, size.y, size.z),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        invisibleBox.position.copy(centerBox);

        scene.add(invisibleBox);
        clickableObjects.push(invisibleBox);
        objectActions.set(invisibleBox, () => {
          glassMaterial.emissiveIntensity = glassMaterial.emissiveIntensity > 0 ? 0 : 1.75;
          glassMaterial.opacity = glassMaterial.opacity > 0.1 ? 0.1 : 0.5;
          glassMaterial.needsUpdate = true;
        });
      });
    });

    // ======= //
    // Lámpara //
    // ======= //
    const mtlLoaderLamp = new MTLLoader();
    mtlLoaderLamp.setPath('assets/models/lamp/');
    mtlLoaderLamp.load('lamp.mtl', (materials) => {
      materials.preload();

      // ================ //
      // Carga del modelo //
      // ================ //
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('assets/models/lamp/');
      objLoader.load('lamp.obj', (object) => {
        // Escala
        object.scale.set(1, 1, 1);

        // Centrar el objeto en el origen
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);

        // Recalcular la bounding box luego de centrar
        const centeredBox = new THREE.Box3().setFromObject(object);
        const offsetX = -centeredBox.min.x;
        const offsetY = -centeredBox.min.y;
        const offsetZ = -centeredBox.min.z;
        object.position.x += offsetX + 3;
        object.position.y += offsetY;
        object.position.z += offsetZ;

        scene.add(object);

        // =========== //
        // Luz puntual //
        // =========== //
        const finalBox = new THREE.Box3().setFromObject(object);
        const lampHeadY = finalBox.max.y - 0.85;

        const lampPositions = [
          { 
            x: 4.25, y: lampHeadY, z: 0.75
          },
          { 
            x: 3.25, y: lampHeadY, z: 0.75
          },
          { 
            x: 3.75, y: lampHeadY, z: 1.25
          },
          { 
            x: 3.75, y: lampHeadY, z: 0.25
          },
        ];

        lampPositions.forEach(lamp => {
          // Color, intensidad, distancia
          const pointLight = new THREE.PointLight(0xffa95c, 5, 30);
          pointLight.position.set(lamp.x, lamp.y, lamp.z);
          scene.add(pointLight);

          //const lightHelper = new THREE.PointLightHelper(pointLight, 0.2);
          //scene.add(lightHelper);
        });
      });
    });

    // ===== //
    // Table //
    // ===== //
    const mtlLoaderTable = new MTLLoader();
    mtlLoaderTable.setPath('assets/models/table/');
    mtlLoaderTable.load('table.mtl', (materials) => {
      materials.preload();

      // ================ //
      // Carga del modelo //
      // ================ //
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('assets/models/table/');
      objLoader.load('table.obj', (object) => {
        // Escala
        object.scale.set(1, 1, 1);

        // Centrar el objeto en el origen
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);

        // Recalcular la bounding box luego de centrar
        const centeredBox = new THREE.Box3().setFromObject(object);
        const offsetX = -centeredBox.min.x;
        const offsetY = -centeredBox.min.y;
        const offsetZ = -centeredBox.min.z;
        object.position.x += offsetX - 2;
        object.position.y += offsetY;
        object.position.z += offsetZ + 2.25;

        scene.add(object);
      });
    });

    // Event Clicks //
    window.addEventListener('click', (event) => {
      const mouse = new THREE.Vector2();
      const raycaster = new THREE.Raycaster();
    
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
      raycaster.setFromCamera(mouse, camera);
    
      const intersects = raycaster.intersectObjects(clickableObjects, true);
      if (intersects.length > 0) {
        const clicked = intersects[0].object;
        const action = objectActions.get(clicked);
        if (action) action();
      }
    });

    // ========= //
    // Animación //
    // ========= //
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      composer.render();
    };
    
    animate();
  }
}
