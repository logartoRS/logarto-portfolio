import { Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { createTextPlane, createImagePlane } from '../../utils/three-utils';

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

    // ======================== //
    // Clickable / Hover Object //
    // ======================== //
    const clickableObjects: THREE.Object3D[] = [];
    const objectActions = new Map<THREE.Object3D, () => void>();
    const hoverActions = new Map<THREE.Object3D, (hovered: boolean) => void>();

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
    mtlLoaderFloor.setPath('assets/models/floor2/');
    mtlLoaderFloor.load('floor2.mtl', (materials) => {
      materials.preload();

      // ================ //
      // Carga del modelo //
      // ================ //
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('assets/models/floor2/');
      objLoader.load('floor2.obj', (object) => {
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

    // ========= //
    // Dispenser //
    // ========= //
    const mtlLoaderDispenser = new MTLLoader();
    mtlLoaderDispenser.setPath('assets/models/dispenser/');
    mtlLoaderDispenser.load('dispenser.mtl', (materials) => {
      materials.preload();

      // ================ //
      // Carga del modelo //
      // ================ //
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('assets/models/dispenser/');
      objLoader.load('dispenser.obj', (object) => {
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
        object.position.x += offsetX - 3.45;
        object.position.y += offsetY;
        object.position.z += offsetZ - 1.5;

        scene.add(object);
      });
    });

    // ============ //
    // Event Clicks //
    // ============ //
    window.addEventListener('click', (event) => {
      const mouse = new THREE.Vector2();
      const raycaster = new THREE.Raycaster();
    
      const rect = renderer.domElement.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
      raycaster.setFromCamera(mouse, camera);
    
      const intersects = raycaster.intersectObjects(clickableObjects, true);
      if (intersects.length > 0) {
        const clicked = intersects[0].object;
        const action = objectActions.get(clicked);
        if (action) action();
      }
    });

    // =========== //
    // Event Hover //
    // =========== //
    let lastHovered: THREE.Object3D | null = null;
    window.addEventListener('mousemove', (event) => {
      const mouse = new THREE.Vector2();
      const raycaster = new THREE.Raycaster();

      const rect = renderer.domElement.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects, true);

      if (intersects.length > 0) {
        const hovered = intersects[0].object;

        if (hovered !== lastHovered) {
          if (lastHovered && hoverActions.has(lastHovered)) {
            hoverActions.get(lastHovered)?.(false);
          }

          if (hoverActions.has(hovered)) {
            hoverActions.get(hovered)?.(true);
          }

          lastHovered = hovered;
        }
      } else {
        if (lastHovered && hoverActions.has(lastHovered)) {
          hoverActions.get(lastHovered)?.(false);
          lastHovered = null;
        }
      }
    });

    // ===== //
    // Texto //
    // ===== //
    const plane1 = createTextPlane({
      text: 'Brayan Retamozo',
      fontSize: 64,
      color: 'white',
      position: { x: 3, y: 0.01, z: 5.5 },
      rotation: { x: -Math.PI / 2, y: 0, z: 0 }
    });
    scene.add(plane1);
    
    const plane2 = createTextPlane({
      text: 'Desarrollador Full-Stack',
      fontSize: 40,
      color: 'white',
      position: { x: 2.8, y: 0.01, z: 6.4 },
      rotation: { x: -Math.PI / 2, y: 0, z: 0 }
    });
    scene.add(plane2);
    
    const plane3 = createTextPlane({
      text: 'Sobre Mi',
      fontSize: 50,
      color: 'black',
      planeWidth: 1.25,
      planeHeight: 0.25,
      position: { x: -3.4, y: 2.55, z: -0.75 },
      rotation: { x: 0, y: -Math.PI / 2, z: 0 }
    });
    scene.add(plane3);

    const plane4 = createTextPlane({
      text: 'Brayan Alejandro Retamozo Salazar',
      fontSize: 32,
      color: 'black',
      planeWidth: 1.25,
      planeHeight: 0.25,
      position: { x: -3.4, y: 2.3, z: -0.75 },
      rotation: { x: 0, y: -Math.PI / 2, z: 0 }
    });
    scene.add(plane4);

    const plane5 = createTextPlane({
      text: 'Hola soy Desarrollador Web e Ingeniero Mecatrónico. Tengo habilidades de trabajo en equipo, proactividad y puntualidad. Tengo interés en el desarrollo web, programación y automatización de procesos.',
      fontSize: 30,
      color: 'white',
      canvasHeight: 300,
      planeWidth: 1.25,
      planeHeight: 0.5,
      position: { x: -3.4, y: 1.95, z: -0.75 },
      rotation: { x: 0, y: -Math.PI / 2, z: 0 }
    });
    scene.add(plane5);

    const plane6 = createTextPlane({
      text: 'Tecnologías',
      fontSize: 32,
      color: 'black',
      planeWidth: 1.25,
      planeHeight: 0.25,
      position: { x: -3.4, y: 1.6, z: -0.75 },
      rotation: { x: 0, y: -Math.PI / 2, z: 0 }
    });
    scene.add(plane6);

    const imagePlaneBack = createImagePlane({
      imageUrl: 'assets/image/row_back.webp',
      planeWidth: 0.1,
      planeHeight: 0.1,
      opacity: 1,
      position: { x: -3.4, y: 1.15, z: -1.25 },
      rotation: { x: 0, y: -Math.PI/2, z: 0 },
      circle: true,
      circleColor: 0xe3a427,
      onClick: () => {
        console.log('¡Haz hecho clic en la imagen!');
      },
      onHover: (hovered, group) => {
        const circleMesh = group.children.find((obj: THREE.Object3D) =>
          obj instanceof THREE.Mesh &&
          !(obj.material instanceof Array) &&
          !(obj.material as THREE.MeshBasicMaterial).map
        ) as THREE.Mesh | undefined;
    
        if (circleMesh) {
          (circleMesh.material as THREE.MeshBasicMaterial).color.set(hovered ? 0x47638e : 0xe3a427);
        }
      }
    });
    scene.add(imagePlaneBack);

    const imagePlaneNext = createImagePlane({
      imageUrl: 'assets/image/row_next.webp',
      planeWidth: 0.1,
      planeHeight: 0.1,
      opacity: 1,
      position: { x: -3.4, y: 1.15, z: -0.25 },
      rotation: { x: 0, y: -Math.PI/2, z: 0 },
      circle: true,
      circleColor: 0xe3a427,
      onClick: () => {
        console.log('¡Haz hecho clic en la imagen!');
      },
      onHover: (hovered, group) => {
        const circleMesh = group.children.find((obj: THREE.Object3D) =>
          obj instanceof THREE.Mesh &&
          !(obj.material instanceof Array) &&
          !(obj.material as THREE.MeshBasicMaterial).map
        ) as THREE.Mesh | undefined;
    
        if (circleMesh) {
          (circleMesh.material as THREE.MeshBasicMaterial).color.set(hovered ? 0x47638e : 0xe3a427);
        }
      }
    });
    scene.add(imagePlaneNext);

    const imagePlane1 = createImagePlane({
      imageUrl: 'assets/image/angular.webp',
      planeWidth: 0.25,
      planeHeight: 0.25,
      opacity: 0.8,
      position: { x: -3.4, y: 1.3, z: -1.05 },
      rotation: { x: 0, y: -Math.PI/2, z: 0 }
    });
    scene.add(imagePlane1);

    const imagePlane2 = createImagePlane({
      imageUrl: 'assets/image/net.webp',
      planeWidth: 0.25,
      planeHeight: 0.25,
      opacity: 0.8,
      position: { x: -3.4, y: 1.3, z: -0.75 },
      rotation: { x: 0, y: -Math.PI/2, z: 0 }
    });
    scene.add(imagePlane2);

    const imagePlane3 = createImagePlane({
      imageUrl: 'assets/image/spring_boot.webp',
      planeWidth: 0.25,
      planeHeight: 0.25,
      opacity: 0.8,
      position: { x: -3.4, y: 1.3, z: -0.45 },
      rotation: { x: 0, y: -Math.PI/2, z: 0 }
    });
    scene.add(imagePlane3);

    const imagePlane4 = createImagePlane({
      imageUrl: 'assets/image/sql.webp',
      planeWidth: 0.25,
      planeHeight: 0.25,
      opacity: 0.8,
      position: { x: -3.4, y: 1, z: -1.05 },
      rotation: { x: 0, y: -Math.PI/2, z: 0 }
    });
    scene.add(imagePlane4);

    const imagePlane5 = createImagePlane({
      imageUrl: 'assets/image/my_sql.webp',
      planeWidth: 0.25,
      planeHeight: 0.25,
      opacity: 0.8,
      position: { x: -3.4, y: 1, z: -0.75 },
      rotation: { x: 0, y: -Math.PI/2, z: 0 }
    });
    scene.add(imagePlane5);

    const imagePlane6 = createImagePlane({
      imageUrl: 'assets/image/xamarin.webp',
      planeWidth: 0.25,
      planeHeight: 0.25,
      opacity: 0.8,
      position: { x: -3.4, y: 1, z: -0.45 },
      rotation: { x: 0, y: -Math.PI/2, z: 0 }
    });
    scene.add(imagePlane6);

    // ================= //
    // Create text plane //
    // ================= //
    /*function createTextPlane({
      text,
      fontSize = 48,
      color = 'white',
      backgroundColor = 'transparent',
      canvasWidth = 600,
      canvasHeight = 128,
      planeWidth = 5,
      planeHeight = 1.25,
      position = { x: 0, y: 0, z: 0 },
      rotation = { x: 0, y: 0, z: 0 },
      maxLineWidth = 500,
      lineSpacing = 1.2
    }: {
      text: string;
      fontSize?: number;
      color?: string;
      backgroundColor?: string;
      canvasWidth?: number;
      canvasHeight?: number;
      planeWidth?: number;
      planeHeight?: number;
      position?: { x: number; y: number; z: number };
      rotation?: { x: number; y: number; z: number };
      maxLineWidth?: number;
      lineSpacing?: number;
    }) {
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    
      const ctx = canvas.getContext('2d')!;
      ctx.font = `bold ${fontSize}px Arial`;
    
      // Fondo
      if (backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    
      // Preparar líneas
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
    
      for (const word of words) {
        const testLine = currentLine + word + ' ';
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxLineWidth && currentLine !== '') {
          lines.push(currentLine.trim());
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine.trim());
    
      // Dibujar texto en líneas
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
    
      const totalTextHeight = lines.length * fontSize * lineSpacing;
      const startY = canvas.height / 2 - totalTextHeight / 2 + fontSize / 2;
    
      lines.forEach((line, i) => {
        const y = startY + i * fontSize * lineSpacing;
        ctx.fillText(line, canvas.width / 2, y);
      });
    
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
    
      const materialOptions: THREE.MeshBasicMaterialParameters = { map: texture };
      if (backgroundColor === 'transparent') {
        materialOptions.transparent = true;
      }
    
      const material = new THREE.MeshBasicMaterial(materialOptions);
      const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
      const plane = new THREE.Mesh(geometry, material);
    
      plane.position.set(position.x, position.y, position.z);
      plane.rotation.set(rotation.x, rotation.y, rotation.z);
    
      return plane;
    }
    
    // ================== //
    // Create image plane //
    // ================== //
    function createImagePlane({
      imageUrl,
      planeWidth = 1,
      planeHeight = 1,
      opacity = 0.95,
      color = 0xffffff,
      position = { x: 0, y: 0, z: 0 },
      rotation = { x: 0, y: 0, z: 0 },
      circle = false,
      circleColor = 0x000000,
      onClick,
      onHover
    }: {
      imageUrl: string;
      planeWidth?: number;
      planeHeight?: number;
      opacity?: number;
      color?: THREE.ColorRepresentation;
      position?: { x: number; y: number; z: number };
      rotation?: { x: number; y: number; z: number };
      circle?: boolean;
      circleColor?: THREE.ColorRepresentation;
      onClick?: () => void;
      onHover?: (hovered: boolean, group: THREE.Group) => void;
    }): THREE.Group {
      const texture = new THREE.TextureLoader().load(imageUrl);
    
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        color,
        opacity
      });
    
      const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
      const plane = new THREE.Mesh(geometry, material);
    
      const group = new THREE.Group();
    
      if (circle) {
        const radius = Math.sqrt(Math.pow(planeWidth / 2, 2) + Math.pow(planeHeight / 2, 2));
      
        const circleGeometry = new THREE.CircleGeometry(radius, 64);
        const circleMaterial = new THREE.MeshBasicMaterial({
          color: circleColor,
          transparent: true,
          opacity: opacity
        });
      
        const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
        circleMesh.position.z = -0.001;
      
        group.add(circleMesh);
      }
    
      group.add(plane);
    
      group.position.set(position.x, position.y, position.z);
      group.rotation.set(rotation.x, rotation.y, rotation.z);

      if (onClick) {
        clickableObjects.push(plane);
        objectActions.set(plane, onClick);
      
        if (circle) {
          const circleMesh = group.children.find(
            obj => obj instanceof THREE.Mesh && obj !== plane
          ) as THREE.Mesh | undefined;
      
          if (circleMesh) {
            clickableObjects.push(circleMesh);
            objectActions.set(circleMesh, onClick);
          }
        }
      }

      if (onHover) {
        hoverActions.set(plane, (hovered) => onHover(hovered, group));
        if (circle) {
          const circleMesh = group.children.find(
            obj => obj instanceof THREE.Mesh && obj !== plane
          ) as THREE.Mesh | undefined;
      
          if (circleMesh) {
            hoverActions.set(circleMesh, (hovered) => onHover(hovered, group));
          }
        }
      }
    
      return group;
    }*/

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
