import * as React from 'react';
import { cloneDeep } from 'lodash';
import { DialogError, DialogMode, DialogProps } from '@theia/core/lib/browser';
import { Message } from '@theia/core/lib/browser/widgets';
import { CancellationTokenSource, MaybePromise } from '@theia/core/lib/common';
import { ReactDialog } from '@theia/core/lib/browser/dialogs/react-dialog';

import './dialog.css';

// disabled值，用户可传函数或者boolean值
type DisableValue = boolean | ((value: unknown) => boolean);
// 格式化后的disabled
type DisableFn = (...value: unknown[]) => boolean;
// 表单项的数据结构
type ContentProps = Record<string, unknown>;
// 表单值基本类型
type FormValueField = string | number | undefined;

// 表单值复杂类型
interface FormValue {
  [key: string]: FormValueField | [] | FormValue;
}
// 按钮配置
interface ButtonOpts {
  // 按钮文字
  text: string;
  // 点击按钮的回调
  callback?: (...args: unknown[]) => unknown;
  // 按钮类型是否为primary
  primary?: boolean;
  // 是否禁用
  disabled?: DisableValue;
  // 只有“确认”和“取消”按钮有index属性
  type?: 'cancel' | 'confirm';
}
// 要传给弹框的属性（除了react组件）
interface SuperDialogProps {
  // 调接口校验
  beforeAccept?: (value: FormValue) => MaybePromise<DialogError>;
  // 前端校验
  isValid?: (value: FormValue, mode: DialogMode) => MaybePromise<DialogError>;
  // 是否模态框
  module?: boolean;
  // 取消按钮文本
  cancel?: string;
  // 确定按钮文本
  confirm?: string;
  // 要添加的类名
  clsName?: string;
  // 是否可拖拽
  draggable?: boolean;
  // 按钮数组， 按钮渲染后的顺序与传入的数组顺序一致
  buttons?: ButtonOpts[];
  // 偏移量
  offset?: {
    x: number;
    y: number;
  };
}

// dialog内容
interface DialogContent {
  // 弹框内（表单）默认值
  initialValue?: FormValue;
  // 弹框内的表单组件
  ContentComponent?: React.FC<ContentProps> | React.Component<ContentProps>;
  // 双击事件
  dblClick?: () => void;
  [key: string]: unknown;
}

export default class DialogGenerator extends ReactDialog<FormValue> {
  protected formData: FormValue = {};

  protected initialValue: FormValue = {};

  protected ContentComponent?: React.FC<ContentProps> | React.Component<ContentProps>;

  protected props: SuperDialogProps & DialogProps;

  protected options: DialogContent = {};

  protected restProps: Record<string, unknown> = {};

  // buttonMap，为了保存按钮事件和disabled值
  protected buttonsMap: Map<HTMLButtonElement, { callback?: (...args: unknown[]) => unknown; disabledFn: DisableFn }>;

  /**
   *
   * @returns MaybePromise<DialogError>
   * eg: isValid(value: Record<string, any>, mode: DialogMode): MaybePromise<DialogError> {
          return new Promise((resolve, reject) => {
            // 校验不通过
            if (!validate) {
              resolve({
                message: '校验失败',
                result: false
              })
            } else {
              // 校验通过
              resolve('')
            }
          });
        }
   */
  isValid: (value: FormValue, mode: DialogMode) => MaybePromise<DialogError> = () => '';

  beforeAccept: (value: FormValue) => MaybePromise<DialogError> = () => Promise.resolve('');

  constructor(props: SuperDialogProps & DialogProps, options: DialogContent = {}) {
    const { clsName = '', draggable = false } = props;
    const { initialValue = {}, dblClick = () => undefined, ...restProps } = options;
    super({ title: props.title });
    this.options = options;
    this.props = props;
    this.ContentComponent = options.ContentComponent;
    const { module = true } = props;
    // 是否模态框
    if (!module) {
      this.addClass('not-module-dialog');
      // 这里remove操作的用处是清除缓存
    } else {
      this.removeClass('not-module-dialog');
    }
    // 添加自定义的class
    if (clsName) {
      this.addClass(clsName);
    }
    if (draggable) {
      this.addClass('draggable-dialog__wrapper');
      // 添加拖拽事件
      this.titleNode.parentNode!.addEventListener('mousedown', this.startDrag.bind(this));
    } else {
      this.removeClass('draggable-dialog__wrapper');
    }
    this.beforeAccept = props.beforeAccept || this.beforeAccept;
    this.isValid = props.isValid || this.isValid;
    this.initialValue = initialValue;
    this.restProps = restProps;
    this.buttonsMap = new Map();
    this.init();
  }

  init() {
    this.toInitValue();
    const { buttons } = this.props;
    // 添加按钮及其事件
    if (buttons && buttons.length) {
      buttons.forEach((button) => {
        const { text, callback, primary = false, disabled = false, type } = button;
        if (type === 'cancel') {
          this.appendCloseButton(text);
        } else if (type === 'confirm') {
          this.appendAcceptButton(text);
        } else {
          const result = this.appendButton(text, primary);
          const disabledFn = DialogGenerator.getDisabledValue(disabled);
          result.disabled = disabledFn(this.formData);
          this.buttonsMap.set(result, { callback, disabledFn });
        }
      });
    }
  }

  protected override onAfterAttach(msg: Message) {
    super.onAfterAttach(msg);
    [...this.buttonsMap.entries()].forEach(([button, { callback }]) => {
      this.addAction(button, () => callback?.(this.formData), 'click');
    });
    // 偏移弹框位置
    const { offset } = this.props;
    const container = this.node.getElementsByClassName('dialogBlock')[0];
    const { offsetLeft } = container as HTMLElement;
    const { offsetTop } = container as HTMLElement;
    (container as HTMLElement).style.left = `${offsetLeft + (offset?.x || 0)}px`;
    (container as HTMLElement).style.top = `${offsetTop + (offset?.y || 0)}px`;
  }

  public updateTitle(title: string) {
    this.titleNode.textContent = title;
  }

  get value() {
    return this.formData;
  }

  get rooNode() {
    return this.contentNodeRoot;
  }

  // 给弹框赋初始值
  toInitValue() {
    this.formData = cloneDeep(this.initialValue);
  }

  // 更新弹框值
  updateValue = async (key: string, value: FormValueField) => {
    this.formData = Object.assign(this.formData, {
      [key]: value,
    });
    // 弹框值修改后，按钮状态修改
    [...this.buttonsMap.entries()].forEach(([button, { disabledFn }]) => {
      button.disabled = disabledFn(this.formData);
    });
    await this.renderComponent();
  };

  dblClick = async () => {
    // this.options
    await this.accept();
    this.close();
  };

  async accept() {
    if (!this.resolve) {
      return;
    }
    this.acceptCancellationSource.cancel();
    this.acceptCancellationSource = new CancellationTokenSource();
    const { token } = this.acceptCancellationSource;
    const { value } = this;
    const error = await this.isValid(value, 'open');
    if (token.isCancellationRequested) {
      return;
    }
    if (!DialogError.getResult(error)) {
      this.setErrorMessage(error);
    } else {
      const validateError = await this.beforeAccept(this.value);
      if (!DialogError.getResult(validateError)) {
        this.setErrorMessage(validateError);
      } else {
        this.resolve(value);
        this.renderDialogWidget();
      }
    }
  }

  // 获取指定设备类型的默认数据及组件
  async renderDialogWidget() {
    this.formData = cloneDeep(this.initialValue);
    await this.renderComponent();
  }

  async renderComponent() {
    this.update();
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 0);
    });
  }

  async proxyOpen() {
    await this.renderDialogWidget();
    const dialogValue = await super.open();
    return dialogValue;
  }

  protected startDrag(event: MouseEvent): void {
    const newNode = this.titleNode.parentNode!.parentNode as HTMLElement;
    if (event.target instanceof HTMLElement && event.target.classList.contains('dialogTitle')) {
      const initialMouseX = event.clientX;
      const initialMouseY = event.clientY;
      const initialDialogLeft = newNode.offsetLeft;
      const initialDialogTop = newNode.offsetTop;
      const handleMouseMove = (e: MouseEvent) => {
        const newDialogLeft = initialDialogLeft + e.clientX - initialMouseX;
        const newDialogTop = initialDialogTop + e.clientY - initialMouseY;
        newNode.style.left = `${newDialogLeft}px`;
        newNode.style.top = `${newDialogTop}px`;
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  }

  render() {
    const { ContentComponent } = this;
    if (ContentComponent) {
      // @ts-ignore
      return <ContentComponent formData={this.formData} dblClick={this.dblClick} updateValue={this.updateValue} {...this.restProps} />;
    }
  }

  static getDisabledValue = (disabled: DisableValue) =>
    typeof disabled === 'boolean' ? () => disabled : (value: unknown) => disabled(value);

  static async generateDialog(props: SuperDialogProps & DialogProps, options: DialogContent) {
    const addModuleDialog = new DialogGenerator(props, options);
    const result = await addModuleDialog.proxyOpen();
    return {
      result,
      dialog: addModuleDialog,
    };
  }
}
