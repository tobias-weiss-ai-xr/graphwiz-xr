/**
 * Avatar Name Tag Component
 *
 * Floating name tag above avatar showing user info and status.
 */

import { Vector3, Color, SpriteMaterial, Sprite, Texture, CanvasTexture } from 'three';

export interface NameTagConfig {
  showUserId?: boolean;
  showStatus?: boolean;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  padding?: number;
  borderRadius?: number;
}

export class AvatarNameTag {
  public readonly sprite: Sprite;
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;
  public readonly texture: CanvasTexture;
  private needsUpdate = false;

  constructor(
    displayName: string,
    config: NameTagConfig = {}
  ) {
    const {
      showUserId = false,
      showStatus = true,
      backgroundColor = 'rgba(0, 0, 0, 0.7)',
      textColor = 'white',
      fontSize = 24,
      padding = 10,
      borderRadius = 8,
    } = config;

    // Create canvas for text
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 128;
    this.ctx = this.canvas.getContext('2d')!;

    // Create texture from canvas
    this.texture = new CanvasTexture(this.canvas);

    // Create sprite
    const material = new SpriteMaterial({
      map: this.texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    this.sprite = new Sprite(material);
    this.sprite.scale.set(2, 0.5);

    // Store config
    (this.sprite as any).config = { showUserId, showStatus, backgroundColor, textColor, fontSize, padding, borderRadius };
    (this.sprite as any).displayName = displayName;

    // Initial render
    this.render(displayName, '', false);
  }

  /**
   * Update name tag content
   */
  update(displayName: string, status?: string, isSpeaking?: boolean): void {
    (this.sprite as any).displayName = displayName;
    this.render(displayName, status, isSpeaking);
  }

  /**
   * Render name tag to canvas
   */
  private render(displayName: string, status: string, isSpeaking: boolean): void {
    const { ctx, canvas } = this;
    const config = (this.sprite as any).config as NameTagConfig;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Measure text
    ctx.font = `bold ${config.fontSize}px Arial`;
    const textMetrics = ctx.measureText(displayName);
    const textWidth = textMetrics.width;

    // Calculate background size
    const bgWidth = textWidth + config.padding! * 2;
    const bgHeight = config.fontSize! + config.padding! * 2;
    const x = (canvas.width - bgWidth) / 2;
    const y = (canvas.height - bgHeight) / 2;

    // Draw rounded rectangle background
    ctx.fillStyle = config.backgroundColor!;
    this.roundRect(ctx, x, y, bgWidth, bgHeight, config.borderRadius!);
    ctx.fill();

    // Draw text
    ctx.fillStyle = config.textColor!;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayName, canvas.width / 2, canvas.height / 2);

    // Draw speaking indicator
    if (isSpeaking) {
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(canvas.width / 2 - textWidth / 2 - 10, canvas.height / 2, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Update texture
    this.texture.needsUpdate = true;
  }

  /**
   * Draw rounded rectangle
   */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Set position above avatar
   */
  setPosition(avatarPosition: Vector3, avatarHeight: number): void {
    this.sprite.position.set(
      avatarPosition.x,
      avatarPosition.y + avatarHeight + 0.3,
      avatarPosition.z
    );
  }

  /**
   * Update for camera
   */
  update(): void {
    // Billboard - always face camera
    this.sprite.material.rotation = 0;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.texture.dispose();
    (this.sprite.material as SpriteMaterial).dispose();
  }
}
