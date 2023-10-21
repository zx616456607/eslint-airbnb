/*
 * @Author: huzhibo.189132
 * @Date: 2023-09-22 16:44
 * @LastEditors: huzhibo.189132
 * @LastEditTime: 2023-09-25 09:29
 * @Description: desc
 */
import { ContainerModule } from '@theia/core/shared/inversify';
import { ElectronMainApplication } from '@theia/core/lib/electron-main/electron-main-application';
import { CustomElectronMainApplication } from './electron_main_applicatin';

export default new ContainerModule((bind, unbind, isBound) => {
  if (isBound(ElectronMainApplication)) {
    unbind(ElectronMainApplication);
  }

  bind(ElectronMainApplication).to(CustomElectronMainApplication).inSingletonScope();
});
