import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
    
    // ======================= //
    // Configuración de cámara //
    // ======================= //
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    //camera.rotation.y = Math.PI / 2;
    camera.position.x = 0;
    camera.position.y = 4;
    camera.position.z = 6;

    // ========================== //
    // Configuración del renderer //
    // ========================== //
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(renderer.domElement);

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
    });

    // ============= //
    // Luz ambiental //
    // ============= //
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // ============= //
    // Crear el piso //
    // ============= //
    const floorGeometry = new THREE.PlaneGeometry(60, 60);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.5,   // Menor = más brillante
      metalness: 0.3    // Mayor = más reflectante
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);

    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;

    scene.add(floor);

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

        animate();
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
        const offsetY = -centeredBox.min.y;
        object.position.y += offsetY;
        object.position.x = 4;

        scene.add(object);

        // =========== //
        // Luz puntual //
        // =========== //
        const finalBox = new THREE.Box3().setFromObject(object);
        const lampHeadY = finalBox.max.y - 0.85;

        // Color, intensidad, distancia
        const pointLight1 = new THREE.PointLight(0xffaa33, 5, 30);
        pointLight1.position.set(4.25, lampHeadY, 0);
        const pointLight2 = new THREE.PointLight(0xffaa33, 5, 30);
        pointLight2.position.set(3.25, lampHeadY, 0);
        const pointLight3 = new THREE.PointLight(0xffaa33, 5, 30);
        pointLight3.position.set(3.75, lampHeadY, 0.5);
        const pointLight4 = new THREE.PointLight(0xffaa33, 5, 30);
        pointLight4.position.set(3.75, lampHeadY, -0.5);

        scene.add(pointLight1);
        scene.add(pointLight2);
        scene.add(pointLight3);
        scene.add(pointLight4);

        //const lightHelper1 = new THREE.PointLightHelper(pointLight1, 0.2);
        //const lightHelper2 = new THREE.PointLightHelper(pointLight2, 0.2);
        //const lightHelper3 = new THREE.PointLightHelper(pointLight3, 0.2);
        //const lightHelper4 = new THREE.PointLightHelper(pointLight4, 0.2);
        //scene.add(lightHelper1);
        //scene.add(lightHelper2);
        //scene.add(lightHelper3);
        //scene.add(lightHelper4);

        animate();
      });
    });
    
    // ========= //
    // Animación //
    // ========= //
    const animate = () => {
      controls.update();

      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
  }
}
