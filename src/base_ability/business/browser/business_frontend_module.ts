/*
 * @Author: huzhibo.189132
 * @Date: 2023-09-19 13:52
 * @LastEditors: zhangxuan189744 zhangxuan189744@hollysys.com
 * @LastEditTime: 2023-09-30 18:00:52
 * @Description: desc
 */
import { ContainerModule } from '@theia/core/shared/inversify';
import { BusinessService } from './business_service';
import { Business_request_client } from './business_request_client';

export default new ContainerModule((bind) => {
  bind(Business_request_client).toSelf().inSingletonScope();
  bind(BusinessService).toSelf().inSingletonScope();
});
