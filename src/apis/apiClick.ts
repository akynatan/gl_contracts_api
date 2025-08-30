import axios, { AxiosInstance } from 'axios';
import { CLICKSIGN_HOST, CLICKSIGN_TOKEN } from '@/config/envs';

interface CreateEnvelopeProps {
  numberContract: string;
}

interface CreateDocumentProps {
  numberContract: string;
  envelopeId: string;
  contentBase64: string;
  metadata: object;
}

interface CreateSignerProps {
  envelopeId: string;
  signer: {
    name: string;
    email: string;
    document?: string;
    birthday?: string;
    phone: string;
  };
}

interface CreateRequisitQualificationProps {
  documentId: string;
  envelopeId: string;
  signerId: string;
}

interface CreateRequisitAuthenticationProps {
  documentId: string;
  envelopeId: string;
  signerId: string;
}

class ClickApi {
  private static instance: ClickApi;
  private instanceAxios: AxiosInstance;

  constructor() {
    this.instanceAxios = axios.create({
      baseURL: CLICKSIGN_HOST + '/api/v3',
    });

    this.addRequestInterceptor();
    this.addResponseInterceptor();
  }

  private addResponseInterceptor() {
    const maxRetries = 5;

    this.instanceAxios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { config } = error;
        console.log(config.url);
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.request.data);

        return Promise.reject(error);
      },
    );
  }

  private addRequestInterceptor() {
    this.instanceAxios.interceptors.request.use((config) => {
      config.headers.Authorization = CLICKSIGN_TOKEN;
      config.headers.accept = 'application/vnd.api+json';
      config.headers['Content-type'] = 'application/vnd.api+json';
      return config;
    });
  }

  public static getInstance(): ClickApi {
    if (!ClickApi.instance) {
      ClickApi.instance = new ClickApi();
    }

    return ClickApi.instance;
  }

  public async createEnvelope({ numberContract }: CreateEnvelopeProps) {
    const payload = {
      data: {
        type: 'envelopes',
        attributes: {
          name: `Contrato ${numberContract}`,
          locale: 'pt-BR',
          auto_close: true,
          remind_interval: '3',
          block_after_refusal: false,
        },
      },
    };

    const response = await this.instanceAxios.post('/envelopes', payload);
    return response.data;
  }

  public async createDocument({
    numberContract,
    envelopeId,
    contentBase64,
    metadata,
  }: CreateDocumentProps) {
    const payload = {
      data: {
        type: 'documents',
        attributes: {
          filename: `Contrato ${numberContract}.pdf`,
          content_base64: `data:application/pdf;base64,${contentBase64}`,
          metadata: metadata,
        },
      },
    };

    const response = await this.instanceAxios.post(
      `/envelopes/${envelopeId}/documents`,
      payload,
    );

    return response.data;
  }

  public async createSigner({ envelopeId, signer }: CreateSignerProps) {
    const payload = {
      data: {
        type: 'signers',
        attributes: {
          name: signer.name,
          email: signer.email,
          documentation: signer.document,
          birthday: signer.birthday,
          phone_number: signer.phone,
          has_documentation: true,
          refusable: false,
          communicate_events: {
            signature_request: 'whatsapp',
            signature_reminder: 'email',
            document_signed: 'whatsapp',
          },
        },
      },
    };

    const response = await this.instanceAxios.post(
      `/envelopes/${envelopeId}/signers`,
      payload,
    );

    return response.data;
  }

  public async createRequisitQualification({
    documentId,
    envelopeId,
    signerId,
  }: CreateRequisitQualificationProps) {
    const payload = {
      data: {
        type: 'requirements',
        attributes: {
          action: 'agree',
          role: 'sign',
        },
        relationships: {
          document: {
            data: { type: 'documents', id: documentId },
          },
          signer: {
            data: { type: 'signers', id: signerId },
          },
        },
      },
    };

    const response = await this.instanceAxios.post(
      `/envelopes/${envelopeId}/requirements`,
      payload,
    );

    return response.data;
  }

  public async createRequisitAuthentication({
    documentId,
    envelopeId,
    signerId,
  }: CreateRequisitAuthenticationProps) {
    const payload = {
      data: {
        type: 'requirements',
        attributes: {
          action: 'provide_evidence',
          auth: 'email',
        },
        relationships: {
          document: {
            data: { type: 'documents', id: documentId },
          },
          signer: {
            data: { type: 'signers', id: signerId },
          },
        },
      },
    };

    const response = await this.instanceAxios.post(
      `/envelopes/${envelopeId}/requirements`,
      payload,
    );

    return response.data;
  }

  public async activateEnvelope(envelopeId: string) {
    const payload = {
      data: {
        type: 'envelopes',
        id: envelopeId,
        attributes: {
          status: 'running',
        },
      },
    };

    const response = await this.instanceAxios.patch(
      `/envelopes/${envelopeId}`,
      payload,
    );

    return response.data;
  }

  public async createNotification(envelopeId: string) {
    const payload = {
      data: {
        type: 'notifications',
        attributes: {},
      },
    };

    const response = await this.instanceAxios.post(
      `/envelopes/${envelopeId}/notifications`,
      payload,
    );

    console.log('responseNotification', response.data.data.id);
    return response.data;
  }

  async createNotificationToSigner(envelopeId: string, signerId: string) {
    const payload = {
      data: {
        type: 'notifications',
        attributes: {},
      },
    };

    const response = await this.instanceAxios.post(
      `/envelopes/${envelopeId}/signers/${signerId}/notifications`,
      payload,
    );

    return response.data;
  }

  public async getDocument(envelopeId: string, documentId: string) {
    const response = await this.instanceAxios.get(
      `envelopes/${envelopeId}/documents/${documentId}`,
    );

    return response.data;
  }
}

export const apiClick = ClickApi.getInstance();
