/**
 * Avatar Module
 *
 * User avatar system with VR tracking, network sync, and customization.
 */
// Legacy avatar system
export { AvatarComponent } from './avatar-component';
export { AvatarNameTag } from './name-tag';
export { AvatarRenderer } from './avatar-renderer';
export { AvatarSystem } from './avatar-system';
// New avatar configurator system
export { AvatarPreview } from './AvatarPreview';
export { AvatarConfigurator } from './AvatarConfigurator';
export { getAvatarApi, AvatarApi } from './api';
export { getAvatarPersistence, AvatarPersistenceManager } from './persistence';
