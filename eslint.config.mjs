import { defineConfig } from 'eslint/config';
import { configs } from '@croct/eslint-plugin';

export default defineConfig(
    configs.typescript,
    {
        rules: {
            '@typescript-eslint/unbound-method': 'off',
        }
    }
);