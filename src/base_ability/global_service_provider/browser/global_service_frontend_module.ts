/*
 * @Author: huzhibo.189132
 * @Date: 2023-09-19 15:09
 * @LastEditors: huzhibo.189132
 * @LastEditTime: 2023-09-20 14:30
 * @Description: 在前端绑定
 */
import { ContainerModule } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { GlobalServiceProvider } from '../common/global_service_provider';

export default new ContainerModule((bind) => {
  bind(FrontendApplicationContribution)
    .toDynamicValue((ctx) => new GlobalServiceProvider(ctx.container))
    .inSingletonScope();
});
