/********************************************************************************
 * Copyright (C) 2021 ByteDance and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { ILogger, MaybePromise } from '@theia/core/lib/common/';
import { inject, injectable, named } from '@theia/core/shared/inversify';
import { Terminal } from '@theia/process/lib/node';
import { TaskInfo } from '../../common/task-protocol';
import { Task, TaskOptions } from '../task';
import { TaskManager } from '../task-manager';

export const TaskCustomOptions = Symbol('TaskCustomOptions');
export interface TaskCustomOptions extends TaskOptions {
    terminal?: Terminal
}

export const TaskFactory = Symbol('TaskFactory');
export type TaskFactory = (options: TaskCustomOptions) => CustomTask;

/** Represents a Task launched as a fake process by `CustomTaskRunner`. */
@injectable()
export class CustomTask extends Task {

    constructor(
        @inject(TaskManager) protected readonly taskManager: TaskManager,
        @inject(ILogger) @named('task') protected readonly logger: ILogger,
        @inject(TaskCustomOptions) protected readonly options: TaskCustomOptions
    ) {
        super(taskManager, logger, options);
        this.logger.info(`Created new custom task, id: ${this.id}, context: ${this.context}`);
    }

    /**
     * This task doesn't handle `Terminal` or processes, there is nothing to kill.
     */
    async kill(): Promise<void> { }

    getRuntimeInfo(): MaybePromise<TaskInfo> {
        return {
            taskId: this.id,
            ctx: this.context,
            config: this.options.config,
        };
    }

    callbackTaskComplete(exitCode?: number): MaybePromise<void> {
        this.fireTaskExited({
            taskId: this.taskId,
            ctx: this.context,
            config: this.options.config,
            code: exitCode || 0
        });
    }
}
