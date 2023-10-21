/*
 * @Author: huzhibo.189132
 * @Date: 2023-09-22 16:44
 * @LastEditors: huzhibo.189132
 * @LastEditTime: 2023-09-25 09:29
 * @Description: desc
 */
import { ElectronMainApplication } from '@theia/core/lib/electron-main/electron-main-application';
import { BrowserWindow } from '@theia/core/electron-shared/electron';
import { DEFAULT_WINDOW_HASH } from '@theia/core/lib/common/window';
import { injectable } from '@theia/core/shared/inversify';
import { MaybePromise } from '@theia/core/lib/common/types';
import { TheiaBrowserWindowOptions } from '@theia/core/lib/electron-main/theia-electron-window';

@injectable()
export class CustomElectronMainApplication extends ElectronMainApplication {
  override async openDefaultWindow(): Promise<BrowserWindow> {
    const [uri, electronWindow] = await Promise.all([this.createWindowUri(), this.createWindow()]);
    electronWindow.loadURL(uri.withFragment(DEFAULT_WINDOW_HASH).toString(true));
    electronWindow.webContents.openDevTools(); // 打开控制台
    return electronWindow;
  }

  async createWindow(asyncOptions: MaybePromise<TheiaBrowserWindowOptions> = this.getDefaultTheiaWindowOptions()): Promise<BrowserWindow> {
    const window = await super.createWindow(asyncOptions);
    window.webContents.openDevTools(); // 打开控制台
    return window;
  }
}
