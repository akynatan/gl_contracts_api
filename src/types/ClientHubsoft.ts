type ResponsePacoteApiHubsoft = {
  id_pacote: number;
  codigo: string;
  descricao: string;
};

type ContractHubsoft = {
  id_cliente_servico_contrato: number;
  aceito: boolean;
  data_aceito: string;
  link: string;
  link_assinatura: string;
  numero_contrato: string;
  contrato: {
    id_contrato: number;
    descricao: string;
    ativo: boolean;
  };
};

type ResponseServiceApiHubsoft = {
  status_prefixo: string;
  nome: string;
  pacotes: ResponsePacoteApiHubsoft[];
  id_servico: number;
  contratos: ContractHubsoft[];
  contratos_sem_assinatura: ContractHubsoft[];
  contratos_pendentes: number;
};

export type ClientHubsoft = {
  id_cliente: string;
  nome_razaosocial: string;
  email_principal: string;
  cpf_cnpj: string;
  tipo_pessoa: 'pj' | 'pf';
  data_nascimento: string;
  telefone_primario: string;
  telefone_secundario: string;
  servicos: ResponseServiceApiHubsoft[];
};

export default ClientHubsoft;
