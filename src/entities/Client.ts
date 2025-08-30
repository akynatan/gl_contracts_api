import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  OneToMany,
} from 'typeorm';
import LogClient from './LogClient';
import Contract from './Contract';

@Entity()
export default class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  document: string;

  @Column({ default: true })
  syncronized: boolean;

  @OneToMany(() => Contract, (contract) => contract.client)
  contracts: Contract[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => LogClient, (logClient) => logClient.client)
  logs: LogClient[];
}
