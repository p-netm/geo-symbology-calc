import lodash from 'lodash';
import { editSumbissionEdnpoint, formEndpoint, submittedDataEndpoint } from './constants';
import { v4 } from 'uuid';
import { Color, LogFn } from './types';
import { createErrorLog, createInfoLog, createVerboseLog } from './utils';

const { flatMap } = lodash;

/** create a service class */
export class OnaApiService {
  private baseUrl: string;
  private token: string;
  private logger: LogFn | undefined;

  constructor(baseUrl: string, apiToken: string, logger?: LogFn) {
    this.baseUrl = baseUrl;
    this.token = apiToken;
    this.logger = logger;
  }

  getCommonFetchOptions() {
    return {
      headers: {
        Authorization: `token ${this.token}`
      }
    };
  }

  async fetchSingleForm(formId: string, getFormPath: string = formEndpoint) {
    const formUrl = `${this.baseUrl}/${getFormPath}/${formId}`;
    return fetch(formUrl, { ...this.getCommonFetchOptions() })
      .then((res) => {
        this.logger?.(createVerboseLog(`Fetched form id: ${formId}`));
        return res.json();
      })
      .catch((err) => {
        this.logger?.(createErrorLog(`Unable to fetch form with id: ${formId}`));
        throw err;
      });
  }

  async fetchPaginatedFormSubmissions(
    formId: string,
    submissionCount: number,
    extraQueryObj: Record<string, string> = {},
    getSubmissionsPath: string = submittedDataEndpoint
  ) {
    // TODO - tool to better create urls
    this.logger?.(createVerboseLog(`Start fetching submissions for form id: ${formId}`));
    const fullSubmissionsUrl = `${this.baseUrl}/${getSubmissionsPath}/${formId}`;
    const fetchSubmissionPromises = [];
    const pageSize = 100;
    let page = 1;
    do {
      const query = {
        pageSize: `${pageSize}`,
        page: `${page}`,
        ...extraQueryObj
      };
      const sParams = new URLSearchParams(query);
      const paginatedSubmissionsUrl = `${fullSubmissionsUrl}?${sParams.toString()}`;
      fetchSubmissionPromises.push(() =>
        fetch(paginatedSubmissionsUrl, { ...this.getCommonFetchOptions() }).then((res) =>
          res.json()
        )
      );
      page = page + 1;
    } while (page * pageSize < submissionCount);
    return Promise.all(fetchSubmissionPromises.map((x) => x()))
      .then((jsonArrays) => {
        const flattened = flatMap(jsonArrays);
        this.logger?.(
          createInfoLog(`Fetched ${flattened.length} submissions for form id: ${formId}`)
        );
        return flattened;
      })
      .catch((err) => {
        this.logger?.(createErrorLog(`Unable to fetch submissions for form id: ${formId}`));
        throw err;
      });
  }
  async editSubmission(
    formId: string,
    submissionPayload: Record<string, unknown>,
    editSubmissionPath: string = editSumbissionEdnpoint
  ) {
    const oldInstanceId = submissionPayload['meta/instanceID'];
    const newInstanceId = `uuid:${v4()}`;
    const payload = {
      id: formId,
      submission: {
        ...submissionPayload,
        meta: {
          instanceID: newInstanceId,
          deprecatedID: oldInstanceId
        }
      }
    };
    const fullEditSubmissionUrl = `${this.baseUrl}/${editSubmissionPath}`;
    return fetch(fullEditSubmissionUrl, {
      ...this.getCommonFetchOptions(),
      method: 'POST',
      body: JSON.stringify(payload)
    })
      .then((res) => {
        this.logger?.(createVerboseLog(`Edited submission with prk: ${submissionPayload._id}`));
        res.json();
      })
      .catch((err) => {
        this.logger?.(
          createErrorLog(`Failed to edit submission with primaryKey: ${submissionPayload._id}`)
        );
        throw err;
      });
  }
}

export async function getAllFormSubmissions(service: OnaApiService, formId: string) {
  return service.fetchSingleForm(formId).then((form) => {
    const submissionCount = form.num_of_submissions;
    return service.fetchPaginatedFormSubmissions(formId, submissionCount);
  });
}

export async function upLoadMarkerColor(
  service: OnaApiService,
  formId: string,
  submission: Record<string, string>,
  colorCode: Color
) {
  const newSubmission = {
    ...submission,
    ['marker-color']: colorCode
  };
  return service.editSubmission(formId, newSubmission);
}
