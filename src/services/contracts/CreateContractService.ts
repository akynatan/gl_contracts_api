import AppError from '@/errors/AppError';
import { ClientRepository } from '@repositories/ClientsRepository';
import { ContractRepository } from '@repositories/ContractsRepository';
import GetClientInHubsoftService from '@services/clients/GetClientInHubsoftService';
import { apiClick } from '@/apis/apiClick';
import axios from 'axios';
import ClientHubsoft from '@/types/ClientHubsoft';

export default class CreateContractService {
  public async execute(
    numberContract: string,
    clientId: string,
    userId: string,
  ) {
    return this.process(numberContract, clientId, userId);
  }

  public async process(
    numberContract: string,
    clientId: string,
    userId: string,
  ) {
    const client = await ClientRepository.findByID(clientId);

    if (!client) {
      throw new AppError('Cliente não encontrado');
    }

    const documentReplaced = client.document.replace(/[^\w\s]/g, '');

    const clientHubsoft = await new GetClientInHubsoftService().execute(
      documentReplaced,
    );

    if (!clientHubsoft) {
      throw new AppError('Cliente não encontrado no hubsoft');
    }

    const constractToSign = clientHubsoft.servicos
      .find((service) =>
        service.contratos.find(
          (contract) => contract.numero_contrato === numberContract,
        ),
      )
      ?.contratos.find(
        (contract) => contract.numero_contrato === numberContract,
      );

    if (!constractToSign) {
      throw new AppError('Contrato não encontrado');
    }

    if (constractToSign.aceito) {
      throw new AppError('Contrato já assinado');
    }

    const clicksignResponse = await this.sendContractToClicksign(
      numberContract,
      constractToSign.link,
      clientHubsoft,
    );

    const contract = await ContractRepository.create({
      clientId: client.id,
      numberContractHubsoft: numberContract,
      envelopeId: clicksignResponse.envelopeId,
      documentId: clicksignResponse.documentId,
      signerId: clicksignResponse.signerId,
      requisitId: clicksignResponse.requisitId,
      requisitAuthenticationId: clicksignResponse.requisitAuthenticationId,
      notificationId: clicksignResponse.notificationId,
      idClientServiceContract: constractToSign.id_cliente_servico_contrato,
    });

    return contract;
  }

  async getBase64Contract(contractLink: string) {
    const response = await axios.get(contractLink, {
      responseType: 'arraybuffer',
    });

    const stringBuffer = Buffer.from(response.data, 'binary').toString(
      'base64',
    );

    return stringBuffer;
  }

  async sendContractToClicksign(
    numberContract: string,
    contractLink: string,
    clientHubsoft: ClientHubsoft,
  ) {
    const envelope = await apiClick.createEnvelope({
      numberContract: numberContract,
    });
    const envelopeId = envelope.data.id;

    const contentBase64 = await this.getBase64Contract(contractLink);
    const document = await apiClick.createDocument({
      numberContract: numberContract,
      envelopeId: envelopeId,
      contentBase64: contentBase64,
      metadata: {
        numero_contrato: numberContract,
      },
    });

    const documentId = document.data.id;

    const cpf = clientHubsoft.cpf_cnpj;
    const cpfFormatted = cpf.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      '$1.$2.$3-$4',
    );

    const signerToCreate =
      clientHubsoft.tipo_pessoa === 'pj'
        ? {
            email: clientHubsoft.email_principal,
            phone: clientHubsoft.telefone_primario,
            name: clientHubsoft.nome_razaosocial,
          }
        : {
            email: clientHubsoft.email_principal,
            phone: clientHubsoft.telefone_primario,
            name: clientHubsoft.nome_razaosocial,
            document: cpfFormatted,
            birthday: clientHubsoft.data_nascimento
              ? clientHubsoft.data_nascimento.split(' ')[0]
              : null,
          };

    const signer = await apiClick.createSigner({
      envelopeId: envelopeId,
      signer: signerToCreate,
    });

    const signerId = signer.data.id;

    const requisit = await apiClick.createRequisitQualification({
      documentId: documentId,
      envelopeId: envelopeId,
      signerId: signerId,
    });

    const requisitId = requisit.data.id;

    const requisitAuthentication = await apiClick.createRequisitAuthentication({
      documentId: documentId,
      envelopeId: envelopeId,
      signerId: signerId,
    });

    const requisitAuthenticationId = requisitAuthentication.data.id;

    await apiClick.activateEnvelope(envelopeId);

    const notification = await apiClick.createNotification(envelopeId);

    const notificationId = notification.data.id;

    return {
      envelopeId,
      documentId,
      signerId,
      requisitId,
      requisitAuthenticationId,
      notificationId,
    };
  }
}
