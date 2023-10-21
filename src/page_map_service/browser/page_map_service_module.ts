import { ContainerModule } from '@theia/core/shared/inversify';
import { PageMapService } from './page_map';

export default new ContainerModule((bind) => {
  bind(PageMapService).toSelf().inSingletonScope();
});
