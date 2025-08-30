import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToOne,
} from 'typeorm';
import Client from './Client';

@Entity()
export default class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  active: boolean;

  @Column()
  numberContractHubsoft: string;

  @Column()
  idClientServiceContract: number;

  @Column({ default: 'pending_signature' })
  status: string;

  @Column({ nullable: true })
  envelopeId?: string;

  @Column({ nullable: true })
  documentId?: string;

  @Column({ nullable: true })
  signerId?: string;

  @Column({ nullable: true })
  requisitId?: string;

  @Column({ nullable: true })
  requisitAuthenticationId?: string;

  @Column({ nullable: true })
  notificationId?: string;

  @Column({ nullable: true })
  documentUrlSigned?: string;

  @Column({ nullable: true })
  documentSignedAt?: Date;

  @ManyToOne(() => Client, { nullable: false })
  client: Client;

  @Column()
  clientId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
