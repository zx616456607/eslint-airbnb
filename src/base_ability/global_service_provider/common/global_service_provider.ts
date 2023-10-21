/*
 * @Author: huzhibo.189132
 * @Date: 2023-09-19 15:06
 * @LastEditors: huzhibo.189132
 * @LastEditTime: 2023-09-21 14:52
 * @Description: desc
 */
import { interfaces } from '@theia/core/shared/inversify';

/**
 * 这类是为了我们方便的获取到theia中的一些service
 * 只有当你写的代码时深层级的react组件（不能inject或者层级太深导致props传参不方便）时
 * 满足以上条件时，才可使用这个类，其他情况下，必须使用依赖注入
 * 使用方法：
 *  GlobalServiceProvider.resolve(key: 要获取的service标识符)
 */
const ContainerName = Symbol('ContainerName');
const ProviderCache = {};

export class GlobalServiceProvider {
  constructor(container: interfaces.Container) {
    Object.defineProperty(ProviderCache, ContainerName, {
      get() {
        return {
          get: container.get.bind(container),
        };
      },
      enumerable: false,
      configurable: false,
    });
  }

  /**
   * @template     { any } T: 标注返回值的类型
   * @method       : resolve<T>
   * @description  : 返回要获取的service
   * @param         {interfaces.ServiceIdentifier} key: 传入的是Service对应的标识符
   * @return        { T | undefined } 获取的service，如果未找到标识符对应的service，则返回 undefined
   */
  static resolve<T>(key: interfaces.ServiceIdentifier): T | undefined {
    try {
      // @ts-ignore
      return ProviderCache[ContainerName].get<T>(key);
    } catch (ex) {
      console.log(`获取${String(key)}服务失败`);
    }
  }

  /**
   * @template     { any } T: 标注返回值的类型
   * @method       : get<T>
   * @description  : 返回要获取的service
   * @param         {interfaces.ServiceIdentifier} key: 传入的是Service对应的标识符
   * @return        { T | undefined } 获取的service，如果未找到标识符对应的service，则返回 undefined
   */
  static get<T>(key: interfaces.ServiceIdentifier): T | undefined {
    try {
      return GlobalServiceProvider.resolve<T>(key);
    } catch (e) {
      console.log(`获取${String(key)}服务失败`);
    }
  }
}
