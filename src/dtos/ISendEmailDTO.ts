import IParseMailTemplateDTO from '@dtos/IParseMailTemplateDTO';

interface ImailContact {
  name: string;
  email: string;
}

export default interface ISendEmailDTO {
  to: ImailContact;
  from?: ImailContact;
  subject: string;
  templateData: IParseMailTemplateDTO;
}
