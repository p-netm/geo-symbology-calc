import { uuid, Config } from '../helpers/types';
import cron from 'node-cron';
import { ConfigRunner } from './configRunner';
import { isEqual } from 'lodash-es';
import { Result } from '../helpers/Result';

interface GetConfigs {
  (): Config[];
}

/** facade for managing one or more pipelines represented by their Symbol configs */
export class PipelinesController {
  /** stores pipelines - representin symbol configs passed to the constructor */
  private pipelines: Record<uuid, ConfigRunner> = {};
  /** stores cron scheduled tasks */
  private tasks: Record<uuid, cron.ScheduledTask> = {};
  /** returns the symbolConfigs. the configs can chane dynmacially that is why this is a function */
  private getConfigs: GetConfigs;

  constructor(getConfigs: GetConfigs) {
    const configs = getConfigs();
    const configPipelinesById: Record<uuid, ConfigRunner> = {};
    for (const config of configs) {
      const configPipeline = new ConfigRunner(config);
      configPipelinesById[config.uuid] = configPipeline;
    }
    this.pipelines = configPipelinesById;
    this.getConfigs = getConfigs;
  }

  /** Setup cron schedule tasks for all configs or single config if id is provided
   * @param configId - id for the config whose pipeline should be queed to run on a schedule.
   */
  evaluateOnSchedule(configId?: string) {
    if (configId) {
      const interestingPipeline = this.pipelines[configId];
      const task = interestingPipeline.schedule();
      this.tasks[configId] = task;
    }
    for (const pipeline of Object.values(this.pipelines)) {
      this.tasks[pipeline.config.uuid] = pipeline.schedule();
    }
  }

  /** stops and removes the cron tasks that run pipelines.
   * @param configId - stop only the pipeline that is keyed by this configid
   */
  stopScheduledEvaluations(configId?: string) {
    if (configId) {
      const interestingTask = this.tasks[configId];
      const interestingPipeline = this.pipelines[configId];
      interestingPipeline.cancel();
      interestingTask.stop();
    } else {
      for (const pipeline of Object.values(this.pipelines)) {
        pipeline.cancel();
      }
      for (const task of Object.values(this.tasks)) {
        task.stop();
      }
    }
  }

  /** Called to restart pipeline's evaluation should configs change */
  reEvaluatedScheduled() {
    const configs = this.getConfigs();
    const existingPipelinesCounter = {
      ...this.pipelines
    };
    for (const config of configs) {
      const thisConfigId = config.uuid;
      delete existingPipelinesCounter[thisConfigId];
      const existingPipeline = this.pipelines[thisConfigId];
      if (!existingPipeline) {
        // new config was added.
        this.pipelines[thisConfigId] = new ConfigRunner(config);
      } else if (!isEqual(this.pipelines.config, config)) {
        this.stopScheduledEvaluations(thisConfigId);
        // update pipeline
        existingPipeline.updateConfig(config);
        existingPipeline.schedule();
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [uuid, _] of Object.entries(existingPipelinesCounter)) {
      this.stopScheduledEvaluations(uuid);
      delete this.pipelines[uuid];
      delete this.tasks[uuid];
    }
  }

  /** Triggers a pipeline on demand outside its schedule
   * @param configId - id for the pipeline that should be triggered.
   */
  manualTriggerEvaluation(configId: string) {
    const interestingPipeline = this.pipelines[configId];
    if (!interestingPipeline) {
      return Result.fail(`Pipeline with config ${configId} was not found`);
    }
    interestingPipeline.transform();
    return Result.ok('Pipeline triggered successfully, running in the background');
  }

  /** cancel all running pipelines
   * @param configId - cancel single pipeline keyed by this configId
   */
  cancel(configId?: string) {
    if (configId) {
      const interestingPipeline = this.pipelines[configId];
      return interestingPipeline.cancel();
    } else {
      const cancelResults = [];
      for (const pipelines of Object.values(this.pipelines)) {
        cancelResults.push(pipelines.cancel());
      }
      return cancelResults;
    }
  }

  /** returns all pipelines created so far */
  getPipelines(configId?: string) {
    if (configId) {
      return this.pipelines[configId];
    }
    return Object.values(this.pipelines);
  }

  /** returns tasks for the queued schedule runs. */
  getTasks(configId?: string) {
    if (configId) {
      return this.tasks[configId];
    }
    return Object.values(this.tasks);
  }
}
