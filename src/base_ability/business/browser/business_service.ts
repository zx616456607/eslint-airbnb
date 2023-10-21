/*
 * @Author: huzhibo.189132
 * @Date: 2023-09-18 16:19
 * @LastEditors: zhangxuan189744 zhangxuan189744@hollysys.com
 * @LastEditTime: 2023-09-30 16:08:27
 * @Description: 在前端发起请求及添加事件监听的方法
 */
import { Disposable, MessageService, nls } from '@theia/core';
import { injectable, inject } from '@theia/core/shared/inversify';
import { WebSocketConnectionProvider } from '@theia/core/lib/browser';

import { Business_request_client } from './business_request_client';

@injectable()
export abstract class BusinessService {
  // 与后台交互数据的客户端实例
  protected readonly businessClient: Business_request_client = new Business_request_client();

  // 事件监听的缓存，eventName 到 事件数组的映射
  protected readonly eventMap: Map<string, BusinessService.BusinessEventHandler<unknown>[]> = new Map();

  @inject(MessageService)
  protected readonly messageService: MessageService;

  constructor(@inject(WebSocketConnectionProvider) ws: WebSocketConnectionProvider) {
    this.businessClient = new Business_request_client();
    ws.createProxy('', this.businessClient);
  }

  /**
   * @method       : fetch<T>
   * @template     T : 标注返回体的类型
   * @description  : 向后台发起请求
   * @param         {BusinessService.RequestHead} reqHead: 请求头
   * @param         {BusinessService.RequestBody} reqBody: 请求体
   * @param         {BusinessService.RequestEventHandler<unknown> | BusinessService.RequestOptions} eventHandlerOrOpts: 处理请求中后台给推送的消息
   * @param         {BusinessService.RequestOptions} opts : 发起请求时的选项
   * @return        {Promise<BusinessService.Response<T>>} 请求对应的业务数据
   */
  static fetch<T>(): Promise<BusinessService.Response<T>> {
    return new Promise((resolve) => {
      resolve({
        error: {
          error_id: 0,
          error_level: BusinessService.ErrorLevel.NORMAL_ERROR,
          error_desc: {
            desc_key: false,
            desc: '请求成功',
            params: [],
          },
        },
        data: {} as never,
      });
    });
  }

  /**
   * @method       : showErrorMessage
   * @description  : 展示错误信息
   * @param         {BusinessService.ResponseError} error: 后台响应的错误
   * @return        {void}
   */
  showErrorMessage(error: BusinessService.ResponseError): void {
    // 无错误不进行提示
    if (error.error_id === 0) {
      return;
    }
    const { desc_key = false, desc = '', params = [] } = error.error_desc;

    const message = desc_key ? nls.localize(desc, '', ...params) : desc;

    switch (error.error_level) {
      case BusinessService.ErrorLevel.WARNING:
        this.messageService.warn(message);
        break;
      case BusinessService.ErrorLevel.SERIOUS_ERROR:
        this.messageService.error(message);
        break;
      case BusinessService.ErrorLevel.NORMAL_ERROR:
      default:
        this.messageService.info(message);
        break;
    }
  }

  /**
   * @method       : addServerEventListener
   * @description  : 在前台监听后台业务广播的消息，不去重，多次添加，多次执行，执行返回的 Disposable 进行取消
   * @param         {BusinessService.Event} event : 用以区分后台发起的消息
   * @param         {BusinessService.EventHandler} listener : 监听的回调
   * @return        {*}
   */
  addServerEventListener<T>(event: BusinessService.BusinessEventType, listener: BusinessService.BusinessEventHandler<T>): Disposable {
    const eventName = BusinessService.generatorEventName(event);
    let listenerList = this.eventMap.get(eventName);

    // 将事件监听添加到队列中，如果没有则新建一个队列
    if (listenerList) {
      listenerList.push(listener);
    } else {
      listenerList = [listener];
      this.eventMap.set(eventName, listenerList);
    }

    // 返回 Disposable 供外部移除事件
    return Disposable.create(() => this.removeServerEventListener(eventName, listener));
  }

  // 移除事件监听，私有方法，外部请使用 addServerEventListener 返回的 Disposable 进行监听事件的移除
  protected removeServerEventListener(eventName: string, listener: BusinessService.BusinessEventHandler<unknown>): void {
    const listenerList = this.eventMap.get(eventName);

    // 未找到 name 对应的缓存则不删除
    if (!listenerList) {
      return;
    }

    // 在缓存列表中查找对应的事件
    const idx = listenerList.findIndex((l) => l === listener);
    // 未找到对应的回调则不删除
    if (idx === -1) {
      return;
    }

    // 移除对应的监听回调
    listenerList.splice(idx, 1);

    // 若监听缓存为空则删除对应的事件
    if (listenerList.length === 0) {
      this.eventMap.delete(eventName);
    }
  }

  /**
   * @method       : generatorEventName
   * @description  : 静态方法，根据配置生成事件名称，因为生成名称的规则可能会改，所以尽量使用此函数进行事件名称的生成
   * @param         {BusinessService.Event} event: 事件的响应
   * @return        {string}
   */
  static generatorEventName(event: BusinessService.BusinessEventType): string {
    return `${event.request_id}--${event.service_name}`;
  }
}

export namespace BusinessService {
  // 请求头数据
  export interface RequestHead {
    // 与后台约定的请求业务id
    request_id: string;
    // 与后台约定的插件名称
    service_name: string;
  }

  // 请求体
  export interface RequestBody<T> {
    // TODO 解决方案名称 待确定此参数从哪里来
    solution_id?: string;
    // 用户名称
    username?: string;
    // 工程名称
    project_id: string;
    // 自定义的业务数据
    data: T;
  }

  // 处理请求中间过程的信息，如果没有可忽略
  export type RequestEventHandler<T> = (data: T) => never;

  // 请求的选项
  export interface RequestOptions {
    // 默认为false，当为true时，对后台抛出的异常不会自动提示
    ignoreError?: boolean;
  }

  export enum ErrorLevel {
    WARNING = 0, // 警告
    NORMAL_ERROR = 1, // 普通错误
    SERIOUS_ERROR = 2, // 致命错误
  }

  // 响应错误消息
  export interface ResponseError {
    // TODO 会改为分组eg：1XXXX是POU错误，2XXXX是在线错误等 0 成功 其他是错误，具体根据操作而定
    error_id: number;
    // 错误级别：0 警告，1 普通错误，2 致命错误
    error_level: ErrorLevel;
    error_desc: {
      // 针对多语言，是否是字符串的Key
      desc_key: boolean;
      // 描述字符串，可能是字符串的Key
      desc: string;
      // 错误消息的动态参数
      params: Array<string>;
    };
  }

  // 业务响应结构
  export interface Response<T> {
    // 错误数据
    error: ResponseError;
    data: T;
  }

  // 生成事件监听name的选项
  export interface BusinessEventType {
    // 与后台约定的业务id
    request_id: string;
    // 与后台约定的插件名称
    service_name: string;
  }

  // 后台主动推送的事件的监听函数
  export declare type BusinessEventHandler<T> = (event: Response<T>) => never;

  // 请求的响应，本质是对Promise的包装
  export declare type BusinessResponse<T> = Promise<Response<T>>;

  // 判断响应是否成功
  export function isSuccess(res: Response<unknown>): boolean {
    return res?.error?.error_id === 0;
  }
}
