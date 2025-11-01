import { describe, it, expect } from 'vitest';
import * as THREE from 'three';

describe('Three.js Integration', () => {
  it('should create a scene', () => {
    const scene = new THREE.Scene();
    expect(scene).toBeDefined();
    expect(scene).toBeInstanceOf(THREE.Scene);
  });

  it('should create a perspective camera', () => {
    const camera = new THREE.PerspectiveCamera(75, 16/9, 0.1, 1000);
    expect(camera).toBeDefined();
    expect(camera).toBeInstanceOf(THREE.PerspectiveCamera);
    expect(camera.fov).toBe(75);
  });

  it('should create basic geometries', () => {
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    expect(boxGeometry).toBeDefined();
    expect(boxGeometry).toBeInstanceOf(THREE.BoxGeometry);
  });

  it('should create materials', () => {
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    expect(material).toBeDefined();
    expect(material).toBeInstanceOf(THREE.MeshBasicMaterial);
  });

  it('should create meshes', () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    expect(mesh).toBeDefined();
    expect(mesh).toBeInstanceOf(THREE.Mesh);
  });
});
