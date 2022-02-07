
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Observable } from 'rxjs';

export abstract class ComponentFactory implements ZLUX.ComponentFactory {
  private capabilities: ZLUX.Capability[];
  private componentClass: ZLUX.ComponentClass;

  constructor(componentClass: ZLUX.ComponentClass, capabilities: ZLUX.Capability[]) {
    this.capabilities = capabilities;
    this.componentClass = componentClass;
  }

  getCapabilities(): ZLUX.Capability[] {
    return this.capabilities;
  }

  getClass(): ZLUX.ComponentClass {
    return this.componentClass;
  }

  abstract instantiateIntoDOM(target: HTMLElement): Observable<ZLUX.IComponent>;
}

export class Registry implements ZLUX.Registry {
  private componentFactories: ZLUX.ComponentFactory[];

  constructor() {
    this.componentFactories = [];
  }

  registerComponentFactory(factory: ZLUX.ComponentFactory): void {
    this.componentFactories.push(factory);
  }

  getComponentFactories(componentClass: ZLUX.ComponentClass, capabilities: ZLUX.Capability[]): ZLUX.ComponentFactory[] {
    let componentFactories: ZLUX.ComponentFactory[] = [];

    for (const factory of this.componentFactories) {
      const factoryCapabilities = factory.getCapabilities();
      if (factory.getClass() == componentClass && capabilities.every((cap) => factoryCapabilities.indexOf(cap) != -1)) {
        componentFactories.push(factory);
      }
    }

    return componentFactories;
  }
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
