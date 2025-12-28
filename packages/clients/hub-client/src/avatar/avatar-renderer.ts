/**
 * Avatar Renderer
 *
 * Creates and manages Three.js meshes for avatar rendering.
 */

import * as THREE from 'three';
import { Group, Mesh, Material } from 'three';
import { AvatarComponent, AvatarCustomization } from './avatar-component';
import { AvatarNameTag } from './name-tag';

export class AvatarRenderer {
  private readonly root: Group;
  private readonly meshes: Map<string, Mesh> = new Map();
  private readonly nameTag: AvatarNameTag;

  constructor(
    private readonly avatar: AvatarComponent,
    private readonly scene: THREE.Scene
  ) {
    this.root = new Group();
    this.scene.add(this.root);

    // Create name tag
    this.nameTag = new AvatarNameTag(avatar.displayName, {
      showUserId: !avatar.isLocal,
      showStatus: true,
    });

    this.root.add(this.nameTag.sprite);

    // Create avatar meshes
    this.createAvatarMeshes();

    // Initial update
    this.update();
  }

  /**
   * Create avatar meshes based on customization
   */
  private createAvatarMeshes(): void {
    const { customization } = this.avatar;

    // Clear existing meshes
    this.meshes.forEach((mesh) => this.root.remove(mesh));
    this.meshes.clear();

    // Create based on body type
    switch (customization.bodyType) {
      case 'humanoid':
        this.createHumanoidAvatar();
        break;
      case 'robot':
        this.createRobotAvatar();
        break;
      case 'abstract':
        this.createAbstractAvatar();
        break;
    }

    // Add to scene
    this.meshes.forEach((mesh) => this.root.add(mesh));
  }

  /**
   * Create humanoid avatar
   */
  private createHumanoidAvatar(): void {
    const { customization } = this.avatar;
    const height = customization.height!;
    const width = customization.width!;
    const style = customization.style!;

    // Body dimensions
    const headRadius = 0.12;
    const torsoWidth = width * 0.5;
    const torsoHeight = height * 0.35;
    const torsoDepth = 0.2;
    const limbLength = height * 0.4;
    const limbRadius = 0.06;

    // Colors
    const skinColor = new THREE.Color(customization.skinColor!);
    const shirtColor = new THREE.Color(customization.shirtColor!);
    const pantsColor = new THREE.Color(customization.pantsColor!);
    const shoeColor = new THREE.Color(customization.shoeColor!);

    // Materials
    const skinMaterial = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.8 });
    const shirtMaterial = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6 });
    const pantsMaterial = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.7 });
    const shoeMaterial = new THREE.MeshStandardMaterial({ color: shoeColor, roughness: 0.9 });

    // Head
    const headGeometry = style === 'realistic'
      ? new THREE.SphereGeometry(headRadius, 16, 16)
      : new THREE.BoxGeometry(headRadius * 2, headRadius * 2, headRadius * 2);
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.set(0, height - limbLength * 0.1, 0);
    head.name = 'head';
    this.meshes.set('head', head);

    // Torso
    const torsoGeometry = new THREE.BoxGeometry(torsoWidth, torsoHeight, torsoDepth);
    const torso = new THREE.Mesh(torsoGeometry, shirtMaterial);
    torso.position.set(0, height - limbLength * 0.6, 0);
    torso.name = 'torso';
    this.meshes.set('torso', torso);

    // Arms
    const armGeometry = style === 'realistic'
      ? new THREE.CylinderGeometry(limbRadius, limbRadius * 0.8, limbLength, 8)
      : new THREE.BoxGeometry(limbRadius * 2, limbLength, limbRadius * 2);

    const leftArm = new THREE.Mesh(armGeometry, shirtMaterial);
    leftArm.position.set(-torsoWidth / 2 - limbRadius, height - limbLength * 0.5, 0);
    leftArm.name = 'leftArm';
    this.meshes.set('leftArm', leftArm);

    const rightArm = new THREE.Mesh(armGeometry, shirtMaterial);
    rightArm.position.set(torsoWidth / 2 + limbRadius, height - limbLength * 0.5, 0);
    rightArm.name = 'rightArm';
    this.meshes.set('rightArm', rightArm);

    // Hands
    const handGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
    leftHand.position.set(-0.3, height - limbLength * 0.1, 0);
    leftHand.name = 'leftHand';
    this.meshes.set('leftHand', leftHand);

    const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
    rightHand.position.set(0.3, height - limbLength * 0.1, 0);
    rightHand.name = 'rightHand';
    this.meshes.set('rightHand', rightHand);

    // Legs
    const legGeometry = style === 'realistic'
      ? new THREE.CylinderGeometry(limbRadius * 0.8, limbRadius * 0.6, limbLength, 8)
      : new THREE.BoxGeometry(limbRadius * 1.5, limbLength, limbRadius * 1.5);

    const leftLeg = new THREE.Mesh(legGeometry, pantsMaterial);
    leftLeg.position.set(-0.1, height - limbLength * 1.2, 0);
    leftLeg.name = 'leftLeg';
    this.meshes.set('leftLeg', leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, pantsMaterial);
    rightLeg.position.set(0.1, height - limbLength * 1.2, 0);
    rightLeg.name = 'rightLeg';
    this.meshes.set('rightLeg', rightLeg);

    // Shoes
    const shoeGeometry = new THREE.BoxGeometry(0.1, 0.08, 0.15);
    const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    leftShoe.position.set(-0.1, 0.04, 0);
    leftShoe.name = 'leftShoe';
    this.meshes.set('leftShoe', leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    rightShoe.position.set(0.1, 0.04, 0);
    rightShoe.name = 'rightShoe';
    this.meshes.set('rightShoe', rightShoe);

    // Hat (if enabled)
    if (customization.hasHat) {
      const hatGeometry = new THREE.CylinderGeometry(0.13, 0.13, 0.05, 16);
      const hatMaterial = new THREE.MeshStandardMaterial({ color: customization.primaryColor! });
      const hat = new THREE.Mesh(hatGeometry, hatMaterial);
      hat.position.set(0, height - limbLength * 0.1 + 0.15, 0);
      hat.name = 'hat';
      this.meshes.set('hat', hat);
      this.root.add(hat);
    }

    // Glasses (if enabled)
    if (customization.hasGlasses) {
      const glassesGeometry = new THREE.TorusGeometry(0.08, 0.01, 8, 16);
      const glassesMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const glasses = new THREE.Mesh(glassesGeometry, glassesMaterial);
      glasses.position.set(0, height - limbLength * 0.1, 0.1);
      glasses.name = 'glasses';
      this.meshes.set('glasses', glasses);
      this.root.add(glasses);
    }
  }

  /**
   * Create robot avatar
   */
  private createRobotAvatar(): void {
    const { customization } = this.avatar;
    const height = customization.height!;
    const primaryColor = new THREE.Color(customization.primaryColor!);
    const secondaryColor = new THREE.Color(customization.secondaryColor!);

    const primaryMaterial = new THREE.MeshStandardMaterial({
      color: primaryColor,
      metalness: 0.8,
      roughness: 0.2,
    });

    const secondaryMaterial = new THREE.MeshStandardMaterial({
      color: secondaryColor,
      metalness: 0.5,
      roughness: 0.5,
      emissive: secondaryColor,
      emissiveIntensity: 0.2,
    });

    // Box head
    const headGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const head = new THREE.Mesh(headGeometry, primaryMaterial);
    head.position.set(0, height - 0.5, 0);
    head.name = 'head';
    this.meshes.set('head', head);

    // Glowing eyes
    const eyeGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeometry, secondaryMaterial);
    leftEye.position.set(-0.05, height - 0.5, 0.13);
    this.root.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, secondaryMaterial);
    rightEye.position.set(0.05, height - 0.5, 0.13);
    this.root.add(rightEye);

    // Box torso
    const torsoGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.3);
    const torso = new THREE.Mesh(torsoGeometry, primaryMaterial);
    torso.position.set(0, height - 1.0, 0);
    torso.name = 'torso';
    this.meshes.set('torso', torso);

    // Cylindrical limbs
    const limbGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8);

    const leftArm = new THREE.Mesh(limbGeometry, secondaryMaterial);
    leftArm.position.set(-0.35, height - 0.9, 0);
    leftArm.name = 'leftArm';
    this.meshes.set('leftArm', leftArm);

    const rightArm = new THREE.Mesh(limbGeometry, secondaryMaterial);
    rightArm.position.set(0.35, height - 0.9, 0);
    rightArm.name = 'rightArm';
    this.meshes.set('rightArm', rightArm);

    const leftLeg = new THREE.Mesh(limbGeometry, primaryMaterial);
    leftLeg.position.set(-0.1, height - 1.7, 0);
    leftLeg.name = 'leftLeg';
    this.meshes.set('leftLeg', leftLeg);

    const rightLeg = new THREE.Mesh(limbGeometry, primaryMaterial);
    rightLeg.position.set(0.1, height - 1.7, 0);
    rightLeg.name = 'rightLeg';
    this.meshes.set('rightLeg', rightLeg);

    // Hands (clamps)
    const handGeometry = new THREE.BoxGeometry(0.1, 0.08, 0.08);
    const leftHand = new THREE.Mesh(handGeometry, secondaryMaterial);
    leftHand.position.set(-0.3, height - 0.5, 0);
    leftHand.name = 'leftHand';
    this.meshes.set('leftHand', leftHand);

    const rightHand = new THREE.Mesh(handGeometry, secondaryMaterial);
    rightHand.position.set(0.3, height - 0.5, 0);
    rightHand.name = 'rightHand';
    this.meshes.set('rightHand', rightHand);
  }

  /**
   * Create abstract avatar
   */
  private createAbstractAvatar(): void {
    const { customization } = this.avatar;
    const height = customization.height!;
    const primaryColor = new THREE.Color(customization.primaryColor!);
    const accentColor = new THREE.Color(customization.accentColor!);

    const material = new THREE.MeshStandardMaterial({
      color: primaryColor,
      emissive: primaryColor,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8,
    });

    // Capsule body
    const bodyGeometry = new THREE.CapsuleGeometry(0.3, height - 0.8, 8, 16);
    const body = new THREE.Mesh(bodyGeometry, material);
    body.position.set(0, height / 2, 0);
    body.name = 'body';
    this.meshes.set('torso', body);

    // Glowing core
    const coreGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: accentColor,
      emissiveIntensity: 0.8,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.set(0, height / 2, 0);
    core.name = 'core';
    this.root.add(core);

    // Floating particles (hands)
    const handGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const leftHand = new THREE.Mesh(handGeometry, material);
    leftHand.position.set(-0.3, height - 0.5, 0);
    leftHand.name = 'leftHand';
    this.meshes.set('leftHand', leftHand);

    const rightHand = new THREE.Mesh(handGeometry, material);
    rightHand.position.set(0.3, height - 0.5, 0);
    rightHand.name = 'rightHand';
    this.meshes.set('rightHand', rightHand);
  }

  /**
   * Update avatar based on component state
   */
  update(): void {
    // Update root position
    this.root.position.copy(this.avatar.headPosition);

    // Update head rotation
    this.root.rotation.y = this.avatar.headRotation.y;

    // Update hand positions
    const leftHand = this.meshes.get('leftHand');
    const rightHand = this.meshes.get('rightHand');

    if (leftHand) {
      leftHand.position.copy(this.avatar.leftHandPosition);
      leftHand.rotation.copy(this.avatar.leftHandRotation);
    }

    if (rightHand) {
      rightHand.position.copy(this.avatar.rightHandPosition);
      rightHand.rotation.copy(this.avatar.rightHandRotation);
    }

    // Update name tag
    this.nameTag.setPosition(this.root.position, this.avatar.customization.height!);
    this.nameTag.update(
      this.avatar.displayName,
      this.avatar.isEmoting ? this.avatar.currentEmote : undefined,
      this.avatar.isSpeaking
    );

    // Update visibility
    this.root.visible = this.avatar.visible;
  }

  /**
   * Get avatar root group
   */
  getRoot(): Group {
    return this.root;
  }

  /**
   * Update customization
   */
  updateCustomization(customization: Partial<AvatarCustomization>): void {
    Object.assign(this.avatar.customization, customization);
    this.createAvatarMeshes();
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.meshes.forEach((mesh) => {
      mesh.geometry.dispose();
      (mesh.material as Material).dispose();
    });
    this.meshes.clear();

    this.nameTag.dispose();

    this.scene.remove(this.root);
  }
}
