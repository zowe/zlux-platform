

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

export class SemanticVersion {
  major: number;
  minor: number;
  patch: number | null; // TODO: this probably shouldn't be
  identifiers: string | null;
  build: string | null;

  constructor(version: string) {
    const regex = /^(\d+)\.(\d+)(?:\.(\d+))?(?:-([0-9A-Za-z-]*))?(?:\+([0-9A-Za-z-]*))?$/;
    const match = regex.exec(version);

    if (match != null) {
      this.major = Number(match[1]);
      this.minor = Number(match[2]);
      this.patch = match[3] ? Number(match[3]) : null;

      this.identifiers = match[4] || null;
      this.build = match[5] || null;
    } else {
      throw new Error(`ZWED5043E - ${version} is not a valid semantic version`);
    }
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

