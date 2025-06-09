![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-copicake

This is an n8n community node that lets you use [Copicake](https://copicake.com/) in your n8n workflows.

Copicake is a data-driven image generation service that allows you to generate social media materials with just one click using templates and API calls.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**.
2. Select **Install**.
3. Enter `n8n-nodes-copicake` in **Enter npm package name**.
4. Agree to the [risks](https://docs.n8n.io/integrations/community-nodes/risks/) of using community nodes: select **I understand the risks of installing unverified code from a public source**.
5. Select **Install**.

After installing the node, you can use it like any other node in your workflows.

### Manual Installation

To get started install the package in your n8n root directory:

```bash
npm install n8n-nodes-copicake
```

For Docker-based deployments, add the following line before the font installation command in your [n8n Dockerfile](https://github.com/n8n-io/n8n/blob/master/docker/images/n8n/Dockerfile):

```dockerfile
RUN cd /usr/local/lib/node_modules/n8n && npm install n8n-nodes-copicake
```

## Credentials

You need to set up credentials to use this node:

1. In n8n, go to **Credentials** and create new **Copicake API** credentials.
2. Enter your Copicake API key.
   - You can get your API key from the [Copicake dashboard](https://copicake.com/).

## Operations

This node supports the following operations:

### Image

#### Create
Create a new image from a template with custom changes.

**Parameters:**
- **Template ID** (required): The ID of the template to use for image generation
- **Changes**: Array of changes to apply to the template elements
  - **Element Name**: The name of the element to modify
  - **Change Type**: Type of change (Text, Image, QR Code, Shape)
  - **Properties**: Specific properties based on change type:
    - **Text**: text, fill color, stroke color, text background color
    - **Image**: image URL, stroke color
    - **QR Code**: content, fill color, stroke color
    - **Shape**: fill color, stroke color
- **Additional Options**:
  - **Format**: Output format (PNG or JPG)
  - **Max Wait Time (Seconds)**: Maximum time to wait for rendering completion (default: 60)
  - **Polling Interval (Seconds)**: How often to check rendering status (default: 2)
  - **Wait for Completion**: Whether to poll until rendering is complete (default: true)
  - **Webhook URL**: URL to receive webhook when image is ready

**Asynchronous Processing:**
By default, the node will automatically wait for the image rendering to complete before returning the final result. This includes polling the Copicake API every 2 seconds until the status becomes either `success` or `failed`, with a maximum wait time of 60 seconds. You can disable this behavior by setting "Wait for Completion" to false, which will return the initial response with `processing` status immediately.

**Example:**
```json
{
  "template_id": "jfwrFJdR3z1eF8BcEhSnAFyhxgOq",
  "changes": [
    {
      "name": "text-9so09m",
      "text": "hello world",
      "fill": "#ff0000"
    },
    {
      "name": "image-yeavh7",
      "src": "https://your_website.com/test.png"
    }
  ],
  "options": {
    "format": "png",
    "webhook_url": "https://your_website.com/webhook_url"
  }
}
```

#### Get
Retrieve an existing image by its rendering ID.

**Parameters:**
- **Rendering ID** (required): The rendering ID of the image to retrieve

**Example:**
```json
{
  "rendering_id": "ki9ImK39lPRwb1oOpKbROkNWumFz"
}
```

## Response Format

### Create Image Response
```json
{
  "rendering_id": "xc17NtfyMaxPDCtz0ZjEZ4guBmiC",
  "status": "processing",
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Get Image Response
```json
{
  "rendering_id": "xc17NtfyMaxPDCtz0ZjEZ4guBmiC",
  "status": "success",
  "permanent_url": "https://copicake.s3.ap-northeast-1.amazonaws.com/renderings/xc17NtfyMaxPDCtz0ZjEZ4guBmiC.png",
  "created_at": "2023-01-01T00:00:00Z",
  "completed_at": "2023-01-01T00:00:05Z"
}
```

## Example Workflows

### Basic Image Generation
1. **Manual Trigger** → **Copicake (Create Image)** → **HTTP Request** (to download image)

### Automated Social Media Posts
1. **Schedule Trigger** → **Copicake (Create Image)** → **Twitter** (post with generated image)

### Dynamic Content Generation
1. **Webhook** → **Set** (prepare data) → **Copicake (Create Image)** → **Email** (send with generated image)

## Resources

- [Copicake API Documentation](https://docs.copicake.com/)
- [Copicake Website](https://copicake.com/)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## Version History

### 0.1.0
- Initial release
- Support for Create Image and Get Image operations
- Full support for all Copicake API features including text, image, QR code, and shape modifications

## License

[MIT](https://github.com/copicake/n8n-nodes-copicake/blob/main/LICENSE.md)
