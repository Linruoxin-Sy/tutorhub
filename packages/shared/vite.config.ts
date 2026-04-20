import { mergeConfig } from 'vite';
import { createBaseConfig } from '@tutorhub/config/vite/base';

export default mergeConfig(createBaseConfig(__dirname), {});
