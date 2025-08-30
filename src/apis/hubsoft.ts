import axios, { AxiosInstance } from 'axios';
import { stringify } from 'node:querystring';
import {
  HUBSOFT_HOST,
  HUBSOFT_GRANT_TYPE,
  HUBSOFT_CLIENT_ID,
  HUBSOFT_CLIENT_SECRET,
  HUBSOFT_USERNAME,
  HUBSOFT_PASSWORD,
} from '@/config/envs';

class HubsoftApi {
  private static instance: HubsoftApi;
  private instanceAxios: AxiosInstance;

  constructor() {
    this.instanceAxios = axios.create({
      baseURL: HUBSOFT_HOST + '/api/v1/',
    });

    this.addResponseInterceptor();
    this.authenticate();
  }

  public async authenticate() {
    console.log('HUBSOFT >> authenticate');

    const paramsFetch = {
      grant_type: HUBSOFT_GRANT_TYPE,
      client_id: HUBSOFT_CLIENT_ID,
      client_secret: HUBSOFT_CLIENT_SECRET,
      username: HUBSOFT_USERNAME,
      password: HUBSOFT_PASSWORD,
      host: HUBSOFT_HOST,
    };

    const response = await this.instanceAxios.post(
      `${HUBSOFT_HOST}/oauth/token`,
      paramsFetch,
    );

    const token = response.data?.access_token;

    this.instanceAxios.defaults.headers.Authorization = `Bearer ${token}`;

    console.log('HUBSOFT >> authenticate success');
  }

  private addResponseInterceptor() {
    const maxRetries = 5;

    this.instanceAxios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { config } = error;
        console.log(error);

        if (config && !config._retry) {
          config._retry = true;
          config._retriesCount = config._retriesCount || 0;

          if (config._retriesCount < maxRetries) {
            config._retriesCount += 1;
            console.log(
              `Tentativa ${config._retriesCount}/${maxRetries} falhou, tentando novamente...`,
            );

            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              await this.authenticate();
              console.log('Token expirado, tentando reautenticar...');
            }

            return this.instanceAxios(config);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  public static getInstance(): HubsoftApi {
    if (!HubsoftApi.instance) {
      HubsoftApi.instance = new HubsoftApi();
    }

    return HubsoftApi.instance;
  }

  public async getClient(document: string) {
    const queryParams = stringify({
      busca: 'cpf_cnpj',
      termo_busca: document,
      cancelado: 'sim',
      incluir_contrato: 'sim',
    });

    const response = await this.instanceAxios.get(
      `integracao/cliente?${queryParams}`,
    );

    return response.data;
  }

  public async markContractAsSigned(
    idClienteServicoContract: number,
    signedAt: Date,
  ) {
    const response = await this.instanceAxios.put(
      `integracao/cliente/contrato/aceitar_contrato`,
      {
        ids_cliente_servico_contrato: [idClienteServicoContract],
        data_aceito: signedAt.toISOString().split('T')[0],
        hora_aceito: signedAt.toISOString().split('T')[1],
        observacao: 'Assinou Contrato enviado pela ClickSign',
      },
    );

    return response.data;
  }

  public async addContractAttachment(
    idClientServiceContract: number,
    file: Blob,
  ) {
    const formData = new FormData();

    formData.append('files[0]', file, 'contracto_assinado.pdf');

    const response = await this.instanceAxios.post(
      `integracao/cliente/contrato/adicionar_anexo_contrato/${idClientServiceContract}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  }
}

export const apiHubsoft = HubsoftApi.getInstance();
