import lodash from 'lodash';
import { editSumbissionEdnpoint, formEndpoint, submittedDataEndpoint } from './constants';
import { v4 } from 'uuid';
import { BaseFormSubmission, Color, Form, LogFn, RegFormSubmission } from './types';
import { createErrorLog, createInfoLog, createVerboseLog } from './utils';

const { flatMap } = lodash;

export const customFetch: typeof fetch = async (...rest) => {
  const response = await fetch(...rest);
  if (response?.ok) {
    return response;
  }
  throw Error('Network request failed or was not successful');
};

/** Service class that abstracts function calls to ona data api */
export class OnaApiService {
  private baseUrl: string;
  private token: string;
  private logger: LogFn | undefined;

  constructor(baseUrl: string, apiToken: string, logger?: LogFn) {
    this.baseUrl = baseUrl;
    this.token = apiToken;
    this.logger = logger;
  }

  /** defines shared options to be added to fetch request */
  getCommonFetchOptions() {
    return {
      headers: {
        Authorization: `token ${this.token}`,
        'content-type': 'application/json'
      }
    };
  }

  /** fetches single form with the given id
   * @param formId - form id for form
   * @param getFormPath - endpoint to use when fetching forms
   */
  async fetchSingleForm(formId: string, getFormPath: string = formEndpoint) {
    const formUrl = `${this.baseUrl}/${getFormPath}/${formId}`;
    return customFetch(formUrl, { ...this.getCommonFetchOptions() })
      .then((res) => {
        this.logger?.(createVerboseLog(`Fetched form id: ${formId}`));
        return res.json() as Promise<Form>;
      })
      .catch((err) => {
        this.logger?.(createErrorLog(`Unable to fetch form with id: ${formId}`));
        throw err;
      });
  }

  /** fetches submissions for form with the givenId
   * @param formId - form id whose submissions we should fetch
   * @param totalSubmissions - Total number of submissions
   * @param extraQueryObj - extra search query params
   * @param getSubmissionsPath - endpoint
   */
  async fetchPaginatedFormSubmissions<FormSubmissionT extends BaseFormSubmission>(
    formId: string,
    totalSubmissions: number,
    extraQueryObj: Record<string, string> = {},
    getSubmissionsPath: string = submittedDataEndpoint
  ) {
    this.logger?.(createVerboseLog(`Start fetching submissions for form id: ${formId}`));
    const fullSubmissionsUrl = `${this.baseUrl}/${getSubmissionsPath}/${formId}`;
    const fetchSubmissionPromises: (() => Promise<FormSubmissionT[]>)[] = [];
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
        customFetch(paginatedSubmissionsUrl, { ...this.getCommonFetchOptions() })
          .then((res) => {
            return (res.json() as Promise<FormSubmissionT[]>).then((res) => {
              this.logger?.(
                createInfoLog(
                  `Fetched ${res.length} submissions for form id: ${formId} page: ${paginatedSubmissionsUrl}`
                )
              );
              return res;
            });
          })
          .catch((err) => {
            this.logger?.(
              createErrorLog(
                `Unable to fetch submissions for form id: ${formId} page: ${paginatedSubmissionsUrl} with err : ${err.message}`
              )
            );
            throw err;
          })
      );
      page = page + 1;
    } while (page * pageSize < totalSubmissions);
    return await Promise.allSettled(fetchSubmissionPromises.map((x) => x())).then((jsonArrays) => {
      const flattened = (
        flatMap(jsonArrays).filter(
          (obj) => obj.status === 'fulfilled'
        ) as unknown as PromiseFulfilledResult<FormSubmissionT>[]
      ).map((obj) => obj.value);
      this.logger?.(
        createInfoLog(`Fetched ${flattened.length} submissions for form id: ${formId}`)
      );
      return flattened;
    });
  }

  /** makes single reqest to edit a single form submission
   * @param formId - the id of form whose submission is being edited
   * @param submissionPayload - obj representing onadata submission
   * @param editSubmissionPath - endpoint to send data.
   */
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
    return await customFetch(fullEditSubmissionUrl, {
      ...this.getCommonFetchOptions(),
      method: 'POST',
      body: JSON.stringify(payload)
    })
      .then((res) => {
        this.logger?.(createVerboseLog(`Edited submission with _id: ${submissionPayload._id}`));
        return res.json();
      })
      .catch((err) => {
        this.logger?.(
          createErrorLog(`Failed to edit submission with _id: ${submissionPayload._id}`)
        );
        throw err;
      });
  }
}

/** wrapper that helps fetch all submissions made for a certain form
 * @param service - Service class object
 * @param formId - pull submissions for form with this id.
 */
export async function getAllFormSubmissions<FormSubmissionT extends BaseFormSubmission>(
  service: OnaApiService,
  formId: string,
  logger?: LogFn
) {
  return service
    .fetchSingleForm(formId)
    .then((form) => {
      const submissionCount = form.num_of_submissions;
      return service.fetchPaginatedFormSubmissions<FormSubmissionT>(formId, submissionCount);
    })
    .catch((err) => {
      logger?.(
        createErrorLog(
          `Failed to get all form submissions for form Id: ${formId} with err: ${err.message}`
        )
      );
      return [] as FormSubmissionT[];
    });
}

/** wrapper that helps edit the marker color field in a submission push it to the api
 * @param service - Service class object
 * @param formId - form whose submission is being edited
 * @param submission - original submission object
 * @param colorCode - color to change the submission marker-color to.
 */
export async function upLoadMarkerColor(
  service: OnaApiService,
  formId: string,
  submission: RegFormSubmission,
  colorCode: Color,
  logger?: LogFn
) {
  const newSubmission = {
    ...submission,
    ['marker-color']: colorCode
  };
  return service.editSubmission(formId, newSubmission).catch((err) => {
    logger?.(
      createErrorLog(
        `Failed to edit sumbission with _id: ${submission._id} for form with id: ${formId} with err: ${err.message}`
      )
    );
  });
}
