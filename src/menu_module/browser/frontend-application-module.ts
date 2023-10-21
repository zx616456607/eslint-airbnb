/*
 * @Author: zhangxuan189744 zhangxuan189744@hollysys.com
 * @Date: 2023-09-30 14:41:55
 * @LastEditors: zhangxuan189744 zhangxuan189744@hollysys.com
 * @LastEditTime: 2023-09-30 16:35:50
 * @FilePath: \eslint-airbnb\src\menu_module\browser\frontend-application-module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// *****************************************************************************
// Copyright (C) 2017 TypeFox and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// This Source Code may also be made available under the following Secondary
// Licenses when the conditions for such availability set forth in the Eclipse
// Public License v. 2.0 are satisfied: GNU General Public License, version 2
// with the GNU Classpath Exception which is available at
// https://www.gnu.org/software/classpath/license.html.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
// *****************************************************************************

import '@theia/core/src/browser/style/index.css';
import { ContainerModule } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { CommandContribution, MenuContribution } from '@theia/core/lib/common';
import { KeybindingContribution } from '@theia/core/lib/browser/keybinding';
import { bindResourceProvider, bindMessageService, bindPreferenceService } from '@theia/core/lib/browser/frontend-application-bindings';
import { CommonFrontendContribution } from './common-frontend-contribution';

require('@theia/core/src/browser/style/materialcolors.css').use();

export { bindResourceProvider, bindMessageService, bindPreferenceService };

export default new ContainerModule((bind, _unbind, _isBound, _rebind) => {
  bind(CommonFrontendContribution).toSelf().inSingletonScope();
  [FrontendApplicationContribution, CommandContribution, MenuContribution, KeybindingContribution].forEach((serviceIdentifier) =>
    bind(serviceIdentifier).toService(CommonFrontendContribution)
  );
});
