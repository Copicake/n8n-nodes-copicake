import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { setTimeout } from 'timers/promises';

export class Copicake implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Copicake',
		name: 'copicake',
		icon: 'file:copicake.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Generate and retrieve images using Copicake API',
		defaults: {
			name: 'Copicake',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'copicakeApi',
				required: true,
			},
		],

		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Image',
						value: 'image',
					},
				],
				default: 'image',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['image'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new image from a template',
						action: 'Create an image',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get an existing image by rendering ID',
						action: 'Get an image',
					},
				],
				default: 'create',
			},

			// Create Image Operation
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['image'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The ID of the template to use for image generation',
			},
			{
				displayName: 'Changes',
				name: 'changes',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['image'],
						operation: ['create'],
					},
				},
				default: {},
				description: 'Changes to apply to the template',
				options: [
					{
						name: 'change',
						displayName: 'Change',
						values: [
							{
								displayName: 'Change Type',
								name: 'changeType',
								type: 'options',
								options: [
									{
										name: 'Text',
										value: 'text',
									},
									{
										name: 'Image',
										value: 'image',
									},
									{
										name: 'QR Code',
										value: 'qrcode',
									},
									{
										name: 'Shape (Rect/Triangle/Circle)',
										value: 'shape',
									},
								],
								default: 'text',
								description: 'The type of change to apply',
							},
							{
								displayName: 'Element Name',
								name: 'name',
								type: 'string',
								required: true,
								default: '',
								description: 'The name of the element to modify',
							},
							{
								displayName: 'Fill Color',
								name: 'fill',
								type: 'string',
								default: '',
								description: 'Fill color in hex format (e.g.,	#ff0000)',
							},
							{
								displayName: 'Image URL',
								name: 'src',
								type: 'string',
								default: '',
								description: 'URL of the image to use',
							},
							{
								displayName: 'QR Code Content',
								name: 'content',
								type: 'string',
								default: '',
								description: 'Content to encode in the QR code',
							},
							{
								displayName: 'Stroke Color',
								name: 'stroke',
								type: 'string',
								default: '',
								description: 'Stroke color in hex format (e.g.,	#ff0000)',
							},
							{
								displayName: 'Text',
								name: 'text',
								type: 'string',
								default: '',
								description: 'The text content to set',
							},
							{
								displayName: 'Text Background Color',
								name: 'textBackgroundColor',
								type: 'color',
								default: '',
								description: 'Text background color in hex format (e.g.,	#ff0000)',
							},
						],
					},
				],
			},
			{
				displayName: 'Additional Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				displayOptions: {
					show: {
						resource: ['image'],
						operation: ['create'],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Format',
						name: 'format',
						type: 'options',
						options: [
							{
								name: 'PNG',
								value: 'png',
							},
							{
								name: 'JPG',
								value: 'jpg',
							},
						],
						default: 'png',
						description: 'Output format for the generated image',
					},
					{
						displayName: 'Max Wait Time (Seconds)',
						name: 'maxWaitTime',
						type: 'number',
						displayOptions: {
							show: {
								waitForCompletion: [true],
							},
						},
						default: 60,
						description: 'Maximum time to wait for rendering completion (in seconds)',
					},
					{
						displayName: 'Polling Interval (Seconds)',
						name: 'pollingInterval',
						type: 'number',
						displayOptions: {
							show: {
								waitForCompletion: [true],
							},
						},
						default: 2,
						description: 'How often to check the rendering status (in seconds)',
					},
					{
						displayName: 'Wait for Completion',
						name: 'waitForCompletion',
						type: 'boolean',
						default: true,
						description:
							'Whether to wait for the image rendering to complete before returning the result',
					},
					{
						displayName: 'Webhook URL',
						name: 'webhook_url',
						type: 'string',
						default: '',
						description: 'URL to receive a webhook when the image is ready',
					},
				],
			},

			// Get Image Operation
			{
				displayName: 'Rendering ID',
				name: 'renderingId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['image'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The rendering ID of the image to retrieve',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'image') {
					if (operation === 'create') {
						// Create Image Operation
						const templateId = this.getNodeParameter('templateId', i) as string;
						const changesData = this.getNodeParameter('changes', i) as any;
						const options = this.getNodeParameter('options', i) as any;

						// Process changes
						const changes: any[] = [];
						if (changesData.change && Array.isArray(changesData.change)) {
							for (const change of changesData.change) {
								const changeObj: any = {
									name: change.name,
								};

								// Add properties based on change type
								if (change.changeType === 'text') {
									if (change.text) changeObj.text = change.text;
									if (change.fill) changeObj.fill = change.fill;
									if (change.stroke) changeObj.stroke = change.stroke;
									if (change.textBackgroundColor)
										changeObj.textBackgroundColor = change.textBackgroundColor;
								} else if (change.changeType === 'image') {
									if (change.src) changeObj.src = change.src;
									if (change.stroke) changeObj.stroke = change.stroke;
								} else if (change.changeType === 'qrcode') {
									if (change.content) changeObj.content = change.content;
									if (change.fill) changeObj.fill = change.fill;
									if (change.stroke) changeObj.stroke = change.stroke;
								} else if (change.changeType === 'shape') {
									if (change.fill) changeObj.fill = change.fill;
									if (change.stroke) changeObj.stroke = change.stroke;
								}

								changes.push(changeObj);
							}
						}

						const requestBody: any = {
							template_id: templateId,
							changes,
						};

						// Add options if provided
						if (options.format || options.webhook_url) {
							requestBody.options = {};
							if (options.format) requestBody.options.format = options.format;
							if (options.webhook_url) requestBody.options.webhook_url = options.webhook_url;
						}

						const responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'copicakeApi',
							{
								method: 'POST',
								url: 'https://api.copicake.com/v1/image/create',
								body: requestBody,
								json: true,
								headers: {
									Accept: 'application/json',
									'Content-Type': 'application/json',
								},
							},
						);

						// Check if we should wait for completion
						const waitForCompletion = options.waitForCompletion !== false;

						if (waitForCompletion && responseData.data && responseData.data.id) {
							const pollingInterval = (options.pollingInterval || 2) * 1000; // Convert to milliseconds
							const maxWaitTime = (options.maxWaitTime || 60) * 1000; // Convert to milliseconds
							const startTime = Date.now();
							const renderingId = responseData.data.id;

							// Poll for completion
							let finalResponse = responseData;
							while (Date.now() - startTime < maxWaitTime) {
								if (
									finalResponse.data.status === 'success' ||
									finalResponse.data.status === 'failed'
								) {
									break;
								}

								// Wait before next poll
								await setTimeout(pollingInterval);

								// Get updated status
								try {
									finalResponse = await this.helpers.requestWithAuthentication.call(
										this,
										'copicakeApi',
										{
											method: 'GET',
											url: `https://api.copicake.com/v1/image/get?id=${encodeURIComponent(renderingId)}`,
											json: true,
											headers: {
												Accept: 'application/json',
											},
										},
									);
								} catch (pollError) {
									// If polling fails, return the original response
									break;
								}
							}

							returnData.push({
								json: finalResponse,
								pairedItem: { item: i },
							});
						} else {
							returnData.push({
								json: responseData,
								pairedItem: { item: i },
							});
						}
					} else if (operation === 'get') {
						// Get Image Operation
						const renderingId = this.getNodeParameter('renderingId', i) as string;

						const responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'copicakeApi',
							{
								method: 'GET',
								url: `https://api.copicake.com/v1/image/get?id=${encodeURIComponent(renderingId)}`,
								json: true,
								headers: {
									Accept: 'application/json',
								},
							},
						);

						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
