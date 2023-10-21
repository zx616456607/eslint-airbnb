module.exports = {
  // 继承推荐规范配置
  extends: [
    "stylelint-config-standard",
    "stylelint-config-recess-order",
  ],
  // 自定义规则
  rules: {
    // 缩进2个空格
    "indentation": 2,
    // 自定义属性和变量不做校验，为了防止theia提供的样式变量报错，比如--theia-textBlockQuote-background
    "custom-property-pattern": null,
    // 样式类名不做校验，为了防止theia提供的样式类名报错，比如 .dialogBlock，默认规则是 短横线命名(kebab-case): ^([a-z][a-z0-9]*)(-[a-z0-9]+)*$
    // 建议统一使用短横线命名
    "selector-class-pattern": null
  },
};
