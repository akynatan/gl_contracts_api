import { ContractRepository } from '@repositories/ContractsRepository';
import { apiClick } from '@/apis/apiClick';
import Contract from '@entities/Contract';
import { apiHubsoft } from '@/apis/hubsoft';

export default class ContractSignatureChecker {
  public async execute() {
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('Starting contract signature checker');

    const contracts = await ContractRepository.findContractsWithoutSignature();

    for (const contract of contracts) {
      console.log(`Processing contract ${contract.id}`);
      try {
        await this.process(contract);
      } catch (error) {
        console.error(error);
        console.error(`Error processing contract ${contract.id}`);
      }
    }

    console.log('--------------------------------');
    console.log('Finalizing contract signature checker');
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');
  }

  public async process(contract: Contract) {
    const envelopeId = contract.envelopeId;
    const documentId = contract.documentId;

    const envelope = await apiClick.getDocument(envelopeId, documentId);

    const fileSignedUrl = envelope.data.links.files.signed;

    if (fileSignedUrl) {
      const signedAt = new Date();

      contract.status = 'signed';
      contract.documentUrlSigned = fileSignedUrl;
      contract.documentSignedAt = signedAt;
      await ContractRepository.save(contract);

      await apiHubsoft.markContractAsSigned(
        contract.idClientServiceContract,
        signedAt,
      );

      const fileToAdd = await fetch(fileSignedUrl);
      const fileBuffer = await fileToAdd.blob();

      await apiHubsoft.addContractAttachment(
        contract.idClientServiceContract,
        fileBuffer,
      );
    }
  }
}
