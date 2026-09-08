import * as THREE from 'three';

export function createTextPlane(options: {
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
}): THREE.Mesh {
  const {
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
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d')!;
  ctx.font = `bold ${fontSize}px Arial`;

  if (backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

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

export function createImagePlane(options: {
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
  clickableObjects?: THREE.Object3D[];
  objectActions?: Map<THREE.Object3D, () => void>;
  hoverActions?: Map<THREE.Object3D, (hovered: boolean) => void>;
}): THREE.Group {
  const {
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
    onHover,
    clickableObjects = [],
    objectActions = new Map(),
    hoverActions = new Map()
  } = options;

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

    const circleMesh = group.children.find(
      obj => obj instanceof THREE.Mesh && obj !== plane
    ) as THREE.Mesh | undefined;

    if (circleMesh) {
      clickableObjects.push(circleMesh);
      objectActions.set(circleMesh, onClick);
    }
  }

  if (onHover) {
    hoverActions.set(plane, (hovered: boolean) => onHover(hovered, group));
    const circleMesh = group.children.find(
      obj => obj instanceof THREE.Mesh && obj !== plane
    ) as THREE.Mesh | undefined;

    if (circleMesh) {
      hoverActions.set(circleMesh, (hovered: boolean) => onHover(hovered, group));
    }
  }

  return group;
}