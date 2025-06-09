import { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class CopicakeApi implements ICredentialType {
	name = 'copicakeApi';
	displayName = 'Copicake API';
	documentationUrl = 'https://docs.copicake.com/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Copicake API key',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};
}
