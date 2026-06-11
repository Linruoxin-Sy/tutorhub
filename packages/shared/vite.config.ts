import { mergeConfig } from 'vite';

import { createBaseConfig } from '@tutorhub/config/vite';

export default mergeConfig(createBaseConfig(__dirname), {});
