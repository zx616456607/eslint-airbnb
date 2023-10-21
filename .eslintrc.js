/*
 * @Author: zhangxuan189744 zhangxuan189744@hollysys.com
 * @Date: 2023-09-30 11:16:56
 * @LastEditors: zhangxuan189744 zhangxuan189744@hollysys.com
 * @LastEditTime: 2023-09-30 17:45:43
 * @FilePath: \eslint-airbnb\.eslintrc.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
module.exports = {
  extends: ['airbnb', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'import/extensions': 'off', // 导入不用写文件后缀
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error', { ignoreTypeReferences: true }],
    'no-prototype-builtins': 'off',
    'no-underscore-dangle': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-namespace': 'warn', // es6模块化优于namespace
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
        moduleDirectory: ['node_modules', './src'],
      },
    },
  },
  ignorePatterns: ["node_modules/", "lib/", ".eslintrc.js"],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
}
