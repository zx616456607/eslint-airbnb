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

/* eslint-disable max-len, @typescript-eslint/indent */

import { injectable, inject } from '@theia/core/shared/inversify';
import { MAIN_MENU_BAR, SETTINGS_MENU, MenuContribution, MenuModelRegistry } from '@theia/core/lib/common/menu';
import { CommandContribution, CommandRegistry, Command, CommandService } from '@theia/core/lib/common/command';
import { nls } from '@theia/core/lib/common/nls';
import { codicon } from '@theia/core/lib/browser';
// import { IBuildServer } from '../common/build-control';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { KeybindingContribution, KeybindingRegistry } from '@theia/core/lib/browser/keybinding';

export namespace CommonMenus {
  // 文件
  export const ATU_FILE = [...MAIN_MENU_BAR, '1_atu_file'];
  // 文件分组
  export const ATU_FILE_NEW = [...ATU_FILE, '0_atu_new'];

  // 编辑
  export const ATU_EDIT = [...MAIN_MENU_BAR, '2_atu_edit'];

  // 视图
  export const ATU_VIEW = [...MAIN_MENU_BAR, '3_atu_view'];
  export const ATU_VIEW_PRIMARY = [...ATU_VIEW, '0_primary'];

  // 工程
  export const ATU_PROJECT = [...MAIN_MENU_BAR, '4_atu_project'];

  // 编译
  export const ATU_COMPILE = [...MAIN_MENU_BAR, '5_atu_compile'];

  // 在线
  export const ATU_ONLINE = [...MAIN_MENU_BAR, '6_atu_online'];

  // 调试
  export const ATU_DEBUG = [...MAIN_MENU_BAR, '7_atu_debug'];

  // 工具
  export const ATU_TOOL = [...MAIN_MENU_BAR, '8_atu_tool'];

  // 帮助
  export const ATU_HELP = [...MAIN_MENU_BAR, '9_atu_help'];

  export const SETTINGS_OPEN = [...SETTINGS_MENU, '1_settings_open'];
  export const SETTINGS__THEME = [...SETTINGS_MENU, '2_settings_theme'];
}

export namespace CommonCommands {
  export const FILE_CATEGORY = 'File';
  export const VIEW_CATEGORY = 'View';
  export const PREFERENCES_CATEGORY = 'Preferences';
  export const FILE_CATEGORY_KEY = nls.getDefaultKey(FILE_CATEGORY);
  export const VIEW_CATEGORY_KEY = nls.getDefaultKey(VIEW_CATEGORY);
  export const PREFERENCES_CATEGORY_KEY = nls.getDefaultKey(PREFERENCES_CATEGORY);

  export const ATU_SAVE = Command.toDefaultLocalizedCommand({
    id: 'core.save',
    label: 'Save',
  });
}

// 定义菜单数据类型
interface children {
  id: string; // id
  label?: string; // 名称
  iconClass: string; // 图标
  location: string[]; // 父节点位置
  order: string; // 排序
  isEnabled: boolean; // 是否可点击
  keybinding: string; // 快捷键
  children?: children[]; // 子节点数据
}

@injectable()
export class CommonFrontendContribution
  implements MenuContribution, CommandContribution, KeybindingContribution, FrontendApplicationContribution
{
  constructor() {}

  @inject(CommandService)
  protected readonly commandService: CommandService;

  async configure(): Promise<void> {}

  // 定义递归注册菜单函数
  deepMenuFun = (registry: MenuModelRegistry, it: children) => {
    if (it.children && it.children.length && it.label) {
      registry.registerSubmenu([...MAIN_MENU_BAR, ...it.location], it.label, {
        order: it.order,
      });
      it.children.map((res) => this.deepMenuFun(registry, res)); // 再次调用本身
    } else {
      let command = {
        commandId: it.id,
        order: it.order,
      };
      if (it.label) {
        command = { ...command, label: nls.localizeByDefault(it.label) };
      }

      registry.registerMenuAction([...MAIN_MENU_BAR, ...it.location], command);
    }
  };

  // 注销主菜单原有节点
  unregisterOriginalMenu(registry: MenuModelRegistry): void {
    // 删除主菜单原有节点
    const removeNodes = ['1_file', '2_edit', '3_selection', '4_view', '5_go', '6_debug', '7_terminal', '9_help'];
    const mainMenu = registry.getMenu(MAIN_MENU_BAR);
    removeNodes.forEach((item) => mainMenu.removeNode(item));
  }

  // 注册菜单实现
  registerMenusImplement(registry: MenuModelRegistry, data: children[]): void {
    // 注册新的主菜单项
    data.forEach((element: children) => {
      this.deepMenuFun(registry, element);
    });
  }

  // 注册菜单
  registerMenus(registry: MenuModelRegistry): void {
    // 注销主菜单原有节点
    // this.unregisterOriginalMenu(registry);
    // this.registerMenusImplement(registry, this.menuData.data)
    // 注册一级菜单
    //  this.menuData.forEach((element: children) => {
    //     registry.registerSubmenu([...MAIN_MENU_BAR, ...element.location], nls.localizeByDefault(element.label));
    // });
  }

  // 定义递归注册指令函数
  protected deepCommandFun = (commandRegistry: CommandRegistry, it: children) => {
    if (it.children && it.children.length) {
      it.children.map((res) => this.deepCommandFun(commandRegistry, res)); // 再次调用本身
    } else {
      commandRegistry.registerCommand(
        { ...it, iconClass: codicon(it.iconClass) },
        {
          isEnabled: () => it.isEnabled, // false: 禁用菜单项 true: 菜单项可点击
          execute: () => {},
        }
      );
    }
  };

  // 注册命令实现
  registerCommandsImplement(commandRegistry: CommandRegistry, data: children[]): void {
    // 命令应在各扩展中单独注册，以下只为演示
    data.forEach((element: children) => {
      this.deepCommandFun(commandRegistry, element);
    });
  }

  // 注册命令
  registerCommands(commandRegistry: CommandRegistry): void {
    // 命令应在各扩展中单独注册，以下只为演示
    // this.registerCommandsImplement(commandRegistry, this.menuData.data);
  }

  // 定义递归注册快捷键
  deepKeybindingsFun = (keybindingRegistry: KeybindingRegistry, it: children) => {
    if (it.children && it.children.length) {
      it.children.map((res) => this.deepKeybindingsFun(keybindingRegistry, res)); // 再次调用本身
    } else {
      keybindingRegistry.registerKeybinding({
        command: it.id, // false: 禁用菜单项 true: 菜单项可点击
        keybinding: it.keybinding,
      });
    }
  };

  // 注册快捷键实现
  registerKeybindingsImplement(keybindingRegistry: KeybindingRegistry, data: children[]): void {
    // 命令应在各扩展中单独注册，以下只为演示
    data.forEach((element: children) => {
      this.deepKeybindingsFun(keybindingRegistry, element);
    });
  }

  // 注册快捷键
  registerKeybindings(keybindingRegistry: KeybindingRegistry): void {
    // 命令应在各扩展中单独注册，以下只为演示
    // this.registerKeybindingsImplement(keybindingRegistry, this.menuData.data)
  }
}
