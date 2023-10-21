import { injectable, interfaces } from '@theia/core/shared/inversify';
import * as React from 'react';

@injectable()
export class PageMapService {
  private _data: Map<interfaces.ServiceIdentifier, () => React.ReactNode> = new Map();

  get data() {
    return this._data;
  }

  registryPage(key: interfaces.ServiceIdentifier, componentFactory: () => React.ReactNode): Promise<() => React.ReactNode> {
    return new Promise((resolve, reject) => {
      if (this.hasPage(key)) {
        reject(`${key.toString()}已经注册过`);
      } else {
        this._data.set(key, componentFactory);
        resolve(componentFactory);
      }
    });
  }

  hasPage(key: interfaces.ServiceIdentifier) {
    return this._data.has(key);
  }

  getPage(key: interfaces.ServiceIdentifier): Promise<(() => React.ReactNode) | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.hasPage(key)) {
        reject(`页面${key.toString()}未被注册过`);
      } else {
        resolve(this._data.get(key));
      }
    });
  }
}
