import { editSumbissionEdnpoint, formEndpoint, submittedDataEndpoint } from '../constants';
import { transform } from '../trasformer';
import {
  createConfigs,
  form3623,
  form3623Submissions,
  form3624Submissions
} from './fixtures/fixtures';
import { logCalls } from './fixtures/logCalls';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nock = require('nock');

const mockV4 = '0af4f147-d5fd-486a-bf76-d1bf850cc976';

jest.mock('uuid', () => {
  const v4 = () => mockV4;
  return { __esModule: true, ...jest.requireActual('uuid'), v4 };
});

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
});

it('works correctly nominal case', async () => {
  const loggerMock = jest.fn();
  const configs = createConfigs(loggerMock);

  // mock fetched firstform
  nock(configs.baseUrl).get(`/${formEndpoint}/3623`).reply(200, form3623);

  // mock getting submissions for each of first form submissions
  nock(configs.baseUrl)
    .get(`/${submittedDataEndpoint}/3623`)
    .query({ pageSize: 100, page: 1 })
    .reply(200, form3623Submissions);

  form3623Submissions.forEach((submission) => {
    const facilityId = submission._id;

    // get form2 submissions that relate to this form one submission
    nock(configs.baseUrl)
      .get(`/${submittedDataEndpoint}/3624`)
      .query({
        pageSize: 100,
        page: 1,
        query: `{"facility": ${facilityId}}`,
        sort: '{"date_of_visit": -1}'
      })
      .reply(
        200,
        form3624Submissions.filter((sub) => `${sub.facility}` === `${submission._id}`)
      );

    const submissionsWithValidPost = [304870, 304871, 304874, 304889, 304890, 304892];
    if (!submissionsWithValidPost.includes(facilityId)) {
      return;
    }

    nock(configs.baseUrl)
      .post(`/${editSumbissionEdnpoint}`, {
        id: '3623',
        submission: {
          ...submission,
          'marker-color': 'red',
          meta: {
            instanceID: 'uuid:0af4f147-d5fd-486a-bf76-d1bf850cc976',
            deprecatedID: submission['meta/instanceID']
          }
        }
      })
      .reply(201, {
        message: 'Successful submission.',
        formid: 'cameroon_iss_registration_v2_1'
        // ...
      });
  });

  await transform(configs).catch((err) => {
    throw err;
  });

  expect(loggerMock.mock.calls).toEqual(logCalls);

  expect(nock.pendingMocks()).toEqual([]);
});
