import * as yup from 'yup';

// TODO - dry out - duplicate in package core.
export enum PriorityLevel {
	VERY_HIGH = 'Very_High',
	HIGH = 'High',
	MEDIUM = 'Medium',
	LOW = 'Low'
}

export interface FormFields {
	baseUrl: string;
	formPair: {
		regFormId: string;
		visitFormId: string;
	};
	apiToken?: string;
	symbolConfig: {
		priorityLevel?: PriorityLevel;
		frequency?: number;
		symbologyOnOverflow: { overFlowDays?: number; color: string }[];
	}[];
	schedule: string;
}

export const defaultColorCodeConfig = { overFlowDays: undefined, color: '' };
export const defaultPriorityConfig = {
	priorityLevel: undefined,
	frequency: undefined,
	symbologyOnOverflow: [defaultColorCodeConfig]
};

export const initialValues: FormFields = {
	baseUrl: '',
	formPair: {
		regFormId: '',
		visitFormId: ''
	},
	apiToken: '<Replace with api token>',
	symbolConfig: [defaultPriorityConfig],
	schedule: ''
};

export const configValidationSchema = yup.object().shape({
	baseUrl: yup.string().required('Base Url is required'),
	formPair: yup.object().shape({
		regFormId: yup.string().required('Geo point registration form is required'),
		visitFormId: yup.string().required('Visit form field is required')
	}),
	symbolConfig: yup
		.array()
		.of(
			yup.object().shape({
				priorityLevel: yup.string().oneOf(Object.values(PriorityLevel)),
				frequency: yup.number().required('Frequencey is required'),
				symbologyOnOverflow: yup.array().of(
					yup.object().shape({
						overFlowDays: yup.number().required('Over flow days is required'),
						color: yup.string().required('Color code is required.')
					})
				)
			})
		)
		.ensure()
		.min(1),
	schedule: yup.string()
	// .test('schedule', 'Schedule is not valid cron syntax', function (value?: string) {
	//   return !!(value && nodeCron.validate(value));
	// })
});

export const generateFilledData = (formFields: FormFields) => {
	const { baseUrl, formPair, apiToken, symbolConfig, schedule } = formFields;
	return { baseUrl, formPair, apiToken, symbolConfig, schedule };
};
